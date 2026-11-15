// Razorpay Client SDK Loader & Integration

export interface RazorpayPaymentSuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  modal?: {
    ondismiss?: () => void;
  };
  handler?: (response: RazorpayPaymentSuccessResponse) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => {
      open: () => void;
      on: (event: string, handler: (response: any) => void) => void;
    };
  }
}

/**
 * Dynamically load the official Razorpay Checkout v1 script
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false);
      return;
    }

    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error('Failed to load Razorpay Checkout SDK');
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

/**
 * Trigger Razorpay checkout modal
 */
export async function openRazorpayCheckout(options: {
  amountPaise: number;
  orderNo: string;
  orderId: string;
  razorpayOrderId?: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  keyId?: string;
}): Promise<RazorpayPaymentSuccessResponse> {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error('Could not load Razorpay payment gateway. Please check your internet connection.');
  }

  // Use configured key or environment key
  const razorpayKey =
    options.keyId ||
    (import.meta.env.VITE_RAZORPAY_KEY_ID as string) ||
    'rzp_test_5173dummy';

  return new Promise((resolve, reject) => {
    // If Razorpay is in simulated test environment (dummy key without live Razorpay account)
    // we provide a smooth test confirmation modal so developers & clients can test the full flow
    if (razorpayKey === 'rzp_test_5173dummy') {
      const confirmTest = window.confirm(
        `[Orvella Test Gateway]\n\nOrder Number: ${options.orderNo}\nAmount: ₹${(options.amountPaise / 100).toFixed(2)}\nCustomer: ${options.customerName || 'Guest'}\n\nProceed to simulate successful test payment?`
      );
      if (confirmTest) {
        resolve({
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_order_id: options.razorpayOrderId || `order_test_${Date.now()}`,
          razorpay_signature: `sig_mock_${Math.random().toString(36).substring(2)}`,
        });
      } else {
        reject(new Error('Payment was cancelled by the customer.'));
      }
      return;
    }

    const rzpOptions: RazorpayOptions = {
      key: razorpayKey,
      amount: options.amountPaise,
      currency: 'INR',
      name: 'Orvella Organics',
      description: `Order #${options.orderNo}`,
      image: '/favicon.ico',
      order_id: options.razorpayOrderId || undefined,
      prefill: {
        name: options.customerName || '',
        email: options.customerEmail || '',
        contact: options.customerPhone || '',
      },
      theme: {
        color: '#1B4332', // Orvella Forest Green
      },
      handler: (response: RazorpayPaymentSuccessResponse) => {
        resolve(response);
      },
      modal: {
        ondismiss: () => {
          reject(new Error('Payment window closed before completion.'));
        },
      },
    };

    if (window.Razorpay) {
      const rzpInstance = new window.Razorpay(rzpOptions);
      rzpInstance.open();
    } else {
      reject(new Error('Razorpay SDK not initialized'));
    }
  });
}
