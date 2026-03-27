'use client';

import React, { useState } from 'react';
import { X, Phone, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { loginWithPhone } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'code' | 'password'>('phone');
  const [password, setPassword] = useState('');

  const [role, setRole] = useState<'consumer' | 'supplier'>('consumer');

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreed) {
      setError('Необходимо согласие с офертой');
      return;
    }
    if (!phone) {
      setError('Введите номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    // Simulate sending SMS or checking admin
    setTimeout(() => {
      setLoading(false);
      if (isLogin && phone === '+996555000000') {
        setStep('password');
      } else {
        setStep('code');
      }
    }, 1000);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) {
      setError('Введите код из СМС');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock login - accepts any code
      await loginWithPhone(phone, isLogin ? undefined : role);
      onClose();
      setPhone('');
      setCode('');
      setStep('phone');
      setAgreed(false);
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Ошибка авторизации');
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
      // Mock login for admin
      await loginWithPhone(phone, undefined, password);
      onClose();
      setPhone('');
      setPassword('');
      setStep('phone');
      setAgreed(false);
    } catch (err: any) {
      console.error('Auth Error:', err);
      setError(err.message || 'Неверный пароль');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          
          <h2 className="text-2xl font-heading font-bold text-secondary mb-2">
            {isLogin ? 'Вход в систему' : 'Регистрация'}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {step === 'phone' 
              ? 'Введите номер телефона для продолжения' 
              : step === 'password'
              ? 'Введите пароль администратора'
              : 'Введите код, отправленный по СМС'}
          </p>

          {step === 'phone' ? (
            <form onSubmit={handlePhoneSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
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
              </div>

              {!isLogin && (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">Тип аккаунта:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRole('consumer')}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        role === 'consumer' 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Покупатель
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('supplier')}
                      className={`py-2 px-4 rounded-xl border text-sm font-medium transition-colors ${
                        role === 'supplier' 
                          ? 'bg-primary/10 border-primary text-primary' 
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      Поставщик
                    </button>
                  </div>
                </div>
              )}

              {!isLogin && (
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center mt-1">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-5 h-5 border-2 border-slate-300 rounded peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-600 leading-tight">
                    Я согласен с <a href="#" className="text-primary hover:underline font-medium">Пользовательским соглашением</a> и <a href="#" className="text-primary hover:underline font-medium">Политикой конфиденциальности</a>
                  </span>
                </label>
              )}

              <button
                type="submit"
                disabled={loading || (!isLogin && !agreed)}
                className="w-full py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Получить код
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          ) : step === 'password' ? (
            <form onSubmit={handlePasswordSubmit} className="space-y-6">
              {error && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl">
                  {error}
                </div>
              )}

              <div className="space-y-4">
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
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-slate-500 hover:text-primary transition-colors"
                >
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

              <div className="space-y-4">
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Код из СМС (любой)"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-center tracking-widest font-bold"
                    required
                  />
                </div>
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
                    Подтвердить
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
              
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-sm text-slate-500 hover:text-primary transition-colors"
                >
                  Изменить номер
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
                setStep('phone');
              }}
              className="text-sm text-slate-500 hover:text-primary transition-colors"
            >
              {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
