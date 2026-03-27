import Image from 'next/image';
import { Search, Check, CheckCheck } from 'lucide-react';

export default function ChatsPage() {
  const chats = [
    {
      id: 1,
      name: 'ООО "Монолит-Строй"',
      avatar: 'https://picsum.photos/seed/chat1/100/100',
      lastMessage: 'Да, мы сможем доставить бетон завтра к 10:00.',
      time: '14:30',
      unread: 2,
      isOnline: true,
      status: 'received'
    },
    {
      id: 2,
      name: 'ИП Громов (Аренда техники)',
      avatar: 'https://picsum.photos/seed/chat2/100/100',
      lastMessage: 'Договор отправил вам на почту, проверьте.',
      time: 'Вчера',
      unread: 0,
      isOnline: false,
      status: 'read'
    },
    {
      id: 3,
      name: 'МеталлТорг Бишкек',
      avatar: 'https://picsum.photos/seed/chat3/100/100',
      lastMessage: 'Арматура А500С сейчас по акции, 65 сом/кг.',
      time: 'Вчера',
      unread: 0,
      isOnline: true,
      status: 'read'
    },
    {
      id: 4,
      name: 'СтройГрупп',
      avatar: 'https://picsum.photos/seed/chat4/100/100',
      lastMessage: 'Спасибо за сотрудничество!',
      time: '12 Окт',
      unread: 0,
      isOnline: false,
      status: 'read'
    }
  ];

  return (
    <main className="max-w-3xl mx-auto px-4 pt-6 pb-24 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-heading font-bold text-secondary mb-4">Сообщения</h1>
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
        {chats.map((chat) => (
          <div key={chat.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-slate-100 overflow-hidden relative">
                <Image src={chat.avatar} alt={chat.name} fill className="object-cover" />
              </div>
              {chat.isOnline && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-success border-2 border-white rounded-full"></div>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-heading font-bold text-secondary truncate pr-4">{chat.name}</h3>
                <span className="text-xs text-slate-400 whitespace-nowrap">{chat.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className={`text-sm truncate pr-4 ${chat.unread > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                  {chat.lastMessage}
                </p>
                {chat.unread > 0 ? (
                  <div className="w-5 h-5 rounded-full bg-primary text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    {chat.unread}
                  </div>
                ) : (
                  <div className="shrink-0">
                    {chat.status === 'read' ? (
                      <CheckCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <Check className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
