'use client';
import { Home, PlusCircle, Store, MessageSquare, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const pathname = usePathname();

  const navItems = [
    { href: '/', icon: Home, label: 'Главная' },
    { href: '/catalog', icon: Store, label: 'Каталог' },
    { href: '/create', icon: PlusCircle, label: 'Заявки' },
    { href: '/chats', icon: MessageSquare, label: 'Чат' },
    { href: '/profile', icon: User, label: 'Профиль' },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-2 pb-safe h-16 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] rounded-t-2xl">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center w-16 h-14 rounded-xl transition-all ${
              isActive ? 'text-primary scale-105' : 'text-slate-400 hover:text-secondary'
            }`}
          >
            <Icon className={`w-6 h-6 ${isActive ? 'fill-primary/20' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium mt-1 tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
