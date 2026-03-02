'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useI18n } from '../../contexts/I18nContext';
import { useSchool } from '../../contexts/SchoolContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  CalendarCheck,
  BookOpen,
  TrendingUp,
  Settings,
  GraduationCap,
  ClipboardList,
} from 'lucide-react';

export function TeacherSidebar() {
  const pathname = usePathname();
  const { t } = useI18n();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || '';
  const encodedSchoolId = encodeURIComponent(schoolId);

  const menuItems = [
    { icon: LayoutDashboard, label: t('dashboard'), href: `/school/${encodedSchoolId}/teacher` },
    { icon: Calendar, label: t('calendarTimetable') || 'Calendar & Timetable', href: `/school/${encodedSchoolId}/teacher/calendar` },
    { icon: GraduationCap, label: t('classes'), href: `/school/${encodedSchoolId}/teacher/classes` },
    { icon: CalendarCheck, label: t('attendance'), href: `/school/${encodedSchoolId}/teacher/attendance` },
    { icon: TrendingUp, label: t('progressReports'), href: `/school/${encodedSchoolId}/teacher/progress-reports` },
    { icon: BookOpen, label: t('homework'), href: `/school/${encodedSchoolId}/teacher/homework` },
    { icon: ClipboardList, label: t('students'), href: `/school/${encodedSchoolId}/teacher/students` },
    { icon: Settings, label: t('settings'), href: `/school/${encodedSchoolId}/teacher/settings` },
  ];

  return (
    <div className="w-64 bg-card border-r border-border min-h-screen flex flex-col">
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

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (pathname?.startsWith(item.href) && item.href !== `/school/${encodedSchoolId}/teacher`);

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'text-text hover:bg-surface'
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

      <div className="p-4 border-t border-border">
        <p className="text-xs text-center text-text-muted">learn • connect • grow</p>
      </div>
    </div>
  );
}
