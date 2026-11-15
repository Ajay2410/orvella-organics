import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  Package, 
  Truck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Loader2, 
  ExternalLink,
  ShoppingBag,
  CreditCard,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserOrders, confirmOrderPayment, OrderWithDetails } from '../../services/orders';
import { openRazorpayCheckout } from '../../lib/razorpay';

export function Orders() {
  const { user, loading: authLoading, openAuthModal } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<OrderWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingOrderId, setRetryingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await getUserOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to fetch user orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      openAuthModal();
      return;
    }
    if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  // Retry payment handler for pending_payment orders
  const handleRetryPayment = async (order: OrderWithDetails) => {
    try {
      setRetryingOrderId(order.id);
      const address = order.address_snapshot as any;

      const paymentResponse = await openRazorpayCheckout({
        amountPaise: order.total_paise,
        orderNo: order.order_no,
        orderId: order.id,
        razorpayOrderId: order.razorpay_order_id,
        customerName: address?.name || 'Customer',
        customerEmail: user?.email || '',
        customerPhone: address?.phone || '',
      });

      await confirmOrderPayment({
        orderId: order.id,
        razorpayPaymentId: paymentResponse.razorpay_payment_id,
        razorpayOrderId: paymentResponse.razorpay_order_id,
        razorpaySignature: paymentResponse.razorpay_signature,
      });

      await fetchOrders();
    } catch (err: any) {
      console.error('Retry payment error:', err);
      alert(err.message || 'Payment retry was not completed.');
    } finally {
      setRetryingOrderId(null);
    }
  };

  // Helper for tracking progress steps
  const getTrackingSteps = (status: string) => {
    const steps = [
      { key: 'placed', label: 'Order Placed', completed: true },
      { key: 'paid', label: 'Payment Confirmed', completed: status !== 'pending_payment' },
      { key: 'packed', label: 'Packed & Ready', completed: ['packed', 'shipped', 'delivered'].includes(status) },
      { key: 'shipped', label: 'In Transit', completed: ['shipped', 'delivered'].includes(status) },
      { key: 'delivered', label: 'Delivered', completed: status === 'delivered' },
    ];
    return steps;
  };

  return (
    <div className="min-h-screen bg-bg-cream/40 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E8E0D5]">
          <div>
            <h1 className="font-heading font-bold text-2xl sm:text-3xl text-text-dark">
              My Orders & Live Tracking
            </h1>
            <p className="text-xs sm:text-sm text-text-muted font-body mt-1">
              Track courier dispatches, delivery status, and order history
            </p>
          </div>

          <button
            onClick={fetchOrders}
            className="p-2.5 rounded-xl border border-[#D8CEC2] hover:bg-white text-text-muted hover:text-text-dark transition-all text-xs font-body font-semibold flex items-center gap-1.5"
            title="Refresh orders"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-[#E8E0D5]">
            <Loader2 size={36} className="animate-spin text-primary mx-auto mb-4" />
            <p className="text-sm font-body text-text-muted">Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="text-center py-16 bg-white rounded-3xl border border-[#E8E0D5] p-8 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
              <ShoppingBag size={28} />
            </div>
            <h3 className="font-heading font-bold text-xl text-text-dark mb-2">
              No orders placed yet
            </h3>
            <p className="text-sm text-text-muted font-body max-w-sm mx-auto mb-6">
              You haven't ordered any natural dehydrated fruits or powders yet. Explore our fresh collection!
            </p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-body font-bold text-sm rounded-xl hover:bg-primary-dark transition-all shadow-md shadow-primary/20"
            >
              <span>Explore Products</span>
              <ChevronRight size={16} />
            </Link>
          </div>
        ) : (
          /* Orders list */
          <div className="space-y-6">
            {orders.map((order) => {
              const address = order.address_snapshot as any;
              const steps = getTrackingSteps(order.status);
              const isPending = order.status === 'pending_payment';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-xs transition-all hover:shadow-md"
                >
                  {/* Top Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#E8E0D5]">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-bold text-sm text-primary">
                          {order.order_no}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full font-body ${
                            order.status === 'delivered'
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPending
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-text-muted font-body mt-1">
                        Placed on {new Date(order.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-body font-bold text-lg text-text-dark block">
                        ₹{(order.total_paise / 100).toFixed(2)}
                      </span>
                      <span className="text-[11px] text-text-muted font-body">
                        {order.items.length} item{order.items.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  {/* Multi-step Tracker */}
                  <div className="py-6 border-b border-[#E8E0D5]">
                    <div className="relative flex items-center justify-between max-w-xl mx-auto px-2">
                      {/* Connecting Line */}
                      <div className="absolute top-3.5 left-4 right-4 h-0.5 bg-[#E8E0D5] -z-0" />
                      
                      {steps.map((s, idx) => (
                        <div key={s.key} className="relative z-10 flex flex-col items-center">
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                              s.completed
                                ? 'bg-primary text-white ring-4 ring-primary/10'
                                : 'bg-[#E8E0D5] text-text-muted'
                            }`}
                          >
                            {s.completed ? <CheckCircle2 size={14} /> : idx + 1}
                          </div>
                          <span
                            className={`text-[10px] font-body mt-1.5 text-center max-w-[70px] leading-tight ${
                              s.completed ? 'font-bold text-text-dark' : 'text-text-muted'
                            }`}
                          >
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Live AWB / Courier info */}
                    {order.tracking_number && (
                      <div className="mt-4 p-3 rounded-xl bg-bg-cream/60 border border-[#E8E0D5] flex items-center justify-between text-xs font-body">
                        <div className="flex items-center gap-2 text-text-dark">
                          <Truck size={16} className="text-primary" />
                          <span>
                            Carrier: <strong>{order.courier || 'Delhivery'}</strong> • AWB:{' '}
                            <strong className="font-mono">{order.tracking_number}</strong>
                          </span>
                        </div>
                        {order.tracking_url && (
                          <a
                            href={order.tracking_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary font-bold hover:underline inline-flex items-center gap-1"
                          >
                            <span>Live GPS Tracking</span>
                            <ExternalLink size={12} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Items Summary */}
                  <div className="py-4 space-y-2">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between text-xs font-body py-1"
                      >
                        <div>
                          <span className="font-bold text-text-dark">{item.product_name}</span>{' '}
                          <span className="text-text-muted">({item.variant_label})</span>
                          <span className="text-text-muted"> × {item.qty}</span>
                        </div>
                        <span className="font-bold text-primary">
                          ₹{((item.unit_price_paise * item.qty) / 100).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address & Actions */}
                  <div className="pt-4 border-t border-[#E8E0D5] flex flex-wrap items-center justify-between gap-4">
                    {address && (
                      <div className="flex items-start gap-2 text-xs text-text-muted font-body">
                        <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                        <div>
                          Deliver to: <strong className="text-text-dark">{address.name}</strong>,{' '}
                          {address.city}, {address.state} ({address.pincode})
                        </div>
                      </div>
                    )}

                    {isPending && (
                      <button
                        onClick={() => handleRetryPayment(order)}
                        disabled={retryingOrderId === order.id}
                        className="px-5 py-2.5 bg-primary text-white font-body font-bold text-xs rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {retryingOrderId === order.id ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            <span>Opening Payment...</span>
                          </>
                        ) : (
                          <>
                            <CreditCard size={14} />
                            <span>Complete Payment</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
