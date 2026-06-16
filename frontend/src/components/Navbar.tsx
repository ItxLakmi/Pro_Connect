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
  Loader2,
  Crown,
  Grid
} from 'lucide-react';
import { Button } from './ui/Button';
import { ThemeToggle } from './ThemeToggle';
import { useAuth } from '@/hooks/useAuth';
import api from '@/lib/api';
import { getDashboardPath, ROLE_LABELS, SWITCHABLE_ROLES, UserRole } from '@/lib/roles';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, updateUser } = useAuth();
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [profileMenuOpen, setProfileMenuOpen] = React.useState(false);
  const [exploreMenuOpen, setExploreMenuOpen] = React.useState(false);
  const [switchingRole, setSwitchingRole] = React.useState(false);
  const profileMenuRef = React.useRef<HTMLDivElement>(null);
  const exploreMenuRef = React.useRef<HTMLDivElement>(null);

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

  // Close menus on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (exploreMenuRef.current && !exploreMenuRef.current.contains(e.target as Node)) {
        setExploreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSwitchRole = async (role: UserRole) => {
    setSwitchingRole(true);
    try {
      await api.patch('/users/me/role', { role });
      // For admin users: DB role stays ADMIN, we just preview via localStorage
      // For regular users: DB role is actually changed
      updateUser({ role });
      setProfileMenuOpen(false);
      router.push(getDashboardPath(role));
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

  const guestNavItems = [
    { name: 'Home', href: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
  ];

  const professionalNavItems = [
    { name: 'Home', href: '/feed', icon: <Home className="w-5 h-5" /> },
    { name: 'Network', href: '/network', icon: <Users className="w-5 h-5" /> },
    { name: 'Jobs', href: '/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const professionalExploreItems = [
    { name: 'Marketplace', href: '/marketplace', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Groups', href: '/community', icon: <Globe className="w-5 h-5" /> },
    { name: 'Learning', href: '/learning', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Startups', href: '/investors', icon: <Rocket className="w-5 h-5" /> },
  ];

  const recruiterNavItems = [
    { name: 'Dashboard', href: '/recruiter', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Post Job', href: '/jobs/post', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'My Jobs', href: '/recruiter/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Applicants', href: '/recruiter/applicants', icon: <Users className="w-5 h-5" /> },
    { name: 'Search', href: '/recruiter/search', icon: <Search className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const freelancerNavItems = [
    { name: 'Marketplace', href: '/marketplace', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Post Project', href: '/marketplace/post', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Network', href: '/network', icon: <Users className="w-5 h-5" /> },
    { name: 'Learning', href: '/learning', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const founderNavItems = [
    { name: 'Startup', href: '/investors/create-startup', icon: <Rocket className="w-5 h-5" /> },
    { name: 'Investors', href: '/investors', icon: <Rocket className="w-5 h-5" /> },
    { name: 'Post Job', href: '/jobs/post', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Post Project', href: '/marketplace/post', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const investorNavItems = [
    { name: 'Startups', href: '/investors', icon: <Rocket className="w-5 h-5" /> },
    { name: 'Investor Profile', href: '/investors/create-profile', icon: <User className="w-5 h-5" /> },
    { name: 'Network', href: '/network', icon: <Users className="w-5 h-5" /> },
    { name: 'Messages', href: '/messages', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Notifications', href: '/notifications', icon: notificationIcon },
  ];

  const adminNavItems = [
    { name: 'Admin', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Users', href: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Jobs', href: '/admin/jobs', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Courses', href: '/admin/courses', icon: <GraduationCap className="w-5 h-5" /> },
    { name: 'Ads', href: '/admin/advertisements', icon: <Globe className="w-5 h-5" /> },
  ];

  const roleNavItems: Record<string, typeof professionalNavItems> = {
    PROFESSIONAL: professionalNavItems,
    RECRUITER: recruiterNavItems,
    FREELANCER: freelancerNavItems,
    STARTUP_FOUNDER: founderNavItems,
    INVESTOR: investorNavItems,
    ADMIN: adminNavItems,
    MENTOR: professionalNavItems,
    PARTNER: professionalNavItems,
  };

  const navItems = user ? (roleNavItems[user.role] ?? professionalNavItems) : guestNavItems;
  const exploreNavItems = user?.role === 'PROFESSIONAL' || user?.role === 'MENTOR' || user?.role === 'PARTNER' 
    ? professionalExploreItems 
    : [];
  const currentRole = user?.role as UserRole | undefined;

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
                ${(pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`)))
                  ? 'bg-accent/10 text-accent' 
                  : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}
              `}
              title={item.name}
            >
              {item.icon}
              <span className="hidden xl:block">{item.name}</span>
            </Link>
          ))}

          {exploreNavItems.length > 0 && (
            <div className="relative flex" ref={exploreMenuRef}>
              <button
                onClick={() => setExploreMenuOpen(prev => !prev)}
                className={`
                  p-2 lg:px-3 lg:py-2 rounded-xl flex flex-col xl:flex-row items-center gap-1 xl:gap-2 text-[10px] xl:text-sm font-medium transition-all
                  ${exploreMenuOpen ? 'bg-accent/10 text-accent' : 'text-foreground/60 hover:bg-white/5 hover:text-foreground'}
                `}
                title="Explore"
              >
                <Grid className="w-5 h-5" />
                <span className="hidden xl:block">Explore</span>
              </button>

              {exploreMenuOpen && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-gray-100 dark:border-white/5 mb-2">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">More Tools</p>
                  </div>
                  {exploreNavItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setExploreMenuOpen(false)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors
                        ${pathname.startsWith(item.href) ? 'bg-accent/10 text-accent font-medium' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'}
                      `}
                    >
                      <div className={`p-1.5 rounded-md ${pathname.startsWith(item.href) ? 'bg-accent/20 text-accent' : 'bg-gray-100 dark:bg-white/10 text-gray-500 dark:text-gray-400'}`}>
                        {item.icon}
                      </div>
                      {item.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
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
                  {user.isPremium && <Crown size={14} className="text-amber-500 fill-amber-500 hidden sm:block" />}
                  <ChevronDown className={`w-3.5 h-3.5 text-foreground/50 hidden sm:block transition-transform duration-200 ${profileMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown */}
                {profileMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-white/5">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user.firstName} {user.lastName}</p>
                        {user.isPremium && <Crown size={14} className="text-amber-500 fill-amber-500 shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
                      <span className={`inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        user.role === 'ADMIN' || user.role === 'RECRUITER'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300'
                      }`}>
                        {ROLE_LABELS[currentRole as UserRole] ?? user.role?.replace(/_/g, ' ')}
                      </span>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <Link
                        href={getDashboardPath(user.role)}
                        id="nav-role-dashboard"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4" /> {ROLE_LABELS[currentRole as UserRole] ?? 'Role'} Dashboard
                      </Link>

                      {/* Always show Admin Dashboard link if user originally logged in as ADMIN */}
                      {user.originalRole === 'ADMIN' && user.role !== 'ADMIN' && (
                        <Link
                          href="/admin"
                          id="nav-admin-dashboard"
                          onClick={() => setProfileMenuOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4" /> Admin Dashboard
                        </Link>
                      )}

                      <Link
                        href="/profile"
                        id="nav-my-profile"
                        onClick={() => setProfileMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                      >
                        <User className="w-4 h-4" /> My Profile
                      </Link>

                    </div>

                    {/* Logout */}
                    <div className="border-t border-gray-100 dark:border-white/5 pt-1.5 pb-1">
                      <button 
                        id="nav-logout"
                        onClick={() => { setProfileMenuOpen(false); logout(); }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
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
