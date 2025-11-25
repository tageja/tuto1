import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createAuthenticatedSupabaseClient } from '../../../../lib/supabase';

/**
 * Health Records API Route
 * 
 * POST /api/health/records
 * 
 * Body: { studentId, record_type, title?, details, recorded_at? }
 * 
 * Creates a health record with validation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, record_type, title, details, recorded_at } = body;

    if (!studentId || !record_type || !details) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, record_type, details' },
        { status: 400 }
      );
    }

    // Validate record_type
    const validTypes = ['general', 'vaccination', 'vitals', 'note'];
    if (!validTypes.includes(record_type)) {
      return NextResponse.json(
        { success: false, error: `Invalid record_type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get student to find school_id
    const { data: student, error: studentError } = await supabase
      .from('school_students')
      .select('school_id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get authenticated user for created_by
    let createdBy: string | null = null;
    try {
      const authSupabase = await createAuthenticatedSupabaseClient(request);
      const { data: { user } } = await authSupabase.auth.getUser();
      if (user) {
        // Get user id from users table
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        createdBy = userData?.id || null;
      }
    } catch (authError) {
      // If auth fails, continue without created_by (for service role calls)
      console.warn('Could not get authenticated user:', authError);
    }

    // Insert health record
    const { data: record, error: insertError } = await supabase
      .from('health_records')
      .insert({
        school_id: student.school_id,
        student_id: studentId,
        record_type,
        title: title || null,
        details: typeof details === 'string' ? JSON.parse(details) : details,
        recorded_at: recorded_at || new Date().toISOString(),
        created_by: createdBy,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting health record:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create health record', message: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: record,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating health record:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create health record', message: error.message },
      { status: 500 }
    );
  }
}

