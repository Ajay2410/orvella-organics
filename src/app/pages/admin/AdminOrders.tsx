import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { orderService } from '../../services/orders/orderService';
import type { Order } from '../../services/supabase/types';
import { 
  ShoppingBag, 
  ArrowLeft, 
  RefreshCw, 
  Truck, 
  CheckCircle2, 
  Clock, 
  Package, 
  ExternalLink,
  MapPin,
  Calendar,
  AlertCircle
} from 'lucide-react';

export function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'>('all');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await orderService.getOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleStatusChange = async (
    orderId: string,
    newStatus: 'processing' | 'dispatched' | 'delivered' | 'cancelled'
  ) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, fulfillment_status: newStatus } : o))
    );

    const success = await orderService.updateFulfillmentStatus(orderId, newStatus);
    if (success) {
      setFeedback(`Order status updated to ${newStatus}`);
      setTimeout(() => setFeedback(null), 2500);
    } else {
      loadOrders();
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (filter === 'all') return true;
    return o.fulfillment_status === filter;
  });

  const totalRevenue = orders
    .filter((o) => o.payment_status === 'paid')
    .reduce((sum, o) => sum + Number(o.total_amount || 0), 0);

  const getFulfillmentBadge = (status: Order['fulfillment_status']) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-amber-100 text-amber-800">
            <Clock size={12} /> Processing
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-blue-100 text-blue-800">
            <Truck size={12} /> Dispatched
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-emerald-100 text-emerald-800">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold uppercase rounded-full bg-red-100 text-red-800">
            <AlertCircle size={12} /> Cancelled
          </span>
        );
    }
  };

  const cleanPhone = (phone?: string | null) => {
    if (!phone) return '';
    return phone.replace(/[^0-9]/g, '');
  };

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E0D5]">
          <div>
            <Link
              to="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mb-2"
            >
              <ArrowLeft size={14} /> Back to Admin Overview
            </Link>
            <h1 className="text-3xl font-heading font-bold text-text-dark flex items-center gap-3">
              <ShoppingBag size={28} className="text-primary" />
              Online Orders & Fulfillment
            </h1>
            <p className="text-sm text-text-muted mt-1 font-body">
              Track customer orders, manage shipping dispatch, and send tracking updates directly via WhatsApp.
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E8E0D5] bg-white text-text-dark hover:bg-bg-cream text-sm font-medium transition-colors"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh Orders</span>
          </button>
        </div>

        {/* Metric Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs">
            <span className="text-xs text-text-muted font-body font-medium">Total Orders</span>
            <p className="text-2xl font-bold font-heading text-text-dark mt-1">{orders.length}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs">
            <span className="text-xs text-text-muted font-body font-medium">Paid Revenue</span>
            <p className="text-2xl font-bold font-body text-primary mt-1">₹{totalRevenue}</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs">
            <span className="text-xs text-text-muted font-body font-medium">Needs Dispatch</span>
            <p className="text-2xl font-bold font-heading text-amber-600 mt-1">
              {orders.filter((o) => o.fulfillment_status === 'processing').length}
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#E8E0D5] shadow-xs">
            <span className="text-xs text-text-muted font-body font-medium">Delivered</span>
            <p className="text-2xl font-bold font-heading text-emerald-600 mt-1">
              {orders.filter((o) => o.fulfillment_status === 'delivered').length}
            </p>
          </div>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>{feedback}</span>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(
            [
              { key: 'all', label: 'All Orders', count: orders.length },
              { key: 'processing', label: 'Processing', count: orders.filter((o) => o.fulfillment_status === 'processing').length },
              { key: 'dispatched', label: 'Dispatched', count: orders.filter((o) => o.fulfillment_status === 'dispatched').length },
              { key: 'delivered', label: 'Delivered', count: orders.filter((o) => o.fulfillment_status === 'delivered').length },
              { key: 'cancelled', label: 'Cancelled', count: orders.filter((o) => o.fulfillment_status === 'cancelled').length },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.key
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-text-muted border border-[#E8E0D5] hover:border-primary/40'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Orders Listing */}
        <div className="mt-6 space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-text-muted">
              <RefreshCw size={32} className="animate-spin text-primary mb-3" />
              <p className="text-sm font-medium">Loading orders from Supabase...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#E8E0D5] p-12 text-center shadow-sm">
              <Package size={40} className="text-text-muted/40 mx-auto mb-3" />
              <h3 className="text-lg font-heading font-bold text-text-dark">No orders found</h3>
              <p className="text-sm text-text-muted font-body mt-1">
                {filter === 'all'
                  ? 'Customer orders placed online will appear here.'
                  : `No orders currently match the filter "${filter}".`}
              </p>
            </div>
          ) : (
            filteredOrders.map((order) => {
              const formattedDate = order.created_at
                ? new Date(order.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Just now';

              const phoneNum = cleanPhone(order.customer_phone);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-[#E8E0D5] p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Top Bar: Order Number & Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E0D5]/60">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-base text-text-dark">
                          {order.order_number}
                        </span>
                        {getFulfillmentBadge(order.fulfillment_status)}
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md ${
                            order.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.payment_status}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-text-muted mt-1 font-body">
                        <Calendar size={13} />
                        <span>{formattedDate}</span>
                      </div>
                    </div>

                    {/* Fulfillment Changer */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-muted font-body">Fulfillment:</span>
                      <select
                        value={order.fulfillment_status}
                        onChange={(e) =>
                          handleStatusChange(
                            order.id,
                            e.target.value as 'processing' | 'dispatched' | 'delivered' | 'cancelled'
                          )
                        }
                        className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-[#E8E0D5] bg-bg-cream text-text-dark focus:outline-none focus:border-primary"
                      >
                        <option value="processing">Processing</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                    <div>
                      <span className="text-text-muted block mb-1">Customer Information:</span>
                      <p className="font-bold text-text-dark text-sm">{order.customer_name}</p>
                      <p className="text-text-muted">{order.customer_email}</p>
                      {order.customer_phone && <p className="text-text-muted">{order.customer_phone}</p>}
                    </div>

                    <div>
                      <span className="text-text-muted block mb-1">Shipping Address:</span>
                      <div className="flex items-start gap-1.5 text-text-dark font-medium">
                        <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                        <span>
                          {order.shipping_address
                            ? `${order.shipping_address.line1 || ''}, ${order.shipping_address.city || ''}, ${order.shipping_address.state || ''} - ${order.shipping_address.postal_code || ''}`
                            : 'Standard Delivery'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-4 p-3.5 rounded-xl bg-bg-cream/60 border border-[#E8E0D5]/50">
                    <span className="text-xs font-bold text-text-muted block mb-2 font-body uppercase tracking-wider">
                      Items Ordered
                    </span>
                    <div className="space-y-1.5">
                      {order.items && order.items.length > 0 ? (
                        order.items.map((it) => (
                          <div
                            key={it.id}
                            className="flex items-center justify-between text-xs font-body"
                          >
                            <span className="font-medium text-text-dark">
                              {it.product_name} ({it.variant_label}) × {it.quantity}
                            </span>
                            <span className="font-bold font-body text-primary">₹{it.total_price}</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-text-muted">Direct online order item</p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#E8E0D5]/60 flex items-center justify-between text-sm font-bold font-body">
                      <span>Total Amount Paid</span>
                      <span className="text-primary text-base">₹{order.total_amount}</span>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#E8E0D5]/60">
                    {phoneNum ? (
                      <a
                        href={`https://wa.me/${phoneNum.startsWith('91') ? phoneNum : '91' + phoneNum}?text=${encodeURIComponent(
                          `Hi ${order.customer_name}! 🌿 Update regarding your Orvella Organics Order (${order.order_number}):\nStatus: ${order.fulfillment_status.toUpperCase()}.\nThank you for choosing pure fruit snacks!`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-[#25D366] hover:bg-[#20bd5a] transition-colors shadow-sm"
                      >
                        <span>WhatsApp Customer</span>
                        <ExternalLink size={13} />
                      </a>
                    ) : (
                      <span className="text-xs text-text-muted">No phone provided</span>
                    )}

                    <a
                      href={`mailto:${order.customer_email}?subject=${encodeURIComponent(
                        `Update on your Orvella Organics Order ${order.order_number}`
                      )}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-[#E8E0D5] bg-white text-text-dark hover:bg-bg-cream transition-colors"
                    >
                      <span>Email Customer</span>
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
