import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAuthenticatedSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Get Students for Feedback API Route
 * 
 * GET /api/feedback/students?schoolId=X
 * 
 * Returns students that the parent can create feedback for.
 * Only returns the authenticated parent's children via school_parent_students mapping.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolIdentifier = searchParams.get('schoolId');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create service client for database operations
    const serviceClient = createServerSupabaseClient();

    // Resolve school ID (handle both UUID and slug)
    const schoolId = await resolveSchoolId(serviceClient, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Get authenticated user from session
    const authClient = await createAuthenticatedSupabaseClient(request);
    const { data: { user }, error: authError } = await authClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get user's database ID from users table
    const { data: userData, error: userError } = await serviceClient
      .from('users')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json(
        { success: false, error: 'User not found in database' },
        { status: 404 }
      );
    }

    // Fetch only this parent's children via school_parent_students mapping
    const { data: mappings, error: mappingsError } = await serviceClient
      .from('school_parent_students')
      .select(`
        student_id,
        school_students!inner (
          id,
          first_name,
          last_name,
          student_number
        )
      `)
      .eq('school_id', schoolId)
      .eq('parent_user_id', userData.id);

    if (mappingsError) {
      console.error('Error fetching parent-student mappings:', mappingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch children' },
        { status: 500 }
      );
    }

    // Transform mappings to student list
    const students = (mappings || []).map((m: any) => ({
      id: m.school_students.id,
      first_name: m.school_students.first_name,
      last_name: m.school_students.last_name,
      student_number: m.school_students.student_number,
    }));

    return NextResponse.json({ 
      success: true, 
      data: students
    });
  } catch (error) {
    console.error('Error in feedback students API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
