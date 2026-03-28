'use client';

import { MessageSquare, ShoppingCart, Phone } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/components/AuthProvider';

export default function ProductActions({ productId }: { productId: string }) {
  const { userData, openAuthModal, canAccessChat } = useAuth();

  const handleChatClick = () => {
    if (!userData) { openAuthModal(); return; }
    if (!canAccessChat) {
      alert('Чат доступен после верификации уровня 2. Заполните ИНН в профиле.');
      return;
    }
  };

  return (
    <div className="space-y-3">
      <Link href={`/create?productId=${productId}`} className="w-full bg-primary text-white h-12 rounded-xl text-sm font-bold hover:bg-primary-dark active:scale-[0.98] transition-all flex items-center justify-center gap-2">
        <ShoppingCart className="w-5 h-5" /> Оставить заявку на этот товар
      </Link>
      <button
        disabled
        className="w-full border border-slate-200 text-slate-400 h-12 rounded-xl text-sm font-bold flex items-center justify-center gap-2 opacity-50 cursor-not-allowed"
      >
        <MessageSquare className="w-5 h-5" /> Написать продавцу
      </button>
      <a href="tel:+996555111111" className="w-full border border-slate-200 text-slate-700 h-12 rounded-xl text-sm font-bold hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
        <Phone className="w-5 h-5" /> Позвонить
      </a>
    </div>
  );
}
