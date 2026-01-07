/**
 * TypeScript types for Teacher entities
 */

export interface Teacher {
  id: string;
  user_id?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  avatar?: string | null;
  qualifications?: string | null;
  experience: number;
  hourly_rate: number;
  rating?: number | null;
  review_count: number;
  description?: string | null;
  languages?: string[] | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  status: string;
  created_at?: string;
  updated_at?: string;
  // Joined data from teacher_subjects
  subjects?: Subject[];
  teacher_subjects?: Array<{
    subject_id: string;
    subjects?: Subject | null;
  }>;
}

export interface Subject {
  id: string;
  name: string;
  name_vi?: string | null;
  icon?: string | null;
  category?: string | null;
}

export interface TeacherWithSubjects extends Teacher {
  subjects: Subject[];
}

