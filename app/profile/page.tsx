'use client';
import Image from 'next/image';
import { Settings, Bell, Shield, CircleHelp, LogOut, ChevronRight, Star, Package, MapPin, Building2, LogIn, Phone, FileText, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import ChangePhoneModal from '@/components/ChangePhoneModal';

export default function ProfilePage() {
  const { user, userData, logout, openAuthModal } = useAuth();
  const [isChangingPhone, setIsChangingPhone] = useState(false);

  if (!user) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-10 h-10 text-slate-400" />
        </div>
        <h1 className="text-2xl font-heading font-bold text-secondary text-center">Войдите в аккаунт</h1>
        <p className="text-slate-500 text-center max-w-sm mb-6">Чтобы просматривать свои заявки, общаться с поставщиками и управлять профилем.</p>
        <button onClick={openAuthModal} className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary-dark transition-colors shadow-lg shadow-primary/20">
          <LogIn className="w-5 h-5" />
          Войти по номеру телефона
        </button>
      </main>
    );
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'supplier': return 'Поставщик';
      case 'developer': return 'Застройщик';
      case 'consumer': return 'Покупатель';
      default: return 'Пользователь';
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <h1 className="text-3xl font-heading font-bold text-secondary">Профиль</h1>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
        {userData?.verificationStatus === 'verified' && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Верифицирован
          </div>
        )}
        <div className="w-24 h-24 rounded-full bg-slate-100 relative overflow-hidden border-4 border-white shadow-md shrink-0">
          {user.photoURL ? (
            <Image src={user.photoURL} alt={user.displayName || 'User'} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
              {user.phoneNumber ? user.phoneNumber.slice(-2) : 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-heading font-bold text-secondary mb-1 truncate">{userData?.name || user.phoneNumber}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
            {(userData?.role === 'developer' || userData?.role === 'supplier') && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span className="truncate">{userData?.companyName || 'Компания не указана'}</span>
              </div>
            )}
            {userData?.inn && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">
                <FileText className="w-3 h-3" />
                <span>ИНН: {userData.inn}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{userData?.region || 'Кыргызстан'}</span>
            </div>
          </div>
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
            {getRoleLabel(userData?.role)}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-heading font-bold text-secondary mb-1">0</div>
          <div className="text-xs text-slate-500 font-medium">Активных заявок</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-heading font-bold text-secondary mb-1">0</div>
          <div className="text-xs text-slate-500 font-medium">Сделок</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-heading font-bold text-secondary mb-1">
            {userData?.rating || '5.0'} <Star className="w-5 h-5 text-accent fill-accent" />
          </div>
          <div className="text-xs text-slate-500 font-medium">Рейтинг</div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Package className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary">Мои заказы и отклики</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        
        {/* Phone Number Change */}
        <div 
          onClick={() => setIsChangingPhone(true)}
          className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium text-secondary block">Номер телефона</span>
              <span className="text-xs text-slate-500">{user.phoneNumber || 'Не указан'}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary">Настройки аккаунта</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Bell className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary">Уведомления</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Shield className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary">Безопасность</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        <div className="p-4 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <CircleHelp className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary">Помощь и поддержка</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Logout */}
      <button onClick={logout} className="w-full p-4 rounded-2xl border border-danger/20 text-danger font-bold flex items-center justify-center gap-2 hover:bg-danger/5 transition-colors">
        <LogOut className="w-5 h-5" />
        Выйти из аккаунта
      </button>

      <ChangePhoneModal isOpen={isChangingPhone} onClose={() => setIsChangingPhone(false)} />
    </main>
  );
}
