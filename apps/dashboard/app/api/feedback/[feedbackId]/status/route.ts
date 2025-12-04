import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { UpdateFeedbackStatusSchema } from '../../../../../../../packages/schemas/src/feedback';

/**
 * Update Feedback Status API Route
 * 
 * POST /api/feedback/[feedbackId]/status
 * 
 * Updates feedback status (parent or admin can close)
 * Requires Bearer token in Authorization header
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const { feedbackId } = await params;
    const body = await request.json();

    // Validate input
    const validation = UpdateFeedbackStatusSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { status: newStatus } = validation.data;

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

    // Get feedback to verify access
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedbacks')
      .select('id, parent_id, school_id, status')
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Verify access: parent can close their own feedback, admin can close any feedback in their school
    const isParent = userProfile.role === 'parent' && feedback.parent_id === userProfile.id;
    const isAdmin = (userProfile.role === 'admin' || userProfile.role === 'school_admin');

    if (!isParent && !isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update status
    const { data: updatedFeedback, error: updateError } = await supabase
      .from('feedbacks')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', feedbackId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating feedback status:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update status', message: updateError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedFeedback,
    });
  } catch (error: any) {
    console.error('Error in POST /api/feedback/[feedbackId]/status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

