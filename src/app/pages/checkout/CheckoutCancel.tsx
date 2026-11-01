import { Link } from 'react-router';
import { XCircle, ArrowLeft, MessageCircle } from 'lucide-react';

export function CheckoutCancel() {
  return (
    <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E0D5] shadow-[0_4px_30px_rgba(0,0,0,0.06)] text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle size={36} />
        </div>

        <h1 className="text-2xl font-heading font-bold text-text-dark">
          Checkout Cancelled
        </h1>

        <p className="text-sm text-text-muted mt-2 font-body">
          Your payment was not completed and your card was not charged.
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <Link
            to="/products"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition-colors shadow-sm"
          >
            <ArrowLeft size={16} />
            <span>Return to Products</span>
          </Link>

          <a
            href={`https://wa.me/919714280780?text=${encodeURIComponent(
              "Hi Orvella Organics! 🌿 I had a question while trying to checkout on your website. Could you please help me place my order?"
            )}`}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors"
          >
            <MessageCircle size={16} />
            <span>Order via WhatsApp instead</span>
          </a>
        </div>
      </div>
    </div>
  );
}
