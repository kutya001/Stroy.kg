'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import {
  getAllMockUsers, updateMockUser, getVerificationLabel, getVerificationColor,
  type MockUser, type VerificationLevel, type NomenclatureCategory, type NomenclatureType, type NomenclatureGroup,
  getAllNomenclatureGroups, createNomenclatureGroup, updateNomenclatureGroup, deleteNomenclatureGroup,
  getAllConstructionStages, addConstructionStage, removeConstructionStage, updateConstructionStage,
  getAllMockRequests, getProductsBySupplierId, type RequestStatus,
} from '@/lib/mockDb';
import { Loader2, ShieldAlert, BadgeCheck, Users, ArrowUp, Eye, BookOpen, BarChart3, Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

type AdminTab = 'users' | 'directories' | 'analytics';

export default function AdminPage() {
  const { user, userData, loading: authLoading, isAdminMode, adminViewAs, setAdminViewAs } = useAuth();
  const [allUsers, setAllUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('users');
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || user.role !== 'admin') {
      router.push('/');
      return;
    }

    const allU = getAllMockUsers();
    setAllUsers(allU.filter(u => u.role !== 'admin'));
    setLoading(false);
  }, [user, userData, authLoading, router]);

  const handleVerificationUp = (userId: string, newLevel: VerificationLevel) => {
    updateMockUser(userId, { verificationLevel: newLevel });
    const allU = getAllMockUsers();
    setAllUsers(allU.filter(u => u.role !== 'admin'));
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
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UsersTab allUsers={allUsers} pendingUsers={pendingUsers} verifiedUsers={verifiedUsers} onVerificationUp={handleVerificationUp} />}
      {activeTab === 'directories' && <DirectoriesTab />}
      {activeTab === 'analytics' && <AnalyticsTab allUsers={allUsers} />}
    </main>
  );
}

// ==========================================
// USERS TAB
// ==========================================
function UsersTab({ allUsers, pendingUsers, verifiedUsers, onVerificationUp }: {
  allUsers: MockUser[];
  pendingUsers: MockUser[];
  verifiedUsers: MockUser[];
  onVerificationUp: (userId: string, level: VerificationLevel) => void;
}) {
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
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-8">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Заявки на верификацию</h2>
          <p className="text-slate-500 text-sm mt-1">Пользователи, ожидающие повышения уровня</p>
        </div>
        {pendingUsers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">Нет новых заявок на верификацию</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingUsers.map((u) => (
              <div key={u.uid} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{u.name}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full">
                      {u.role === 'supplier' ? 'Поставщик' : u.role === 'developer' ? 'Застройщик' : 'Покупатель'}
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
        )}
      </div>

      {/* All Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Все пользователи</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3">Имя</th>
                <th className="px-6 py-3">Роль</th>
                <th className="px-6 py-3">Телефон</th>
                <th className="px-6 py-3">Верификация</th>
                <th className="px-6 py-3">Подписка</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allUsers.map(u => (
                <tr key={u.uid} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-secondary">{u.name}</td>
                  <td className="px-6 py-4 text-slate-500">{u.role}</td>
                  <td className="px-6 py-4 text-slate-500">{u.phone}</td>
                  <td className="px-6 py-4"><span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getVerificationColor(u.verificationLevel)}`}>{getVerificationLabel(u.verificationLevel)}</span></td>
                  <td className="px-6 py-4 text-slate-500">{u.subscription}</td>
                </tr>
              ))}
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
                const productsCount = getProductsBySupplierId(supplier.uid).length;
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
                  const productsCount = getProductsBySupplierId(dev.uid).length;
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
