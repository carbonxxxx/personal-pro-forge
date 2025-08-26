import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string, referralCode?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  cleanupAuthState: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const cleanupAuthState = () => {
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_OUT') {
          cleanupAuthState();
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        // Continue even if this fails
        console.log('Global signout failed:', err);
      }

      // Sign in with email/password
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        let errorMessage = 'حدث خطأ في تسجيل الدخول';
        
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'يرجى تأكيد بريدك الإلكتروني أولاً';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'طلبات كثيرة، يرجى المحاولة لاحقاً';
        }
        
        toast({
          title: "خطأ في تسجيل الدخول",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { error };
      }

      if (data.user) {
        toast({
          title: "مرحباً بك!",
          description: "تم تسجيل الدخول بنجاح",
        });
        
        // Force page redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }

      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        title: "خطأ في تسجيل الدخول",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string, referralCode?: string) => {
    try {
      // Clean up existing state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed:', err);
      }

      const redirectUrl = `${window.location.origin}/dashboard`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName,
            referral_code: referralCode,
          }
        }
      });

      if (error) {
        let errorMessage = 'حدث خطأ في إنشاء الحساب';
        
        if (error.message.includes('User already registered')) {
          errorMessage = 'هذا البريد الإلكتروني مسجل مسبقاً';
        } else if (error.message.includes('Password should be at least')) {
          errorMessage = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = 'البريد الإلكتروني غير صحيح';
        }
        
        toast({
          title: "خطأ في إنشاء الحساب",
          description: errorMessage,
          variant: "destructive",
        });
        
        return { error };
      }

      if (data.user) {
        toast({
          title: "تم إنشاء الحساب!",
          description: "مرحباً بك في برو فورج",
        });
        
        // Force page redirect
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1000);
      }

      return { error: null };
    } catch (error) {
      const err = error as Error;
      toast({
        title: "خطأ في إنشاء الحساب",
        description: err.message,
        variant: "destructive",
      });
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      // Clean up auth state
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout failed:', err);
      }
      
      toast({
        title: "تم تسجيل الخروج",
        description: "نراك قريباً!",
      });
      
      // Force page reload for a clean state
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    } catch (error) {
      console.error('Error signing out:', error);
      // Force redirect anyway
      window.location.href = '/';
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    cleanupAuthState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};