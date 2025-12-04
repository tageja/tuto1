export interface PaymentFilters {
  from?: string;
  to?: string;
  classId?: string;
  studentId?: string;
  type?: 'tuition' | 'trip' | 'club' | 'misc';
  status?: 'all' | 'pending' | 'paid' | 'overdue';
}

export interface PaymentKPIs {
  total_collection: number;
  paid: number;
  pending: number;
  overdue: number;
  total_students: number;
  revenue_per_student: number;
}

export interface PaymentItem {
  id: string;
  student_name: string;
  class_name: string | null;
  title: string;
  type: 'tuition' | 'trip' | 'club' | 'misc';
  amount_cents: number;
  amount_dollars: string;
  currency: string;
  due_date: string;
  paid_at: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'void';
  method: string | null;
  notes: string | null;
  student_id: string;
  class_id: string | null;
}

export interface PaymentDonutData {
  labels: string[];
  datasets: Array<{
    data: number[];
    values: number[];
  }>;
}

export interface TrendDataPoint {
  date: string;
  revenue: number;
}

export type DateRange = 'week' | '1m' | '3m' | '6m' | '12m' | 'custom';

