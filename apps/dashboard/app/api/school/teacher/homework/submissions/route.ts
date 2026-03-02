import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';
import { getUserFromBearer, getSingleTeacherRow } from '../../../../../../lib/school/apiAuth';

/**
 * GET /api/school/teacher/homework/submissions?schoolId=&classId=&date=
 * Returns active homework assignments for a class and existing submissions per student.
 *
 * Response shape:
 * {
 *   assignments: [{ id, title, subject, due_date }],
 *   submissions: { [studentId]: { [assignmentId]: { id, status } } }
 * }
 */
export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const schoolIdParam = sp.get('schoolId');
    const classId = sp.get('classId');
    const date = sp.get('date') || new Date().toISOString().split('T')[0];

    if (!schoolIdParam || !classId) {
      return NextResponse.json(
        { success: false, error: 'schoolId and classId are required' },
        { status: 400 }
      );
    }

    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdParam);
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    // Fetch active homework assignments for this class
    // "Active" = is_active=true and due_date >= 7 days ago (to catch recently past-due)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

    const { data: assignments, error: aErr } = await supabase
      .from('school_homework_assignments')
      .select('id, title, subject, due_date')
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('is_active', true)
      .gte('due_date', sevenDaysAgo)
      .order('due_date', { ascending: false });

    if (aErr) throw aErr;

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, data: { assignments: [], submissions: {} } });
    }

    const assignmentIds = assignments.map((a: any) => a.id);

    // Fetch students in the class
    const { data: studentRows } = await supabase
      .from('school_students')
      .select('id')
      .eq('class_id', classId)
      .eq('school_id', schoolId);

    const studentIds = (studentRows || []).map((s: any) => s.id);

    if (studentIds.length === 0) {
      return NextResponse.json({ success: true, data: { assignments, submissions: {} } });
    }

    // Fetch existing submissions for these assignments + students
    const { data: subs, error: sErr } = await supabase
      .from('school_homework_submissions')
      .select('id, assignment_id, student_id, status')
      .in('assignment_id', assignmentIds)
      .in('student_id', studentIds);

    if (sErr) throw sErr;

    // Build nested map: { studentId: { assignmentId: { id, status } } }
    const submissions: Record<string, Record<string, { id: string; status: string }>> = {};
    (subs || []).forEach((s: any) => {
      if (!submissions[s.student_id]) submissions[s.student_id] = {};
      submissions[s.student_id][s.assignment_id] = { id: s.id, status: s.status };
    });

    return NextResponse.json({ success: true, data: { assignments, submissions } });
  } catch (err: any) {
    console.error('Homework submissions GET error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/school/teacher/homework/submissions
 * Body: {
 *   schoolId: string,
 *   classId: string,
 *   noHomework: boolean,
 *   records: [{ student_id, assignment_id, status: 'submitted'|'incomplete'|'' }]
 * }
 *
 * If noHomework=true → delete pending/unmarked submissions and return success.
 * Otherwise → upsert each record with the given status.
 * Empty-string status records are skipped (teacher left them as "—").
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId: schoolIdParam, classId, noHomework, records } = body || {};

    if (!schoolIdParam || !classId) {
      return NextResponse.json(
        { success: false, error: 'schoolId and classId are required' },
        { status: 400 }
      );
    }

    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdParam);
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    // Verify teacher belongs to this school
    const teacherRow = await getSingleTeacherRow(supabase, schoolId, user);
    if (!teacherRow) {
      return NextResponse.json({ success: false, error: 'Not a teacher at this school' }, { status: 403 });
    }

    if (noHomework) {
      // Teacher explicitly said no homework — nothing to save
      return NextResponse.json({ success: true });
    }

    if (!Array.isArray(records) || records.length === 0) {
      return NextResponse.json({ success: true });
    }

    const now = new Date().toISOString();
    const VALID_STATUSES = new Set(['submitted', 'incomplete', 'pending', 'graded', 'late']);

    const upsertRows = records
      .filter((r: any) => r.student_id && r.assignment_id && r.status && VALID_STATUSES.has(r.status))
      .map((r: any) => ({
        assignment_id: r.assignment_id,
        student_id: r.student_id,
        school_id: schoolId,
        status: r.status,
        submitted_at: r.status === 'submitted' ? now : null,
        updated_at: now,
      }));

    if (upsertRows.length === 0) {
      return NextResponse.json({ success: true });
    }

    const { error: upsertError } = await supabase
      .from('school_homework_submissions')
      .upsert(upsertRows, { onConflict: 'assignment_id,student_id', ignoreDuplicates: false });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true, saved: upsertRows.length });
  } catch (err: any) {
    console.error('Homework submissions POST error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
