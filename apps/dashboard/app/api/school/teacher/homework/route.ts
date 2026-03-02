import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { getUserFromBearer, getTeacherIds } from '../../../../../lib/school/apiAuth';

/**
 * GET /api/school/teacher/homework?schoolId=&classId=(optional)
 * Returns homework assignments for the teacher's classes with submission counts.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const filterClassId = searchParams.get('classId') || null;

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
      return NextResponse.json({ success: true, data: [] });
    }

    // Get teacher's class ids
    let classQuery = supabase
      .from('school_classes')
      .select('id, name')
      .eq('school_id', schoolId)
      .in('teacher_id', teacherIds)
      .in('status', ['active', 'Active']);

    const { data: classes } = await classQuery;
    const classMap: Record<string, string> = {};
    (classes || []).forEach((c) => { classMap[c.id] = c.name; });

    const classIds = Object.keys(classMap);
    if (classIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch homework assignments
    let hwQuery = supabase
      .from('school_homework_assignments')
      .select('id, title, subject, description, due_date, assigned_at, is_active, class_id, total_tasks')
      .eq('school_id', schoolId)
      .in('class_id', filterClassId ? [filterClassId] : classIds)
      .order('due_date', { ascending: false });

    const { data: assignments, error: hwError } = await hwQuery;
    if (hwError) throw hwError;

    if (!assignments || assignments.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // For each assignment get submission count
    const assignmentIds = assignments.map((a) => a.id);
    const { data: submissions } = await supabase
      .from('school_homework_submissions')
      .select('assignment_id, status')
      .eq('school_id', schoolId)
      .in('assignment_id', assignmentIds);

    // Count submissions per assignment
    const submissionMap: Record<string, number> = {};
    (submissions || []).forEach((s) => {
      if (!submissionMap[s.assignment_id]) submissionMap[s.assignment_id] = 0;
      if (s.status === 'submitted' || s.status === 'graded') {
        submissionMap[s.assignment_id]++;
      }
    });

    // Get student counts per class
    const { data: studentCounts } = await supabase
      .from('school_students')
      .select('class_id')
      .in('class_id', classIds)
      .in('status', ['active', 'Active']);

    const studentCountMap: Record<string, number> = {};
    (studentCounts || []).forEach((s) => {
      studentCountMap[s.class_id] = (studentCountMap[s.class_id] || 0) + 1;
    });

    const today = new Date().toISOString().split('T')[0];
    const data = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      subject: a.subject,
      description: a.description,
      due_date: a.due_date,
      assigned_at: a.assigned_at,
      is_active: a.is_active,
      is_past_due: a.due_date < today,
      class_id: a.class_id,
      class_name: classMap[a.class_id] || 'Unknown',
      submission_count: submissionMap[a.id] || 0,
      student_count: studentCountMap[a.class_id] || 0,
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Teacher homework API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
