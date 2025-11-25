/**
 * Student-related TypeScript types
 * Maps Supabase schema to application types
 */

export type Student = {
  id: string;
  schoolId: string;
  code: string; // mapped from student_number
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
  status: 'active' | 'inactive' | 'graduated' | string;
  gender: string | null;
  dob: string | null;
  dateOfBirth: string | null;
  enrolledAt: string | null;
  enrollmentDate: string | null;
  photoUrl: string | null;
  address: string | null;
  // Legacy fields for backward compatibility
  student_number?: string;
  first_name?: string;
  last_name?: string;
  class_name?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
};

export type StudentKPI = {
  total: number;
  active: number;
  inactive: number;
  avgAttendance: number; // percentage (0-100)
  lastUpdated?: string;
};

export type StudentFilters = {
  search?: string;
  classId?: string | string[];
  grade?: string | string[];
  status?: string | string[];
  page?: number;
  pageSize?: number;
};

export type StudentListResponse = {
  records: Student[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

export type AttendanceRecord = {
  id: string;
  studentId: string;
  studentid: string; // from view
  classId: string | null;
  classid: string | null; // from view
  date: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused' | string;
  notes?: string | null;
  schoolId: string;
  schoolid: string; // from view
  createdAt?: string;
  updatedAt?: string;
};

export type StudentNote = {
  id: string;
  studentId: string;
  type: string;
  note: string;
  createdAt: string;
  author: string | null;
};

export type FeeSummary = {
  id: string;
  studentId: string;
  dueDate: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue' | string;
  description?: string | null;
};

export type ProfileTab = 'overview' | 'attendance' | 'fees' | 'notes' | 'contacts';

export type AttendanceSummary = {
  period: '1m' | '3m' | '6m' | '12m';
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  percentage: number;
  records: AttendanceRecord[];
};

export type EnrollmentGrowthData = {
  month: string;
  count: number;
  byClass?: Record<string, number>;
};

export type StudentProfile = Student & {
  classDetails?: {
    id: string;
    name: string;
    gradeLevel: string | null;
    roomNumber: string | null;
  } | null;
  attendanceSummary?: AttendanceSummary;
  notes?: StudentNote[];
  fees?: FeeSummary[];
  parentPrimary?: {
    name: string | null;
    phone: string | null;
    email: string | null;
    relationship?: string | null;
  } | null;
  parentSecondary?: {
    name: string | null;
    phone: string | null;
    email: string | null;
    relationship?: string | null;
  } | null;
};







