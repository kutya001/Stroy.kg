'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Package, Plus, Loader2, ArrowLeft, MoreVertical, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function SupplierProductsPage() {
  const { user, userData, loading: authLoading } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && (!userData || (userData.role !== 'supplier' && userData.role !== 'developer'))) {
      router.push('/profile');
    }
  }, [userData, authLoading, router]);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!userData || !user) return;
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('supplierId', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (err) {
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProducts();
  }, [user, userData]);

  const handleDelete = async (productId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот товар?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', productId);
      if (error) throw error;
      setProducts(products.filter(p => p.id !== productId));
    } catch (err) {
      console.error('Error deleting product:', err);
      alert('Ошибка при удалении');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Restrict unverified suppliers
  if (userData?.verificationStatus === 'pending' || userData?.verificationStatus === 'rejected') {
    return (
      <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">
        <Link href="/profile" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors font-medium text-sm mb-4">
          <ArrowLeft className="w-4 h-4" /> Назад в профиль
        </Link>
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-slate-100">
            <Package className="w-10 h-10 text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-3">Ваш аккаунт на модерации</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-6">
            Добавление товаров и услуг станет доступно после того, как администратор проверит ваши документы и подтвердит профиль.
          </p>
          <div className="inline-block px-4 py-2 bg-amber-100 text-amber-800 rounded-lg text-sm font-bold tracking-wide">
            СТАТУС: ОЖИДАЕТ ПОДТВЕРЖДЕНИЯ
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-4">
          <Link href="/profile" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-secondary">Мои товары и услуги</h1>
            <p className="text-slate-500 text-sm">Управление каталогом предложений</p>
          </div>
        </div>
        <Link
          href="/profile/products/new"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Добавить</span>
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border border-slate-100">
            <Package className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-2">У вас пока нет товаров</h3>
          <p className="text-slate-500 max-w-sm mx-auto mb-8">Начните добавлять свои материалы или услуги, чтобы клиенты могли вас найти.</p>
          <Link href="/profile/products/new" className="px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-colors flex items-center gap-2 shadow-sm">
            <Plus className="w-5 h-5" /> Добавить первый товар
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <div key={product.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center shadow-sm">
              <div className="w-full sm:w-32 h-32 sm:h-24 bg-slate-100 rounded-xl overflow-hidden relative shrink-0">
                {product.images && product.images.length > 0 ? (
                  <Image src={product.images[0]} alt={product.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-slate-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0 w-full text-center sm:text-left">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1 justify-center sm:justify-start">
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider rounded">
                    {product.type === 'material' ? 'Материал' : 'Услуга'}
                  </span>
                  <span className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${product.isActive ? 'bg-success/10 text-success' : 'bg-slate-100 text-slate-500'}`}>
                    {product.isActive ? 'Активен' : 'Скрыт'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-secondary truncate">{product.name}</h3>
                <p className="text-slate-500 text-sm truncate mb-2">{product.category}</p>
                <div className="font-bold text-primary">{product.price.toLocaleString()} сом</div>
              </div>
              <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-4 justify-center">
                <Link href={`/profile/products/${product.id}`} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center gap-2">
                  <Edit className="w-5 h-5" /> <span className="sm:hidden text-sm font-medium">Редактировать</span>
                </Link>
                <button onClick={() => handleDelete(product.id)} className="p-2 text-slate-400 hover:text-danger hover:bg-danger/5 rounded-lg transition-colors flex items-center gap-2">
                  <Trash2 className="w-5 h-5" /> <span className="sm:hidden text-sm font-medium">Удалить</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
