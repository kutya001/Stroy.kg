'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, Wrench, Truck, Layers, Wallet, Camera, Loader2, ArrowLeft } from 'lucide-react';

export default function CreatePage() {
  const { user, userData, loading: authLoading } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [activeRequests, setActiveRequests] = useState<any[]>([]);

  // Form State
  const [category, setCategory] = useState('Материалы');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [unit, setUnit] = useState('шт');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchMyRequests = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('authorId', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setActiveRequests(data);
    };
    fetchMyRequests();
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;
    setLoading(true);

    try {
      const newRequest = {
        authorId: user.id,
        title: `${title} (${amount} ${unit})`,
        description,
        category,
        region: userData.region || 'Не указан',
        budget: budget ? parseFloat(budget) : null,
        isActive: true
      };

      const { data, error } = await supabase
        .from('requests')
        .insert([newRequest])
        .select()
        .single();

      if (error) throw error;

      // Reset form & update list
      setTitle('');
      setAmount('');
      setBudget('');
      setDeadline('');
      setDescription('');
      if (data) setActiveRequests(prev => [data, ...prev]);

      alert('Заявка успешно опубликована!');
    } catch (err) {
      console.error('Error creating request:', err);
      alert('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return null; // Redirects via useEffect

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
                <button type="button" onClick={() => setCategory('Материалы')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Материалы' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
                  <Building2 className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Материалы</span>
                </button>
                <button type="button" onClick={() => setCategory('Услуги')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Услуги' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
                  <Wrench className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Услуги</span>
                </button>
                <button type="button" onClick={() => setCategory('Техника')} className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${category === 'Техника' ? 'border-primary bg-primary/5 text-primary' : 'border-transparent bg-slate-50 hover:border-slate-200 text-slate-600'}`}>
                  <Truck className="w-6 h-6 mb-2" />
                  <span className="text-sm font-medium">Техника</span>
                </button>
              </div>
            </div>

            {/* Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Наименование*</label>
                <input required value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="Напр: Бетон М300" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Объем / Кол-во*</label>
                <div className="flex gap-2">
                  <input required value={amount} onChange={(e) => setAmount(e.target.value)} type="number" placeholder="10" className="w-2/3 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
                  <select value={unit} onChange={(e) => setUnit(e.target.value)} className="w-1/3 bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none text-slate-700">
                    <option value="м³">м³</option>
                    <option value="тонн">тонн</option>
                    <option value="шт">шт</option>
                    <option value="м²">м²</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Срок выполнения</label>
                <input value={deadline} onChange={(e) => setDeadline(e.target.value)} type="date" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all text-slate-600 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 px-1">Бюджет (KGS)</label>
                <input value={budget} onChange={(e) => setBudget(e.target.value)} type="number" placeholder="до 50 000" className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all outline-none" />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 px-1">Описание*</label>
              <textarea required value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder="Например: нужен бетон М300, доставка в район Кок-Жар..." className="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/20 transition-all resize-none outline-none"></textarea>
            </div>

            {/* Photos */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700 px-1">Прикрепить фото/документ (В разработке)</label>
              <div className="grid grid-cols-4 gap-4">
                <div className="aspect-square rounded-xl border-2 border-dashed border-slate-300 flex flex-col items-center justify-center gap-1 bg-slate-50 opacity-50 cursor-not-allowed group">
                  <Camera className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] text-slate-500 font-medium">Добавить</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button disabled={loading} type="submit" className="w-full bg-primary text-white font-heading font-bold py-4 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:active:scale-100">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Опубликовать заявку'}
            </button>
          </div>
        </form>
      </section>

      {/* Right Column: Active */}
      <aside className="lg:col-span-5 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-heading font-bold text-secondary">Мои заявки</h2>
          {activeRequests.length > 0 && <span className="bg-success/10 text-success text-xs font-bold px-3 py-1 rounded-full">{activeRequests.length} АКТИВНЫХ</span>}
        </div>

        <div className="space-y-4">
          {activeRequests.length === 0 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center text-slate-500 text-sm">
              Вы еще не создали ни одной заявки. Заполните форму слева, чтобы начать.
            </div>
          ) : (
            activeRequests.map(req => (
              <div key={req.id} className="bg-white p-5 rounded-2xl border-l-4 border-primary shadow-sm hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-primary uppercase tracking-tighter">{req.category}</span>
                  <span className="text-xs text-slate-400">{new Date(req.created_at).toLocaleDateString('ru-RU')}</span>
                </div>
                <h3 className="text-base font-bold text-secondary mb-2">{req.title}</h3>
                <div className="flex gap-4 text-sm text-slate-500 mb-4">
                  <span className="flex items-center gap-1"><Layers className="w-4 h-4" /> {req.region}</span>
                  {req.budget && <span className="flex items-center gap-1"><Wallet className="w-4 h-4" /> {req.budget.toLocaleString()} сом</span>}
                </div>
                <div className="flex items-center justify-end">
                  <span className="text-sm font-semibold text-primary">Ожидает откликов...</span>
                </div>
              </div>
            ))
          )}
        </div>
      </aside>
    </main>
  );
}
