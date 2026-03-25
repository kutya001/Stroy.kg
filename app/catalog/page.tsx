'use client';
import { Search, MapPin, Grid, SlidersHorizontal, Star, BadgeCheck, MessageSquare, ChevronDown, Package, Briefcase, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ProductCard } from '@/components/catalog/ProductCard';

const CATEGORIES = {
  material: [
    'Бетон и ЖБИ',
    'Арматура и металл',
    'Кирпич и блоки',
    'Лес и пиломатериалы',
    'Кровля и фасад',
    'Отделочные материалы',
    'Инженерные системы',
    'Окна и двери',
    'Гидро- и теплоизоляция',
    'Спецтехника и инструменты'
  ],
  service: [
    'Проектирование',
    'Земляные работы',
    'Фундаментные работы',
    'Монолитные работы',
    'Кладочные работы',
    'Кровельные работы',
    'Фасадные работы',
    'Отделка',
    'Полы',
    'Электромонтаж',
    'Сантехника',
    'Вентиляция и кондиционирование',
    'Остекление',
    'Ландшафт и благоустройство'
  ]
};

const REGIONS = ['Весь Кыргызстан', 'Бишкек', 'Ош', 'Чуйская область', 'Иссык-Кульская область', 'Джалал-Абадская область', 'Нарынская область', 'Таласская область', 'Баткенская область'];

export default function CatalogPage() {
  const [activeTab, setActiveTab] = useState<'material' | 'service'>('material');
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('Весь Кыргызстан');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRegionDropdown, setShowRegionDropdown] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'price_asc' | 'price_desc' | 'newest'>('rating');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Reset category when tab changes
  useEffect(() => {
    setSelectedCategory('');
  }, [activeTab]);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Fetch products that match the active tab and are active
        const { data: rawProducts, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('type', activeTab)
          .eq('isActive', true);

        if (productsError) throw productsError;
        if (!rawProducts) {
          setProducts([]);
          return;
        }

        // Extract unique supplier IDs
        const supplierIds = Array.from(new Set(rawProducts.map(p => p.supplierId)));

        // Fetch suppliers matching the IDs, filtering to ONLY include verified ones
        let suppliersMap = new Map();
        if (supplierIds.length > 0) {
          const { data: suppliers, error: suppliersError } = await supabase
            .from('users')
            .select('id, name, companyName, verificationStatus, rating, region')
            .in('id', supplierIds)
            .eq('verificationStatus', 'verified');

          if (!suppliersError && suppliers) {
            suppliers.forEach(s => {
              suppliersMap.set(s.id, s);
            });
          }
        }

        // Map products with their supplier data, and exclude those whose supplier isn't found (not verified)
        const fetchedProducts = rawProducts.reduce((acc: any[], product) => {
          const sData = suppliersMap.get(product.supplierId);

          // Only add the product if the supplier is in our map (which means they are verified)
          if (sData) {
            acc.push({
              ...product,
              supplierName: sData.companyName || sData.name || 'Неизвестный поставщик',
              supplierVerified: true,
              supplierRating: sData.rating || 5.0,
              supplierReviewCount: 0,
              region: sData.region || product.region || 'Кыргызстан'
            });
          }
          return acc;
        }, []);

        setProducts(fetchedProducts);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [activeTab]);

  let filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory ? p.category === selectedCategory : true;
    const matchesRegion = selectedRegion !== 'Весь Кыргызстан' ? p.region.includes(selectedRegion) : true;

    return matchesSearch && matchesCategory && matchesRegion;
  });

  // Apply sorting
  filteredProducts = filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc': return a.price - b.price;
      case 'price_desc': return b.price - a.price;
      case 'newest': return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'rating':
      default:
        return b.supplierRating - a.supplierRating;
    }
  });

  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-24">
      {/* Hero */}
      <section className="mb-8 relative overflow-hidden rounded-3xl bg-secondary p-8 md:p-12">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
          <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/50 via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-primary/20 text-white text-[10px] font-bold tracking-widest uppercase rounded-full mb-4">Для поставщиков</span>
          <h2 className="font-heading text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-tight mb-4">Каталог сертифицированных поставщиков</h2>
          <p className="text-lg text-slate-300 max-w-lg leading-relaxed">Прямой доступ к проверенным производителям и дистрибьюторам строительных материалов по всему Кыргызстану.</p>
        </div>
      </section>

      {/* Search & Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 sticky top-20 z-40">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Поиск по названию или категории..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none"
          />
        </div>
        <div className="flex gap-2 overflow-visible pb-2 md:pb-0 relative z-50">
          {/* Region Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowRegionDropdown(!showRegionDropdown); setShowCategoryDropdown(false); setShowSortDropdown(false); }}
              className="flex items-center gap-2 h-14 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm"
            >
              <MapPin className="w-5 h-5 text-slate-400" /> {selectedRegion} <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showRegionDropdown && (
              <div className="absolute top-full mt-2 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                {REGIONS.map(region => (
                  <button
                    key={region}
                    onClick={() => { setSelectedRegion(region); setShowRegionDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${selectedRegion === region ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}
                  >
                    {region}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowCategoryDropdown(!showCategoryDropdown); setShowRegionDropdown(false); setShowSortDropdown(false); }}
              className="flex items-center gap-2 h-14 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm"
            >
              <Grid className="w-5 h-5 text-slate-400" /> {selectedCategory || 'Все категории'} <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showCategoryDropdown && (
              <div className="absolute top-full mt-2 w-64 max-h-96 overflow-y-auto bg-white border border-slate-200 rounded-2xl shadow-xl z-50">
                <button
                  onClick={() => { setSelectedCategory(''); setShowCategoryDropdown(false); }}
                  className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${!selectedCategory ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}
                >
                  Все категории
                </button>
                {CATEGORIES[activeTab].map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setShowCategoryDropdown(false); }}
                    className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${selectedCategory === cat ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setShowSortDropdown(!showSortDropdown); setShowRegionDropdown(false); setShowCategoryDropdown(false); }}
              className="flex items-center gap-2 h-14 px-6 bg-primary/10 text-primary font-bold rounded-2xl hover:bg-primary/20 transition-colors whitespace-nowrap border border-primary/20"
            >
              <SlidersHorizontal className="w-5 h-5" />
              {sortBy === 'rating' && 'Сначала лучшие'}
              {sortBy === 'price_asc' && 'Сначала дешевые'}
              {sortBy === 'price_desc' && 'Сначала дорогие'}
              {sortBy === 'newest' && 'Сначала новые'}
            </button>
            {showSortDropdown && (
              <div className="absolute top-full mt-2 right-0 w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden z-50">
                <button onClick={() => { setSortBy('rating'); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${sortBy === 'rating' ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>Сначала лучшие</button>
                <button onClick={() => { setSortBy('price_asc'); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${sortBy === 'price_asc' ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>Сначала дешевые</button>
                <button onClick={() => { setSortBy('price_desc'); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${sortBy === 'price_desc' ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>Сначала дорогие</button>
                <button onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }} className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 transition-colors ${sortBy === 'newest' ? 'font-bold text-primary bg-primary/5' : 'text-slate-700'}`}>Сначала новые</button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('material')}
          className={`pb-4 px-2 font-bold text-lg transition-colors relative ${activeTab === 'material' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" /> Материалы
          </div>
          {activeTab === 'material' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('service')}
          className={`pb-4 px-2 font-bold text-lg transition-colors relative ${activeTab === 'service' ? 'text-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" /> Услуги
          </div>
          {activeTab === 'service' && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-t-full"></div>}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="bg-slate-50 rounded-3xl p-12 text-center flex flex-col items-center justify-center border border-slate-200">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-secondary mb-2">Ничего не найдено</h3>
          <p className="text-slate-500 max-w-md">По вашему запросу нет активных предложений. Попробуйте изменить параметры поиска или фильтры.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* Featured Supplier (Static highlight for now) */}
      {!loading && filteredProducts.length > 0 && (
        <div className="mt-12 bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center border-l-4 border-primary shadow-sm">
          <div className="w-full md:w-1/3 aspect-video rounded-xl overflow-hidden shrink-0 relative">
            <Image src="https://picsum.photos/seed/metal/800/450" alt="Metal" fill className="object-cover" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded">ПАРТНЕР ГОДА</span>
              <h3 className="font-heading text-2xl font-bold text-secondary">МеталлИнвест Групп</h3>
            </div>
            <p className="text-slate-600 mb-6 leading-relaxed text-sm">Крупнейший дистрибьютор металлопроката в СНГ. Постоянное наличие более 50 000 тонн продукции на складах. Собственный автопарк для доставки в день заказа.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Филиалы</p>
                <p className="font-bold text-secondary">12 городов</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Склад</p>
                <p className="font-bold text-secondary">&gt;50 тыс. т</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Рейтинг</p>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-accent fill-accent" />
                  <p className="font-bold text-secondary">4.95</p>
                </div>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Отгрузка</p>
                <p className="font-bold text-success">24 часа</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <button className="bg-secondary text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-slate-800 transition-all active:scale-95">Стать партнером</button>
              <button className="border border-primary text-primary px-8 py-3 rounded-xl text-sm font-bold hover:bg-primary/5 transition-all">Прайс-лист</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
