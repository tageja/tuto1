/**
 * Supabase Students Service
 * Handles all student-related data operations for mobile app
 */

import { supabase } from '../config/supabase';
import { resolveSchoolId } from './school-id';

// ============================================================================
// TypeScript Interfaces
// ============================================================================

export interface SchoolStudent {
  id: string;
  schoolId: string;
  code: string; // student_number
  name: string;
  firstName: string;
  lastName: string;
  classId: string | null;
  className: string | null;
  grade: string | null;
  gradeLevel: string | null;
  parent: string | null;
  parentEmail: string | null;
  parentPhone: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  status: 'active' | 'inactive' | string;
  gender: string | null;
  dob: string | null;
  dateOfBirth: string | null;
  enrolledAt: string | null;
  enrollmentDate: string | null;
  photoUrl: string | null;
  address: string | null;
}

export interface StudentKPI {
  total: number;
  active: number;
  inactive: number;
  avgAttendance: number;
  lastUpdated?: string;
}

export interface StudentFilters {
  search?: string;
  classId?: string | string[];
  grade?: string | string[];
  status?: string | string[];
  page?: number;
  limit?: number;
}

export interface StudentListResponse {
  students: SchoolStudent[];
  total: number;
  hasMore: boolean;
  page: number;
  pageSize: number;
}

// ============================================================================
// Helper: Map Supabase row to SchoolStudent
// ============================================================================

function mapStudentRow(row: any): SchoolStudent {
  const className = row.school_classes?.name || row.class_name || null;
  const gradeLevel = row.school_classes?.grade_level || row.grade_level || null;

  return {
    id: row.id,
    schoolId: row.school_id,
    code: row.student_number || row.code || '',
    name: `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unknown',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    classId: row.class_id || null,
    className: className,
    grade: gradeLevel,
    gradeLevel: gradeLevel,
    parent: row.parent_name || null,
    parentEmail: row.parent_email || null,
    parentPhone: row.parent_phone || null,
    contactPhone: row.parent_phone || row.contact_phone || null,
    contactEmail: row.parent_email || row.contact_email || null,
    status: row.status || 'active',
    gender: row.gender || null,
    dob: row.date_of_birth || row.dob || null,
    dateOfBirth: row.date_of_birth || row.dob || null,
    enrolledAt: row.enrolled_at || row.enrollment_date || row.created_at || null,
    enrollmentDate: row.enrollment_date || row.enrolled_at || row.created_at || null,
    photoUrl: row.photo_url || null,
    address: row.address || null,
  };
}

// ============================================================================
// Get Students List
// ============================================================================

export async function getStudents(
  schoolId: string,
  filters: StudentFilters = {}
): Promise<StudentListResponse> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const {
      search = '',
      classId,
      grade,
      status,
      page = 1,
      limit = 10,
    } = filters;

    // Build query
    let query = supabase
      .from('school_students')
      .select('*, school_classes(name, grade_level)', { count: 'exact' })
      .eq('school_id', resolvedSchoolId);

    // Apply filters
    if (classId && classId !== 'all') {
      const classIds = Array.isArray(classId) ? classId : [classId];
      if (classIds.length === 1) {
        query = query.eq('class_id', classIds[0]);
      } else {
        query = query.in('class_id', classIds);
      }
    }

    if (status && status !== 'all') {
      const statuses = Array.isArray(status) ? status : [status];
      const statusLower = statuses.map((s: string) => s.toLowerCase());
      if (statusLower.includes('active')) {
        query = query.in('status', ['active', 'Active']);
      } else {
        query = query.in('status', statuses);
      }
    }

    if (search && search.trim()) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_number.ilike.%${search}%`
      );
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    // Sort
    query = query
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true });

    // Execute
    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    // Filter by grade if needed (after fetch since it's in joined table)
    let filteredStudents = (data || []).map(mapStudentRow);
    let filteredCount = count || 0;

    if (grade && grade !== 'all') {
      const grades = Array.isArray(grade) ? grade : [grade];
      filteredStudents = filteredStudents.filter((s) =>
        s.grade && grades.includes(s.grade)
      );
      // Note: count won't be accurate with grade filter, but we'll use it as approximation
    }

    const total = filteredCount;
    const hasMore = total > page * limit;

    return {
      students: filteredStudents,
      total,
      hasMore,
      page,
      pageSize: limit,
    };
  } catch (error) {
    console.error('getStudents error:', error);
    throw error;
  }
}

// ============================================================================
// Get Student by ID
// ============================================================================

export async function getStudentById(
  studentId: string,
  schoolId: string
): Promise<SchoolStudent | null> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const { data, error } = await supabase
      .from('school_students')
      .select('*, school_classes(name, grade_level)')
      .eq('id', studentId)
      .eq('school_id', resolvedSchoolId)
      .single();

    if (error) {
      console.error('Error fetching student:', error);
      throw error;
    }

    if (!data) return null;

    return mapStudentRow(data);
  } catch (error) {
    console.error('getStudentById error:', error);
    throw error;
  }
}

// ============================================================================
// Get Student KPIs
// ============================================================================

export async function getStudentKPIs(schoolId: string): Promise<StudentKPI> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    // Total students
    const { count: total } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', resolvedSchoolId);

    // Active students
    const { count: active } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', resolvedSchoolId)
      .in('status', ['active', 'Active']);

    const inactive = (total || 0) - (active || 0);

    // Calculate average attendance for last 30 days
    const avgAttendance = await calculateAvgAttendance(resolvedSchoolId);

    return {
      total: total || 0,
      active: active || 0,
      inactive,
      avgAttendance,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('getStudentKPIs error:', error);
    throw error;
  }
}

// ============================================================================
// Calculate Average Attendance
// ============================================================================

async function calculateAvgAttendance(schoolId: string): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Count total attendance records
    const { count: totalCount } = await supabase
      .from('school_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('date', dateStr);

    // Count present records
    const { count: presentCount } = await supabase
      .from('school_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'present')
      .gte('date', dateStr);

    if (!totalCount || totalCount === 0) {
      return 0;
    }

    return Math.round(((presentCount || 0) / totalCount) * 100);
  } catch (error) {
    console.error('Error calculating avg attendance:', error);
    return 0;
  }
}

// ============================================================================
// Get Student Classes (for filter dropdown)
// ============================================================================

export async function getStudentClasses(
  schoolId: string
): Promise<Array<{ id: string; name: string; grade_level?: string | null }>> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const { data, error } = await supabase
      .from('school_classes')
      .select('id, name, grade_level')
      .eq('school_id', resolvedSchoolId)
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching student classes:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('getStudentClasses error:', error);
    throw error;
  }
}

// ============================================================================
// Get Student Grades (for filter dropdown)
// ============================================================================

export async function getStudentGrades(schoolId: string): Promise<string[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    const { data, error } = await supabase
      .from('school_classes')
      .select('grade_level')
      .eq('school_id', resolvedSchoolId)
      .not('grade_level', 'is', null);

    if (error) {
      console.error('Error fetching student grades:', error);
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
    console.error('getStudentGrades error:', error);
    throw error;
  }
}

// ============================================================================
// Export Students CSV
// ============================================================================

export async function exportStudentsCSV(
  schoolId: string,
  filters: StudentFilters = {}
): Promise<string> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('School not found');

    // Fetch all students matching filters (up to 10k limit)
    const {
      search = '',
      classId,
      grade,
      status,
    } = filters;

    let query = supabase
      .from('school_students')
      .select('*, school_classes(name, grade_level)')
      .eq('school_id', resolvedSchoolId)
      .limit(10000); // Safeguard: max 10k rows

    // Apply filters
    if (classId && classId !== 'all') {
      const classIds = Array.isArray(classId) ? classId : [classId];
      query = query.in('class_id', classIds);
    }

    if (status && status !== 'all') {
      const statuses = Array.isArray(status) ? status : [status];
      const statusLower = statuses.map((s: string) => s.toLowerCase());
      if (statusLower.includes('active')) {
        query = query.in('status', ['active', 'Active']);
      } else {
        query = query.in('status', statuses);
      }
    }

    if (search && search.trim()) {
      query = query.or(
        `first_name.ilike.%${search}%,last_name.ilike.%${search}%,student_number.ilike.%${search}%`
      );
    }

    const { data, error } = await query.order('last_name', { ascending: true });

    if (error) {
      throw error;
    }

    // Filter by grade if needed
    let filteredStudents = (data || []).map(mapStudentRow);
    if (grade && grade !== 'all') {
      const grades = Array.isArray(grade) ? grade : [grade];
      filteredStudents = filteredStudents.filter((s) =>
        s.grade && grades.includes(s.grade)
      );
    }

    // Format for CSV
    const formatDate = (dateStr: string | null) => {
      if (!dateStr) return '';
      try {
        return new Date(dateStr).toLocaleDateString('en-US');
      } catch {
        return dateStr;
      }
    };

    const csvRows = filteredStudents.map((s) => ({
      'Student Code': s.code || '',
      'Name': s.name || '',
      'First Name': s.firstName || '',
      'Last Name': s.lastName || '',
      'Class': s.className || 'Unassigned',
      'Grade': s.grade || 'N/A',
      'Parent': s.parent || 'N/A',
      'Contact Email': s.contactEmail || 'N/A',
      'Contact Phone': s.contactPhone || 'N/A',
      'Status': s.status || 'active',
      'Date of Birth': formatDate(s.dateOfBirth),
      'Enrollment Date': formatDate(s.enrolledAt),
      'Gender': s.gender || 'N/A',
      'Address': s.address || '',
    }));

    // Generate CSV
    const headers = Object.keys(csvRows[0] || {});
    const csvContent = [
      headers.join(','),
      ...csvRows.map((row) =>
        headers
          .map((h) => {
            const value = row[h] || '';
            // Escape commas and quotes
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(',')
      ),
    ].join('\n');

    return csvContent;
  } catch (error) {
    console.error('exportStudentsCSV error:', error);
    throw error;
  }
}

/**
 * Get next available student code for a school
 */
export async function getNextStudentCode(schoolId: string): Promise<string> {
  try {
    // Resolve school ID (Airtable → Supabase UUID)
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      console.warn('getNextStudentCode: School not found:', schoolId);
      return 'STU001';
    }

    console.log('🎓 getNextStudentCode: Using school ID:', resolvedSchoolId);

    // Get the highest student_number that matches the pattern STU### (limit 100 like web)
    const { data, error } = await supabase
      .from('school_students')
      .select('student_number')
      .eq('school_id', resolvedSchoolId)
      .order('student_number', { ascending: false })
      .limit(100);

    if (error) {
      console.error('getNextStudentCode: Supabase error:', error);
      throw error;
    }

    let nextNumber = 1;

    if (data && data.length > 0) {
      console.log('🎓 getNextStudentCode: Found', data.length, 'students');
      // Find the highest number from student codes matching patterns like STU001, STU002, td120, etc.
      for (const student of data) {
        const code = student.student_number;
        if (code) {
          // Match patterns like STU001, STU-001, S001, td120, etc. (any digits at end)
          const match = code.match(/(\d+)$/);
          if (match) {
            const num = parseInt(match[1], 10);
            if (num >= nextNumber) {
              nextNumber = num + 1;
            }
          }
        }
      }
      console.log('🎓 getNextStudentCode: Next number:', nextNumber);
    } else {
      console.log('🎓 getNextStudentCode: No students found, starting from 1');
    }

    // Generate next code with STU prefix and padded number (3 digits like web)
    const nextStudentCode = `STU${String(nextNumber).padStart(3, '0')}`;
    console.log('🎓 getNextStudentCode: Generated code:', nextStudentCode);
    
    return nextStudentCode;
  } catch (error) {
    console.error('getNextStudentCode error:', error);
    return 'STU001'; // Fallback
  }
}

/**
 * Create a new student
 */
export async function createStudent(
  schoolId: string,
  studentData: {
    student_number: string;
    first_name: string;
    last_name: string;
    class_id: string;
    gender: string | null;
    date_of_birth: string | null;
    parent_name: string | null;
    parent_email: string | null;
    parent_phone: string | null;
  }
): Promise<SchoolStudent> {
  try {
    // Resolve school ID (Airtable → Supabase UUID)
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) {
      throw new Error(`School not found: ${schoolId}`);
    }

    console.log('🎓 createStudent: Using school ID:', resolvedSchoolId);

    const { data, error } = await supabase
      .from('school_students')
      .insert({
        school_id: resolvedSchoolId,
        student_number: studentData.student_number,
        first_name: studentData.first_name,
        last_name: studentData.last_name,
        class_id: studentData.class_id,
        gender: studentData.gender,
        date_of_birth: studentData.date_of_birth,
        parent_name: studentData.parent_name,
        parent_email: studentData.parent_email,
        parent_phone: studentData.parent_phone,
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select(`
        *,
        school_classes!inner(
          id,
          name,
          grade_level
        )
      `)
      .single();

    if (error) {
      throw error;
    }

    if (!data) {
      throw new Error('No data returned from insert');
    }

    return mapStudentRow(data);
  } catch (error) {
    console.error('createStudent error:', error);
    throw error;
  }
}

export default {
  getStudents,
  getStudentById,
  getStudentKPIs,
  getStudentClasses,
  getStudentGrades,
  exportStudentsCSV,
  getNextStudentCode,
  createStudent,
};

