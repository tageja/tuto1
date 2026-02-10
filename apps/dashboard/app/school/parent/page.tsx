'use client';

import { TrendingUp, BookOpen, CalendarCheck, PartyPopper, MessageCircle, FileText, CreditCard, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { KPICard } from '../../../components/school/shared/KPICard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/school/shared/StatusBadge';
import { useI18n } from '../../../contexts/I18nContext';
import { useSchool } from '../../../contexts/SchoolContext';
import supabase from '../../../lib/supabase';

interface ChildInfo {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

interface ParentKPIs {
  attendanceRate: number;
  homeworkCompletion: number;
  averageGrade: number;
  upcomingEvents: number;
}

const EMPTY_KPIS: ParentKPIs = {
  attendanceRate: 0,
  homeworkCompletion: 0,
  averageGrade: 0,
  upcomingEvents: 0,
};

export default function ParentDashboard() {
  const { t } = useI18n();
  const { selectedSchool } = useSchool();
  const [children, setChildren] = useState<ChildInfo[]>([]);
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [parentKpis, setParentKpis] = useState<ParentKPIs>(EMPTY_KPIS);

  const schoolId = selectedSchool?.id || selectedSchool?.name;

  useEffect(() => {
    if (!schoolId) {
      setChildrenLoading(false);
      return;
    }

    async function fetchChildren() {
      setChildrenLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setChildren([]);
          setChildrenLoading(false);
          return;
        }

        // Resolve school identifier to UUID (school_parent_students.school_id is UUID)
        let schoolUuid: string | null = schoolId;
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (!uuidRegex.test(schoolId)) {
          const { data: schoolRow } = await supabase
            .from('schools')
            .select('id')
            .eq('name', schoolId)
            .maybeSingle();
          schoolUuid = schoolRow?.id ?? null;
        }
        if (!schoolUuid) {
          setChildren([]);
          setChildrenLoading(false);
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .single();

        let list: ChildInfo[] = [];

        // 1) Try school_parent_students (explicit link)
        if (!userError && userData) {
          const { data: mappings } = await supabase
            .from('school_parent_students')
            .select(
              `
              student_id,
              school_students!inner (
                id,
                first_name,
                last_name,
                school_classes (name)
              )
            `
            )
            .eq('school_id', schoolUuid)
            .eq('parent_user_id', userData.id);

          if (mappings && mappings.length > 0) {
            list = mappings.map((m: any) => ({
              id: m.school_students.id,
              first_name: m.school_students.first_name || '',
              last_name: m.school_students.last_name || '',
              class_name: m.school_students.school_classes?.name || '—',
            }));
          }
        }

        // 2) Fallback: school_students where parent_email matches (admin-enrolled link)
        if (list.length === 0) {
          const { data: studentsByEmail } = await supabase
            .from('school_students')
            .select('id, first_name, last_name, school_classes(name)')
            .eq('school_id', schoolUuid)
            .ilike('parent_email', user.email!)
            .in('status', ['active', 'Active']);

          if (studentsByEmail && studentsByEmail.length > 0) {
            list = studentsByEmail.map((s: any) => ({
              id: s.id,
              first_name: s.first_name || '',
              last_name: s.last_name || '',
              class_name: s.school_classes?.name || '—',
            }));
          }
        }

        setChildren(list);
      } catch (err) {
        console.error('Error fetching parent children:', err);
        setChildren([]);
      } finally {
        setChildrenLoading(false);
      }
    }

    fetchChildren();
  }, [schoolId]);

  useEffect(() => {
    if (!schoolId?.trim()) {
      setParentKpis(EMPTY_KPIS);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          `/api/school/parent/kpis?schoolId=${encodeURIComponent(schoolId)}`,
          { credentials: 'include' }
        );
        const json = await res.json();
        if (cancelled) return;
        if (json?.success && json?.data) {
          setParentKpis({
            attendanceRate: Number(json.data.attendanceRate) || 0,
            homeworkCompletion: Number(json.data.homeworkCompletion) || 0,
            averageGrade: Number(json.data.averageGrade) || 0,
            upcomingEvents: Number(json.data.upcomingEvents) || 0,
          });
        } else {
          setParentKpis(EMPTY_KPIS);
        }
      } catch {
        if (!cancelled) setParentKpis(EMPTY_KPIS);
      }
    })();
    return () => { cancelled = true; };
  }, [schoolId]);

  const studentName = children.length === 0
    ? (childrenLoading ? '…' : '—')
    : children.map((c) => `${c.first_name} ${c.last_name}`.trim() || '—').join(', ');
  const className = children.length === 0
    ? '—'
    : children.map((c) => c.class_name).join(', ');

  // Mock announcements
  const announcements: any[] = [];

  // Mock homework
  const homework = [
    { subject: t('parentDashboard.subjects.mathematics'), title: 'Problem Set 3.2', due: t('parentDashboard.tomorrow'), status: t('parentDashboard.status.pending') },
    { subject: t('parentDashboard.subjects.science'), title: 'Lab Report', due: t('parentDashboard.inDays').replace('{days}', '2'), status: t('parentDashboard.status.pending') },
    { subject: t('parentDashboard.subjects.english'), title: 'Essay Writing', due: t('parentDashboard.inDays').replace('{days}', '4'), status: t('parentDashboard.status.inProgress') },
  ];

  // Mock attendance
  const recentAttendance = [
    { date: 'Mon, Oct 20', status: t('parentDashboard.status.present') },
    { date: 'Tue, Oct 21', status: t('parentDashboard.status.present') },
    { date: 'Wed, Oct 22', status: t('parentDashboard.status.late') },
    { date: 'Thu, Oct 23', status: t('parentDashboard.status.present') },
    { date: 'Fri, Oct 24', status: t('parentDashboard.status.present') },
  ];

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t('parentDashboard.welcomeBack')}</h1>
            <p className="text-blue-100">
              {t('parentDashboard.studentInfo')
                .replace('{student}', studentName)
                .replace('{class}', className)}
              {!childrenLoading && children.length === 0 && schoolId && (
                <span className="block mt-1 text-blue-200/90 text-sm">
                  {t('parentDashboard.noStudentsLinked') || 'No students linked for this school. Sign in as the parent or link your account.'}
                </span>
              )}
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            👋
          </div>
        </div>
      </Card>

      {/* KPI Cards (from database; 0 when no data) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={CalendarCheck}
          title={t('parentDashboard.attendanceRate')}
          value={`${parentKpis.attendanceRate}%`}
          color="green"
        />
        <KPICard
          icon={BookOpen}
          title={t('parentDashboard.homeworkCompletion')}
          value={`${parentKpis.homeworkCompletion}%`}
          color="blue"
        />
        <KPICard
          icon={TrendingUp}
          title={t('parentDashboard.averageGrade')}
          value={parentKpis.averageGrade}
          color="purple"
        />
        <KPICard
          icon={PartyPopper}
          title={t('parentDashboard.upcomingEvents')}
          value={parentKpis.upcomingEvents}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Announcements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('parentDashboard.recentAnnouncements')}</h3>
            <a href="/school/parent/announcements" className="text-sm text-blue-600 hover:underline">
              {t('common.viewAll')}
            </a>
          </div>
          <div className="space-y-4">
            {announcements.slice(0, 3).map((announcement: any) => (
              <div key={announcement.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{announcement.fields['Announcement Title'] || 'Announcement'}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{announcement.fields.Content || ''}</p>
                    <p className="text-xs text-gray-400 mt-1">{t('parentDashboard.hoursAgo').replace('{hours}', '2')}</p>
                  </div>
                  <StatusBadge status={announcement.fields.Priority || 'Normal'} />
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">{t('parentDashboard.noAnnouncements')}</p>
            )}
          </div>
        </Card>

        {/* Upcoming Homework */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('parentDashboard.upcomingHomework')}</h3>
            <a href="/school/parent/homework" className="text-sm text-blue-600 hover:underline">
              {t('common.viewAll')}
            </a>
          </div>
          <div className="space-y-3">
            {homework.map((hw, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-blue-600">{hw.subject}</span>
                  <StatusBadge status={hw.status} />
                </div>
                <p className="text-sm font-medium text-gray-900">{hw.title}</p>
                <p className="text-xs text-gray-500 mt-1">{t('parentDashboard.due')}: {hw.due}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Attendance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('parentDashboard.recentAttendance')}</h3>
            <a href="/school/parent/attendance" className="text-sm text-blue-600 hover:underline">
              {t('common.viewAll')}
            </a>
          </div>
          <div className="space-y-2">
            {recentAttendance.map((item, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <span className="text-sm text-gray-700">{item.date}</span>
                <StatusBadge status={item.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">{t('parentDashboard.quickActions')}</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" disabled title="Coming in Phase 2">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm">{t('parentDashboard.messageTeacher')}</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
            <a href="/school/parent/progress">
              <FileText className="w-6 h-6" />
              <span className="text-sm">{t('parentDashboard.viewProgress')}</span>
            </a>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
            <a href="/school/parent/payments">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">{t('parentDashboard.checkPayments')}</span>
            </a>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" disabled title="Coming in Phase 2">
            <ImageIcon className="w-6 h-6" />
            <span className="text-sm">{t('parentDashboard.photoAlbums')}</span>
          </Button>
        </div>
      </div>

      {/* Learning Insights */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h3 className="text-lg font-semibold mb-4">{t('parentDashboard.aiInsights')}</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('parentDashboard.performanceSummary')}</h4>
            <p className="text-sm text-gray-700">
              {t('parentDashboard.performanceText').replace('{student}', studentName)}
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">{t('parentDashboard.recommendations')}</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• {t('parentDashboard.recommendation1')}</li>
              <li>• {t('parentDashboard.recommendation2')}</li>
              <li>• {t('parentDashboard.recommendation3')}</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
