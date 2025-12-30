import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  needsOnboarding: boolean;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  checkOnboardingStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [onboardingChecked, setOnboardingChecked] = useState(false);

  const checkOnboardingStatus = async () => {
    if (!user) {
      setNeedsOnboarding(false);
      setOnboardingChecked(true);
      return;
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('baby_name')
        .eq('id', user.id)
        .single();

      if (error) {
        // Profile doesn't exist yet - user needs onboarding
        setNeedsOnboarding(true);
        setOnboardingChecked(true);
        return;
      }

      // If baby_name is still the default 'Baby', user needs onboarding
      setNeedsOnboarding(!profile || profile.baby_name === 'Baby');
      setOnboardingChecked(true);
    } catch {
      setNeedsOnboarding(true);
      setOnboardingChecked(true);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setOnboardingChecked(true);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session?.user) {
        setNeedsOnboarding(false);
        setOnboardingChecked(true);
      } else {
        setOnboardingChecked(false); // Reset to trigger new check
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check onboarding status when user changes
  useEffect(() => {
    if (user && !onboardingChecked) {
      checkOnboardingStatus();
    }
  }, [user, onboardingChecked]);

  // Combined loading state - wait for both auth and onboarding check
  const isLoading = loading || (user !== null && !onboardingChecked);

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/onboarding`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const deleteAccount = async () => {
    // Call the database function to delete user data
    const { error: deleteError } = await supabase.rpc('delete_user_account');
    if (deleteError) throw deleteError;
    
    // Sign the user out
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading: isLoading, needsOnboarding, signUp, signIn, signOut, deleteAccount, checkOnboardingStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
