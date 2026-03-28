'use client';

import { Search, MapPin, Star, BadgeCheck, MessageSquare, Plus, Filter, ChevronDown, Package, Wrench, ShoppingCart, Megaphone, Tag, X, LayoutGrid, List, Settings2, Users, Sliders } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useMemo, useEffect } from 'react';
import { getAllProducts, getAllProfiles } from '@/lib/data';
import { constructionStages, nomenclatureGroups, type NomenclatureCategory, type NomenclatureType, type MockProduct, type MockUser } from '@/lib/mockDb';
import { useAuth } from '@/components/AuthProvider';

type ViewMode = 'grid' | 'table';
type CatalogMode = 'products' | 'suppliers';
type SupplierFilter = 'all' | 'products-only' | 'services-only' | 'mixed';

export default function CatalogPage() {
  const [allProducts, setAllProducts] = useState<MockProduct[]>([]);
  const [allUsers, setAllUsers] = useState<MockUser[]>([]);
  const { userData, openAuthModal, canAccessChat } = useAuth();
  const isSupplier = userData?.role === 'supplier' || userData?.role === 'developer';

  useEffect(() => {
    Promise.all([getAllProducts(true), getAllProfiles()]).then(([p, u]) => {
      setAllProducts(p);
      setAllUsers(u);
    });
  }, []);

  // View modes
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [catalogMode, setCatalogMode] = useState<CatalogMode>('products');

  // Table columns visible
  const [tableColumns, setTableColumns] = useState({ name: true, supplier: true, category: true, price: true, rating: true, region: true, stage: true });
  const [showTableConfig, setShowTableConfig] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState<NomenclatureCategory | 'ALL'>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [ratingMin, setRatingMin] = useState('');
  const [onlyPromoted, setOnlyPromoted] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  
  // Supplier view filter
  const [supplierFilter, setSupplierFilter] = useState<SupplierFilter>('all');

  // Get unique types
  const availableTypes = useMemo(() => {
    const types = new Set(allProducts.map(p => p.nomenclatureType));
    return Array.from(types);
  }, [allProducts]);

  // Get groups for selected type
  const availableGroups = useMemo(() => {
    if (!typeFilter) return [];
    const cat = categoryFilter !== 'ALL' ? categoryFilter : undefined;
    return nomenclatureGroups.filter(g => g.type === typeFilter && (!cat || g.category === cat));
  }, [typeFilter, categoryFilter]);

  // Active filters count
  const activeFiltersCount = [
    categoryFilter !== 'ALL',
    stageFilter,
    typeFilter,
    groupFilter,
    priceMin,
    priceMax,
    ratingMin,
    onlyPromoted,
    onlyNew,
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    setCategoryFilter('ALL');
    setStageFilter('');
    setTypeFilter('');
    setGroupFilter('');
    setSearchQuery('');
    setPriceMin('');
    setPriceMax('');
    setRatingMin('');
    setOnlyPromoted(false);
    setOnlyNew(false);
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    let base = isSupplier ? allProducts.filter(p => p.supplierId === userData?.uid) : allProducts;
    
    return base.filter(p => {
      if (categoryFilter !== 'ALL' && p.nomenclatureCategory !== categoryFilter) return false;
      if (stageFilter && p.constructionStage !== stageFilter) return false;
      if (typeFilter && p.nomenclatureType !== typeFilter) return false;
      if (groupFilter && p.groupId !== groupFilter) return false;
      if (priceMin && p.price < Number(priceMin)) return false;
      if (priceMax && p.price > Number(priceMax)) return false;
      if (ratingMin && p.rating < Number(ratingMin)) return false;
      if (onlyPromoted && !p.isPromoted) return false;
      if (onlyNew && !p.isNew) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) ||
               p.supplierName.toLowerCase().includes(q) ||
               p.description.toLowerCase().includes(q) ||
               p.tags.some(t => t.toLowerCase().includes(q));
      }
      return true;
    });
  }, [allProducts, isSupplier, userData?.uid, categoryFilter, stageFilter, typeFilter, groupFilter, priceMin, priceMax, ratingMin, onlyPromoted, onlyNew, searchQuery]);

  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (a.isPromoted && !b.isPromoted) return -1;
      if (!a.isPromoted && b.isPromoted) return 1;
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return 0;
    });
  }, [filteredProducts]);

  // Suppliers for supplier catalog mode
  const suppliers = useMemo(() => {
    const sups = allUsers.filter(u => u.role === 'supplier' || u.role === 'developer');
    return sups.map(s => {
      const prods = allProducts.filter(p => p.supplierId === s.uid);
      const hasProd = prods.some(p => p.nomenclatureCategory === ('\u0422\u043e\u0432\u0430\u0440' as NomenclatureCategory));
      const hasSvc = prods.some(p => p.nomenclatureCategory === ('\u0423\u0441\u043b\u0443\u0433\u0430' as NomenclatureCategory));
      const type: 'products-only' | 'services-only' | 'mixed' = hasProd && hasSvc ? 'mixed' : hasProd ? 'products-only' : 'services-only';
      const avgRating = prods.length > 0 ? prods.reduce((s, p) => s + p.rating, 0) / prods.length : 0;
      return { ...s, products: prods, type, avgRating, productCount: prods.length };
    }).filter(s => s.productCount > 0);
  }, [allUsers, allProducts]);

  const filteredSuppliers = useMemo(() => {
    let list = suppliers;
    if (supplierFilter !== 'all') list = list.filter(s => s.type === supplierFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(q) || 
        (s.companyName || '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [suppliers, supplierFilter, searchQuery]);

  const handleChatClick = () => {
    if (!userData) { openAuthModal(); return; }
    if (!canAccessChat) {
      alert('\u0427\u0430\u0442 \u0434\u043e\u0441\u0442\u0443\u043f\u0435\u043d \u043f\u043e\u0441\u043b\u0435 \u0432\u0435\u0440\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u0438 \u0443\u0440\u043e\u0432\u043d\u044f 2. \u0417\u0430\u043f\u043e\u043b\u043d\u0438\u0442\u0435 \u0418\u041d\u041d \u0432 \u043f\u0440\u043e\u0444\u0438\u043b\u0435.');
      return;
    }
  };

  const CAT_TOVAR: NomenclatureCategory = '\u0422\u043e\u0432\u0430\u0440' as NomenclatureCategory;
  const CAT_USLUGA: NomenclatureCategory = '\u0423\u0441\u043b\u0443\u0433\u0430' as NomenclatureCategory;

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-24">
      {/* Header for suppliers */}
      {isSupplier && (
        <div className="mb-6">
          <h1 className="text-2xl font-heading font-bold text-secondary">{'\u041c\u043e\u0439 \u043a\u0430\u0442\u0430\u043b\u043e\u0433'}</h1>
          <p className="text-sm text-slate-500">{'\u0422\u043e\u043b\u044c\u043a\u043e \u0432\u0430\u0448\u0438 \u0442\u043e\u0432\u0430\u0440\u044b \u0438 \u0443\u0441\u043b\u0443\u0433\u0438'}</p>
        </div>
      )}

      {/* Two Main Category Buttons for Buyers */}
      {!isSupplier && catalogMode === 'products' && (
        <section className="mb-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => { setCategoryFilter(CAT_TOVAR); setTypeFilter(''); setStageFilter(''); setGroupFilter(''); }}
              className={`relative overflow-hidden rounded-2xl p-6 md:p-8 text-left transition-all ${
                categoryFilter === CAT_TOVAR
                  ? 'bg-secondary text-white shadow-lg scale-[1.02]'
                  : 'bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <Package className={`w-10 h-10 mb-3 ${categoryFilter === CAT_TOVAR ? 'text-accent' : 'text-primary'}`} />
              <h3 className="font-heading font-bold text-lg md:text-xl mb-1">{'\u041a\u0443\u043f\u0438\u0442\u044c \u0422\u043e\u0432\u0430\u0440'}</h3>
              <p className={`text-xs ${categoryFilter === CAT_TOVAR ? 'text-slate-300' : 'text-slate-500'}`}>
                {'\u041c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u044b, \u0418\u043d\u0441\u0442\u0440\u0443\u043c\u0435\u043d\u0442\u044b, \u041e\u0431\u043e\u0440\u0443\u0434\u043e\u0432\u0430\u043d\u0438\u0435'}
              </p>
            </button>
            <button
              onClick={() => { setCategoryFilter(CAT_USLUGA); setTypeFilter(''); setStageFilter(''); setGroupFilter(''); }}
              className={`relative overflow-hidden rounded-2xl p-6 md:p-8 text-left transition-all ${
                categoryFilter === CAT_USLUGA
                  ? 'bg-secondary text-white shadow-lg scale-[1.02]'
                  : 'bg-white border border-slate-200 hover:border-primary/30 hover:shadow-md'
              }`}
            >
              <Wrench className={`w-10 h-10 mb-3 ${categoryFilter === CAT_USLUGA ? 'text-accent' : 'text-primary'}`} />
              <h3 className="font-heading font-bold text-lg md:text-xl mb-1">{'\u041a\u0443\u043f\u0438\u0442\u044c \u0423\u0441\u043b\u0443\u0433\u0443'}</h3>
              <p className={`text-xs ${categoryFilter === CAT_USLUGA ? 'text-slate-300' : 'text-slate-500'}`}>
                {'\u0421\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u0438, \u0410\u0440\u0435\u043d\u0434\u0430 \u0442\u0435\u0445\u043d\u0438\u043a\u0438, \u041f\u0440\u043e\u0435\u043a\u0442\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u0435'}
              </p>
            </button>
          </div>
        </section>
      )}

      {/* Catalog Mode Tabs (Buyers only) */}
      {!isSupplier && (
        <div className="flex items-center gap-3 mb-6">
          <div className="flex bg-slate-100 rounded-xl p-1">
            <button onClick={() => setCatalogMode('products')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${catalogMode === 'products' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Package className="w-4 h-4" /> {'\u041f\u043e \u0442\u043e\u0432\u0430\u0440\u0430\u043c'}
            </button>
            <button onClick={() => setCatalogMode('suppliers')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${catalogMode === 'suppliers' ? 'bg-white text-secondary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
              <Users className="w-4 h-4" /> {'\u041f\u043e \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430\u043c'}
            </button>
          </div>
        </div>
      )}

      {/* Search & Filters Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 sticky top-16 z-40 bg-background py-2">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder={catalogMode === 'suppliers' ? '\u041f\u043e\u0438\u0441\u043a \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430...' : '\u041f\u043e\u0438\u0441\u043a \u043f\u043e \u043d\u0430\u0437\u0432\u0430\u043d\u0438\u044e, \u043a\u043e\u043c\u043f\u0430\u043d\u0438\u0438 \u0438\u043b\u0438 \u0442\u0435\u0433\u0430\u043c...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" 
          />
        </div>
        <div className="flex items-center gap-2">
          {catalogMode === 'products' && (
            <>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 h-12 px-5 rounded-2xl border font-medium text-sm transition-colors whitespace-nowrap ${
                  showFilters ? 'bg-primary text-white border-primary' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Filter className="w-4 h-4" /> {'\u0424\u0438\u043b\u044c\u0442\u0440\u044b'} {activeFiltersCount > 0 && <span className="bg-white/20 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">{activeFiltersCount}</span>}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </button>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="flex items-center gap-1 h-12 px-4 rounded-2xl border border-red-200 text-red-500 text-sm font-medium hover:bg-red-50 transition-colors whitespace-nowrap">
                  <X className="w-4 h-4" /> {'\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c'}
                </button>
              )}
              <div className="flex bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <button onClick={() => setViewMode('grid')} className={`h-12 w-12 flex items-center justify-center transition-colors ${viewMode === 'grid' ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button onClick={() => setViewMode('table')} className={`h-12 w-12 flex items-center justify-center transition-colors ${viewMode === 'table' ? 'bg-secondary text-white' : 'text-slate-500 hover:bg-slate-50'}`}>
                  <List className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
          {isSupplier && (
            <Link href="/add-product" className="flex items-center gap-2 h-12 px-5 bg-primary text-white font-bold rounded-2xl hover:bg-primary-dark transition-colors whitespace-nowrap shadow-sm">
              <Plus className="w-5 h-5" /> {'\u0414\u043e\u0431\u0430\u0432\u0438\u0442\u044c \u0442\u043e\u0432\u0430\u0440'}
            </Link>
          )}
        </div>
      </div>

      {/* Expanded Filters (Products mode) */}
      {showFilters && catalogMode === 'products' && (
        <div className="bg-white rounded-2xl p-5 mb-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{'\u041f\u043e \u0432\u0438\u0434\u0443'}</p>
            <div className="flex flex-wrap gap-2">
              {availableTypes.map(type => (
                <button
                  key={type}
                  onClick={() => { setTypeFilter(typeFilter === type ? '' : type); setGroupFilter(''); }}
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

          {typeFilter && availableGroups.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{'\u041f\u043e \u0433\u0440\u0443\u043f\u043f\u0435'}</p>
              <div className="flex flex-wrap gap-2">
                {availableGroups.map(g => (
                  <button
                    key={g.id}
                    onClick={() => setGroupFilter(groupFilter === g.id ? '' : g.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      groupFilter === g.id 
                        ? 'bg-secondary text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {g.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{'\u041f\u043e \u044d\u0442\u0430\u043f\u0443 \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u0441\u0442\u0432\u0430'}</p>
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

          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-sm text-primary font-medium hover:underline"
          >
            <Sliders className="w-4 h-4" />
            {showAdvancedFilters ? '\u0421\u043a\u0440\u044b\u0442\u044c \u0440\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u043d\u044b\u0435 \u0444\u0438\u043b\u044c\u0442\u0440\u044b' : '\u0420\u0430\u0441\u0448\u0438\u0440\u0435\u043d\u043d\u044b\u0435 \u0444\u0438\u043b\u044c\u0442\u0440\u044b'}
            <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
          </button>

          {showAdvancedFilters && (
            <div className="bg-slate-50 rounded-xl p-4 space-y-4 border border-slate-100">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{'\u0414\u0438\u0430\u043f\u0430\u0437\u043e\u043d \u0446\u0435\u043d\u044b (KGS)'}</p>
                <div className="flex items-center gap-3">
                  <input type="number" value={priceMin} onChange={e => setPriceMin(e.target.value)} placeholder={'\u043e\u0442'} className="w-32 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                  <span className="text-slate-400">{'\u2014'}</span>
                  <input type="number" value={priceMax} onChange={e => setPriceMax(e.target.value)} placeholder={'\u0434\u043e'} className="w-32 h-10 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{'\u041c\u0438\u043d\u0438\u043c\u0430\u043b\u044c\u043d\u044b\u0439 \u0440\u0435\u0439\u0442\u0438\u043d\u0433'}</p>
                <div className="flex gap-2">
                  {['4', '4.5', '4.8'].map(r => (
                    <button key={r} onClick={() => setRatingMin(ratingMin === r ? '' : r)} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${ratingMin === r ? 'bg-accent text-secondary' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                      <Star className="w-3 h-3" /> {r}+
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => setOnlyPromoted(!onlyPromoted)} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${onlyPromoted ? 'bg-accent text-secondary' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  <Megaphone className="w-3 h-3" /> {'\u0422\u043e\u043b\u044c\u043a\u043e \u0440\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0443\u0435\u043c\u044b\u0435'}
                </button>
                <button onClick={() => setOnlyNew(!onlyNew)} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 transition-colors ${onlyNew ? 'bg-primary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                  {'\u0422\u043e\u043b\u044c\u043a\u043e \u043d\u043e\u0432\u0438\u043d\u043a\u0438'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Supplier filter bar for supplier mode */}
      {catalogMode === 'suppliers' && !isSupplier && (
        <div className="flex flex-wrap gap-2 mb-6">
          {([['all', '\u0412\u0441\u0435'], ['products-only', '\u0422\u043e\u043b\u044c\u043a\u043e \u0442\u043e\u0432\u0430\u0440\u044b'], ['services-only', '\u0422\u043e\u043b\u044c\u043a\u043e \u0443\u0441\u043b\u0443\u0433\u0438'], ['mixed', '\u0421\u043c\u0435\u0448\u0430\u043d\u043d\u044b\u0435']] as const).map(([key, label]) => (
            <button key={key} onClick={() => setSupplierFilter(key as SupplierFilter)} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${supplierFilter === key ? 'bg-secondary text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
              {label}
            </button>
          ))}
        </div>
      )}

      {/* ========== PRODUCTS VIEW ========== */}
      {catalogMode === 'products' && (
        <>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-slate-500">
              {'\u041d\u0430\u0439\u0434\u0435\u043d\u043e: '}<span className="font-bold text-secondary">{sortedProducts.length}</span>{' \u043f\u043e\u0437\u0438\u0446\u0438\u0439'}
              {isSupplier && <span className="text-slate-400 ml-1">{' (\u0442\u043e\u043b\u044c\u043a\u043e \u0432\u0430\u0448\u0438)'}</span>}
            </p>
            {viewMode === 'table' && (
              <button onClick={() => setShowTableConfig(!showTableConfig)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-primary transition-colors">
                <Settings2 className="w-4 h-4" /> {'\u041d\u0430\u0441\u0442\u0440\u043e\u0438\u0442\u044c \u0442\u0430\u0431\u043b\u0438\u0446\u0443'}
              </button>
            )}
          </div>

          {showTableConfig && viewMode === 'table' && (
            <div className="bg-white rounded-xl p-4 mb-4 border border-slate-100 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary mb-2">{'\u0412\u0438\u0434\u0438\u043c\u044b\u0435 \u0441\u0442\u043e\u043b\u0431\u0446\u044b'}</p>
              <div className="flex flex-wrap gap-3">
                {([['name', '\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'], ['supplier', '\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a'], ['category', '\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f'], ['price', '\u0426\u0435\u043d\u0430'], ['rating', '\u0420\u0435\u0439\u0442\u0438\u043d\u0433'], ['region', '\u0420\u0435\u0433\u0438\u043e\u043d'], ['stage', '\u042d\u0442\u0430\u043f']] as const).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={tableColumns[key]} onChange={() => setTableColumns(prev => ({ ...prev, [key]: !prev[key] }))} className="rounded accent-primary" />
                    {label}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedProducts.map((product) => (
                <div key={product.id} className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100">
                  <Link href={`/product/${product.id}`} className="block flex-1">
                    <div className="relative h-48 overflow-hidden">
                      <Image src={product.image} alt={product.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {product.isPromoted && (
                          <span className="px-2 py-0.5 bg-accent text-secondary text-[10px] font-bold rounded flex items-center gap-1">
                            <Megaphone className="w-3 h-3" /> {'\u0420\u0415\u041a\u041e\u041c\u0415\u041d\u0414\u0423\u0415\u041c'}
                          </span>
                        )}
                        {product.isTop && (
                          <span className="px-2 py-0.5 bg-success text-white text-[10px] font-bold rounded">TOP</span>
                        )}
                        {product.isNew && (
                          <span className="px-2 py-0.5 bg-primary text-white text-[10px] font-bold rounded">{'\u041d\u041e\u0412\u0418\u041d\u041a\u0410'}</span>
                        )}
                      </div>
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-0.5 rounded-md text-[10px] font-bold text-slate-600">
                        {product.nomenclatureCategory} {'\u2192'} {product.nomenclatureType}
                      </div>
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
                        <Star className="w-3 h-3 text-accent fill-accent" />
                        <span className="text-xs font-bold">{product.rating}</span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-heading text-base font-bold text-secondary leading-tight">{product.supplierName}</h3>
                        <BadgeCheck className="w-5 h-5 text-success shrink-0" />
                      </div>
                      <p className="text-[11px] text-slate-400 mb-2">
                        <MapPin className="w-3 h-3 inline" /> {product.region} {'\u00b7'} {product.groupName}
                        {product.constructionStage && ` \u00b7 ${product.constructionStage}`}
                      </p>
                      <h4 className="font-medium text-slate-800 mb-1 text-sm">{product.name}</h4>
                      <p className="text-xs text-slate-500 mb-3 line-clamp-2">{product.description}</p>

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
                      
                      <div className="flex flex-wrap gap-1.5">
                        {product.tags.map(tag => (
                          <span key={tag} className="bg-slate-100 px-2 py-0.5 rounded-md text-[10px] text-slate-600 font-medium">{tag}</span>
                        ))}
                      </div>
                    </div>
                  </Link>
                    
                  <div className="flex items-center gap-2 px-5 pb-5">
                    <Link href={`/create?productId=${product.id}`} className="flex-1 bg-primary text-white h-10 rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-1">
                      <ShoppingCart className="w-4 h-4" /> {'\u0417\u0430\u043f\u0440\u043e\u0441'}
                    </Link>
                    <button 
                      onClick={handleChatClick}
                      className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Table View */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {tableColumns.name && <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u041d\u0430\u0437\u0432\u0430\u043d\u0438\u0435'}</th>}
                    {tableColumns.supplier && <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u041f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a'}</th>}
                    {tableColumns.category && <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u041a\u0430\u0442\u0435\u0433\u043e\u0440\u0438\u044f'}</th>}
                    {tableColumns.price && <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u0426\u0435\u043d\u0430'}</th>}
                    {tableColumns.rating && <th className="text-center p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u0420\u0435\u0439\u0442\u0438\u043d\u0433'}</th>}
                    {tableColumns.region && <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u0420\u0435\u0433\u0438\u043e\u043d'}</th>}
                    {tableColumns.stage && <th className="text-left p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u042d\u0442\u0430\u043f'}</th>}
                    <th className="text-right p-4 text-xs font-bold uppercase tracking-wider text-secondary">{'\u0414\u0435\u0439\u0441\u0442\u0432\u0438\u044f'}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProducts.map((product) => (
                    <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      {tableColumns.name && (
                        <td className="p-4">
                          <Link href={`/product/${product.id}`} className="font-medium text-secondary hover:text-primary transition-colors">
                            {product.name}
                          </Link>
                          <div className="flex gap-1 mt-1">
                            {product.isPromoted && <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[9px] font-bold rounded">REC</span>}
                            {product.isNew && <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[9px] font-bold rounded">NEW</span>}
                          </div>
                        </td>
                      )}
                      {tableColumns.supplier && (
                        <td className="p-4">
                          <Link href={`/supplier/${product.supplierId}`} className="text-slate-600 hover:text-primary transition-colors flex items-center gap-1">
                            {product.supplierName} <BadgeCheck className="w-3 h-3 text-success" />
                          </Link>
                        </td>
                      )}
                      {tableColumns.category && (
                        <td className="p-4">
                          <span className="text-xs text-slate-500">{product.nomenclatureCategory} {'\u2192'} {product.nomenclatureType}</span>
                          <br /><span className="text-xs text-slate-400">{product.groupName}</span>
                        </td>
                      )}
                      {tableColumns.price && (
                        <td className="p-4 text-right font-bold text-primary whitespace-nowrap">{product.price.toLocaleString()} / {product.unit}</td>
                      )}
                      {tableColumns.rating && (
                        <td className="p-4 text-center">
                          <span className="flex items-center justify-center gap-1">
                            <Star className="w-3 h-3 text-accent fill-accent" /> {product.rating}
                          </span>
                        </td>
                      )}
                      {tableColumns.region && <td className="p-4 text-slate-500">{product.region}</td>}
                      {tableColumns.stage && <td className="p-4 text-slate-500 text-xs">{product.constructionStage || '\u2014'}</td>}
                      <td className="p-4 text-right">
                        <Link href={`/create?productId=${product.id}`} className="text-primary font-bold text-xs hover:underline">{'\u0417\u0430\u043f\u0440\u043e\u0441'}</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {sortedProducts.length === 0 && (
                <div className="text-center py-12">
                  <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">{'\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'}</p>
                </div>
              )}
            </div>
          )}

          {sortedProducts.length === 0 && viewMode === 'grid' && (
            <div className="text-center py-16">
              <Tag className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-heading font-bold text-secondary mb-2">{'\u041d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u043d\u0430\u0439\u0434\u0435\u043d\u043e'}</h3>
              <p className="text-sm text-slate-500 mb-4">{'\u041f\u043e\u043f\u0440\u043e\u0431\u0443\u0439\u0442\u0435 \u0438\u0437\u043c\u0435\u043d\u0438\u0442\u044c \u043f\u0430\u0440\u0430\u043c\u0435\u0442\u0440\u044b \u043f\u043e\u0438\u0441\u043a\u0430 \u0438\u043b\u0438 \u0444\u0438\u043b\u044c\u0442\u0440\u044b'}</p>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="text-primary font-bold text-sm hover:underline">{'\u0421\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u0432\u0441\u0435 \u0444\u0438\u043b\u044c\u0442\u0440\u044b'}</button>
              )}
            </div>
          )}
        </>
      )}

      {/* ========== SUPPLIERS VIEW ========== */}
      {catalogMode === 'suppliers' && !isSupplier && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {'\u041d\u0430\u0439\u0434\u0435\u043d\u043e: '}<span className="font-bold text-secondary">{filteredSuppliers.length}</span>{' \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u043e\u0432'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSuppliers.map(s => (
              <Link key={s.uid} href={`/supplier/${s.uid}`} className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl shrink-0">
                    {(s.companyName || s.name).charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-secondary truncate">{s.companyName || s.name}</h3>
                      {s.verificationLevel >= 2 && <BadgeCheck className="w-4 h-4 text-success shrink-0" />}
                    </div>
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold mt-1 ${
                      s.type === 'mixed' ? 'bg-purple-100 text-purple-700' : s.type === 'products-only' ? 'bg-blue-100 text-blue-700' : 'bg-primary/10 text-primary'
                    }`}>
                      {s.type === 'mixed' ? '\u0422\u043e\u0432\u0430\u0440\u044b + \u0423\u0441\u043b\u0443\u0433\u0438' : s.type === 'products-only' ? '\u0422\u043e\u043b\u044c\u043a\u043e \u0442\u043e\u0432\u0430\u0440\u044b' : '\u0422\u043e\u043b\u044c\u043a\u043e \u0443\u0441\u043b\u0443\u0433\u0438'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="font-bold text-secondary">{s.productCount}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">{'\u041f\u043e\u0437\u0438\u0446\u0438\u0439'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-3 h-3 text-accent fill-accent" />
                      <span className="font-bold text-secondary">{s.avgRating.toFixed(1)}</span>
                    </div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">{'\u0420\u0435\u0439\u0442\u0438\u043d\u0433'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <div className="font-bold text-primary text-xs">{s.subscription}</div>
                    <div className="text-[9px] text-slate-500 uppercase font-bold">{'\u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430'}</div>
                  </div>
                </div>
                <p className="text-xs text-primary font-medium mt-4 text-center group-hover:underline">{'\u041e\u0442\u043a\u0440\u044b\u0442\u044c \u043a\u0430\u0442\u0430\u043b\u043e\u0433 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430 \u2192'}</p>
              </Link>
            ))}
          </div>
          {filteredSuppliers.length === 0 && (
            <div className="text-center py-16">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">{'\u041d\u0435\u0442 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u043e\u0432 \u043f\u043e \u0432\u044b\u0431\u0440\u0430\u043d\u043d\u043e\u043c\u0443 \u0444\u0438\u043b\u044c\u0442\u0440\u0443'}</p>
            </div>
          )}
        </>
      )}

      {/* Recommended Suppliers Banner */}
      {!isSupplier && catalogMode === 'products' && (
        <div className="mt-12 bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center border-l-4 border-primary shadow-sm">
          <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shrink-0 relative">
            <Image src="https://picsum.photos/seed/metal/800/450" alt="Metal" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-accent/20 text-accent text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                <Megaphone className="w-3 h-3" /> {'\u0420\u0415\u041a\u041e\u041c\u0415\u041d\u0414\u0423\u0415\u041c\u042b\u0419 \u041f\u041e\u0421\u0422\u0410\u0412\u0429\u0418\u041a'}
              </span>
            </div>
            <h3 className="font-heading text-2xl font-bold text-secondary mb-2">{'\u041e\u0441\u041e\u041e \u0421\u0442\u0440\u043e\u0439\u041c\u0430\u0441\u0442\u0435\u0440'}</h3>
            <p className="text-slate-600 mb-4 text-sm">{'\u041f\u043e\u043b\u043d\u044b\u0439 \u0441\u043f\u0435\u043a\u0442\u0440 \u0441\u0442\u0440\u043e\u0438\u0442\u0435\u043b\u044c\u043d\u044b\u0445 \u043c\u0430\u0442\u0435\u0440\u0438\u0430\u043b\u043e\u0432 \u0438 \u0443\u0441\u043b\u0443\u0433. \u0412\u0435\u0440\u0438\u0444\u0438\u0446\u0438\u0440\u043e\u0432\u0430\u043d\u043d\u044b\u0439 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a \u0441 \u043b\u0438\u0446\u0435\u043d\u0437\u0438\u0435\u0439.'}</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">{'\u0422\u043e\u0432\u0430\u0440\u043e\u0432'}</p><p className="font-bold text-secondary">24</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">{'\u0420\u0435\u0439\u0442\u0438\u043d\u0433'}</p><div className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" /><p className="font-bold text-secondary">4.9</p></div></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">{'\u0412\u0435\u0440\u0438\u0444\u0438\u043a\u0430\u0446\u0438\u044f'}</p><p className="font-bold text-success">{'\u0423\u0440\u043e\u0432\u0435\u043d\u044c 3'}</p></div>
              <div><p className="text-[10px] text-slate-400 uppercase font-bold">{'\u041f\u043e\u0434\u043f\u0438\u0441\u043a\u0430'}</p><p className="font-bold text-primary">PRO</p></div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/supplier/supplier-123" className="bg-secondary text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all">{'\u041a\u0430\u0442\u0430\u043b\u043e\u0433 \u043f\u043e\u0441\u0442\u0430\u0432\u0449\u0438\u043a\u0430'}</Link>
              <Link href="/create" className="border border-primary text-primary px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all">{'\u041e\u0442\u043f\u0440\u0430\u0432\u0438\u0442\u044c \u0437\u0430\u043f\u0440\u043e\u0441'}</Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
