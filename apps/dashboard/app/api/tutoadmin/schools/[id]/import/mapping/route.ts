import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../../lib/school/resolveSchoolId';
import { verifyTutoAdmin } from '../../../../../../../lib/tutoadmin-auth';
import type { ImportEntity, ColumnMapping } from '../../../../../../../lib/school/import/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) return authResult.response;

    const { id: schoolIdentifier } = await params;
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

    const { data, error } = await supabase
      .from('school_import_mappings')
      .select('mapping_json')
      .eq('school_id', schoolId)
      .eq('entity', entity)
      .maybeSingle();

    if (error) throw error;

    const mapping = (data?.mapping_json as ColumnMapping) || {};

    return NextResponse.json({
      success: true,
      data: { mapping },
    });
  } catch (error: any) {
    console.error('TutoAdmin import mapping GET error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to load mapping' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) return authResult.response;

    const { id: schoolIdentifier } = await params;

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json({ success: false, error: 'School not found' }, { status: 404 });
    }

    const body = await request.json();
    const { entity, mapping } = body as { entity: ImportEntity; mapping: ColumnMapping };

    if (!entity || !['teachers', 'classes', 'students'].includes(entity)) {
      return NextResponse.json(
        { success: false, error: 'Valid entity is required' },
        { status: 400 }
      );
    }
    if (!mapping || typeof mapping !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Mapping object is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('school_import_mappings')
      .upsert(
        {
          school_id: schoolId,
          entity,
          mapping_json: mapping,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'school_id,entity' }
      );

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: { saved: true },
    });
  } catch (error: any) {
    console.error('TutoAdmin import mapping POST error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save mapping' },
      { status: 500 }
    );
  }
}
