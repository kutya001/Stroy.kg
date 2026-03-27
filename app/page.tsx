'use client';

import Image from 'next/image';
import { MapPin, ArrowRight, CheckCircle2, Plus, Search, PackagePlus, Store } from 'lucide-react';
import Link from 'next/link';
import { getAllMockRequests } from '@/lib/mockDb';
import { useAuth } from '@/components/AuthProvider';

export default function FeedPage() {
  const requests = getAllMockRequests();
  const { userData } = useAuth();
  const isSupplier = userData?.role === 'supplier';

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">
      {/* Welcome Section */}
      <section className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-1">
          {isSupplier ? 'Добро пожаловать, Поставщик! 👋' : 'Добро пожаловать! 👋'}
        </h1>
        <p className="text-slate-500 text-sm mb-6">Бишкек · Весна 2026</p>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder={isSupplier ? "Найти заявки на материалы или услуги" : "Найти материал или услугу"} className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          {isSupplier ? (
            <>
              <Link href="/add-product" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
                <PackagePlus className="w-8 h-8 text-primary" />
                <span className="font-heading font-semibold text-sm text-secondary text-center">Добавить<br/>товар</span>
              </Link>
              <Link href="/catalog" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
                <Store className="w-8 h-8 text-primary" />
                <span className="font-heading font-semibold text-sm text-secondary text-center">Мои<br/>товары</span>
              </Link>
            </>
          ) : (
            <>
              <Link href="/catalog?type=materials" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
                <span className="text-3xl">🧱</span>
                <span className="font-heading font-semibold text-sm text-secondary text-center">Купить<br/>материалы</span>
              </Link>
              <Link href="/catalog?type=services" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
                <span className="text-3xl">🔨</span>
                <span className="font-heading font-semibold text-sm text-secondary text-center">Нанять<br/>строителей</span>
              </Link>
            </>
          )}
        </div>

        {!isSupplier && (
          <div className="bg-primary/10 rounded-2xl p-4 flex items-center justify-between border border-primary/20">
            <p className="text-sm text-secondary font-medium">Пусть поставщики сами вас найдут</p>
            <Link href="/create" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors whitespace-nowrap">
              + Создать заявку
            </Link>
          </div>
        )}
      </section>

      {/* Filters */}
      <section className="mb-6">
        <h2 className="font-heading font-bold text-lg text-secondary mb-3">Лента заявок</h2>
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <button className="px-5 py-2.5 rounded-full bg-secondary text-white font-medium text-sm shadow-sm whitespace-nowrap">Все публикации</button>
          <button className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">Объекты</button>
          <button className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">Материалы</button>
          <button className="px-5 py-2.5 rounded-full bg-white border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors whitespace-nowrap">Тендеры</button>
        </div>
      </section>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Requests List */}
        <div className="md:col-span-8 flex flex-col gap-6">
          {requests.map((req, idx) => (
            <div key={req.id} className="group cursor-pointer relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow border border-slate-100">
              {idx === 0 && (
                <div className="aspect-[16/9] w-full bg-slate-100 overflow-hidden relative">
                  <Image src="https://picsum.photos/seed/construction/800/450" alt="Construction site" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${req.category === 'Материалы' ? 'bg-secondary text-white' : 'bg-primary/10 text-primary'}`}>
                    {req.category}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {new Date(req.createdAt).toLocaleDateString('ru-RU', { hour: '2-digit', minute: '2-digit' })} • {req.authorName}
                  </span>
                </div>
                <h3 className="text-xl font-heading font-semibold leading-tight mb-2 text-secondary">{req.title}</h3>
                <p className="text-slate-600 mb-4 text-sm">{req.description}</p>
                
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
                    <button className="text-primary font-bold text-sm flex items-center gap-1 hover:gap-2 transition-all">
                      {isSupplier ? 'Откликнуться' : 'Подробнее'} <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Supplier Highlight */}
        <div className="md:col-span-4 rounded-2xl bg-secondary text-white p-6 flex flex-col justify-between shadow-sm relative overflow-hidden h-fit sticky top-20">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 rounded-full bg-accent text-secondary text-[10px] font-bold tracking-wider uppercase">Предложение</span>
            </div>
            <h3 className="text-xl font-heading font-bold mb-3">Арматурная сталь со склада в Бишкеке</h3>
            <p className="text-sm opacity-90 mb-6 italic">&quot;Для покупателей: лучшие условия на объем от 50 тонн&quot;</p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-accent" /> А500С все диаметры
              </li>
              <li className="flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-accent" /> Доставка за 24 часа
              </li>
            </ul>
          </div>
          <button className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm z-10 hover:bg-primary-dark transition-colors">Запросить прайс</button>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
        </div>
      </div>

      {/* FAB */}
      <Link href={isSupplier ? "/add-product" : "/create"} className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all">
        {isSupplier ? <PackagePlus className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
      </Link>
    </main>
  );
}
