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

    // Fetch payments (for fee collection)
    const { data: payments, error: paymentsError } = await supabase
      .from('school_payment_items')
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

export async function fetchSchoolDetails(schoolId: string) {
  try {
    // Resolve school ID
    const resolvedId = await resolveSchoolId(schoolId);
    if (!resolvedId) {
      throw new Error(`Could not resolve school ID: ${schoolId}`);
    }

    const { data, error } = await supabase
      .from('schools')
      .select('*')
      .eq('id', resolvedId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching school details:', error);
    return null;
  }
}

