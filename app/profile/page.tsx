'use client';
import Image from 'next/image';
import { Settings, Bell, Shield, CircleHelp, LogOut, ChevronRight, Star, Package, MapPin, Building2, LogIn, Phone, FileText, CheckCircle2, Edit3, Calendar, Home, FolderOpen, Award, Briefcase } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import ChangePhoneModal from '@/components/ChangePhoneModal';
import ProfileEditor from '@/components/ProfileEditor';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import { Lock } from 'lucide-react';

export default function ProfilePage() {
  const { user, userData, logout, openAuthModal } = useAuth();
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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

  const handleProfileSave = (updatedData: any) => {
    window.location.reload();
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-heading font-bold text-secondary">Профиль</h1>
        <button onClick={() => setIsEditingProfile(true)} className="flex items-center gap-2 text-primary hover:text-primary-dark font-medium transition-colors bg-primary/10 px-4 py-2 rounded-xl">
          <Edit3 className="w-4 h-4" />
          Редактировать
        </button>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6 relative overflow-hidden">
        {userData?.verificationStatus === 'verified' && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Верифицирован
          </div>
        )}
        {userData?.verificationStatus === 'pending' && (
          <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <CircleHelp className="w-3 h-3" /> На модерации
          </div>
        )}
        {userData?.verificationStatus === 'rejected' && (
          <div className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
            <Shield className="w-3 h-3" /> Отклонен
          </div>
        )}
        <div className="w-24 h-24 rounded-full bg-slate-100 relative overflow-hidden border-4 border-white shadow-md shrink-0">
          {userData.photoURL ? (
            <Image src={userData.photoURL} alt={userData.name || 'User'} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
              {user.phone ? user.phone.slice(-2) : 'U'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-heading font-bold text-secondary mb-1 truncate">{userData?.name || user.phone}</h2>
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
          <div className="flex items-center gap-2">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
              {getRoleLabel(userData?.role)}
            </span>
            {userData?.subscription && (
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full">
                {userData.subscription} Подписка
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Info Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-bold text-secondary border-b pb-2">Детальная информация</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {userData?.role === 'consumer' && (
            <>
              <div>
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Calendar className="w-4 h-4" /> Дата рождения</div>
                <div className="font-medium">{userData?.dateOfBirth || 'Не указана'}</div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><Home className="w-4 h-4" /> Тип жилья</div>
                <div className="font-medium">{userData?.housingType || 'Не указан'}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-2"><MapPin className="w-4 h-4" /> Адрес</div>
                <div className="font-medium">{userData?.address || 'Не указан'}</div>
              </div>
            </>
          )}

          {userData?.role === 'supplier' && (
            <div className="sm:col-span-2">
              <div className="text-sm text-slate-500 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4" /> Категории деятельности</div>
              <div className="flex flex-wrap gap-2">
                {userData?.categories?.length > 0 ? (
                  userData.categories.map((cat: string) => (
                    <span key={cat} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium">{cat}</span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Категории не выбраны</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Files Section */}
        {(userData?.role === 'developer' || userData?.role === 'supplier') && (
          <div className="space-y-4 pt-4 border-t">
            {userData?.role === 'developer' && (
              <>
                <div>
                  <div className="text-sm text-slate-500 mb-2 flex items-center gap-2"><FileText className="w-4 h-4" /> Документы компании</div>
                  {userData?.documents?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {userData.documents.map((doc: any, i: number) => (
                        <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <FileText className="w-4 h-4" /> {doc.name}
                        </a>
                      ))}
                    </div>
                  ) : <span className="text-slate-400 italic text-sm">Нет загруженных документов</span>}
                </div>
                <div>
                  <div className="text-sm text-slate-500 mb-2 flex items-center gap-2"><FolderOpen className="w-4 h-4" /> Проекты</div>
                  {userData?.projects?.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {userData.projects.map((proj: any, i: number) => (
                        <a key={i} href={proj.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          <FolderOpen className="w-4 h-4" /> {proj.name}
                        </a>
                      ))}
                    </div>
                  ) : <span className="text-slate-400 italic text-sm">Нет загруженных проектов</span>}
                </div>
              </>
            )}

            {userData?.role === 'supplier' && (
              <div>
                <div className="text-sm text-slate-500 mb-2 flex items-center gap-2"><Award className="w-4 h-4" /> Сертификаты</div>
                {userData?.certificates?.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {userData.certificates.map((cert: any, i: number) => (
                      <a key={i} href={cert.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                        <Award className="w-4 h-4" /> {cert.name}
                      </a>
                    ))}
                  </div>
                ) : <span className="text-slate-400 italic text-sm">Нет загруженных сертификатов</span>}
              </div>
            )}
          </div>
        )}
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
              <span className="text-xs text-slate-500">{user.phone || 'Не указан'}</span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>

        {/* Password Change (for users signed in with email) */}
        {(userData?.role === 'admin' || user.email) && (
          <div
            onClick={() => setIsChangingPassword(true)}
            className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                <Lock className="w-5 h-5" />
              </div>
              <span className="font-medium text-secondary">Изменить пароль</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>
        )}

        {/* Admin Dashboard */}
        {userData?.role === 'admin' && (
          <a href="/admin" className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Shield className="w-5 h-5" />
              </div>
              <span className="font-medium text-secondary">Панель администратора</span>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </a>
        )}

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
      <ChangePasswordModal isOpen={isChangingPassword} onClose={() => setIsChangingPassword(false)} />
      
      {isEditingProfile && (
        <ProfileEditor 
          user={user} 
          userData={userData} 
          onClose={() => setIsEditingProfile(false)} 
          onSave={handleProfileSave} 
        />
      )}
    </main>
  );
}
