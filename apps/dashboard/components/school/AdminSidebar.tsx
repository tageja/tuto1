'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  Megaphone,
  CalendarCheck,
  PartyPopper,
  CreditCard,
  Settings,
  Heart,
  Trophy,
  MessageCircle,
  Image as ImageIcon,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Pill,
  Activity,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: '/school/admin' },
    { icon: Users, label: t('classes'), href: '/school/admin/classes' },
    { icon: GraduationCap, label: t('teachers'), href: '/school/admin/teachers' },
    { icon: Users, label: t('students'), href: '/school/admin/students' },
    { icon: Calendar, label: t('dailyActivities'), href: '/school/admin/daily-activities' },
    { icon: Megaphone, label: t('announcements'), href: '/school/admin/announcements' },
    { icon: MessageCircle, label: t('messages'), href: '/school/admin/messages' },
    { icon: CalendarCheck, label: t('attendance'), href: '/school/admin/attendance' },
    { icon: BookOpen, label: t('homework'), href: '/school/admin/homework' },
    { icon: TrendingUp, label: t('progressReports'), href: '/school/admin/progress' },
    { icon: PartyPopper, label: t('events'), href: '/school/admin/events' },
    { icon: ImageIcon, label: t('photoAlbums'), href: '/school/admin/photo-albums' },
    { icon: Heart, label: t('healthRecords'), href: '/school/admin/health' },
    { icon: Pill, label: t('medicine'), href: '/school/admin/medicine' },
    { icon: Activity, label: t('extracurricular'), href: '/school/admin/extracurricular' },
    { icon: CreditCard, label: t('payments'), href: '/school/admin/payments' },
    { icon: Settings, label: t('settings'), href: '/school/admin/settings' },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-200">
        <img 
          src="/images/tuto-logo.png" 
          alt="tuto." 
          className="h-10 w-auto mb-2"
        />
        <p className="text-xs text-gray-500">learn • connect • grow</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-center text-gray-500">
          learn • connect • grow
        </p>
      </div>
    </div>
  );
}


