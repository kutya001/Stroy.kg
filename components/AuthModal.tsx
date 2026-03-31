'use client';

import React, { useState } from 'react';
import { X, Phone, ShieldCheck, Loader2, ArrowRight, Mail } from 'lucide-react';
import { useAuth } from './AuthProvider';
import { getMockUser, getMockUserByEmail, VERIFICATION_CONFIG, verifyPhoneOtp, type MockUser, type UserRole } from '@/lib/mockDb';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthStep = 'input' | 'method' | 'password' | 'code';

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithPhone, loginWithEmail } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'phone' | 'email'>('phone');
  const [email, setEmail] = useState('');

  // Role selection (only for new users — shown after OTP)
  const [isNewUser, setIsNewUser] = useState(false);
  const [role, setRole] = useState<UserRole>('consumer');
  const [foundUser, setFoundUser] = useState<MockUser | null>(null);

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authMethod === 'phone' && !phone) {
      setError('Введите номер телефона');
      return;
    }
    if (authMethod === 'email' && !email) {
      setError('Введите адрес электронной почты');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate sending SMS/email code
    setTimeout(() => {
      setLoading(false);
      if (authMethod === 'phone' && phone === '+996555000000') {
        setStep('password'); // Admin path
      } else {
        setStep('code');
      }
    }, 800);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate OTP code
      const identifier = authMethod === 'phone' ? phone : email;
      const isValid = await verifyPhoneOtp(identifier, code);
      if (!isValid) {
        setError(`Неверный код подтверждения${VERIFICATION_CONFIG.useMock ? ` (подсказка: ${VERIFICATION_CONFIG.mockOtpCode})` : ''}`);
        setLoading(false);
        return;
      }

      if (authMethod === 'email') {
        if (!email || !password) {
          setError('Заполните почту и пароль');
          return;
        }
        await loginWithEmail(email, password, isNewUser ? role : undefined);
      } else {
        if (!phone) {
          setError('Введите номер телефона');
          return;
        }
        await loginWithPhone(phone, isNewUser ? role : undefined, password || undefined);
      }
      resetAndClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Ошибка авторизации';
      if (authMethod === 'email' && message.includes('не найден')) {
        setError('Пользователь с такой почтой не найден. Зарегистрируйтесь по номеру телефона.');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Введите пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await loginWithPhone(phone, undefined, password);
      resetAndClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Неверный пароль';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const resetAndClose = () => {
    onClose();
    setEmail('');
    setPassword('');
    setStep('phone');
    setError('');
    setIsNewUser(false);
    setRole('consumer');
    setFoundUser(null);
  };

  if (!isOpen) return null;

  const getSubtitle = () => {
    switch (step) {
      case 'input':
        return 'Введите номер телефона или почту для входа. Новые пользователи будут зарегистрированы автоматически.';
      case 'method':
        return `Выберите способ входа для ${authMethod === 'phone' ? phone : email}`;
      case 'password':
        return `Введите пароль для ${authMethod === 'phone' ? phone : email}`;
      case 'code':
        return isNewUser
          ? `Код подтверждения отправлен на ${authMethod === 'phone' ? phone : email}. Регистрация нового аккаунта.`
          : `Код подтверждения отправлен на ${authMethod === 'phone' ? phone : email}`;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={resetAndClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          
          <h2 className="text-2xl font-heading font-bold text-secondary mb-2">
            Вход / Регистрация
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            {step === 'phone' 
              ? 'Введите номер телефона или почту для входа. Новые пользователи будут зарегистрированы автоматически.'
              : step === 'password'
              ? 'Введите пароль администратора'
              : `Код подтверждения отправлен на ${authMethod === 'phone' ? phone : email}`}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

            {/* Auth method toggle */}
            <div className="flex bg-slate-100 rounded-xl p-1">
              <button
                type="button"
                onClick={() => { setAuthMethod('email'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'email' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500'
                }`}
              >
                <Mail className="w-4 h-4 inline mr-1.5" />Почта
              </button>
              <button
                type="button"
                onClick={() => { setAuthMethod('phone'); setError(''); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  authMethod === 'phone' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500'
                }`}
              >
                <Phone className="w-4 h-4 inline mr-1.5" />Телефон
              </button>
            </div>

            {authMethod === 'email' ? (
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                />
              </div>
            ) : (
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  placeholder="+996 555 000 000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                />
              </div>
            )}

            {/* Password field */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                required
              />
            </div>

            {/* Role selector for registration */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isNewUser}
                  onChange={(e) => setIsNewUser(e.target.checked)}
                  className="rounded border-slate-300 text-primary focus:ring-primary"
                />
                <span className="text-sm text-slate-600">Я новый пользователь</span>
              </label>

                  {isNewUser && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setRole('consumer')}
                        className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                          role === 'consumer' 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        🛒 Покупатель
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('supplier')}
                        className={`py-2.5 px-4 rounded-xl border text-sm font-medium transition-colors ${
                          role === 'supplier' 
                            ? 'bg-primary/10 border-primary text-primary' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        🏗️ Поставщик
                      </button>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Отправить код
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Нажимая «Отправить код», вы соглашаетесь с{' '}
                <a href="#" className="text-primary hover:underline">Пользовательским соглашением</a> и{' '}
                <a href="#" className="text-primary hover:underline">Политикой конфиденциальности</a>
              </p>
            </form>
          ) : step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Войти
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="text-center">
                <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="text-sm text-slate-500 hover:text-primary transition-colors">
                  Изменить номер
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCodeSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="relative">
                <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Введите 6-значный код"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-center tracking-widest font-bold text-lg"
                  required
                />
              </div>

              <p className="text-xs text-slate-400 text-center">
                Код отправлен через СМС / WhatsApp / Email. Введите любой код для демо.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Подтвердить
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="text-center">
                <button type="button" onClick={() => { setStep('phone'); setError(''); }} className="text-sm text-slate-500 hover:text-primary transition-colors">
                  Изменить номер / почту
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
