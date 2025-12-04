import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Get My Feedback API Route
 * 
 * GET /api/feedback/my?schoolId=X
 * 
 * Returns all feedback for the authenticated parent (all children in that school)
 * Requires Bearer token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    // Create service client
    const supabase = createServerSupabaseClient();

    // Verify token and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user profile
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError || !userProfile) {
      return NextResponse.json(
        { success: false, error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (userProfile.role !== 'parent') {
      return NextResponse.json(
        { success: false, error: 'Only parents can view their feedback' },
        { status: 403 }
      );
    }

    // Resolve school ID
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Get all feedback for this parent in this school
    const { data: feedbacks, error: feedbackError } = await supabase
      .from('feedbacks')
      .select(`
        id,
        code,
        category,
        title,
        description,
        status,
        deadline_at,
        created_at,
        updated_at,
        student_id,
        school_students!feedbacks_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number
        )
      `)
      .eq('school_id', schoolId)
      .eq('parent_id', userProfile.id)
      .order('created_at', { ascending: false });

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch feedback', message: feedbackError.message },
        { status: 500 }
      );
    }

    // Format response with student names
    const formattedFeedbacks = (feedbacks || []).map((fb: any) => ({
      id: fb.id,
      code: fb.code,
      category: fb.category,
      title: fb.title,
      description: fb.description,
      status: fb.status,
      deadline_at: fb.deadline_at,
      created_at: fb.created_at,
      updated_at: fb.updated_at,
      student_id: fb.student_id,
      student_name: fb.school_students
        ? `${fb.school_students.first_name} ${fb.school_students.last_name}`.trim()
        : null,
      student_code: fb.school_students?.student_number || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedFeedbacks,
    });
  } catch (error: any) {
    console.error('Error in GET /api/feedback/my:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

