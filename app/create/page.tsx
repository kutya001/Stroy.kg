'use client';

import { Building2, Wrench, Truck, Layers, Wallet, Camera, Clock, Shield, XCircle, CheckCircle2, ArrowRight, Package, ChevronDown, ChevronRight, Lightbulb, Search, Pencil } from 'lucide-react';
import { useState, useEffect, useMemo, Suspense, useCallback } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createRequest, updateRequest, getRequestById, getRequestsByAuthor, getRequestsForSupplier, updateRequestStatus, getProductById } from '@/lib/data';
import { getStatusLabel, getStatusColor, nomenclatureGroups, type NomenclatureCategory, type NomenclatureType, type RequestStatus } from '@/lib/mockDb';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 pt-10 pb-24 text-center text-slate-400">Загрузка...</div>}>
      <CreatePageInner />
    </Suspense>
  );
}

function CreatePageInner() {
  const { user, userData, canAccessRequests, openAuthModal } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSupplier = userData?.role === 'supplier' || userData?.role === 'developer';
  const [category, setCategory] = useState<NomenclatureCategory>('Товар');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('м³');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [supplierRequests, setSupplierRequests] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<'create' | 'my'>('create');
  const [editId, setEditId] = useState<string | null>(null);

  // Clarification fields (nomenclature)
  const [showClarifications, setShowClarifications] = useState(false);
  const [nomType, setNomType] = useState<NomenclatureType | ''>('');
  const [groupId, setGroupId] = useState('');
  const [charValues, setCharValues] = useState<Record<string, string>>({});
  const [linkedProductId, setLinkedProductId] = useState<string | undefined>(undefined);

  // Pre-fill from product
  // Pre-fill from product OR edit existing request
  useEffect(() => {
    const editRequestId = searchParams.get('editId');
    if (editRequestId) {
      getRequestById(editRequestId).then(existing => {
        if (existing && existing.status === 'OPEN') {
          setEditId(editRequestId);
          setCategory(existing.category);
          setTitle(existing.title);
          setQuantity(String(existing.quantity));
          setUnit(existing.unit);
          setBudget(String(existing.budget));
          setDescription(existing.description);
          setNomType(existing.type || '');
          setGroupId(existing.groupId || '');
          setCharValues(existing.characteristics || {});
          setLinkedProductId(existing.linkedProductId);
          if (existing.type || existing.groupId || (existing.characteristics && Object.keys(existing.characteristics).length > 0)) {
            setShowClarifications(true);
          }
          setActiveTab('create');
        }
      });
      return;
    }

    const productId = searchParams.get('productId');
    if (productId) {
      getProductById(productId).then(product => {
        if (product) {
          setCategory(product.nomenclatureCategory);
          setTitle(product.name);
          setDescription(`Заявка на товар: ${product.name} (${product.supplierName}). ${product.description}`);
          setUnit(product.unit);
          setNomType(product.nomenclatureType);
          setGroupId(product.groupId);
          setCharValues(product.characteristics || {});
          setLinkedProductId(product.id);
          setShowClarifications(true);
        }
      });
    }
  }, [searchParams]);

  // Nomenclature helpers
  const availableTypes = useMemo(() => {
    const types = new Set<NomenclatureType>();
    nomenclatureGroups.filter(g => g.category === category).forEach(g => types.add(g.type));
    return Array.from(types);
  }, [category]);

  const availableGroups = useMemo(() => {
    if (!nomType) return [];
    return nomenclatureGroups.filter(g => g.category === category && g.type === nomType);
  }, [category, nomType]);

  const selectedGroup = useMemo(() => {
    return nomenclatureGroups.find(g => g.id === groupId);
  }, [groupId]);

  useEffect(() => {
    setMounted(true);
    if (user) {
      if (isSupplier) {
        getRequestsForSupplier().then(setSupplierRequests);
      } else {
        getRequestsByAuthor(user.uid).then(setMyRequests);
      }
    }
  }, [user, isSupplier]);

  // Verification gate
  if (!user) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-12 pb-24 text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-secondary mb-2">Заявки</h1>
        <p className="text-slate-500 mb-6">Войдите в систему для работы с заявками</p>
        <button onClick={openAuthModal} className="bg-primary text-white px-6 py-3 rounded-xl font-bold">Войти</button>
      </main>
    );
  }

  if (!canAccessRequests) {
    return (
      <main className="max-w-3xl mx-auto px-4 pt-12 pb-24 text-center">
        <Shield className="w-16 h-16 text-amber-400 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-secondary mb-2">Требуется верификация</h1>
        <p className="text-slate-500 mb-2">Заявки доступны после верификации уровня 2</p>
        <p className="text-sm text-slate-400 mb-6">Заполните ИНН / паспортные данные в профиле</p>
        <Link href="/profile" className="bg-primary text-white px-6 py-3 rounded-xl font-bold inline-block">Перейти в профиль</Link>
      </main>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !quantity || !description) {
      alert('Заполните обязательные поля');
      return;
    }

    const MAX_INT = 2_147_483_647;
    const budgetNum = Math.min(Math.max(Math.round(Number(budget) || 0), 0), MAX_INT);
    const quantityNum = Math.min(Math.max(Math.round(Number(quantity)), 0), MAX_INT);

    const requestData = {
      title,
      category,
      type: nomType || undefined,
      groupId: groupId || undefined,
      groupName: selectedGroup?.name || undefined,
      characteristics: Object.keys(charValues).length > 0 ? charValues : undefined,
      linkedProductId,
      description,
      budget: budgetNum,
      quantity: quantityNum,
      unit,
      region: 'Бишкек' as const,
    };

    if (editId) {
      const updated = await updateRequest(editId, requestData);
      if (updated) {
        const reqs = await getRequestsByAuthor(user.uid);
        setMyRequests(reqs);
        setEditId(null);
        router.replace('/create');
        setActiveTab('my');
      }
    } else {
      const newReq = await createRequest({
        authorId: user.uid,
        authorName: userData?.name || 'Пользователь',
        ...requestData,
      });
      if (newReq) {
        setMyRequests([newReq, ...myRequests]);
      } else {
        alert('Ошибка при создании заявки. Попробуйте выйти и войти заново.');
        return;
      }
    }

    setTitle('');
    setQuantity('');
    setBudget('');
    setDescription('');
    setNomType('');
    setGroupId('');
    setCharValues({});
    setLinkedProductId(undefined);
    setShowClarifications(false);
    setActiveTab('my');
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setTitle('');
    setQuantity('');
    setBudget('');
    setDescription('');
    setCategory('Товар');
    setNomType('');
    setGroupId('');
    setCharValues({});
    setLinkedProductId(undefined);
    setShowClarifications(false);
    router.replace('/create');
  };

  const handleStatusChange = async (reqId: string, newStatus: RequestStatus) => {
    await updateRequestStatus(reqId, newStatus, isSupplier ? user.uid : undefined, isSupplier ? userData?.name : undefined);
    if (isSupplier) {
      setSupplierRequests(await getRequestsForSupplier());
    } else {
      setMyRequests(await getRequestsByAuthor(user.uid));
    }
  };

  // Supplier view: process existing requests
  if (isSupplier) {
    return (
      <main className="max-w-5xl mx-auto px-4 pt-6 pb-24">
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-secondary">Заявки покупателей</h1>
          <p className="text-slate-500 text-sm">Просмотр и обработка входящих заявок</p>
        </div>

        <div className="space-y-4">
          {supplierRequests.length === 0 ? (
            <div className="bg-slate-50 p-12 rounded-2xl border border-slate-100 text-center">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">Нет доступных заявок</p>
            </div>
          ) : (
            supplierRequests.map(req => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.category === 'Товар' ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'}`}>{req.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(req.status)}`}>{getStatusLabel(req.status)}</span>
                    </div>
                    <Link href={`/request/${req.id}`} className="text-base font-bold text-secondary hover:text-primary transition-colors">{req.title}</Link>
                    <p className="text-xs text-slate-500 mt-1">{req.authorName} · {req.region}</p>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{mounted ? new Date(req.createdAt).toLocaleDateString('ru-RU') : ''}</span>
                </div>
                <p className="text-sm text-slate-600 mb-3 line-clamp-2">{req.description}</p>
                <div className="flex items-center gap-3 mb-4 text-sm">
                  <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-600"><Layers className="w-3 h-3 inline" /> {req.quantity} {req.unit}</span>
                  <span className="bg-slate-50 px-3 py-1 rounded-lg text-slate-600"><Wallet className="w-3 h-3 inline" /> {req.budget.toLocaleString()} KGS</span>
                </div>
                {/* Supplier actions */}
                <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
                  <Link href={`/request/${req.id}`} className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                    Подробнее
                  </Link>
                  {req.status === 'OPEN' && (
                    <button onClick={() => handleStatusChange(req.id, 'ASSIGNED')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors">
                      Взять в работу
                    </button>
                  )}
                  {req.status === 'ASSIGNED' && req.assignedSupplierId === user.uid && (
                    <button onClick={() => handleStatusChange(req.id, 'IN_PROGRESS')} className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-primary-dark transition-colors">
                      Начать обработку
                    </button>
                  )}
                  {req.status === 'IN_PROGRESS' && req.assignedSupplierId === user.uid && (
                    <>
                      <button onClick={() => handleStatusChange(req.id, 'COMPLETED')} className="px-4 py-2 bg-success text-white text-sm font-bold rounded-lg hover:opacity-90 transition-colors">
                        <CheckCircle2 className="w-4 h-4 inline mr-1" /> Выполнено
                      </button>
                      <button onClick={() => handleStatusChange(req.id, 'REJECTED')} className="px-4 py-2 bg-slate-100 text-slate-600 text-sm font-medium rounded-lg hover:bg-slate-200 transition-colors">
                        <XCircle className="w-4 h-4 inline mr-1" /> Отказать
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    );
  }

  // Buyer view: create requests + see own requests
  return (
    <main className="max-w-7xl mx-auto px-4 pt-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column */}
      <section className="lg:col-span-7 space-y-6">
        {/* Tabs */}
        <div className="flex bg-slate-100 rounded-xl p-1">
          <button onClick={() => setActiveTab('create')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'create' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500'}`}>
            Создать заявку
          </button>
          <button onClick={() => setActiveTab('my')} className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${activeTab === 'my' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500'}`}>
            Мои заявки ({myRequests.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <>
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold text-secondary">{editId ? 'Редактировать заявку' : 'Создать заявку'}</h1>
              <p className="text-slate-600">{editId ? 'Внесите изменения и сохраните.' : 'Опишите, что вам нужно, и поставщики откликнутся сами.'}</p>
            </div>

            <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
              <div className="space-y-8">
                {/* Category */}
                <div className="space-y-4">
                  <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                    <Building2 className="w-4 h-4" /> Категория
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button type="button" onClick={() => setCategory('Товар')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Товар' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
                      <Package className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Товар</span>
                    </button>
                    <button type="button" onClick={() => setCategory('Услуга')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Услуга' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
                      <Wrench className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">Услуга</span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Наименование*</label>
                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Напр: Бетон М300" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Объем / Кол-во*</label>
                    <div className="flex gap-2">
                      <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="10" className="w-2/3 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-1/3 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700">
                        <option value="м³">м³</option>
                        <option value="тонн">тонн</option>
                        <option value="шт">шт</option>
                        <option value="м²">м²</option>
                        <option value="объект">объект</option>
                        <option value="час">час</option>
                        <option value="проект">проект</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Срок выполнения</label>
                    <input type="date" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all text-slate-600 outline-none" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 px-1">Бюджет (KGS)</label>
                    <input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="до 50 000" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 px-1">Описание*</label>
                  <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Подробно опишите требования..." className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"></textarea>
                </div>

                {/* Photos */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 px-1">Прикрепить фото/документ</label>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
                      <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary" />
                      <span className="text-[10px] text-slate-500 font-medium">Добавить</span>
                    </div>
                  </div>
                </div>

                {/* Clarifications (Уточнения) */}
                <div className="space-y-4">
                  <button
                    type="button"
                    onClick={() => setShowClarifications(!showClarifications)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${showClarifications ? 'border-primary bg-primary/5' : 'border-dashed border-slate-300 hover:border-primary/30 hover:bg-slate-50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Lightbulb className={`w-5 h-5 ${showClarifications ? 'text-primary' : 'text-slate-400'}`} />
                      <div className="text-left">
                        <span className={`text-sm font-semibold ${showClarifications ? 'text-primary' : 'text-slate-700'}`}>Добавить уточнения</span>
                        <p className="text-xs text-slate-400">Укажите вид, группу и характеристики — поставщики быстрее найдут нужное</p>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showClarifications ? 'rotate-180' : ''}`} />
                  </button>

                  {showClarifications && (
                    <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100 space-y-5">
                      <div className="flex items-start gap-2 text-xs text-blue-600 bg-blue-100/50 rounded-lg p-3">
                        <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                        <span>Чем точнее вы укажете параметры, тем быстрее поставщики найдут именно то, что вам нужно. Уточнения необязательны, но значительно повышают шанс получить подходящее предложение.</span>
                      </div>

                      {/* Вид */}
                      <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                          <ChevronRight className="w-4 h-4" /> Вид
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {availableTypes.map(t => (
                            <button key={t} type="button" onClick={() => { setNomType(nomType === t ? '' : t); setGroupId(''); setCharValues({}); }} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${nomType === t ? 'bg-primary text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Группа */}
                      {nomType && availableGroups.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                            <ChevronRight className="w-4 h-4" /> Группа
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {availableGroups.map(g => (
                              <button key={g.id} type="button" onClick={() => { setGroupId(groupId === g.id ? '' : g.id); setCharValues({}); }} className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${groupId === g.id ? 'bg-secondary text-white' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}>
                                {g.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Характеристики */}
                      {selectedGroup && selectedGroup.characteristics.length > 0 && (
                        <div className="space-y-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                            <ChevronRight className="w-4 h-4" /> Характеристики ({selectedGroup.name})
                          </label>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedGroup.characteristics.map(ch => (
                              <div key={ch} className="space-y-1">
                                <label className="text-xs font-semibold text-slate-600">{ch}</label>
                                <input
                                  type="text"
                                  value={charValues[ch] || ''}
                                  onChange={(e) => setCharValues(prev => ({ ...prev, [ch]: e.target.value }))}
                                  placeholder={ch}
                                  className="w-full bg-white border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-sm"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button type="submit" className="w-full bg-primary text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all">
                  {editId ? 'Сохранить изменения' : 'Опубликовать заявку'}
                </button>
                {editId && (
                  <button type="button" onClick={handleCancelEdit} className="w-full text-slate-500 font-medium py-3 rounded-xl hover:bg-slate-50 transition-all">
                    Отменить редактирование
                  </button>
                )}
              </div>
            </form>
          </>
        ) : (
          /* My Requests List (inline) */
          <div className="space-y-4">
            {myRequests.length === 0 ? (
              <div className="bg-slate-50 p-12 rounded-2xl border border-slate-100 text-center">
                <p className="text-slate-500">У вас пока нет заявок</p>
                <button onClick={() => setActiveTab('create')} className="mt-4 text-primary font-bold text-sm">Создать первую заявку</button>
              </div>
            ) : (
              myRequests.map(req => (
                <div key={req.id} className="bg-white p-5 rounded-2xl border-l-4 border-primary shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-primary uppercase">{req.category}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getStatusColor(req.status)}`}>{getStatusLabel(req.status)}</span>
                    </div>
                    <span className="text-xs text-slate-400">{mounted ? new Date(req.createdAt).toLocaleDateString('ru-RU') : ''}</span>
                  </div>
                  <h3 className="text-base font-bold text-secondary mb-2">{req.title}</h3>
                  <p className="text-xs text-slate-500 mb-3">{req.description}</p>
                  <div className="flex gap-4 text-sm text-slate-500 mb-3">
                    <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {req.quantity} {req.unit}</span>
                    <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> {req.budget.toLocaleString()} KGS</span>
                  </div>
                  {/* Buyer actions for OPEN requests */}
                  <div className="flex flex-wrap gap-3">
                    {req.status === 'OPEN' && (
                      <Link 
                        href={`/create?editId=${req.id}`}
                        className="text-sm text-primary font-medium hover:underline flex items-center gap-1"
                      >
                        <Pencil className="w-4 h-4" /> Редактировать
                      </Link>
                    )}
                    {req.status !== 'COMPLETED' && req.status !== 'REJECTED' && (
                      <button 
                        onClick={() => handleStatusChange(req.id, 'REJECTED')} 
                        className="text-sm text-danger font-medium hover:underline flex items-center gap-1"
                      >
                        <XCircle className="w-4 h-4" /> Отменить заявку
                      </button>
                    )}
                  </div>
                  {req.assignedSupplierName && (
                    <p className="text-xs text-slate-500 mt-2">
                      Исполнитель: <span className="font-semibold text-secondary">{req.assignedSupplierName}</span>
                    </p>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-secondary border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">П1</div>
                      <div className="w-7 h-7 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[9px] text-slate-700 font-bold">+{req.responsesCount}</div>
                    </div>
                    <span className="text-sm font-semibold text-primary">{req.responsesCount} предложений</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </section>

      {/* Right Column: Summary or Tips */}
      <aside className="lg:col-span-5 space-y-6">
        <div className="bg-secondary rounded-2xl p-6 text-white">
          <h3 className="font-heading font-bold mb-3">Как работают заявки?</h3>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start gap-2"><span className="bg-accent text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</span> Вы создаете заявку с описанием и бюджетом</li>
            <li className="flex items-start gap-2"><span className="bg-accent text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</span> Поставщики видят заявку и откликаются</li>
            <li className="flex items-start gap-2"><span className="bg-accent text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</span> Вы выбираете лучшее предложение</li>
            <li className="flex items-start gap-2"><span className="bg-accent text-secondary text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">4</span> Заявка переходит в обработку</li>
          </ul>
        </div>

        {/* Status Legend */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h4 className="font-heading font-bold text-sm text-secondary mb-3">Статусы заявок</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-xs text-slate-600">Открыта — ожидает откликов</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-amber-500" /><span className="text-xs text-slate-600">Назначена — продавец назначен</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-primary" /><span className="text-xs text-slate-600">В обработке — ведется работа</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-slate-600">Выполнена — заказ завершен</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-danger" /><span className="text-xs text-slate-600">Отказано — отменена</span></div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-heading font-bold text-secondary">Активные: {myRequests.filter(r => r.status !== 'COMPLETED' && r.status !== 'REJECTED').length}</h2>
          <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">Всего: {myRequests.length}</span>
        </div>
      </aside>
    </main>
  );
}
