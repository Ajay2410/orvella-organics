import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    signInWithGoogle,
    signInWithPassword,
    signUpWithPassword,
    pendingAction,
  } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setErrorMessage('Please enter your full name.');
          setLoading(false);
          return;
        }
        const { error } = await signUpWithPassword(email, password, fullName);
        if (error) {
          setErrorMessage(error.message);
        }
      } else {
        const { error } = await signInWithPassword(email, password);
        if (error) {
          setErrorMessage(error.message);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMessage('');
    setLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      const msg = error.message.toLowerCase().includes('not enabled') || error.message.toLowerCase().includes('unsupported')
        ? 'Google provider is not enabled in your Supabase project. Please sign up or log in with Email & Password below.'
        : error.message;
      setErrorMessage(msg);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-[20px] shadow-2xl border border-[#E8E0D5] p-6 sm:p-8 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-1.5 rounded-full text-text-muted hover:text-text-dark hover:bg-bg-cream transition-colors"
          aria-label="Close dialog"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full uppercase tracking-wider mb-2">
            Orvella Organics
          </span>
          <h2 className="font-heading font-bold text-2xl sm:text-3xl text-text-dark">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          {pendingAction ? (
            <p className="mt-2 text-sm text-primary font-medium bg-primary/5 p-2 rounded-[8px] border border-primary/20">
              Sign in to add <strong>{pendingAction.productName}</strong> directly to your cart!
            </p>
          ) : (
            <p className="font-body text-sm text-text-muted mt-1.5">
              {mode === 'signin'
                ? 'Sign in to access your orders, saved addresses and cart.'
                : 'Join us for pure, dehydrated fruit snacks and wellness superfoods.'}
            </p>
          )}
        </div>

        {/* Google OAuth Button */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white border border-[#D8CEC2] rounded-[12px] font-body text-sm font-semibold text-text-dark hover:bg-bg-cream hover:border-primary transition-all shadow-sm disabled:opacity-50"
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path
              fill="#4285F4"
              d="M17.64 9.2045c0-.6381-.0573-1.2518-.1636-1.8409H9v3.4814h4.8436c-.2086 1.125-.8427 2.0782-1.7959 2.7164v2.2581h2.9086c1.7018-1.5668 2.6837-3.874 2.6837-6.615z"
            />
            <path
              fill="#34A853"
              d="M9 18c2.43 0 4.4673-.8059 5.9564-2.1805l-2.9086-2.2581c-.8059.54-1.8368.859-3.0478.859-2.344 0-4.3282-1.5831-5.036-3.7104H.9573v2.3318C2.4382 15.9832 5.4818 18 9 18z"
            />
            <path
              fill="#FBBC05"
              d="M3.964 10.71c-.18-.54-.2823-1.1168-.2823-1.71s.1023-1.17.2823-1.71V4.9582H.9573C.3477 6.1732 0 7.5477 0 9s.3477 2.8268.9573 4.0418L3.964 10.71z"
            />
            <path
              fill="#EA4335"
              d="M9 3.5795c1.3214 0 2.5077.4541 3.4405 1.346l2.5813-2.5814C13.4632.8918 11.426 0 9 0 5.4818 0 2.4382 2.0168.9573 4.9582L3.964 7.29C4.6718 5.1627 6.656 3.5795 9 3.5795z"
            />
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-[#E8E0D5]" />
          <span className="absolute bg-white px-3 font-body text-xs text-text-muted">or with email</span>
        </div>

        {/* Error or Success feedback */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-[10px] text-xs font-body">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-primary rounded-[10px] text-xs font-body">
            {successMessage}
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-text-dark mb-1">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-3 text-text-muted" />
                <input
                  type="text"
                  required
                  placeholder="Kishan Gondaliya"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 bg-bg-cream/40 border border-[#D8CEC2] rounded-[10px] text-sm text-text-dark placeholder:text-text-muted/60 focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-text-dark mb-1">Email Address</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-3 text-text-muted" />
              <input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-bg-cream/40 border border-[#D8CEC2] rounded-[10px] text-sm text-text-dark placeholder:text-text-muted/60 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-dark mb-1">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-3 text-text-muted" />
              <input
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 bg-bg-cream/40 border border-[#D8CEC2] rounded-[10px] text-sm text-text-dark placeholder:text-text-muted/60 focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-primary text-white font-body font-semibold text-sm rounded-[12px] hover:bg-primary-dark transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span>{mode === 'signin' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="mt-5 text-center text-xs font-body text-text-muted">
          {mode === 'signin' ? (
            <>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setErrorMessage('');
                }}
                className="font-bold text-primary hover:underline"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setErrorMessage('');
                }}
                className="font-bold text-primary hover:underline"
              >
                Sign in
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
