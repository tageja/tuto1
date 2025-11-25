/**
 * Attendance Helper Library
 * Utilities for KPIs, date ranges, CSV export, and weekend detection
 */

import { createServerSupabaseClient } from './supabase';

// Status display configuration
export const statusConfig = {
  present: {
    label: 'Present',
    color: 'text-green-600',
    bg: 'bg-green-100',
    badge: 'bg-green-500',
  },
  absent: {
    label: 'Absent',
    color: 'text-red-600',
    bg: 'bg-red-100',
    badge: 'bg-red-500',
  },
  late: {
    label: 'Late',
    color: 'text-yellow-600',
    bg: 'bg-yellow-100',
    badge: 'bg-yellow-500',
  },
  excused: {
    label: 'Excused',
    color: 'text-blue-600',
    bg: 'bg-blue-100',
    badge: 'bg-blue-500',
  },
} as const;

export type AttendanceStatus = keyof typeof statusConfig;

export interface AttendanceKPIs {
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  rate: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  student_id: string;
  class_id: string;
  status: string;
  late_minutes: number;
  notes: string | null;
  student?: {
    first_name: string;
    last_name: string;
    student_number?: string;
  };
  class?: {
    name: string;
  };
}

export type DateRange = 'week' | '1m' | '3m' | '6m' | 'course';

/**
 * Get week bounds for a given date (Monday start)
 */
export function getWeekBounds(date: Date): { from: Date; to: Date } {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
  
  const from = new Date(d.setDate(diff));
  from.setHours(0, 0, 0, 0);
  
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  
  return { from, to };
}

/**
 * Calculate date range based on filter
 */
export function getDateRange(
  date: Date,
  range: DateRange,
  enrolledDate?: Date
): { from: Date; to: Date } {
  const to = new Date(date);
  to.setHours(23, 59, 59, 999);
  
  const from = new Date(date);
  from.setHours(0, 0, 0, 0);
  
  switch (range) {
    case 'week':
      return getWeekBounds(date);
    
    case '1m':
      from.setMonth(from.getMonth() - 1);
      break;
    
    case '3m':
      from.setMonth(from.getMonth() - 3);
      break;
    
    case '6m':
      from.setMonth(from.getMonth() - 6);
      break;
    
    case 'course':
      if (enrolledDate) {
        return {
          from: new Date(enrolledDate),
          to,
        };
      }
      // Fallback to 1 year if no enrollment date
      from.setFullYear(from.getFullYear() - 1);
      break;
  }
  
  return { from, to };
}

/**
 * Fetch attendance KPIs from database
 * Can be called from both server and client components
 */
export async function fetchAttendanceKpis(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string,
  studentId?: string,
  supabaseClient?: any
): Promise<AttendanceKPIs> {
  // Use provided client or create server client
  const supabase = supabaseClient || createServerSupabaseClient();
  
  // Guard against undefined dates
  if (!from || !to) {
    console.warn('fetchAttendanceKpis called with undefined dates');
    return {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      rate: 0,
    };
  }

  const { data, error } = await supabase.rpc('att_kpis', {
    p_school: schoolId,
    p_from: from.toISOString().split('T')[0],
    p_to: to.toISOString().split('T')[0],
    p_class: classId || null,
    p_student: studentId || null,
  });
  
  if (error) {
    console.error('Error fetching attendance KPIs:', error);
    return {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      rate: 0,
    };
  }
  
  if (!data || data.length === 0) {
    return {
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
      total: 0,
      rate: 0,
    };
  }
  
  const kpi = data[0];
  const present = Number(kpi.present) || 0;
  const absent = Number(kpi.absent) || 0;
  const late = Number(kpi.late) || 0;
  const excused = Number(kpi.excused) || 0;
  const total = present + absent + late + excused;
  
  return {
    present,
    absent,
    late,
    excused,
    total,
    rate: Number(kpi.rate) || 0,
  };
}

/**
 * Fetch attendance range data from database
 * Can be called from both server and client components
 */
export async function fetchAttendanceRange(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string,
  studentId?: string,
  supabaseClient?: any
): Promise<AttendanceRecord[]> {
  // Use provided client or create server client
  const supabase = supabaseClient || createServerSupabaseClient();
  
  // Guard against undefined dates
  if (!from || !to) {
    console.warn('fetchAttendanceRange called with undefined dates');
    return [];
  }

  const { data, error } = await supabase.rpc('att_range', {
    p_school: schoolId,
    p_from: from.toISOString().split('T')[0],
    p_to: to.toISOString().split('T')[0],
    p_class: classId || null,
    p_student: studentId || null,
  });
  
  if (error) {
    console.error('Error fetching attendance range:', error);
    return [];
  }
  
  return (data || []) as AttendanceRecord[];
}

/**
 * Check if school has weekend classes
 * Can be called from both server and client components
 */
export async function schoolHasWeekendClasses(
  schoolId: string,
  from?: Date,
  to?: Date,
  supabaseClient?: any
): Promise<boolean> {
  // Use provided client or create server client
  const supabase = supabaseClient || createServerSupabaseClient();
  
  // Default to checking last 6 months if no dates provided
  const checkFrom = from || new Date(new Date().setMonth(new Date().getMonth() - 6));
  const checkTo = to || new Date();
  
  const { data, error } = await supabase.rpc('school_has_weekend_classes', {
    p_school_id: schoolId,
    p_from: checkFrom.toISOString().split('T')[0],
    p_to: checkTo.toISOString().split('T')[0],
  });
  
  if (error) {
    console.error('Error checking weekend classes:', error);
    return false;
  }
  
  return data === true;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (locale === 'vi') {
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  }
  
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format date for CSV
 */
export function formatDateForCSV(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Export attendance data to CSV
 */
export function exportAttendanceToCSV(
  data: AttendanceRecord[],
  filename: string,
  locale: string = 'en'
): void {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }
  
  // CSV headers
  const headers = [
    'Date',
    'Student Name',
    'Student Number',
    'Class',
    'Status',
    'Late Minutes',
    'Notes',
  ];
  
  // Convert data to CSV rows
  const rows = data.map((record) => {
    const studentName = record.student
      ? `${record.student.first_name} ${record.student.last_name}`
      : 'N/A';
    const studentNumber = record.student?.student_number || 'N/A';
    const className = record.class?.name || 'N/A';
    
    return [
      formatDateForCSV(record.date),
      `"${studentName}"`, // Quoted for CSV safety
      studentNumber,
      `"${className}"`,
      record.status,
      record.late_minutes,
      record.notes ? `"${record.notes.replace(/"/g, '""')}"` : '', // Escape quotes
    ];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');
  
  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Get days in range for calendar display
 */
export function getDaysInRange(from: Date, to: Date, includeWeekends: boolean = false): Date[] {
  const days: Date[] = [];
  const current = new Date(from);
  
  while (current <= to) {
    const dayOfWeek = current.getDay();
    
    if (includeWeekends || (dayOfWeek !== 0 && dayOfWeek !== 6)) {
      days.push(new Date(current));
    }
    
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}

/**
 * Group attendance records by student
 */
export function groupByStudent(records: AttendanceRecord[]): Map<string, AttendanceRecord[]> {
  const grouped = new Map<string, AttendanceRecord[]>();
  
  for (const record of records) {
    const existing = grouped.get(record.student_id) || [];
    existing.push(record);
    grouped.set(record.student_id, existing);
  }
  
  return grouped;
}

/**
 * Group attendance records by date
 */
export function groupByDate(records: AttendanceRecord[]): Map<string, AttendanceRecord[]> {
  const grouped = new Map<string, AttendanceRecord[]>();
  
  for (const record of records) {
    const dateKey = typeof record.date === 'string' 
      ? record.date 
      : formatDateForCSV(record.date);
    const existing = grouped.get(dateKey) || [];
    existing.push(record);
    grouped.set(dateKey, existing);
  }
  
  return grouped;
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const d = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  return d > today;
}

