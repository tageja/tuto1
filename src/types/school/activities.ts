export interface DailyActivity {
  id: string;
  school_id: string;
  date: string;
  time: string;
  class_id: string;
  grade: string;
  class_name?: string;
  title: string;
  description?: string;
  type: 'Meal' | 'Learning' | 'Play' | 'Rest';
  status: 'Pending' | 'In Progress' | 'Completed';
  teacher_id?: string;
  teacher_name?: string;
  menu_details?: string;
  files?: string[];
  created_at: string;
  updated_at: string;
}

export interface ActivityKPI {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
}

export interface ClassOption {
  id: string;
  name: string;
  grade_level?: string | null;
}






