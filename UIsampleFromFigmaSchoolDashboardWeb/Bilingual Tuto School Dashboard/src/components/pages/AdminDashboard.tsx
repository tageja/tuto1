import React from 'react';
import { useApp } from '../AppContext';
import { StatsCard } from '../StatsCard';
import { ChartWidget } from '../ChartWidget';
import { AnnouncementCard } from '../AnnouncementCard';
import { MessageCard } from '../MessageCard';
import { AIInsightPanel } from '../AIInsightPanel';
import { Users, GraduationCap, TrendingUp, Calendar, CreditCard, Star } from 'lucide-react';
import { Button } from '../ui/button';

const chartData = [
  { name: 'Jan', value: 850 },
  { name: 'Feb', value: 920 },
  { name: 'Mar', value: 880 },
  { name: 'Apr', value: 950 },
  { name: 'May', value: 1020 },
  { name: 'Jun', value: 980 },
];

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
  {
    title: 'Parent-Teacher Conference Schedule',
    description: 'Individual meetings scheduled for Nov 1-5. Check your inbox for appointment times.',
    date: 'Oct 15, 2025',
    priority: 'high' as const,
    status: 'published' as const,
  },
];

const messages = [
  {
    from: 'Ms. Sarah Johnson',
    subject: 'Math homework clarification needed',
    preview: 'Could you please clarify the instructions for problem set 3.2?',
    date: '2h ago',
    priority: 'normal' as const,
    read: false,
  },
  {
    from: 'Principal Office',
    subject: 'Monthly newsletter ready for review',
    preview: 'The October newsletter is ready for your approval before publishing.',
    date: '5h ago',
    priority: 'high' as const,
    read: false,
  },
];

const homeworkList = [
  { title: 'Math Problem Set 3.2', class: 'Grade 5A', dueDate: 'Oct 26' },
  { title: 'Science Lab Report', class: 'Grade 6B', dueDate: 'Oct 27' },
  { title: 'English Essay', class: 'Grade 5A', dueDate: 'Oct 28' },
];

export function AdminDashboard() {
  const { t } = useApp();

  return (
    <div className="p-6 space-y-6">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#0B5FFF] to-[#6366F1] rounded-xl p-6 text-white">
        <h1 className="text-white m-0 mb-2">Sunrise International School</h1>
        <p className="text-white/90 m-0">Friday, October 24, 2025</p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title={t('totalStudents')}
          value="1,245"
          delta={5.2}
          icon={<Users size={24} />}
          tone="default"
        />
        <StatsCard
          title={t('activeTeachers')}
          value="87"
          delta={2.1}
          icon={<GraduationCap size={24} />}
          tone="success"
        />
        <StatsCard
          title={t('attendanceRate')}
          value="94.5%"
          delta={1.3}
          icon={<TrendingUp size={24} />}
          tone="success"
        />
        <StatsCard
          title={t('upcomingEvents')}
          value="12"
          icon={<Calendar size={24} />}
          tone="default"
        />
        <StatsCard
          title={t('feeCollection')}
          value="$485K"
          delta={-3.2}
          icon={<CreditCard size={24} />}
          tone="warning"
        />
        <StatsCard
          title={t('averageRating')}
          value="4.8"
          delta={0.5}
          icon={<Star size={24} />}
          tone="success"
        />
      </div>

      {/* Charts */}
      <ChartWidget data={chartData} title="Student Enrollment Trend" />

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

        {/* Messages & Homework */}
        <div className="space-y-6">
          {/* Messages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="m-0">{t('unreadMessages')}</h3>
              <Button variant="ghost" size="sm">{t('viewAll')}</Button>
            </div>
            {messages.map((msg, i) => (
              <MessageCard key={i} {...msg} />
            ))}
          </div>

          {/* Upcoming Homework */}
          <div className="space-y-4">
            <h3 className="m-0">{t('upcomingHomework')}</h3>
            <div className="bg-card rounded-xl border border-border">
              {homeworkList.map((hw, i) => (
                <div key={i} className={`p-4 ${i !== homeworkList.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="m-0 mb-1">{hw.title}</h4>
                      <p className="text-sm text-muted-foreground m-0">{hw.class}</p>
                    </div>
                    <span className="text-sm text-muted-foreground">{hw.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIInsightPanel
          title={t('aiInsights') + ' - Attendance Prediction'}
          body="Based on weather patterns and recent trends, we predict 96.2% attendance for next week."
          metric={{ label: 'Predicted Attendance', value: '96.2%', trend: 'up' }}
        />
        <AIInsightPanel
          title={t('aiInsights') + ' - Adaptive Learning'}
          body="Students in Grade 5A show improved engagement with visual learning materials. Consider increasing multimedia content."
          comingSoon
        />
      </div>

      {/* Footer */}
      <footer className="pt-6 mt-6 border-t border-border text-center">
        <p className="text-muted-foreground text-sm m-0">{t('copyright')}</p>
      </footer>
    </div>
  );
}
