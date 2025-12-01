import React from 'react';
import { useApp } from './AppContext';
import {
  LayoutDashboard,
  Calendar,
  Megaphone,
  MessageSquare,
  Images,
  Users,
  GraduationCap,
  ClipboardCheck,
  BookOpen,
  TrendingUp,
  CalendarDays,
  CreditCard,
  Heart,
  Trophy,
  Settings,
  BookMarked,
} from 'lucide-react';

interface NavItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  roles: ('admin' | 'parent')[];
  badge?: string;
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'dashboard', icon: <LayoutDashboard size={20} />, roles: ['admin', 'parent'] },
  { key: 'dailyActivities', label: 'dailyActivities', icon: <Calendar size={20} />, roles: ['admin'] },
  { key: 'announcements', label: 'announcements', icon: <Megaphone size={20} />, roles: ['admin', 'parent'] },
  { key: 'messages', label: 'messages', icon: <MessageSquare size={20} />, roles: ['admin', 'parent'] },
  { key: 'photoAlbums', label: 'photoAlbums', icon: <Images size={20} />, roles: ['admin'] },
  { key: 'classes', label: 'classes', icon: <Users size={20} />, roles: ['admin'] },
  { key: 'teachers', label: 'teachers', icon: <GraduationCap size={20} />, roles: ['admin'] },
  { key: 'attendance', label: 'attendance', icon: <ClipboardCheck size={20} />, roles: ['admin', 'parent'] },
  { key: 'homework', label: 'homework', icon: <BookOpen size={20} />, roles: ['admin', 'parent'] },
  { key: 'progress', label: 'progressReports', icon: <TrendingUp size={20} />, roles: ['admin', 'parent'] },
  { key: 'events', label: 'events', icon: <CalendarDays size={20} />, roles: ['admin', 'parent'] },
  { key: 'payments', label: 'payments', icon: <CreditCard size={20} />, roles: ['admin', 'parent'] },
  { key: 'health', label: 'health', icon: <Heart size={20} />, roles: ['admin', 'parent'] },
  { key: 'extracurricular', label: 'extracurricular', icon: <Trophy size={20} />, roles: ['admin', 'parent'] },
  { key: 'library', label: 'library', icon: <BookMarked size={20} />, roles: ['parent'], badge: 'comingSoon' },
  { key: 'settings', label: 'settings', icon: <Settings size={20} />, roles: ['admin', 'parent'] },
];

interface NavSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function NavSidebar({ currentPage, onNavigate }: NavSidebarProps) {
  const { role, t } = useApp();

  const filteredItems = navItems.filter(item => item.roles.includes(role));

  return (
    <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0B5FFF] to-[#6366F1] flex items-center justify-center">
            <span className="text-white">T</span>
          </div>
          <div>
            <h1 className="text-[#0B5FFF] m-0">Tuto</h1>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 overflow-y-auto">
        {filteredItems.map(item => (
          <button
            key={item.key}
            onClick={() => onNavigate(item.key)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
              currentPage === item.key
                ? 'bg-[#0B5FFF] text-white'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            {item.icon}
            <span className="flex-1 text-left">{t(item.label)}</span>
            {item.badge && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent text-accent-foreground">
                {t(item.badge)}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Tagline */}
      <div className="p-6 border-t border-border">
        <p className="text-muted-foreground text-center m-0">{t('tagline')}</p>
      </div>
    </div>
  );
}
