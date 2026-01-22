import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  hasPurchased: boolean;
  hasAccess: boolean; // true if admin OR has purchased
  checkingPayment: boolean;
  signUp: (email: string, password: string, firstName?: string, lastName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshPaymentStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [checkingPayment, setCheckingPayment] = useState(false);

  // Computed: user has access if they're admin OR have purchased
  const hasAccess = isAdmin || hasPurchased;

  // Clear all auth state
  const clearAuthState = () => {
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setHasPurchased(false);
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change:', event);
        
        // Handle session errors or invalid sessions
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
          clearAuthState();
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer role and payment check with setTimeout to prevent deadlock
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id);
            checkPaymentStatus();
          }, 0);
        } else {
          setIsAdmin(false);
          setHasPurchased(false);
        }
      }
    );

    // THEN check for existing session and validate it
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      // If there's an error or no session, clear state
      if (error || !session) {
        console.log('No valid session found, clearing auth state');
        clearAuthState();
        setIsLoading(false);
        return;
      }

      // Validate the session by making a lightweight request
      const { error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.log('Session validation failed, signing out:', userError.message);
        await supabase.auth.signOut();
        clearAuthState();
        setIsLoading(false);
        return;
      }
      
      setSession(session);
      setUser(session.user);
      
      await checkAdminRole(session.user.id);
      await checkPaymentStatus();
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!error && data) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  };

  const checkPaymentStatus = async () => {
    setCheckingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-payment');
      
      // Check for auth-related errors and handle them
      if (error) {
        const errorMessage = error.message || '';
        if (errorMessage.includes('Auth') || errorMessage.includes('authenticated') || errorMessage.includes('session')) {
          console.log('Auth error in check-payment, signing out');
          await supabase.auth.signOut();
          clearAuthState();
          return;
        }
      }
      
      // Check if payment was refunded
      if (!error && data?.refunded) {
        console.log('Payment was refunded, signing out');
        await supabase.auth.signOut();
        clearAuthState();
        // Small delay to ensure state is cleared before toast
        setTimeout(() => {
          // Import toast dynamically to avoid circular deps
          import('sonner').then(({ toast }) => {
            toast.error('Your purchase was refunded. Please purchase again to access the course.');
          });
        }, 100);
        return;
      }
      
      if (!error && data?.hasPurchased) {
        setHasPurchased(true);
      } else {
        setHasPurchased(false);
      }
    } catch (err) {
      console.error('Error checking payment status:', err);
      setHasPurchased(false);
    } finally {
      setCheckingPayment(false);
    }
  };

  const refreshPaymentStatus = async () => {
    await checkPaymentStatus();
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
        },
      },
    });
    
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    return { error: error as Error | null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/onboarding`,
      },
    });
    
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
    setHasPurchased(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      isLoading, 
      isAdmin, 
      hasPurchased,
      hasAccess,
      checkingPayment,
      signUp, 
      signIn, 
      signInWithGoogle,
      signOut,
      refreshPaymentStatus,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
