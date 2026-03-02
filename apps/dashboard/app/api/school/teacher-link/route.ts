import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedSupabaseClient } from '../../../../lib/supabase';

/**
 * POST /api/school/teacher-link
 * Body: { code: string }
 * Links current auth user to school_teachers by school code + email (first-time teacher).
 * Requires authenticated session (RPC uses auth.uid()).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const code = body?.code && typeof body.code === 'string' ? body.code.trim() : '';

    if (!code) {
      return NextResponse.json(
        { success: false, message: 'School code is required' },
        { status: 400 }
      );
    }

    const supabase = await createAuthenticatedSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc('link_teacher_to_school', { p_code: code });

    if (error) {
      console.error('link_teacher_to_school RPC error:', error);
      return NextResponse.json(
        { success: false, message: error.message || 'Failed to link teacher' },
        { status: 400 }
      );
    }

    if (!data || !data.success) {
      return NextResponse.json(
        { success: false, message: data?.message || 'Invalid school code or email not assigned' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      school_id: data.school_id,
      school_name: data.school_name,
    });
  } catch (err: any) {
    console.error('Teacher link API error:', err);
    return NextResponse.json(
      { success: false, message: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
