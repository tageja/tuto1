export interface ProgressKPIs {
  total_students: number;
  avg_grade: number;
  improvement_rate: number;
  at_risk_count: number;
}

export interface ClassOverviewItem {
  subject: string;
  avg_score: number;
  change: number;
}

export interface RecentReport {
  id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  avg_score: number;
  avg_grade_letter: string;
  released_at: string;
  range_start: string;
  range_end: string;
}

export interface StudentTimelineItem {
  d: string; // date
  subject: string;
  score: number;
}

export interface PRFiltersState {
  classId: string | null;
  studentId: string | null;
  range: '3m' | '6m' | '12m';
}

export interface ProgressReportSnapshot {
  id: string;
  avg_score: number;
  avg_grade_letter: string;
  improvement_pct: number;
  risk_flag: boolean;
  strengths: Array<{ label: string; detail: string }>;
  focus_areas: Array<{ label: string; detail: string }>;
  comments: Array<{ subject: string; comment: string }>;
  released_at: string;
  range_start: string;
  range_end: string;
}
