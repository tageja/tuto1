import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * Get Feedback Detail API Route (Admin)
 * 
 * GET /api/feedback/school/[feedbackId]
 * 
 * Returns feedback + all messages + student info + parent info
 * Requires Bearer token in Authorization header
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ feedbackId: string }> }
) {
  try {
    const { feedbackId } = await params;

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
        { success: false, error: 'Only admins can view feedback details' },
        { status: 403 }
      );
    }

    // Get feedback with student and parent info
    const { data: feedback, error: feedbackError } = await supabase
      .from('feedbacks')
      .select(`
        *,
        school_students!feedbacks_student_id_fkey (
          id,
          first_name,
          last_name,
          student_number
        ),
        users!feedbacks_parent_id_fkey (
          id,
          name,
          email
        )
      `)
      .eq('id', feedbackId)
      .single();

    if (feedbackError || !feedback) {
      return NextResponse.json(
        { success: false, error: 'Feedback not found' },
        { status: 404 }
      );
    }

    // Get all messages for this feedback
    const { data: messages, error: messagesError } = await supabase
      .from('feedback_messages')
      .select(`
        *,
        users!feedback_messages_sender_id_fkey (
          id,
          name
        )
      `)
      .eq('feedback_id', feedbackId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch messages', message: messagesError.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedFeedback = {
      ...feedback,
      student_name: feedback.school_students
        ? `${feedback.school_students.first_name} ${feedback.school_students.last_name}`.trim()
        : null,
      student_code: feedback.school_students?.student_number || null,
      parent_name: feedback.users?.name || null,
      parent_email: feedback.users?.email || null,
      messages: (messages || []).map((msg: any) => ({
        id: msg.id,
        sender_role: msg.sender_role,
        sender_id: msg.sender_id,
        sender_name: msg.users?.name || null,
        message: msg.message,
        created_at: msg.created_at,
      })),
    };

    return NextResponse.json({
      success: true,
      data: formattedFeedback,
    });
  } catch (error: any) {
    console.error('Error in GET /api/feedback/school/[feedbackId]:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

