'use client';

import { Users, GraduationCap, TrendingUp, Calendar, DollarSign, Star } from 'lucide-react';
import { KPICard } from '../../../../components/school/shared/KPICard';
import { Card } from '../../../../components/ui/Card';
import { useSchool } from '../../../../contexts/SchoolContext';
import { useI18n } from '../../../../contexts/I18nContext';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { EnrollmentTrendChart } from '../../../../components/school/shared/EnrollmentTrendChart';
import { AttendanceTrendChart } from '../../../../components/school/shared/AttendanceTrendChart';
import { ParentPinDisplay } from '../../../../components/school/ParentPinDisplay';

export default function AdminDashboard() {
  const params = useParams();
  const { selectedSchool, schoolIdFromUrl } = useSchool();
  const { t, lang } = useI18n();
  
  // Get schoolId from URL params first, then fallback to context
  const schoolIdFromUrlParam = params.schoolId ? decodeURIComponent(params.schoolId as string) : null;
  const schoolId = schoolIdFromUrlParam || schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || 'Tuto Demo School';
  
  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('📊 Dashboard - schoolId:', schoolId, 'selectedSchool:', selectedSchool?.name, 'schoolIdFromUrl:', schoolIdFromUrl);
  }
  
  const [data, setData] = useState<any>({
    students: [],
    teachers: [],
    attendance: [],
    events: [],
    payments: [],
    announcements: [],
    schoolDetails: null,
    unreadMessages: [],
    upcomingHomework: [],
    loading: true,
  });
  const [parentPin, setParentPin] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);

  // Load parent PIN
  useEffect(() => {
    async function loadParentPin() {
      if (!schoolId) return;

      try {
        setPinLoading(true);
        const encodedSchoolId = encodeURIComponent(schoolId);
        
        // Get auth token from Supabase client
        const { supabase } = await import('../../../../lib/supabase');
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
        };

        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/school/parent-pin?schoolId=${encodedSchoolId}`, {
          headers,
        });
        const data = await response.json();

        console.log('🔑 PIN API Response:', { success: data.success, pin: data.pin, error: data.error });

        if (data.success) {
          setParentPin(data.pin ?? null);
        } else {
          console.warn('⚠️ PIN not loaded:', data.error || 'Unknown error');
        }
      } catch (error) {
        console.error('❌ Error loading parent PIN:', error);
      } finally {
        setPinLoading(false);
      }
    }

    loadParentPin();
  }, [schoolId]);

  useEffect(() => {
    async function loadData() {
      if (!schoolId) {
        console.warn('⚠️ No schoolId available, skipping data load');
        setData(prev => ({ ...prev, loading: false }));
        return;
      }

      try {
        setData(prev => ({ ...prev, loading: true }));
        
        // Encode schoolId for URL
        const encodedSchoolId = encodeURIComponent(schoolId);
        
        const responses = await Promise.all([
          fetch(`/api/school/data?table=students&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=teachers&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=attendance&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=events&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=payments&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=announcements&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=schoolDetails&schoolId=${encodedSchoolId}`),
          fetch(`/api/school/data?table=unreadMessages&schoolId=${encodedSchoolId}&userId=demo-admin`),
          fetch(`/api/school/data?table=upcomingHomework&schoolId=${encodedSchoolId}`),
        ]);

        const [students, teachers, attendance, events, payments, announcements, schoolDetails, unreadMessages, upcomingHomework] = await Promise.all(
          responses.map(async (r) => {
            if (!r.ok) {
              console.error(`API error: ${r.status} ${r.statusText}`);
              return { data: [] };
            }
            try {
              return await r.json();
            } catch (err) {
              console.error('Error parsing response:', err);
              return { data: [] };
            }
          })
        );

        // Debug logging
        if (process.env.NODE_ENV === 'development') {
          console.log('📊 Dashboard data loaded for school:', schoolId, {
            students: students.data?.length || 0,
            teachers: teachers.data?.length || 0,
            attendance: attendance.data?.length || 0,
            events: events.data?.length || 0,
            payments: payments.data?.length || 0,
            announcements: announcements.data?.length || 0,
            schoolDetails: schoolDetails.data ? 'Yes' : 'No',
            unreadMessages: unreadMessages.data?.length || 0,
            upcomingHomework: upcomingHomework.data?.length || 0,
          });
        }

        setData({
          students: students.data || [],
          teachers: teachers.data || [],
          attendance: attendance.data || [],
          events: events.data || [],
          payments: payments.data || [],
          announcements: announcements.data || [],
          schoolDetails: schoolDetails.data,
          unreadMessages: unreadMessages.data || [],
          upcomingHomework: upcomingHomework.data || [],
          loading: false,
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setData(prev => ({ ...prev, loading: false }));
      }
    }

    loadData();
  }, [schoolId]);

  if (data.loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate KPIs from data
  // Handle both Supabase (flat) and Airtable (nested) structures
  const totalStudents = data.students.length;
  
  // Count active teachers (handle both formats)
  const activeTeachers = data.teachers.filter((t: any) => {
    const status = t.Status || t.status || 'active';
    return status && status.toLowerCase() === 'active';
  }).length;
  
  // Calculate average rating from teachers (Rating not available in school_teachers table)
  const teacherRatings = data.teachers
    .filter((t: any) => {
      const rating = t.Rating || t.rating;
      return rating && typeof rating === 'number' && rating > 0;
    })
    .map((t: any) => t.Rating || t.rating);
  
  const avgRating = teacherRatings.length > 0 
    ? (teacherRatings.reduce((sum: number, r: number) => sum + r, 0) / teacherRatings.length).toFixed(1)
    : 'N/A';
  
  // Filter attendance for TODAY only
  const today = new Date().toISOString().split('T')[0];
  const todayAttendance = data.attendance.filter((a: any) => {
    const date = a.Date || a.date;
    return date && date.split('T')[0] === today;
  });
  
  const presentToday = todayAttendance.filter((a: any) => {
    const status = a.Status || a.status || 'Present';
    return status && status.toLowerCase() === 'present';
  }).length;
  
  const attendanceRate = todayAttendance.length > 0 
    ? Math.round((presentToday / todayAttendance.length) * 100) 
    : 0;
  
  // Count upcoming events (handle both formats)
  const upcomingEvents = data.events.filter((e: any) => {
    const status = e.Status || e.status || 'Scheduled';
    return status && (status.toLowerCase() === 'scheduled' || status.toLowerCase() === 'in progress');
  }).length;
  
  // Calculate total collection (handle both formats)
  const totalCollection = data.payments.reduce((sum: number, p: any) => {
    const amount = p.Amount || p.amount || 0;
    return sum + (typeof amount === 'number' ? amount : parseFloat(amount) || 0);
  }, 0);

  // Get school name (handle both formats)
  const schoolName = data.schoolDetails?.['School Name'] || 
                     data.schoolDetails?.name || 
                     selectedSchool?.name || 
                     'School Dashboard';
  
  // Format date based on selected language
  const locale = lang === 'vi' ? 'vi-VN' : 'en-US';
  const currentDate = new Date().toLocaleDateString(locale, { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{schoolName}</h1>
        <p className="text-gray-600">{currentDate}</p>
      </div>

      {/* Parent PIN Display */}
      {pinLoading && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600">Loading PIN code...</p>
        </div>
      )}
      {!pinLoading && (
        <div className="mb-6">
          <ParentPinDisplay pin={parentPin} schoolName={schoolName} />
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
        <KPICard
          icon={Users}
          title={t('totalStudents')}
          value={totalStudents.toLocaleString()}
          trend={{ value: '5.2%', isPositive: true }}
          color="blue"
        />
        <KPICard
          icon={GraduationCap}
          title={t('activeTeachers')}
          value={activeTeachers}
          trend={{ value: '2.1%', isPositive: true }}
          color="green"
        />
        <KPICard
          icon={TrendingUp}
          title={t('attendanceRate')}
          value={`${attendanceRate}%`}
          trend={{ value: '1.3%', isPositive: true }}
          color="purple"
        />
        <KPICard
          icon={Calendar}
          title={t('upcomingEvents')}
          value={upcomingEvents}
          color="orange"
        />
        <KPICard
          icon={DollarSign}
          title={t('feeCollection')}
          value={`$${(totalCollection / 1000).toFixed(0)}K`}
          trend={{ value: '3.2%', isPositive: false }}
          color="yellow"
        />
        <KPICard
          icon={Star}
          title={t('averageRating')}
          value={avgRating}
          trend={{ value: '6.5%', isPositive: true }}
          color="green"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Student Enrollment Trend */}
        <EnrollmentTrendChart schoolId={schoolId} />

        {/* Recent Announcements */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('recentAnnouncements')}</h3>
            <a href={`/school/${encodeURIComponent(schoolId)}/admin/announcements`} className="text-sm text-blue-600 hover:underline">{t('viewAll')}</a>
          </div>
          <div className="space-y-4">
            {data.announcements.slice(0, 3).map((announcement: any) => (
              <div key={announcement.id} className="pb-4 border-b border-gray-100 last:border-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{announcement['Announcement Title'] || announcement.title || 'Untitled'}</h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcement.Content || announcement.content || ''}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full ml-2">
                    {announcement.Priority || announcement.priority || 'Normal'}
                  </span>
                </div>
              </div>
            ))}
            {data.announcements.length === 0 && (
              <p className="text-gray-500 text-center py-8">{t('noAnnouncementsYet')}</p>
            )}
          </div>
        </Card>
      </div>

      {/* Attendance Trend */}
      <div className="mb-8">
        <AttendanceTrendChart schoolId={schoolId} />
      </div>

      {/* Secondary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Unread Messages */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('unreadMessages')}</h3>
            <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full">{data.unreadMessages.length}</span>
          </div>
          <div className="space-y-3">
            {data.unreadMessages.slice(0, 3).map((message: any) => (
              <div key={message.id} className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100">
                <p className="text-sm font-medium">{message['From User'] || 'Unknown'}</p>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">{message['Message Subject'] || message['Message Content'] || 'No subject'}</p>
                <p className="text-xs text-gray-400 mt-1">{message['Sent Date'] || 'Recently'}</p>
              </div>
            ))}
            {data.unreadMessages.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">{t('noUnreadMessages')}</p>
            )}
          </div>
        </Card>

        {/* Upcoming Homework */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">{t('upcomingHomework')}</h3>
          </div>
          <div className="space-y-3">
            {data.upcomingHomework.slice(0, 3).map((hw: any) => (
              <div key={hw.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium">{hw['Assignment Title'] || hw.title || 'Assignment'}</p>
                  <p className="text-xs text-gray-600">{hw['Class Name'] || hw.class_id || 'Class'}</p>
                </div>
                <span className="text-xs text-gray-500">{(hw['Due Date'] || hw.due_date) ? new Date(hw['Due Date'] || hw.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }) : 'TBD'}</span>
              </div>
            ))}
            {data.upcomingHomework.length === 0 && (
              <p className="text-gray-500 text-center py-4 text-sm">{t('noUpcomingHomework')}</p>
            )}
          </div>
        </Card>

        {/* AI Insights */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold mb-4">{t('aiInsights')} - {t('attendancePrediction')}</h3>
          <p className="text-sm text-gray-700 mb-4">
            {lang === 'vi' 
              ? 'Dựa trên điều kiện thời tiết và xu hướng gần đây, chúng tôi dự đoán tỷ lệ điểm danh 96.2% cho tuần tới.'
              : 'Based on weather patterns and recent trends, we predict 96.2% attendance for next week.'}
          </p>
          <div className="text-2xl font-bold text-blue-600 mb-2">96.2% ↑</div>
          <p className="text-xs text-gray-600">{lang === 'vi' ? 'Dự đoán điểm danh' : 'Predicted Attendance'}</p>
        </Card>
      </div>
    </div>
  );
}








