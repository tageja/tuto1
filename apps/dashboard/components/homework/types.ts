/**
 * Homework Component Types
 * TypeScript interfaces for homework components
 */

export interface HomeworkFiltersProps {
  selectedDate: Date;
  range: 'week' | '1m' | '3m' | '6m' | 'course';
  classId?: string;
  subject?: string;
  studentId?: string;
  status: 'all' | 'pending' | 'completed';
  searchQuery: string;
  classes: Array<{ id: string; name: string }>;
  students: Array<{ id: string; first_name: string; last_name: string }>;
  showStudentFilter?: boolean;
  onDateChange: (date: Date) => void;
  onRangeChange: (range: 'week' | '1m' | '3m' | '6m' | 'course') => void;
  onClassChange: (classId?: string) => void;
  onSubjectChange: (subject?: string) => void;
  onStudentChange: (studentId?: string) => void;
  onStatusChange: (status: 'all' | 'pending' | 'completed') => void;
  onSearchChange: (query: string) => void;
}

export interface HomeworkKpisProps {
  total: number;
  pending: number;
  completed: number;
  completion_rate: number;
  loading?: boolean;
  lastUpdated?: Date;
}

export interface HomeworkListProps {
  items: Array<{
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
  }>;
  onViewAssignment: (assignmentId: string) => void;
  loading?: boolean;
  isParentView?: boolean;
  showChildPerformance?: boolean;
}

export interface HomeworkChartsProps {
  completionRate: number;
  scoresData: Array<{ d: string; avg_score: number }>;
  loading?: boolean;
  showCharts: boolean;  // Only show when class or subject selected
}

export interface CreateHomeworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  schoolId: string;
  classes: Array<{ id: string; name: string }>;
}

export interface HomeworkDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  assignmentId: string | null;
  schoolId: string;
  isAdmin: boolean;
  onUpdate: () => void;
}

