/**
 * Homework Service
 * Handles all homework-related data operations for mobile app
 */

import { supabase } from '../../config/supabase';
import { getCurrentUser } from '../../config/supabase';
import { resolveSchoolId } from '../school-id';
import type {
  HomeworkAssignment,
  HomeworkSubmission,
  HomeworkStats,
  HomeworkFilters,
  HomeworkStatusTab,
  TimeRange,
  Child,
  ClassOption,
  SubjectOption,
  StudentOption,
} from '../../types/school/homework';

// ============================================================================
// Date Range Calculations
// ============================================================================

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
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startDate = new Date(today);
      startDate.setDate(today.getDate() + mondayOffset);
      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
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
    default:
      startDate = today;
      endDate = today;
  }

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  return [startDate, endDate];
}

// ============================================================================
// Parent Children
// ============================================================================

/**
 * Fetch children for current parent user
 */
export async function fetchParentChildren(schoolIdentifier: string): Promise<Child[]> {
  try {
    const schoolId = await resolveSchoolId(schoolIdentifier);
    if (!schoolId) {
      console.warn('School not found for identifier:', schoolIdentifier);
      return [];
    }

    const user = await getCurrentUser();
    if (!user) throw new Error('User not authenticated');

    const { data: userProfile, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userProfile) {
      throw new Error('User profile not found');
    }

    // Get parent-student relationships with student details joined
    const { data: mappings, error: mappingsError } = await supabase
      .from('school_parent_students')
      .select(
        `
        student_id,
        school_students!inner (
          id,
          first_name,
          last_name,
          class_id,
          school_classes (name)
        )
      `
      )
      .eq('school_id', schoolId)
      .eq('parent_user_id', userProfile.id);

    if (mappingsError) {
      console.error('Error fetching parent-student mappings:', mappingsError);
      return [];
    }

    return (mappings || []).map((m: any) => ({
      id: m.school_students.id,
      firstName: m.school_students.first_name || '',
      lastName: m.school_students.last_name || '',
      className: m.school_students.school_classes?.[0]?.name || null,
      classId: m.school_students.class_id,
    }));
  } catch (error) {
    console.error('Error in fetchParentChildren:', error);
    return [];
  }
}

// ============================================================================
// Admin Data Fetching
// ============================================================================

/**
 * Fetch homework statistics for admin view
 */
export async function fetchHomeworkStats(
  schoolIdentifier: string,
  filters?: HomeworkFilters
): Promise<HomeworkStats> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  if (!schoolId) {
    throw new Error('School not found');
  }

  const [startDate, endDate] = filters?.range && filters?.baseDate
    ? calculateDateRange(filters.range, filters.baseDate)
    : [null, null];

  // Build query for assignments in date range
  let assignmentQuery = supabase
    .from('school_homework_assignments')
    .select('id')
    .eq('school_id', schoolId)
    .eq('is_active', true);

  if (startDate && endDate) {
    assignmentQuery = assignmentQuery
      .gte('due_date', startDate.toISOString().split('T')[0])
      .lte('due_date', endDate.toISOString().split('T')[0]);
  }

  if (filters?.classId) {
    assignmentQuery = assignmentQuery.eq('class_id', filters.classId);
  }

  if (filters?.subject) {
    assignmentQuery = assignmentQuery.eq('subject', filters.subject);
  }

  const { data: assignments, error: assignError } = await assignmentQuery;

  if (assignError) throw assignError;
  const assignmentIds = (assignments || []).map((a) => a.id);

  if (assignmentIds.length === 0) {
    return { total: 0, pending: 0, completed: 0, completionRate: 0 };
  }

  // Get submissions for these assignments
  let submissionQuery = supabase
    .from('school_homework_submissions')
    .select('status, assignment_id')
    .in('assignment_id', assignmentIds);

  if (filters?.studentId) {
    submissionQuery = submissionQuery.eq('student_id', filters.studentId);
  }

  const { data: submissions, error: subError } = await submissionQuery;
  if (subError) throw subError;

  const total = submissions?.length || 0;
  const pending = submissions?.filter((s) => s.status === 'pending').length || 0;
  const completed = submissions?.filter((s) => s.status === 'graded' || s.status === 'submitted').length || 0;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return { total, pending, completed, completionRate };
}

/**
 * Fetch homework assignments for admin view
 */
export async function fetchHomeworkAssignments(
  schoolIdentifier: string,
  filters?: HomeworkFilters
): Promise<HomeworkAssignment[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  if (!schoolId) {
    throw new Error('School not found');
  }

  const [startDate, endDate] = filters?.range && filters?.baseDate
    ? calculateDateRange(filters.range, filters.baseDate)
    : [null, null];

  // Build query
  let query = supabase
    .from('school_homework_assignments')
    .select(
      `
      *,
      school_classes(name)
    `
    )
    .eq('school_id', schoolId)
    .eq('is_active', true);

  if (startDate && endDate) {
    query = query
      .gte('due_date', startDate.toISOString().split('T')[0])
      .lte('due_date', endDate.toISOString().split('T')[0]);
  }

  if (filters?.classId) {
    query = query.eq('class_id', filters.classId);
  }

  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
  }

  // Apply status filter via submissions
  const { data: assignments, error } = await query.order('due_date', { ascending: true });

  if (error) throw error;
  if (!assignments || assignments.length === 0) return [];

  const assignmentIds = assignments.map((a) => a.id);

  // Get submissions for completion stats
  let submissionQuery = supabase
    .from('school_homework_submissions')
    .select('assignment_id, status, student_id')
    .in('assignment_id', assignmentIds);

  if (filters?.studentId) {
    submissionQuery = submissionQuery.eq('student_id', filters.studentId);
  }

  const { data: submissions, error: subError } = await submissionQuery;
  if (subError) throw subError;

  // Group submissions by assignment
  const submissionsByAssignment = new Map<string, typeof submissions>();
  (submissions || []).forEach((sub) => {
    const existing = submissionsByAssignment.get(sub.assignment_id) || [];
    existing.push(sub);
    submissionsByAssignment.set(sub.assignment_id, existing);
  });

  // Map assignments with stats
  const filteredAssignments = assignments
    .map((a) => {
      const assignmentSubs = submissionsByAssignment.get(a.id) || [];
      const totalSubs = assignmentSubs.length;
      const completedSubs = assignmentSubs.filter(
        (s) => s.status === 'graded' || s.status === 'submitted'
      ).length;

      // Apply status filter
      if (filters?.status && filters.status !== 'all') {
        if (filters.status === 'pending' && completedSubs >= totalSubs) {
          return null;
        }
        if (filters.status === 'completed' && completedSubs < totalSubs) {
          return null;
        }
      }

      return {
        ...a,
        class_name: (a.school_classes as any)?.name,
        total_submissions: totalSubs,
        completed_submissions: completedSubs,
        completion_rate: totalSubs > 0 ? Math.round((completedSubs / totalSubs) * 100) : 0,
      } as HomeworkAssignment;
    })
    .filter((a): a is HomeworkAssignment => a !== null);

  return filteredAssignments;
}

// ============================================================================
// Parent Data Fetching
// ============================================================================

/**
 * Fetch homework data for parent view (child-specific)
 */
export async function fetchParentHomeworkData(
  schoolIdentifier: string,
  studentId: string,
  filters?: HomeworkFilters
): Promise<{
  assignments: HomeworkAssignment[];
  stats: HomeworkStats;
}> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  if (!schoolId) {
    throw new Error('School not found');
  }

  const [startDate, endDate] = filters?.range && filters?.baseDate
    ? calculateDateRange(filters.range, filters.baseDate)
    : [null, null];

  // Get student's class_id first
  const { data: studentData } = await supabase
    .from('school_students')
    .select('class_id')
    .eq('id', studentId)
    .eq('school_id', schoolId)
    .single();

  const studentClassId = studentData?.class_id;

  // Get assignments targeted to this student or their class
  let targetsQuery = supabase
    .from('school_homework_targets')
    .select('assignment_id, class_id, student_id')
    .eq('school_id', schoolId);

  if (studentClassId) {
    targetsQuery = targetsQuery.or(`student_id.eq.${studentId},class_id.eq.${studentClassId}`);
  } else {
    targetsQuery = targetsQuery.eq('student_id', studentId);
  }

  const { data: targets, error: targetsError } = await targetsQuery;

  if (targetsError) throw targetsError;
  if (!targets || targets.length === 0) {
    return { assignments: [], stats: { total: 0, pending: 0, completed: 0, completionRate: 0 } };
  }

  const assignmentIds = [...new Set(targets.map((t) => t.assignment_id))];

  // Get assignments
  let query = supabase
    .from('school_homework_assignments')
    .select(
      `
      *,
      school_classes(name)
    `
    )
    .in('id', assignmentIds)
    .eq('school_id', schoolId)
    .eq('is_active', true);

  if (startDate && endDate) {
    query = query
      .gte('due_date', startDate.toISOString().split('T')[0])
      .lte('due_date', endDate.toISOString().split('T')[0]);
  }

  if (filters?.search) {
    query = query.or(`title.ilike.%${filters.search}%,subject.ilike.%${filters.search}%`);
  }

  const { data: assignments, error: assignError } = await query.order('due_date', { ascending: true });
  if (assignError) throw assignError;
  if (!assignments || assignments.length === 0) {
    return { assignments: [], stats: { total: 0, pending: 0, completed: 0, completionRate: 0 } };
  }

  // Get submissions for this student
  const { data: submissions, error: subError } = await supabase
    .from('school_homework_submissions')
    .select('*')
    .in('assignment_id', assignmentIds)
    .eq('student_id', studentId);

  if (subError) throw subError;

  const submissionsMap = new Map<string, HomeworkSubmission>();
  (submissions || []).forEach((sub) => {
    submissionsMap.set(sub.assignment_id, sub as HomeworkSubmission);
  });

  // Map assignments with submissions
  let mappedAssignments = assignments.map((a) => ({
    ...a,
    class_name: (a.school_classes as any)?.name,
    submission: submissionsMap.get(a.id),
  })) as HomeworkAssignment[];

  // Apply status filter
  if (filters?.status && filters.status !== 'all') {
    mappedAssignments = mappedAssignments.filter((a) => {
      const sub = a.submission;
      if (!sub) return filters.status === 'pending';
      if (filters.status === 'pending') {
        return sub.status === 'pending';
      }
      if (filters.status === 'completed') {
        return sub.status === 'graded' || sub.status === 'submitted';
      }
      return true;
    });
  }

  // Calculate stats
  const total = mappedAssignments.length;
  const pending = mappedAssignments.filter((a) => !a.submission || a.submission.status === 'pending').length;
  const completed = mappedAssignments.filter((a) => a.submission && (a.submission.status === 'graded' || a.submission.status === 'submitted')).length;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    assignments: mappedAssignments,
    stats: { total, pending, completed, completionRate },
  };
}

// ============================================================================
// Create Assignment
// ============================================================================

/**
 * Create a new homework assignment
 */
export async function createHomeworkAssignment(data: {
  schoolId: string;
  classId?: string;
  subject: string;
  title: string;
  description?: string;
  dueDate: string;
  totalTasks: number;
  targetClassIds?: string[]; // For school-wide or specific classes
}): Promise<HomeworkAssignment> {
  const schoolId = await resolveSchoolId(data.schoolId);
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Insert assignment
  const { data: assignment, error: assignError } = await supabase
    .from('school_homework_assignments')
    .insert({
      school_id: schoolId,
      class_id: data.classId || null,
      subject: data.subject,
      title: data.title,
      description: data.description || null,
      due_date: data.dueDate,
      total_tasks: data.totalTasks || 1,
      is_active: true,
    })
    .select()
    .single();

  if (assignError) throw assignError;
  if (!assignment) throw new Error('Failed to create assignment');

  // Get students to target
  let studentIds: string[] = [];

  if (data.targetClassIds && data.targetClassIds.length > 0) {
    // Get students from selected classes
    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('id')
      .eq('school_id', schoolId)
      .in('class_id', data.targetClassIds);

    if (studentsError) throw studentsError;
    studentIds = (students || []).map((s) => s.id);
  } else if (data.classId) {
    // Get students from single class
    const { data: students, error: studentsError } = await supabase
      .from('school_students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('class_id', data.classId);

    if (studentsError) throw studentsError;
    studentIds = (students || []).map((s) => s.id);
  }

  // Create targets
  if (studentIds.length > 0) {
    const targets = studentIds.map((studentId) => ({
      assignment_id: assignment.id,
      school_id: schoolId,
      student_id: studentId,
      class_id: data.classId || null,
    }));

    const { error: targetsError } = await supabase
      .from('school_homework_targets')
      .insert(targets);

    if (targetsError) throw targetsError;

    // Create initial submissions
    const submissions = studentIds.map((studentId) => ({
      assignment_id: assignment.id,
      student_id: studentId,
      school_id: schoolId,
      status: 'pending',
      submitted_at: null,
      score: null,
      is_locked: false,
    }));

    const { error: subsError } = await supabase
      .from('school_homework_submissions')
      .insert(submissions);

    if (subsError) throw subsError;
  }

  return assignment as HomeworkAssignment;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Fetch classes for school
 */
export async function fetchClassesForSchool(schoolIdentifier: string): Promise<ClassOption[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  if (!schoolId) {
    throw new Error('School not found');
  }

  const { data, error } = await supabase
    .from('school_classes')
    .select('id, name')
    .eq('school_id', schoolId)
    .in('status', ['active', 'Active'])
    .order('name', { ascending: true });

  if (error) throw error;
  return (data || []).map((c) => ({ id: c.id, name: c.name }));
}

/**
 * Fetch subjects (from subjects table or distinct from assignments)
 */
export async function fetchSubjectsForSchool(schoolIdentifier: string): Promise<SubjectOption[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  if (!schoolId) {
    throw new Error('School not found');
  }

  // Get distinct subjects from assignments
  const { data, error } = await supabase
    .from('school_homework_assignments')
    .select('subject')
    .eq('school_id', schoolId)
    .eq('is_active', true);

  if (error) throw error;

  const uniqueSubjects = [...new Set((data || []).map((a) => a.subject))].sort();
  return uniqueSubjects.map((name) => ({ name, label: name }));
}

/**
 * Fetch students for school (with optional class filter)
 */
export async function fetchStudentsForSchool(
  schoolIdentifier: string,
  classId?: string
): Promise<StudentOption[]> {
  const schoolId = await resolveSchoolId(schoolIdentifier);
  if (!schoolId) {
    throw new Error('School not found');
  }

  let query = supabase
    .from('school_students')
    .select(
      `
      id,
      first_name,
      last_name,
      class_id,
      school_classes(name)
    `
    )
    .eq('school_id', schoolId)
    .in('status', ['active', 'Active']);

  if (classId) {
    query = query.eq('class_id', classId);
  }

  const { data, error } = await query.order('first_name', { ascending: true });

  if (error) throw error;
  return (data || []).map((s) => ({
    id: s.id,
    firstName: s.first_name,
    lastName: s.last_name,
    className: (s.school_classes as any)?.name,
  }));
}

/**
 * Check if assignment is overdue
 */
export function isAssignmentOverdue(dueDate: string, status: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  return due < today && status === 'pending';
}
