'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, MapPin, Layers, Wallet, Clock, Package, CheckCircle2, XCircle, MessageSquare, ArrowRight, Shield, User } from 'lucide-react';
import { getRequestById, getProductById, getStatusLabel, getStatusColor, updateRequestStatus, type RequestStatus } from '@/lib/mockDb';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';

export default function RequestDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, userData, canAccessChat, openAuthModal } = useAuth();
  const isSupplier = userData?.role === 'supplier' || userData?.role === 'developer';
  const [req, setReq] = useState<ReturnType<typeof getRequestById>>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = params.id as string;
    setReq(getRequestById(id));
  }, [params.id]);

  const handleStatusChange = (newStatus: RequestStatus) => {
    if (!req || !user) return;
    updateRequestStatus(req.id, newStatus, isSupplier ? user.uid : undefined, isSupplier ? userData?.name : undefined);
    setReq(getRequestById(req.id));
  };

  const handleChatClick = () => {
    if (!userData) { openAuthModal(); return; }
    if (!canAccessChat) {
      alert('Чат доступен после верификации уровня 2. Заполните ИНН в профиле.');
      return;
    }
  };

  if (!req) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-secondary mb-2">Заявка не найдена</h1>
        <p className="text-slate-500 mb-6">Возможно, она была удалена.</p>
        <Link href="/create" className="text-primary font-bold hover:underline">← Вернуться к заявкам</Link>
      </main>
    );
  }

  const linkedProduct = req.linkedProductId ? getProductById(req.linkedProductId) : null;

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <ChevronRight className="w-3 h-3" />
        <Link href="/create" className="hover:text-primary">Заявки</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">#{req.id}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.category === 'Товар' ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'}`}>
                {req.category}{req.type ? ` · ${req.type}` : ''}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                {getStatusLabel(req.status)}
              </span>
            </div>
            <h1 className="text-2xl font-heading font-bold text-secondary mb-3">{req.title}</h1>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">{req.description}</p>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="w-4 h-4" />
              <span>{req.authorName}</span>
              <span className="text-slate-300">·</span>
              <MapPin className="w-4 h-4" />
              <span>{req.region}</span>
              <span className="text-slate-300">·</span>
              <Clock className="w-4 h-4" />
              <span>{mounted ? new Date(req.createdAt).toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}</span>
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-heading font-bold text-secondary mb-4">Детали заявки</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Layers className="w-4 h-4" /> Объем
                </div>
                <p className="text-lg font-bold text-secondary">{req.quantity} {req.unit}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                  <Wallet className="w-4 h-4" /> Бюджет
                </div>
                <p className="text-lg font-bold text-primary">{req.budget.toLocaleString()} KGS</p>
              </div>
            </div>
          </div>

          {/* Nomenclature Clarifications */}
          {(req.groupName || (req.characteristics && Object.keys(req.characteristics).length > 0)) && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-heading font-bold text-secondary mb-4">Уточнения номенклатуры</h3>
              {req.type && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <span className="text-slate-500">Вид:</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-lg font-medium text-secondary">{req.type}</span>
                </div>
              )}
              {req.groupName && (
                <div className="flex items-center gap-2 text-sm mb-3">
                  <span className="text-slate-500">Группа:</span>
                  <span className="bg-slate-100 px-3 py-1 rounded-lg font-medium text-secondary">{req.groupName}</span>
                </div>
              )}
              {req.characteristics && Object.keys(req.characteristics).length > 0 && (
                <div className="divide-y divide-slate-100 mt-3">
                  {Object.entries(req.characteristics).map(([key, val]) => (
                    <div key={key} className="flex justify-between py-2.5">
                      <span className="text-sm text-slate-500">{key}</span>
                      <span className="text-sm font-semibold text-secondary">{val}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Linked Product */}
          {linkedProduct && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <h3 className="font-heading font-bold text-secondary mb-4">Связанный товар</h3>
              <Link href={`/product/${linkedProduct.id}`} className="flex items-center gap-4 group hover:bg-slate-50 rounded-xl p-3 -m-3 transition-colors">
                <div className="w-16 h-16 rounded-lg bg-slate-100 overflow-hidden relative shrink-0">
                  <Image src={linkedProduct.image} alt={linkedProduct.name} fill className="object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-secondary text-sm">{linkedProduct.name}</h4>
                  <p className="text-xs text-slate-500">{linkedProduct.supplierName} · {linkedProduct.groupName}</p>
                  <p className="text-sm font-bold text-primary">{linkedProduct.price.toLocaleString()} KGS / {linkedProduct.unit}</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar - Actions */}
        <div className="space-y-6">
          {/* Response Stats */}
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <h3 className="font-heading font-bold text-secondary mb-4">Отклики</h3>
            <div className="text-center mb-4">
              <div className="text-4xl font-heading font-bold text-primary">{req.responsesCount}</div>
              <p className="text-xs text-slate-500">предложений от поставщиков</p>
            </div>
            {req.assignedSupplierName && (
              <div className="bg-success/10 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Назначенный исполнитель</p>
                <p className="font-bold text-secondary">{req.assignedSupplierName}</p>
              </div>
            )}
          </div>

          {/* Supplier Actions */}
          {isSupplier && (
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-heading font-bold text-secondary mb-2">Действия</h3>
              {req.status === 'OPEN' && (
                <button onClick={() => handleStatusChange('ASSIGNED')} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Откликнуться / Взять в работу
                </button>
              )}
              {req.status === 'ASSIGNED' && req.assignedSupplierId === user?.uid && (
                <button onClick={() => handleStatusChange('IN_PROGRESS')} className="w-full py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="w-4 h-4" /> Начать обработку
                </button>
              )}
              {req.status === 'IN_PROGRESS' && req.assignedSupplierId === user?.uid && (
                <>
                  <button onClick={() => handleStatusChange('COMPLETED')} className="w-full py-3 bg-success text-white rounded-xl text-sm font-bold hover:opacity-90 transition-colors flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Выполнено
                  </button>
                  <button onClick={() => handleStatusChange('REJECTED')} className="w-full py-3 bg-slate-100 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                    <XCircle className="w-4 h-4" /> Отказать
                  </button>
                </>
              )}
              <button onClick={handleChatClick} className="w-full py-3 border border-primary text-primary rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
                <MessageSquare className="w-4 h-4" /> Написать заказчику
              </button>
            </div>
          )}

          {/* Info */}
          <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h4 className="font-heading font-bold text-sm text-secondary mb-3">Статусы заявок</h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-slate-600">Открыта — ожидает откликов</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs text-slate-600">Назначена — продавец назначен</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-xs text-slate-600">В обработке — ведется работа</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-slate-600">Выполнена — заказ завершен</span></div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger" /><span className="text-xs text-slate-600">Отказано — отменена</span></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
