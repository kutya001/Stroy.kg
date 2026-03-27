'use client';

import Image from 'next/image';
import { MapPin, ArrowRight, CheckCircle2, Plus, Search, PackagePlus, Store, Package, Wrench, BarChart3, Shield, Star, BadgeCheck, Megaphone, ShoppingCart, Tag, Newspaper, TrendingUp, Users, FileText, Sparkles, Clock } from 'lucide-react';
import Link from 'next/link';
import { getAllMockRequests, getAllMockProducts, getVerificationLabel, getVerificationColor, type NomenclatureCategory } from '@/lib/mockDb';
import { useAuth } from '@/components/AuthProvider';
import { useEffect, useState, useMemo } from 'react';

// Mock news data
const mockNews = [
  { id: 'n1', title: 'Новые стандарты строительства в КР вступают в силу', summary: 'С 1 июля 2026 года начинают действовать новые строительные нормы и правила.', date: '2026-05-15', tag: 'Законодательство', image: 'https://picsum.photos/seed/news1/400/250' },
  { id: 'n2', title: 'Цены на цемент стабилизировались', summary: 'После весеннего скачка цены на основные марки цемента вернулись к среднегодовым значениям.', date: '2026-05-12', tag: 'Рынок', image: 'https://picsum.photos/seed/news2/400/250' },
  { id: 'n3', title: 'Stroy.kg запускает программу верификации PRO', summary: 'Верифицированные поставщики получат расширенный доступ к инструментам продвижения.', date: '2026-05-10', tag: 'Платформа', image: 'https://picsum.photos/seed/news3/400/250' },
];

export default function FeedPage() {
  const requests = getAllMockRequests();
  const allProducts = getAllMockProducts(true);
  const { userData, canAccessRequests } = useAuth();
  const isSupplier = userData?.role === 'supplier' || userData?.role === 'developer';
  const [mounted, setMounted] = useState(false);
  const [feedFilter, setFeedFilter] = useState<'all' | 'Товар' | 'Услуга'>('all');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Buyer feed: products sorted by promoted first
  const filteredProducts = useMemo(() => {
    let list = allProducts;
    if (feedFilter !== 'all') list = list.filter(p => p.nomenclatureCategory === feedFilter);
    return [...list].sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [allProducts, feedFilter]);

  // Top recommended (promoted products)
  const recommended = useMemo(() => allProducts.filter(p => p.isPromoted || p.isTop).slice(0, 4), [allProducts]);

  // Supplier feed: requests filtered
  const filteredRequests = useMemo(() => {
    let list = requests;
    if (feedFilter !== 'all') list = list.filter(r => r.category === feedFilter);
    return list;
  }, [requests, feedFilter]);

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">
      {/* Welcome Section */}
      <section className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-1">
          {isSupplier ? `Добро пожаловать, ${userData?.companyName || 'Поставщик'}!` : 'Добро пожаловать!'}
        </h1>
        <p className="text-slate-500 text-sm mb-4">Бишкек · Весна 2026</p>

        {/* Verification status banner (if not fully verified) */}
        {userData && (userData.verificationLevel ?? 0) < 2 && (
          <Link href="/profile" className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4 group hover:bg-amber-100 transition-colors">
            <Shield className="w-8 h-8 text-amber-500" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-secondary">Повысьте уровень верификации</p>
              <p className="text-xs text-slate-500">Текущий: <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${getVerificationColor(userData.verificationLevel)}`}>{getVerificationLabel(userData.verificationLevel)}</span> — Чат и заявки доступны с уровня 2</p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-primary transition-colors" />
          </Link>
        )}
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder={isSupplier ? "Найти заявки на материалы или услуги" : "Найти материал или услугу"} className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" />
        </div>
      </section>

      {/* ===== BUYER NAVIGATION BUTTONS ===== */}
      {!isSupplier && (
        <section className="mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/catalog" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:shadow-md transition-all group">
              <Package className="w-9 h-9 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-heading font-semibold text-sm text-secondary text-center">Каталог</span>
              <span className="text-[10px] text-slate-400">Товары и услуги</span>
            </Link>
            <Link href="/create" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:shadow-md transition-all group">
              <FileText className="w-9 h-9 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-heading font-semibold text-sm text-secondary text-center">Заявка</span>
              <span className="text-[10px] text-slate-400">Создать запрос</span>
            </Link>
            <Link href="/catalog?mode=suppliers" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:shadow-md transition-all group">
              <Users className="w-9 h-9 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-heading font-semibold text-sm text-secondary text-center">Поставщики</span>
              <span className="text-[10px] text-slate-400">Найти продавца</span>
            </Link>
            <Link href="/chats" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 hover:shadow-md transition-all group">
              <Store className="w-9 h-9 text-primary group-hover:scale-110 transition-transform" />
              <span className="font-heading font-semibold text-sm text-secondary text-center">Переговоры</span>
              <span className="text-[10px] text-slate-400">Чат с продавцами</span>
            </Link>
          </div>

          {/* Create request banner */}
          <div className="mt-4 bg-primary/10 rounded-2xl p-4 flex items-center justify-between border border-primary/20">
            <p className="text-sm text-secondary font-medium">Пусть поставщики сами вас найдут</p>
            {canAccessRequests ? (
              <Link href="/create" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors whitespace-nowrap">
                + Создать заявку
              </Link>
            ) : (
              <Link href="/profile" className="bg-slate-500 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-slate-600 transition-colors whitespace-nowrap">
                Верификация →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ===== SUPPLIER NAVIGATION ===== */}
      {isSupplier && (
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <Link href="/catalog" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
              <Store className="w-8 h-8 text-primary" />
              <span className="font-heading font-semibold text-sm text-secondary text-center">Мой каталог</span>
            </Link>
            <Link href="/add-product" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
              <PackagePlus className="w-8 h-8 text-primary" />
              <span className="font-heading font-semibold text-sm text-secondary text-center">Добавить товар</span>
            </Link>
          </div>
        </section>
      )}

      {/* ===== NEWS SECTION ===== */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-bold text-lg text-secondary flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary" /> Новости
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockNews.map(news => (
            <div key={news.id} className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all group">
              <div className="relative h-36 overflow-hidden">
                <Image src={news.image} alt={news.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-secondary text-white text-[10px] font-bold rounded">{news.tag}</span>
              </div>
              <div className="p-4">
                <h3 className="font-heading font-bold text-sm text-secondary mb-1 line-clamp-2">{news.title}</h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-2">{news.summary}</p>
                <div className="flex items-center gap-1 text-[10px] text-slate-400">
                  <Clock className="w-3 h-3" /> {mounted ? new Date(news.date).toLocaleDateString('ru-RU') : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ===== RECOMMENDATIONS (Buyer) ===== */}
      {!isSupplier && recommended.length > 0 && (
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg text-secondary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-accent" /> Рекомендации
            </h2>
            <Link href="/catalog" className="text-sm text-primary font-medium flex items-center gap-1 hover:underline">
              Все товары <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommended.map(product => (
              <Link key={product.id} href={`/product/${product.id}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-slate-100">
                <div className="relative h-32 overflow-hidden">
                  <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-2 left-2">
                    {product.isPromoted && (
                      <span className="px-2 py-0.5 bg-accent text-secondary text-[9px] font-bold rounded flex items-center gap-1">
                        <Megaphone className="w-3 h-3" /> REC
                      </span>
                    )}
                  </div>
                  <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-1.5 py-0.5 rounded flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    <span className="text-[10px] font-bold">{product.rating}</span>
                  </div>
                </div>
                <div className="p-3">
                  <h4 className="font-medium text-xs text-secondary truncate">{product.name}</h4>
                  <p className="text-sm font-bold text-primary mt-1">{product.price.toLocaleString()} KGS</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feed Filters */}
      <section className="mb-6">
        <h2 className="font-heading font-bold text-lg text-secondary mb-3">
          {isSupplier ? 'Лента заявок' : 'Лента товаров и услуг'}
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button onClick={() => setFeedFilter('all')} className={`px-5 py-2.5 rounded-full font-medium text-sm shadow-sm whitespace-nowrap transition-colors ${feedFilter === 'all' ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Все</button>
          <button onClick={() => setFeedFilter('Товар')} className={`px-5 py-2.5 rounded-full font-medium text-sm shadow-sm whitespace-nowrap transition-colors ${feedFilter === 'Товар' ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Товары</button>
          <button onClick={() => setFeedFilter('Услуга')} className={`px-5 py-2.5 rounded-full font-medium text-sm shadow-sm whitespace-nowrap transition-colors ${feedFilter === 'Услуга' ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'}`}>Услуги</button>
        </div>
      </section>

      {/* BUYER FEED: Products */}
      {!isSupplier && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-lg transition-all border border-slate-100">
              <div className="relative h-40 overflow-hidden">
                <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                  {product.isPromoted && (
                    <span className="px-2 py-0.5 bg-accent text-secondary text-[10px] font-bold rounded flex items-center gap-1">
                      <Megaphone className="w-3 h-3" /> РЕКОМЕНДУЕМ
                    </span>
                  )}
                  {product.isNew && (
                    <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">НОВИНКА</span>
                  )}
                </div>
                <div className="absolute bottom-2 right-2 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md flex items-center gap-1">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-xs font-bold">{product.rating}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-1 mb-1">
                  <h4 className="font-heading text-sm font-bold text-secondary truncate">{product.supplierName}</h4>
                  <BadgeCheck className="w-4 h-4 text-success shrink-0" />
                </div>
                <p className="text-[10px] text-slate-400 mb-1">
                  <MapPin className="w-3 h-3 inline" /> {product.region} · {product.groupName}
                </p>
                <h5 className="font-medium text-slate-800 text-sm mb-1">{product.name}</h5>
                <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} KGS / {product.unit}</p>
              </div>
            </Link>
          ))}
          {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12">
              <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500 text-sm">Нет товаров по выбранному фильтру</p>
            </div>
          )}
        </div>
      )}

      {/* SUPPLIER FEED: Requests */}
      {isSupplier && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8 flex flex-col gap-6">
            {filteredRequests.map((req, idx) => (
              <div key={req.id} className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-100">
                {idx === 0 && (
                  <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                    <Image src="https://picsum.photos/seed/construction/800/450" alt="Construction site" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${req.category === 'Товар' ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'}`}>
                      {req.category}{req.type ? ` · ${req.type}` : ''}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {mounted ? new Date(req.createdAt).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''} · {req.authorName}
                    </span>
                  </div>
                  <Link href={`/request/${req.id}`}>
                    <h3 className="text-xl font-heading font-semibold leading-tight mb-2 text-secondary hover:text-primary transition-colors">{req.title}</h3>
                  </Link>
                  <p className="text-slate-600 mb-4 text-sm line-clamp-2">{req.description}</p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm font-medium text-slate-700">
                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      Объем: {req.quantity} {req.unit}
                    </span>
                    <span className="bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                      Бюджет: {req.budget.toLocaleString()} KGS
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-slate-500">
                      <MapPin className="w-4 h-4" />
                      <span className="text-xs font-medium">{req.region}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-medium text-slate-400">{req.responsesCount} откликов</span>
                      <Link href={`/request/${req.id}`} className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                        Подробнее <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filteredRequests.length === 0 && (
              <div className="text-center py-12 bg-white rounded-2xl border border-slate-100">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500 text-sm">Нет заявок по выбранному фильтру</p>
              </div>
            )}
          </div>

          {/* Supplier Sidebar */}
          <div className="md:col-span-4 rounded-2xl bg-secondary text-white p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-fit sticky top-20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full bg-accent text-secondary text-[10px] font-bold tracking-wider uppercase">Рекомендуемый</span>
              </div>
              <h3 className="text-xl font-heading font-bold mb-3">Арматурная сталь со склада в Бишкеке</h3>
              <p className="text-sm opacity-90 mb-6 italic">&quot;Лучшие условия на объем от 50 тонн&quot;</p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> А500С все диаметры
                </li>
                <li className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Доставка за 24 часа
                </li>
                <li className="flex items-center gap-2 text-sm font-medium">
                  <CheckCircle2 className="w-4 h-4 text-accent" /> Верификация: Уровень 3
                </li>
              </ul>
            </div>
            <button className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm z-10 hover:bg-primary-dark transition-colors">Запросить прайс</button>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* FAB */}
      <Link href={isSupplier ? "/add-product" : "/create"} className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all">
        {isSupplier ? <PackagePlus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Link>
    </main>
  );
}
