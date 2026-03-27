'use client';

import React, { useState } from 'react';
import { User, Briefcase, Truck, Loader2, Shield } from 'lucide-react';
import type { MockUser, UserRole } from '@/lib/mockDb';

interface OnboardingModalProps {
  isOpen: boolean;
  user: MockUser;
  onComplete: (data: Partial<MockUser>) => void;
}

export default function OnboardingModal({ isOpen, user, onComplete }: OnboardingModalProps) {
  const [role, setRole] = useState<UserRole>(user?.role || 'consumer');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [inn, setInn] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    const updateData: Partial<MockUser> = {
      role,
      name: name.trim(),
      onboardingCompleted: true,
    };

    if (email.trim()) {
      updateData.email = email.trim();
      // In real app, would send email verification
    }

    if (role === 'developer' || role === 'supplier') {
      updateData.companyName = companyName.trim();
      if (inn.trim()) {
        updateData.inn = inn.trim();
      }
    }

    setTimeout(() => {
      onComplete(updateData);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-xl">
        <div className="bg-secondary p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-heading font-bold">Завершение регистрации</h2>
          </div>
          <p className="text-sm text-slate-300">
            Заполните данные ниже. Остальную информацию можно дополнить в профиле.
          </p>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary">Кто вы?</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setRole('consumer')}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                    role === 'consumer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 hover:border-primary/30 text-slate-600'
                  }`}
                >
                  <User className="mb-1.5 h-5 w-5" />
                  <span className="text-[11px] font-medium">Покупатель</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('developer')}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                    role === 'developer'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 hover:border-primary/30 text-slate-600'
                  }`}
                >
                  <Briefcase className="mb-1.5 h-5 w-5" />
                  <span className="text-[11px] font-medium">Застройщик</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('supplier')}
                  className={`flex flex-col items-center justify-center rounded-xl border-2 p-3 transition-all ${
                    role === 'supplier'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 hover:border-primary/30 text-slate-600'
                  }`}
                >
                  <Truck className="mb-1.5 h-5 w-5" />
                  <span className="text-[11px] font-medium">Поставщик</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">ФИО *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="Иванов Иван Иванович"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">
                Электронная почта
                <span className="text-xs text-slate-400 ml-1">(для верификации уровня 1)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                placeholder="email@example.com"
              />
            </div>

            {/* Company fields for supplier/developer */}
            {(role === 'developer' || role === 'supplier') && (
              <>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Название компании *</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder='ОсОО "СтройИнвест"'
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">
                    ИНН
                    <span className="text-xs text-slate-400 ml-1">(для верификации уровня 2)</span>
                  </label>
                  <input
                    type="text"
                    value={inn}
                    onChange={(e) => setInn(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                    placeholder="12345678901234"
                  />
                </div>
              </>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                {error}
              </div>
            )}

            {/* Verification info */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 space-y-1">
              <p className="font-semibold text-slate-600">Уровни верификации:</p>
              <p>Уровень 1 — Подтвержденные телефон + почта</p>
              <p>Уровень 2 — Паспортные данные (ИНН)</p>
              <p>Уровень 3 — Лицензии и сертификаты</p>
              <p className="text-primary font-medium mt-1">Чат и заявки доступны с уровня 2+</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
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
