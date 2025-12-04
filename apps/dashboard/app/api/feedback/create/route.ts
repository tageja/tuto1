import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';
import { CreateFeedbackSchema } from '../../../../../../packages/schemas/src/feedback';

/**
 * Create Feedback API Route
 * 
 * POST /api/feedback/create
 * 
 * Creates a new feedback submission from a parent
 * Requires Bearer token in Authorization header
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = CreateFeedbackSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { schoolId: schoolIdentifier, studentId, category, title, description } = validation.data;

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

    // Get user profile to find parent_id
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
        { success: false, error: 'Only parents can create feedback' },
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

    // Verify student belongs to parent and school
    const { data: studentCheck } = await supabase
      .from('school_parent_students')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('parent_user_id', userProfile.id)
      .eq('student_id', studentId)
      .single();

    if (!studentCheck) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not associated with parent' },
        { status: 403 }
      );
    }

    // Generate feedback code
    const { data: codeData, error: codeError } = await supabase.rpc('get_feedback_code');
    if (codeError) {
      console.error('Error generating feedback code:', codeError);
      return NextResponse.json(
        { success: false, error: 'Failed to generate feedback code' },
        { status: 500 }
      );
    }
    
    const feedbackCode = codeData || `FB-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;

    // Calculate deadline (7 days from now)
    const deadlineAt = new Date();
    deadlineAt.setDate(deadlineAt.getDate() + 7);

    // Insert feedback
    const { data: feedback, error: insertError } = await supabase
      .from('feedbacks')
      .insert({
        school_id: schoolId,
        student_id: studentId,
        parent_id: userProfile.id,
        code: feedbackCode,
        category,
        title,
        description,
        status: 'open',
        deadline_at: deadlineAt.toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating feedback:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create feedback', message: insertError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    console.error('Error in POST /api/feedback/create:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

