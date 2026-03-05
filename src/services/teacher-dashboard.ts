/**
 * Teacher Dashboard Service
 * Calls the existing web dashboard API routes with Bearer token auth.
 * Set EXPO_PUBLIC_DASHBOARD_API_URL to your Next.js dashboard base (e.g. https://your-app.vercel.app).
 */

import { getCurrentSession } from '../config/supabase';

const BASE_URL =
  (process.env.EXPO_PUBLIC_DASHBOARD_API_URL || '').replace(/\/$/, '');

async function getTeacherAuthHeaders(): Promise<Record<string, string>> {
  const session = await getCurrentSession();
  const token = session?.access_token;
  if (!token) throw new Error('NO_AUTH');
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function ensureBaseUrl(): void {
  if (!BASE_URL) {
    console.warn(
      'teacher-dashboard: EXPO_PUBLIC_DASHBOARD_API_URL is not set. Teacher API calls will fail.'
    );
  }
}

async function authedGet<T>(path: string): Promise<T> {
  ensureBaseUrl();
  const headers = await getTeacherAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { headers });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(errBody || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

async function authedPost(path: string, body: object): Promise<void> {
  ensureBaseUrl();
  const headers = await getTeacherAuthHeaders();
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(errBody || `HTTP ${res.status}`);
  }
}

// ---------------------------------------------------------------------------
// Types (match web API response shapes)
// ---------------------------------------------------------------------------

export interface TeacherStats {
  classesCount: number;
  studentsCount: number;
  todayAttendanceRate: number | null;
  homeworkPending: number;
}

export interface TeacherClass {
  id: string;
  name: string;
  grade_level?: string;
  room_number?: string;
  capacity?: number;
  status?: string;
  school_id?: string;
  teacher_id?: string;
}

export interface TeacherStudent {
  id: string;
  first_name: string;
  last_name: string;
  student_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  status?: string;
  class_id?: string | null;
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  class?: { name: string };
}

export interface AttendanceRecord {
  status: string;
  track_status: string;
}

export interface HomeworkAssignment {
  id: string;
  title: string;
  subject?: string;
  description?: string;
  due_date: string;
  class_id?: string;
  class_name?: string;
  submission_count?: number;
  student_count?: number;
  is_past_due?: boolean;
  is_active?: boolean;
}

export interface ScheduleSlot {
  id?: string;
  class_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  subject_or_slot_name?: string | null;
  room_number?: string | null;
}

export interface ProgressReportAssessment {
  id: string;
  title: string;
  subject_name?: string;
  assessment_type?: string;
  max_score?: number;
  date: string;
  class_id: string;
  class_name?: string;
  scores: Array<{
    student_id: string;
    student_name: string;
    score: number | string;
    grade_letter?: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchTeacherStats(schoolId: string): Promise<TeacherStats> {
  const enc = encodeURIComponent(schoolId);
  const data = await authedGet<{ success: boolean; data?: TeacherStats }>(
    `/api/school/teacher/stats?schoolId=${enc}`
  );
  const d = data?.data;
  return {
    classesCount: d?.classesCount ?? 0,
    studentsCount: d?.studentsCount ?? 0,
    todayAttendanceRate: d?.todayAttendanceRate ?? null,
    homeworkPending: d?.homeworkPending ?? 0,
  };
}

export async function fetchTeacherClasses(
  schoolId: string
): Promise<TeacherClass[]> {
  const enc = encodeURIComponent(schoolId);
  const data = await authedGet<{
    success: boolean;
    data?: { records?: TeacherClass[] };
  }>(`/api/school/teacher/classes?schoolId=${enc}`);
  return data?.data?.records ?? [];
}

export async function fetchTeacherStudents(
  schoolId: string,
  classId?: string | null,
  limit = 200
): Promise<TeacherStudent[]> {
  const params = new URLSearchParams({
    schoolId,
    limit: String(limit),
  });
  if (classId) params.set('classId', classId);
  const data = await authedGet<{
    success?: boolean;
    data?: { records?: TeacherStudent[] };
  }>(`/api/school/students?${params.toString()}`);
  return data?.data?.records ?? [];
}

export async function fetchTeacherAttendance(
  schoolId: string,
  classId: string,
  date: string
): Promise<Record<string, AttendanceRecord>> {
  const encS = encodeURIComponent(schoolId);
  const encC = encodeURIComponent(classId);
  const data = await authedGet<{ success: boolean; data?: Record<string, AttendanceRecord> }>(
    `/api/school/teacher/attendance?schoolId=${encS}&classId=${encC}&date=${date}`
  );
  return data?.data ?? {};
}

export async function saveTeacherAttendance(
  schoolId: string,
  classId: string,
  date: string,
  attendance: Array<{ student_id: string; status: string; track_status?: string }>
): Promise<void> {
  await authedPost('/api/school/teacher/attendance', {
    schoolId,
    classId,
    date,
    attendance,
  });
}

export async function fetchTeacherHomework(
  schoolId: string,
  classId?: string | null
): Promise<HomeworkAssignment[]> {
  const enc = encodeURIComponent(schoolId);
  let path = `/api/school/teacher/homework?schoolId=${enc}`;
  if (classId) path += `&classId=${encodeURIComponent(classId)}`;
  const data = await authedGet<{ success: boolean; data?: HomeworkAssignment[] }>(path);
  return Array.isArray(data?.data) ? data.data : [];
}

export interface HomeworkSubmissionsResponse {
  assignments: HomeworkAssignment[];
  submissions: Record<string, Record<string, { id?: string; status: string }>>;
}

export async function fetchHomeworkSubmissions(
  schoolId: string,
  classId: string,
  date: string
): Promise<HomeworkSubmissionsResponse> {
  const encS = encodeURIComponent(schoolId);
  const encC = encodeURIComponent(classId);
  const data = await authedGet<{ success: boolean; data?: HomeworkSubmissionsResponse }>(
    `/api/school/teacher/homework/submissions?schoolId=${encS}&classId=${encC}&date=${date}`
  );
  const d = data?.data;
  return {
    assignments: d?.assignments ?? [],
    submissions: d?.submissions ?? {},
  };
}

export async function saveHomeworkSubmissions(
  schoolId: string,
  classId: string,
  noHomework: boolean,
  records: Array<{ student_id: string; assignment_id: string; status: string }>
): Promise<void> {
  await authedPost('/api/school/teacher/homework/submissions', {
    schoolId,
    classId,
    noHomework,
    records,
  });
}

export async function fetchProgressReports(
  schoolId: string,
  classId?: string | null
): Promise<ProgressReportAssessment[]> {
  const enc = encodeURIComponent(schoolId);
  let path = `/api/school/teacher/progress-reports?schoolId=${enc}`;
  if (classId) path += `&classId=${encodeURIComponent(classId)}`;
  const data = await authedGet<{ success: boolean; data?: ProgressReportAssessment[] }>(path);
  return Array.isArray(data?.data) ? data.data : [];
}

export async function fetchClassSchedule(classId: string): Promise<ScheduleSlot[]> {
  const headers = await getTeacherAuthHeaders();
  ensureBaseUrl();
  const res = await fetch(`${BASE_URL}/api/school/classes/${encodeURIComponent(classId)}/schedules`, {
    headers,
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { success?: boolean; data?: ScheduleSlot[] };
  return Array.isArray(data?.data) ? data.data : [];
}

export interface StudentDetailResponse {
  id: string;
  first_name: string;
  last_name: string;
  student_number?: string | null;
  date_of_birth?: string | null;
  gender?: string | null;
  status?: string;
  parent_name?: string | null;
  parent_email?: string | null;
  parent_phone?: string | null;
  class?: { name: string };
}

export async function fetchStudentDetail(
  studentId: string,
  schoolId: string
): Promise<StudentDetailResponse | null> {
  ensureBaseUrl();
  const headers = await getTeacherAuthHeaders();
  const res = await fetch(
    `${BASE_URL}/api/school/students/${encodeURIComponent(studentId)}?schoolId=${encodeURIComponent(schoolId)}`,
    { headers }
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { data?: StudentDetailResponse };
  return data?.data ?? null;
}

export interface StudentAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

export async function fetchStudentAttendance(
  studentId: string,
  schoolId: string,
  period: '1m' | '3m' | '6m' | '12m'
): Promise<StudentAttendanceSummary> {
  ensureBaseUrl();
  const headers = await getTeacherAuthHeaders();
  const res = await fetch(
    `${BASE_URL}/api/school/students/${encodeURIComponent(studentId)}/attendance?schoolId=${encodeURIComponent(schoolId)}&period=${period}`,
    { headers }
  );
  if (!res.ok) return { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
  const data = (await res.json()) as { data?: StudentAttendanceSummary };
  const d = data?.data;
  return {
    total: d?.total ?? 0,
    present: d?.present ?? 0,
    absent: d?.absent ?? 0,
    late: d?.late ?? 0,
    percentage: d?.percentage ?? 0,
  };
}
