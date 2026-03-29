'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMockUser, getMockUserByEmail, createMockUser, updateMockUser, type MockUser, type UserRole, type VerificationLevel } from '@/lib/mockDb';
import { createClient } from '@/lib/supabase/client';
import { getProfile, updateProfile as updateProfileQuery, getProfileByPhone, getProfileByEmail } from '@/lib/queries';
import AuthModal from './AuthModal';
import OnboardingModal from './OnboardingModal';

// Режим работы: Supabase или mock
const USE_SUPABASE = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

interface AuthContextType {
  user: MockUser | null;
  userData: MockUser | null;
  loading: boolean;
  openAuthModal: () => void;
  loginWithEmail: (email: string, password: string, role?: UserRole) => Promise<void>;
  loginWithPhone: (phone: string, role?: UserRole, password?: string) => Promise<void>;
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
  loginWithEmail: async () => {},
  loginWithPhone: async () => {},
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

  // Инициализация сессии
  useEffect(() => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      supabase.auth.getUser().then(async ({ data: { user: authUser } }) => {
        if (authUser) {
          const profile = await getProfile(supabase, authUser.id);
          if (profile) {
            setUser(profile);
            setUserData(profile);
            if (!profile.onboardingCompleted) {
              setIsOnboardingModalOpen(true);
            }
          }
        }
        setLoading(false);
      });

      // Слушаем изменения сессии (логин/логаут)
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await getProfile(supabase, session.user.id);
          if (profile) {
            setUser(profile);
            setUserData(profile);
            if (!profile.onboardingCompleted) {
              setIsOnboardingModalOpen(true);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserData(null);
          setAdminViewAs(null);
        }
      });

      return () => { subscription.unsubscribe(); };
    } else {
      // Mock-режим (как раньше)
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
    }
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

  const loginWithEmail = async (email: string, password: string, role?: UserRole) => {
    setLoading(true);
    try {
      if (USE_SUPABASE) {
        const supabase = createClient();
        // Пробуем войти по email+пароль
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          // Если пользователь не найден — регистрируем
          if (error.message.includes('Invalid login credentials')) {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email,
              password,
              options: { data: { role: role || 'consumer' } },
            });
            if (signUpError) throw new Error(signUpError.message);
            // Если email не подтверждён — сессия не создаётся
            if (signUpData.user && !signUpData.session) {
              throw new Error('Аккаунт создан! Проверьте почту для подтверждения.');
            }
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Email не подтверждён. Проверьте вашу почту.');
          } else {
            throw new Error(error.message);
          }
        }
        // Если вход успешен — сразу загружаем профиль, не ждём onAuthStateChange
        if (data?.user) {
          const profile = await getProfile(supabase, data.user.id);
          if (profile) {
            setUser(profile);
            setUserData(profile);
            if (!profile.onboardingCompleted) {
              setIsOnboardingModalOpen(true);
            }
          }
        }
        setIsAuthModalOpen(false);
      } else {
        // Mock-режим: ищем по email
        let existingUser = getMockUserByEmail(email);
        if (existingUser) {
          // Проверяем пароль (если есть)
          if (existingUser.password && existingUser.password !== password) {
            throw new Error('Неверный пароль');
          }
        } else {
          // Пользователь не найден — ищем по телефону тоже нет, создаём нового
          throw new Error('Пользователь не найден. Зарегистрируйтесь по номеру телефона.');
        }
        setUser(existingUser);
        setUserData(existingUser);
        localStorage.setItem('mockUser', JSON.stringify(existingUser));
        if (!existingUser.onboardingCompleted) {
          setIsOnboardingModalOpen(true);
        }
        setIsAuthModalOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const loginWithPhone = async (phone: string, role: UserRole = 'consumer', password?: string) => {
    setLoading(true);
    try {
      if (USE_SUPABASE) {
        // Телефонная авторизация — заглушка (не поддерживается в текущей конфигурации)
        throw new Error('Вход по телефону временно недоступен. Используйте почту и пароль.');
      } else {
        let existingUser = getMockUser(phone);
        if (existingUser && existingUser.password && existingUser.password !== password) {
          throw new Error('Неверный пароль');
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
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (USE_SUPABASE) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setUserData(null);
    setAdminViewAs(null);
    localStorage.removeItem('mockUser');
  };

  const updateProfile = async (data: Partial<MockUser>) => {
    if (!user) return;
    if (USE_SUPABASE) {
      const supabase = createClient();
      const updated = await updateProfileQuery(supabase, user.uid, data);
      if (updated) {
        setUser(updated);
        setUserData(updated);
      }
    } else {
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
