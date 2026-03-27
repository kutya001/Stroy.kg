'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getAllMockUsers, updateMockUser, getVerificationLabel, getVerificationColor, type MockUser, type VerificationLevel } from '@/lib/mockDb';
import { Loader2, CheckCircle2, XCircle, ShieldAlert, BadgeCheck, Users, ArrowUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [allUsers, setAllUsers] = useState<MockUser[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userData?.role !== 'admin') {
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

  if (!user || userData?.role !== 'admin') return null;

  const pendingUsers = allUsers.filter(u => u.verificationLevel < 2 && (u.inn || u.email));
  const verifiedUsers = allUsers.filter(u => u.verificationLevel >= 2);

  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold text-secondary">Панель администратора</h1>
      </div>

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
          <div className="p-8 text-center text-slate-500">
            Нет новых заявок на верификацию
          </div>
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
                    <button onClick={() => handleVerificationUp(u.uid, 1)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-colors text-sm">
                      <ArrowUp className="w-4 h-4" /> Ур.1
                    </button>
                  )}
                  {u.verificationLevel < 2 && u.inn && (
                    <button onClick={() => handleVerificationUp(u.uid, 2)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors text-sm">
                      <ArrowUp className="w-4 h-4" /> Ур.2
                    </button>
                  )}
                  {u.verificationLevel < 3 && (u.licenses?.length || u.certificates?.length) && (
                    <button onClick={() => handleVerificationUp(u.uid, 3)} className="flex-1 sm:flex-none flex items-center justify-center gap-1 px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-medium rounded-xl transition-colors text-sm">
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
    </main>
  );
}
