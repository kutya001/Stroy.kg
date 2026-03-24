'use client';

import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { X, User, Briefcase, Truck, Loader2 } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  user: any;
  onComplete: (data: any) => void;
}

export default function OnboardingModal({ isOpen, user, onComplete }: OnboardingModalProps) {
  const [role, setRole] = useState<'consumer' | 'developer' | 'supplier' | null>(null);
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inn, setInn] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError('Пожалуйста, выберите вашу роль');
      return;
    }
    if (!name.trim()) {
      setError('Пожалуйста, введите ваше имя');
      return;
    }
    if ((role === 'developer' || role === 'supplier') && !companyName.trim()) {
      setError('Пожалуйста, введите название компании');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const userRef = doc(db, 'users', user.uid);
      const updateData: any = {
        role,
        name: name.trim(),
        onboardingCompleted: true,
      };

      if (role === 'developer' || role === 'supplier') {
        updateData.companyName = companyName.trim();
        updateData.verificationStatus = 'pending';
        if (inn.trim()) {
          updateData.inn = inn.trim();
        }
      }

      await updateDoc(userRef, updateData);
      onComplete(updateData);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Произошла ошибка при сохранении данных. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-semibold">Завершение регистрации</h2>
        </div>

        <div className="p-6">
          <p className="mb-6 text-sm text-gray-600">
            Добро пожаловать! Пожалуйста, расскажите немного о себе, чтобы мы могли настроить платформу для вас.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">Кто вы?</label>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <button
                  type="button"
                  onClick={() => setRole('consumer')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${
                    role === 'consumer'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <User className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Покупатель</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${
                    role === 'developer'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <Briefcase className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Застройщик</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 transition-colors ${
                    role === 'supplier'
                      ? 'border-blue-600 bg-blue-50 text-blue-600'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                  }`}
                >
                  <Truck className="mb-2 h-6 w-6" />
                  <span className="text-sm font-medium">Поставщик</span>
                </button>
              </div>
            </div>

            {/* Common Fields */}
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Ваше ФИО
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="Иванов Иван Иванович"
                  required
                />
              </div>

              {/* Specific Fields for Developer/Supplier */}
              {(role === 'developer' || role === 'supplier') && (
                <>
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                      Название компании
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder='ООО "СтройИнвест"'
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="inn" className="block text-sm font-medium text-gray-700">
                      ИНН (опционально)
                    </label>
                    <input
                      type="text"
                      id="inn"
                      value={inn}
                      onChange={(e) => setInn(e.target.value)}
                      className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="12345678901234"
                    />
                  </div>
                </>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading || !role}
              className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 font-medium text-white transition-colors hover:bg-blue-700 disabled:bg-blue-400"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Завершить регистрацию'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
