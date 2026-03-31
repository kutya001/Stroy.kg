'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getMockUser,
  getMockUserByEmail,
  createMockUser,
  updateMockUser,
  authenticateWithPassword,
  type MockUser,
  type UserRole,
} from '@/lib/mockDb';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';

interface AuthContextType {
  user: MockUser | null;
  userData: MockUser | null;
  loading: boolean;
  openAuthModal: () => void;
  loginWithPhone: (phone: string, role?: UserRole) => Promise<void>;
  loginWithEmail: (email: string) => Promise<void>;
  loginWithPassword: (identifier: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<MockUser>) => Promise<void>;
  canAccessChat: boolean;
  canAccessRequests: boolean;
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
  loginWithPassword: async () => {},
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

  const isAdminMode = user?.role === 'admin';
  const effectiveUserData: MockUser | null =
    userData && adminViewAs ? { ...userData, role: adminViewAs } : userData;

  const canAccessChat = (effectiveUserData?.verificationLevel ?? 0) >= 2;
  const canAccessRequests = (effectiveUserData?.verificationLevel ?? 0) >= 2;

  const openAuthModal = () => setIsAuthModalOpen(true);

  const loginWithPhone = async (phone: string, role: UserRole = 'consumer') => {
    setLoading(true);
    try {
      let existingUser = getMockUser(phone);
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

  const loginWithPassword = async (identifier: string, password: string) => {
    setLoading(true);
    try {
      const existingUser = authenticateWithPassword(identifier, password);
      if (!existingUser) {
        throw new Error('Неверный логин или пароль');
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
    if (!user) return;
    const updated = updateMockUser(user.uid, data);
    if (updated) {
      setUser(updated);
      setUserData(updated);
      localStorage.setItem('mockUser', JSON.stringify(updated));
    }
  };

  const handleOnboardingComplete = (updatedData: Partial<MockUser>) => {
    updateProfile({ ...updatedData, onboardingCompleted: true });
    setIsOnboardingModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userData: effectiveUserData,
        loading,
        openAuthModal,
        loginWithPhone,
        loginWithEmail,
        loginWithPassword,
        logout,
        updateProfile,
        canAccessChat,
        canAccessRequests,
        isAdminMode,
        adminViewAs,
        setAdminViewAs,
      }}
    >
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
