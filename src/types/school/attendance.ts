export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type TimeRange = 'week' | '1m' | '3m' | '6m' | 'full';

export interface AttendanceRecord {
  id: string;
  student_id: string;
  class_id: string | null;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  late_minutes?: number;
}

export interface AttendanceKPIs {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number; // percentage
}

export interface StudentAttendanceSummary {
  studentId: string;
  studentName: string;
  avatar?: string;
  attendanceRate: number; // percentage
  weekStatus: { [date: string]: AttendanceStatus | null }; // M-F dates (YYYY-MM-DD format)
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  className?: string;
  photoUrl?: string | null;
}

export interface ClassOption {
  id: string;
  name: string;
}

export interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  className?: string;
  photoUrl?: string | null;
}




