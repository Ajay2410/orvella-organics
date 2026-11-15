import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface PendingAction {
  type: 'add_to_cart';
  variantId: string;
  qty: number;
  productName: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  isAuthModalOpen: boolean;
  pendingAction: PendingAction | null;
  openAuthModal: (pendingAction?: PendingAction) => void;
  closeAuthModal: () => void;
  setPendingAction: (action: PendingAction | null) => void;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithPassword: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithPassword: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signInWithMagicLink: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(null);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error.message);
      }
      if (data) {
        setProfile(data);
      }
    } catch (err) {
      console.error('Error in fetchProfile:', err);
    }
  };

  useEffect(() => {
    // 1. Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    // 2. Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = (action?: PendingAction) => {
    if (action) {
      setPendingAction(action);
    }
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const signInWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) {
        return { error };
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithPassword = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (!error && data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
        setIsAuthModalOpen(false);
      }
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUpWithPassword = async (email: string, password: string, fullName: string) => {
    try {
      const trimmedEmail = email.trim();
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { error };
      }

      // If Supabase has "Confirm email" disabled, session is returned immediately!
      if (data.session) {
        setSession(data.session);
        setUser(data.session.user);
        await fetchProfile(data.session.user.id);
        setIsAuthModalOpen(false);
        return { error: null };
      }

      // If no session returned, try direct login immediately
      const loginAttempt = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (loginAttempt.data?.session) {
        setSession(loginAttempt.data.session);
        setUser(loginAttempt.data.session.user);
        await fetchProfile(loginAttempt.data.session.user.id);
        setIsAuthModalOpen(false);
        return { error: null };
      }

      if (loginAttempt.error) {
        return {
          error: new Error(
            loginAttempt.error.message.includes('Email not confirmed')
              ? "Please disable 'Confirm email' in your Supabase Dashboard (Authentication -> Providers -> Email) for instant 1-click signup!"
              : loginAttempt.error.message
          ),
        };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithMagicLink = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isAdmin,
        isAuthModalOpen,
        pendingAction,
        openAuthModal,
        closeAuthModal,
        setPendingAction,
        signInWithGoogle,
        signInWithPassword,
        signUpWithPassword,
        signInWithMagicLink,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
