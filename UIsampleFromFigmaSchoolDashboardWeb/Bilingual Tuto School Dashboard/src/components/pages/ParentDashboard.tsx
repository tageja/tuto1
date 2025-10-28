import React from 'react';
import { useApp } from '../AppContext';
import { StatsCard } from '../StatsCard';
import { AnnouncementCard } from '../AnnouncementCard';
import { AIInsightPanel } from '../AIInsightPanel';
import { ClipboardCheck, BookOpen, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

const announcements = [
  {
    title: 'Annual Sports Day - Registration Open',
    description: 'Register your child for the upcoming Annual Sports Day. All students welcome!',
    date: 'Oct 20, 2025',
    priority: 'normal' as const,
    status: 'published' as const,
  },
  {
    title: 'School Closure Notice - National Holiday',
    description: 'School will be closed on Oct 25 for the national holiday.',
    date: 'Oct 18, 2025',
    priority: 'urgent' as const,
    status: 'published' as const,
  },
];

const upcomingHomework = [
  { subject: 'Mathematics', title: 'Problem Set 3.2', dueDate: 'Oct 26', status: 'pending' },
  { subject: 'Science', title: 'Lab Report - Photosynthesis', dueDate: 'Oct 27', status: 'submitted' },
  { subject: 'English', title: 'Essay on Climate Change', dueDate: 'Oct 28', status: 'pending' },
];

const recentAttendance = [
  { date: 'Oct 24', status: 'present' },
  { date: 'Oct 23', status: 'present' },
  { date: 'Oct 22', status: 'present' },
  { date: 'Oct 21', status: 'late' },
  { date: 'Oct 20', status: 'present' },
];

export function ParentDashboard() {
  const { t } = useApp();

  return (
    <div className="p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-xl p-6 text-white">
        <h1 className="text-white m-0 mb-2">Welcome back, Parent!</h1>
        <p className="text-white/90 m-0">Friday, October 24, 2025</p>
        <p className="text-white/80 text-sm m-0 mt-2">Student: Emily Chen • Grade 5A</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title={t('attendanceRate')}
          value="96%"
          delta={2}
          icon={<ClipboardCheck size={24} />}
          tone="success"
        />
        <StatsCard
          title="Homework Completion"
          value="85%"
          delta={5}
          icon={<BookOpen size={24} />}
          tone="success"
        />
        <StatsCard
          title="Average Grade"
          value="A-"
          delta={3}
          icon={<TrendingUp size={24} />}
          tone="success"
        />
        <StatsCard
          title={t('upcomingEvents')}
          value="3"
          icon={<Calendar size={24} />}
          tone="default"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Announcements */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="m-0">{t('recentAnnouncements')}</h3>
            <Button variant="ghost" size="sm">{t('viewAll')}</Button>
          </div>
          {announcements.map((ann, i) => (
            <AnnouncementCard key={i} {...ann} />
          ))}
        </div>

        {/* Homework */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="m-0">{t('upcomingHomework')}</h3>
            <Button variant="ghost" size="sm">{t('viewAll')}</Button>
          </div>
          <div className="bg-card rounded-xl border border-border">
            {upcomingHomework.map((hw, i) => (
              <div key={i} className={`p-4 ${i !== upcomingHomework.length - 1 ? 'border-b border-border' : ''}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="m-0">{hw.subject}</h4>
                      <Badge variant={hw.status === 'submitted' ? 'default' : 'secondary'}>
                        {hw.status === 'submitted' ? 'Submitted' : 'Pending'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground m-0">{hw.title}</p>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap ml-4">{hw.dueDate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Attendance & Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="m-0 mb-4">Recent Attendance</h3>
          <div className="space-y-3">
            {recentAttendance.map((att, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-muted-foreground">{att.date}</span>
                <Badge
                  variant={
                    att.status === 'present'
                      ? 'default'
                      : att.status === 'late'
                      ? 'secondary'
                      : 'destructive'
                  }
                  className={
                    att.status === 'present'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100'
                      : att.status === 'late'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100'
                      : ''
                  }
                >
                  {t(att.status)}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card rounded-xl border border-border p-6">
          <h3 className="m-0 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="mr-2" size={16} />
              Message Teacher
            </Button>
            <Button className="w-full justify-start" variant="outline">
              View Full Progress Report
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Check Payment Status
            </Button>
            <Button className="w-full justify-start" variant="outline">
              Browse Photo Albums
            </Button>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <AIInsightPanel
        title="Learning Insights"
        body="Emily shows strong performance in Mathematics and Science. Reading comprehension has improved by 15% this month."
        metric={{ label: 'Overall Progress', value: '+12%', trend: 'up' }}
      />

      {/* Footer */}
      <footer className="pt-6 mt-6 border-t border-border text-center">
        <p className="text-muted-foreground text-sm m-0">{t('copyright')}</p>
      </footer>
    </div>
  );
}

function MessageSquare({ className, size }: { className?: string; size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
