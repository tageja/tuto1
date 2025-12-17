import { supabase, getCurrentUser } from '../../config/supabase';
import type {
  HomeworkKPIs,
  HomeworkListItem,
  ScoreDataPoint,
  DateRange,
  Child,
  ClassOption,
  StudentOption,
} from '../../types/school/homework';

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
 * Calculate date range based on filter
 */
export function getDateRangeForHomework(
  date: Date,
  range: DateRange
): { from: Date; to: Date } {
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  
  switch (range) {
    case 'week': {
      // Get Monday of current week
      const day = from.getDay();
      const diff = from.getDate() - day + (day === 0 ? -6 : 1);
      from.setDate(diff);
      
      // Get Sunday of current week
      const toDate = new Date(from);
      toDate.setDate(from.getDate() + 6);
      toDate.setHours(23, 59, 59, 999);
      
      return { from, to: toDate };
    }
    case '1m': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    case '3m': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 3, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    case '6m': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 6, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    case 'course': {
      const start = new Date(date.getFullYear(), date.getMonth(), 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      end.setHours(23, 59, 59, 999);
      return { from: start, to: end };
    }
    default:
      return { from, to };
  }
}

/**
 * Format date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Check if assignment is overdue
 */
export function isOverdue(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  return due < today;
}

/**
 * Fetch homework KPIs
 */
export async function fetchHomeworkKpis(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string | null,
  subject?: string | null,
  studentId?: string | null,
  status: string = 'all'
): Promise<HomeworkKPIs> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    const { data, error } = await supabase.rpc('hw_kpis', {
      p_school: resolvedSchoolId,
      p_from: formatDate(from),
      p_to: formatDate(to),
      p_class: classId || null,
      p_subject: subject || null,
      p_student: studentId || null,
      p_status: status,
    });

    if (error) {
      console.error('Error fetching homework KPIs:', error);
      return { total: 0, pending: 0, completed: 0, completion_rate: 0 };
    }

    // RPC returns array with single row
    const result = data?.[0] || { total: 0, pending: 0, completed: 0, completion_rate: 0 };
    
    return {
      total: result.total || 0,
      pending: result.pending || 0,
      completed: result.completed || 0,
      completion_rate: result.completion_rate || 0,
    };
  } catch (error) {
    console.error('Error in fetchHomeworkKpis:', error);
    return { total: 0, pending: 0, completed: 0, completion_rate: 0 };
  }
}

/**
 * Fetch homework list
 */
export async function fetchHomeworkList(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string | null,
  subject?: string | null,
  studentId?: string | null,
  status: string = 'all'
): Promise<HomeworkListItem[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    const { data, error } = await supabase.rpc('hw_list', {
      p_school: resolvedSchoolId,
      p_from: formatDate(from),
      p_to: formatDate(to),
      p_class: classId || null,
      p_subject: subject || null,
      p_student: studentId || null,
      p_status: status,
    });

    if (error) {
      console.error('Error fetching homework list:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      assignment_id: item.assignment_id,
      subject: item.subject,
      title: item.title,
      class_name: item.class_name,
      due_date: item.due_date,
      status: item.status,
      submitted: item.submitted || 0,
      total: item.total || 0,
      progress_percent: item.progress_percent || 0,
      child_status: item.child_status || null,
      child_score: item.child_score || null,
    }));
  } catch (error) {
    console.error('Error in fetchHomeworkList:', error);
    return [];
  }
}

/**
 * Fetch scores series for charts
 */
export async function fetchScoresSeries(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string | null,
  subject?: string | null,
  studentId?: string | null
): Promise<ScoreDataPoint[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    const { data, error } = await supabase.rpc('hw_scores_series', {
      p_school: resolvedSchoolId,
      p_from: formatDate(from),
      p_to: formatDate(to),
      p_class: classId || null,
      p_subject: subject || null,
      p_student: studentId || null,
    });

    if (error) {
      console.error('Error fetching scores series:', error);
      return [];
    }

    return (data || []).map((item: any) => ({
      d: item.d,
      avg_score: item.avg_score || 0,
    }));
  } catch (error) {
    console.error('Error in fetchScoresSeries:', error);
    return [];
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
    console.log('📚 fetchClassesForSchool called with:', schoolId);
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    console.log('📚 Resolved school ID:', resolvedSchoolId);
    
    if (!resolvedSchoolId) {
      console.error('❌ Invalid school ID, cannot fetch classes');
      throw new Error('Invalid school ID');
    }

    console.log('📚 Querying school_classes for school_id:', resolvedSchoolId);
    const { data, error } = await supabase
      .from('school_classes')
      .select('id, name')
      .eq('school_id', resolvedSchoolId)
      .ilike('status', 'active')
      .order('name', { ascending: true });

    if (error) {
      console.error('❌ Error fetching classes from Supabase:', error);
      return [];
    }

    console.log('✅ Classes fetched successfully:', data?.length || 0, 'classes');
    if (data && data.length > 0) {
      console.log('📚 First class:', data[0]);
    }

    return (data || []).map((c: any) => ({
      id: c.id,
      name: c.name,
    }));
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
    console.log('👥 fetchStudentsForSchool called with:', { schoolId, classId });
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    console.log('👥 Resolved school ID:', resolvedSchoolId);
    
    if (!resolvedSchoolId) {
      console.error('❌ Invalid school ID, cannot fetch students');
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
      .eq('school_id', resolvedSchoolId)
      .ilike('status', 'active');

    if (classId) {
      console.log('👥 Filtering by class_id:', classId);
      query = query.eq('class_id', classId);
    }

    query = query.order('first_name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      console.error('❌ Error fetching students from Supabase:', error);
      return [];
    }

    console.log('✅ Students fetched successfully:', data?.length || 0, 'students');
    if (data && data.length > 0) {
      console.log('👥 First student:', data[0]);
    }

    return (data || []).map((s: any) => ({
      id: s.id,
      firstName: s.first_name || '',
      lastName: s.last_name || '',
      className: s.school_classes?.name,
    }));
  } catch (error) {
    console.error('❌ Error in fetchStudentsForSchool:', error);
    return [];
  }
}

/**
 * Create homework assignment
 */
export async function createHomeworkAssignment(
  schoolId: string,
  classId: string,
  subject: string,
  title: string,
  description: string | null,
  dueDate: string,
  totalTasks: number = 1
): Promise<{ success: boolean; assignmentId?: string; error?: string }> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error('Invalid school ID');
    }

    // Insert assignment
    const { data: assignment, error: assignmentError } = await supabase
      .from('school_homework_assignments')
      .insert({
        school_id: resolvedSchoolId,
        class_id: classId,
        subject,
        title,
        description,
        due_date: dueDate,
        is_active: true,
      })
      .select('id')
      .single();

    if (assignmentError || !assignment) {
      console.error('Error creating assignment:', assignmentError);
      return { success: false, error: assignmentError?.message || 'Failed to create assignment' };
    }

    // Get all students in the class
    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('id')
      .eq('class_id', classId)
      .eq('status', 'active');

    if (studentsError) {
      console.error('Error fetching students:', studentsError);
      // Continue anyway - assignment is created
    }

    // Create targets for the class
    if (students && students.length > 0) {
      const targets = students.map((student: any) => ({
        assignment_id: assignment.id,
        class_id: classId,
        student_id: student.id,
        school_id: resolvedSchoolId,
      }));

      const { error: targetsError } = await supabase
        .from('school_homework_targets')
        .insert(targets);

      if (targetsError) {
        console.error('Error creating targets:', targetsError);
        // Continue anyway - assignment is created
      }
    } else {
      // Create class-level target if no students found
      const { error: targetError } = await supabase
        .from('school_homework_targets')
        .insert({
          assignment_id: assignment.id,
          class_id: classId,
          school_id: resolvedSchoolId,
        });

      if (targetError) {
        console.error('Error creating class target:', targetError);
      }
    }

    return { success: true, assignmentId: assignment.id };
  } catch (error: any) {
    console.error('Error in createHomeworkAssignment:', error);
    return { success: false, error: error.message || 'Failed to create assignment' };
  }
}

