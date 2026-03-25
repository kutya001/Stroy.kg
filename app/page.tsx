'use client';

import Image from 'next/image';
import { MapPin, ArrowRight, CheckCircle2, Plus, Search, Layers, Wallet, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/AuthProvider';

export default function FeedPage() {
  const { user, userData } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data, error } = await supabase
        .from('requests')
        .select(`
          *,
          author:users!authorId(name, companyName, role, verificationStatus)
        `)
        .eq('isActive', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setRequests(data);
      }
      setLoading(false);
    };

    fetchRequests();
  }, []);

  const handleResponse = async (requestId: string, consumerId: string) => {
    if (!user) {
      alert('Пожалуйста, войдите в аккаунт');
      return;
    }
    if (userData?.verificationStatus !== 'verified') {
      alert('Только подтвержденные поставщики могут откликаться на заявки.');
      return;
    }

    try {
      // Create or find chat
      const { data: existingChat } = await supabase
        .from('chats')
        .select('id')
        .eq('requestId', requestId)
        .eq('consumerId', consumerId)
        .eq('supplierId', user.id)
        .single();

      if (existingChat) {
        window.location.href = `/chats/${existingChat.id}`;
        return;
      }

      const { data: newChat, error } = await supabase
        .from('chats')
        .insert([{ requestId, consumerId, supplierId: user.id }])
        .select()
        .single();

      if (error) throw error;

      // Send initial message
      await supabase.from('messages').insert([{
        chatId: newChat.id,
        senderId: user.id,
        content: `Здравствуйте! Я готов выполнить вашу заявку.`
      }]);

      window.location.href = `/chats/${newChat.id}`;
    } catch (err) {
      console.error('Error responding to request:', err);
      alert('Ошибка при отклике на заявку');
    }
  };

  return (
    <main className="max-w-5xl mx-auto px-4 pb-24 pt-6">
      {/* Welcome Section */}
      <section className="mb-8">
        <h1 className="text-2xl font-heading font-bold text-secondary mb-1">
          Добро пожаловать{userData?.name ? `, ${userData.name}` : ''}! 👋
        </h1>
        <p className="text-slate-500 text-sm mb-6">{userData?.region || 'Кыргызстан'}</p>
        
        <div className="relative mb-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input type="text" placeholder="Найти материал или услугу" className="w-full h-14 pl-12 pr-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Link href="/catalog?type=materials" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
            <span className="text-3xl">🧱</span>
            <span className="font-heading font-semibold text-sm text-secondary text-center">Купить<br/>материалы</span>
          </Link>
          <Link href="/catalog?type=services" className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center justify-center gap-2 hover:border-primary/30 transition-colors">
            <span className="text-3xl">🔨</span>
            <span className="font-heading font-semibold text-sm text-secondary text-center">Нанять<br/>строителей</span>
          </Link>
        </div>

        <div className="bg-primary/10 rounded-2xl p-4 flex items-center justify-between border border-primary/20">
          <p className="text-sm text-secondary font-medium">Пусть поставщики сами вас найдут</p>
          <Link href="/create" className="bg-primary text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-primary-dark transition-colors whitespace-nowrap">
            + Создать заявку
          </Link>
        </div>
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

      {/* Feed Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-500">Загрузка заявок...</div>
        ) : requests.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 rounded-3xl border border-slate-200">
            Нет активных заявок.
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col relative overflow-hidden group hover:border-primary/30 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold tracking-wider uppercase rounded-full">
                  {req.category}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {new Date(req.created_at).toLocaleDateString('ru-RU')}
                </span>
              </div>

              <h3 className="text-lg font-bold text-secondary mb-2 line-clamp-2">{req.title}</h3>
              <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">{req.description}</p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" /> {req.region}
                </div>
                {req.budget && (
                  <div className="flex items-center gap-2 text-sm font-medium text-slate-600">
                    <Wallet className="w-4 h-4 text-slate-400" /> {req.budget.toLocaleString()} сом
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span className="font-bold">{req.author?.companyName || req.author?.name || 'Пользователь'}</span>
                </div>
              </div>

              {user?.id !== req.authorId && (userData?.role === 'supplier' || userData?.role === 'developer') ? (
                <button
                  onClick={() => handleResponse(req.id, req.authorId)}
                  className="w-full py-3 bg-primary text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-primary-dark active:scale-95 transition-all"
                >
                  <MessageSquare className="w-4 h-4" /> Откликнуться
                </button>
              ) : (
                <div className="w-full py-3 bg-slate-50 text-slate-500 font-medium rounded-xl flex items-center justify-center text-sm border border-slate-100">
                  {user?.id === req.authorId ? 'Ваша заявка' : 'Только для поставщиков'}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FAB */}
      <Link href="/create" className="fixed bottom-20 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center z-40 hover:scale-105 active:scale-95 transition-all">
        <Plus className="w-6 h-6" />
      </Link>
    </main>
  );
}
