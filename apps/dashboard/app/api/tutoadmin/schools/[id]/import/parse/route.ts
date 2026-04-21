import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../../lib/school/resolveSchoolId';
import { parseFile, getSampleRows } from '../../../../../../../lib/school/import/parser';
import { verifyTutoAdmin } from '../../../../../../../lib/tutoadmin-auth';
import type { ImportEntity } from '../../../../../../../lib/school/import/types';

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

    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const entity = formData.get('entity') as ImportEntity | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file uploaded' },
        { status: 400 }
      );
    }
    if (!entity || !['teachers', 'classes', 'students'].includes(entity)) {
      return NextResponse.json(
        { success: false, error: 'Valid entity (teachers|classes|students) is required' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const result = parseFile(buffer, file.name);
    const sampleRows = getSampleRows(result.rows, 10);

    return NextResponse.json({
      success: true,
      data: {
        headers: result.headers,
        rows: result.rows,
        rowCount: result.rowCount,
        sampleRows,
      },
    });
  } catch (error: any) {
    console.error('TutoAdmin import parse error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to parse file' },
      { status: 500 }
    );
  }
}
