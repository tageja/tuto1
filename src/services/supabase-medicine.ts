/**
 * Supabase Medicine Management Service
 * Handles all medicine reminder and administration log data operations for mobile app
 */

import { supabase } from '../config/supabase';
import { resolveSchoolId } from './school-id';
import type {
  MedicineReminder,
  MedicineLog,
  MedicineKPIs,
  MedicineFilters,
  CreateReminderData,
  LogAdministrationData,
  ParentChild,
} from '../types/school/medicine';

// ============================================================================
// Medicine KPIs
// ============================================================================

export async function fetchMedicineKPIs(schoolIdentifier: string): Promise<MedicineKPIs> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Get today's date in local timezone
  const now = new Date();
  const localDate = new Date(now.getTime() - (now.getTimezoneOffset() * 60000));
  const today = localDate.toISOString().split('T')[0];
  
  // Create start and end of day in local timezone
  const todayStart = new Date(today + 'T00:00:00').toISOString();
  const todayEnd = new Date(today + 'T23:59:59').toISOString();

  // Total Reminders
  const { count: totalReminders } = await supabase
    .from('medicine_reminders')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Active Reminders
  const { count: active } = await supabase
    .from('medicine_reminders')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'active');

  // Due Today: active reminders where start_date <= today and (end_date is null or end_date >= today)
  const { count: dueToday } = await supabase
    .from('medicine_reminders')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .eq('status', 'active')
    .lte('start_date', today)
    .or(`end_date.is.null,end_date.gte.${today}`);

  // Completed Today: count of logs with status='completed' today in local timezone
  const { data: todayLogs } = await supabase
    .from('medicine_administration_logs')
    .select('administered_at')
    .eq('school_id', schoolId)
    .eq('status', 'completed')
    .gte('administered_at', todayStart)
    .lte('administered_at', todayEnd);
  
  // Filter by local date to handle timezone differences
  const completedToday = (todayLogs || []).filter(log => {
    const logDate = new Date(log.administered_at);
    const logLocalDate = new Date(logDate.getTime() - (logDate.getTimezoneOffset() * 60000))
      .toISOString()
      .split('T')[0];
    return logLocalDate === today;
  }).length;

  return {
    totalReminders: totalReminders || 0,
    active: active || 0,
    dueToday: dueToday || 0,
    completedToday: completedToday || 0,
  };
}

// ============================================================================
// Medicine Reminders (Admin)
// ============================================================================

export async function fetchMedicineReminders(
  schoolIdentifier: string,
  filters?: MedicineFilters
): Promise<MedicineReminder[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  let query = supabase
    .from('medicine_reminders')
    .select(`
      id,
      school_id,
      student_id,
      medicine_name,
      dosage,
      frequency,
      time_of_day,
      start_date,
      end_date,
      status,
      notes,
      created_by,
      created_at,
      updated_at,
      school_students!inner(id, first_name, last_name, class_id)
    `)
    .eq('school_id', schoolId);

  if (filters?.studentId) {
    query = query.eq('student_id', filters.studentId);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  if (filters?.due) {
    const today = new Date().toISOString().split('T')[0];
    query = query
      .eq('status', 'active')
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`);
  }

  // Filter by class via student's class_id
  // Note: We need to filter students first, then filter reminders by those student IDs
  if (filters?.classId) {
    // Get student IDs for the class
    const { data: classStudents } = await supabase
      .from('school_students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('class_id', filters.classId);
    
    if (classStudents && classStudents.length > 0) {
      const studentIds = classStudents.map(s => s.id);
      query = query.in('student_id', studentIds);
    } else {
      // No students in this class, return empty result
      return [];
    }
  }

  // Search by student name or medicine name
  if (filters?.search) {
    query = query.or(
      `school_students.first_name.ilike.%${filters.search}%,school_students.last_name.ilike.%${filters.search}%,medicine_name.ilike.%${filters.search}%`
    );
  }

  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as MedicineReminder[];
}

// ============================================================================
// Medicine Reminders (Parent)
// ============================================================================

export async function fetchParentMedicineReminders(
  studentId: string
): Promise<MedicineReminder[]> {
  const { data, error } = await supabase
    .from('medicine_reminders')
    .select(`
      id,
      school_id,
      student_id,
      medicine_name,
      dosage,
      frequency,
      time_of_day,
      start_date,
      end_date,
      status,
      notes,
      created_by,
      created_at,
      updated_at,
      school_students!inner(id, first_name, last_name, class_id)
    `)
    .eq('student_id', studentId)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as MedicineReminder[];
}

// ============================================================================
// Medicine Logs
// ============================================================================

export async function fetchMedicineLogs(
  studentId?: string,
  reminderId?: string
): Promise<MedicineLog[]> {
  let query = supabase
    .from('medicine_administration_logs')
    .select(`
      id,
      school_id,
      student_id,
      reminder_id,
      administered_at,
      administered_by,
      status,
      note,
      created_at,
      updated_at,
      medicine_reminders(medicine_name, dosage),
      school_students!inner(id, first_name, last_name)
    `);

  if (studentId) {
    query = query.eq('student_id', studentId);
  }

  if (reminderId) {
    query = query.eq('reminder_id', reminderId);
  }

  query = query.order('administered_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as MedicineLog[];
}

// ============================================================================
// Create Medicine Reminder
// ============================================================================

export async function createMedicineReminder(
  data: CreateReminderData
): Promise<MedicineReminder> {
  // Resolve school_id if it's not a UUID
  const schoolId = await resolveSchoolId(data.school_id);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  const { data: reminder, error } = await supabase
    .from('medicine_reminders')
    .insert({
      school_id: schoolId,
      student_id: data.student_id,
      medicine_name: data.medicine_name,
      dosage: data.dosage || null,
      frequency: data.frequency,
      time_of_day: data.time_of_day || null,
      start_date: data.start_date,
      end_date: data.end_date || null,
      notes: data.notes || null,
      status: 'active',
      created_by: data.created_by || null,
    })
    .select(`
      id,
      school_id,
      student_id,
      medicine_name,
      dosage,
      frequency,
      time_of_day,
      start_date,
      end_date,
      status,
      notes,
      created_by,
      created_at,
      updated_at
    `)
    .single();

  if (error) {
    throw error;
  }

  return reminder as MedicineReminder;
}

// ============================================================================
// Log Medicine Administration
// ============================================================================

export async function logMedicineAdministration(
  data: LogAdministrationData
): Promise<MedicineLog> {
  // Resolve school_id if it's not a UUID
  const schoolId = await resolveSchoolId(data.school_id);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  const { data: log, error } = await supabase
    .from('medicine_administration_logs')
    .insert({
      school_id: schoolId,
      student_id: data.student_id,
      reminder_id: data.reminder_id || null,
      administered_at: data.administered_at || new Date().toISOString(),
      administered_by: data.administered_by || null,
      status: data.status,
      note: data.note || null,
    })
    .select(`
      id,
      school_id,
      student_id,
      reminder_id,
      administered_at,
      administered_by,
      status,
      note,
      created_at,
      updated_at,
      medicine_reminders(medicine_name, dosage),
      school_students!inner(id, first_name, last_name)
    `)
    .single();

  if (error) {
    throw error;
  }

  return log as MedicineLog;
}

// ============================================================================
// Parent Children (reuse from health service)
// ============================================================================

export async function fetchParentChildren(schoolIdentifier: string): Promise<ParentChild[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Get current user
  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    throw new Error('User not authenticated');
  }

  // Get user ID from users table
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', authUser.id)
    .single();

  if (!userData) {
    throw new Error('User not found');
  }

  // Get children via school_parent_students
  console.log('📚 fetchParentChildren: Looking up children for:', {
    parentUserId: userData.id,
    schoolId,
  });
  
  const { data: parentStudents, error } = await supabase
    .from('school_parent_students')
    .select(`
      student_id,
      school_students!inner(id, first_name, last_name, class_id, school_id)
    `)
    .eq('parent_user_id', userData.id)
    .eq('school_id', schoolId);

  console.log('📚 fetchParentChildren: Query result:', {
    count: parentStudents?.length || 0,
    error: error?.message,
    students: parentStudents?.map((ps: any) => ({
      id: ps.school_students?.id,
      name: `${ps.school_students?.first_name} ${ps.school_students?.last_name}`,
    })),
  });

  if (error) {
    throw error;
  }

  if (!parentStudents || parentStudents.length === 0) {
    return [];
  }

  // Get class names
  const classIds = [...new Set(
    parentStudents
      .map((ps: any) => ps.school_students?.class_id)
      .filter(Boolean)
  )];

  const { data: classes } = await supabase
    .from('school_classes')
    .select('id, name')
    .in('id', classIds);

  const classMap = new Map(classes?.map(c => [c.id, c.name]) || []);

  return parentStudents.map((ps: any) => {
    const student = ps.school_students;
    return {
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      fullName: `${student.first_name} ${student.last_name}`,
      classId: student.class_id,
      className: student.class_id ? classMap.get(student.class_id) || 'N/A' : 'N/A',
    };
  });
}

