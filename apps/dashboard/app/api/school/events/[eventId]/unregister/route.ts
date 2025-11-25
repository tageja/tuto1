import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from '../../../../../../lib/supabase';

/**
 * Unregister a student from an event (parent only)
 * POST /api/school/events/[eventId]/unregister
 * Body: { studentId }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();
    const { studentId } = body;

    if (!eventId || !studentId) {
      return NextResponse.json(
        { success: false, error: 'Event ID and student ID are required' },
        { status: 400 }
      );
    }

    // Get access token from Authorization header
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    if (!accessToken) {
      console.error('❌ No access token provided');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - No access token' },
        { status: 401 }
      );
    }

    // Use service role client to verify the token
    const supabase = createServerSupabaseClient();
    
    // Verify token and get user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(accessToken);
    
    console.log('🔐 Unregister auth check:', { 
      hasUser: !!authUser, 
      userId: authUser?.id,
      email: authUser?.email,
      authError: authError?.message 
    });
    
    if (!authUser || authError) {
      console.error('❌ Invalid or expired token');
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Invalid token' },
        { status: 401 }
      );
    }

    // Get user record
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', authUser.id)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .eq('parent_user_id', userData.id)
      .single();

    if (regError || !registration) {
      return NextResponse.json(
        { success: false, error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Get event to check capacity
    const { data: event } = await supabase
      .from('school_events')
      .select('capacity')
      .eq('id', eventId)
      .single();

    const wasRegistered = registration.status === 'registered';

    // Delete registration
    const { error: deleteError } = await supabase
      .from('event_registrations')
      .delete()
      .eq('id', registration.id);

    if (deleteError) {
      console.error('Error deleting registration:', deleteError);
      throw deleteError;
    }

    // If was registered and event has capacity, promote first waitlisted
    if (wasRegistered && event?.capacity) {
      const { data: waitlisted } = await supabase
        .from('event_registrations')
        .select('id')
        .eq('event_id', eventId)
        .eq('status', 'waitlisted')
        .order('registered_at', { ascending: true })
        .limit(1)
        .single();

      if (waitlisted) {
        await supabase
          .from('event_registrations')
          .update({ status: 'registered' })
          .eq('id', waitlisted.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Unregistered successfully',
    });
  } catch (error: any) {
    console.error('Error in unregister API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

