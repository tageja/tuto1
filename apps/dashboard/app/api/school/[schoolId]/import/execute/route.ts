import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';
import { applyMapping } from '../../../../../../lib/school/import/mapper';
import { parseDate, parseSubjects } from '../../../../../../lib/school/import/mapper';
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
    let successCount = 0;
    let failedCount = 0;

    if (entity === 'teachers') {
      for (const row of mappedRows) {
        const name = String(row.name ?? '').trim();
        if (!name) {
          failedCount++;
          continue;
        }
        const hireDate = row.hire_date ? parseDate(String(row.hire_date)) : null;
        const subjects = row.subjects
          ? parseSubjects(String(row.subjects))
          : [];

        const { error } = await supabase.from('school_teachers').insert({
          school_id: schoolId,
          name,
          email: (row.email as string) || null,
          phone: (row.phone as string) || null,
          subjects: subjects.length ? subjects : null,
          qualifications: (row.qualifications as string) || null,
          hire_date: hireDate,
          status: 'active',
        });

        if (error) {
          failedCount++;
        } else {
          successCount++;
        }
      }
    } else if (entity === 'classes') {
      const { data: teachers } = await supabase
        .from('school_teachers')
        .select('id, name')
        .eq('school_id', schoolId);
      const teacherByName = new Map((teachers || []).map((t) => [t.name?.toLowerCase(), t.id]));

      for (const row of mappedRows) {
        const name = String(row.name ?? '').trim();
        if (!name) {
          failedCount++;
          continue;
        }
        const teacherName = (row.teacher_id as string)?.trim();
        const teacherId = teacherName
          ? teacherByName.get(teacherName.toLowerCase()) ?? null
          : null;

        const { error } = await supabase.from('school_classes').insert({
          school_id: schoolId,
          name,
          grade_level: (row.grade_level as string) || null,
          academic_year: (row.academic_year as string) || new Date().getFullYear().toString(),
          teacher_id: teacherId,
          room_number: (row.room_number as string) || null,
          capacity: row.capacity != null ? parseInt(String(row.capacity), 10) : null,
          status: 'active',
        });

        if (error) {
          failedCount++;
        } else {
          successCount++;
        }
      }
    } else if (entity === 'students') {
      const { data: classes } = await supabase
        .from('school_classes')
        .select('id, name')
        .eq('school_id', schoolId);
      const classByName = new Map((classes || []).map((c) => [c.name?.toLowerCase(), c.id]));

      for (const row of mappedRows) {
        const firstName = String(row.first_name ?? '').trim();
        const lastName = String(row.last_name ?? '').trim();
        const displayName = firstName || lastName || 'Unknown';
        const fn = firstName || displayName;
        const ln = lastName || displayName;

        const className = (row.class_id as string)?.trim();
        const classId = className ? classByName.get(className.toLowerCase()) ?? null : null;
        const dob = row.date_of_birth ? parseDate(String(row.date_of_birth)) : null;

        const { error } = await supabase.from('school_students').insert({
          school_id: schoolId,
          class_id: classId,
          student_number: (row.student_number as string) || null,
          first_name: fn,
          last_name: ln,
          date_of_birth: dob,
          gender: (row.gender as string) || null,
          parent_name: (row.parent_name as string) || null,
          parent_email: (row.parent_email as string) || null,
          parent_phone: (row.parent_phone as string) || null,
          address: (row.address as string) || null,
          status: 'active',
        });

        if (error) {
          failedCount++;
        } else {
          successCount++;
        }
      }
    }

    const status =
      failedCount === 0 ? 'completed' : successCount === 0 ? 'failed' : 'partial';

    await supabase.from('school_import_audit').insert({
      school_id: schoolId,
      entity,
      row_count: mappedRows.length,
      success_count: successCount,
      failed_count: failedCount,
      status,
      created_by: null,
    });

    return NextResponse.json({
      success: true,
      data: {
        successCount,
        failedCount,
        totalRows: mappedRows.length,
        status,
      },
    });
  } catch (error: any) {
    console.error('Import execute error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Import failed' },
      { status: 500 }
    );
  }
}
