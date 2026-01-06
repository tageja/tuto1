import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { createNotification } from '../../../../../lib/notifications.server';

/**
 * Notifications API Route
 * 
 * POST /api/school/[schoolId]/notifications
 * 
 * Creates notification rows for medicine reminders and logs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdParam } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);
    const requestBody = await request.json();

    const {
      user_ids,
      type,
      payload,
      title,
      body: notificationBody,
      recipient_role,
      priority,
      target_type,
      target_id,
    } = requestBody;

    if (!schoolIdentifier || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !type) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_ids (array), type' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Create notifications for each user using the createNotification helper
    const notificationPromises = user_ids.map(async (user_id: string) => {
      try {
        // Determine recipient role - default to parent if not specified
        let role: 'parent' | 'admin' = recipient_role || 'parent';
        
        // Get user's role from school_users if not provided
        if (!recipient_role) {
          const { data: schoolUser } = await supabase
            .from('school_users')
            .select('role')
            .eq('school_id', schoolId)
            .eq('user_id', user_id)
            .single();
          
          if (schoolUser?.role) {
            const userRole = schoolUser.role.toLowerCase();
            if (userRole === 'admin' || userRole === 'teacher') {
              role = 'admin';
            }
          }
        }

        return await createNotification({
          supabase,
          schoolId: schoolId,
          recipientUserId: user_id,
          recipientRole: role,
          type: type as any, // notification_type enum
          priority: priority || 'urgent', // Medicine reminders are urgent
          title: title || 'Medicine Reminder',
          body: notificationBody || (payload?.message || 'Medicine reminder notification'),
          targetType: target_type || 'medicine',
          targetId: target_id || payload?.reminder_id || null,
          meta: payload || {},
        });
      } catch (notifError) {
        console.error('Failed to create notification for user:', user_id, notifError);
        return null;
      }
    });

    const results = await Promise.allSettled(notificationPromises);
    const createdNotifications = results
      .filter((r) => r.status === 'fulfilled' && r.value !== null)
      .map((r) => (r as PromiseFulfilledResult<any>).value);

    if (createdNotifications.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Failed to create any notifications' },
        { status: 500 }
      );
    }

    console.log('✅ Medicine notifications created:', createdNotifications.length);

    return NextResponse.json({
      success: true,
      data: createdNotifications,
    });
  } catch (error: any) {
    console.error('Error creating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notifications', message: error.message },
      { status: 500 }
    );
  }
}


