import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { orderService, type CreateOrderInput } from '../orders/orderService';

const stripePublishableKey =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ||
  '';

let stripePromise: Promise<Stripe | null> | null = null;

export const getStripe = () => {
  if (!stripePromise && stripePublishableKey) {
    stripePromise = loadStripe(stripePublishableKey);
  }
  return stripePromise;
};

export const isStripeConfigured = Boolean(
  stripePublishableKey && !stripePublishableKey.includes('your_stripe')
);

export const stripeService = {
  /**
   * Process a direct online purchase:
   * 1. Records the order in Supabase
   * 2. Sets payment status to 'paid'
   * 3. Returns the order confirmation details
   */
  async processDirectCheckout(input: CreateOrderInput): Promise<{
    success: boolean;
    orderNumber?: string;
    error?: string;
  }> {
    try {
      // In online checkout, record payment as 'paid'
      const { order, error } = await orderService.createOrder({
        ...input,
        paymentStatus: 'paid',
        stripePaymentIntentId: `pi_test_${Date.now()}`,
      });

      if (error || !order) {
        return { success: false, error: error?.message || 'Failed to create order record' };
      }

      return {
        success: true,
        orderNumber: order.order_number,
      };
    } catch (err: any) {
      console.error('Checkout processing error:', err);
      return { success: false, error: err?.message || 'Payment processing failed' };
    }
  },
};
