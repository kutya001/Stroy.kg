'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { supabase } from '@/lib/supabase';
import { Loader2, Send, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function ChatRoomPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [chat, setChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) router.push('/');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || !id) return;

    const fetchChatAndMessages = async () => {
      // 1. Fetch chat details
      const { data: chatData, error: chatError } = await supabase
        .from('chats')
        .select(`
          *,
          request:requests(title),
          consumer:users!consumerId(name, companyName),
          supplier:users!supplierId(name, companyName)
        `)
        .eq('id', id)
        .single();

      if (chatError || !chatData) {
        console.error('Error fetching chat:', chatError);
        router.push('/chats');
        return;
      }
      setChat(chatData);

      // 2. Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .eq('chatId', id)
        .order('created_at', { ascending: true });

      if (!messagesError) setMessages(messagesData || []);
      setLoading(false);
    };

    fetchChatAndMessages();

    // 3. Subscribe to new messages
    const channel = supabase
      .channel(`chat_${id}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chatId=eq.${id}` },
      (payload) => {
        setMessages((prev) => [...prev, payload.new]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, id, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !id) return;

    const content = newMessage;
    setNewMessage(''); // optimistic clear

    try {
      const { error } = await supabase
        .from('messages')
        .insert([{
          chatId: id,
          senderId: user.id,
          content
        }]);

      if (error) {
        setNewMessage(content); // restore on error
        throw error;
      }

      // Update chat's updated_at timestamp
      await supabase.from('chats').update({ updated_at: new Date().toISOString() }).eq('id', id);

    } catch (error) {
      console.error('Error sending message:', error);
      alert('Ошибка при отправке сообщения');
    }
  };

  if (authLoading || loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  const otherPersonName = user?.id === chat.consumerId
    ? (chat.supplier.companyName || chat.supplier.name)
    : (chat.consumer.companyName || chat.consumer.name);

  return (
    <main className="max-w-4xl mx-auto h-[calc(100vh-64px)] flex flex-col bg-slate-50 relative">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 p-4 flex items-center gap-4 shrink-0 shadow-sm z-10 sticky top-0">
        <Link href="/chats" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <div>
          <h2 className="font-bold text-secondary text-lg">{otherPersonName}</h2>
          <p className="text-xs text-slate-500 font-medium">Заявка: {chat.request?.title || 'Удалена'}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?.id;
          return (
            <div key={msg.id || i} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                isMe ? 'bg-primary text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
              }`}>
                {msg.content}
                <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-primary-100' : 'text-slate-400'}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-slate-200 p-4 shrink-0">
        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Написать сообщение..."
            className="flex-1 bg-slate-100 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="w-12 h-12 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:hover:bg-primary shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </main>
  );
}
