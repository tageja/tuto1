import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createNotification } from '../../../../lib/notifications.server';

/**
 * GET /api/school/announcements
 * Fetch announcements for a school with filters
 * Query params: schoolId (required), status?, priority?, q? (search), tab?, id?
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const q = searchParams.get('q'); // search query
    const tab = searchParams.get('tab');
    const id = searchParams.get('id'); // specific announcement deep link

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Auto-archive expired announcements
    await supabase
      .from('school_announcements')
      .update({ status: 'Archived' })
      .eq('school_id', schoolId)
      .eq('status', 'Published')
      .not('expires_at', 'is', null)
      .lte('expires_at', new Date().toISOString());

    // Build query
    let query = supabase
      .from('school_announcements')
      .select('*')
      .eq('school_id', schoolId);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply tab-based filters (for parent view)
    if (tab) {
      if (tab === 'active' || tab === 'all') {
        query = query
          .eq('status', 'Published')
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      } else if (tab === 'urgent') {
        query = query
          .eq('status', 'Published')
          .eq('priority', 'Urgent')
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      } else if (tab === 'expired') {
        query = query
          .eq('status', 'Published')
          .lte('expires_at', new Date().toISOString());
      }
    }

    // Apply priority filter
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
    }

    // If specific ID requested (deep link)
    if (id) {
      query = query.eq('id', id);
    }

    // Sort: Urgent first, then by published_at desc
    query = query.order('priority', { ascending: false }).order('published_at', { ascending: false, nullsFirst: false });

    const { data: announcements, error } = await query;

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: announcements || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/school/announcements
 * Create a new announcement
 * Body: { school_id, title, body, category?, priority, status, target_scope, class_ids?, expires_at?, created_by }
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();
    
    const body = await request.json();
    const {
      school_id,
      title,
      body: announcementBody,
      category,
      priority = 'Normal',
      status = 'Draft',
      target_scope = 'School',
      class_ids,
      expires_at,
      created_by,
    } = body;

    // Validation
    if (!school_id || !title || !announcementBody) {
      return NextResponse.json(
        { error: 'School ID, title, and body are required' },
        { status: 400 }
      );
    }

    if (target_scope === 'Classes' && (!class_ids || class_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Class IDs are required when target scope is Classes' },
        { status: 400 }
      );
    }

    // Prepare announcement data
    const announcementData: any = {
      school_id,
      title,
      body: announcementBody,
      category,
      priority,
      status,
      target_scope,
      class_ids: target_scope === 'Classes' ? class_ids : null,
      expires_at: expires_at || null,
      created_by: created_by || null,
    };

    // If publishing immediately, set published_at
    if (status === 'Published') {
      announcementData.published_at = new Date().toISOString();
    }

    // Insert announcement
    const { data: announcement, error } = await supabase
      .from('school_announcements')
      .insert([announcementData])
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      );
    }

    // If published, create notifications for parents and admins
    if (status === 'Published') {
      try {
        // Get all parents in the school (or specific classes)
        let parentQuery = supabase
          .from('school_parent_students')
          .select('parent_user_id')
          .eq('school_id', school_id);
        
        // If announcement is class-specific, filter by class_ids
        if (target_scope === 'Classes' && class_ids && class_ids.length > 0) {
          // Get student IDs in those classes
          const { data: studentsInClasses } = await supabase
            .from('school_students')
            .select('id')
            .eq('school_id', school_id)
            .in('class_id', class_ids);
          
          if (studentsInClasses && studentsInClasses.length > 0) {
            const studentIds = studentsInClasses.map(s => s.id);
            parentQuery = parentQuery.in('student_id', studentIds);
          } else {
            // No students in those classes, skip parent notifications
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
              schoolId: school_id,
              recipientUserId: parentUserId,
              recipientRole: 'parent',
              type: 'announcement',
              priority: priority === 'Urgent' ? 'urgent' : 'normal',
              title: title,
              body: announcementBody.substring(0, 150) + (announcementBody.length > 150 ? '...' : ''),
              targetType: 'announcement',
              targetId: announcement.id,
              meta: {
                category,
                priority,
                target_scope,
                class_ids: target_scope === 'Classes' ? class_ids : null,
              },
            });
          } catch (notifError) {
            console.error('Failed to create notification for parent:', parentUserId, notifError);
          }
        });

        await Promise.allSettled(notificationPromises);
        console.log('✅ Announcement notifications created for', parentUserIds.size, 'parents');

        // Also notify admins about the new announcement
        const { data: adminUsers } = await supabase
          .from('school_users')
          .select('user_id')
          .eq('school_id', school_id)
          .in('role', ['admin', 'teacher']);

        if (adminUsers && adminUsers.length > 0) {
          const adminNotificationPromises = adminUsers.map(async (admin) => {
            try {
              await createNotification({
                supabase,
                schoolId: school_id,
                recipientUserId: admin.user_id,
                recipientRole: 'admin',
                type: 'announcement',
                priority: priority === 'Urgent' ? 'urgent' : 'normal',
                title: `New Announcement: ${title}`,
                body: `Announcement published${target_scope === 'Classes' ? ' to specific classes' : ' to all parents'}`,
                targetType: 'announcement',
                targetId: announcement.id,
                meta: {
                  category,
                  priority,
                  target_scope,
                  class_ids: target_scope === 'Classes' ? class_ids : null,
                },
              });
            } catch (notifError) {
              console.error('Failed to create notification for admin:', admin.user_id, notifError);
            }
          });

          await Promise.allSettled(adminNotificationPromises);
          console.log('✅ Announcement notifications created for', adminUsers.length, 'admins');
        }
      } catch (notifError) {
        // Don't fail the request if notifications fail
        console.error('Error creating announcement notifications:', notifError);
      }
    }

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

