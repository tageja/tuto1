'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';
import { useSchool } from '../../contexts/SchoolContext';
import {
  LayoutDashboard,
  Megaphone,
  MessageCircle,
  CalendarCheck,
  BookOpen,
  TrendingUp,
  PartyPopper,
  CreditCard,
  Heart,
  Settings,
  Pill,
  Image as ImageIcon,
  GraduationCap,
  Calendar,
  MessageSquare,
} from 'lucide-react';

export function ParentSidebar() {
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  // Use URL-based schoolId if available, otherwise use selectedSchool
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || 'Sunrise International School';
  const encodedSchoolId = encodeURIComponent(schoolId);

  // Check if we're on a URL-based route
  const isUrlBasedRoute = pathname?.includes('/school/') && pathname?.match(/\/school\/[^\/]+\/(admin|parent)/);

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: `/school/${encodedSchoolId}/parent` },
    { icon: Calendar, label: lang === 'vi' ? 'Thời khóa biểu' : 'Timetable', href: `/school/${encodedSchoolId}/parent/timetable` },
    { icon: GraduationCap, label: t('teachers'), href: `/school/${encodedSchoolId}/parent/teachers` },
    { icon: Calendar, label: t('dailyActivities'), href: `/school/${encodedSchoolId}/parent/daily-activities` },
    { icon: Megaphone, label: t('announcements'), href: `/school/${encodedSchoolId}/parent/announcements` },
    { icon: MessageCircle, label: t('messages'), href: `/school/${encodedSchoolId}/parent/messages` },
    { icon: MessageSquare, label: t('feedback'), href: `/school/${encodedSchoolId}/parent/feedback` },
    { icon: CalendarCheck, label: t('attendance'), href: `/school/${encodedSchoolId}/parent/attendance` },
    { icon: BookOpen, label: t('homework'), href: `/school/${encodedSchoolId}/parent/homework` },
    { icon: TrendingUp, label: t('progressReports'), href: `/school/${encodedSchoolId}/parent/progress-reports` },
    { icon: PartyPopper, label: t('events'), href: `/school/${encodedSchoolId}/parent/events` },
    { icon: ImageIcon, label: t('photoAlbums'), href: `/school/${encodedSchoolId}/parent/photo-albums` },
    { icon: Heart, label: t('healthRecords'), href: `/school/${encodedSchoolId}/parent/health` },
    { icon: Pill, label: t('medicine'), href: `/school/${encodedSchoolId}/parent/medicine` },
    { icon: CreditCard, label: t('payments'), href: `/school/${encodedSchoolId}/parent/payments` },
    { icon: Settings, label: t('settings'), href: `/school/${encodedSchoolId}/parent/settings` },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-border">
        <Link href="/home" className="block">
          <img 
            src="/images/tuto-logo.png" 
            alt="tuto." 
            className="h-10 w-auto mb-2"
          />
        </Link>
        <p className="text-xs text-text-muted">learn • connect • grow</p>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            // Enhanced active detection for URL-based routes
            let isActive = pathname === item.href;
            
            // Special handling for URL-based routes
            if (pathname?.includes(item.href) || 
                (item.label === t('teachers') && pathname?.includes('/teachers')) ||
                (item.label === t('dailyActivities') && pathname?.includes('/daily-activities'))) {
              isActive = true;
            }

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-text hover:bg-surface'
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
      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-text-muted">
          learn • connect • grow
        </p>
      </div>
    </div>
  );
}


