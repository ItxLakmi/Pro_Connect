'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Zap, 
  Search, 
  Briefcase, 
  MessageSquare, 
  User, 
  LogOut,
  Bell,
  BookOpen,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);

  React.useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then(res => setUnreadCount(res.data.count))
        .catch(err => console.error(err));
    }
  }, [user, pathname]);

  const navItems = [
    { name: 'Feed', href: '/feed', icon: <Zap className="w-5 h-5" /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Marketplace', href: '/marketplace', icon: <ShoppingBag className="w-5 h-5" /> },
    { name: 'Investors', href: '/investors', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Learning', href: '/learning', icon: <BookOpen className="w-5 h-5" /> },
    { name: 'Community', href: '/community', icon: <Users className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { 
      name: 'Notifications', 
      href: '/notifications', 
      icon: (
        <div className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
      ) 
    },
  ];

  if (['/login', '/register'].includes(pathname)) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="text-xl font-bold tracking-tight hidden md:block">ProConnect</span>
        </Link>

        {/* Search Bar */}
        <div className="flex-1 max-w-md relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Search jobs, people, companies..." 
            className="w-full h-10 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
          />
        </div>

        {/* Navigation Items */}
        <div className="flex items-center gap-1 md:gap-4">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                p-2 md:px-4 md:py-2 rounded-xl flex flex-col md:flex-row items-center gap-2 text-xs md:text-sm font-medium transition-all
                ${pathname === item.href 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}
              `}
            >
              {item.icon}
              <span className="hidden lg:block">{item.name}</span>
            </Link>
          ))}

          <div className="w-px h-6 bg-white/10 mx-2 hidden md:block" />
          
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-4">
              <Link 
                href="/profile"
                className={`
                  flex items-center gap-2 p-1 pr-3 rounded-full transition-all
                  ${pathname === '/profile' ? 'bg-accent/10' : 'hover:bg-white/5'}
                `}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center border border-white/10">
                  {user.avatar ? (
                    <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-5 h-5 text-accent" />
                  )}
                </div>
                <span className="text-sm font-bold hidden sm:block">{user.firstName}</span>
              </Link>
              <button 
                onClick={logout}
                className="p-2 text-foreground/40 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="glass" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
