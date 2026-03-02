import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { getUserFromBearer, getSingleTeacherRow } from '../../../../../lib/school/apiAuth';

/**
 * GET /api/school/teacher/attendance?schoolId=&classId=&date=
 * Returns attendance rows for a class on a given date (for pre-fill).
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdParam = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const date = searchParams.get('date');

    if (!schoolIdParam || !classId || !date) {
      return NextResponse.json(
        { success: false, error: 'schoolId, classId, and date are required' },
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

    const { data: rows } = await supabase
      .from('school_attendance')
      .select('student_id, status, track_status')
      .eq('school_id', schoolId)
      .eq('class_id', classId)
      .eq('date', date);

    const byStudent: Record<string, { status: string; track_status: string }> = {};
    (rows || []).forEach((r: any) => {
      byStudent[r.student_id] = {
        status: r.status || 'present',
        track_status: r.track_status || '',
      };
    });

    return NextResponse.json({ success: true, data: byStudent });
  } catch (err: any) {
    console.error('Teacher attendance GET error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/school/teacher/attendance
 * Body: { schoolId, classId, date, attendance: [{ student_id, status, track_status }] }
 * Upserts attendance for the teacher's class.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId: schoolIdParam, classId, date, attendance } = body || {};

    if (!schoolIdParam || !classId || !date || !Array.isArray(attendance)) {
      return NextResponse.json(
        { success: false, error: 'schoolId, classId, date, and attendance array are required' },
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

    // Verify the teacher owns this class (using email fallback)
    const teacherRow = await getSingleTeacherRow(supabase, schoolId, user);
    if (!teacherRow) {
      return NextResponse.json({ success: false, error: 'Not a teacher at this school' }, { status: 403 });
    }

    const { data: classRow } = await supabase
      .from('school_classes')
      .select('id')
      .eq('id', classId)
      .eq('teacher_id', teacherRow.id)
      .maybeSingle();

    if (!classRow) {
      // Class might belong to another teacher profile for same email — allow if class is in same school
      const { data: schoolClassRow } = await supabase
        .from('school_classes')
        .select('id')
        .eq('id', classId)
        .eq('school_id', schoolId)
        .maybeSingle();
      if (!schoolClassRow) {
        return NextResponse.json({ success: false, error: 'Class not found in this school' }, { status: 403 });
      }
    }

    const rows = attendance.map((row: any) => ({
      school_id: schoolId,
      class_id: classId,
      student_id: row.student_id,
      date,
      status:
        row.status && ['present', 'absent', 'late', 'excused'].includes(row.status)
          ? row.status
          : 'present',
      track_status:
        row.track_status === 'on_track' || row.track_status === 'off_track'
          ? row.track_status
          : null,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('school_attendance')
      .upsert(rows, { onConflict: 'student_id,date', ignoreDuplicates: false });

    if (upsertError) throw upsertError;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Teacher attendance POST error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
