-- Phase 4 Migration: Checkout, Order Placement, and Payment Verification
-- File: supabase/migrations/20261115000000_checkout_orders.sql

-- 1. RLS Policies for Customer Order Placement and Payments
DROP POLICY IF EXISTS "Users create own pending orders" ON public.orders;
CREATE POLICY "Users create own pending orders" ON public.orders
  FOR INSERT WITH CHECK (
    auth.uid() = user_id 
    AND status IN ('pending_payment', 'paid')
  );

DROP POLICY IF EXISTS "Users update own pending orders" ON public.orders;
CREATE POLICY "Users update own pending orders" ON public.orders
  FOR UPDATE USING (
    auth.uid() = user_id 
    AND status = 'pending_payment'
  );

DROP POLICY IF EXISTS "Users insert own order items" ON public.order_items;
CREATE POLICY "Users insert own order items" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert own payments" ON public.payments;
CREATE POLICY "Users insert own payments" ON public.payments
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = payments.order_id
        AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users insert own order events" ON public.order_events;
CREATE POLICY "Users insert own order events" ON public.order_events
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_events.order_id
        AND orders.user_id = auth.uid()
    )
  );

-- 2. Atomic Order Creation Function (SECURITY DEFINER)
-- Validates cart items, computes subtotal directly from product_variants table (prevents price tampering),
-- creates order and order_items atomically.
CREATE OR REPLACE FUNCTION public.create_order_secure(
  p_shipping_address JSONB,
  p_courier TEXT DEFAULT 'Delhivery Standard',
  p_shipping_paise BIGINT DEFAULT 0,
  p_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_cart_count INT;
  v_subtotal BIGINT := 0;
  v_total BIGINT := 0;
  v_order_id UUID;
  v_order_no TEXT;
  v_rec RECORD;
  v_order_record JSONB;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required to create order';
  END IF;

  -- Verify cart has items
  SELECT COUNT(*) INTO v_cart_count
  FROM public.cart_items
  WHERE user_id = v_user_id;

  IF v_cart_count = 0 THEN
    RAISE EXCEPTION 'Cannot place order with empty cart';
  END IF;

  -- Validate stock and calculate verified subtotal from database prices
  FOR v_rec IN (
    SELECT 
      c.variant_id,
      c.qty,
      v.price_paise,
      v.stock_qty,
      v.label AS variant_label,
      v.is_active,
      p.name AS product_name
    FROM public.cart_items c
    JOIN public.product_variants v ON c.variant_id = v.id
    JOIN public.products p ON v.product_id = p.id
    WHERE c.user_id = v_user_id
  ) LOOP
    IF NOT v_rec.is_active THEN
      RAISE EXCEPTION 'Product % (%) is currently inactive', v_rec.product_name, v_rec.variant_label;
    END IF;

    IF v_rec.stock_qty < v_rec.qty THEN
      RAISE EXCEPTION 'Insufficient stock for % (%). Available: %, Requested: %',
        v_rec.product_name, v_rec.variant_label, v_rec.stock_qty, v_rec.qty;
    END IF;

    v_subtotal := v_subtotal + (v_rec.price_paise * v_rec.qty);
  END LOOP;

  -- Calculate shipping: Free if subtotal >= 49900 paise (₹499) unless express requested
  IF v_subtotal >= 49900 AND p_courier NOT LIKE '%Express%' THEN
    p_shipping_paise := 0;
  END IF;

  v_total := v_subtotal + p_shipping_paise;

  -- Generate human-friendly sequential order number (e.g. ORV-2026-XXXX)
  v_order_no := 'ORV-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(FLOOR(RANDOM() * 9000 + 1000)::text, 4, '0');

  -- Insert order
  INSERT INTO public.orders (
    order_no,
    user_id,
    status,
    payment_status,
    subtotal_paise,
    shipping_paise,
    discount_paise,
    total_paise,
    address_snapshot,
    courier,
    notes
  ) VALUES (
    v_order_no,
    v_user_id,
    'pending_payment',
    'created',
    v_subtotal,
    p_shipping_paise,
    0,
    v_total,
    p_shipping_address,
    p_courier,
    p_notes
  )
  RETURNING id INTO v_order_id;

  -- Insert order items snapshot
  INSERT INTO public.order_items (
    order_id,
    variant_id,
    product_name,
    variant_label,
    unit_price_paise,
    qty
  )
  SELECT 
    v_order_id,
    c.variant_id,
    p.name,
    v.label,
    v.price_paise,
    c.qty
  FROM public.cart_items c
  JOIN public.product_variants v ON c.variant_id = v.id
  JOIN public.products p ON v.product_id = p.id
  WHERE c.user_id = v_user_id;

  -- Insert order event
  INSERT INTO public.order_events (order_id, status, note, actor_id)
  VALUES (v_order_id, 'pending_payment', 'Order created awaiting payment', v_user_id);

  -- Return complete created order
  SELECT jsonb_build_object(
    'id', o.id,
    'order_no', o.order_no,
    'status', o.status,
    'payment_status', o.payment_status,
    'subtotal_paise', o.subtotal_paise,
    'shipping_paise', o.shipping_paise,
    'discount_paise', o.discount_paise,
    'total_paise', o.total_paise,
    'courier', o.courier,
    'address_snapshot', o.address_snapshot
  )
  INTO v_order_record
  FROM public.orders o
  WHERE o.id = v_order_id;

  RETURN v_order_record;
END;
$$;

-- 3. Atomic Order Payment Confirmation Function (SECURITY DEFINER)
-- Decrements variant stock atomically, records payment & order event, marks order as paid, and clears user cart.
CREATE OR REPLACE FUNCTION public.confirm_order_payment(
  p_order_id UUID,
  p_razorpay_payment_id TEXT,
  p_razorpay_order_id TEXT DEFAULT NULL,
  p_razorpay_signature TEXT DEFAULT NULL,
  p_method TEXT DEFAULT 'razorpay'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_order RECORD;
  v_item RECORD;
BEGIN
  v_user_id := auth.uid();

  -- Get and lock order row
  SELECT * INTO v_order
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Ensure caller is order owner or admin
  IF v_order.user_id != v_user_id AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Unauthorized to confirm this order';
  END IF;

  -- Prevent duplicate confirmation
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'message', 'Order already paid', 'order_id', p_order_id);
  END IF;

  -- Decrement variant stock atomically for each ordered item
  FOR v_item IN (
    SELECT variant_id, qty
    FROM public.order_items
    WHERE order_id = p_order_id
  ) LOOP
    IF v_item.variant_id IS NOT NULL THEN
      UPDATE public.product_variants
      SET stock_qty = GREATEST(0, stock_qty - v_item.qty)
      WHERE id = v_item.variant_id;
    END IF;
  END LOOP;

  -- Update order status
  UPDATE public.orders
  SET 
    status = 'paid',
    payment_status = 'paid',
    razorpay_order_id = COALESCE(p_razorpay_order_id, razorpay_order_id),
    updated_at = NOW()
  WHERE id = p_order_id;

  -- Record payment
  INSERT INTO public.payments (
    order_id,
    razorpay_payment_id,
    amount_paise,
    status,
    method,
    raw_payload
  ) VALUES (
    p_order_id,
    p_razorpay_payment_id,
    v_order.total_paise,
    'captured',
    p_method,
    jsonb_build_object(
      'razorpay_payment_id', p_razorpay_payment_id,
      'razorpay_order_id', p_razorpay_order_id,
      'razorpay_signature', p_razorpay_signature,
      'confirmed_at', NOW()
    )
  );

  -- Record order event
  INSERT INTO public.order_events (order_id, status, note, actor_id)
  VALUES (p_order_id, 'paid', 'Payment confirmed via Razorpay (' || COALESCE(p_razorpay_payment_id, 'manual') || ')', v_user_id);

  -- Empty user cart
  DELETE FROM public.cart_items
  WHERE user_id = v_order.user_id;

  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_no', v_order.order_no,
    'status', 'paid',
    'total_paise', v_order.total_paise
  );
END;
$$;

-- Grant execution permissions on RPC functions to authenticated users
GRANT EXECUTE ON FUNCTION public.create_order_secure(JSONB, TEXT, BIGINT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_order_payment(UUID, TEXT, TEXT, TEXT, TEXT) TO authenticated;
