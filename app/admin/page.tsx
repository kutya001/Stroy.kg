'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getAllMockUsers, updateMockUser } from '@/lib/mockDb';
import { Loader2, CheckCircle2, XCircle, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PendingSupplier {
  uid: string;
  name: string;
  phone: string;
  companyName?: string;
  inn?: string;
  role: string;
  verificationStatus?: string;
}

export default function AdminPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [suppliers, setSuppliers] = useState<PendingSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    
    if (!user || userData?.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchPendingSuppliers = async () => {
      try {
        const allUsers = getAllMockUsers();
        const pending = allUsers.filter(u => 
          (u.role === 'supplier' || u.role === 'developer') && 
          u.verificationStatus === 'PENDING'
        ) as PendingSupplier[];
        
        setSuppliers(pending);
      } catch (error) {
        console.error('Error fetching suppliers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingSuppliers();
  }, [user, userData, authLoading, router]);

  const handleUpdateStatus = async (userId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      updateMockUser(userId, { verificationStatus: status });
      setSuppliers(prev => prev.filter(s => s.uid !== userId));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Ошибка при обновлении статуса');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || userData?.role !== 'admin') {
    return null;
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-primary" />
        <h1 className="text-3xl font-heading font-bold text-secondary">Панель администратора</h1>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h2 className="text-xl font-semibold text-secondary">Заявки на верификацию</h2>
          <p className="text-slate-500 text-sm mt-1">Поставщики и застройщики, ожидающие подтверждения</p>
        </div>

        {suppliers.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            Нет новых заявок на верификацию
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {suppliers.map((supplier) => (
              <div key={supplier.uid} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{supplier.companyName || 'Компания не указана'}</h3>
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-bold uppercase rounded-full">
                      {supplier.role === 'supplier' ? 'Поставщик' : 'Застройщик'}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p><span className="font-medium">Контактное лицо:</span> {supplier.name}</p>
                    <p><span className="font-medium">Телефон:</span> {supplier.phone}</p>
                    <p><span className="font-medium">ИНН:</span> {supplier.inn || 'Не указан'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => handleUpdateStatus(supplier.uid, 'VERIFIED')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-xl transition-colors"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Одобрить
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(supplier.uid, 'REJECTED')}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 font-medium rounded-xl transition-colors"
                  >
                    <XCircle className="w-4 h-4" />
                    Отклонить
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
