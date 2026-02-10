import { supabase } from '../config/supabase';

// Helper to resolve school identifier (name or UUID) to UUID
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    // If it looks like a UUID (8-4-4-4-12 format), use it directly
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      return schoolIdentifier;
    }

    // Check if it's an Airtable ID (starts with "rec")
    if (schoolIdentifier.startsWith('rec')) {
      console.log('⚠️ Airtable ID detected, fetching all schools to find match');
      
      // For now, use "Tuto Demo School" as fallback for Airtable IDs
      // This should be fixed in SchoolContext to store proper Supabase UUIDs
      const { data, error } = await supabase
        .from('schools')
        .select('id, name')
        .eq('name', 'Tuto Demo School')
        .single();

      if (error || !data) {
        console.error('Tuto Demo School not found in Supabase');
        return null;
      }

      console.log('✅ Resolved Airtable ID to:', data.name, data.id);
      return data.id;
    }

    // Otherwise, treat it as a school name and look it up
    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error || !data) {
      console.error('School not found for identifier:', schoolIdentifier);
      return null;
    }

    return data.id;
  } catch (error) {
    console.error('Error resolving school ID:', error);
    return null;
  }
}

export interface DashboardKPIs {
  totalStudents: number;
  activeTeachers: number;
  attendanceRate: number;
  upcomingEvents: number;
  feeCollection: number;
  averageRating: string;
}

export interface WeeklyAttendanceData {
  day: string;
  percentage: number;
}

export interface Announcement {
  id: string;
  title: string;
  body: string;
  content: string;
  priority: string;
  published_at: string;
  category?: string;
}

export interface Homework {
  id: string;
  title: string;
  subject: string;
  class_id?: string;
  due_date: string;
  status: string;
}

export async function fetchDashboardKPIs(schoolId: string): Promise<DashboardKPIs> {
  try {
    console.log('📊 Fetching KPIs for school:', schoolId);
    
    // Resolve school ID (handle both name and UUID)
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) {
      throw new Error(`Could not resolve school ID: ${schoolId}`);
    }
    
    console.log('✅ Resolved school ID:', resolvedId);
    
    // Fetch students
    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('id, status')
      .eq('school_id', resolvedId);

    if (studentsError) {
      console.error('❌ Students error:', studentsError);
      throw studentsError;
    }
    
    console.log('✅ Students fetched:', students?.length || 0);

    // Fetch teachers
    const { data: teachers, error: teachersError } = await supabase
      .from('school_teachers')
      .select('id, status')
      .eq('school_id', resolvedId);

    if (teachersError) throw teachersError;

    // Fetch today's attendance
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance, error: attendanceError } = await supabase
      .from('school_attendance')
      .select('id, status')
      .eq('school_id', resolvedId)
      .eq('date', today);

    if (attendanceError) throw attendanceError;

    // Fetch upcoming events
    const { data: events, error: eventsError } = await supabase
      .from('school_events')
      .select('id, status')
      .eq('school_id', resolvedId)
      .in('status', ['scheduled', 'in progress']);

    if (eventsError) throw eventsError;

    // Fetch payments (for fee collection) - table is payment_items
    const { data: payments, error: paymentsError } = await supabase
      .from('payment_items')
      .select('amount_cents')
      .eq('school_id', resolvedId)
      .neq('status', 'void');

    // If payment items don't exist yet, just use 0
    const totalCollection = payments?.reduce((sum, p) => sum + (p.amount_cents || 0), 0) || 0;

    // Calculate KPIs
    const totalStudents = students?.length || 0;
    const activeTeachers = teachers?.filter(t => t.status?.toLowerCase() === 'active').length || 0;
    
    const presentToday = todayAttendance?.filter(a => a.status?.toLowerCase() === 'present').length || 0;
    const attendanceRate = todayAttendance && todayAttendance.length > 0 
      ? Math.round((presentToday / todayAttendance.length) * 100) 
      : 0;

    const upcomingEvents = events?.length || 0;
    const feeCollection = totalCollection;

    return {
      totalStudents,
      activeTeachers,
      attendanceRate,
      upcomingEvents,
      feeCollection,
      averageRating: 'N/A', // Rating not available in school_teachers table
    };
  } catch (error) {
    console.error('Error fetching dashboard KPIs:', error);
    throw error;
  }
}

export async function fetchWeeklyAttendance(schoolId: string, language: string): Promise<WeeklyAttendanceData[]> {
  try {
    // Resolve school ID
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) {
      throw new Error(`Could not resolve school ID: ${schoolId}`);
    }

    // Get current week's dates (Mon-Fri)
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    
    // Calculate Monday of current week
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Generate dates for Mon-Fri
    const weekDates = [];
    for (let i = 0; i < 5; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      weekDates.push(date.toISOString().split('T')[0]);
    }

    // Fetch attendance for the week
    const { data: attendance, error } = await supabase
      .from('school_attendance')
      .select('date, status')
      .eq('school_id', resolvedId)
      .in('date', weekDates);

    if (error) throw error;

    // Calculate percentage for each day
    const dayNames = language === 'vi' 
      ? ['T2', 'T3', 'T4', 'T5', 'T6']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

    const weeklyData = weekDates.map((date, index) => {
      const dayAttendance = attendance?.filter(a => a.date === date) || [];
      const present = dayAttendance.filter(a => a.status?.toLowerCase() === 'present').length;
      const percentage = dayAttendance.length > 0 
        ? Math.round((present / dayAttendance.length) * 100) 
        : 0;

      return {
        day: dayNames[index],
        percentage,
      };
    });

    return weeklyData;
  } catch (error) {
    console.error('Error fetching weekly attendance:', error);
    // Return empty data on error
    const dayNames = language === 'vi' 
      ? ['T2', 'T3', 'T4', 'T5', 'T6']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return dayNames.map(day => ({ day, percentage: 0 }));
  }
}

export async function fetchAnnouncements(schoolId: string, limit: number = 3): Promise<Announcement[]> {
  try {
    // Resolve school ID
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) {
      throw new Error(`Could not resolve school ID: ${schoolId}`);
    }

    const { data, error } = await supabase
      .from('school_announcements')
      .select('*')
      .eq('school_id', resolvedId)
      .eq('status', 'Published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(a => ({
      id: a.id,
      title: a.title,
      body: a.body || '',
      content: a.body || '',
      priority: a.priority || 'Normal',
      published_at: a.published_at || a.created_at,
      category: a.category,
    }));
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function fetchUpcomingHomework(schoolId: string, limit: number = 3): Promise<Homework[]> {
  try {
    // Resolve school ID
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) {
      throw new Error(`Could not resolve school ID: ${schoolId}`);
    }

    const today = new Date().toISOString().split('T')[0];
    
    const { data, error} = await supabase
      .from('school_homework_assignments')
      .select('*')
      .eq('school_id', resolvedId)
      .gte('due_date', today)
      .eq('is_active', true)
      .order('due_date', { ascending: true })
      .limit(limit);

    if (error) throw error;

    return (data || []).map(hw => ({
      id: hw.id,
      title: hw.title,
      subject: hw.subject || 'General',
      class_id: hw.class_id,
      due_date: hw.due_date,
      status: 'Pending',
    }));
  } catch (error) {
    console.error('Error fetching homework:', error);
    return [];
  }
}

export interface ParentChildInfo {
  id: string;
  first_name: string;
  last_name: string;
  class_name: string;
}

/** Fetch current user's children for a school (parent view). Uses school_parent_students then fallback to school_students.parent_email. */
export async function fetchParentChildren(schoolId: string): Promise<ParentChildInfo[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) return [];

    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) return [];

    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    let list: ParentChildInfo[] = [];

    if (userData) {
      const { data: mappings } = await supabase
        .from('school_parent_students')
        .select(
          `student_id, school_students!inner(id, first_name, last_name, school_classes(name))`
        )
        .eq('school_id', resolvedId)
        .eq('parent_user_id', userData.id);

      if (mappings?.length) {
        list = mappings.map((m: any) => ({
          id: m.school_students.id,
          first_name: m.school_students.first_name || '',
          last_name: m.school_students.last_name || '',
          class_name: m.school_students.school_classes?.name || '—',
        }));
      }
    }

    if (list.length === 0) {
      const { data: byEmail } = await supabase
        .from('school_students')
        .select('id, first_name, last_name, school_classes(name)')
        .eq('school_id', resolvedId)
        .ilike('parent_email', user.email)
        .in('status', ['active', 'Active']);

      if (byEmail?.length) {
        list = byEmail.map((s: any) => ({
          id: s.id,
          first_name: s.first_name || '',
          last_name: s.last_name || '',
          class_name: s.school_classes?.name || '—',
        }));
      }
    }

    return list;
  } catch (error) {
    console.error('Error fetching parent children:', error);
    return [];
  }
}

export interface ParentDashboardKPIs {
  attendanceRate: number;
  homeworkCompletion: number;
  averageGrade: number;
  upcomingEvents: number;
}

/** Fetch parent-specific KPIs from DB (attendance, homework completion, avg grade, upcoming events). Returns 0 for each when no data. */
export async function fetchParentDashboardKPIs(schoolId: string): Promise<ParentDashboardKPIs> {
  const empty: ParentDashboardKPIs = {
    attendanceRate: 0,
    homeworkCompletion: 0,
    averageGrade: 0,
    upcomingEvents: 0,
  };

  try {
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) return empty;

    const children = await fetchParentChildren(schoolId);
    const today = new Date().toISOString().split('T')[0];

    if (children.length === 0) {
      const { data: events } = await supabase
        .from('school_events')
        .select('id')
        .eq('school_id', resolvedId)
        .gte('starts_at', today)
        .in('status', ['scheduled', 'in progress']);
      return { ...empty, upcomingEvents: events?.length ?? 0 };
    }

    const studentIds = children.map((c) => c.id);

    // 1) Attendance rate (last 30 days): present / total * 100
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const fromDate = thirtyDaysAgo.toISOString().split('T')[0];
    const { data: attendanceRows } = await supabase
      .from('school_attendance')
      .select('id, status')
      .eq('school_id', resolvedId)
      .in('student_id', studentIds)
      .gte('date', fromDate);

    const totalAttendance = attendanceRows?.length ?? 0;
    const presentCount = attendanceRows?.filter((a) => (a.status || '').toLowerCase() === 'present').length ?? 0;
    const attendanceRate = totalAttendance > 0 ? Math.round((presentCount / totalAttendance) * 100) : 0;

    // 2) Homework completion: submitted|graded submissions / assignments targeting these students (due and active)
    const { data: targets } = await supabase
      .from('school_homework_targets')
      .select('assignment_id')
      .in('student_id', studentIds);

    const assignmentIdsFromTargets = [...new Set((targets ?? []).map((t) => t.assignment_id))];
    const totalAssignments =
      assignmentIdsFromTargets.length === 0
        ? 0
        : (
            await supabase
              .from('school_homework_assignments')
              .select('id')
              .in('id', assignmentIdsFromTargets)
              .eq('school_id', resolvedId)
              .eq('is_active', true)
              .lte('due_date', today)
          ).data?.length ?? 0;

    const { data: submissions } = await supabase
      .from('school_homework_submissions')
      .select('assignment_id, status')
      .in('student_id', studentIds);

    const completedSubmissions =
      submissions?.filter((s) =>
        ['submitted', 'graded'].includes((s.status || '').toLowerCase())
      ).length ?? 0;

    const homeworkCompletion =
      totalAssignments > 0
        ? Math.round((completedSubmissions / totalAssignments) * 100)
        : 0;

    // 3) Average grade from school_assessment_scores (score 0–100 or similar)
    const { data: scores } = await supabase
      .from('school_assessment_scores')
      .select('score')
      .in('student_id', studentIds);

    const numericScores = (scores ?? []).map((s) => Number(s.score)).filter((n) => !Number.isNaN(n));
    const averageGrade =
      numericScores.length > 0
        ? Math.round((numericScores.reduce((a, b) => a + b, 0) / numericScores.length) * 10) / 10
        : 0;

    // 4) Upcoming events (school-level, from today)
    const { data: events } = await supabase
      .from('school_events')
      .select('id')
      .eq('school_id', resolvedId)
      .gte('starts_at', today)
      .in('status', ['scheduled', 'in progress']);

    return {
      attendanceRate,
      homeworkCompletion,
      averageGrade,
      upcomingEvents: events?.length ?? 0,
    };
  } catch (error) {
    console.error('Error fetching parent dashboard KPIs:', error);
    return empty;
  }
}

export async function fetchSchoolDetails(schoolId: string) {
  try {
    // Resolve school ID
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) {
      throw new Error(`Could not resolve school ID: ${schoolId}`);
    }

    const { data, error } = await supabase
      .from('schools')
      .select('id, name, address, phone, email, logo_url, status, school_code, parent_pin, created_at, updated_at')
      .eq('id', resolvedId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching school details:', error);
    return null;
  }
}

