import React from 'react';
import { Navigate, useLocation, Link } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading, isConfigured } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isConfigured) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={48} className="text-amber-600 mb-4" />
        <h2 className="text-2xl font-bold font-heading text-text-dark mb-2">Backend Not Connected</h2>
        <p className="text-text-muted max-w-md mb-6">
          Please add your <code className="bg-bg-cream px-2 py-1 rounded">VITE_SUPABASE_URL</code> and{' '}
          <code className="bg-bg-cream px-2 py-1 rounded">VITE_SUPABASE_ANON_KEY</code> to <code className="bg-bg-cream px-2 py-1 rounded">.env.local</code> to access the admin portal.
        </p>
        <Link to="/" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
          Back to Home
        </Link>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold font-heading text-text-dark mb-2">Access Restricted</h2>
        <p className="text-text-muted max-w-md mb-6">
          You are signed in as <strong>{user.email}</strong>, but this account does not have administrator privileges.
        </p>
        <div className="flex gap-4">
          <Link to="/" className="px-5 py-2.5 bg-primary text-white rounded-lg font-medium hover:bg-primary/90">
            Return to Store
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
