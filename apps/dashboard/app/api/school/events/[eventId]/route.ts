import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * Event Detail API Route
 * 
 * GET    /api/school/events/[eventId]
 * PATCH  /api/school/events/[eventId] (admin only)
 * DELETE /api/school/events/[eventId] (admin only)
 */

/**
 * Get single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const role = searchParams.get('role') || 'admin';

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Build query
    let query = supabase
      .from('school_events')
      .select('*')
      .eq('id', eventId)
      .single();

    // If parent, only show published events
    if (role === 'parent') {
      query = query.eq('status', 'published');
    }

    const { data: event, error } = await query;

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { success: false, error: 'Event not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching event:', error);
      throw error;
    }

    // Get registration stats
    const { count: registeredCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'registered');

    const { count: waitlistedCount } = await supabase
      .from('event_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('event_id', eventId)
      .eq('status', 'waitlisted');

    const registered = registeredCount || 0;
    const waitlisted = waitlistedCount || 0;
    const isFull = event.capacity ? registered >= event.capacity : false;
    const availableSpots = event.capacity ? Math.max(0, event.capacity - registered) : null;

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        registered_count: registered,
        waitlisted_count: waitlisted,
        is_full: isFull,
        available_spots: availableSpots,
      },
    });
  } catch (error: any) {
    console.error('Error in event detail API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update event (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const body = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get current event to check status change
    const { data: currentEvent } = await supabase
      .from('school_events')
      .select('status, school_id, title, description, class_id')
      .eq('id', eventId)
      .single();

    if (!currentEvent) {
      return NextResponse.json(
        { success: false, error: 'Event not found' },
        { status: 404 }
      );
    }

    // Build update object (only include provided fields)
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.category !== undefined) updateData.category = body.category;
    if (body.class_id !== undefined) updateData.class_id = body.class_id;
    if (body.starts_at !== undefined) updateData.starts_at = body.starts_at;
    if (body.ends_at !== undefined) updateData.ends_at = body.ends_at;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.capacity !== undefined) updateData.capacity = body.capacity;
    if (body.parent_note !== undefined) updateData.parent_note = body.parent_note;

    // Validate category if provided
    if (body.category) {
      const validCategories = ['school', 'class', 'competition', 'workshop', 'outing', 'practice', 'celebration'];
      if (!validCategories.includes(body.category)) {
        return NextResponse.json(
          { success: false, error: 'Invalid category' },
          { status: 400 }
        );
      }
    }

    // Validate status if provided
    if (body.status) {
      const validStatuses = ['draft', 'published', 'completed', 'cancelled'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: 'Invalid status' },
          { status: 400 }
        );
      }
    }

    // Update event
    const { data: updatedEvent, error } = await supabase
      .from('school_events')
      .update(updateData)
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Error updating event:', error);
      throw error;
    }

    // If status changed to 'published', create notification
    if (body.status === 'published' && currentEvent.status !== 'published') {
      const audienceScope = updatedEvent.class_id ? 'Classes' : 'School';
      const classIds = updatedEvent.class_id ? [updatedEvent.class_id] : null;

      await supabase.from('school_notifications').insert([
        {
          school_id: updatedEvent.school_id,
          type: 'event',
          ref_id: updatedEvent.id,
          title: updatedEvent.title,
          message: updatedEvent.description || null,
          audience_scope: audienceScope,
          class_ids: classIds,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Delete event (admin only)
 */
export async function DELETE(
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

    // Delete event (cascade will delete registrations)
    const { error } = await supabase
      .from('school_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: 'Event deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}


