
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { AuthState } from '@/types/auth';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    session: null,
    user: null,
    isLoading: true,
  });
  const navigate = useNavigate();
  const [initialSessionChecked, setInitialSessionChecked] = useState(false);

  useEffect(() => {
    // First get initial session to know our starting point
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setAuthState({
          session,
          user: session?.user ?? null,
          isLoading: false,
        });
        setInitialSessionChecked(true);
      } catch (error) {
        console.error("Error getting session:", error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        setInitialSessionChecked(true);
      }
    };

    getInitialSession();

    // Then set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        const previousUser = authState.user;
        const currentUser = session?.user ?? null;
        
        setAuthState({
          session,
          user: currentUser,
          isLoading: false,
        });
        
        // Only trigger navigation on specific auth events
        if (event === 'SIGNED_IN' && !previousUser) {
          // New sign in, navigate to admin
          setTimeout(() => navigate('/admin'), 0);
        } else if (event === 'SIGNED_OUT') {
          // User signed out, navigate to login
          setTimeout(() => navigate('/login'), 0);
        }
        // For other auth events or when just refreshing the session token, do nothing
      }
    );

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      // Navigation will be handled by the onAuthStateChange listener
    } catch (error: any) {
      toast({
        title: "Erro ao entrar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      
      toast({
        title: "Cadastro realizado",
        description: "Verifique seu email para confirmar seu cadastro.",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao cadastrar",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // Navigation will be handled by the onAuthStateChange listener
    } catch (error: any) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    ...authState,
    signIn,
    signUp,
    signOut,
  };

  // Show nothing until we've checked the initial session
  if (!initialSessionChecked) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
