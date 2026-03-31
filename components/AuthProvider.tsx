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
import { getProfileByPhone } from '@/lib/data';
import { createClient } from '@/lib/supabase/client';
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
    const init = async () => {
      // 1. Restore mock user from localStorage
      const storedUser = localStorage.getItem('mockUser');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setUserData(parsedUser);
          // Re-resolve data-layer UID in case it was stored with a stale ID
          const resolved = await resolveDataLayerUser(parsedUser);
          if (resolved.uid !== parsedUser.uid) {
            setUser(resolved);
            setUserData(resolved);
            localStorage.setItem('mockUser', JSON.stringify(resolved));
          }
          if (!parsedUser.onboardingCompleted) {
            setIsOnboardingModalOpen(true);
          }

          // 2. Ensure Supabase Auth session exists
          await ensureSupabaseSession(resolved.email);
        } catch {
          localStorage.removeItem('mockUser');
        }
      }
      setLoading(false);
    };
    init();
  }, []);

  const isAdminMode = user?.role === 'admin';
  const effectiveUserData: MockUser | null =
    userData && adminViewAs ? { ...userData, role: adminViewAs } : userData;

  const canAccessChat = (effectiveUserData?.verificationLevel ?? 0) >= 2;
  const canAccessRequests = (effectiveUserData?.verificationLevel ?? 0) >= 2;

  const openAuthModal = () => setIsAuthModalOpen(true);

  // Resolve data-layer UID (handles mock UID vs Supabase UUID mismatch)
  const resolveDataLayerUser = async (mockUser: MockUser): Promise<MockUser> => {
    try {
      const dataProfile = await getProfileByPhone(mockUser.phone);
      if (dataProfile && dataProfile.uid !== mockUser.uid) {
        return { ...mockUser, uid: dataProfile.uid };
      }
    } catch { /* fallback to mock user */ }
    return mockUser;
  };

  // Ensure a real Supabase Auth session exists (for RLS policies)
  // Checks if there's an active session; if not, tries to sign in with known email
  const ensureSupabaseSession = async (email?: string, password?: string) => {
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session) return; // already authenticated

      if (!email) return;
      // Try to sign in — for seed/demo users the password is either provided or '123456'
      const passwords = password ? [password] : ['123456', 'admin123'];
      for (const pw of passwords) {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
        if (!error) return;
      }
    } catch { /* silent — mock auth still works */ }
  };

  const loginWithPhone = async (phone: string, role: UserRole = 'consumer') => {
    setLoading(true);
    try {
      let existingUser = getMockUser(phone);
      if (!existingUser) {
        existingUser = createMockUser(phone, role);
      }
      const resolved = await resolveDataLayerUser(existingUser);
      setUser(resolved);
      setUserData(resolved);
      localStorage.setItem('mockUser', JSON.stringify(resolved));

      // Establish Supabase Auth session
      await ensureSupabaseSession(resolved.email);

      if (!resolved.onboardingCompleted) {
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
      const resolved = await resolveDataLayerUser(existingUser);
      setUser(resolved);
      setUserData(resolved);
      localStorage.setItem('mockUser', JSON.stringify(resolved));

      // Establish Supabase Auth session
      await ensureSupabaseSession(email);

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
      const resolved = await resolveDataLayerUser(existingUser);
      setUser(resolved);
      setUserData(resolved);
      localStorage.setItem('mockUser', JSON.stringify(resolved));

      // Establish Supabase Auth session with exact credentials
      const email = resolved.email || identifier;
      await ensureSupabaseSession(email, password);

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
    // Sign out from Supabase Auth as well
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch { /* silent */ }
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
