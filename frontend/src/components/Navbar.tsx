'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Zap, 
  Search, 
  Briefcase, 
  MessageSquare, 
  User, 
  LogOut,
  Bell,
  Home,
  Users,
  GraduationCap,
  Globe,
  Rocket,
  LayoutDashboard,
  ChevronDown,
  UserCog,
  Loader2
} from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [switchingRole, setSwitchingRole] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  React.useEffect(() => {
    if (user) {
      api.get('/notifications/unread-count')
        .then(res => setUnreadCount(res.data.count))
        .catch(err => console.error(err));
    }
  }, [user, pathname]);

  // Close profile menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchToRecruiter = async () => {
    setSwitchingRole(true);
    try {
      await api.patch('/users/me/role', { role: 'RECRUITER' });
      updateUser({ role: 'RECRUITER' });
      setProfileMenuOpen(false);
      router.push('/recruiter');
    } catch (err) {
      console.error(err);
      alert('Failed to switch role. Please try again.');
    } finally {
      setSwitchingRole(false);
    }
  };

  const handleSwitchToProfessional = async () => {
    setSwitchingRole(true);
    try {
      await api.patch('/users/me/role', { role: 'PROFESSIONAL' });
      updateUser({ role: 'PROFESSIONAL' });
      setProfileMenuOpen(false);
      router.push('/feed');
    } catch (err) {
      console.error(err);
      alert('Failed to switch role. Please try again.');
    } finally {
      setSwitchingRole(false);
    }
  };

  const notificationIcon = (
    <div className="relative">
      <Bell className="w-5 h-5" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  );

  const professionalNavItems = [
    { name: 'Home', href: '/feed', icon: <Home className="w-5 h-5" /> },
    { name: 'Network', href: '/network', icon: <Users className="w-5 h-5" /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Groups', href: '/community', icon: <Globe className="w-5 h-5" /> },
    { name: 'Learning', href: '/learning', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Startups', href: '/investors', icon: <Rocket className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const recruiterNavItems = [
    { name: 'Dashboard', href: '/recruiter', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const navItems = user?.role === 'RECRUITER' ? recruiterNavItems : professionalNavItems;

  if (['/login', '/register'].includes(pathname)) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-[1600px] w-full mx-auto px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo & Search */}
        <div className="flex items-center gap-4 lg:gap-6 shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-secondary rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" fill="white" />
            </div>
            <span className="text-xl font-bold tracking-tight hidden lg:block">ProConnect</span>
          </Link>

          <div className="relative hidden md:block w-[180px] lg:w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search..." 
              className="w-full h-9 bg-white/5 border border-white/10 rounded-full pl-9 pr-4 text-sm focus:outline-none focus:border-accent/50 focus:bg-white/10 transition-all"
            />
          </div>
        </div>

        {/* Center: Navigation Items */}
        <div className="flex flex-1 justify-center items-center gap-1 sm:gap-2">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className={`
                p-2 lg:px-3 lg:py-2 rounded-xl flex flex-col xl:flex-row items-center gap-1 xl:gap-2 text-[10px] xl:text-sm font-medium transition-all
                ${pathname === item.href 
                  ? 'bg-accent/10 text-accent' 
                  : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}
              `}
              title={item.name}
            >
              {item.icon}
              <span className="hidden xl:block">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-2 lg:gap-4 shrink-0">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-2 lg:gap-3">
              {/* Recruiter Dashboard shortcut pill removed as it is now part of main nav */}

              {/* Profile dropdown */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  id="profile-menu-trigger"
                  onClick={() => setProfileMenuOpen(prev => !prev)}
                  className={`flex items-center gap-2 p-1 pr-2 rounded-full transition-all ${
                    profileMenuOpen ? 'bg-accent/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-accent/20 flex items-center justify-center border border-white/10 shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <span className="text-sm font-bold hidden sm:block max-w-[80px] lg:max-w-[120px] truncate">{user.firstName}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-foreground/50 hidden sm:block transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-gray-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-sm font-bold text-white truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-xs text-foreground/40 truncate mt-0.5">{user.email}</p>
                      <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'RECRUITER'
                          ? 'bg-blue-600/20 text-blue-400'
                          : 'bg-white/10 text-foreground/60'
                      }`}>
                        {user.role?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-1.5">
                      <Link
                        href="/profile"
                        id="nav-my-profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground/70 hover:text-foreground hover:bg-white/5 transition-all"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>

                      {user.role === 'RECRUITER' ? (
                        <>
                          <Link
                            href="/recruiter"
                            id="nav-recruiter-dashboard"
                            onClick={() => setProfileMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-sm text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 transition-all"
                          >
                            <LayoutDashboard className="w-4 h-4" /> Recruiter Dashboard
                          </Link>
                          <button
                            id="nav-switch-to-professional"
                            onClick={handleSwitchToProfessional}
                            disabled={switchingRole}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10 transition-all disabled:opacity-60"
                          >
                            {switchingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                            {switchingRole ? 'Switching...' : 'Switch to Professional'}
                          </button>
                        </>
                      ) : (
                        <button
                          id="nav-switch-to-recruiter"
                          onClick={handleSwitchToRecruiter}
                          disabled={switchingRole}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-emerald-400 hover:text-emerald-300 hover:bg-emerald-600/10 transition-all disabled:opacity-60"
                        >
                          {switchingRole ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCog className="w-4 h-4" />}
                          {switchingRole ? 'Switching...' : 'Switch to Recruiter'}
                        </button>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-white/5 pt-1.5">
                      <button 
                        id="nav-logout"
                        onClick={() => { setProfileMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-600/10 transition-all"
                      >
                        <LogOut className="w-4 h-4" /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="glass" size="sm">Sign In</Button>
              </Link>
              <Link href="/register" className="hidden sm:block">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
