'use client';

import { Building2, Wrench, Truck, Camera, Save } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createMockProduct } from '@/lib/mockDb';
import { useRouter } from 'next/navigation';

export default function AddProductPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState('Материалы');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('м³');
  const [description, setDescription] = useState('');

  if (userData?.role !== 'supplier') {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-24 text-center">
        <h1 className="text-2xl font-bold text-secondary mb-4">Доступ запрещен</h1>
        <p className="text-slate-600">Только поставщики могут добавлять товары и услуги.</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) {
      alert('Заполните обязательные поля');
      return;
    }

    createMockProduct({
      supplierId: user?.uid,
      supplierName: user?.displayName || 'Поставщик',
      name,
      category,
      description,
      price: Number(price) || 0,
      unit,
      region: 'Бишкек', // Default
      image: 'https://picsum.photos/seed/newproduct/600/400',
    });

    alert('Товар успешно добавлен в каталог!');
    router.push('/catalog');
  };

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-heading font-bold text-secondary">Добавить товар или услугу</h1>
        <p className="text-slate-600">Разместите ваше предложение в каталоге, чтобы покупатели могли вас найти.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
        {/* Category */}
        <div className="space-y-4">
          <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Категория
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <button 
              type="button" 
              onClick={() => setCategory('Материалы')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Материалы' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}
            >
              <Building2 className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Материалы</span>
            </button>
            <button 
              type="button" 
              onClick={() => setCategory('Услуги')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Услуги' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}
            >
              <Wrench className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Услуги</span>
            </button>
            <button 
              type="button" 
              onClick={() => setCategory('Техника')}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Техника' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}
            >
              <Truck className="w-6 h-6 mb-2" />
              <span className="text-sm font-medium">Техника</span>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Наименование*</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Напр: Кирпич жженый М150" 
              className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Цена (KGS)*</label>
            <input 
              type="number" 
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="12" 
              className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 px-1">Единица измерения*</label>
            <select 
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700"
            >
              <option value="шт">шт</option>
              <option value="м³">м³</option>
              <option value="тонн">тонн</option>
              <option value="м²">м²</option>
              <option value="услуга">услуга</option>
              <option value="час">час</option>
            </select>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 px-1">Описание*</label>
          <textarea 
            rows={4} 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Опишите характеристики товара, условия доставки..." 
            className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
          ></textarea>
        </div>

        {/* Photos */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-700 px-1">Фотографии товара</label>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-4">
            <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-50 transition-colors group">
              <Camera className="w-6 h-6 text-slate-400 group-hover:text-primary" />
              <span className="text-[10px] text-slate-500 font-medium">Добавить</span>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button type="submit" className="w-full bg-primary text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2">
          <Save className="w-5 h-5" />
          Добавить в каталог
        </button>
      </form>
    </main>
  );
}
