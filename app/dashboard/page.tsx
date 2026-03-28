'use client';

import { Eye, MessageSquare, PackageCheck, Wallet, TrendingUp, Package, Plus, Settings, Crown, ArrowRight, BarChart3 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getSupplierDashboard, getProductsBySupplierId, subscriptionPlans, getVerificationLabel, getVerificationColor, type DashboardMetrics, type MockProduct } from '@/lib/mockDb';

export default function DashboardPage() {
  const { userData, openAuthModal } = useAuth();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (userData?.uid) {
      setMetrics(getSupplierDashboard(userData.uid));
      setProducts(getProductsBySupplierId(userData.uid));
    }
  }, [userData]);

  if (!mounted) return null;

  if (!userData || (userData.role !== 'supplier' && userData.role !== 'admin')) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-12 pb-24 text-center">
        <Crown className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-secondary mb-2">Дашборд поставщика</h1>
        <p className="text-slate-500 mb-6">Эта страница доступна только для поставщиков</p>
        <button onClick={openAuthModal} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">Войти как поставщик</button>
      </main>
    );
  }

  const currentPlan = subscriptionPlans.find(p => p.tier === userData.subscription) || subscriptionPlans[0];
  const maxBar = Math.max(...(metrics?.weeklyOrders.map(w => w.orders) || [1]));

  return (
    <main className="max-w-6xl mx-auto px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-bold text-secondary">Дашборд</h1>
          <p className="text-slate-500 text-sm">Обзор показателей вашего бизнеса</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${getVerificationColor(userData.verificationLevel)}`}>
            {getVerificationLabel(userData.verificationLevel)}
          </span>
          <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
            {currentPlan.name}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Eye className="w-5 h-5 text-blue-600" />
            </div>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-heading font-bold text-secondary">{metrics?.pageViews.toLocaleString()}</p>
          <p className="text-xs text-slate-500">Просмотры страницы</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <TrendingUp className="w-4 h-4 text-success" />
          </div>
          <p className="text-2xl font-heading font-bold text-secondary">{metrics?.chatRequests}</p>
          <p className="text-xs text-slate-500">Обращения в чат</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-success/10 rounded-xl flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-success" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-secondary">{metrics?.completedOrders}</p>
          <p className="text-xs text-slate-500">Выполненные заказы</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-accent/20 rounded-xl flex items-center justify-center">
              <Wallet className="w-5 h-5 text-accent" />
            </div>
          </div>
          <p className="text-2xl font-heading font-bold text-secondary">{metrics?.revenue?.toLocaleString()} <span className="text-sm font-normal text-slate-400">сом</span></p>
          <p className="text-xs text-slate-500">Общая выручка</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-heading font-bold text-secondary">Заказы за неделю</h2>
              <p className="text-xs text-slate-500">Количество и выручка</p>
            </div>
            <BarChart3 className="w-5 h-5 text-slate-400" />
          </div>
          <div className="flex items-end gap-3 h-40">
            {metrics?.weeklyOrders.map((day) => (
              <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-secondary">{day.orders}</span>
                <div 
                  className="w-full bg-primary/80 rounded-t-lg transition-all hover:bg-primary" 
                  style={{ height: `${(day.orders / maxBar) * 100}%`, minHeight: '8px' }}
                />
                <span className="text-[10px] text-slate-500 font-medium">{day.day}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Общая выручка за неделю: <span className="font-bold text-secondary">{metrics?.weeklyOrders.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} сом</span></span>
          </div>
        </div>

        {/* Subscription & Quick Actions */}
        <div className="lg:col-span-5 space-y-4">
          {/* Subscription Status */}
          <div className="bg-secondary rounded-2xl p-6 text-white">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-accent" />
              <h3 className="font-heading font-bold">Подписка: {currentPlan.name}</h3>
            </div>
            <p className="text-sm text-slate-300 mb-4">
              {currentPlan.price > 0 ? `${currentPlan.price.toLocaleString()} сом/мес` : 'Бесплатно'}
            </p>
            <ul className="space-y-1.5 mb-4">
              {currentPlan.features.map(f => (
                <li key={f} className="text-xs text-slate-300 flex items-center gap-2">
                  <div className="w-1 h-1 bg-accent rounded-full" /> {f}
                </li>
              ))}
            </ul>
            {currentPlan.tier !== 'ENTERPRISE' && (
              <button className="w-full py-2.5 bg-primary text-white font-bold rounded-xl text-sm hover:bg-primary-dark transition-colors">
                Повысить план
              </button>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-heading font-bold text-secondary text-sm">Быстрые действия</h3>
            <Link href="/add-product" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors group">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-secondary">Добавить товар</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/catalog" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors group">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-secondary">Мои товары ({products.length})</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/chats" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors group">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-secondary">Сообщения</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </Link>
            <Link href="/profile" className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-primary/5 transition-colors group">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-secondary">Настройки профиля</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-primary transition-colors" />
            </Link>
          </div>
        </div>
      </div>

      {/* My Products Preview */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-secondary">Мои товары</h2>
          <Link href="/add-product" className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
            + Добавить <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        {products.length === 0 ? (
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 text-center">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500">У вас пока нет товаров. Добавьте первый товар!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.slice(0, 6).map(p => (
              <div key={p.id} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm flex items-start gap-4">
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-secondary truncate">{p.name}</h4>
                  <p className="text-xs text-slate-500">{p.groupName}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-bold text-primary">{p.price.toLocaleString()} /{p.unit}</span>
                    {p.isPublished ? (
                      <span className="text-[9px] bg-success/10 text-success px-1.5 py-0.5 rounded font-bold">Опубл.</span>
                    ) : (
                      <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-bold">Скрыт</span>
                    )}
                    {p.isPromoted && (
                      <span className="text-[9px] bg-accent/20 text-accent px-1.5 py-0.5 rounded font-bold">Реклама</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
