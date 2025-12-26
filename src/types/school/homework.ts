export type HomeworkStatus = 'pending' | 'submitted' | 'graded' | 'late' | 'completed';
export type HomeworkStatusTab = 'all' | 'pending' | 'completed';
export type TimeRange = 'week' | '1m' | '3m' | '6m';

export interface HomeworkAssignment {
  id: string;
  school_id: string;
  class_id: string | null;
  subject: string;
  title: string;
  description: string | null;
  assigned_at: string;
  due_date: string; // YYYY-MM-DD
  total_tasks: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  class_name?: string;
  submission?: HomeworkSubmission;
  completion_rate?: number; // percentage for admin view
  total_submissions?: number;
  completed_submissions?: number;
}

export interface HomeworkSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submitted_at: string | null;
  status: HomeworkStatus;
  score: number | null;
  created_at: string;
  updated_at: string;
  school_id: string;
  is_locked: boolean;
  // Joined data
  student_name?: string;
  student_first_name?: string;
  student_last_name?: string;
  class_name?: string;
}

export interface HomeworkStats {
  total: number;
  pending: number;
  completed: number;
  completionRate: number; // percentage
}

export interface HomeworkFilters {
  status?: HomeworkStatusTab;
  baseDate?: Date;
  range?: TimeRange;
  classId?: string;
  subject?: string;
  studentId?: string;
  search?: string;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  className?: string;
  classId?: string;
}

export interface ClassOption {
  id: string;
  name: string;
}

export interface SubjectOption {
  name: string;
  label?: string; // For i18n
}

export interface StudentOption {
  id: string;
  firstName: string;
  lastName: string;
  className?: string;
}
