import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';
import type { ImportEntity } from '../../../../../../lib/school/import/types';

const ENTITY_TEMPLATES: Record<ImportEntity, string[]> = {
  teachers: ['name', 'email', 'phone', 'subjects', 'qualifications', 'hire_date'],
  classes: ['name', 'grade_level', 'academic_year', 'teacher_id', 'room_number', 'capacity'],
  students: [
    'first_name',
    'last_name',
    'student_number',
    'class_id',
    'date_of_birth',
    'gender',
    'parent_name',
    'parent_email',
    'parent_phone',
    'address',
  ],
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdentifier } = await params;
    const searchParams = request.nextUrl.searchParams;
    const entity = searchParams.get('entity') as ImportEntity | null;

    if (!entity || !['teachers', 'classes', 'students'].includes(entity)) {
      return NextResponse.json(
        { success: false, error: 'Valid entity (teachers|classes|students) is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    const headers = ENTITY_TEMPLATES[entity];
    const csvContent = headers.join(',');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${entity}-template.csv"`,
      },
    });
  } catch (error: any) {
    console.error('Import template error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
