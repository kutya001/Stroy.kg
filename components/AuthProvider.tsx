'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMockUser, createMockUser, updateMockUser } from '@/lib/mockDb';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';

// Mock User type
export interface MockUser {
  uid: string;
  phone: string;
  name?: string;
  role?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: MockUser | null;
  userData: any | null;
  loading: boolean;
  openAuthModal: () => void;
  loginWithPhone: (phone: string, role?: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: any) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  openAuthModal: () => {},
  loginWithPhone: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [userData, setUserData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  useEffect(() => {
    // Check local storage for mock session
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setUserData(parsedUser);
      if (!parsedUser.onboardingCompleted) {
        setIsOnboardingModalOpen(true);
      }
    }
    setLoading(false);
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);

  const loginWithPhone = async (phone: string, role: string = 'consumer', password?: string) => {
    setLoading(true);
    try {
      let existingUser: any = getMockUser(phone);
      
      if (existingUser && existingUser.role === 'admin') {
        if (existingUser.password !== password) {
          throw new Error('Неверный пароль администратора');
        }
      }

      if (!existingUser) {
        existingUser = createMockUser(phone, role);
      }
      
      setUser(existingUser);
      setUserData(existingUser);
      localStorage.setItem('mockUser', JSON.stringify(existingUser));
      
      if (!existingUser.onboardingCompleted) {
        setIsOnboardingModalOpen(true);
      }
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setUserData(null);
    localStorage.removeItem('mockUser');
  };

  const updateProfile = async (data: any) => {
    if (user) {
      const updated = updateMockUser(user.uid, data);
      if (updated) {
        setUser(updated);
        setUserData(updated);
        localStorage.setItem('mockUser', JSON.stringify(updated));
      }
    }
  };

  const handleOnboardingComplete = (updatedData: any) => {
    updateProfile({ ...updatedData, onboardingCompleted: true });
    setIsOnboardingModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ user, userData, loading, openAuthModal, loginWithPhone, logout, updateProfile }}>
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
