'use client';

import { TrendingUp, BookOpen, CalendarCheck, PartyPopper, MessageCircle, FileText, CreditCard, Image as ImageIcon } from 'lucide-react';
import { KPICard } from '../../../components/school/shared/KPICard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/school/shared/StatusBadge';
import { useI18n } from '../../../contexts/I18nContext';

export default function ParentDashboard() {
  const { t } = useI18n();
  
  // Mock data for demo
  const studentName = 'Student';
  const className = 'Grade 5A';
  const attendanceRate = 95;
  const homeworkCompletionRate = 88;
  const averageGrade = '4.2';
  const upcomingEvents = 3;

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
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl">
            👋
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard
          icon={CalendarCheck}
          title={t('parentDashboard.attendanceRate')}
          value={`${attendanceRate}%`}
          trend={{ value: '2.1%', isPositive: true }}
          color="green"
        />
        <KPICard
          icon={BookOpen}
          title={t('parentDashboard.homeworkCompletion')}
          value={`${homeworkCompletionRate}%`}
          trend={{ value: '5.3%', isPositive: true }}
          color="blue"
        />
        <KPICard
          icon={TrendingUp}
          title={t('parentDashboard.averageGrade')}
          value={averageGrade}
          trend={{ value: '0.3', isPositive: true }}
          color="purple"
        />
        <KPICard
          icon={PartyPopper}
          title={t('parentDashboard.upcomingEvents')}
          value={upcomingEvents}
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
