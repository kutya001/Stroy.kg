'use client';

import Image from 'next/image';
import { Search, Check, CheckCheck, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { getMockChats } from '@/lib/mockDb';

export default function ChatsPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (user) {
      setChats(getMockChats(user.uid));
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-24 text-center">
        <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-secondary mb-4">Войдите в систему</h1>
        <p className="text-slate-600">Чтобы просматривать сообщения, необходимо авторизоваться.</p>
      </div>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 h-screen flex flex-col">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-heading font-bold text-secondary">Сообщения</h1>
          {chats.filter(c => c.unreadCount > 0).length > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-full">
              {chats.filter(c => c.unreadCount > 0).length} НОВЫХ
            </span>
          )}
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Поиск сообщений..." 
            className="w-full h-12 pl-12 pr-4 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 shadow-sm outline-none" 
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-2 scrollbar-hide">
        {chats.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-100">
            <MessageSquare className="w-12 h-12 text-slate-200 mx-auto mb-4" />
            <p className="text-slate-500">У вас пока нет активных диалогов.</p>
          </div>
        ) : (
          chats.map((chat) => (
            <div key={chat.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden relative">
                  <Image src={chat.otherUser.avatar} alt={chat.otherUser.name} fill className="object-cover" />
                </div>
                {chat.otherUser.role === 'supplier' && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-success border-2 border-white rounded-full flex items-center justify-center">
                    <Check className="w-2 h-2 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-heading font-bold text-secondary truncate pr-4">{chat.otherUser.name}</h3>
                  <span className="text-xs text-slate-400 whitespace-nowrap">
                    {mounted ? new Date(chat.updatedAt).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : ''}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate pr-4 ${chat.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                    {chat.lastMessage}
                  </p>
                  {chat.unreadCount > 0 ? (
                    <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      {chat.unreadCount}
                    </div>
                  ) : (
                    <div className="shrink-0">
                      <CheckCheck className="w-4 h-4 text-primary" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
