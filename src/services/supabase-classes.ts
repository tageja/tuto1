/**
 * Supabase Classes Service
 * Handles all class-related data operations for mobile app
 */

import { supabase } from '../config/supabase';
import { resolveSchoolId } from './school-id';


// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface SchoolClass {
  id: string;
  school_id: string;
  name: string;
  grade_level?: string;
  academic_year?: string;
  teacher_id?: string;
  room_number?: string;
  capacity?: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Computed/joined fields
  teacher_name?: string;
  student_count?: number;
}

export interface ClassKPIs {
  totalClasses: number;
  activeClasses: number;
  totalStudents: number;
  capacityUsage: number;
  avgAttendance: number;
}

export interface ClassFilters {
  search?: string;
  grade?: string;
  page?: number;
  limit?: number;
}

export interface ClassListResponse {
  classes: SchoolClass[];
  total: number;
  hasMore: boolean;
}

// ============================================================================
// List Classes
// ============================================================================

export async function getClasses(
  schoolId: string,
  filters: ClassFilters = {}
): Promise<ClassListResponse> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const {
      search = '',
      grade = 'all',
      page = 1,
      limit = 20,
    } = filters;

    // Build query
    let query = supabase
      .from('school_classes')
      .select('*', { count: 'exact' })
      .eq('school_id', resolvedSchoolId);

    // Apply filters
    if (grade && grade !== 'all') {
      query = query.eq('grade_level', grade);
    }

    if (search && search.trim()) {
      // Search in name, room_number, grade_level
      query = query.or(
        `name.ilike.%${search}%,room_number.ilike.%${search}%,grade_level.ilike.%${search}%`
      );
    }

    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Sort
    query = query
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    // Execute
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching classes:', error);
      throw error;
    }

    // Enrich with teacher names and student counts
    const enrichedClasses = await Promise.all(
      (data || []).map(async (cls) => {
        // Get teacher name
        let teacher_name: string | undefined;
        if (cls.teacher_id) {
          const { data: teacher } = await supabase
            .from('school_teachers')
            .select('name')
            .eq('id', cls.teacher_id)
            .single();
          teacher_name = teacher?.name;
        }

        // Get student count
        const { count: studentCount } = await supabase
          .from('school_students')
          .select('id', { count: 'exact', head: true })
          .eq('class_id', cls.id);

        return {
          ...cls,
          teacher_name,
          student_count: studentCount || 0,
        };
      })
    );

    const total = count || 0;
    const hasMore = total > page * limit;

    return {
      classes: enrichedClasses,
      total,
      hasMore,
    };
  } catch (error) {
    console.error('getClasses error:', error);
    throw error;
  }
}

// ============================================================================
// Get Class by ID
// ============================================================================

export async function getClassById(classId: string): Promise<SchoolClass | null> {
  try {
    const { data, error } = await supabase
      .from('school_classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) {
      console.error('Error fetching class:', error);
      throw error;
    }

    if (!data) return null;

    // Enrich with teacher name
    let teacher_name: string | undefined;
    if (data.teacher_id) {
      const { data: teacher } = await supabase
        .from('school_teachers')
        .select('name')
        .eq('id', data.teacher_id)
        .single();
      teacher_name = teacher?.name;
    }

    // Get student count
    const { count: studentCount } = await supabase
      .from('school_students')
      .select('id', { count: 'exact', head: true })
      .eq('class_id', classId);

    return {
      ...data,
      teacher_name,
      student_count: studentCount || 0,
    };
  } catch (error) {
    console.error('getClassById error:', error);
    throw error;
  }
}

// ============================================================================
// Get Class KPIs
// ============================================================================

export async function getClassKPIs(schoolId: string): Promise<ClassKPIs> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    // Fetch all classes for the school
    const { data: classes, error: classesError } = await supabase
      .from('school_classes')
      .select('id, status, capacity')
      .eq('school_id', resolvedSchoolId);

    if (classesError) {
      console.error('Error fetching class KPIs:', classesError);
      throw classesError;
    }

    const classesData = classes || [];
    const totalClasses = classesData.length;
    const activeClasses = classesData.filter((c) =>
      c.status?.toLowerCase() === 'active'
    ).length;

    // Get total students across all classes
    const { count: totalStudents } = await supabase
      .from('school_students')
      .select('id', { count: 'exact', head: true })
      .eq('school_id', resolvedSchoolId);

    // Calculate capacity usage
    const totalCapacity = classesData.reduce(
      (sum, c) => sum + (c.capacity || 0),
      0
    );
    const capacityUsage =
      totalCapacity > 0 ? Math.round(((totalStudents || 0) / totalCapacity) * 100) : 0;

    // Note: avgAttendance would need to be calculated from attendance records
    const avgAttendance = 0;

    return {
      totalClasses,
      activeClasses,
      totalStudents: totalStudents || 0,
      capacityUsage,
      avgAttendance,
    };
  } catch (error) {
    console.error('getClassKPIs error:', error);
    throw error;
  }
}

// ============================================================================
// Get Class Students
// ============================================================================

export async function getClassStudents(classId: string) {
  try {
    const { data, error } = await supabase
      .from('school_students')
      .select('*')
      .eq('class_id', classId)
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Error fetching class students:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('getClassStudents error:', error);
    throw error;
  }
}

// ============================================================================
// Get Unique Grades (for filters)
// ============================================================================

export async function getClassGrades(schoolId: string): Promise<string[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const { data, error } = await supabase
      .from('school_classes')
      .select('grade_level')
      .eq('school_id', resolvedSchoolId)
      .not('grade_level', 'is', null);

    if (error) {
      console.error('Error fetching class grades:', error);
      throw error;
    }

    // Extract unique grades
    const gradesSet = new Set<string>();
    data?.forEach((cls) => {
      if (cls.grade_level && cls.grade_level.trim()) {
        gradesSet.add(cls.grade_level.trim());
      }
    });

    return Array.from(gradesSet).sort();
  } catch (error) {
    console.error('getClassGrades error:', error);
    throw error;
  }
}

export default {
  getClasses,
  getClassById,
  getClassKPIs,
  getClassStudents,
  getClassGrades,
};

