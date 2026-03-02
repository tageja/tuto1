import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { getUserFromBearer, getTeacherIds } from '../../../../../lib/school/apiAuth';

/**
 * GET /api/school/teacher/progress-reports?schoolId=&classId=(optional)
 * Returns assessments and scores for the teacher's classes.
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
    const { data: classes } = await supabase
      .from('school_classes')
      .select('id, name')
      .eq('school_id', schoolId)
      .in('teacher_id', teacherIds)
      .in('status', ['active', 'Active']);

    const classMap: Record<string, string> = {};
    (classes || []).forEach((c) => { classMap[c.id] = c.name; });
    const classIds = Object.keys(classMap);

    if (classIds.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch assessments for teacher's classes
    const targetClassIds = filterClassId ? [filterClassId] : classIds;
    const { data: assessments, error: assessError } = await supabase
      .from('school_assessments')
      .select('id, title, subject_name, assessment_type, max_score, date, class_id')
      .eq('school_id', schoolId)
      .in('class_id', targetClassIds)
      .order('date', { ascending: false });

    if (assessError) throw assessError;
    if (!assessments || assessments.length === 0) {
      return NextResponse.json({ success: true, data: [] });
    }

    // Fetch all scores for these assessments
    const assessmentIds = assessments.map((a) => a.id);
    const { data: scores } = await supabase
      .from('school_assessment_scores')
      .select('assessment_id, student_id, score, grade_letter')
      .in('assessment_id', assessmentIds);

    // Fetch student names for the relevant classes
    const { data: students } = await supabase
      .from('school_students')
      .select('id, first_name, last_name')
      .in('class_id', targetClassIds);

    const studentMap: Record<string, string> = {};
    (students || []).forEach((s) => {
      studentMap[s.id] = `${s.first_name} ${s.last_name}`.trim();
    });

    // Group scores by assessment
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

    const data = assessments.map((a) => ({
      id: a.id,
      title: a.title,
      subject_name: a.subject_name,
      assessment_type: a.assessment_type,
      max_score: a.max_score,
      date: a.date,
      class_id: a.class_id,
      class_name: classMap[a.class_id] || 'Unknown',
      scores: (scoresByAssessment[a.id] || []).sort((x, y) =>
        x.student_name.localeCompare(y.student_name)
      ),
    }));

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Teacher progress-reports API error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
