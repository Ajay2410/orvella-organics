import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

export type Order = Database['public']['Tables']['orders']['Row'];
export type OrderItem = Database['public']['Tables']['order_items']['Row'];
export type Payment = Database['public']['Tables']['payments']['Row'];
export type OrderEvent = Database['public']['Tables']['order_events']['Row'];

export interface OrderWithDetails extends Order {
  items: OrderItem[];
  payments?: Payment[];
  events?: OrderEvent[];
}

export interface CreateOrderParams {
  shippingAddress: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  courier: string;
  shippingPaise: number;
  notes?: string;
}

export interface ConfirmPaymentParams {
  orderId: string;
  razorpayPaymentId: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  method?: string;
}

/**
 * Create a new pending order from the user's cart
 */
export async function createOrder(params: CreateOrderParams): Promise<{
  order: Order;
  razorpayKeyId?: string | null;
}> {
  // 1. Try invoking Edge Function if deployed
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('create-order', {
      body: {
        shipping_address: params.shippingAddress,
        courier: params.courier,
        shipping_paise: params.shippingPaise,
        notes: params.notes,
      },
    });

    if (!edgeError && edgeData?.order) {
      return {
        order: edgeData.order,
        razorpayKeyId: edgeData.razorpay_key_id,
      };
    }
  } catch (err) {
    console.warn('Edge function create-order invocation failed, falling back to database RPC:', err);
  }

  // 2. Fallback: Call atomic RPC function in PostgreSQL
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('create_order_secure', {
      p_shipping_address: params.shippingAddress,
      p_courier: params.courier,
      p_shipping_paise: params.shippingPaise,
      p_notes: params.notes || null,
    });

    if (!rpcError && rpcData) {
      return { order: rpcData as unknown as Order, razorpayKeyId: null };
    }

    if (rpcError && rpcError.code !== 'PGRST202') {
      console.warn('RPC create_order_secure returned error, attempting direct insert:', rpcError);
    }
  } catch (err) {
    console.warn('RPC create_order_secure call exception, attempting direct insert:', err);
  }

  // 3. Client Direct Insert Fallback
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Authentication required to create order');
  }

  // Fetch cart items
  const { data: cartItems, error: cartError } = await supabase
    .from('cart_items')
    .select('*, product_variants(*, products(name))')
    .eq('user_id', user.id);

  if (cartError || !cartItems || cartItems.length === 0) {
    throw new Error('Your cart is empty. Please add items before checking out.');
  }

  let calculatedSubtotal = 0;
  for (const item of cartItems) {
    const variant = (item as any).product_variants;
    if (variant) {
      calculatedSubtotal += variant.price_paise * item.qty;
    }
  }

  let finalShipping = params.shippingPaise;
  if (calculatedSubtotal >= 49900 && !params.courier.includes('Express')) {
    finalShipping = 0;
  }
  const calculatedTotal = calculatedSubtotal + finalShipping;
  const orderNo = `ORV-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

  const { data: orderData, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_no: orderNo,
      user_id: user.id,
      status: 'pending_payment',
      payment_status: 'created',
      subtotal_paise: calculatedSubtotal,
      shipping_paise: finalShipping,
      discount_paise: 0,
      total_paise: calculatedTotal,
      address_snapshot: params.shippingAddress,
      courier: params.courier,
      notes: params.notes || null,
    })
    .select()
    .single();

  if (insertError || !orderData) {
    console.error('Direct order insert error:', insertError);
    throw new Error(
      insertError?.message ||
        'Could not create order. Please execute migration 20261115000000_checkout_orders.sql in your Supabase SQL Editor.'
    );
  }

  // Insert order items
  const orderItemsToInsert = cartItems.map((item: any) => ({
    order_id: orderData.id,
    variant_id: item.variant_id,
    product_name: item.product_variants?.products?.name || 'Organic Product',
    variant_label: item.product_variants?.label || 'Standard Pack',
    unit_price_paise: item.product_variants?.price_paise || 0,
    qty: item.qty,
  }));

  await supabase.from('order_items').insert(orderItemsToInsert);

  return { order: orderData, razorpayKeyId: null };
}

/**
 * Verify and confirm order payment
 */
export async function confirmOrderPayment(params: ConfirmPaymentParams): Promise<boolean> {
  // 1. Try invoking Edge Function
  try {
    const { data: edgeData, error: edgeError } = await supabase.functions.invoke('verify-payment', {
      body: {
        order_id: params.orderId,
        razorpay_order_id: params.razorpayOrderId,
        razorpay_payment_id: params.razorpayPaymentId,
        razorpay_signature: params.razorpaySignature,
        method: params.method || 'razorpay',
      },
    });

    if (!edgeError && edgeData?.success) {
      return true;
    }
  } catch (err) {
    console.warn('Edge function verify-payment invocation failed, falling back to database RPC:', err);
  }

  // 2. Fallback: Call confirm_order_payment RPC
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('confirm_order_payment', {
      p_order_id: params.orderId,
      p_razorpay_payment_id: params.razorpayPaymentId,
      p_razorpay_order_id: params.razorpayOrderId || null,
      p_razorpay_signature: params.razorpaySignature || null,
      p_method: params.method || 'razorpay',
    });

    if (!rpcError) {
      return true;
    }

    if (rpcError && rpcError.code !== 'PGRST202') {
      console.warn('confirm_order_payment RPC returned error, attempting direct table update:', rpcError);
    }
  } catch (err) {
    console.warn('confirm_order_payment RPC exception, attempting direct table update:', err);
  }

  // 3. Direct table update fallback
  const { data: order } = await supabase
    .from('orders')
    .select('id, total_paise, user_id')
    .eq('id', params.orderId)
    .single();

  if (order) {
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        payment_status: 'paid',
        razorpay_order_id: params.razorpayOrderId || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', params.orderId);

    // Record payment
    await supabase.from('payments').insert({
      order_id: params.orderId,
      razorpay_payment_id: params.razorpayPaymentId,
      amount_paise: order.total_paise,
      status: 'captured',
      method: params.method || 'razorpay',
      raw_payload: {
        razorpay_payment_id: params.razorpayPaymentId,
        razorpay_order_id: params.razorpayOrderId,
        razorpay_signature: params.razorpaySignature,
      },
    });

    // Clear cart
    if (order.user_id) {
      await supabase.from('cart_items').delete().eq('user_id', order.user_id);
    }
    return true;
  }

  return false;
}

/**
 * Get all orders for the current user
 */
export async function getUserOrders(): Promise<OrderWithDetails[]> {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: orders, error: ordersError } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (ordersError) {
    console.error('Failed to fetch orders:', ordersError);
    return [];
  }

  if (!orders || orders.length === 0) return [];

  // Fetch items for all orders
  const orderIds = orders.map((o) => o.id);
  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .in('order_id', orderIds);

  const { data: events } = await supabase
    .from('order_events')
    .select('*')
    .in('order_id', orderIds)
    .order('created_at', { ascending: true });

  return orders.map((order) => ({
    ...order,
    items: (items || []).filter((item) => item.order_id === order.id),
    events: (events || []).filter((event) => event.order_id === order.id),
  }));
}

/**
 * Get single order details by order_no
 */
export async function getOrderByOrderNo(orderNo: string): Promise<OrderWithDetails | null> {
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_no', orderNo)
    .maybeSingle();

  if (error || !order) {
    console.error('Error fetching order by order_no:', error);
    return null;
  }

  const { data: items } = await supabase
    .from('order_items')
    .select('*')
    .eq('order_id', order.id);

  const { data: events } = await supabase
    .from('order_events')
    .select('*')
    .eq('order_id', order.id)
    .order('created_at', { ascending: true });

  return {
    ...order,
    items: items || [],
    events: events || [],
  };
}
