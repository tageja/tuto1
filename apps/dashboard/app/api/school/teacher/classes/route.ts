import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { getUserFromBearer, getTeacherIds } from '../../../../../lib/school/apiAuth';

/**
 * GET /api/school/teacher/classes?schoolId=xxx
 * Returns classes assigned to the current teacher.
 * Auth: Authorization: Bearer <token> (session stored in localStorage, not cookies).
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
      return NextResponse.json({ success: true, data: { records: [], total: 0 } });
    }

    const { data: classes, error } = await supabase
      .from('school_classes')
      .select('*')
      .eq('school_id', schoolId)
      .in('teacher_id', teacherIds)
      .in('status', ['active', 'Active'])
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Teacher classes query error:', error);
      throw error;
    }

    const records = (classes || []).map((c) => ({
      id: c.id,
      name: c.name,
      grade_level: c.grade_level,
      room_number: c.room_number,
      capacity: c.capacity,
      status: c.status,
      school_id: c.school_id,
      teacher_id: c.teacher_id,
    }));

    return NextResponse.json({ success: true, data: { records, total: records.length } });
  } catch (err: any) {
    console.error('Teacher classes API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
