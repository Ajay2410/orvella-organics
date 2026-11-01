import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router';
import { CheckCircle2, Package, ArrowRight, MessageCircle, Truck } from 'lucide-react';
import { orderService } from '../../services/orders/orderService';
import type { Order } from '../../services/supabase/types';

export function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order_number') || searchParams.get('session_id') || 'ORV-CONFIRMED';
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber && orderNumber !== 'ORV-CONFIRMED') {
      orderService.getOrderByNumber(orderNumber).then((data) => {
        setOrder(data);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  return (
    <div className="py-12 lg:py-16 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen flex items-center justify-center">
      <div className="max-w-xl w-full bg-white rounded-3xl p-6 sm:p-10 border border-[#E8E0D5] shadow-[0_4px_30px_rgba(0,0,0,0.06)] text-center animate-in fade-in zoom-in-95">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 size={36} />
        </div>

        <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
          Payment Successful
        </span>

        <h1 className="text-3xl font-heading font-bold text-text-dark mt-3">
          Thank you for your order!
        </h1>

        <p className="text-sm text-text-muted mt-2 font-body">
          We have received your order and are preparing it with care.
        </p>

        {/* Order Details Card */}
        <div className="mt-6 p-5 rounded-2xl bg-bg-cream/70 border border-[#E8E0D5]/70 text-left">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E0D5]/60 text-xs">
            <span className="text-text-muted">Order Number</span>
            <span className="font-mono font-bold text-text-dark">{orderNumber}</span>
          </div>

          {order && (
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-text-muted">Customer:</span>
                <span className="font-semibold text-text-dark">{order.customer_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-muted">Delivery City:</span>
                <span className="font-semibold text-text-dark">
                  {order.shipping_address?.city || 'India'}
                </span>
              </div>
              <div className="flex justify-between font-bold text-sm pt-2 border-t border-[#E8E0D5]/60 text-primary">
                <span>Total Paid:</span>
                <span>₹{order.total_amount}</span>
              </div>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2 text-xs text-text-muted">
            <Truck size={14} className="text-primary shrink-0" />
            <span>Estimated delivery in 3-5 business days.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href={`https://wa.me/919714280780?text=${encodeURIComponent(
              `Hi Orvella Organics! 🌿 I just placed an online order (${orderNumber}). Could you please share the tracking updates when dispatched?`
            )}`}
            target="_blank"
            rel="noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors shadow-sm"
          >
            <MessageCircle size={16} />
            <span>Track on WhatsApp</span>
          </a>

          <Link
            to="/products"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold border border-[#E8E0D5] bg-white text-text-dark hover:bg-bg-cream transition-colors"
          >
            <Package size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
