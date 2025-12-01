/**
 * Attendance Component Types
 */

export interface AttendanceFiltersProps {
  date: Date;
  range: 'week' | '1m' | '3m' | '6m' | 'course';
  classId?: string;
  studentId?: string;
  searchQuery?: string;
  onDateChange: (date: Date) => void;
  onRangeChange: (range: 'week' | '1m' | '3m' | '6m' | 'course') => void;
  onClassChange: (classId: string | undefined) => void;
  onStudentChange: (studentId: string | undefined) => void;
  onSearchChange: (query: string) => void;
  classes: Array<{ id: string; name: string }>;
  students: Array<{ id: string; first_name: string; last_name: string }>;
  showCourseRange?: boolean;
}

export interface AttendanceKpisProps {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
  loading?: boolean;
  lastUpdated?: Date;
  showTotal?: boolean;
}

export interface AttendanceWeekGridProps {
  schoolId: string;
  weekStart: Date;
  weekEnd: Date;
  classId?: string;
  studentId?: string;
  includeWeekends: boolean;
  onRecordUpdate?: (recordId: string, status: string) => void;
  readOnly?: boolean;
}

export interface AttendanceRangeTimelineProps {
  schoolId: string;
  from: Date;
  to: Date;
  classId?: string;
  studentId?: string;
  onRecordUpdate?: (recordId: string, status: string) => void;
  readOnly?: boolean;
}

export interface Student {
  id: string;
  first_name: string;
  last_name: string;
  student_number?: string;
  class?: {
    name: string;
  };
}

export interface AttendanceRecord {
  id: string;
  date: string;
  student_id: string;
  class_id: string;
  status: string;
  late_minutes: number;
  notes: string | null;
}




