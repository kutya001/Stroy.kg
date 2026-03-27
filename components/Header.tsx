'use client';
import { Bell, User, LogIn, CheckCircle2, Eye, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

import { useState, useEffect, useRef } from 'react';
import { getMockNotifications, markNotificationAsRead } from '@/lib/mockDb';

export default function Header() {
  const pathname = usePathname();
  const { user, userData, openAuthModal, isAdminMode, adminViewAs, setAdminViewAs } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      setNotifications(getMockNotifications(user.uid));
    } else {
      setNotifications([]);
    }
  }, [user, showNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications(getMockNotifications(user!.uid));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
    {isAdminMode && adminViewAs && (
      <div className="sticky top-0 z-[60] bg-amber-500 text-white text-center py-1 px-4 text-xs font-bold flex items-center justify-center gap-2">
        <Eye className="w-3 h-3" />
        Просмотр как: {adminViewAs === 'consumer' ? 'Покупатель' : adminViewAs === 'supplier' ? 'Поставщик' : 'Застройщик'}
        <button onClick={() => setAdminViewAs(null)} className="ml-2 bg-white/20 hover:bg-white/30 rounded-full p-0.5"><X className="w-3 h-3" /></button>
      </div>
    )}
    <header className="flex justify-between items-center px-4 h-16 w-full sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-slate-200">
      <div className="flex items-center gap-3">
        {user ? (
          <Link href="/profile" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border border-primary/20 relative">
            <User className="w-6 h-6 text-primary" />
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
        <Link href="/catalog" className={`text-sm font-medium transition-colors ${pathname === '/catalog' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Каталог</Link>
        
        {(userData?.role === 'supplier' || userData?.role === 'developer') ? (
          <>
            <Link href="/dashboard" className={`text-sm font-medium transition-colors ${pathname === '/dashboard' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Дашборд</Link>
            <Link href="/add-product" className={`text-sm font-medium transition-colors ${pathname === '/add-product' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Добавить товар</Link>
          </>
        ) : (
          <Link href="/create" className={`text-sm font-medium transition-colors ${pathname === '/create' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Заявки</Link>
        )}
        
        <Link href="/chats" className={`text-sm font-medium transition-colors ${pathname === '/chats' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Чаты</Link>
        {user && userData?.role === 'admin' && (
          <Link href="/admin" className={`text-sm font-medium transition-colors ${pathname === '/admin' ? 'text-primary font-bold' : 'text-slate-500 hover:text-secondary'}`}>Админ</Link>
        )}
      </nav>

      <div className="flex items-center gap-4 relative" ref={notifRef}>
        <button 
          onClick={() => {
            if (!user) openAuthModal();
            else setShowNotifications(!showNotifications);
          }} 
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors relative"
        >
          <Bell className="w-5 h-5 text-secondary" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full"></span>
          )}
        </button>

        {/* Notifications Dropdown */}
        {showNotifications && user && (
          <div className="absolute top-12 right-0 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-secondary">Уведомления</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-bold">{unreadCount} новых</span>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">Нет новых уведомлений</div>
              ) : (
                notifications.map(notif => (
                  <div 
                    key={notif.id} 
                    className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3 ${!notif.read ? 'bg-primary/5' : ''}`}
                    onClick={() => handleRead(notif.id)}
                  >
                    <div className="mt-1">
                      {notif.type === 'request' && <div className="w-2 h-2 rounded-full bg-accent mt-1.5"></div>}
                      {notif.type === 'response' && <div className="w-2 h-2 rounded-full bg-success mt-1.5"></div>}
                      {notif.type === 'system' && <div className="w-2 h-2 rounded-full bg-primary mt-1.5"></div>}
                    </div>
                    <div className="flex-1 cursor-pointer">
                      <p className={`text-sm ${!notif.read ? 'font-semibold text-secondary' : 'text-slate-600'}`}>{notif.text}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{new Date(notif.date).toLocaleString('ru-RU')}</p>
                    </div>
                    {!notif.read && (
                      <button onClick={(e) => { e.stopPropagation(); handleRead(notif.id); }} className="text-slate-400 hover:text-primary">
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  );
}
