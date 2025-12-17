export type DateRange = 'week' | '1m' | '3m' | '6m' | 'course';

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
  d: string; // date
  avg_score: number;
}

export interface Child {
  id: string;
  firstName: string;
  lastName: string;
  className?: string;
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
}


