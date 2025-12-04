import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { CreateFeedbackMessageSchema } from '../../../../../../../packages/schemas/src/feedback';

/**
 * Reply to Feedback API Route
 * 
 * POST /api/feedback/[feedbackId]/reply
 * 
 * Creates a reply message (parent or admin)
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
    const validation = CreateFeedbackMessageSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validation.error.errors },
        { status: 400 }
      );
    }

    const { message } = validation.data;

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

    // Determine sender role and verify access
    let senderRole: 'parent' | 'admin';
    if (userProfile.role === 'admin' || userProfile.role === 'school_admin') {
      senderRole = 'admin';
      // Admin can reply to any feedback in their school
      // Access is verified by RLS, but we can add explicit check if needed
    } else if (userProfile.role === 'parent' && feedback.parent_id === userProfile.id) {
      senderRole = 'parent';
    } else {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      );
    }

    // Insert message
    const { data: newMessage, error: insertError } = await supabase
      .from('feedback_messages')
      .insert({
        feedback_id: feedbackId,
        sender_role: senderRole,
        sender_id: userProfile.id,
        message,
      })
      .select(`
        *,
        users!feedback_messages_sender_id_fkey (
          id,
          name
        )
      `)
      .single();

    if (insertError) {
      console.error('Error creating message:', insertError);
      return NextResponse.json(
        { success: false, error: 'Failed to create message', message: insertError.message },
        { status: 500 }
      );
    }

    // Format response
    const formattedMessage = {
      id: newMessage.id,
      sender_role: newMessage.sender_role,
      sender_id: newMessage.sender_id,
      sender_name: newMessage.users?.name || null,
      message: newMessage.message,
      created_at: newMessage.created_at,
    };

    return NextResponse.json({
      success: true,
      data: formattedMessage,
    });
  } catch (error: any) {
    console.error('Error in POST /api/feedback/[feedbackId]/reply:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

