'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { CalendarCheck } from 'lucide-react';
import { AttendanceKpis } from '../../../../../components/attendance/AttendanceKpis';
import { Card } from '../../../../../components/ui/Card';
import { StatusBadge } from '../../../../../components/school/shared/StatusBadge';
import {
  fetchAttendanceKpis,
  getDateRange,
  schoolHasWeekendClasses,
  fetchAttendanceRange,
  formatDate,
  type DateRange,
  type AttendanceKPIs,
  type AttendanceRecord,
} from '../../../../../lib/attendance';
import supabase from '../../../../../lib/supabase';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  class?: {
    name: string;
  };
}

export default function ParentAttendancePage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const decodedSchoolId = decodeURIComponent(params.schoolId as string);

  // State
  const childIdParam = searchParams.get('childId') || undefined;
  const dateParam = searchParams.get('date');
  const rangeParam = (searchParams.get('range') as DateRange) || 'week';

  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | undefined>(childIdParam);
  const [selectedDate, setSelectedDate] = useState(() =>
    dateParam ? new Date(dateParam) : new Date()
  );
  const [range, setRange] = useState<DateRange>(rangeParam);

  const [kpis, setKpis] = useState<AttendanceKPIs>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    rate: 0,
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [hasWeekendClasses, setHasWeekendClasses] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate date range
  const { from, to } = getDateRange(selectedDate, range);

  // Fetch children on mount
  useEffect(() => {
    fetchChildren();
  }, [decodedSchoolId]);

  // Update URL when filters change
  useEffect(() => {
    if (!selectedChildId && children.length > 0) {
      setSelectedChildId(children[0].id);
      return;
    }

    const params = new URLSearchParams();
    if (selectedChildId) params.set('childId', selectedChildId);
    params.set('date', selectedDate.toISOString().split('T')[0]);
    params.set('range', range);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedChildId, selectedDate, range, children, router]);

  // Fetch data when child or range changes
  useEffect(() => {
    if (selectedChildId) {
      fetchAttendanceData();
    }
  }, [decodedSchoolId, selectedChildId, selectedDate, range]);

  async function fetchChildren() {
    try {
      // Get current user
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) return;

      // Get user's database ID
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, role')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data:', userError);
        return;
      }

      // Fetch children via parent-student mapping
      const { data: mappings, error: mappingsError } = await supabase
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
        .eq('school_id', decodedSchoolId)
        .eq('parent_user_id', userData.id);

      if (mappingsError) {
        console.error('Error fetching mappings:', mappingsError);
        return;
      }

      if (mappings && mappings.length > 0) {
        const childrenData = mappings.map((m: any) => ({
          id: m.school_students.id,
          first_name: m.school_students.first_name,
          last_name: m.school_students.last_name,
          class: m.school_students.school_classes?.[0] || undefined,
        }));
        setChildren(childrenData);
        if (!selectedChildId && childrenData.length > 0) {
          setSelectedChildId(childrenData[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching children:', error);
    }
  }

  async function fetchAttendanceData() {
    if (!selectedChildId) return;

    setLoading(true);
    try {
      // Fetch KPIs
      const kpisData = await fetchAttendanceKpis(
        decodedSchoolId,
        from,
        to,
        undefined,
        selectedChildId,
        supabase
      );
      setKpis(kpisData);

      // Fetch attendance records
      const records = await fetchAttendanceRange(
        decodedSchoolId,
        from,
        to,
        undefined,
        selectedChildId,
        supabase
      );
      setAttendanceRecords(records);

      // Check weekend classes
      const weekend = await schoolHasWeekendClasses(decodedSchoolId, from, to, supabase);
      setHasWeekendClasses(weekend);
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  }

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const ranges = [
    { value: 'week' as const, label: 'Week' },
    { value: '1m' as const, label: '1 Month' },
    { value: '3m' as const, label: '3 Months' },
    { value: '6m' as const, label: '6 Months' },
    { value: 'course' as const, label: 'Full Course' },
  ];

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          {selectedChild && (
            <p className="text-sm text-gray-500 mt-1">
              {selectedChild.first_name} {selectedChild.last_name}
              {selectedChild.class && ` • ${selectedChild.class.name}`}
            </p>
          )}
        </div>
      </div>

      {/* Child Selector (if multiple children) */}
      {children.length > 1 && (
        <Card className="p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Child</label>
          <select
            value={selectedChildId || ''}
            onChange={(e) => setSelectedChildId(e.target.value)}
            className="w-full h-11 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
                {child.class && ` - ${child.class.name}`}
              </option>
            ))}
          </select>
        </Card>
      )}

      {/* Range Selector */}
      <Card className="p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Time Range</label>
        <div className="flex gap-2">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              className={`flex-1 h-11 px-4 rounded-lg font-medium transition-colors ${
                range === r.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </Card>

      {/* KPIs */}
      <AttendanceKpis
        present={kpis.present}
        absent={kpis.absent}
        late={kpis.late}
        excused={kpis.excused}
        total={kpis.total}
        rate={kpis.rate}
        loading={loading}
        lastUpdated={new Date()}
        showTotal={false}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Calendar */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">
            {selectedDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
              <div key={day} className="font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-sm">
            {generateCalendarDays(selectedDate, attendanceRecords).map((day, index) => (
              <button
                key={index}
                onClick={() => day.date && setSelectedDate(day.date)}
                disabled={!day.date}
                className={`p-2 rounded-lg relative ${
                  day.isToday
                    ? 'bg-blue-600 text-white'
                    : day.status === 'present'
                    ? 'bg-green-100'
                    : day.status === 'late'
                    ? 'bg-yellow-100'
                    : day.status === 'absent'
                    ? 'bg-red-100'
                    : day.status === 'excused'
                    ? 'bg-blue-100'
                    : day.date
                    ? 'hover:bg-gray-100'
                    : ''
                }`}
              >
                {day.dayNum || ''}
              </button>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-600">Absent</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600">Excused</span>
            </div>
          </div>
        </Card>

        {/* Attendance History */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Attendance History</h3>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {attendanceRecords.length > 0 ? (
                attendanceRecords
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {new Date(record.date).toLocaleDateString('en-US', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        {record.late_minutes > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            Late by {record.late_minutes} minutes
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm text-gray-500 mt-1 italic">{record.notes}</p>
                        )}
                      </div>
                      <StatusBadge status={record.status} />
                    </div>
                  ))
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No attendance records found for this period
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Performance Summary */}
      {selectedChild && (
        <Card className="p-6 mt-6 bg-gradient-to-br from-blue-50 to-purple-50">
          <h3 className="font-semibold mb-3">Attendance Summary</h3>
          <p className="text-sm text-gray-700">
            {selectedChild.first_name} has {kpis.rate >= 90 ? 'excellent' : 'good'} attendance
            this period with a {kpis.rate}% attendance rate.
            {kpis.absent === 0
              ? ' Perfect attendance! '
              : ` ${kpis.absent} absence${kpis.absent > 1 ? 's' : ''} this period. `}
            Keep up the great work!
          </p>
        </Card>
      )}
    </div>
  );
}

// Helper to generate calendar days
function generateCalendarDays(
  date: Date,
  records: AttendanceRecord[]
): Array<{
  dayNum: number | null;
  date: Date | null;
  status: string | null;
  isToday: boolean;
}> {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const today = new Date();

  const days: Array<{
    dayNum: number | null;
    date: Date | null;
    status: string | null;
    isToday: boolean;
  }> = [];

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push({ dayNum: null, date: null, status: null, isToday: false });
  }

  // Add days of the month
  for (let day = 1; day <= lastDay.getDate(); day++) {
    const currentDate = new Date(year, month, day);
    const dateStr = currentDate.toISOString().split('T')[0];
    const record = records.find((r) => r.date === dateStr);
    const isToday =
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear();

    days.push({
      dayNum: day,
      date: currentDate,
      status: record?.status || null,
      isToday,
    });
  }

  return days;
}
