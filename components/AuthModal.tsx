'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, ShieldCheck, Loader2, ArrowRight, Mail, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [isLogin, setIsLogin] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(300); // 5 minutes TTL

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'otp' && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Необходимо согласие с офертой');
      return;
    }
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
      
      const { error: signInError } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
      });

      if (signInError) throw signInError;

      setStep('otp');
      setTimer(300);
    } catch (err: any) {
      console.error('SMS Error:', err);
      setError(err.message || 'Ошибка отправки SMS. Проверьте номер.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 4) {
      setError('Введите корректный код');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;

      const { data, error: verifyError } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms',
      });

      if (verifyError) throw verifyError;

      onClose();
      setTimeout(() => {
        setStep('phone');
        setPhoneNumber('');
        setOtp('');
        setAgreed(false);
      }, 500);
    } catch (err: any) {
      console.error('OTP Error:', err);
      setError('Неверный код. Попробуйте еще раз.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError('Необходимо согласие с офертой');
      return;
    }
    if (!email || !password) {
      setError('Введите email и пароль');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) throw result.error;

      onClose();
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setAgreed(false);
      }, 500);
    } catch (err: any) {
      console.error('Email Auth Error:', err);
      if (err.message.includes('Invalid login credentials')) {
        setError('Неверный email или пароль');
      } else if (err.message.includes('already registered')) {
        setError('Этот email уже используется');
      } else if (err.message.includes('Password should be at least')) {
        setError('Пароль должен быть не менее 6 символов');
      } else {
        setError(err.message || 'Произошла ошибка. Попробуйте позже.');
      }
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
            {authMethod === 'email'
              ? (isLogin ? 'Вход в систему' : 'Регистрация')
              : (step === 'phone' ? 'Вход по телефону' : 'Подтверждение')}
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {authMethod === 'email'
              ? (isLogin ? 'Введите email и пароль для входа' : 'Создайте аккаунт, используя email')
              : (step === 'phone'
                ? 'Введите номер телефона для входа или регистрации'
                : `Мы отправили SMS с кодом на номер ${phoneNumber}`)}
          </p>

          {step === 'phone' && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => setAuthMethod('email')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  authMethod === 'email' ? 'bg-white shadow-sm text-secondary' : 'text-slate-500 hover:text-secondary'
                }`}
              >
                Email
              </button>
              <button
                type="button"
                onClick={() => setAuthMethod('phone')}
                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                  authMethod === 'phone' ? 'bg-white shadow-sm text-secondary' : 'text-slate-500 hover:text-secondary'
                }`}
              >
                Телефон
              </button>
            </div>
          )}

          {error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
              {error}
            </div>
          )}

          {authMethod === 'email' ? (
            <form onSubmit={handleEmailAuth} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      placeholder="ваша@почта.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary mb-2">Пароль</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                    />
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-600 leading-tight group-hover:text-secondary transition-colors">
                  Я согласен с <a href="#" className="text-primary hover:underline">условиями оферты</a> и политикой конфиденциальности
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed || loading || !email || !password}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Войти' : 'Зарегистрироваться')}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm text-primary font-bold hover:underline"
                >
                  {isLogin ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти'}
                </button>
              </div>
            </form>
          ) : step === 'phone' ? (
            <form onSubmit={handleSendSMS} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Номер телефона</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="tel"
                    placeholder="+996 555 000 000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center mt-0.5">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-slate-300 rounded bg-white peer-checked:bg-primary peer-checked:border-primary transition-colors"></div>
                  <div className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 14 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M1 5L4.5 8.5L13 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
                <span className="text-sm text-slate-600 leading-tight group-hover:text-secondary transition-colors">
                  Я согласен с <a href="#" className="text-primary hover:underline">условиями оферты</a> и политикой конфиденциальности
                </span>
              </label>

              <button
                type="submit"
                disabled={!agreed || loading || !phoneNumber}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Получить код'}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Код из SMS</label>
                <input
                  type="text"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-heading font-bold text-center text-2xl tracking-widest"
                />
                <p className="text-xs text-slate-500 text-center mt-2">
                  Введите 6-значный код из SMS
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 4}
                className="w-full bg-primary text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить'}
              </button>

              <div className="text-center">
                {timer > 0 ? (
                  <p className="text-sm text-slate-500">
                    Запросить код повторно через <span className="font-bold text-secondary">{formatTime(timer)}</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setStep('phone');
                      setOtp('');
                    }}
                    className="text-sm text-primary font-bold hover:underline"
                  >
                    Отправить код еще раз
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
