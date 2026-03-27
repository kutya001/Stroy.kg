'use client';

import { Building2, Wrench, Truck, Save, Layers, Wallet, Calendar, AlertCircle, Archive, Camera, X, Clock } from 'lucide-react';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { createMockRequest, getMockRequestsByAuthor } from '@/lib/mockDb';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [category, setCategory] = useState('Материалы');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('м³');
  const [budget, setBudget] = useState('');
  const [description, setDescription] = useState('');
  const [myRequests, setMyRequests] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setMyRequests(getMockRequestsByAuthor(user.uid));
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert('Пожалуйста, войдите в систему для создания заявки.');
      return;
    }

    if (!title || !quantity || !description) {
      alert('Заполните обязательные поля');
      return;
    }

    const newReq = createMockRequest({
      authorId: user.uid,
      authorName: user.name || 'Пользователь',
      title,
      category,
      description,
      budget: Number(budget) || 0,
      quantity: Number(quantity),
      unit,
      region: 'Бишкек', // Default for now
    });

    setMyRequests([newReq, ...myRequests]);
    
    // Reset form
    setTitle('');
    setQuantity('');
    setBudget('');
    setDescription('');
    
    alert('Заявка успешно опубликована!');
    router.push('/');
  };

  return (
    <main className="max-w-7xl mx-auto px-4 pt-6 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Left Column: Form */}
      <section className="lg:col-span-7 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-heading font-bold text-secondary">Создать заявку</h1>
          <p className="text-slate-600">Опишите, что вам нужно, и поставщики откликнутся сами.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-100">
          <div className="space-y-8">
            {/* Category */}
            <div className="space-y-4">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-2">
                <Building2 className="w-4 h-4" /> Категория ресурса
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Наименование*</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Напр: Бетон М300" 
                  className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Объем / Кол-во*</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="10" 
                    className="w-2/3 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                  />
                  <select 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-1/3 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700"
                  >
                    <option value="м³">м³</option>
                    <option value="тонн">тонн</option>
                    <option value="шт">шт</option>
                    <option value="м²">м²</option>
                    <option value="объект">объект</option>
                    <option value="час">час</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Срок выполнения</label>
                <input type="date" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all text-slate-600 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Бюджет (KGS)</label>
                <input 
                  type="number" 
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="до 50 000" 
                  className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 px-1">Описание*</label>
              <textarea 
                rows={4} 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Например: нужен бетон М300, доставка в район Кок-Жар..." 
                className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"
              ></textarea>
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

            {/* Submit */}
            <button type="submit" className="w-full bg-primary text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2">
              Опубликовать заявку
            </button>
          </div>
        </form>
      </section>

      {/* Right Column: Active */}
      <aside className="lg:col-span-5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-secondary">Мои заявки</h2>
          <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">{myRequests.length} АКТИВНЫХ</span>
        </div>

        <div className="space-y-4">
          {myRequests.length === 0 ? (
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 text-center text-slate-500 text-sm">
              У вас пока нет активных заявок.
            </div>
          ) : (
            myRequests.map(req => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border-l-4 border-primary shadow-sm hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-tighter">{req.category}</span>
                  <span className="text-xs text-slate-400">
                    {mounted ? new Date(req.createdAt).toLocaleDateString('ru-RU') : ''}
                  </span>
                </div>
                <h3 className="text-base font-bold text-secondary mb-2">{req.title}</h3>
                <div className="flex gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {req.quantity} {req.unit}</span>
                  <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> {req.budget.toLocaleString()} ₸</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-secondary border-2 border-white flex items-center justify-center text-[10px] text-white font-bold">П1</div>
                    <div className="w-8 h-8 rounded-full bg-accent border-2 border-white flex items-center justify-center text-[10px] text-secondary font-bold">П2</div>
                    <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[10px] text-slate-700 font-bold">+{req.responsesCount}</div>
                  </div>
                  <span className="text-sm font-semibold text-primary">{req.responsesCount + 2} предложений &gt;</span>
                </div>
              </div>
            ))
          )}

          <button className="w-full py-4 border-2 border-dashed border-slate-300 rounded-2xl text-slate-500 hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium">
            + Просмотреть все архивные заявки
          </button>
        </div>
      </aside>
    </main>
  );
}
