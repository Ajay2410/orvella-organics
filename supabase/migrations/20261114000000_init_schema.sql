-- Orvella Organics: Initial Schema Migration
-- Covers 17 tables, functions, triggers, and RLS policies

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- Table 1: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 2: addresses
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Home',
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 3: categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 4: products
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  short_name TEXT,
  tagline TEXT,
  description TEXT,
  hero_image TEXT,
  image_urls TEXT[] NOT NULL DEFAULT '{}',
  hsn_code TEXT,
  gst_rate NUMERIC(5,2) NOT NULL DEFAULT 5.00,
  rating_avg NUMERIC(3,2) NOT NULL DEFAULT 0.00,
  rating_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  benefits JSONB NOT NULL DEFAULT '[]'::jsonb,
  ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
  nutrition JSONB NOT NULL DEFAULT '[]'::jsonb,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 5: product_variants
CREATE TABLE IF NOT EXISTS public.product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label TEXT NOT NULL, -- e.g. "100 g", "200 g", "400 g"
  sku TEXT UNIQUE,
  price_paise BIGINT NOT NULL,
  mrp_paise BIGINT NOT NULL,
  stock_qty INT NOT NULL DEFAULT 0,
  weight_grams INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 6: cart_items
CREATE TABLE IF NOT EXISTS public.cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  variant_id UUID NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  qty INT NOT NULL CHECK (qty > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, variant_id)
);

-- Table 7: orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'packed', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status TEXT NOT NULL DEFAULT 'created' CHECK (payment_status IN ('created', 'paid', 'failed', 'refunded')),
  subtotal_paise BIGINT NOT NULL,
  shipping_paise BIGINT NOT NULL DEFAULT 0,
  discount_paise BIGINT NOT NULL DEFAULT 0,
  total_paise BIGINT NOT NULL,
  address_snapshot JSONB NOT NULL,
  razorpay_order_id TEXT,
  courier TEXT,
  tracking_number TEXT,
  tracking_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 8: order_items
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  variant_id UUID REFERENCES public.product_variants(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  unit_price_paise BIGINT NOT NULL,
  qty INT NOT NULL CHECK (qty > 0)
);

-- Table 9: payments
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  razorpay_payment_id TEXT UNIQUE,
  amount_paise BIGINT NOT NULL,
  status TEXT NOT NULL,
  method TEXT,
  raw_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 10: order_events
CREATE TABLE IF NOT EXISTS public.order_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 11: coupons
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percent', 'flat')),
  value NUMERIC(10,2) NOT NULL,
  min_order_paise BIGINT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 12: site_settings
CREATE TABLE IF NOT EXISTS public.site_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 13: admin_audit_log
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 14: shipping_rates
CREATE TABLE IF NOT EXISTS public.shipping_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_name TEXT NOT NULL,
  states TEXT[] NOT NULL DEFAULT '{}',
  min_weight_g INT NOT NULL DEFAULT 0,
  max_weight_g INT NOT NULL,
  charge_paise BIGINT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table 15: invoice_counters
CREATE TABLE IF NOT EXISTS public.invoice_counters (
  financial_year TEXT PRIMARY KEY,
  last_number INT NOT NULL DEFAULT 0
);

-- Table 16: invoices
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL UNIQUE REFERENCES public.orders(id) ON DELETE CASCADE,
  invoice_no TEXT NOT NULL UNIQUE,
  financial_year TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  taxable_paise BIGINT NOT NULL,
  cgst_paise BIGINT NOT NULL DEFAULT 0,
  sgst_paise BIGINT NOT NULL DEFAULT 0,
  igst_paise BIGINT NOT NULL DEFAULT 0,
  total_paise BIGINT NOT NULL,
  pdf_path TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb
);

-- Table 17: reviews
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE SET NULL,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  image_paths TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_reply TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ==============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ==============================================================================

-- Function: Check if current user is an admin (profiles table already exists above)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: Atomic Invoice Number Generation
CREATE OR REPLACE FUNCTION public.get_next_invoice_no(p_financial_year TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_num INT;
  v_formatted TEXT;
BEGIN
  INSERT INTO public.invoice_counters (financial_year, last_number)
  VALUES (p_financial_year, 1)
  ON CONFLICT (financial_year)
  DO UPDATE SET last_number = public.invoice_counters.last_number + 1
  RETURNING last_number INTO v_next_num;

  v_formatted := 'ORV/' || p_financial_year || '/' || LPAD(v_next_num::text, 4, '0');
  RETURN v_formatted;
END;
$$;

-- Trigger Function: Automatically create profile upon user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, phone, avatar_url, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.email,
    NEW.phone,
    NEW.raw_user_meta_data->>'avatar_url',
    'customer'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger Function: Maintain product rating averages when reviews change
CREATE OR REPLACE FUNCTION public.update_product_ratings()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_prod_id UUID;
  v_avg NUMERIC(3,2);
  v_count INT;
BEGIN
  v_prod_id := COALESCE(NEW.product_id, OLD.product_id);

  SELECT COALESCE(ROUND(AVG(rating)::numeric, 2), 0.00), COUNT(*)
  INTO v_avg, v_count
  FROM public.reviews
  WHERE product_id = v_prod_id AND status = 'approved';

  UPDATE public.products
  SET rating_avg = v_avg, rating_count = v_count, updated_at = NOW()
  WHERE id = v_prod_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;

DROP TRIGGER IF EXISTS trg_update_product_ratings ON public.reviews;
CREATE TRIGGER trg_update_product_ratings
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_product_ratings();

-- Trigger Function: Record order status change in order_events
CREATE OR REPLACE FUNCTION public.log_order_status_event()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.order_events (order_id, status, note, actor_id)
    VALUES (NEW.id, NEW.status, 'Status changed to ' || NEW.status, auth.uid());
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_order_status_event ON public.orders;
CREATE TRIGGER trg_order_status_event
  AFTER UPDATE OF status ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.log_order_status_event();

-- Updated_at triggers on tables
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_addresses_updated_at ON public.addresses;
CREATE TRIGGER set_addresses_updated_at BEFORE UPDATE ON public.addresses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER set_cart_items_updated_at BEFORE UPDATE ON public.cart_items FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_reviews_updated_at ON public.reviews;
CREATE TRIGGER set_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_counters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- POLICIES (Drop if exists then create)

-- Profiles
DROP POLICY IF EXISTS "Public profiles can be viewed by anyone or admin" ON public.profiles;
CREATE POLICY "Public profiles can be viewed by anyone or admin" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Admin has full profile access" ON public.profiles;
CREATE POLICY "Admin has full profile access" ON public.profiles FOR ALL TO authenticated USING (public.is_admin());

-- Addresses
DROP POLICY IF EXISTS "Users view own addresses" ON public.addresses;
CREATE POLICY "Users view own addresses" ON public.addresses FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own addresses" ON public.addresses;
CREATE POLICY "Users insert own addresses" ON public.addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own addresses" ON public.addresses;
CREATE POLICY "Users update own addresses" ON public.addresses FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own addresses" ON public.addresses;
CREATE POLICY "Users delete own addresses" ON public.addresses FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin views all addresses" ON public.addresses;
CREATE POLICY "Admin views all addresses" ON public.addresses FOR SELECT USING (public.is_admin());

-- Categories
DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;
CREATE POLICY "Anyone can view active categories" ON public.categories FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin full categories" ON public.categories;
CREATE POLICY "Admin full categories" ON public.categories FOR ALL USING (public.is_admin());

-- Products
DROP POLICY IF EXISTS "Anyone can view active products" ON public.products;
CREATE POLICY "Anyone can view active products" ON public.products FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin full products" ON public.products;
CREATE POLICY "Admin full products" ON public.products FOR ALL USING (public.is_admin());

-- Product Variants
DROP POLICY IF EXISTS "Anyone can view active variants" ON public.product_variants;
CREATE POLICY "Anyone can view active variants" ON public.product_variants FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin full variants" ON public.product_variants;
CREATE POLICY "Admin full variants" ON public.product_variants FOR ALL USING (public.is_admin());

-- Cart Items
DROP POLICY IF EXISTS "Users view own cart" ON public.cart_items;
CREATE POLICY "Users view own cart" ON public.cart_items FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users insert own cart" ON public.cart_items;
CREATE POLICY "Users insert own cart" ON public.cart_items FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users update own cart" ON public.cart_items;
CREATE POLICY "Users update own cart" ON public.cart_items FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users delete own cart" ON public.cart_items;
CREATE POLICY "Users delete own cart" ON public.cart_items FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin views all carts" ON public.cart_items;
CREATE POLICY "Admin views all carts" ON public.cart_items FOR SELECT USING (public.is_admin());

-- Orders
DROP POLICY IF EXISTS "Users view own orders" ON public.orders;
CREATE POLICY "Users view own orders" ON public.orders FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admin full orders" ON public.orders;
CREATE POLICY "Admin full orders" ON public.orders FOR ALL USING (public.is_admin());

-- Order Items
DROP POLICY IF EXISTS "Users view own order items" ON public.order_items;
CREATE POLICY "Users view own order items" ON public.order_items FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_items.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin full order items" ON public.order_items;
CREATE POLICY "Admin full order items" ON public.order_items FOR ALL USING (public.is_admin());

-- Payments
DROP POLICY IF EXISTS "Users view own payments" ON public.payments;
CREATE POLICY "Users view own payments" ON public.payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = payments.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin full payments" ON public.payments;
CREATE POLICY "Admin full payments" ON public.payments FOR ALL USING (public.is_admin());

-- Order Events
DROP POLICY IF EXISTS "Users view own order events" ON public.order_events;
CREATE POLICY "Users view own order events" ON public.order_events FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = order_events.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin full order events" ON public.order_events;
CREATE POLICY "Admin full order events" ON public.order_events FOR ALL USING (public.is_admin());

-- Coupons
DROP POLICY IF EXISTS "Admin full coupons" ON public.coupons;
CREATE POLICY "Admin full coupons" ON public.coupons FOR ALL USING (public.is_admin());

-- Site Settings
DROP POLICY IF EXISTS "Public read settings" ON public.site_settings;
CREATE POLICY "Public read settings" ON public.site_settings FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin manage settings" ON public.site_settings;
CREATE POLICY "Admin manage settings" ON public.site_settings FOR ALL USING (public.is_admin());

-- Admin Audit Log
DROP POLICY IF EXISTS "Admin audit log access" ON public.admin_audit_log;
CREATE POLICY "Admin audit log access" ON public.admin_audit_log FOR ALL USING (public.is_admin());

-- Shipping Rates
DROP POLICY IF EXISTS "Public read active shipping rates" ON public.shipping_rates;
CREATE POLICY "Public read active shipping rates" ON public.shipping_rates FOR SELECT USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin manage shipping rates" ON public.shipping_rates;
CREATE POLICY "Admin manage shipping rates" ON public.shipping_rates FOR ALL USING (public.is_admin());

-- Invoices
DROP POLICY IF EXISTS "Users view own invoices" ON public.invoices;
CREATE POLICY "Users view own invoices" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.orders WHERE id = invoices.order_id AND user_id = auth.uid())
);

DROP POLICY IF EXISTS "Admin full invoices" ON public.invoices;
CREATE POLICY "Admin full invoices" ON public.invoices FOR ALL USING (public.is_admin());

-- Reviews
DROP POLICY IF EXISTS "Anyone view approved reviews" ON public.reviews;
CREATE POLICY "Anyone view approved reviews" ON public.reviews FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users create reviews" ON public.reviews;
CREATE POLICY "Users create reviews" ON public.reviews FOR INSERT WITH CHECK (
  auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.orders o
    JOIN public.order_items oi ON oi.order_id = o.id
    JOIN public.product_variants pv ON pv.id = oi.variant_id
    WHERE o.user_id = auth.uid()
      AND o.status = 'delivered'
      AND pv.product_id = reviews.product_id
  )
);

DROP POLICY IF EXISTS "Users update own pending review" ON public.reviews;
CREATE POLICY "Users update own pending review" ON public.reviews FOR UPDATE USING (
  auth.uid() = user_id
) WITH CHECK (
  auth.uid() = user_id AND status = 'pending'
);

DROP POLICY IF EXISTS "Admin full reviews" ON public.reviews;
CREATE POLICY "Admin full reviews" ON public.reviews FOR ALL USING (public.is_admin());
