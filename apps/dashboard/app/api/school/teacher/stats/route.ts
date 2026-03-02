import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { getUserFromBearer, getTeacherIds } from '../../../../../lib/school/apiAuth';

/**
 * GET /api/school/teacher/stats?schoolId=xxx
 * Returns KPIs for the current teacher: classes, students, today attendance rate, homework pending.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    if (!schoolIdentifier) {
      return NextResponse.json({ success: false, error: 'schoolId is required' }, { status: 400 });
    }

    const user = await getUserFromBearer(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 });
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    const teacherIds = await getTeacherIds(supabase, schoolId, user);
    if (teacherIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: { classesCount: 0, studentsCount: 0, todayAttendanceRate: null, homeworkPending: 0 },
      });
    }

    // Classes assigned to this teacher
    const { data: classes } = await supabase
      .from('school_classes')
      .select('id')
      .eq('school_id', schoolId)
      .in('teacher_id', teacherIds)
      .in('status', ['active', 'Active']);
    const classIds = (classes || []).map((c) => c.id);

    // Student count
    let studentsCount = 0;
    if (classIds.length > 0) {
      const { count } = await supabase
        .from('school_students')
        .select('*', { count: 'exact', head: true })
        .in('class_id', classIds)
        .in('status', ['active', 'Active']);
      studentsCount = count ?? 0;
    }

    // Today's attendance rate (present / total marked today)
    let todayAttendanceRate: number | null = null;
    if (classIds.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const { data: todayAttendance } = await supabase
        .from('school_attendance')
        .select('status')
        .eq('school_id', schoolId)
        .in('class_id', classIds)
        .eq('date', today);
      if (todayAttendance && todayAttendance.length > 0) {
        const present = todayAttendance.filter((r) => r.status === 'present').length;
        todayAttendanceRate = Math.round((present / todayAttendance.length) * 100);
      }
    }

    // Active homework assignments for teacher's classes
    let homeworkPending = 0;
    if (classIds.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const { count } = await supabase
        .from('school_homework_assignments')
        .select('*', { count: 'exact', head: true })
        .eq('school_id', schoolId)
        .in('class_id', classIds)
        .eq('is_active', true)
        .gte('due_date', today);
      homeworkPending = count ?? 0;
    }

    return NextResponse.json({
      success: true,
      data: {
        classesCount: classIds.length,
        studentsCount,
        todayAttendanceRate,
        homeworkPending,
      },
    });
  } catch (err: any) {
    console.error('Teacher stats API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
