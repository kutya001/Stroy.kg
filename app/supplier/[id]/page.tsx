'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ChevronRight, Star, BadgeCheck, MapPin, Package, Wrench, Megaphone, ShoppingCart, MessageSquare, Tag, Shield } from 'lucide-react';
import { getMockUserById, getProductsBySupplierId, getVerificationLabel, getVerificationColor, type MockProduct } from '@/lib/mockDb';
import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect, useMemo } from 'react';

export default function SupplierPage() {
  const params = useParams();
  const router = useRouter();
  const { userData, openAuthModal, canAccessChat } = useAuth();
  const [supplier, setSupplier] = useState<ReturnType<typeof getMockUserById>>(null);
  const [products, setProducts] = useState<MockProduct[]>([]);
  const [catFilter, setCatFilter] = useState<'all' | 'Товар' | 'Услуга'>('all');

  useEffect(() => {
    const id = params.id as string;
    const s = getMockUserById(id);
    setSupplier(s);
    if (s) {
      setProducts(getProductsBySupplierId(s.uid).filter(p => p.isPublished));
    }
  }, [params.id]);

  const filtered = useMemo(() => {
    if (catFilter === 'all') return products;
    return products.filter(p => p.nomenclatureCategory === catFilter);
  }, [products, catFilter]);

  const productCount = products.filter(p => p.nomenclatureCategory === 'Товар').length;
  const serviceCount = products.filter(p => p.nomenclatureCategory === 'Услуга').length;
  const avgRating = products.length > 0 ? (products.reduce((s, p) => s + p.rating, 0) / products.length).toFixed(1) : '—';

  const handleChatClick = () => {
    if (!userData) { openAuthModal(); return; }
    if (!canAccessChat) {
      alert('Чат доступен после верификации уровня 2.');
      return;
    }
  };

  if (!supplier) {
    return (
      <main className="max-w-5xl mx-auto px-4 py-12 text-center">
        <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-heading font-bold text-secondary mb-2">Поставщик не найден</h1>
        <Link href="/catalog" className="text-primary font-bold hover:underline">← Вернуться в каталог</Link>
      </main>
    );
  }

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-primary hover:underline font-medium">
          <ArrowLeft className="w-4 h-4" /> Назад
        </button>
        <ChevronRight className="w-3 h-3" />
        <Link href="/catalog" className="hover:text-primary">Каталог</Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-slate-400">{supplier.companyName || supplier.name}</span>
      </div>

      {/* Supplier Card */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-3xl shrink-0">
            {(supplier.companyName || supplier.name).charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-heading font-bold text-secondary">{supplier.companyName || supplier.name}</h1>
              {supplier.verificationLevel >= 2 && <BadgeCheck className="w-6 h-6 text-success shrink-0" />}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-4">
              <span className={`px-2 py-0.5 rounded text-xs font-bold ${getVerificationColor(supplier.verificationLevel)}`}>
                {getVerificationLabel(supplier.verificationLevel)}
              </span>
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> Бишкек</span>
              {supplier.inn && <span>ИНН: {supplier.inn}</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-secondary">{productCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Товаров</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-secondary">{serviceCount}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Услуг</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="flex items-center justify-center gap-1">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <span className="text-lg font-bold text-secondary">{avgRating}</span>
                </div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Рейтинг</div>
              </div>
              <div className="bg-slate-50 rounded-xl p-3 text-center">
                <div className="text-lg font-bold text-primary">{supplier.subscription}</div>
                <div className="text-[10px] text-slate-500 uppercase font-bold">Подписка</div>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 shrink-0 w-full md:w-auto">
            <Link href="/create" className="bg-primary text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors text-center flex items-center justify-center gap-2">
              <ShoppingCart className="w-4 h-4" /> Отправить запрос
            </Link>
            <button onClick={handleChatClick} className="border border-primary text-primary px-6 py-3 rounded-xl text-sm font-bold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2">
              <MessageSquare className="w-4 h-4" /> Написать
            </button>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-heading font-bold text-secondary">Каталог поставщика</h2>
        <div className="flex gap-2">
          <button onClick={() => setCatFilter('all')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${catFilter === 'all' ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Все ({products.length})</button>
          <button onClick={() => setCatFilter('Товар')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${catFilter === 'Товар' ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Товары ({productCount})</button>
          <button onClick={() => setCatFilter('Услуга')} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${catFilter === 'Услуга' ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>Услуги ({serviceCount})</button>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((product) => (
          <Link key={product.id} href={`/product/${product.id}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all border border-slate-100">
            <div className="relative h-44 overflow-hidden">
              <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.isPromoted && (
                  <span className="px-2 py-0.5 bg-accent text-secondary text-[10px] font-bold rounded flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> РЕКОМЕНДУЕМ
                  </span>
                )}
                {product.isNew && <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">НОВИНКА</span>}
              </div>
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-xs font-bold">{product.rating}</span>
              </div>
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                <span className="bg-slate-100 px-2 py-0.5 rounded font-medium">{product.nomenclatureCategory}</span>
                <span>→</span>
                <span>{product.groupName}</span>
              </div>
              <h4 className="font-bold text-secondary text-sm mb-1">{product.name}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3">{product.description}</p>
              {Object.keys(product.characteristics).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(product.characteristics).slice(0, 2).map(([key, val]) => (
                    <span key={key} className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">
                      {key}: <span className="font-semibold">{val}</span>
                    </span>
                  ))}
                </div>
              )}
              <p className="text-lg font-bold text-primary">{product.price.toLocaleString()} KGS / {product.unit}</p>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">Нет товаров по выбранному фильтру</p>
        </div>
      )}
    </main>
  );
}
