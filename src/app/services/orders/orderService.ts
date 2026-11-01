import { supabase, isSupabaseConfigured } from '../supabase/supabaseClient';
import type { Order, OrderItem } from '../supabase/types';

export interface CreateOrderInput {
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  currency?: string;
  paymentStatus?: 'pending' | 'paid' | 'failed';
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;
  items: {
    productId: string;
    variantId: string;
    productName: string;
    variantLabel: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
  }[];
}

export const orderService = {
  /**
   * Generate an Orvella Order Number (e.g. ORV-261101-7842)
   */
  generateOrderNumber(): string {
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    return `ORV-${dateStr}-${rand}`;
  },

  /**
   * Create an order and its items in Supabase
   */
  async createOrder(input: CreateOrderInput): Promise<{ order: Order | null; error: Error | null }> {
    const orderNumber = this.generateOrderNumber();

    if (!isSupabaseConfigured) {
      // Mock order if Supabase is offline
      const mockOrder: Order = {
        id: `mock-${Date.now()}`,
        order_number: orderNumber,
        user_id: input.userId || null,
        customer_name: input.customerName,
        customer_email: input.customerEmail,
        customer_phone: input.customerPhone,
        shipping_address: input.shippingAddress,
        subtotal: input.subtotal,
        shipping_fee: input.shippingFee,
        total_amount: input.totalAmount,
        currency: input.currency || 'inr',
        payment_status: input.paymentStatus || 'paid',
        fulfillment_status: 'processing',
        created_at: new Date().toISOString(),
        items: input.items.map((it, idx) => ({
          id: `item-${idx}`,
          order_id: `mock-${Date.now()}`,
          product_id: it.productId,
          variant_id: it.variantId,
          product_name: it.productName,
          variant_label: it.variantLabel,
          unit_price: it.unitPrice,
          quantity: it.quantity,
          total_price: it.totalPrice,
        })),
      };
      return { order: mockOrder, error: null };
    }

    try {
      // 1. Insert order
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          user_id: input.userId || null,
          customer_name: input.customerName,
          customer_email: input.customerEmail,
          customer_phone: input.customerPhone,
          shipping_address: input.shippingAddress,
          subtotal: input.subtotal,
          shipping_fee: input.shippingFee,
          total_amount: input.totalAmount,
          currency: input.currency || 'inr',
          payment_status: input.paymentStatus || 'pending',
          fulfillment_status: 'processing',
          stripe_session_id: input.stripeSessionId || null,
          stripe_payment_intent_id: input.stripePaymentIntentId || null,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert items
      if (input.items && input.items.length > 0) {
        const orderItemsPayload = input.items.map((item) => ({
          order_id: orderData.id,
          product_id: item.productId,
          variant_id: item.variantId,
          product_name: item.productName,
          variant_label: item.variantLabel,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          total_price: item.totalPrice,
        }));

        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItemsPayload);

        if (itemsError) throw itemsError;
      }

      return { order: orderData as Order, error: null };
    } catch (err: any) {
      console.error('Failed to create order in Supabase:', err);
      return { order: null, error: err };
    }
  },

  /**
   * Fetch all orders with their items for admin dashboard
   */
  async getOrders(): Promise<Order[]> {
    if (!isSupabaseConfigured) return [];

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return [];
      }

      return (data || []) as Order[];
    } catch (err) {
      console.error('Failed to load orders:', err);
      return [];
    }
  },

  /**
   * Fetch single order by order_number
   */
  async getOrderByNumber(orderNumber: string): Promise<Order | null> {
    if (!isSupabaseConfigured) return null;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('order_number', orderNumber)
        .maybeSingle();

      if (error) throw error;
      return data as Order | null;
    } catch (err) {
      console.error('Error finding order:', err);
      return null;
    }
  },

  /**
   * Update fulfillment status ('processing' | 'dispatched' | 'delivered' | 'cancelled')
   */
  async updateFulfillmentStatus(
    orderId: string,
    status: 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          fulfillment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return !error;
    } catch (err) {
      console.error('Failed to update fulfillment status:', err);
      return false;
    }
  },

  /**
   * Update payment status ('pending' | 'paid' | 'failed' | 'refunded')
   */
  async updatePaymentStatus(
    orderId: string,
    status: 'pending' | 'paid' | 'failed' | 'refunded'
  ): Promise<boolean> {
    if (!isSupabaseConfigured) return false;

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          payment_status: status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId);

      return !error;
    } catch (err) {
      console.error('Failed to update payment status:', err);
      return false;
    }
  },
};
