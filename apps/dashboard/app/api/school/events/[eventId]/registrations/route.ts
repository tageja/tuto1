import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';

/**
 * Get registrations for an event (admin only)
 * GET /api/school/events/[eventId]/registrations
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get registrations with student and parent details
    const { data: registrations, error } = await supabase
      .from('event_registrations')
      .select(`
        *,
        student:school_students(id, first_name, last_name, student_number),
        parent:users!event_registrations_parent_user_id_fkey(id, name, email)
      `)
      .eq('event_id', eventId)
      .order('registered_at', { ascending: false });

    if (error) {
      console.error('Error fetching registrations:', error);
      throw error;
    }

    // Format response
    const formattedRegistrations = (registrations || []).map((reg: any) => ({
      id: reg.id,
      event_id: reg.event_id,
      student_id: reg.student_id,
      parent_user_id: reg.parent_user_id,
      status: reg.status,
      registered_at: reg.registered_at,
      student: reg.student ? {
        id: reg.student.id,
        name: `${reg.student.first_name} ${reg.student.last_name}`,
        student_number: reg.student.student_number,
      } : null,
      parent: reg.parent ? {
        id: reg.parent.id,
        name: reg.parent.name,
        email: reg.parent.email,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedRegistrations,
    });
  } catch (error: any) {
    console.error('Error in registrations API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

