import { supabase, getCurrentUser } from '../../config/supabase';
import type {
  AttendanceRecord,
  AttendanceKPIs,
  StudentAttendanceSummary,
  Child,
  ClassOption,
  StudentOption,
  TimeRange,
  AttendanceStatus,
} from '../../types/school/attendance';

/**
 * Calculate date range based on time range selection
 */
export function calculateDateRange(
  range: TimeRange,
  baseDate: Date = new Date()
): [Date, Date] {
  const today = new Date(baseDate);
  today.setHours(0, 0, 0, 0);

  let startDate: Date;
  let endDate: Date = new Date(today);

  switch (range) {
    case 'week': {
      // Monday-Sunday of the week containing baseDate
      const dayOfWeek = today.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // If Sunday, go back 6 days; otherwise go to Monday
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6); // Sunday
      break;
    }
    case '1m': {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    }
    case '3m': {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 3);
      break;
    }
    case '6m': {
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      break;
    }
    case 'full': {
      // Default to 1 year ago (can be customized based on enrollment date)
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    }
    default:
      startDate = today;
      endDate = today;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
}

/**
 * Get attendance status color
 */
export function getAttendanceStatusColor(status: AttendanceStatus): string {
  switch (status) {
    case 'present':
      return '#4CAF50'; // green
    case 'absent':
      return '#F44336'; // red
    case 'late':
      return '#FF9800'; // yellow/orange
    case 'excused':
      return '#2196F3'; // blue
    default:
      return '#9E9E9E'; // gray
  }
}

/**
 * Resolve school identifier (name or UUID) to UUID
 */
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    console.log('🏫 Resolving school ID:', schoolIdentifier);
    
    // If it's already a valid UUID, return it
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      console.log('✅ School ID is valid UUID:', schoolIdentifier);
      return schoolIdentifier;
    }

    // If it's an Airtable record ID (starts with 'rec'), try to find by name fallback
    if (schoolIdentifier.startsWith('rec')) {
      console.log('⚠️ Detected Airtable record ID, using fallback');
      // Try common demo school names
      const fallbackNames = ['Tuto Demo School', 'Demo School', schoolIdentifier];
      
      for (const name of fallbackNames) {
        const { data, error } = await supabase
          .from('schools')
          .select('id')
          .ilike('name', name)
          .limit(1)
          .single();
        
        if (data && !error) {
          console.log('✅ Found school by fallback name:', name, '→', data.id);
          return data.id;
        }
      }
    }

    // Try to find school by exact name match
    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error) {
      console.warn('⚠️ School not found by exact name:', schoolIdentifier, error.message);
      
      // Try case-insensitive match as fallback
      const { data: dataIlike, error: errorIlike } = await supabase
        .from('schools')
        .select('id')
        .ilike('name', schoolIdentifier)
        .limit(1)
        .single();
      
      if (dataIlike && !errorIlike) {
        console.log('✅ Found school by case-insensitive match:', dataIlike.id);
        return dataIlike.id;
      }
      
      // Last resort: get first school
      const { data: firstSchool } = await supabase
        .from('schools')
        .select('id')
        .limit(1)
        .single();
      
      if (firstSchool) {
        console.warn('⚠️ Using first available school as fallback:', firstSchool.id);
        return firstSchool.id;
      }
      
      return null;
    }

    if (!data) {
      console.error('❌ No school found for identifier:', schoolIdentifier);
      return null;
    }

    console.log('✅ Resolved school ID:', data.id);
    return data.id;
  } catch (error) {
    console.error('❌ Error resolving school ID:', error);
    return null;
  }
}

/**
 * Fetch attendance KPIs using RPC function
 */
export async function fetchAttendanceKPIs(
  schoolId: string,
  fromDate: Date,
  toDate: Date,
  classId?: string | null,
  studentId?: string | null
): Promise<AttendanceKPIs> {
  try {
    console.log('📊 fetchAttendanceKPIs called with:', { schoolId, fromDate, toDate, classId, studentId });
    
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      console.error('❌ Could not resolve school ID for:', schoolId);
      throw new Error('Invalid school ID');
    }

    console.log('📊 Calling att_kpis RPC with:', {
      p_school: resolvedSchoolId,
      p_from: fromDate.toISOString().split('T')[0],
      p_to: toDate.toISOString().split('T')[0],
    });

    const { data, error } = await supabase.rpc('att_kpis', {
      p_school: resolvedSchoolId,
      p_from: fromDate.toISOString().split('T')[0],
      p_to: toDate.toISOString().split('T')[0],
      p_class: classId || null,
      p_student: studentId || null,
    });

    if (error) {
      console.error('❌ Error fetching attendance KPIs:', error);
      throw error;
    }

    console.log('✅ Attendance KPIs data:', data);

    const result = data?.[0] || {};
    return {
      present: Number(result.present) || 0,
      absent: Number(result.absent) || 0,
      late: Number(result.late) || 0,
      excused: Number(result.excused) || 0,
      total: Number(result.total) || 0,
      rate: Number(result.rate) || 0,
    };
  } catch (error) {
    console.error('❌ Error in fetchAttendanceKPIs:', error);
    return {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      rate: 0,
    };
  }
}

/**
 * Fetch attendance records for a date range using RPC function
 */
export async function fetchAttendanceRange(
  schoolId: string,
  fromDate: Date,
  toDate: Date,
  classId?: string | null,
  studentId?: string | null
): Promise<AttendanceRecord[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    const { data, error } = await supabase.rpc('att_range', {
      p_school: resolvedSchoolId,
      p_from: fromDate.toISOString().split('T')[0],
      p_to: toDate.toISOString().split('T')[0],
      p_class: classId || null,
      p_student: studentId || null,
    });

    if (error) {
      console.error('Error fetching attendance range:', error);
      throw error;
    }

    return (data || []).map((record: any) => ({
      id: record.id,
      student_id: record.student_id,
      class_id: record.class_id,
      date: record.date,
      status: record.status.toLowerCase() as AttendanceStatus,
      notes: record.notes,
      late_minutes: record.late_minutes || 0,
    }));
  } catch (error) {
    console.error('Error in fetchAttendanceRange:', error);
    return [];
  }
}

/**
 * Fetch student weekly attendance (Monday-Friday) for status row
 */
export async function fetchStudentWeeklyAttendance(
  studentId: string,
  weekStart: Date,
  weekEnd: Date
): Promise<{ [date: string]: AttendanceStatus | null }> {
  try {
    const { data, error } = await supabase
      .from('school_attendance')
      .select('date, status')
      .eq('student_id', studentId)
      .gte('date', weekStart.toISOString().split('T')[0])
      .lte('date', weekEnd.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching student weekly attendance:', error);
      return {};
    }

    const statusMap: { [date: string]: AttendanceStatus | null } = {};
    
    // Initialize all weekdays to null
    const current = new Date(weekStart);
    while (current <= weekEnd) {
      const dateStr = current.toISOString().split('T')[0];
      statusMap[dateStr] = null;
      current.setDate(current.getDate() + 1);
    }

    // Fill in actual attendance records
    (data || []).forEach((record: any) => {
      const dateStr = record.date;
      statusMap[dateStr] = record.status.toLowerCase() as AttendanceStatus;
    });

    return statusMap;
  } catch (error) {
    console.error('Error in fetchStudentWeeklyAttendance:', error);
    return {};
  }
}

/**
 * Fetch parent's children for a school
 */
export async function fetchParentChildren(schoolId: string): Promise<Child[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new Error('User not authenticated');
    }

    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    // Get user's database ID
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      throw new Error('User profile not found');
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
      .eq('school_id', resolvedSchoolId)
      .eq('parent_user_id', userData.id);

    if (mappingsError) {
      console.error('Error fetching parent-student mappings:', mappingsError);
      return [];
    }

    return (mappings || []).map((m: any) => ({
      id: m.school_students.id,
      firstName: m.school_students.first_name || '',
      lastName: m.school_students.last_name || '',
      className: m.school_students.school_classes?.[0]?.name,
    }));
  } catch (error) {
    console.error('Error in fetchParentChildren:', error);
    return [];
  }
}

/**
 * Fetch classes for a school (for admin filters)
 */
export async function fetchClassesForSchool(schoolId: string): Promise<ClassOption[]> {
  try {
    console.log('📚 fetchClassesForSchool called with schoolId:', schoolId);
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    console.log('📚 Resolved school ID:', resolvedSchoolId);
    
    if (!resolvedSchoolId) {
      console.error('❌ Invalid school ID:', schoolId);
      throw new Error('Invalid school ID');
    }

    const { data, error } = await supabase
      .from('school_classes')
      .select('id, name')
      .eq('school_id', resolvedSchoolId)
      .ilike('status', 'active') // Use ilike for case-insensitive match
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching classes:', error);
      return [];
    }

    console.log('📚 Fetched classes data:', data?.length || 0, data);
    const classes = (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
    }));
    console.log('📚 Mapped classes:', classes);
    return classes;
  } catch (error) {
    console.error('❌ Error in fetchClassesForSchool:', error);
    return [];
  }
}

/**
 * Fetch students for a school (for admin filters)
 */
export async function fetchStudentsForSchool(
  schoolId: string,
  classId?: string | null
): Promise<StudentOption[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    let query = supabase
      .from('school_students')
      .select(`
        id,
        first_name,
        last_name,
        school_classes (name)
      `)
      .eq('school_id', resolvedSchoolId);

    if (classId) {
      query = query.eq('class_id', classId);
    }

    query = query.order('first_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      return [];
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      firstName: s.first_name || '',
      lastName: s.last_name || '',
      className: s.school_classes?.name,
    }));
  } catch (error) {
    console.error('Error in fetchStudentsForSchool:', error);
    return [];
  }
}

/**
 * Calculate attendance rate for a student in a date range
 */
export function calculateStudentAttendanceRate(
  records: AttendanceRecord[]
): number {
  if (records.length === 0) return 0;

  const presentCount = records.filter((r) => r.status === 'present').length;
  return Math.round((presentCount / records.length) * 100);
}

/**
 * Build student attendance summaries for admin view
 */
export async function buildStudentAttendanceSummaries(
  schoolId: string,
  studentIds: string[],
  weekStart: Date,
  weekEnd: Date
): Promise<StudentAttendanceSummary[]> {
  try {
    const summaries: StudentAttendanceSummary[] = [];

    // Fetch student details
    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('id, first_name, last_name')
      .in('id', studentIds);

    if (studentsError || !students) {
      console.error('Error fetching student details:', studentsError);
      return [];
    }

    // For each student, fetch their attendance and calculate summary
    for (const student of students) {
      const weekStatus = await fetchStudentWeeklyAttendance(
        student.id,
        weekStart,
        weekEnd
      );

      // Calculate attendance rate from all records in the week
      const records = await fetchAttendanceRange(
        schoolId,
        weekStart,
        weekEnd,
        null,
        student.id
      );

      const attendanceRate = calculateStudentAttendanceRate(records);

      summaries.push({
        studentId: student.id,
        studentName: `${student.first_name || ''} ${student.last_name || ''}`.trim(),
        attendanceRate,
        weekStatus,
      });
    }

    return summaries;
  } catch (error) {
    console.error('Error in buildStudentAttendanceSummaries:', error);
    return [];
  }
}

