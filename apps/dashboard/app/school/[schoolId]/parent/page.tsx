'use client';

import { Users, Calendar, BookOpen, Bell, MessageSquare, CreditCard, Camera, Heart } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';
import { useSchool } from '../../../../contexts/SchoolContext';
import { useI18n } from '../../../../contexts/I18nContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface QuickAction {
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  icon: React.ElementType;
  href: string;
  color: string;
}

export default function ParentDashboard() {
  const params = useParams();
  const router = useRouter();
  const { selectedSchool, schoolIdFromUrl } = useSchool();
  const { t, lang } = useI18n();
  const { user } = useAuth();
  
  // Get schoolId from URL params first, then fallback to context
  const schoolIdFromUrlParam = params.schoolId ? decodeURIComponent(params.schoolId as string) : null;
  const schoolId = schoolIdFromUrlParam || schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name;
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('👨‍👩‍👧 Parent Dashboard - schoolId:', schoolId, 'user:', user?.email);
  }

  const quickActions: QuickAction[] = [
    {
      title: 'Announcements',
      titleVi: 'Thông báo',
      description: 'View school announcements',
      descriptionVi: 'Xem thông báo trường',
      icon: Bell,
      href: `/school/${schoolId}/parent/announcements`,
      color: 'bg-blue-500',
    },
    {
      title: 'Attendance',
      titleVi: 'Điểm danh',
      description: "Check your child's attendance",
      descriptionVi: 'Xem điểm danh của con',
      icon: Calendar,
      href: `/school/${schoolId}/parent/attendance`,
      color: 'bg-green-500',
    },
    {
      title: 'Homework',
      titleVi: 'Bài tập',
      description: 'View homework assignments',
      descriptionVi: 'Xem bài tập về nhà',
      icon: BookOpen,
      href: `/school/${schoolId}/parent/homework`,
      color: 'bg-purple-500',
    },
    {
      title: 'Daily Activities',
      titleVi: 'Hoạt động hàng ngày',
      description: 'See daily activities',
      descriptionVi: 'Xem hoạt động hàng ngày',
      icon: Heart,
      href: `/school/${schoolId}/parent/daily-activities`,
      color: 'bg-pink-500',
    },
    {
      title: 'Messages',
      titleVi: 'Tin nhắn',
      description: 'Chat with teachers',
      descriptionVi: 'Nhắn tin với giáo viên',
      icon: MessageSquare,
      href: `/school/${schoolId}/parent/messages`,
      color: 'bg-indigo-500',
    },
    {
      title: 'Photo Albums',
      titleVi: 'Album ảnh',
      description: 'View class photos',
      descriptionVi: 'Xem ảnh lớp học',
      icon: Camera,
      href: `/school/${schoolId}/parent/photo-albums`,
      color: 'bg-orange-500',
    },
    {
      title: 'Fees',
      titleVi: 'Phí',
      description: 'View fees',
      descriptionVi: 'Xem phí',
      icon: CreditCard,
      href: `/school/${schoolId}/parent/payments`,
      color: 'bg-emerald-500',
    },
    {
      title: 'Progress Reports',
      titleVi: 'Báo cáo tiến độ',
      description: "Track your child's progress",
      descriptionVi: 'Theo dõi tiến độ của con',
      icon: Users,
      href: `/school/${schoolId}/parent/progress-reports`,
      color: 'bg-cyan-500',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          {lang === 'vi' ? 'Chào mừng' : 'Welcome'}, {user?.name || 'Parent'}! 👋
        </h1>
        <p className="text-white/80 text-lg">
          {lang === 'vi' 
            ? 'Theo dõi hoạt động học tập của con bạn'
            : "Stay connected with your child's school activities"
          }
        </p>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h2 className="text-xl font-semibold text-text mb-4">
          {lang === 'vi' ? 'Truy cập nhanh' : 'Quick Access'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}>
              <Card className="p-5 hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 border-transparent hover:border-primary/20">
                <div className="flex items-start gap-4">
                  <div className={`${action.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                    <action.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-text group-hover:text-primary transition-colors">
                      {lang === 'vi' ? action.titleVi : action.title}
                    </h3>
                    <p className="text-sm text-text-muted mt-1">
                      {lang === 'vi' ? action.descriptionVi : action.description}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Announcements Preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              {lang === 'vi' ? 'Thông báo gần đây' : 'Recent Announcements'}
            </h3>
            <Link 
              href={`/school/${schoolId}/parent/announcements`}
              className="text-sm text-primary hover:underline"
            >
              {lang === 'vi' ? 'Xem tất cả' : 'View all'}
            </Link>
          </div>
          <p className="text-text-muted text-sm">
            {lang === 'vi' 
              ? 'Không có thông báo mới'
              : 'No new announcements'
            }
          </p>
        </Card>

        {/* Upcoming Events Preview */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-text flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {lang === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events'}
            </h3>
            <Link 
              href={`/school/${schoolId}/parent/events`}
              className="text-sm text-primary hover:underline"
            >
              {lang === 'vi' ? 'Xem tất cả' : 'View all'}
            </Link>
          </div>
          <p className="text-text-muted text-sm">
            {lang === 'vi' 
              ? 'Không có sự kiện sắp tới'
              : 'No upcoming events'
            }
          </p>
        </Card>
      </div>
    </div>
  );
}



