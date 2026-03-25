'use client';
import { Bell, User, LogIn } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import Image from 'next/image';

export default function Header() {
  const pathname = usePathname();
  const { user, userData, openAuthModal } = useAuth();

  return (
    <header className="flex justify-between items-center px-4 h-16 w-full sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-3">
        {user ? (
          <Link href="/profile" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 relative">
            {userData?.photoURL ? (
              <Image src={userData.photoURL} alt={userData?.name || 'User'} fill className="object-cover" />
            ) : (
              <User className="w-6 h-6 text-primary" />
            )}
          </Link>
        ) : (
          <button onClick={openAuthModal} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200 hover:bg-slate-200 transition-colors">
            <LogIn className="w-5 h-5 text-slate-600" />
          </button>
        )}
        <Link href="/" className="font-heading font-bold text-xl text-secondary">
          Stroy<span className="text-primary">.kg</span>
        </Link>
      </div>
      
      <nav className="hidden md:flex items-center gap-6">
        <Link href="/" className={`text-sm font-medium transition-colors ${pathname === '/' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Лента</Link>
        <Link href="/create" className={`text-sm font-medium transition-colors ${pathname === '/create' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Создать заявку</Link>
        <Link href="/catalog" className={`text-sm font-medium transition-colors ${pathname === '/catalog' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Каталог</Link>
        <Link href="/chats" className={`text-sm font-medium transition-colors ${pathname === '/chats' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Чаты</Link>
      </nav>

      <div className="flex items-center gap-4">
        <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative">
          <Bell className="w-5 h-5 text-secondary" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"></span>
        </button>
      </div>
    </header>
  );
}
