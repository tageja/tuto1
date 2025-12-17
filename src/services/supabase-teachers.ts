/**
 * Supabase Teachers Service
 * Handles all teacher-related data operations for mobile app
 */

import { supabase } from '../config/supabase';
import { resolveSchoolId } from './school-id';


// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface SchoolTeacher {
  id: string;
  school_id: string;
  user_id?: string;
  name: string;
  email?: string;
  phone?: string;
  subjects?: string[];
  qualifications?: string;
  hire_date?: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeacherKPIs {
  total: number;
  active: number;
  onLeave: number;
  avgRating: number;
}

export interface TeacherFilters {
  search?: string;
  status?: string;
  subject?: string;
  page?: number;
  limit?: number;
}

export interface TeacherListResponse {
  teachers: SchoolTeacher[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// List Teachers
// ============================================================================

export async function getTeachers(
  schoolId: string,
  filters: TeacherFilters = {}
): Promise<TeacherListResponse> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const {
      search = '',
      status = 'all',
      subject = 'all',
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    let query = supabase
      .from('school_teachers')
      .select('*', { count: 'exact' })
      .eq('school_id', resolvedSchoolId);

    // Apply filters
    if (status && status !== 'all') {
      const statusLower = status.toLowerCase();
      if (statusLower === 'active') {
        query = query.in('status', ['active', 'Active']);
      } else {
        query = query.ilike('status', status);
      }
    }

    if (search && search.trim()) {
      // Search in name, email
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (subject && subject !== 'all') {
      // Search in subjects array
      query = query.contains('subjects', [subject]);
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Sort
    query = query.order('name', { ascending: true });

    // Execute
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }

    const total = count || 0;
    const hasMore = total > page * limit;

    return {
      teachers: data || [],
      total,
      hasMore,
    };
  } catch (error) {
    console.error('getTeachers error:', error);
    throw error;
  }
}

// ============================================================================
// Get Teacher by ID
// ============================================================================

export async function getTeacherById(teacherId: string): Promise<SchoolTeacher | null> {
  try {
    const { data, error } = await supabase
      .from('school_teachers')
      .select('*')
      .eq('id', teacherId)
      .single();

    if (error) {
      console.error('Error fetching teacher:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('getTeacherById error:', error);
    throw error;
  }
}

// ============================================================================
// Get Teacher KPIs
// ============================================================================

export async function getTeacherKPIs(schoolId: string): Promise<TeacherKPIs> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    // Fetch all teachers for the school
    const { data, error } = await supabase
      .from('school_teachers')
      .select('id, status')
      .eq('school_id', resolvedSchoolId);

    if (error) {
      console.error('Error fetching teacher KPIs:', error);
      throw error;
    }

    const teachers = data || [];
    const total = teachers.length;
    const active = teachers.filter((t) =>
      t.status?.toLowerCase() === 'active'
    ).length;
    const onLeave = teachers.filter((t) =>
      t.status?.toLowerCase() === 'on leave' || t.status?.toLowerCase() === 'onleave'
    ).length;

    // Note: Rating is not available in school_teachers table
    // This would need to be calculated from a reviews/feedback table
    const avgRating = 0;

    return {
      total,
      active,
      onLeave,
      avgRating,
    };
  } catch (error) {
    console.error('getTeacherKPIs error:', error);
    throw error;
  }
}

// ============================================================================
// Get Teacher's Classes
// ============================================================================

export async function getTeacherClasses(teacherId: string) {
  try {
    const { data, error } = await supabase
      .from('school_classes')
      .select('*')
      .eq('teacher_id', teacherId)
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teacher classes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('getTeacherClasses error:', error);
    throw error;
  }
}

// ============================================================================
// Get Unique Subjects (for filters)
// ============================================================================

export async function getTeacherSubjects(schoolId: string): Promise<string[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const { data, error } = await supabase
      .from('school_teachers')
      .select('subjects')
      .eq('school_id', resolvedSchoolId);

    if (error) {
      console.error('Error fetching teacher subjects:', error);
      throw error;
    }

    // Extract unique subjects from all teachers
    const subjectsSet = new Set<string>();
    data?.forEach((teacher) => {
      if (Array.isArray(teacher.subjects)) {
        teacher.subjects.forEach((subject) => {
          if (subject && subject.trim()) {
            subjectsSet.add(subject.trim());
          }
        });
      } else if (typeof teacher.subjects === 'string') {
        teacher.subjects.split(',').forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) subjectsSet.add(trimmed);
        });
      }
    });

    return Array.from(subjectsSet).sort();
  } catch (error) {
    console.error('getTeacherSubjects error:', error);
    throw error;
  }
}

// ============================================================================
// Helper: Get Active Teachers Only (for parent view)
// ============================================================================

export async function getActiveTeachers(
  schoolId: string,
  search?: string
): Promise<SchoolTeacher[]> {
  return getTeachers(schoolId, {
    status: 'Active',
    search,
    limit: 100,
  }).then((res) => res.teachers);
}

/**
 * Parent view: fetch active teachers for the parent's children classes if possible.
 * Fallback: active teachers for the school.
 */
export async function getParentTeachers(
  schoolId: string,
  parentEmail?: string,
  search?: string
): Promise<SchoolTeacher[]> {
  const resolvedSchoolId = await resolveSchoolId(schoolId);
  if (!resolvedSchoolId) return [];

  // If no parent email, fallback to active teachers
  if (!parentEmail) {
    return getActiveTeachers(resolvedSchoolId, search);
  }

  // Find classes where parent has children
  const { data: studentRows, error: studentError } = await supabase
    .from('school_students')
    .select('class_id')
    .eq('school_id', resolvedSchoolId)
    .ilike('parent_email', parentEmail)
    .not('class_id', 'is', null);

  if (studentError) {
    console.warn('Parent teachers: students lookup failed, falling back to active teachers', studentError);
    return getActiveTeachers(resolvedSchoolId, search);
  }

  const classIds = Array.from(new Set((studentRows || []).map((s) => s.class_id).filter(Boolean)));
  if (!classIds.length) {
    return getActiveTeachers(resolvedSchoolId, search);
  }

  // Fetch teachers for those classes
  const { data: classRows, error: classError } = await supabase
    .from('school_classes')
    .select('teacher_id')
    .in('id', classIds as string[])
    .not('teacher_id', 'is', null);

  if (classError) {
    console.warn('Parent teachers: class lookup failed, falling back to active teachers', classError);
    return getActiveTeachers(resolvedSchoolId, search);
  }

  const teacherIds = Array.from(new Set((classRows || []).map((c) => c.teacher_id).filter(Boolean)));
  if (!teacherIds.length) {
    return getActiveTeachers(resolvedSchoolId, search);
  }

  let query = supabase
    .from('school_teachers')
    .select('*')
    .eq('school_id', resolvedSchoolId)
    .in('id', teacherIds);

  if (search && search.trim()) {
    query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error } = await query;
  if (error) {
    console.warn('Parent teachers: teacher lookup failed, falling back to active teachers', error);
    return getActiveTeachers(resolvedSchoolId, search);
  }

  return data || [];
}

export default {
  getTeachers,
  getTeacherById,
  getTeacherKPIs,
  getTeacherClasses,
  getTeacherSubjects,
  getActiveTeachers,
};

