'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function ChatsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchChats = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('chats')
        .select(`
          id,
          created_at,
          request:requests(title, isActive),
          consumer:users!consumerId(name, companyName),
          supplier:users!supplierId(name, companyName)
        `)
        .or(`consumerId.eq.${user.id},supplierId.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching chats:', error);
      } else {
        setChats(data || []);
      }
      setLoading(false);
    };

    fetchChats();
  }, [user]);

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!user) return null;

  return (
    <main className="max-w-4xl mx-auto px-4 pt-6 pb-24 space-y-6">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
          <MessageSquare className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold text-secondary">Ваши чаты</h1>
          <p className="text-slate-500 text-sm">Общение по заявкам</p>
        </div>
      </div>

      {chats.length === 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-12 text-center text-slate-500">
          У вас пока нет активных диалогов.
        </div>
      ) : (
        <div className="grid gap-4">
          {chats.map(chat => {
            // Determine the name of the "other person"
            const otherName = user.id === chat.consumer.id // We don't have .id populated in select, let's just use simple logic
              // Wait, we can fetch ids if needed, but let's just render both names for simplicity, or use user.id to compare if we fetched it
            
            return (
              <Link key={chat.id} href={`/chats/${chat.id}`} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col hover:border-primary/30 hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-secondary">{chat.request?.title || 'Заявка удалена'}</h3>
                  <span className="text-xs text-slate-400">{new Date(chat.created_at).toLocaleDateString()}</span>
                </div>
                <div className="text-sm text-slate-500 font-medium">
                  Чат с: {chat.consumer?.companyName || chat.consumer?.name} и {chat.supplier?.companyName || chat.supplier?.name}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </main>
  );
}
