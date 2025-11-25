/**
 * Homework Helper Library
 * Utilities for fetching homework data, calculating date ranges, and types
 */

import { createServerSupabaseClient } from './supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// =============================================================================
// TYPES
// =============================================================================

export interface HomeworkKPIs {
  total: number;
  pending: number;
  completed: number;
  completion_rate: number;
}

export interface HomeworkListItem {
  assignment_id: string;
  subject: string;
  title: string;
  class_name: string | null;
  due_date: string;
  status: string;
  submitted: number;
  total: number;
  progress_percent: number;
  child_status?: string | null;
  child_score?: number | null;
}

export interface ScoreDataPoint {
  d: string;  // date
  avg_score: number;
}

export type DateRange = 'week' | '1m' | '3m' | '6m' | 'course';

export interface HomeworkAssignment {
  id: string;
  school_id: string;
  class_id: string | null;
  subject: string;
  title: string;
  description: string | null;
  assigned_at: string;
  due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string | null;
  status: 'pending' | 'submitted' | 'graded' | 'late';
  score: number | null;
  created_at: string;
  updated_at: string;
}

// =============================================================================
// DATE RANGE HELPERS
// =============================================================================

/**
 * Calculate date range based on filter
 */
export function getDateRangeForHomework(
  date: Date,
  range: DateRange,
  enrolledDate?: Date
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
      const start = enrolledDate ? new Date(enrolledDate) : new Date(date.getFullYear(), date.getMonth(), 1);
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
 * Check if assignment is due soon (≤2 days from today)
 */
export function isDueSoon(dueDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays >= 0 && diffDays <= 2;
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

// =============================================================================
// DATA FETCHING HELPERS
// =============================================================================

/**
 * Fetch homework KPIs
 */
export async function fetchHomeworkKpis(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string,
  subject?: string,
  studentId?: string,
  status: string = 'all',
  supabase?: SupabaseClient
): Promise<HomeworkKPIs> {
  const client = supabase || createServerSupabaseClient();
  
  const { data, error } = await client.rpc('hw_kpis', {
    p_school: schoolId,
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
}

/**
 * Fetch homework list
 */
export async function fetchHomeworkList(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string,
  subject?: string,
  studentId?: string,
  status: string = 'all',
  supabase?: SupabaseClient
): Promise<HomeworkListItem[]> {
  const client = supabase || createServerSupabaseClient();
  
  const { data, error } = await client.rpc('hw_list', {
    p_school: schoolId,
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
    child_score: item.child_score,
  }));
}

/**
 * Fetch scores series for charts
 */
export async function fetchScoresSeries(
  schoolId: string,
  from: Date,
  to: Date,
  classId?: string,
  subject?: string,
  studentId?: string,
  supabase?: SupabaseClient
): Promise<ScoreDataPoint[]> {
  const client = supabase || createServerSupabaseClient();
  
  const { data, error } = await client.rpc('hw_scores_series', {
    p_school: schoolId,
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
}

/**
 * Fetch single assignment with details
 */
export async function fetchAssignmentDetail(
  assignmentId: string,
  supabase?: SupabaseClient
): Promise<HomeworkAssignment | null> {
  const client = supabase || createServerSupabaseClient();
  
  const { data, error } = await client
    .from('school_homework_assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();

  if (error) {
    console.error('Error fetching assignment detail:', error);
    return null;
  }

  return data;
}

/**
 * Fetch submissions for an assignment
 */
export async function fetchAssignmentSubmissions(
  assignmentId: string,
  supabase?: SupabaseClient
): Promise<any[]> {
  const client = supabase || createServerSupabaseClient();
  
  const { data, error } = await client
    .from('school_homework_submissions')
    .select(`
      *,
      student:school_students(id, first_name, last_name, student_number)
    `)
    .eq('assignment_id', assignmentId)
    .order('status', { ascending: true });

  if (error) {
    console.error('Error fetching submissions:', error);
    return [];
  }

  return data || [];
}

