import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { 
  CheckCircle2, 
  Package, 
  Truck, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Loader2, 
  ShieldCheck,
  ShoppingBag,
  ExternalLink
} from 'lucide-react';
import { getOrderByOrderNo, OrderWithDetails } from '../../services/orders';

export function OrderConfirmation() {
  const { orderNo } = useParams<{ orderNo: string }>();
  const [order, setOrder] = useState<OrderWithDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOrder() {
      if (!orderNo) return;
      try {
        setLoading(true);
        const data = await getOrderByOrderNo(orderNo);
        setOrder(data);
      } catch (err) {
        console.error('Failed to load order confirmation:', err);
      } finally {
        setLoading(false);
      }
    }
    loadOrder();
  }, [orderNo]);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg-cream/40 flex items-center justify-center py-20 px-4">
        <div className="text-center">
          <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
          <p className="font-body text-text-muted text-sm font-semibold">
            Fetching order confirmation...
          </p>
        </div>
      </div>
    );
  }

  const address = order?.address_snapshot as any;

  return (
    <div className="min-h-screen bg-bg-cream/40 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Celebration Header Card */}
        <div className="bg-white rounded-3xl p-8 border border-[#E8E0D5] shadow-sm text-center mb-6">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4 ring-8 ring-emerald-50">
            <CheckCircle2 size={36} />
          </div>

          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full font-body">
            Payment Confirmed
          </span>

          <h1 className="font-heading font-bold text-3xl text-text-dark mt-3 mb-2">
            Thank you for ordering with Orvella!
          </h1>
          <p className="text-sm text-text-muted font-body max-w-md mx-auto">
            Your order has been placed successfully and will be freshly packed at our Surat warehouse.
          </p>

          <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 bg-bg-cream/60 px-5 py-3 rounded-2xl border border-[#E8E0D5]">
            <div className="text-left font-body">
              <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider block">
                Order Reference No.
              </span>
              <span className="font-bold text-base text-primary font-mono">
                {order?.order_no || orderNo}
              </span>
            </div>
            <div className="h-6 w-px bg-[#D8CEC2] hidden sm:block" />
            <div className="text-left font-body">
              <span className="text-[11px] text-text-muted uppercase font-bold tracking-wider block">
                Payment Status
              </span>
              <span className="font-bold text-sm text-emerald-700 flex items-center gap-1">
                <ShieldCheck size={14} /> Paid via Razorpay
              </span>
            </div>
          </div>
        </div>

        {/* Order Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Shipping & Delivery ETA */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 text-text-dark font-heading font-bold text-lg">
              <Truck size={20} className="text-primary" />
              <span>Courier Delivery</span>
            </div>

            <div className="space-y-3 font-body text-xs text-text-muted">
              <div>
                <span className="font-semibold text-text-dark block">Carrier Partner:</span>
                <span>{order?.courier || 'Delhivery Standard Surface'}</span>
              </div>
              <div>
                <span className="font-semibold text-text-dark block">Estimated Dispatch:</span>
                <span>Within 24 Hours from Surat, Gujarat</span>
              </div>
              <div>
                <span className="font-semibold text-text-dark block">Delivery Address:</span>
                {address ? (
                  <p className="text-text-dark mt-0.5">
                    <strong>{address.name}</strong> ({address.phone})<br />
                    {address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                    {address.city}, {address.state} - <strong>{address.pincode}</strong>
                  </p>
                ) : (
                  <span>Standard Shipping Address</span>
                )}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs">
            <div className="flex items-center gap-2.5 mb-4 text-text-dark font-heading font-bold text-lg">
              <Package size={20} className="text-primary" />
              <span>Payment Summary</span>
            </div>

            <div className="space-y-2.5 font-body text-xs text-text-muted">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-medium text-text-dark">
                  ₹{order ? (order.subtotal_paise / 100).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Charge</span>
                <span className="font-medium text-text-dark">
                  {order?.shipping_paise === 0 ? (
                    <span className="text-emerald-700 font-bold">FREE</span>
                  ) : (
                    `₹${order ? (order.shipping_paise / 100).toFixed(2) : '0.00'}`
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span>GST (5% Included)</span>
                <span>Included in price</span>
              </div>
              <div className="pt-3 border-t border-[#E8E0D5] flex justify-between items-baseline text-sm">
                <span className="font-bold text-text-dark">Total Paid</span>
                <span className="font-bold text-lg text-primary">
                  ₹{order ? (order.total_paise / 100).toFixed(2) : '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Ordered Items List */}
        {order?.items && order.items.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-[#E8E0D5] shadow-xs mb-8">
            <h3 className="font-heading font-bold text-lg text-text-dark mb-4">
              Ordered Items ({order.items.length})
            </h3>
            <div className="divide-y divide-[#E8E0D5]">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex items-center justify-between font-body">
                  <div>
                    <h4 className="font-bold text-sm text-text-dark">
                      {item.product_name}
                    </h4>
                    <p className="text-xs text-text-muted">
                      Pack Size: {item.variant_label} • Qty: {item.qty}
                    </p>
                  </div>
                  <span className="font-bold text-sm text-primary">
                    ₹{((item.unit_price_paise * item.qty) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/orders"
            className="w-full sm:w-auto px-8 py-3.5 bg-primary text-white font-body font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2"
          >
            <span>View All Orders & Live Tracking</span>
            <ArrowRight size={16} />
          </Link>

          <Link
            to="/products"
            className="w-full sm:w-auto px-8 py-3.5 bg-white border border-[#D8CEC2] text-text-dark font-body font-bold text-sm rounded-xl hover:bg-bg-cream/50 transition-all flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            <span>Continue Shopping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
