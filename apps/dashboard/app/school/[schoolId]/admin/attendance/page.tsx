'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Download } from 'lucide-react';
import { useI18n } from '../../../../../contexts/I18nContext';
import { AttendanceFilters } from '../../../../../components/attendance/AttendanceFilters';
import { AttendanceKpis } from '../../../../../components/attendance/AttendanceKpis';
import { AttendanceWeekGrid } from '../../../../../components/attendance/AttendanceWeekGrid';
import { AttendanceRangeTimeline } from '../../../../../components/attendance/AttendanceRangeTimeline';
import { Button } from '../../../../../components/ui/Button';
import {
  fetchAttendanceKpis,
  getDateRange,
  schoolHasWeekendClasses,
  exportAttendanceToCSV,
  fetchAttendanceRange,
  type DateRange,
  type AttendanceKPIs,
} from '../../../../../lib/attendance';
import supabase from '../../../../../lib/supabase';

export default function AdminAttendancePage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const decodedSchoolId = decodeURIComponent(params.schoolId as string);

  // State
  const dateParam = searchParams.get('date');
  const rangeParam = (searchParams.get('range') as DateRange) || 'week';
  const classIdParam = searchParams.get('classId') || undefined;
  const studentIdParam = searchParams.get('studentId') || undefined;

  const [selectedDate, setSelectedDate] = useState(() =>
    dateParam ? new Date(dateParam) : new Date()
  );
  const [range, setRange] = useState<DateRange>(rangeParam);
  const [classId, setClassId] = useState<string | undefined>(classIdParam);
  const [studentId, setStudentId] = useState<string | undefined>(studentIdParam);
  const [searchQuery, setSearchQuery] = useState('');

  const [kpis, setKpis] = useState<AttendanceKPIs>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    rate: 0,
  });
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [students, setStudents] = useState<
    Array<{ id: string; first_name: string; last_name: string }>
  >([]);
  const [hasWeekendClasses, setHasWeekendClasses] = useState(false);
  const [loading, setLoading] = useState(true);

  // Calculate date range
  const { from, to } = getDateRange(selectedDate, range);

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('date', selectedDate.toISOString().split('T')[0]);
    params.set('range', range);
    if (classId) params.set('classId', classId);
    if (studentId) params.set('studentId', studentId);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [selectedDate, range, classId, studentId, router]);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [decodedSchoolId, selectedDate, range, classId, studentId]);

  async function fetchData() {
    setLoading(true);
    try {
      // Fetch KPIs
      const kpisData = await fetchAttendanceKpis(
        decodedSchoolId,
        from,
        to,
        classId,
        studentId,
        supabase
      );
      setKpis(kpisData);

      // Fetch classes
      const { data: classesData, error: classesError } = await supabase
        .from('school_classes')
        .select('id, name')
        .eq('school_id', decodedSchoolId)
        .ilike('status', 'active')
        .order('name');
      
      if (classesError) {
        console.error('Error fetching classes:', classesError);
      }
      setClasses(classesData || []);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('school_students')
        .select('id, first_name, last_name')
        .eq('school_id', decodedSchoolId)
        .ilike('status', 'active')
        .order('first_name');
      
      if (studentsError) {
        console.error('Error fetching students:', studentsError);
      }
      setStudents(studentsData || []);

      // Check weekend classes
      const weekend = await schoolHasWeekendClasses(decodedSchoolId, from, to, supabase);
      setHasWeekendClasses(weekend);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleExport() {
    try {
      const records = await fetchAttendanceRange(decodedSchoolId, from, to, classId, studentId, supabase);
      const filename = `attendance-${decodedSchoolId}-${from.toISOString().split('T')[0]}-to-${
        to.toISOString().split('T')[0]
      }`;
      exportAttendanceToCSV(records, filename);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export attendance data');
    }
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('dashboard.attendance.title') || 'Attendance'}</h1>
          <p className="text-sm text-gray-500 mt-1">{decodedSchoolId}</p>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleExport}>
          <Download className="w-4 h-4" />
          {t('dashboard.attendance.export') || 'Export'}
        </Button>
      </div>

      {/* Filters */}
      <AttendanceFilters
        date={selectedDate}
        range={range}
        classId={classId}
        studentId={studentId}
        searchQuery={searchQuery}
        onDateChange={setSelectedDate}
        onRangeChange={setRange}
        onClassChange={setClassId}
        onStudentChange={setStudentId}
        onSearchChange={setSearchQuery}
        classes={classes}
        students={students}
      />

      {/* KPIs */}
      <div className="mt-6">
        <AttendanceKpis
          present={kpis.present}
          absent={kpis.absent}
          late={kpis.late}
          excused={kpis.excused}
          total={kpis.total}
          rate={kpis.rate}
          loading={loading}
          lastUpdated={new Date()}
          showTotal={true}
        />
      </div>

      {/* Main Content */}
      <div className="mt-6">
        {range === 'week' ? (
          <AttendanceWeekGrid
            schoolId={decodedSchoolId}
            weekStart={from}
            weekEnd={to}
            classId={classId}
            studentId={studentId}
            includeWeekends={hasWeekendClasses}
            readOnly={false}
          />
        ) : (
          <AttendanceRangeTimeline
            schoolId={decodedSchoolId}
            from={from}
            to={to}
            classId={classId}
            studentId={studentId}
            readOnly={false}
          />
        )}
      </div>
    </div>
  );
}
