'use client';

import { Search, MapPin, Star, BadgeCheck, MessageSquare, Plus, Filter, ChevronDown, Package, Wrench, ShoppingCart, Megaphone, Eye, Tag } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo } from 'react';
import { getAllMockProducts, constructionStages, nomenclatureGroups, type NomenclatureCategory, type MockProduct } from '@/lib/mockDb';
import { useAuth } from '@/components/AuthProvider';

export default function CatalogPage() {
  const allProducts = getAllMockProducts(true); // only published
  const { userData, openAuthModal, canAccessChat } = useAuth();
  const isSupplier = userData?.role === 'supplier';

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<NomenclatureCategory | 'ALL'>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique types from products for filtering
  const availableTypes = useMemo(() => {
    const types = new Set(allProducts.map(p => p.nomenclatureType));
    return Array.from(types);
  }, [allProducts]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return allProducts.filter(p => {
      if (categoryFilter !== 'ALL' && p.nomenclatureCategory !== categoryFilter) return false;
      if (stageFilter && p.constructionStage !== stageFilter) return false;
      if (typeFilter && p.nomenclatureType !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) ||
               p.supplierName.toLowerCase().includes(q) ||
               p.description.toLowerCase().includes(q) ||
               p.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allProducts, categoryFilter, stageFilter, typeFilter, searchQuery]);

  // Promoted products first
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return 0;
    });
  }, [filteredProducts]);

  const handleChatClick = () => {
    if (!userData) { openAuthModal(); return; }
    if (!canAccessChat) {
      alert('Чат доступен после верификации уровня 2. Заполните ИНН в профиле.');
      return;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-24">
      {/* Two Main Category Buttons for Buyers */}
      {!isSupplier && (
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setCategoryFilter('Товар'); setTypeFilter(''); setStageFilter(''); }}
              className={`relative overflow-hidden rounded-2xl p-6 md:p-8 text-left transition-all ${
                categoryFilter === 'Товар'
                  ? 'bg-secondary text-white shadow-lg scale-[1.02]'
                  : 'bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <Package className={`w-10 h-10 mb-3 ${categoryFilter === 'Товар' ? 'text-accent' : 'text-primary'}`} />
              <h3 className="font-heading font-bold text-lg md:text-xl mb-1">Купить Товар</h3>
              <p className={`text-xs ${categoryFilter === 'Товар' ? 'text-slate-300' : 'text-slate-500'}`}>
                Материалы, Инструменты, Оборудование
              </p>
            </button>
            <button
              onClick={() => { setCategoryFilter('Услуга'); setTypeFilter(''); setStageFilter(''); }}
              className={`relative overflow-hidden rounded-2xl p-6 md:p-8 text-left transition-all ${
                categoryFilter === 'Услуга'
                  ? 'bg-secondary text-white shadow-lg scale-[1.02]'
                  : 'bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <Wrench className={`w-10 h-10 mb-3 ${categoryFilter === 'Услуга' ? 'text-accent' : 'text-primary'}`} />
              <h3 className="font-heading font-bold text-lg md:text-xl mb-1">Купить Услугу</h3>
              <p className={`text-xs ${categoryFilter === 'Услуга' ? 'text-slate-300' : 'text-slate-500'}`}>
                Строители, Аренда техники, Проектирование
              </p>
            </button>
          </div>
          {categoryFilter !== 'ALL' && (
            <button 
              onClick={() => { setCategoryFilter('ALL'); setTypeFilter(''); setStageFilter(''); }}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Показать все товары и услуги
            </button>
          )}
        </section>
      )}

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-16 z-40 bg-background py-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Поиск по названию, компании или тегам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" 
          />
        </div>
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 h-12 px-5 rounded-2xl border font-medium text-sm transition-colors whitespace-nowrap ${
            showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-4 h-4" /> Фильтры <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
        {isSupplier && (
          <Link href="/add-product" className="flex items-center gap-2 h-12 px-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-colors whitespace-nowrap shadow-sm">
            <Plus className="w-5 h-5" /> Добавить товар
          </Link>
        )}
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm space-y-4">
          {/* By Type */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">По виду</p>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    typeFilter === type 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          {/* By Construction Stage */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">По этапу строительства</p>
            <div className="flex flex-wrap gap-2">
              {constructionStages.map(stage => (
                <button
                  key={stage}
                  onClick={() => setStageFilter(stageFilter === stage ? '' : stage)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    stageFilter === stage 
                      ? 'bg-secondary text-white' 
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-500">
          Найдено: <span className="font-bold text-secondary">{sortedProducts.length}</span> позиций
        </p>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedProducts.map((product) => (
          <div key={product.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100">
            <div className="relative h-48 overflow-hidden">
              <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.isPromoted && (
                  <span className="px-2 py-0.5 bg-accent text-secondary text-[10px] font-bold rounded flex items-center gap-1">
                    <Megaphone className="w-3 h-3" /> РЕКОМЕНДУЕМ
                  </span>
                )}
                {product.isTop && (
                  <span className="px-2 py-0.5 bg-success text-white text-[10px] font-bold rounded">TOP</span>
                )}
                {product.isNew && (
                  <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">НОВИНКА</span>
                )}
              </div>
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600">
                {product.nomenclatureCategory} → {product.nomenclatureType}
              </div>
              <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                <Star className="w-3 h-3 text-accent fill-accent" />
                <span className="text-xs font-bold">{product.rating}</span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-1">
                <h3 className="font-heading text-base font-bold text-secondary leading-tight">{product.supplierName}</h3>
                <BadgeCheck className="w-5 h-5 text-success shrink-0" />
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                <MapPin className="w-3 h-3 inline" /> {product.region} · {product.groupName}
                {product.constructionStage && ` · ${product.constructionStage}`}
              </p>
              <h4 className="font-medium text-slate-800 mb-1 text-sm">{product.name}</h4>
              <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>

              {/* Characteristics */}
              {Object.keys(product.characteristics).length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {Object.entries(product.characteristics).slice(0, 3).map(([key, val]) => (
                    <span key={key} className="bg-slate-50 border border-slate-100 px-2 py-0.5 rounded text-[10px] text-slate-600">
                      {key}: <span className="font-semibold">{val}</span>
                    </span>
                  ))}
                </div>
              )}

              <p className="text-lg font-bold text-primary mb-3">{product.price.toLocaleString()} KGS / {product.unit}</p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {product.tags.map(tag => (
                  <span key={tag} className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] text-slate-600 font-medium">{tag}</span>
                ))}
              </div>
              
              <div className="mt-auto flex items-center gap-2">
                <Link href="/create" className="flex-1 bg-primary text-white h-10 rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-1">
                  <ShoppingCart className="w-4 h-4" /> Запрос
                </Link>
                <button 
                  onClick={handleChatClick}
                  className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
                >
                  <MessageSquare className="w-5 h-5 text-primary" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {sortedProducts.length === 0 && (
        <div className="text-center py-16">
          <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-heading font-bold text-secondary mb-2">Ничего не найдено</h3>
          <p className="text-sm text-slate-500">Попробуйте изменить параметры поиска или фильтры</p>
        </div>
      )}

      {/* Recommended Suppliers Banner */}
      <div className="mt-12 bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center border-l-4 border-primary shadow-sm">
        <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shrink-0 relative">
          <Image src="https://picsum.photos/seed/metal/800/450" alt="Metal" fill className="object-cover" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
              <Megaphone className="w-3 h-3" /> РЕКОМЕНДУЕМЫЙ ПОСТАВЩИК
            </span>
          </div>
          <h3 className="font-heading text-2xl font-bold text-secondary mb-2">ОсОО СтройМастер</h3>
          <p className="text-slate-600 mb-4 text-sm">Полный спектр строительных материалов и услуг. Верифицированный поставщик с лицензией.</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div><p className="text-[10px] text-slate-400 uppercase font-bold">Товаров</p><p className="font-bold text-secondary">24</p></div>
            <div><p className="text-[10px] text-slate-400 uppercase font-bold">Рейтинг</p><div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><p className="font-bold text-secondary">4.9</p></div></div>
            <div><p className="text-[10px] text-slate-400 uppercase font-bold">Верификация</p><p className="font-bold text-success">Уровень 3</p></div>
            <div><p className="text-[10px] text-slate-400 uppercase font-bold">Подписка</p><p className="font-bold text-primary">PRO</p></div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/create" className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">Отправить запрос</Link>
            <button className="border border-primary text-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all">Прайс-лист</button>
          </div>
        </div>
      </div>
    </main>
  );
}
