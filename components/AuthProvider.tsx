'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';

interface AuthContextType {
  user: User | null;
  userData: any | null;
  loading: boolean;
  openAuthModal: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  openAuthModal: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    const fetchUser = async (sessionUser: User | null) => {
      setUser(sessionUser);
      
      if (sessionUser) {
        // Fetch or create user document
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', sessionUser.id)
          .single();
        
        if (existingUser) {
          setUserData(existingUser);
          if (!existingUser.onboardingCompleted) {
            setIsOnboardingModalOpen(true);
          }
        } else {
          // Create new user profile
          const isAdmin = sessionUser.email === 'kutmanomuraliev012@gmail.com';
          const newUserData = {
            id: sessionUser.id,
            name: sessionUser.phone || sessionUser.email?.split('@')[0] || 'Пользователь',
            email: sessionUser.email || '',
            role: isAdmin ? 'admin' : 'consumer',
            onboardingCompleted: false,
          };

          const { data: insertedUser, error: insertError } = await supabase
            .from('users')
            .insert([newUserData])
            .select()
            .single();

          if (insertedUser) {
            setUserData(insertedUser);
            setIsOnboardingModalOpen(true);
          } else {
            console.error("Error creating user profile", insertError);
          }
        }
        setIsAuthModalOpen(false);
      } else {
        setUserData(null);
      }
      setLoading(false);
    };

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
      fetchUser(session?.user || null);
    });

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      fetchUser(session?.user || null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  const handleOnboardingComplete = (updatedData: any) => {
    setUserData((prev: any) => ({ ...prev, ...updatedData }));
    setIsOnboardingModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, openAuthModal, logout }}>
      {children}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      {user && (
        <OnboardingModal 
          isOpen={isOnboardingModalOpen} 
          user={user} 
          onComplete={handleOnboardingComplete} 
        />
      )}
    </AuthContext.Provider>
  );
}
