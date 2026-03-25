'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Shield, CheckCircle, XCircle, Loader2, Building2, User, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!userData || userData.role !== 'admin')) {
      router.push('/');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      if (!userData || userData.role !== 'admin') return;

      try {
        const { data: users, error } = await supabase
          .from('users')
          .select('*')
          .eq('verificationStatus', 'pending');

        if (error) throw error;
        setPendingUsers(users || []);
      } catch (error) {
        console.error("Error fetching pending users:", error);
      } finally {
        setLoading(false);
      }
    };

    if (userData?.role === 'admin') {
      fetchPendingUsers();
    }
  }, [userData]);

  const handleUpdateStatus = async (userId: string, newStatus: 'verified' | 'rejected') => {
    setActionLoading(userId);
    try {
      const { error } = await supabase
        .from('users')
        .update({ verificationStatus: newStatus })
        .eq('id', userId);

      if (error) throw error;
      setPendingUsers(prev => prev.filter(u => u.id !== userId));
    } catch (error) {
      console.error(`Error updating user status to ${newStatus}:`, error);
      alert('Ошибка при обновлении статуса');
    } finally {
      setActionLoading(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData || userData.role !== 'admin') {
    return null; // Will redirect
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <Shield className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary">Панель администратора</h1>
          <p className="text-slate-500 text-sm">Управление пользователями и модерация</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-secondary flex items-center gap-2">
          Заявки на подтверждение
          <span className="bg-primary/10 text-primary text-sm py-0.5 px-2 rounded-full font-bold">
            {pendingUsers.length}
          </span>
        </h2>

        {pendingUsers.length === 0 ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
            Нет пользователей, ожидающих подтверждения.
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingUsers.map((pendingUser) => (
              <div key={pendingUser.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg text-secondary">{pendingUser.name}</h3>
                    <span className="inline-block px-2 py-1 bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-md">
                      {pendingUser.role === 'supplier' ? 'Поставщик' : pendingUser.role === 'developer' ? 'Застройщик' : pendingUser.role}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 text-sm text-slate-600">
                    {pendingUser.email && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" /> {pendingUser.email}
                      </div>
                    )}
                    {pendingUser.companyName && (
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" /> {pendingUser.companyName}
                      </div>
                    )}
                    {pendingUser.inn && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-slate-400" /> ИНН: {pendingUser.inn}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <button
                    onClick={() => handleUpdateStatus(pendingUser.id, 'rejected')}
                    disabled={actionLoading === pendingUser.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-danger text-danger rounded-xl hover:bg-danger/5 transition-colors font-medium disabled:opacity-50"
                  >
                    {actionLoading === pendingUser.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Отклонить
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(pendingUser.id, 'verified')}
                    disabled={actionLoading === pendingUser.id}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors font-medium shadow-sm disabled:opacity-50"
                  >
                    {actionLoading === pendingUser.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Подтвердить
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
