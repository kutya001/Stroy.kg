'use client';

import React, { useState, useEffect } from 'react';
import { X, Phone, ShieldCheck, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface ChangePhoneModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePhoneModal({ isOpen, onClose }: ChangePhoneModalProps) {
  const { updateProfile } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timer, setTimer] = useState(300);

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
    if (!phoneNumber || phoneNumber.length < 9) {
      setError('Введите корректный номер телефона');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Mock SMS sending
      setTimeout(() => {
        setStep('otp');
        setTimer(300);
        setLoading(false);
      }, 1000);
    } catch (err: any) {
      console.error('SMS Error:', err);
      setError(err.message || 'Ошибка отправки SMS. Проверьте номер.');
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
      // Mock OTP verification
      setTimeout(async () => {
        const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
        await updateProfile({ phone: formattedPhone });
        
        setSuccess('Номер телефона успешно изменен!');
        setTimeout(() => {
          onClose();
          setStep('phone');
          setPhoneNumber('');
          setOtp('');
          setSuccess('');
          setLoading(false);
        }, 2000);
      }, 1000);
    } catch (err: any) {
      console.error('OTP Error:', err);
      setError('Неверный код или номер уже используется.');
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
            Смена номера
          </h2>
          <p className="text-slate-500 text-sm mb-8">
            {step === 'phone' 
              ? 'Введите новый номер телефона. Мы отправим SMS для подтверждения.' 
              : `Мы отправили SMS с кодом на номер ${phoneNumber}`}
          </p>

          {error && (
            <div className="mb-6 p-3 bg-danger/10 border border-danger/20 rounded-xl text-danger text-sm">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm font-medium">
              {success}
            </div>
          )}

          {step === 'phone' ? (
            <form onSubmit={handleSendSMS} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-secondary mb-2">Новый номер телефона</label>
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

              <button
                type="submit"
                disabled={loading || !phoneNumber}
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
