/**
 * Student data adapter
 * Maps Supabase rows to application types
 */

import { Student, AttendanceRecord } from '../types/students';

/**
 * Map Supabase student row to Student type
 * Adds `code` field from `student_number`
 */
export function mapStudentRow(row: any): Student {
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
    enrolledAt: row.enrolled_at || row.enrollment_date || row.created_at || null, // created_at is used as enrollment date
    enrollmentDate: row.enrollment_date || row.enrolled_at || row.created_at || null, // created_at is used as enrollment date
    photoUrl: row.photo_url || null,
    address: row.address || null,
    // Legacy fields for backward compatibility
    student_number: row.student_number,
    first_name: row.first_name,
    last_name: row.last_name,
    class_name: className,
    parent_name: row.parent_name,
    parent_email: row.parent_email,
    parent_phone: row.parent_phone,
  };
}

/**
 * Map attendance view row to AttendanceRecord type
 */
export function mapAttendanceRecord(row: any): AttendanceRecord {
  return {
    id: row.id,
    studentId: row.student_id || row.studentid || '',
    studentid: row.studentid || row.student_id || '',
    classId: row.class_id || row.classid || null,
    classid: row.classid || row.class_id || null,
    date: row.date,
    status: row.status || 'Present',
    notes: row.notes || null,
    schoolId: row.school_id || row.schoolid || '',
    schoolid: row.schoolid || row.school_id || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Format student for CSV export
 */
export function formatStudentForExport(student: Student, locale: string = 'en-US'): Record<string, string> {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '';
    try {
      return new Date(dateStr).toLocaleDateString(locale);
    } catch {
      return dateStr;
    }
  };

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '';
    return num.toLocaleString(locale);
  };

  return {
    'Student Code': student.code || '',
    'Name': student.name || '',
    'First Name': student.firstName || '',
    'Last Name': student.lastName || '',
    'Class': student.className || 'Unassigned',
    'Grade': student.grade || 'N/A',
    'Parent': student.parent || 'N/A',
    'Contact Email': student.contactEmail || 'N/A',
    'Contact Phone': student.contactPhone || 'N/A',
    'Status': student.status || 'active',
    'Date of Birth': formatDate(student.dateOfBirth),
    'Enrollment Date': formatDate(student.enrolledAt),
    'Gender': student.gender || 'N/A',
    'Address': student.address || '',
  };
}

