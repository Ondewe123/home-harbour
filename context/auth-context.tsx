'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { User, Household, AuthContextType } from '@/lib/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [household, setHousehold] = useState<Household | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();

        if (data.session?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', data.session.user.id)
            .single();

          if (userData) {
            setUser(userData as User);

            const { data: householdData } = await supabase
              .from('households')
              .select('*')
              .eq('id', userData.household_id)
              .single();

            if (householdData) {
              setHousehold(householdData as Household);
            }
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setHousehold(null);
      } else if (session?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('auth_id', session.user.id)
          .single();

        if (userData) {
          setUser(userData as User);

          const { data: householdData } = await supabase
            .from('households')
            .select('*')
            .eq('id', userData.household_id)
            .single();

          if (householdData) {
            setHousehold(householdData as Household);
          }
        }
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setHousehold(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        household,
        isLoading,
        isSignedIn: !!user,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
