'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
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
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Fetch or create user document
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          if (!data.onboardingCompleted) {
            setIsOnboardingModalOpen(true);
          }
        } else {
          // Create new user profile with onboardingCompleted: false
          const newUserData = {
            uid: currentUser.uid,
            name: currentUser.phoneNumber || 'Пользователь',
            email: '',
            role: 'consumer', // Default role, will be updated in onboarding
            onboardingCompleted: false,
            createdAt: serverTimestamp(),
          };
          await setDoc(userRef, newUserData);
          setUserData(newUserData);
          setIsOnboardingModalOpen(true);
        }
        setIsAuthModalOpen(false); // Close modal on successful login
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openAuthModal = () => setIsAuthModalOpen(true);

  const logout = async () => {
    try {
      await signOut(auth);
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
