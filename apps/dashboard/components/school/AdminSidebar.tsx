'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';
import { useSchool } from '../../contexts/SchoolContext';
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
  MessageSquare,
  Crown,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  // Use URL-based schoolId if available, otherwise use selectedSchool
  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || 'Sunrise International School';
  const encodedSchoolId = encodeURIComponent(schoolId);

  // Check if we're on a URL-based route
  const isUrlBasedRoute = pathname?.includes('/school/') && pathname?.match(/\/school\/[^\/]+\/(admin|parent)/);

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: `/school/admin` },
    { icon: Users, label: t('classes'), href: `/school/${encodedSchoolId}/admin/classes` },
    { icon: GraduationCap, label: t('teachers'), href: `/school/${encodedSchoolId}/admin/teachers` },
    { icon: Users, label: t('students'), href: `/school/${encodedSchoolId}/admin/students` },
    { icon: Calendar, label: t('dailyActivities'), href: `/school/${encodedSchoolId}/admin/daily-activities` },
    { icon: Megaphone, label: t('announcements'), href: `/school/${encodedSchoolId}/admin/announcements` },
    { icon: MessageCircle, label: t('messages'), href: `/school/${encodedSchoolId}/admin/messages` },
    { icon: MessageSquare, label: t('feedback'), href: `/school/${encodedSchoolId}/admin/feedback` },
    { icon: CalendarCheck, label: t('attendance'), href: `/school/${encodedSchoolId}/admin/attendance` },
    { icon: BookOpen, label: t('homework'), href: `/school/${encodedSchoolId}/admin/homework` },
    { icon: TrendingUp, label: t('progressReports'), href: `/school/${encodedSchoolId}/admin/progress-reports` },
    { icon: PartyPopper, label: t('events'), href: `/school/${encodedSchoolId}/admin/events` },
    { icon: ImageIcon, label: t('photoAlbums'), href: `/school/${encodedSchoolId}/admin/photo-albums` },
    { icon: Heart, label: t('healthRecords'), href: `/school/${encodedSchoolId}/admin/health` },
    { icon: Pill, label: t('medicine'), href: `/school/${encodedSchoolId}/admin/medicine` },
    { icon: Activity, label: t('extracurricular'), href: `/school/${encodedSchoolId}/admin/extracurricular` },
    { icon: CreditCard, label: t('payments'), href: `/school/${encodedSchoolId}/admin/payments` },
    { icon: Crown, label: t('pricing') || 'Pricing', href: `/pricing` },
    { icon: Settings, label: t('settings'), href: `/school/${encodedSchoolId}/admin/settings` },
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
                (item.label === t('students') && pathname?.includes('/students')) ||
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


