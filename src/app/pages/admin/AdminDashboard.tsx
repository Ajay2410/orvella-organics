import { Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { Package, MessageSquare, ShoppingBag, ShieldCheck, ArrowRight, User } from 'lucide-react';

export function AdminDashboard() {
  const { user, profile } = useAuth();

  return (
    <div className="py-10 px-4 sm:px-6 lg:px-20 bg-bg-cream min-h-screen">
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-[#E8E0D5]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                <ShieldCheck size={14} /> Admin Portal
              </span>
            </div>
            <h1 className="text-3xl font-heading font-bold text-text-dark mt-2">
              Welcome back, {profile?.full_name || 'Admin'}
            </h1>
            <p className="text-sm text-text-muted mt-1 font-body">
              Signed in as {user?.email}
            </p>
          </div>
          <Link
            to="/"
            className="self-start sm:self-auto px-4 py-2 border border-[#E8E0D5] rounded-xl text-sm font-medium text-text-dark bg-white hover:bg-bg-cream transition-colors"
          >
            ← View Live Storefront
          </Link>
        </div>

        {/* Phase 1 Status Banner */}
        <div className="mt-8 p-6 bg-white rounded-2xl border border-[#E8E0D5] shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              ✓
            </div>
            <div>
              <h2 className="text-lg font-heading font-bold text-text-dark">Phase 1: Authentication & Supabase Setup Active</h2>
              <p className="text-sm text-text-muted font-body">
                Role-based access control and admin session protection are active.
              </p>
            </div>
          </div>
        </div>

        {/* Admin Sections Grid */}
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link
            to="/admin/products"
            className="group bg-white p-6 rounded-2xl border border-[#E8E0D5] hover:border-primary/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <Package size={24} />
              </div>
              <h3 className="text-lg font-heading font-bold text-text-dark group-hover:text-primary transition-colors">
                Product Catalog
              </h3>
              <p className="text-sm text-text-muted mt-1 font-body">
                Manage products, live stock toggles (In Stock / Out of Stock), variant pricing, and images.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E0D5]/60 flex items-center justify-between text-xs font-semibold text-primary">
              <span>Open Catalog Manager</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/inquiries"
            className="group bg-white p-6 rounded-2xl border border-[#E8E0D5] hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-heading font-bold text-text-dark group-hover:text-amber-700 transition-colors">
                Contact Inquiries
              </h3>
              <p className="text-sm text-text-muted mt-1 font-body">
                Review messages received from the Contact Us form and follow up with customers directly.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E0D5]/60 flex items-center justify-between text-xs font-semibold text-amber-700">
              <span>View Customer Inquiries</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/orders"
            className="group bg-white p-6 rounded-2xl border border-[#E8E0D5] hover:border-blue-500/50 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-700 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <ShoppingBag size={24} />
              </div>
              <h3 className="text-lg font-heading font-bold text-text-dark group-hover:text-blue-700 transition-colors">
                Stripe Orders
              </h3>
              <p className="text-sm text-text-muted mt-1 font-body">
                Track direct online paid orders, customer shipping addresses, and manage fulfillment.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-[#E8E0D5]/60 flex items-center justify-between text-xs font-semibold text-blue-700">
              <span>View & Manage Orders</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
