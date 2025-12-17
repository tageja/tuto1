/**
 * Medicine Management Types
 * TypeScript interfaces for medicine reminders and administration logs
 */

export interface MedicineReminder {
  id: string;
  school_id: string;
  student_id: string;
  medicine_name: string;
  dosage: string | null;
  frequency: 'once' | 'daily' | 'twice_daily' | 'as_needed';
  time_of_day: string[] | null; // Array of time strings like ["13:30", "19:00"]
  start_date: string; // ISO date string
  end_date: string | null; // ISO date string
  status: 'active' | 'paused' | 'ended';
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  school_students?: {
    id: string;
    first_name: string;
    last_name: string;
    class_id: string | null;
  };
}

export interface MedicineLog {
  id: string;
  school_id: string;
  student_id: string;
  reminder_id: string | null;
  administered_at: string; // ISO timestamp
  administered_by: string | null;
  status: 'completed' | 'missed' | 'skipped';
  note: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  medicine_reminders?: {
    medicine_name: string;
    dosage: string | null;
  } | null;
  school_students?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface MedicineKPIs {
  totalReminders: number;
  active: number;
  dueToday: number;
  completedToday: number;
}

export interface MedicineFilters {
  classId?: string | null;
  studentId?: string | null;
  status?: 'active' | 'paused' | 'ended' | null;
  search?: string;
  due?: boolean; // Filter for reminders due today
}

export interface CreateReminderData {
  school_id: string;
  student_id: string;
  medicine_name: string;
  dosage?: string | null;
  frequency: 'once' | 'daily' | 'twice_daily' | 'as_needed';
  time_of_day?: string[] | null;
  start_date: string; // ISO date string
  end_date?: string | null; // ISO date string
  notes?: string | null;
  created_by?: string | null;
}

export interface LogAdministrationData {
  school_id: string;
  student_id: string;
  reminder_id?: string | null;
  administered_at?: string; // ISO timestamp, defaults to now
  administered_by?: string | null;
  status: 'completed' | 'missed' | 'skipped';
  note?: string | null;
}

export interface ParentChild {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  classId: string | null;
  className: string;
}


