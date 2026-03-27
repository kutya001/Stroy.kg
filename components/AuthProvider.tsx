'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getMockUser, getMockUserByEmail, createMockUser, updateMockUser, type MockUser, type UserRole, type VerificationLevel } from '@/lib/mockDb';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';

interface AuthContextType {
  user: MockUser | null;
  userData: MockUser | null;
  loading: boolean;
  openAuthModal: () => void;
  loginWithPhone: (phone: string, role?: UserRole, password?: string) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<MockUser>) => Promise<void>;
  canAccessChat: boolean;
  canAccessRequests: boolean;
  // Admin role switching
  isAdminMode: boolean;
  adminViewAs: UserRole | null;
  setAdminViewAs: (role: UserRole | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  openAuthModal: () => {},
  loginWithPhone: async () => {},
  loginWithEmail: async () => {},
  logout: async () => {},
  updateProfile: async () => {},
  canAccessChat: false,
  canAccessRequests: false,
  isAdminMode: false,
  adminViewAs: null,
  setAdminViewAs: () => {},
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<MockUser | null>(null);
  const [userData, setUserData] = useState<MockUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);
  const [adminViewAs, setAdminViewAs] = useState<UserRole | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setUserData(parsedUser);
        if (!parsedUser.onboardingCompleted) {
          setIsOnboardingModalOpen(true);
        }
      } catch {
        localStorage.removeItem('mockUser');
      }
    }
    setLoading(false);
  }, []);

  // Admin role switching: override userData.role when viewing as another role
  const isAdminMode = user?.role === 'admin';
  const effectiveUserData: MockUser | null = userData && adminViewAs
    ? { ...userData, role: adminViewAs }
    : userData;

  // Access gates — chat and requests require verification level >= 2
  const canAccessChat = (effectiveUserData?.verificationLevel ?? 0) >= 2;
  const canAccessRequests = (effectiveUserData?.verificationLevel ?? 0) >= 2;

  const openAuthModal = () => setIsAuthModalOpen(true);

  const loginWithPhone = async (phone: string, role: UserRole = 'consumer', password?: string) => {
    setLoading(true);
    try {
      let existingUser = getMockUser(phone);
      
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

  const loginWithEmail = async (email: string) => {
    setLoading(true);
    try {
      const existingUser = getMockUserByEmail(email);
      if (!existingUser) {
        throw new Error('Пользователь с такой почтой не найден');
      }
      setUser(existingUser);
      setUserData(existingUser);
      localStorage.setItem('mockUser', JSON.stringify(existingUser));
      setIsAuthModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    setUserData(null);
    setAdminViewAs(null);
    localStorage.removeItem('mockUser');
  };

  const updateProfile = async (data: Partial<MockUser>) => {
    if (user) {
      const updated = updateMockUser(user.uid, data);
      if (updated) {
        setUser(updated);
        setUserData(updated);
        localStorage.setItem('mockUser', JSON.stringify(updated));
      }
    }
  };

  const handleOnboardingComplete = (updatedData: Partial<MockUser>) => {
    updateProfile({ ...updatedData, onboardingCompleted: true });
    setIsOnboardingModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{ user, userData: effectiveUserData, loading, openAuthModal, loginWithPhone, loginWithEmail, logout, updateProfile, canAccessChat, canAccessRequests, isAdminMode, adminViewAs, setAdminViewAs }}>
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
