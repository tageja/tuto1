/**
 * Teacher Dashboard Service
 * Queries Supabase directly — same pattern as school-dashboard.ts.
 * No external URL required; works in all environments including production builds.
 */

import { supabase } from '../config/supabase';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Resolve a school name/id to a UUID */
async function resolveSchoolId(identifier: string): Promise<string | null> {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(identifier)) return identifier;
  const { data } = await supabase.from('schools').select('id').eq('name', identifier).maybeSingle();
  return data?.id ?? null;
}

/** Get the current signed-in user's email from Supabase auth */
async function getCurrentEmail(): Promise<string | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email?.toLowerCase().trim() ?? null;
}

/** Resolve teacher IDs for the current user at a school */
async function resolveTeacherIds(schoolId: string): Promise<string[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const ids: string[] = [];

  // Primary: match by auth_user_id → users table → school_teachers
  const { data: userRow } = await supabase
    .from('users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle();

  if (userRow?.id) {
    const { data: byUserId } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('user_id', userRow.id);
    (byUserId || []).forEach((r) => ids.push(r.id));
  }

  // Fallback: match by email
  const email = user.email?.toLowerCase().trim();
  if (email) {
    const { data: byEmail } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', email);
    (byEmail || []).forEach((r) => { if (!ids.includes(r.id)) ids.push(r.id); });
  }

  return ids;
}

// ---------------------------------------------------------------------------
// Types
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

export interface HomeworkSubmissionsResponse {
  assignments: HomeworkAssignment[];
  submissions: Record<string, Record<string, { id?: string; status: string }>>;
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

export interface StudentAttendanceSummary {
  total: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

// ---------------------------------------------------------------------------
// API functions
// ---------------------------------------------------------------------------

export async function fetchTeacherStats(schoolId: string): Promise<TeacherStats> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return { classesCount: 0, studentsCount: 0, todayAttendanceRate: null, homeworkPending: 0 };

  const teacherIds = await resolveTeacherIds(resolvedId);
  if (teacherIds.length === 0) return { classesCount: 0, studentsCount: 0, todayAttendanceRate: null, homeworkPending: 0 };

  const { data: classes } = await supabase
    .from('school_classes')
    .select('id')
    .eq('school_id', resolvedId)
    .in('teacher_id', teacherIds)
    .in('status', ['active', 'Active']);
  const classIds = (classes || []).map((c) => c.id);

  let studentsCount = 0;
  if (classIds.length > 0) {
    const { count } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .in('class_id', classIds)
      .in('status', ['active', 'Active']);
    studentsCount = count ?? 0;
  }

  let todayAttendanceRate: number | null = null;
  if (classIds.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const { data: todayAttendance } = await supabase
      .from('school_attendance')
      .select('status')
      .eq('school_id', resolvedId)
      .in('class_id', classIds)
      .eq('date', today);
    if (todayAttendance && todayAttendance.length > 0) {
      const present = todayAttendance.filter((r) => r.status === 'present').length;
      todayAttendanceRate = Math.round((present / todayAttendance.length) * 100);
    }
  }

  let homeworkPending = 0;
  if (classIds.length > 0) {
    const today = new Date().toISOString().split('T')[0];
    const { count } = await supabase
      .from('school_homework_assignments')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', resolvedId)
      .in('class_id', classIds)
      .eq('is_active', true)
      .gte('due_date', today);
    homeworkPending = count ?? 0;
  }

  return { classesCount: classIds.length, studentsCount, todayAttendanceRate, homeworkPending };
}

export async function fetchTeacherClasses(schoolId: string): Promise<TeacherClass[]> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  const teacherIds = await resolveTeacherIds(resolvedId);
  if (teacherIds.length === 0) return [];

  const { data } = await supabase
    .from('school_classes')
    .select('id, name, grade_level, room_number, capacity, status, school_id, teacher_id')
    .eq('school_id', resolvedId)
    .in('teacher_id', teacherIds)
    .in('status', ['active', 'Active'])
    .order('grade_level', { ascending: true })
    .order('name', { ascending: true });

  return data ?? [];
}

export async function fetchTeacherStudents(
  schoolId: string,
  classId?: string | null,
  limit = 200
): Promise<TeacherStudent[]> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  const teacherIds = await resolveTeacherIds(resolvedId);
  if (teacherIds.length === 0) return [];

  const { data: classes } = await supabase
    .from('school_classes')
    .select('id')
    .eq('school_id', resolvedId)
    .in('teacher_id', teacherIds)
    .in('status', ['active', 'Active']);
  const classIds = (classes || []).map((c) => c.id);
  if (classIds.length === 0) return [];

  const targetIds = classId ? [classId] : classIds;

  const { data } = await supabase
    .from('school_students')
    .select('id, first_name, last_name, student_number, date_of_birth, gender, status, class_id, parent_name, parent_email, parent_phone, school_classes(name)')
    .in('class_id', targetIds)
    .eq('school_id', resolvedId)
    .in('status', ['active', 'Active'])
    .order('last_name', { ascending: true })
    .limit(limit);

  return (data || []).map((s: any) => ({
    ...s,
    class: s.school_classes ? { name: s.school_classes.name } : undefined,
  }));
}

export async function fetchTeacherAttendance(
  schoolId: string,
  classId: string,
  date: string
): Promise<Record<string, AttendanceRecord>> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return {};

  const { data } = await supabase
    .from('school_attendance')
    .select('student_id, status, track_status')
    .eq('school_id', resolvedId)
    .eq('class_id', classId)
    .eq('date', date);

  const result: Record<string, AttendanceRecord> = {};
  (data || []).forEach((r: any) => {
    result[r.student_id] = { status: r.status || 'present', track_status: r.track_status || '' };
  });
  return result;
}

export async function saveTeacherAttendance(
  schoolId: string,
  classId: string,
  date: string,
  attendance: Array<{ student_id: string; status: string; track_status?: string }>
): Promise<void> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error('School not found');

  const rows = attendance.map((r) => ({
    school_id: resolvedId,
    class_id: classId,
    student_id: r.student_id,
    date,
    status: ['present', 'absent', 'late', 'excused'].includes(r.status) ? r.status : 'present',
    track_status: r.track_status === 'on_track' || r.track_status === 'off_track' ? r.track_status : null,
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('school_attendance')
    .upsert(rows, { onConflict: 'student_id,date', ignoreDuplicates: false });
  if (error) throw error;
}

export async function fetchTeacherHomework(
  schoolId: string,
  classId?: string | null
): Promise<HomeworkAssignment[]> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  const teacherIds = await resolveTeacherIds(resolvedId);
  if (teacherIds.length === 0) return [];

  const { data: classes } = await supabase
    .from('school_classes')
    .select('id, name')
    .eq('school_id', resolvedId)
    .in('teacher_id', teacherIds)
    .in('status', ['active', 'Active']);

  const classMap: Record<string, string> = {};
  (classes || []).forEach((c) => { classMap[c.id] = c.name; });
  const classIds = Object.keys(classMap);
  if (classIds.length === 0) return [];

  const targetIds = classId ? [classId] : classIds;

  const { data: assignments, error } = await supabase
    .from('school_homework_assignments')
    .select('id, title, subject, description, due_date, is_active, class_id')
    .eq('school_id', resolvedId)
    .in('class_id', targetIds)
    .order('due_date', { ascending: false });
  if (error) throw error;
  if (!assignments || assignments.length === 0) return [];

  const assignmentIds = assignments.map((a) => a.id);
  const { data: submissions } = await supabase
    .from('school_homework_submissions')
    .select('assignment_id, status')
    .eq('school_id', resolvedId)
    .in('assignment_id', assignmentIds);

  const submissionMap: Record<string, number> = {};
  (submissions || []).forEach((s) => {
    if (s.status === 'submitted' || s.status === 'graded')
      submissionMap[s.assignment_id] = (submissionMap[s.assignment_id] || 0) + 1;
  });

  const { data: studentCounts } = await supabase
    .from('school_students')
    .select('class_id')
    .in('class_id', classIds)
    .in('status', ['active', 'Active']);
  const studentCountMap: Record<string, number> = {};
  (studentCounts || []).forEach((s) => { studentCountMap[s.class_id] = (studentCountMap[s.class_id] || 0) + 1; });

  const today = new Date().toISOString().split('T')[0];
  return assignments.map((a) => ({
    id: a.id,
    title: a.title,
    subject: a.subject,
    description: a.description,
    due_date: a.due_date,
    is_active: a.is_active,
    is_past_due: a.due_date < today,
    class_id: a.class_id,
    class_name: classMap[a.class_id] || 'Unknown',
    submission_count: submissionMap[a.id] || 0,
    student_count: studentCountMap[a.class_id] || 0,
  }));
}

export async function fetchHomeworkSubmissions(
  schoolId: string,
  classId: string,
  date: string
): Promise<HomeworkSubmissionsResponse> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return { assignments: [], submissions: {} };

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const { data: assignments, error } = await supabase
    .from('school_homework_assignments')
    .select('id, title, subject, due_date')
    .eq('school_id', resolvedId)
    .eq('class_id', classId)
    .eq('is_active', true)
    .gte('due_date', sevenDaysAgo)
    .order('due_date', { ascending: false });
  if (error) throw error;
  if (!assignments || assignments.length === 0) return { assignments: [], submissions: {} };

  const assignmentIds = assignments.map((a) => a.id);
  const { data: studentRows } = await supabase
    .from('school_students')
    .select('id')
    .eq('class_id', classId)
    .eq('school_id', resolvedId);
  const studentIds = (studentRows || []).map((s) => s.id);
  if (studentIds.length === 0) return { assignments: assignments as HomeworkAssignment[], submissions: {} };

  const { data: subs } = await supabase
    .from('school_homework_submissions')
    .select('id, assignment_id, student_id, status')
    .in('assignment_id', assignmentIds)
    .in('student_id', studentIds);

  const submissions: Record<string, Record<string, { id: string; status: string }>> = {};
  (subs || []).forEach((s: any) => {
    if (!submissions[s.student_id]) submissions[s.student_id] = {};
    submissions[s.student_id][s.assignment_id] = { id: s.id, status: s.status };
  });

  return { assignments: assignments as HomeworkAssignment[], submissions };
}

export async function saveHomeworkSubmissions(
  schoolId: string,
  classId: string,
  noHomework: boolean,
  records: Array<{ student_id: string; assignment_id: string; status: string }>
): Promise<void> {
  if (noHomework || !records.length) return;
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) throw new Error('School not found');

  const now = new Date().toISOString();
  const VALID = new Set(['submitted', 'incomplete', 'pending', 'graded', 'late']);
  const rows = records
    .filter((r) => r.student_id && r.assignment_id && r.status && VALID.has(r.status))
    .map((r) => ({
      assignment_id: r.assignment_id,
      student_id: r.student_id,
      school_id: resolvedId,
      status: r.status,
      submitted_at: r.status === 'submitted' ? now : null,
      updated_at: now,
    }));
  if (!rows.length) return;

  const { error } = await supabase
    .from('school_homework_submissions')
    .upsert(rows, { onConflict: 'assignment_id,student_id', ignoreDuplicates: false });
  if (error) throw error;
}

export async function fetchProgressReports(
  schoolId: string,
  classId?: string | null
): Promise<ProgressReportAssessment[]> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return [];

  const teacherIds = await resolveTeacherIds(resolvedId);
  if (teacherIds.length === 0) return [];

  const { data: classes } = await supabase
    .from('school_classes')
    .select('id, name')
    .eq('school_id', resolvedId)
    .in('teacher_id', teacherIds)
    .in('status', ['active', 'Active']);

  const classMap: Record<string, string> = {};
  (classes || []).forEach((c) => { classMap[c.id] = c.name; });
  const classIds = Object.keys(classMap);
  if (classIds.length === 0) return [];

  const targetIds = classId ? [classId] : classIds;

  const { data: assessments, error } = await supabase
    .from('school_assessments')
    .select('id, title, subject_name, assessment_type, max_score, date, class_id')
    .eq('school_id', resolvedId)
    .in('class_id', targetIds)
    .order('date', { ascending: false });
  if (error) throw error;
  if (!assessments || assessments.length === 0) return [];

  const assessmentIds = assessments.map((a) => a.id);
  const { data: scores } = await supabase
    .from('school_assessment_scores')
    .select('assessment_id, student_id, score, grade_letter')
    .in('assessment_id', assessmentIds);

  const { data: students } = await supabase
    .from('school_students')
    .select('id, first_name, last_name')
    .in('class_id', targetIds);

  const studentMap: Record<string, string> = {};
  (students || []).forEach((s) => { studentMap[s.id] = `${s.first_name} ${s.last_name}`.trim(); });

  const scoresByAssessment: Record<string, any[]> = {};
  (scores || []).forEach((s) => {
    if (!scoresByAssessment[s.assessment_id]) scoresByAssessment[s.assessment_id] = [];
    scoresByAssessment[s.assessment_id].push({
      student_id: s.student_id,
      student_name: studentMap[s.student_id] || 'Unknown',
      score: s.score,
      grade_letter: s.grade_letter,
    });
  });

  return assessments.map((a) => ({
    id: a.id,
    title: a.title,
    subject_name: a.subject_name,
    assessment_type: a.assessment_type,
    max_score: a.max_score,
    date: a.date,
    class_id: a.class_id,
    class_name: classMap[a.class_id] || 'Unknown',
    scores: (scoresByAssessment[a.id] || []).sort((x, y) => x.student_name.localeCompare(y.student_name)),
  }));
}

export async function fetchClassSchedule(classId: string): Promise<ScheduleSlot[]> {
  const { data } = await supabase
    .from('class_schedules')
    .select('id, class_id, day_of_week, start_time, end_time, subject_or_slot_name, room_number')
    .eq('class_id', classId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });
  return data ?? [];
}

export async function fetchStudentDetail(
  studentId: string,
  schoolId: string
): Promise<StudentDetailResponse | null> {
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return null;

  const { data } = await supabase
    .from('school_students')
    .select('id, first_name, last_name, student_number, date_of_birth, gender, status, parent_name, parent_email, parent_phone, class_id, school_classes(name)')
    .eq('id', studentId)
    .eq('school_id', resolvedId)
    .maybeSingle();

  if (!data) return null;
  return {
    ...data,
    class: (data as any).school_classes ? { name: (data as any).school_classes.name } : undefined,
  };
}

export async function fetchStudentAttendance(
  studentId: string,
  schoolId: string,
  period: '1m' | '3m' | '6m' | '12m'
): Promise<StudentAttendanceSummary> {
  const empty = { total: 0, present: 0, absent: 0, late: 0, percentage: 0 };
  const resolvedId = await resolveSchoolId(schoolId);
  if (!resolvedId) return empty;

  const months = { '1m': 1, '3m': 3, '6m': 6, '12m': 12 }[period];
  const since = new Date();
  since.setMonth(since.getMonth() - months);
  const sinceStr = since.toISOString().split('T')[0];

  const { data } = await supabase
    .from('school_attendance')
    .select('status')
    .eq('student_id', studentId)
    .eq('school_id', resolvedId)
    .gte('date', sinceStr);

  if (!data || data.length === 0) return empty;
  const total = data.length;
  const present = data.filter((r) => r.status === 'present').length;
  const absent = data.filter((r) => r.status === 'absent').length;
  const late = data.filter((r) => r.status === 'late').length;
  return { total, present, absent, late, percentage: Math.round((present / total) * 100) };
}
