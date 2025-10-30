import { TrendingUp, BookOpen, CalendarCheck, PartyPopper, MessageCircle, FileText, CreditCard, Image as ImageIcon } from 'lucide-react';
import { KPICard } from '../../../components/school/shared/KPICard';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { StatusBadge } from '../../../components/school/shared/StatusBadge';
import { getStudentByParentEmail, getAttendanceRecords, getHomeworkAssignments, getProgressReports, getAnnouncements } from '../../../lib/school/data';

export default async function ParentDashboard() {
  const schoolId = 'Sunrise International School';
  const parentEmail = 'parent@example.com'; // In real app, get from auth
  
  const student = await getStudentByParentEmail(parentEmail, schoolId);
  const studentName = student?.fields['Student Name'] || 'Student';
  const className = student?.fields['Class Name'] || 'Grade 5A';

  const [attendance, homework, progressReports, announcements] = await Promise.all([
    getAttendanceRecords(schoolId),
    getHomeworkAssignments(studentName),
    getProgressReports(studentName),
    getAnnouncements(schoolId),
  ]);

  // Calculate stats
  const presentCount = attendance.filter(a => a.fields.Status === 'Present').length;
  const attendanceRate = attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 95;
  const homeworkCompleted = homework.filter(h => h.fields.Status === 'Completed').length;
  const homeworkCompletionRate = homework.length > 0 ? Math.round((homeworkCompleted / homework.length) * 100) : 88;
  const averageGrade = '4.2';
  const upcomingEvents = 3;

  return (
    <div className="p-6">
      {/* Welcome Banner */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Welcome back, Parent!</h1>
            <p className="text-blue-100">Student: {studentName} • Class: {className}</p>
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
          title="Attendance Rate"
          value={`${attendanceRate}%`}
          trend={{ value: '2.1%', isPositive: true }}
          color="green"
        />
        <KPICard
          icon={BookOpen}
          title="Homework Completion"
          value={`${homeworkCompletionRate}%`}
          trend={{ value: '5.3%', isPositive: true }}
          color="blue"
        />
        <KPICard
          icon={TrendingUp}
          title="Average Grade"
          value={averageGrade}
          trend={{ value: '0.3', isPositive: true }}
          color="purple"
        />
        <KPICard
          icon={PartyPopper}
          title="Upcoming Events"
          value={upcomingEvents}
          color="orange"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Recent Announcements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Announcements</h3>
            <a href="/school/parent/announcements" className="text-sm text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-4">
            {announcements.slice(0, 3).map((announcement) => (
              <div key={announcement.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm text-gray-900">{announcement.fields['Announcement Title'] || 'Announcement'}</h4>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">{announcement.fields.Content || ''}</p>
                    <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                  </div>
                  <StatusBadge status={announcement.fields.Priority || 'Normal'} />
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">No announcements</p>
            )}
          </div>
        </Card>

        {/* Upcoming Homework */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Upcoming Homework</h3>
            <a href="/school/parent/homework" className="text-sm text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-3">
            {[
              { subject: 'Mathematics', title: 'Problem Set 3.2', due: 'Tomorrow', status: 'Pending' },
              { subject: 'Science', title: 'Lab Report', due: 'In 2 days', status: 'Pending' },
              { subject: 'English', title: 'Essay Writing', due: 'In 4 days', status: 'In Progress' },
            ].map((hw, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-blue-600">{hw.subject}</span>
                  <StatusBadge status={hw.status} />
                </div>
                <p className="text-sm font-medium text-gray-900">{hw.title}</p>
                <p className="text-xs text-gray-500 mt-1">Due: {hw.due}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Recent Attendance */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Attendance</h3>
            <a href="/school/parent/attendance" className="text-sm text-blue-600 hover:underline">View All</a>
          </div>
          <div className="space-y-2">
            {[
              { date: 'Mon, Oct 20', status: 'Present' },
              { date: 'Tue, Oct 21', status: 'Present' },
              { date: 'Wed, Oct 22', status: 'Late' },
              { date: 'Thu, Oct 23', status: 'Present' },
              { date: 'Fri, Oct 24', status: 'Present' },
            ].map((item, index) => (
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
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" disabled title="Coming in Phase 2">
            <MessageCircle className="w-6 h-6" />
            <span className="text-sm">Message Teacher</span>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
            <a href="/school/parent/progress">
              <FileText className="w-6 h-6" />
              <span className="text-sm">View Progress</span>
            </a>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" asChild>
            <a href="/school/parent/payments">
              <CreditCard className="w-6 h-6" />
              <span className="text-sm">Check Payments</span>
            </a>
          </Button>
          <Button variant="outline" className="h-24 flex flex-col items-center justify-center gap-2" disabled title="Coming in Phase 2">
            <ImageIcon className="w-6 h-6" />
            <span className="text-sm">Photo Albums</span>
          </Button>
        </div>
      </div>

      {/* Learning Insights */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50">
        <h3 className="text-lg font-semibold mb-4">AI-Powered Learning Insights</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Performance Summary</h4>
            <p className="text-sm text-gray-700">
              {studentName} is performing excellently in Mathematics and Science. Shows strong analytical skills and consistent improvement in problem-solving.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Consider additional reading practice to strengthen English comprehension</li>
              <li>• Excellent progress in Math - ready for advanced topics</li>
              <li>• Maintain current study routine for optimal results</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}



