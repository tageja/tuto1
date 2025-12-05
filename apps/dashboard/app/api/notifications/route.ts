import { NextRequest, NextResponse } from 'next/server';
import { NotificationPriority } from '@tuto/shared';
import { createServerSupabaseClient } from '../../../lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');
    const userAuthId = searchParams.get('userAuthId');
    const role = searchParams.get('role');
    const priority = searchParams.get('priority') as NotificationPriority | null;
    const onlyUnread = searchParams.get('onlyUnread') === 'true';
    const limit = Number(searchParams.get('limit') || '50');

    if (!schoolId || !userAuthId) {
      return NextResponse.json(
        { success: false, error: 'schoolId and userAuthId are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get user profile by auth_user_id
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', userAuthId)
      .single();

    if (profileError || !profile) {
      console.error('User profile not found:', profileError);
      return NextResponse.json({ success: false, error: 'user_not_found' }, { status: 404 });
    }

    // Build query
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', profile.id)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    // Filter by role if provided
    if (role) {
      query = query.eq('recipient_role', role);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ success: false, error: 'fetch_failed' }, { status: 500 });
    }

    // Map to camelCase for frontend consistency
    const notifications = (data || []).map((row: any) => ({
      id: row.id,
      schoolId: row.school_id,
      recipientUserId: row.recipient_user_id,
      recipientRole: row.recipient_role,
      type: row.type,
      priority: row.priority,
      title: row.title,
      body: row.body,
      targetType: row.target_type,
      targetId: row.target_id,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at,
      meta: row.meta,
    }));

    return NextResponse.json({ success: true, data: notifications });
  } catch (error: any) {
    console.error('Notifications API error:', error);
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}
