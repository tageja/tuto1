import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';
import { createNotification } from '../../../../lib/notifications.server';

/**
 * Events API Route - Uses Supabase
 * 
 * GET  /api/school/events?schoolId=X&tab=All&search=...&month=2025-01&category[]=school
 * POST /api/school/events (admin only)
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

/**
 * Get events list with filters and KPIs
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const tab = searchParams.get('tab') || 'All';
    const search = searchParams.get('search');
    const month = searchParams.get('month'); // YYYY-MM format
    const categories = searchParams.getAll('category[]');
    const role = searchParams.get('role') || 'admin'; // admin or parent

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    let supabase;
    try {
      supabase = createServerSupabaseClient();
    } catch (error: any) {
      console.error('Error creating Supabase client:', error);
      return NextResponse.json(
        { success: false, error: 'Server configuration error', message: error.message },
        { status: 500 }
      );
    }

    // Resolve school identifier (name or UUID) to UUID
    let schoolId: string | null;
    try {
      schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    } catch (error: any) {
      console.error('Error resolving school ID:', error);
      return NextResponse.json(
        { success: false, error: 'Error resolving school ID', message: error.message },
        { status: 500 }
      );
    }
    
    if (!schoolId) {
      console.error(`School not found: ${schoolIdentifier}`);
      return NextResponse.json(
        { success: false, error: `School not found: ${schoolIdentifier}` },
        { status: 404 }
      );
    }

    // Build base query - explicitly list columns to avoid schema cache issues
    let query = supabase
      .from('school_events')
      .select('id, school_id, title, description, category, class_id, starts_at, ends_at, location, status, capacity, parent_note, created_by, created_at, updated_at', { count: 'exact' })
      .eq('school_id', schoolId);

    // Role-based filtering
    if (role === 'parent') {
      // Parents can only see published events
      query = query.eq('status', 'published');
    }

    // Tab-based filtering (Admin)
    if (role === 'admin') {
      if (tab === 'School') {
        query = query.eq('category', 'school');
      } else if (tab === 'Class') {
        query = query.eq('category', 'class');
      } else if (tab === 'Competitions') {
        query = query.eq('category', 'competition');
      } else if (tab === 'Workshops') {
        query = query.eq('category', 'workshop');
      } else if (tab === 'Outing') {
        query = query.eq('category', 'outing');
      } else if (tab === 'Practice') {
        query = query.eq('category', 'practice');
      } else if (tab === 'Celebration') {
        query = query.eq('category', 'celebration');
      }
    }

    // Tab-based filtering (Parent)
    if (role === 'parent') {
      if (tab === 'Registered') {
        // Note: Parent registration filtering should be done client-side
        // as we need auth context to get parent_user_id
        // For now, return all published events and let client filter
        // This will be filtered properly when parent user context is available
      } else if (tab === 'Upcoming') {
        query = query.gte('starts_at', new Date().toISOString());
      }
    }

    // Category filter
    if (categories.length > 0) {
      query = query.in('category', categories);
    }

    // Month filter (YYYY-MM)
    if (month) {
      try {
        const [year, monthNum] = month.split('-');
        if (year && monthNum) {
          const startDate = new Date(parseInt(year), parseInt(monthNum) - 1, 1).toISOString();
          const endDate = new Date(parseInt(year), parseInt(monthNum), 0, 23, 59, 59).toISOString();
          query = query.gte('starts_at', startDate).lte('starts_at', endDate);
        }
      } catch (err) {
        console.error('Error parsing month filter:', err);
        // Continue without month filter if parsing fails
      }
    }

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    // Order by starts_at ascending
    query = query.order('starts_at', { ascending: true });

    const { data: events, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      console.error('Query details:', {
        schoolId,
        tab,
        role,
        search,
        month,
        categories,
      });
      
      // Check if it's a schema cache issue
      if (error.code === '42703' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Schema cache issue - please wait 1-2 minutes for PostgREST to refresh, or restart your Supabase project',
            message: error.message,
            code: error.code,
            hint: 'The database columns exist, but PostgREST needs to refresh its schema cache. This usually happens automatically within 1-5 minutes after migrations.'
          },
          { status: 503 } // Service Unavailable - temporary issue
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Database query failed', message: error.message, details: error },
        { status: 500 }
      );
    }

    // Get registration counts and capacity status for each event
    const eventsList = events || [];
    let eventsWithStats: any[] = [];
    
    try {
      eventsWithStats = await Promise.all(
        eventsList.map(async (event) => {
          try {
            const { count: registeredCount, error: regError } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id)
              .eq('status', 'registered');

            if (regError) {
              console.error('Error fetching registered count:', regError);
            }

            const { count: waitlistedCount, error: waitError } = await supabase
              .from('event_registrations')
              .select('*', { count: 'exact', head: true })
              .eq('event_id', event.id)
              .eq('status', 'waitlisted');

            if (waitError) {
              console.error('Error fetching waitlisted count:', waitError);
            }

            const registered = registeredCount || 0;
            const waitlisted = waitlistedCount || 0;
            const isFull = event.capacity ? registered >= event.capacity : false;
            const availableSpots = event.capacity ? Math.max(0, event.capacity - registered) : null;

            return {
              ...event,
              registered_count: registered,
              waitlisted_count: waitlisted,
              is_full: isFull,
              available_spots: availableSpots,
            };
          } catch (eventError: any) {
            console.error('Error processing event:', event.id, eventError);
            // Return event without stats if there's an error
            return {
              ...event,
              registered_count: 0,
              waitlisted_count: 0,
              is_full: false,
              available_spots: event.capacity || null,
            };
          }
        })
      );
    } catch (statsError: any) {
      console.error('Error fetching event stats:', statsError);
      // Continue with events without stats
      eventsWithStats = eventsList.map(event => ({
        ...event,
        registered_count: 0,
        waitlisted_count: 0,
        is_full: false,
        available_spots: event.capacity || null,
      }));
    }

    // Calculate KPIs
    const now = new Date().toISOString();
    const totalEvents = count || 0;
    const upcomingEvents = eventsWithStats.filter(e => e.starts_at >= now && e.status !== 'completed' && e.status !== 'cancelled').length;
    const completedEvents = eventsWithStats.filter(e => e.status === 'completed' || e.starts_at < now).length;
    const totalParticipants = eventsWithStats.reduce((sum, e) => sum + (e.registered_count || 0), 0);

    const kpis = {
      total: totalEvents,
      upcoming: upcomingEvents,
      completed: completedEvents,
      participants: totalParticipants,
    };

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📅 Found ${count || 0} events for school ${schoolId}`);
    }

    return NextResponse.json({
      success: true,
      data: eventsWithStats || [],
      kpis,
    });
  } catch (error: any) {
    console.error('Error in events API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create a new event (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.school_id || !body.title || !body.starts_at || !body.ends_at || !body.category || !body.status) {
      return NextResponse.json(
        { success: false, error: 'Required fields: school_id, title, starts_at, ends_at, category, status' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['school', 'class', 'competition', 'workshop', 'outing', 'practice', 'celebration'];
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { success: false, error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Validate status
    const validStatuses = ['draft', 'published', 'completed', 'cancelled'];
    if (!validStatuses.includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // If category is 'class', class_id is required
    if (body.category === 'class' && !body.class_id) {
      return NextResponse.json(
        { success: false, error: 'class_id is required when category is "class"' },
        { status: 400 }
      );
    }

    // Validate date range
    if (new Date(body.starts_at) >= new Date(body.ends_at)) {
      return NextResponse.json(
        { success: false, error: 'ends_at must be after starts_at' },
        { status: 400 }
      );
    }

    // Create Supabase client
    let supabase;
    try {
      supabase = createServerSupabaseClient();
    } catch (error: any) {
      console.error('Error creating Supabase client:', error);
      return NextResponse.json(
        { success: false, error: 'Server configuration error', message: error.message },
        { status: 500 }
      );
    }

    // Validate created_by - it's required
    if (!body.created_by) {
      return NextResponse.json(
        { success: false, error: 'created_by is required' },
        { status: 400 }
      );
    }

    // Verify the user exists
    const { data: userCheck } = await supabase
      .from('users')
      .select('id')
      .eq('id', body.created_by)
      .single();

    if (!userCheck) {
      return NextResponse.json(
        { success: false, error: 'Invalid created_by: user not found' },
        { status: 400 }
      );
    }

    // Insert event
    const { data: eventData, error } = await supabase
      .from('school_events')
      .insert({
        school_id: body.school_id,
        title: body.title,
        description: body.description || null,
        category: body.category,
        class_id: body.class_id || null,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
        location: body.location || null,
        status: body.status,
        capacity: body.capacity || null,
        parent_note: body.parent_note || null,
        created_by: body.created_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating event:', error);
      console.error('Event data:', {
        school_id: body.school_id,
        title: body.title,
        category: body.category,
        created_by: body.created_by,
      });
      
      // Check if it's a schema cache issue
      if (error.code === 'PGRST204' || error.message?.includes('schema cache') || error.message?.includes('Could not find')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Schema cache issue - please wait 1-2 minutes for PostgREST to refresh, or restart your Supabase project',
            message: error.message,
            code: error.code,
            hint: 'The database columns exist, but PostgREST needs to refresh its schema cache. This usually happens automatically within 1-5 minutes after migrations.'
          },
          { status: 503 } // Service Unavailable - temporary issue
        );
      }
      
      return NextResponse.json(
        { success: false, error: 'Failed to create event', message: error.message, details: error },
        { status: 500 }
      );
    }

    // If status is 'published', create notifications for parents and admins
    if (body.status === 'published') {
      try {
        // Get all parents in the school (or specific class if class event)
        let parentQuery = supabase
          .from('school_parent_students')
          .select('parent_user_id')
          .eq('school_id', body.school_id);
        
        // If event is class-specific, filter by class_id
        if (body.category === 'class' && body.class_id) {
          // Get student IDs in that class
          const { data: studentsInClass } = await supabase
            .from('school_students')
            .select('id')
            .eq('school_id', body.school_id)
            .eq('class_id', body.class_id);
          
          if (studentsInClass && studentsInClass.length > 0) {
            const studentIds = studentsInClass.map(s => s.id);
            parentQuery = parentQuery.in('student_id', studentIds);
          } else {
            // No students in that class, skip parent notifications
            parentQuery = null;
          }
        }

        // Get unique parent user IDs
        const parentUserIds = new Set<string>();
        if (parentQuery) {
          const { data: parentMappings } = await parentQuery;
          if (parentMappings) {
            parentMappings.forEach((m: any) => {
              if (m.parent_user_id) {
                parentUserIds.add(m.parent_user_id);
              }
            });
          }
        }

        // Create notifications for each parent
        const notificationPromises = Array.from(parentUserIds).map(async (parentUserId) => {
          try {
            await createNotification({
              supabase,
              schoolId: body.school_id,
              recipientUserId: parentUserId,
              recipientRole: 'parent',
              type: 'event',
              priority: 'normal',
              title: body.title,
              body: (body.description || '').substring(0, 150) + ((body.description || '').length > 150 ? '...' : ''),
              targetType: 'event',
              targetId: eventData.id,
              meta: {
                category: body.category,
                starts_at: body.starts_at,
                ends_at: body.ends_at,
                location: body.location,
                class_id: body.class_id,
              },
            });
          } catch (notifError) {
            console.error('Failed to create notification for parent:', parentUserId, notifError);
          }
        });

        await Promise.allSettled(notificationPromises);
        console.log('✅ Event notifications created for', parentUserIds.size, 'parents');

        // Also notify admins about the new event
        const { data: adminUsers } = await supabase
          .from('school_users')
          .select('user_id')
          .eq('school_id', body.school_id)
          .in('role', ['admin', 'teacher']);

        if (adminUsers && adminUsers.length > 0) {
          const adminNotificationPromises = adminUsers.map(async (admin) => {
            try {
              await createNotification({
                supabase,
                schoolId: body.school_id,
                recipientUserId: admin.user_id,
                recipientRole: 'admin',
                type: 'event',
                priority: 'normal',
                title: `New Event: ${body.title}`,
                body: `Event published${body.category === 'class' ? ' for specific class' : ' for all parents'}`,
                targetType: 'event',
                targetId: eventData.id,
                meta: {
                  category: body.category,
                  starts_at: body.starts_at,
                  ends_at: body.ends_at,
                  location: body.location,
                  class_id: body.class_id,
                },
              });
            } catch (notifError) {
              console.error('Failed to create notification for admin:', admin.user_id, notifError);
            }
          });

          await Promise.allSettled(adminNotificationPromises);
          console.log('✅ Event notifications created for', adminUsers.length, 'admins');
        }
      } catch (notifError) {
        // Don't fail the request if notifications fail
        console.error('Error creating event notifications:', notifError);
      }
    }

    return NextResponse.json({
      success: true,
      data: eventData,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

