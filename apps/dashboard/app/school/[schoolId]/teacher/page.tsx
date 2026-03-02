'use client';

import { useParams } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';
import { useSchool } from '../../../../contexts/SchoolContext';
import { useI18n } from '../../../../contexts/I18nContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Users,
  CalendarCheck,
  TrendingUp,
  BookOpen,
  Calendar,
  ClipboardList,
} from 'lucide-react';
import { KPICard } from '../../../../components/school/shared/KPICard';
import { Card } from '../../../../components/ui/Card';

interface TeacherStats {
  classesCount: number;
  studentsCount: number;
  todayAttendanceRate: number | null;
  homeworkPending: number;
}

const EMPTY_STATS: TeacherStats = {
  classesCount: 0,
  studentsCount: 0,
  todayAttendanceRate: null,
  homeworkPending: 0,
};

export default function TeacherDashboardPage() {
  const params = useParams();
  const { user, accessToken } = useAuth();
  const { selectedSchool } = useSchool();
  const { t, lang } = useI18n();
  const schoolId = decodeURIComponent(params.schoolId as string);
  const encodedSchoolId = encodeURIComponent(schoolId);

  const [stats, setStats] = useState<TeacherStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!schoolId || !accessToken) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/school/teacher/stats?schoolId=${encodedSchoolId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok && !cancelled) {
          const data = await res.json();
          const d = data?.data ?? {};
          setStats({
            classesCount: d.classesCount ?? 0,
            studentsCount: d.studentsCount ?? 0,
            todayAttendanceRate: d.todayAttendanceRate ?? null,
            homeworkPending: d.homeworkPending ?? 0,
          });
        }
      } catch (e) {
        console.error('Teacher dashboard load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [schoolId, encodedSchoolId, accessToken]);

  const schoolName = selectedSchool?.name || schoolId;

  const quickActions = [
    {
      icon: Calendar,
      label: lang === 'vi' ? 'Lịch & Thời khóa biểu' : 'Calendar & Timetable',
      href: `/school/${encodedSchoolId}/teacher/calendar`,
      color: 'bg-blue-500',
    },
    {
      icon: GraduationCap,
      label: t('classes'),
      href: `/school/${encodedSchoolId}/teacher/classes`,
      color: 'bg-green-500',
    },
    {
      icon: CalendarCheck,
      label: t('attendance'),
      href: `/school/${encodedSchoolId}/teacher/attendance`,
      color: 'bg-purple-500',
    },
    {
      icon: TrendingUp,
      label: t('progressReports'),
      href: `/school/${encodedSchoolId}/teacher/progress-reports`,
      color: 'bg-orange-500',
    },
    {
      icon: BookOpen,
      label: t('homework'),
      href: `/school/${encodedSchoolId}/teacher/homework`,
      color: 'bg-indigo-500',
    },
    {
      icon: Users,
      label: lang === 'vi' ? 'Học sinh' : 'Students',
      href: `/school/${encodedSchoolId}/teacher/students`,
      color: 'bg-teal-500',
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {lang === 'vi' ? 'Chào mừng' : 'Welcome'}, {user?.name || 'Teacher'}!
        </h1>
        <p className="text-gray-600">
          {schoolName} · {lang === 'vi' ? 'Bảng điều khiển giáo viên' : 'Teacher dashboard'}
        </p>
      </div>

      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              icon={GraduationCap}
              title={lang === 'vi' ? 'Lớp học' : 'Classes'}
              value={stats.classesCount}
              color="blue"
            />
            <KPICard
              icon={Users}
              title={lang === 'vi' ? 'Học sinh' : 'Students'}
              value={stats.studentsCount}
              color="green"
            />
            <KPICard
              icon={CalendarCheck}
              title={lang === 'vi' ? 'Điểm danh hôm nay' : "Today's Attendance"}
              value={
                stats.todayAttendanceRate !== null
                  ? `${stats.todayAttendanceRate}%`
                  : lang === 'vi' ? 'Chưa điểm danh' : 'Not marked'
              }
              color="purple"
            />
            <KPICard
              icon={ClipboardList}
              title={lang === 'vi' ? 'Bài tập đang hoạt động' : 'Active Homework'}
              value={stats.homeworkPending}
              color="orange"
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {lang === 'vi' ? 'Truy cập nhanh' : 'Quick access'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {quickActions.map((action) => (
                <Link key={action.href} href={action.href}>
                  <Card className="p-5 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-transparent hover:border-primary/20">
                    <div className="flex flex-col items-center gap-3 text-center">
                      <div className={`${action.color} p-3 rounded-xl text-white`}>
                        <action.icon className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-gray-900 text-sm">{action.label}</span>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
