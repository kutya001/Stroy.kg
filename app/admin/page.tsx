'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getAllProfiles, updateProfile, getAllRequests, getProductsBySupplierId, getAllNomenclatureGroups as fetchNomenclatureGroups, createNomenclatureGroup as createNomGroup, updateNomenclatureGroup as updateNomGroup, deleteNomenclatureGroup as deleteNomGroup } from '@/lib/data';
import {
  getVerificationLabel, getVerificationColor,
  type MockUser, type MockProduct, type UserRole, type SubscriptionTier, type VerificationLevel, type NomenclatureCategory, type NomenclatureType, type NomenclatureGroup,
  getAllNomenclatureGroups, createNomenclatureGroup, updateNomenclatureGroup, deleteNomenclatureGroup,
  getAllConstructionStages, addConstructionStage, removeConstructionStage, updateConstructionStage,
  getAllMockRequests, getProductsBySupplierId as getProductsBySupplierIdSync, type RequestStatus, resetMockData,
} from '@/lib/mockDb';
import { Loader2, ShieldAlert, BadgeCheck, Users, ArrowUp, Eye, BookOpen, BarChart3, Plus, Pencil, Trash2, X, Save, Database, RefreshCw, Search, ChevronLeft, Lock, Mail, Phone, Building2, MapPin, Star, Package, Shield, Table2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import DatabaseTab from './DatabaseTab';

type AdminTab = 'users' | 'directories' | 'analytics' | 'database' | 'demo';

export default function AdminPage() {
  const { user, userData, loading: authLoading, isAdminMode, adminViewAs, setAdminViewAs } = useAuth();
  const [allUsers, setAllUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const router = useRouter();

  const loadUsers = async () => {
    const allU = await getAllProfiles();
    setAllUsers(allU.filter(u => u.role !== 'admin'));
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    loadUsers().then(() => setLoading(false));
  }, [user, userData, authLoading, router]);

  const handleVerificationUp = async (userId: string, newLevel: VerificationLevel) => {
    await updateProfile(userId, { verificationLevel: newLevel });
    await loadUsers();
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') return null;

  const pendingUsers = allUsers.filter(u => u.verificationLevel < 2 && (u.inn || u.email));
  const verifiedUsers = allUsers.filter(u => u.verificationLevel >= 2);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold text-secondary">Панель администратора</h1>
      </div>

      {/* Role Switcher */}
      <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Eye className="w-5 h-5 text-primary" />
          <h3 className="font-bold text-secondary">Просмотр как роль</h3>
        </div>
        <p className="text-sm text-slate-500 mb-3">Переключитесь на другую роль, чтобы увидеть приложение глазами пользователя.</p>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setAdminViewAs(null)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              !adminViewAs ? 'bg-primary text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Администратор
          </button>
          <button
            onClick={() => setAdminViewAs('consumer')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              adminViewAs === 'consumer' ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Покупатель
          </button>
          <button
            onClick={() => setAdminViewAs('supplier')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              adminViewAs === 'supplier' ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Поставщик
          </button>
          <button
            onClick={() => setAdminViewAs('developer')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
              adminViewAs === 'developer' ? 'bg-purple-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Застройщик
          </button>
        </div>
        {adminViewAs && (
          <p className="mt-3 text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
            Вы просматриваете приложение как <strong>{adminViewAs === 'consumer' ? 'Покупатель' : adminViewAs === 'supplier' ? 'Поставщик' : 'Застройщик'}</strong>. Навигация и лента изменились.
          </p>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        <button onClick={() => setActiveTab('users')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'users' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Users className="w-4 h-4" /> Пользователи
        </button>
        <button onClick={() => setActiveTab('directories')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'directories' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <BookOpen className="w-4 h-4" /> Справочники
        </button>
        <button onClick={() => setActiveTab('analytics')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'analytics' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <BarChart3 className="w-4 h-4" /> Аналитика
        </button>
        <button onClick={() => setActiveTab('database')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'database' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Table2 className="w-4 h-4" /> База данных
        </button>
        <button onClick={() => setActiveTab('demo')} className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'demo' ? 'bg-primary text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
          <Database className="w-4 h-4" /> Демо-данные
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersTab allUsers={allUsers} pendingUsers={pendingUsers} verifiedUsers={verifiedUsers} onVerificationUp={handleVerificationUp} onUsersChanged={loadUsers} />}
      {activeTab === 'directories' && <DirectoriesTab />}
      {activeTab === 'analytics' && <AnalyticsTab allUsers={allUsers} />}
      {activeTab === 'database' && <DatabaseTab />}
      {activeTab === 'demo' && <DemoTab onDataReset={loadUsers} />}
    </main>
  );
}


// ==========================================
// USERS TAB
// ==========================================
function UsersTab({ allUsers, pendingUsers, verifiedUsers, onVerificationUp, onUsersChanged }: {
  allUsers: MockUser[];
  pendingUsers: MockUser[];
  verifiedUsers: MockUser[];
  onVerificationUp: (userId: string, level: VerificationLevel) => void;
  onUsersChanged: () => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<MockUser | null>(null);
  const [editingUser, setEditingUser] = useState<MockUser | null>(null);
  const [supplierProducts, setSupplierProducts] = useState<MockProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Password reset
  const [resetPasswordUid, setResetPasswordUid] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Edit form
  const [editForm, setEditForm] = useState({
    name: '', phone: '', email: '', role: '' as UserRole,
    companyName: '', inn: '', subscription: '' as SubscriptionTier,
    verificationLevel: 0 as VerificationLevel,
    phoneVerified: false, emailVerified: false,
  });
  const [saving, setSaving] = useState(false);

  const filteredUsers = allUsers.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.companyName || '').toLowerCase().includes(q) ||
        (u.inn || '').includes(q);
    }
    return true;
  });

  const openUserDetail = async (u: MockUser) => {
    setSelectedUser(u);
    setEditingUser(null);
    setResetPasswordUid(null);
    if (u.role === 'supplier' || u.role === 'developer') {
      setLoadingProducts(true);
      const prods = await getProductsBySupplierId(u.uid);
      setSupplierProducts(prods);
      setLoadingProducts(false);
    } else {
      setSupplierProducts([]);
    }
  };

  const startEdit = (u: MockUser) => {
    setEditingUser(u);
    setEditForm({
      name: u.name,
      phone: u.phone,
      email: u.email || '',
      role: u.role,
      companyName: u.companyName || '',
      inn: u.inn || '',
      subscription: u.subscription,
      verificationLevel: u.verificationLevel,
      phoneVerified: u.phoneVerified,
      emailVerified: u.emailVerified,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser) return;
    setSaving(true);
    await updateProfile(editingUser.uid, {
      name: editForm.name,
      phone: editForm.phone,
      email: editForm.email || undefined,
      role: editForm.role,
      companyName: editForm.companyName || undefined,
      inn: editForm.inn || undefined,
      subscription: editForm.subscription,
      verificationLevel: editForm.verificationLevel,
      phoneVerified: editForm.phoneVerified,
      emailVerified: editForm.emailVerified,
    });
    setSaving(false);
    setEditingUser(null);
    onUsersChanged();
    // Re-fetch selected user
    const allU = await getAllProfiles();
    const updated = allU.find(u => u.uid === editingUser.uid);
    if (updated) setSelectedUser(updated);
  };

  const handlePasswordReset = async () => {
    if (!resetPasswordUid) return;
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (newPassword !== passwordConfirm) {
      setPasswordError('Пароли не совпадают');
      return;
    }

    setSavingPassword(true);
    await updateProfile(resetPasswordUid, { password: newPassword });
    setSavingPassword(false);
    setPasswordSuccess(true);
    setNewPassword('');
    setPasswordConfirm('');
    onUsersChanged();
    setTimeout(() => {
      setPasswordSuccess(false);
      setResetPasswordUid(null);
    }, 2000);
  };

  const roleLabel = (role: UserRole) => {
    const labels: Record<UserRole, string> = { consumer: 'Покупатель', supplier: 'Поставщик', developer: 'Застройщик', admin: 'Админ' };
    return labels[role];
  };

  const roleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      consumer: 'bg-blue-100 text-blue-700',
      supplier: 'bg-orange-100 text-orange-700',
      developer: 'bg-purple-100 text-purple-700',
      admin: 'bg-red-100 text-red-700',
    };
    return colors[role];
  };

  // If a user is selected, show their detail page
  if (selectedUser) {
    return (
      <div>
        {/* Back button */}
        <button onClick={() => { setSelectedUser(null); setEditingUser(null); setResetPasswordUid(null); }} className="flex items-center gap-2 text-primary font-bold text-sm mb-6 hover:underline">
          <ChevronLeft className="w-4 h-4" /> Назад к списку
        </button>

        {/* User Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold shrink-0 ${
                selectedUser.role === 'supplier' || selectedUser.role === 'developer' ? 'bg-primary/10 text-primary' : 'bg-blue-50 text-blue-600'
              }`}>
                {selectedUser.name ? selectedUser.name.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-heading font-bold text-secondary">{selectedUser.name || 'Без имени'}</h2>
                  {selectedUser.verificationLevel >= 2 && <BadgeCheck className="w-5 h-5 text-green-500" />}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${roleColor(selectedUser.role)}`}>{roleLabel(selectedUser.role)}</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerificationColor(selectedUser.verificationLevel)}`}>{getVerificationLabel(selectedUser.verificationLevel)}</span>
                  <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-slate-100 text-slate-600">{selectedUser.subscription}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => startEdit(selectedUser)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
                <Pencil className="w-4 h-4" /> Редактировать
              </button>
              <button onClick={() => { setResetPasswordUid(selectedUser.uid); setNewPassword(''); setPasswordConfirm(''); setPasswordError(''); setPasswordSuccess(false); }} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">
                <Lock className="w-4 h-4" /> Сбросить пароль
              </button>
            </div>
          </div>
        </div>

        {/* Password Reset Section */}
        {resetPasswordUid && (
          <div className="bg-white rounded-2xl shadow-sm border border-amber-200 p-6 mb-6">
            <h3 className="font-bold text-secondary flex items-center gap-2 mb-4">
              <Lock className="w-5 h-5 text-amber-500" /> Сброс пароля для {selectedUser.name}
            </h3>
            {passwordSuccess ? (
              <p className="text-green-600 font-medium">Пароль успешно изменён!</p>
            ) : (
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Новый пароль</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Минимум 6 символов" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Подтверждение пароля</label>
                  <input type="password" value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} placeholder="Повторите пароль" className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                </div>
                {passwordError && <p className="text-red-500 text-sm font-medium">{passwordError}</p>}
                <div className="flex gap-2">
                  <button onClick={handlePasswordReset} disabled={savingPassword} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                    {savingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Установить пароль
                  </button>
                  <button onClick={() => setResetPasswordUid(null)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Отмена</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Edit Form */}
        {editingUser && (
          <div className="bg-white rounded-2xl shadow-sm border border-primary/30 p-6 mb-6">
            <h3 className="font-bold text-secondary flex items-center gap-2 mb-4">
              <Pencil className="w-5 h-5 text-primary" /> Редактирование профиля
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
                <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
                <input type="text" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Роль</label>
                <select value={editForm.role} onChange={e => setEditForm({...editForm, role: e.target.value as UserRole})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                  <option value="consumer">Покупатель</option>
                  <option value="supplier">Поставщик</option>
                  <option value="developer">Застройщик</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Компания</label>
                <input type="text" value={editForm.companyName} onChange={e => setEditForm({...editForm, companyName: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ИНН</label>
                <input type="text" value={editForm.inn} onChange={e => setEditForm({...editForm, inn: e.target.value})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Подписка</label>
                <select value={editForm.subscription} onChange={e => setEditForm({...editForm, subscription: e.target.value as SubscriptionTier})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                  <option value="FREE">FREE</option>
                  <option value="BASIC">BASIC</option>
                  <option value="PRO">PRO</option>
                  <option value="ENTERPRISE">ENTERPRISE</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Уровень верификации</label>
                <select value={editForm.verificationLevel} onChange={e => setEditForm({...editForm, verificationLevel: Number(e.target.value) as VerificationLevel})} className="w-full rounded-xl border border-slate-200 px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm">
                  <option value={0}>0 — Не подтверждён</option>
                  <option value={1}>1 — Телефон + почта</option>
                  <option value={2}>2 — ИНН / паспорт</option>
                  <option value={3}>3 — Лицензии</option>
                </select>
              </div>
              <div className="sm:col-span-2 flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editForm.phoneVerified} onChange={e => setEditForm({...editForm, phoneVerified: e.target.checked})} className="rounded accent-primary" />
                  Телефон подтверждён
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={editForm.emailVerified} onChange={e => setEditForm({...editForm, emailVerified: e.target.checked})} className="rounded accent-primary" />
                  Email подтверждён
                </label>
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={handleSaveEdit} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Сохранить
              </button>
              <button onClick={() => setEditingUser(null)} className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors">Отмена</button>
            </div>
          </div>
        )}

        {/* User Info */}
        {!editingUser && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Contact Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-secondary mb-4">Контактная информация</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-secondary">{selectedUser.phone}</div>
                    <div className="text-xs text-slate-400">{selectedUser.phoneVerified ? '✓ Подтверждён' : '✗ Не подтверждён'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <div>
                    <div className="text-sm font-medium text-secondary">{selectedUser.email || '—'}</div>
                    <div className="text-xs text-slate-400">{selectedUser.emailVerified ? '✓ Подтверждён' : '✗ Не подтверждён'}</div>
                  </div>
                </div>
                {selectedUser.companyName && (
                  <div className="flex items-center gap-3">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div className="text-sm font-medium text-secondary">{selectedUser.companyName}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Account Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="font-bold text-secondary mb-4">Данные аккаунта</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">UID</span>
                  <span className="font-mono text-xs text-secondary bg-slate-50 px-2 py-0.5 rounded">{selectedUser.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Роль</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${roleColor(selectedUser.role)}`}>{roleLabel(selectedUser.role)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Подписка</span>
                  <span className="font-bold text-secondary">{selectedUser.subscription}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Верификация</span>
                  <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerificationColor(selectedUser.verificationLevel)}`}>{getVerificationLabel(selectedUser.verificationLevel)}</span>
                </div>
                {selectedUser.inn && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">ИНН</span>
                    <span className="font-medium text-secondary">{selectedUser.inn}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Onboarding</span>
                  <span className={`font-medium ${selectedUser.onboardingCompleted ? 'text-green-600' : 'text-amber-500'}`}>{selectedUser.onboardingCompleted ? 'Завершён' : 'Не завершён'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Зарегистрирован</span>
                  <span className="text-secondary">{new Date(selectedUser.createdAt).toLocaleDateString('ru-RU')}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Supplier-specific data */}
        {(selectedUser.role === 'supplier' || selectedUser.role === 'developer') && !editingUser && (
          <>
            {/* Supplier Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-xl font-bold text-secondary">{selectedUser.pageViews ?? 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Просмотров</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-xl font-bold text-secondary">{selectedUser.chatRequests ?? 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Чат-запросов</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-xl font-bold text-secondary">{selectedUser.completedOrders ?? 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Заказов</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-xl font-bold text-primary">{(selectedUser.revenue ?? 0).toLocaleString()}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Выручка (KGS)</div>
              </div>
              <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
                <div className="text-xl font-bold text-secondary">{selectedUser.dailyAdBudget ?? 0}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Бюджет / день</div>
              </div>
            </div>

            {/* Supplier Licenses */}
            {(selectedUser.licenses?.length || selectedUser.certificates?.length) ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
                <h3 className="font-bold text-secondary mb-3">Лицензии и сертификаты</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedUser.licenses?.map((l, i) => (
                    <span key={`lic-${i}`} className="px-3 py-1.5 bg-green-50 text-green-700 text-xs font-bold rounded-lg flex items-center gap-1">
                      <Shield className="w-3 h-3" /> {l}
                    </span>
                  ))}
                  {selectedUser.certificates?.map((c, i) => (
                    <span key={`cert-${i}`} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg">{c}</span>
                  ))}
                </div>
              </div>
            ) : null}

            {/* Supplier Products */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <h3 className="text-lg font-bold text-secondary flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Товары и услуги поставщика
                  <span className="ml-2 text-sm font-normal text-slate-500">({supplierProducts.length})</span>
                </h3>
              </div>
              {loadingProducts ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : supplierProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-sm">Нет товаров или услуг</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-3">Название</th>
                        <th className="px-6 py-3">Категория</th>
                        <th className="px-6 py-3 text-right">Цена</th>
                        <th className="px-6 py-3 text-center">Рейтинг</th>
                        <th className="px-6 py-3 text-center">Статус</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {supplierProducts.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-6 py-3">
                            <div className="font-medium text-secondary">{p.name}</div>
                            <div className="text-xs text-slate-400">{p.groupName}</div>
                          </td>
                          <td className="px-6 py-3">
                            <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${p.nomenclatureCategory === 'Товар' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{p.nomenclatureCategory}</span>
                            <span className="text-xs text-slate-400 ml-1">→ {p.nomenclatureType}</span>
                          </td>
                          <td className="px-6 py-3 text-right font-bold text-primary whitespace-nowrap">{p.price.toLocaleString()} / {p.unit}</td>
                          <td className="px-6 py-3 text-center">
                            <span className="inline-flex items-center gap-1"><Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {p.rating}</span>
                          </td>
                          <td className="px-6 py-3 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {p.isPublished ? <span className="px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold rounded">Опубл.</span> : <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded">Черновик</span>}
                              {p.isPromoted && <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded">РЕК</span>}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }

  // Main users list view
  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <Users className="w-6 h-6 text-primary mx-auto mb-2" />
          <div className="text-2xl font-bold text-secondary">{allUsers.length}</div>
          <div className="text-xs text-slate-500">Всего пользователей</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <BadgeCheck className="w-6 h-6 text-green-500 mx-auto mb-2" />
          <div className="text-2xl font-bold text-secondary">{verifiedUsers.length}</div>
          <div className="text-xs text-slate-500">Верифицированных</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-secondary">{allUsers.filter(u => u.role === 'supplier').length}</div>
          <div className="text-xs text-slate-500">Поставщиков</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-secondary">{pendingUsers.length}</div>
          <div className="text-xs text-slate-500">Ожидают верификации</div>
        </div>
      </div>

      {/* Pending Verification */}
      {pendingUsers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-secondary">Заявки на верификацию</h2>
            <p className="text-slate-500 text-sm mt-1">Пользователи, ожидающие повышения уровня</p>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingUsers.map((u) => (
              <div key={u.uid} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="cursor-pointer" onClick={() => openUserDetail(u)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg hover:text-primary transition-colors">{u.name}</h3>
                    <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-full ${roleColor(u.role)}`}>
                      {roleLabel(u.role)}
                    </span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerificationColor(u.verificationLevel)}`}>
                      {getVerificationLabel(u.verificationLevel)}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Телефон:</span> {u.phone}</p>
                    {u.email && <p><span className="font-medium">Email:</span> {u.email} {u.emailVerified ? '✓' : ''}</p>}
                    {u.companyName && <p><span className="font-medium">Компания:</span> {u.companyName}</p>}
                    {u.inn && <p><span className="font-medium">ИНН:</span> {u.inn}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {u.verificationLevel < 1 && u.email && (
                    <button onClick={() => onVerificationUp(u.uid, 1)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors text-sm">
                      <ArrowUp className="w-4 h-4" /> Ур.1
                    </button>
                  )}
                  {u.verificationLevel < 2 && u.inn && (
                    <button onClick={() => onVerificationUp(u.uid, 2)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors text-sm">
                      <ArrowUp className="w-4 h-4" /> Ур.2
                    </button>
                  )}
                  {u.verificationLevel < 3 && (u.licenses?.length || u.certificates?.length) && (
                    <button onClick={() => onVerificationUp(u.uid, 3)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors text-sm">
                      <ArrowUp className="w-4 h-4" /> Ур.3
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Поиск по имени, телефону, email, ИНН, компании..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'consumer', 'supplier', 'developer'] as const).map(role => (
            <button key={role} onClick={() => setRoleFilter(role)} className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors whitespace-nowrap ${roleFilter === role ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {role === 'all' ? 'Все' : roleLabel(role)}
            </button>
          ))}
        </div>
      </div>

      {/* All Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-secondary">Все пользователи</h2>
          <span className="text-sm text-slate-500">{filteredUsers.length} из {allUsers.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Имя</th>
                <th className="px-6 py-3">Роль</th>
                <th className="px-6 py-3">Телефон / Email</th>
                <th className="px-6 py-3">Компания</th>
                <th className="px-6 py-3">Верификация</th>
                <th className="px-6 py-3">Подписка</th>
                <th className="px-6 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50 cursor-pointer" onClick={() => openUserDetail(u)}>
                  <td className="px-6 py-4 font-medium text-secondary">{u.name || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${roleColor(u.role)}`}>{roleLabel(u.role)}</span></td>
                  <td className="px-6 py-4">
                    <div className="text-slate-600">{u.phone}</div>
                    {u.email && <div className="text-xs text-slate-400">{u.email}</div>}
                  </td>
                  <td className="px-6 py-4 text-slate-500">{u.companyName || '—'}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerificationColor(u.verificationLevel)}`}>{getVerificationLabel(u.verificationLevel)}</span></td>
                  <td className="px-6 py-4 text-slate-500">{u.subscription}</td>
                  <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                    <button onClick={() => openUserDetail(u)} className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Открыть"><Eye className="w-4 h-4" /></button>
                    <button onClick={() => { openUserDetail(u).then(() => startEdit(u)); }} className="p-1.5 text-slate-400 hover:text-primary transition-colors ml-1" title="Редактировать"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => { openUserDetail(u); setResetPasswordUid(u.uid); setNewPassword(''); setPasswordConfirm(''); setPasswordError(''); setPasswordSuccess(false); }} className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors ml-1" title="Сбросить пароль"><Lock className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Пользователи не найдены</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ==========================================
// DIRECTORIES TAB
// ==========================================
function DirectoriesTab() {
  const [groups, setGroups] = useState<NomenclatureGroup[]>(getAllNomenclatureGroups());
  const [stages, setStages] = useState<string[]>(getAllConstructionStages());
  const [editingGroup, setEditingGroup] = useState<NomenclatureGroup | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newStage, setNewStage] = useState('');
  const [editingStage, setEditingStage] = useState<{old: string; value: string} | null>(null);

  // Form state for nomenclature group
  const [formCategory, setFormCategory] = useState<NomenclatureCategory>('Товар');
  const [formType, setFormType] = useState<NomenclatureType>('Материалы');
  const [formName, setFormName] = useState('');
  const [formChars, setFormChars] = useState<string[]>(['']);

  const categoryTypes: Record<NomenclatureCategory, NomenclatureType[]> = {
    'Товар': ['Инструменты', 'Материалы', 'Оборудование'],
    'Услуга': ['Архитектурные', 'Строительные', 'Отделочные', 'Аренда'],
  };

  const resetForm = () => {
    setFormCategory('Товар');
    setFormType('Материалы');
    setFormName('');
    setFormChars(['']);
    setEditingGroup(null);
    setIsCreating(false);
  };

  const startEdit = (group: NomenclatureGroup) => {
    setEditingGroup(group);
    setIsCreating(false);
    setFormCategory(group.category);
    setFormType(group.type);
    setFormName(group.name);
    setFormChars(group.characteristics.length > 0 ? [...group.characteristics] : ['']);
  };

  const startCreate = () => {
    resetForm();
    setIsCreating(true);
  };

  const handleSaveGroup = () => {
    const chars = formChars.filter(c => c.trim() !== '');
    if (!formName.trim() || chars.length === 0) return;

    if (editingGroup) {
      updateNomenclatureGroup(editingGroup.id, {
        category: formCategory,
        type: formType,
        name: formName.trim(),
        characteristics: chars,
      });
    } else {
      createNomenclatureGroup({
        category: formCategory,
        type: formType,
        name: formName.trim(),
        characteristics: chars,
      });
    }
    setGroups(getAllNomenclatureGroups());
    resetForm();
  };

  const handleDeleteGroup = (id: string) => {
    deleteNomenclatureGroup(id);
    setGroups(getAllNomenclatureGroups());
  };

  const handleAddStage = () => {
    if (!newStage.trim()) return;
    addConstructionStage(newStage.trim());
    setStages(getAllConstructionStages());
    setNewStage('');
  };

  const handleRemoveStage = (name: string) => {
    removeConstructionStage(name);
    setStages(getAllConstructionStages());
  };

  const handleUpdateStage = () => {
    if (!editingStage || !editingStage.value.trim()) return;
    updateConstructionStage(editingStage.old, editingStage.value.trim());
    setStages(getAllConstructionStages());
    setEditingStage(null);
  };

  return (
    <div className="space-y-8">
      {/* Nomenclature Groups */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-secondary">Номенклатурные группы</h2>
            <p className="text-slate-500 text-sm mt-1">Категория → Вид → Группа → Характеристики</p>
          </div>
          {!isCreating && !editingGroup && (
            <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" /> Добавить
            </button>
          )}
        </div>

        {/* Create / Edit Form */}
        {(isCreating || editingGroup) && (
          <div className="p-6 border-b border-slate-100 bg-slate-50 space-y-4">
            <h3 className="font-bold text-secondary">{editingGroup ? 'Редактирование группы' : 'Новая группа'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Категория</label>
                <select value={formCategory} onChange={e => { setFormCategory(e.target.value as NomenclatureCategory); setFormType(categoryTypes[e.target.value as NomenclatureCategory][0]); }} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20">
                  <option value="Товар">Товар</option>
                  <option value="Услуга">Услуга</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Вид</label>
                <select value={formType} onChange={e => setFormType(e.target.value as NomenclatureType)} className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20">
                  {categoryTypes[formCategory].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Наименование</label>
                <input type="text" value={formName} onChange={e => setFormName(e.target.value)} placeholder="Название группы" className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Характеристики</label>
              <div className="space-y-2">
                {formChars.map((ch, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input type="text" value={ch} onChange={e => { const updated = [...formChars]; updated[idx] = e.target.value; setFormChars(updated); }} placeholder={`Характеристика ${idx + 1}`} className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                    {formChars.length > 1 && (
                      <button type="button" onClick={() => setFormChars(formChars.filter((_, i) => i !== idx))} className="p-2 text-slate-400 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={() => setFormChars([...formChars, ''])} className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
                  <Plus className="w-3 h-3" /> Добавить характеристику
                </button>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveGroup} className="px-5 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> Сохранить
              </button>
              <button onClick={resetForm} className="px-5 py-2 bg-slate-200 text-slate-600 rounded-xl text-sm font-bold hover:bg-slate-300 transition-colors">
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Groups Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Категория</th>
                <th className="px-6 py-3">Вид</th>
                <th className="px-6 py-3">Группа</th>
                <th className="px-6 py-3">Характеристики</th>
                <th className="px-6 py-3 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {groups.map(g => (
                <tr key={g.id} className="hover:bg-slate-50">
                  <td className="px-6 py-3"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${g.category === 'Товар' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}>{g.category}</span></td>
                  <td className="px-6 py-3 text-slate-600">{g.type}</td>
                  <td className="px-6 py-3 font-medium text-secondary">{g.name}</td>
                  <td className="px-6 py-3 text-slate-500 text-xs">{g.characteristics.join(', ')}</td>
                  <td className="px-6 py-3 text-right">
                    <button onClick={() => startEdit(g)} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteGroup(g.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors ml-1"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Construction Stages */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Этапы строительства</h2>
          <p className="text-slate-500 text-sm mt-1">Используются для фильтрации товаров и услуг</p>
        </div>
        <div className="p-6 space-y-3">
          {stages.map(stage => (
            <div key={stage} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
              {editingStage?.old === stage ? (
                <>
                  <input type="text" value={editingStage.value} onChange={e => setEditingStage({...editingStage, value: e.target.value})} className="flex-1 rounded-lg border border-gray-300 px-3 py-1.5 outline-none focus:ring-2 focus:ring-primary/20 text-sm" />
                  <button onClick={handleUpdateStage} className="p-1.5 text-green-500 hover:text-green-600"><Save className="w-4 h-4" /></button>
                  <button onClick={() => setEditingStage(null)} className="p-1.5 text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="flex-1 text-sm font-medium text-secondary">{stage}</span>
                  <button onClick={() => setEditingStage({old: stage, value: stage})} className="p-1.5 text-slate-400 hover:text-primary transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => handleRemoveStage(stage)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </>
              )}
            </div>
          ))}
          <div className="flex gap-2 pt-2">
            <input type="text" value={newStage} onChange={e => setNewStage(e.target.value)} placeholder="Новый этап строительства" className="flex-1 rounded-lg border border-gray-300 px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20 text-sm" onKeyDown={e => e.key === 'Enter' && handleAddStage()} />
            <button onClick={handleAddStage} className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" /> Добавить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// ANALYTICS TAB
// ==========================================
function AnalyticsTab({ allUsers }: { allUsers: MockUser[] }) {
  const consumers = allUsers.filter(u => u.role === 'consumer');
  const suppliers = allUsers.filter(u => u.role === 'supplier');
  const developers = allUsers.filter(u => u.role === 'developer');
  const allRequests = getAllMockRequests();

  const statuses: RequestStatus[] = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'];
  const statusLabels: Record<RequestStatus, string> = {
    'OPEN': 'Открыта',
    'ASSIGNED': 'Назначена',
    'IN_PROGRESS': 'В работе',
    'COMPLETED': 'Выполнена',
    'REJECTED': 'Отклонена',
  };

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-secondary">{allUsers.length}</div>
          <div className="text-xs text-slate-500">Всего пользователей</div>
        </div>
        <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-blue-700">{consumers.length}</div>
          <div className="text-xs text-blue-500">Покупателей</div>
        </div>
        <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-orange-700">{suppliers.length}</div>
          <div className="text-xs text-orange-500">Поставщиков</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-700">{developers.length}</div>
          <div className="text-xs text-purple-500">Застройщиков</div>
        </div>
      </div>

      {/* Consumer Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Статистика покупателей</h2>
          <p className="text-slate-500 text-sm mt-1">Заявки по статусам для каждого покупателя</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Покупатель</th>
                <th className="px-6 py-3">Всего заявок</th>
                {statuses.map(s => <th key={s} className="px-4 py-3 text-center">{statusLabels[s]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {consumers.map(consumer => {
                const userRequests = allRequests.filter(r => r.authorId === consumer.uid);
                return (
                  <tr key={consumer.uid} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-secondary">{consumer.name}</td>
                    <td className="px-6 py-3 font-bold text-secondary">{userRequests.length}</td>
                    {statuses.map(s => (
                      <td key={s} className="px-4 py-3 text-center text-slate-600">{userRequests.filter(r => r.status === s).length}</td>
                    ))}
                  </tr>
                );
              })}
              {consumers.length === 0 && (
                <tr><td colSpan={7} className="px-6 py-8 text-center text-slate-500">Нет покупателей</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Supplier Statistics */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Статистика поставщиков</h2>
          <p className="text-slate-500 text-sm mt-1">Товары в каталоге и обрабатываемые заявки</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Поставщик</th>
                <th className="px-6 py-3">Товаров</th>
                <th className="px-6 py-3">Всего заявок</th>
                {statuses.map(s => <th key={s} className="px-4 py-3 text-center">{statusLabels[s]}</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {suppliers.map(supplier => {
                const productsCount = getProductsBySupplierIdSync(supplier.uid).length;
                const supplierRequests = allRequests.filter(r => r.assignedSupplierId === supplier.uid);
                return (
                  <tr key={supplier.uid} className="hover:bg-slate-50">
                    <td className="px-6 py-3 font-medium text-secondary">{supplier.name}</td>
                    <td className="px-6 py-3 font-bold text-primary">{productsCount}</td>
                    <td className="px-6 py-3 font-bold text-secondary">{supplierRequests.length}</td>
                    {statuses.map(s => (
                      <td key={s} className="px-4 py-3 text-center text-slate-600">{supplierRequests.filter(r => r.status === s).length}</td>
                    ))}
                  </tr>
                );
              })}
              {suppliers.length === 0 && (
                <tr><td colSpan={8} className="px-6 py-8 text-center text-slate-500">Нет поставщиков</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Developer Statistics */}
      {developers.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-secondary">Статистика застройщиков</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3">Застройщик</th>
                  <th className="px-6 py-3">Товаров</th>
                  <th className="px-6 py-3">Заявок</th>
                  <th className="px-6 py-3">Верификация</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {developers.map(dev => {
                  const productsCount = getProductsBySupplierIdSync(dev.uid).length;
                  const devRequests = allRequests.filter(r => r.assignedSupplierId === dev.uid);
                  return (
                    <tr key={dev.uid} className="hover:bg-slate-50">
                      <td className="px-6 py-3 font-medium text-secondary">{dev.name}</td>
                      <td className="px-6 py-3 font-bold text-primary">{productsCount}</td>
                      <td className="px-6 py-3 text-slate-600">{devRequests.length}</td>
                      <td className="px-6 py-3"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerificationColor(dev.verificationLevel)}`}>{getVerificationLabel(dev.verificationLevel)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// DEMO DATA TAB
// ==========================================
function DemoTab({ onDataReset }: { onDataReset: () => void }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  const handleResetMockData = () => {
    setStatus('loading');
    setTimeout(() => {
      resetMockData();
      onDataReset();
      setStatus('success');
      setTimeout(() => setStatus('idle'), 2000);
    }, 500);
  };

  return (
    <div className="space-y-8">
      {/* Mock Data Reset */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Генерация демо-данных (Mock)</h2>
          <p className="text-slate-500 text-sm mt-1">
            Сбрасывает все данные в памяти к исходным демонстративным: пользователи, товары, заявки, уведомления, чаты.
          </p>
        </div>
        <div className="p-6">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-amber-800">
              <strong>Внимание:</strong> Все текущие изменения будут потеряны. Данные будут восстановлены к начальному демо-состоянию.
            </p>
          </div>
          <button
            onClick={handleResetMockData}
            disabled={status === 'loading'}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {status === 'loading' ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <RefreshCw className="w-5 h-5" />
            )}
            {status === 'success' ? 'Данные восстановлены!' : 'Сгенерировать демо-данные'}
          </button>
          {status === 'success' && (
            <p className="mt-3 text-sm text-green-600">Все данные успешно восстановлены к исходному состоянию.</p>
          )}
        </div>
      </div>

      {/* Supabase SQL Scripts Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">SQL скрипты (Supabase)</h2>
          <p className="text-slate-500 text-sm mt-1">
            Для генерации демо-данных в Supabase используйте SQL скрипты из папки <code className="bg-slate-100 px-1.5 py-0.5 rounded text-xs">lib/supabase/</code>
          </p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
            <Database className="w-6 h-6 text-primary mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-secondary text-sm">migration.sql</h3>
              <p className="text-xs text-slate-500 mt-0.5">Схема БД: таблицы, индексы, RLS, триггеры. Выполняйте первым.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
            <Database className="w-6 h-6 text-green-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-secondary text-sm">seed-data.sql</h3>
              <p className="text-xs text-slate-500 mt-0.5">Демонстративные данные: пользователи, товары, заявки, чаты. Выполняйте после migration.sql.</p>
              <p className="text-xs text-slate-400 mt-1">Логины: admin@stroy.kg / admin123, остальные / 123456</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-xl">
            <Database className="w-6 h-6 text-red-500 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-bold text-secondary text-sm">cleanup.sql</h3>
              <p className="text-xs text-slate-500 mt-0.5">Полная очистка всех таблиц и auth.users. Используйте для сброса БД.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Выполняйте скрипты через Supabase Dashboard → SQL Editor
          </p>
        </div>
      </div>
    </div>
  );
}
