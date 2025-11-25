import { NextRequest, NextResponse } from 'next/server';
import { createAuthenticatedSupabaseClient, createServerSupabaseClient } from '../../../../../../lib/supabase';

/**
 * Register a student for an event (parent only)
 * POST /api/school/events/[eventId]/register
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

    console.log('🔑 Auth header check:', { 
      hasAuthHeader: !!authHeader,
      hasToken: !!accessToken 
    });

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
    
    console.log('🔐 Auth check:', { 
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

    // Get event
    const { data: event, error: eventError } = await supabase
      .from('school_events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if event is published
    if (event.status !== 'published') {
      return NextResponse.json(
        { success: false, error: 'Event is not published' },
        { status: 400 }
      );
    }

    // Verify student belongs to parent
    const { data: parentStudent } = await supabase
      .from('school_parent_students')
      .select('*')
      .eq('parent_user_id', userData.id)
      .eq('student_id', studentId)
      .eq('school_id', event.school_id)
      .single();

    if (!parentStudent) {
      return NextResponse.json(
        { success: false, error: 'Student not found or not linked to parent' },
        { status: 403 }
      );
    }

    // Check if already registered
    const { data: existingReg } = await supabase
      .from('event_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('student_id', studentId)
      .in('status', ['registered', 'waitlisted'])
      .single();

    if (existingReg) {
      return NextResponse.json(
        { success: false, error: 'Student is already registered or waitlisted' },
        { status: 400 }
      );
    }

    // Check capacity
    const { count: registeredCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered');

    const registered = registeredCount || 0;
    const isFull = event.capacity ? registered >= event.capacity : false;
    const registrationStatus = isFull ? 'waitlisted' : 'registered';

    // Insert registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        school_id: event.school_id,
        event_id: eventId,
        student_id: studentId,
        parent_user_id: userData.id,
        status: registrationStatus,
      })
      .select()
      .single();

    if (regError) {
      console.error('Error creating registration:', regError);
      throw regError;
    }

    // Create notification (optional - only for registered, not waitlisted)
    if (registrationStatus === 'registered') {
      // Note: Individual registration notifications are typically not needed
      // as event publish notifications already cover this
      // This is kept for potential future use
    }

    return NextResponse.json({
      success: true,
      data: registration,
      status: registrationStatus,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in register API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

