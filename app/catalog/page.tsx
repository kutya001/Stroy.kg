import { Search, MapPin, Grid, SlidersHorizontal, Star, BadgeCheck, MessageSquare } from 'lucide-react';
import Image from 'next/image';

export default function CatalogPage() {
  return (
    <main className="max-w-7xl mx-auto px-4 md:px-6 pt-6 pb-24">
      {/* Hero */}
      <section className="mb-12 relative overflow-hidden rounded-3xl bg-secondary p-8 md:p-12">
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
          <input type="text" placeholder="Поиск по названию компании или продукции..." className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:pb-0">
          <button className="flex items-center gap-2 h-14 px-6 bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm">
            <MapPin className="w-5 h-5" /> Регион
          </button>
          <button className="flex items-center gap-2 h-14 px-6 bg-white border border-slate-200 text-slate-700 font-medium rounded-2xl hover:bg-slate-50 transition-colors whitespace-nowrap shadow-sm">
            <Grid className="w-5 h-5" /> Тип продукции
          </button>
          <button className="flex items-center gap-2 h-14 px-6 bg-primary/10 text-primary font-medium rounded-2xl hover:bg-primary/20 transition-colors whitespace-nowrap border border-primary/20">
            <SlidersHorizontal className="w-5 h-5" /> Фильтры
          </button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100">
          <div className="relative h-48 overflow-hidden">
            <Image src="https://picsum.photos/seed/factory/600/400" alt="Factory" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-success text-white text-[10px] font-bold rounded">TOP ПОСТАВЩИК</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3 text-accent fill-accent" />
              <span className="text-xs font-bold">4.9</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading text-xl font-bold text-secondary leading-tight">БетонПромСтрой</h3>
              <BadgeCheck className="w-6 h-6 text-success" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Бишкек и Чуйская обл. • 15 лет на рынке</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Бетон М100-М500</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">ЖБИ изделия</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Арматура</span>
            </div>
            <div className="mt-auto flex items-center gap-2">
              <button className="flex-1 bg-primary text-white h-10 rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-95 transition-all">Отправить запрос</button>
              <button className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100">
          <div className="relative h-48 overflow-hidden">
            <Image src="https://picsum.photos/seed/wood/600/400" alt="Wood" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3 text-accent fill-accent" />
              <span className="text-xs font-bold">4.7</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading text-xl font-bold text-secondary leading-tight">СеверЛес Экспорт</h3>
              <BadgeCheck className="w-6 h-6 text-success" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Ош • Доставка по КР</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Пиломатериалы</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Брус</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Доска</span>
            </div>
            <div className="mt-auto flex items-center gap-2">
              <button className="flex-1 bg-primary text-white h-10 rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-95 transition-all">Отправить запрос</button>
              <button className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-slate-100">
          <div className="relative h-48 overflow-hidden">
            <Image src="https://picsum.photos/seed/bricks/600/400" alt="Bricks" fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
            <div className="absolute top-4 left-4">
              <span className="px-2 py-1 bg-accent text-secondary text-[10px] font-bold rounded">НОВИНКА</span>
            </div>
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center gap-1">
              <Star className="w-3 h-3 text-accent fill-accent" />
              <span className="text-xs font-bold">5.0</span>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-heading text-xl font-bold text-secondary leading-tight">КерамоБлок Центр</h3>
              <BadgeCheck className="w-6 h-6 text-success" />
            </div>
            <p className="text-xs text-slate-500 mb-4">Джалал-Абад • Прямой производитель</p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Кирпич</span>
              <span className="bg-slate-100 px-2 py-1 rounded-md text-[10px] text-slate-600 font-medium">Керамоблоки</span>
            </div>
            <div className="mt-auto flex items-center gap-2">
              <button className="flex-1 bg-primary text-white h-10 rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-95 transition-all">Отправить запрос</button>
              <button className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-50 transition-colors">
                <MessageSquare className="w-5 h-5 text-primary" />
              </button>
            </div>
          </div>
        </div>

        {/* Horizontal Highlight Card */}
        <div className="md:col-span-2 lg:col-span-3 bg-white rounded-2xl p-6 flex flex-col md:flex-row gap-8 items-center border-l-4 border-primary shadow-sm">
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
      </div>
    </main>
  );
}
