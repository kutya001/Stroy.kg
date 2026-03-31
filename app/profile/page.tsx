'use client';
import { Settings, Bell, Shield, CircleHelp, LogOut, ChevronRight, Star, Package, MapPin, Building2, LogIn, Phone, FileText, CheckCircle2, Edit3, Mail, BadgeCheck, Crown, CreditCard, ArrowUpRight, BarChart3, Loader2, X, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';
import { useState } from 'react';
import { getVerificationLabel, getVerificationColor, subscriptionPlans, type VerificationLevel, VERIFICATION_CONFIG, sendEmailVerification, verifyEmail, submitInnVerification, submitLicenseVerification } from '@/lib/mockDb';
import ChangePhoneModal from '@/components/ChangePhoneModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import ProfileEditor from '@/components/ProfileEditor';

type VerifyStep = null | 'email' | 'email-code' | 'inn' | 'license';

export default function ProfilePage() {
  const { user, userData, logout, openAuthModal, updateProfile } = useAuth();
  const [isChangingPhone, setIsChangingPhone] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  // Verification flow state
  const [verifyStep, setVerifyStep] = useState<VerifyStep>(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [innInput, setInnInput] = useState('');
  const [licenseInput, setLicenseInput] = useState('');

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
      case 'admin': return 'Администратор';
      default: return 'Пользователь';
    }
  };

  const handleProfileSave = (updatedData: any) => {
    window.location.reload();
  };

  // Verification handlers
  const startEmailVerification = async () => {
    if (!emailInput.includes('@')) { setVerifyError('Введите корректный email'); return; }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      await sendEmailVerification(emailInput);
      await updateProfile({ email: emailInput });
      setVerifyStep('email-code');
    } catch { setVerifyError('Ошибка отправки'); }
    setVerifyLoading(false);
  };

  const confirmEmailCode = async () => {
    setVerifyLoading(true);
    setVerifyError('');
    try {
      const ok = await verifyEmail(emailInput, codeInput);
      if (!ok) { setVerifyError(`Неверный код${VERIFICATION_CONFIG.useMock ? ` (подсказка: ${VERIFICATION_CONFIG.mockOtpCode})` : ''}`); setVerifyLoading(false); return; }
      await updateProfile({ emailVerified: true });
      setVerifyStep(null); setCodeInput('');
    } catch { setVerifyError('Ошибка верификации'); }
    setVerifyLoading(false);
  };

  const confirmInn = async () => {
    if (innInput.length < 10) { setVerifyError('ИНН должен содержать минимум 10 цифр'); return; }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      await submitInnVerification(user.uid, innInput);
      await updateProfile({ inn: innInput });
      setVerifyStep(null); setInnInput('');
    } catch { setVerifyError('Ошибка проверки ИНН'); }
    setVerifyLoading(false);
  };

  const confirmLicense = async () => {
    if (!licenseInput.trim()) { setVerifyError('Введите номер лицензии'); return; }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      await submitLicenseVerification(user.uid, licenseInput);
      await updateProfile({ licenses: [...(userData?.licenses || []), licenseInput] });
      setVerifyStep(null); setLicenseInput('');
    } catch { setVerifyError('Ошибка проверки лицензии'); }
    setVerifyLoading(false);
  };

  const verLevel = (userData?.verificationLevel ?? 0) as VerificationLevel;
  const currentPlan = subscriptionPlans.find(p => p.tier === (userData?.subscription || 'FREE'));
  const isSupplier = userData?.role === 'supplier' || userData?.role === 'developer';

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
        <div className={`absolute top-0 right-0 text-white text-xs font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1 ${verLevel >= 2 ? 'bg-green-500' : verLevel === 1 ? 'bg-amber-500' : 'bg-slate-400'}`}>
          <BadgeCheck className="w-3 h-3" /> Уровень {verLevel}
        </div>
        <div className="w-24 h-24 rounded-full bg-slate-100 relative overflow-hidden border-4 border-white shadow-md shrink-0">
          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-bold text-2xl">
            {user.name ? user.name.charAt(0).toUpperCase() : user.phone?.slice(-2) || 'U'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-heading font-bold text-secondary mb-1 truncate">{userData?.name || user.phone}</h2>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-3">
            {isSupplier && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span className="truncate">{userData?.companyName || 'Компания не указана'}</span>
              </div>
            )}
            {userData?.email && (
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span className="truncate">{userData.email}</span>
                {userData.emailVerified && <CheckCircle2 className="w-3 h-3 text-green-500" />}
              </div>
            )}
            {userData?.inn && (
              <div className="flex items-center gap-1 bg-slate-100 px-2 py-0.5 rounded text-xs">
                <FileText className="w-3 h-3" />
                <span>ИНН: {userData.inn}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider rounded-full">
              {getRoleLabel(userData?.role || 'consumer')}
            </span>
            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${getVerificationColor(verLevel)}`}>
              {getVerificationLabel(verLevel)}
            </span>
            {isSupplier && (
              <span className="inline-block px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-full">
                <Crown className="w-3 h-3 inline mr-1" />{currentPlan?.name || 'Бесплатный'}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification Progress */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-secondary flex items-center gap-2"><Shield className="w-5 h-5 text-primary" /> Верификация</h3>
          {VERIFICATION_CONFIG.useMock && (
            <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold">ТЕСТОВЫЙ РЕЖИМ</span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {[0, 1, 2, 3].map(lvl => (
            <div key={lvl} className={`flex-1 h-2 rounded-full transition-all ${lvl <= verLevel ? 'bg-primary' : 'bg-slate-200'}`} />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className={`p-3 rounded-xl border ${verLevel >= 0 ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'}`}>
            <Phone className="w-4 h-4 mb-1" /> <span className="font-bold">Ур. 0</span>
            <p className="text-slate-500 mt-1">Регистрация</p>
            {verLevel >= 0 && <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" />}
          </div>
          <div className={`p-3 rounded-xl border ${verLevel >= 1 ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'}`}>
            <Mail className="w-4 h-4 mb-1" /> <span className="font-bold">Ур. 1</span>
            <p className="text-slate-500 mt-1">Телефон + Email</p>
            {verLevel >= 1 ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" /> : (
              <button onClick={() => { setVerifyStep('email'); setVerifyError(''); setEmailInput(userData?.email || ''); }} className="text-primary font-bold mt-1 hover:underline">Подтвердить</button>
            )}
          </div>
          <div className={`p-3 rounded-xl border ${verLevel >= 2 ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'}`}>
            <FileText className="w-4 h-4 mb-1" /> <span className="font-bold">Ур. 2</span>
            <p className="text-slate-500 mt-1">ИНН / Паспорт</p>
            {verLevel >= 2 ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" /> : (
              <button onClick={() => { setVerifyStep('inn'); setVerifyError(''); setInnInput(userData?.inn || ''); }} className="text-primary font-bold mt-1 hover:underline">Заполнить</button>
            )}
          </div>
          <div className={`p-3 rounded-xl border ${verLevel >= 3 ? 'bg-primary/5 border-primary/20' : 'bg-slate-50 border-slate-100'}`}>
            <BadgeCheck className="w-4 h-4 mb-1" /> <span className="font-bold">Ур. 3</span>
            <p className="text-slate-500 mt-1">Лицензии</p>
            {verLevel >= 3 ? <CheckCircle2 className="w-4 h-4 text-green-500 mt-1" /> : (
              <button onClick={() => { setVerifyStep('license'); setVerifyError(''); }} className="text-primary font-bold mt-1 hover:underline">Заполнить</button>
            )}
          </div>
        </div>
        {verLevel < 2 && (
          <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-xl">
            Для доступа к чатам и заявкам необходим уровень верификации 2 или выше.
          </p>
        )}
      </div>

      {/* Verification Modal */}
      {verifyStep && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl relative">
            <button onClick={() => setVerifyStep(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            
            {verifyStep === 'email' && (
              <>
                <h4 className="font-heading font-bold text-lg text-secondary">Подтверждение Email</h4>
                <p className="text-sm text-slate-500">Введите вашу почту. Мы отправим код подтверждения.</p>
                {VERIFICATION_CONFIG.useMock && (
                  <p className="text-xs bg-blue-50 text-blue-600 p-2 rounded-lg">Тестовый режим: код подтверждения — <strong>{VERIFICATION_CONFIG.mockOtpCode}</strong></p>
                )}
                <input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="your@email.com" className="w-full h-12 px-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                {verifyError && <p className="text-danger text-sm">{verifyError}</p>}
                <button onClick={startEmailVerification} disabled={verifyLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Отправить код'}
                </button>
              </>
            )}

            {verifyStep === 'email-code' && (
              <>
                <h4 className="font-heading font-bold text-lg text-secondary">Введите код</h4>
                <p className="text-sm text-slate-500">Код отправлен на <strong>{emailInput}</strong></p>
                {VERIFICATION_CONFIG.useMock && (
                  <p className="text-xs bg-blue-50 text-blue-600 p-2 rounded-lg">Тестовый режим: введите <strong>{VERIFICATION_CONFIG.mockOtpCode}</strong></p>
                )}
                <input type="text" value={codeInput} onChange={e => setCodeInput(e.target.value)} placeholder="Код подтверждения" maxLength={6} className="w-full h-12 px-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-center text-xl tracking-widest" />
                {verifyError && <p className="text-danger text-sm">{verifyError}</p>}
                <button onClick={confirmEmailCode} disabled={verifyLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить'}
                </button>
              </>
            )}

            {verifyStep === 'inn' && (
              <>
                <h4 className="font-heading font-bold text-lg text-secondary">Верификация ИНН</h4>
                <p className="text-sm text-slate-500">Введите ваш ИНН для подтверждения личности.</p>
                {VERIFICATION_CONFIG.useMock && (
                  <p className="text-xs bg-blue-50 text-blue-600 p-2 rounded-lg">Тестовый режим: любой ИНН от 10 цифр будет принят</p>
                )}
                <input type="text" value={innInput} onChange={e => setInnInput(e.target.value.replace(/\D/g, ''))} placeholder="Введите ИНН (от 10 цифр)" maxLength={14} className="w-full h-12 px-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                {verifyError && <p className="text-danger text-sm">{verifyError}</p>}
                <button onClick={confirmInn} disabled={verifyLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить ИНН'}
                </button>
              </>
            )}

            {verifyStep === 'license' && (
              <>
                <h4 className="font-heading font-bold text-lg text-secondary">Верификация лицензии</h4>
                <p className="text-sm text-slate-500">Введите номер лицензии или сертификата СРО.</p>
                {VERIFICATION_CONFIG.useMock && (
                  <p className="text-xs bg-blue-50 text-blue-600 p-2 rounded-lg">Тестовый режим: любой номер будет принят</p>
                )}
                <input type="text" value={licenseInput} onChange={e => setLicenseInput(e.target.value)} placeholder="Например: СРО-12345" className="w-full h-12 px-4 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary/20" />
                {verifyError && <p className="text-danger text-sm">{verifyError}</p>}
                <button onClick={confirmLicense} disabled={verifyLoading} className="w-full h-12 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {verifyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Подтвердить лицензию'}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Subscription Card (for suppliers) */}
      {isSupplier && (
        <div className="bg-gradient-to-br from-secondary to-secondary/80 rounded-3xl p-6 text-white shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-heading font-bold text-lg flex items-center gap-2"><CreditCard className="w-5 h-5" /> Подписка</h3>
            <span className="bg-accent text-secondary px-3 py-1 rounded-full text-xs font-bold">{currentPlan?.name}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <div className="text-sm text-slate-300">Стоимость</div>
              <div className="text-xl font-bold">{currentPlan?.price === 0 ? 'Бесплатно' : `${currentPlan?.price.toLocaleString()} сом/мес`}</div>
            </div>
            <div>
              <div className="text-sm text-slate-300">Лимит товаров</div>
              <div className="text-xl font-bold">{currentPlan?.maxProducts === Infinity ? '∞' : currentPlan?.maxProducts}</div>
            </div>
          </div>
          <ul className="text-sm text-slate-300 space-y-1 mb-4">
            {currentPlan?.features.map((f, i) => <li key={i} className="flex items-center gap-2"><CheckCircle2 className="w-3 h-3 text-accent" />{f}</li>)}
          </ul>
          {currentPlan?.tier !== 'ENTERPRISE' && (
            <button className="w-full py-3 bg-accent text-secondary font-bold rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
              <ArrowUpRight className="w-4 h-4" /> Повысить тариф
            </button>
          )}
        </div>
      )}

      {/* Quick Links for suppliers */}
      {isSupplier && (
        <div className="grid grid-cols-2 gap-4">
          <Link href="/dashboard" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <BarChart3 className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-bold text-secondary">Дашборд</div>
          </Link>
          <Link href="/add-product" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center hover:shadow-md transition-shadow">
            <Package className="w-6 h-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-bold text-secondary">Мои товары</div>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-heading font-bold text-secondary mb-1">{userData?.completedOrders || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Сделок</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-heading font-bold text-secondary mb-1">{userData?.chatRequests || 0}</div>
          <div className="text-xs text-slate-500 font-medium">Обращений</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1 text-2xl font-heading font-bold text-secondary mb-1">
            5.0 <Star className="w-5 h-5 text-accent fill-accent" />
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

        <div className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Settings className="w-5 h-5" />
            </div>
            <span className="font-medium text-secondary">Настройки аккаунта</span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </div>
        
        {/* Password Change */}
        <div 
          onClick={() => setIsChangingPassword(true)}
          className="p-4 border-b border-slate-100 hover:bg-slate-50 cursor-pointer flex items-center justify-between transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <span className="font-medium text-secondary block">Сменить пароль</span>
              <span className="text-xs text-slate-500">Обновить пароль для входа</span>
            </div>
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

      {/* Auth Preference Settings */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 space-y-4">
        <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-primary" /> Способ входа
        </h3>
        <p className="text-sm text-slate-500">Выберите предпочтительный способ входа в аккаунт</p>
        <div className="space-y-3">
          {([
            { value: 'password' as const, icon: <Lock className="w-5 h-5" />, label: 'Только пароль', desc: 'Вход только по паролю' },
            { value: 'otp' as const, icon: <Phone className="w-5 h-5" />, label: 'Только подтверждение (SMS/Email)', desc: 'Вход через код подтверждения' },
            { value: 'both' as const, icon: <Shield className="w-5 h-5" />, label: 'Пароль или подтверждение', desc: 'Выбор способа при каждом входе' },
          ]).map(option => (
            <label
              key={option.value}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                (userData?.authPreference || 'both') === option.value
                  ? 'bg-primary/5 border-primary/30 shadow-sm'
                  : 'bg-slate-50 border-slate-100 hover:bg-slate-100'
              }`}
            >
              <input
                type="radio"
                name="authPreference"
                value={option.value}
                checked={(userData?.authPreference || 'both') === option.value}
                onChange={() => updateProfile({ authPreference: option.value })}
                className="sr-only"
              />
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                (userData?.authPreference || 'both') === option.value
                  ? 'bg-primary/10 text-primary'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {option.icon}
              </div>
              <div className="flex-1">
                <div className="font-medium text-secondary">{option.label}</div>
                <div className="text-xs text-slate-500">{option.desc}</div>
              </div>
              {(userData?.authPreference || 'both') === option.value && (
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
              )}
            </label>
          ))}
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
