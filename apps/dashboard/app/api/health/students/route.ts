import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Health Students API Route
 * 
 * GET /api/health/students?schoolId=X&classId=Y&studentId=Z&q=search
 * 
 * Returns filtered list of students with allergy/medication flags
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const q = searchParams.get('q');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Build student query
    let studentQuery = supabase
      .from('school_students')
      .select('id, first_name, last_name, class_id, school_id, status')
      .eq('school_id', schoolId)
      .ilike('status', 'active');

    if (classId) {
      studentQuery = studentQuery.eq('class_id', classId);
    }

    if (studentId) {
      studentQuery = studentQuery.eq('id', studentId);
    }

    if (q) {
      studentQuery = studentQuery.or(
        `first_name.ilike.%${q}%,last_name.ilike.%${q}%`
      );
    }

    const { data: students, error: studentsError } = await studentQuery;

    if (studentsError) {
      throw studentsError;
    }

    if (!students || students.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
      });
    }

    const studentIds = students.map(s => s.id);

    // Get allergy flags
    const { data: allergyRecords } = await supabase
      .from('health_records')
      .select('student_id')
      .in('student_id', studentIds)
      .eq('record_type', 'general')
      .eq('details->>type', 'allergy');

    const studentsWithAllergies = new Set(
      allergyRecords?.map(r => r.student_id) || []
    );

    // Get medication flags
    const { data: medicationRecords } = await supabase
      .from('health_records')
      .select('student_id')
      .in('student_id', studentIds)
      .eq('record_type', 'general')
      .eq('details->>type', 'medication');

    const studentsWithMedications = new Set(
      medicationRecords?.map(r => r.student_id) || []
    );

    // Get class names
    const classIds = [...new Set(students.map(s => s.class_id).filter(Boolean))];
    const { data: classes } = await supabase
      .from('school_classes')
      .select('id, name')
      .in('id', classIds);

    const classMap = new Map(classes?.map(c => [c.id, c.name]) || []);

    // Combine data
    const result = students.map(student => ({
      id: student.id,
      firstName: student.first_name,
      lastName: student.last_name,
      fullName: `${student.first_name} ${student.last_name}`,
      classId: student.class_id,
      className: student.class_id ? classMap.get(student.class_id) || 'N/A' : 'N/A',
      hasAllergy: studentsWithAllergies.has(student.id),
      hasMedication: studentsWithMedications.has(student.id),
    }));

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error fetching health students:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch students', message: error.message },
      { status: 500 }
    );
  }
}

