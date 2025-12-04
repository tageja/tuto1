import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Get School Feedback API Route (Admin)
 * 
 * GET /api/feedback/school?schoolId=X&category=request&status=open&search=...
 * 
 * Returns all feedback for a school with optional filters
 * Requires Bearer token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const category = searchParams.get('category');
    const status = searchParams.get('status');
    const search = searchParams.get('search');

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

    // Check if user is admin
    if (userProfile.role !== 'admin' && userProfile.role !== 'school_admin') {
      return NextResponse.json(
        { success: false, error: 'Only admins can view school feedback' },
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

    // Build query
    let query = supabase
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
        parent_id,
        school_students!feedbacks_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number
        ),
        users!feedbacks_parent_id_fkey (
          id,
          name
        )
      `)
      .eq('school_id', schoolId);

    // Apply filters
    if (category) {
      query = query.eq('category', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Search filter (code or student name)
    if (search) {
      query = query.or(`code.ilike.%${search}%,school_students.first_name.ilike.%${search}%,school_students.last_name.ilike.%${search}%`);
    }

    // Order by newest first
    query = query.order('created_at', { ascending: false });

    const { data: feedbacks, error: feedbackError } = await query;

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch feedback', message: feedbackError.message },
        { status: 500 }
      );
    }

    // Format response
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
      parent_id: fb.parent_id,
      parent_name: fb.users?.name || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedFeedbacks,
    });
  } catch (error: any) {
    console.error('Error in GET /api/feedback/school:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

