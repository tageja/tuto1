import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';
import { applyMapping } from '../../../../../../lib/school/import/mapper';
import { validateRows } from '../../../../../../lib/school/import/validator';
import type { ImportEntity, ColumnMapping } from '../../../../../../lib/school/import/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdentifier } = await params;

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    const body = await request.json();
    const { entity, mapping, rows } = body as {
      entity: ImportEntity;
      mapping: ColumnMapping;
      rows: Record<string, string>[];
    };

    if (!entity || !['teachers', 'classes', 'students'].includes(entity)) {
      return NextResponse.json(
        { success: false, error: 'Valid entity is required' },
        { status: 400 }
      );
    }
    if (!mapping || typeof mapping !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Mapping is required' },
        { status: 400 }
      );
    }
    if (!Array.isArray(rows)) {
      return NextResponse.json(
        { success: false, error: 'Rows array is required' },
        { status: 400 }
      );
    }

    const mappedRows = applyMapping(rows, mapping);

    let existingClassNames: string[] = [];
    let existingTeacherNames: string[] = [];
    if (entity === 'students' || entity === 'classes') {
      const { data: classes } = await supabase
        .from('school_classes')
        .select('id, name')
        .eq('school_id', schoolId);
      existingClassNames = (classes || []).map((c) => c.name);
    }
    if (entity === 'students' || entity === 'classes') {
      const { data: teachers } = await supabase
        .from('school_teachers')
        .select('id, name')
        .eq('school_id', schoolId);
      existingTeacherNames = (teachers || []).map((t) => t.name);
    }

    const validation = validateRows(mappedRows, entity, {
      existingClassNames,
      existingTeacherNames,
    });

    return NextResponse.json({
      success: true,
      data: {
        valid: validation.valid,
        errors: validation.errors,
        preview: validation.preview,
        totalRows: mappedRows.length,
      },
    });
  } catch (error: any) {
    console.error('Import validate error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Validation failed' },
      { status: 500 }
    );
  }
}
