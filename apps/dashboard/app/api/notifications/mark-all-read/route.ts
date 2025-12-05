import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { schoolId, role, userAuthId } = body;

    if (!userAuthId || !schoolId) {
      return NextResponse.json(
        { success: false, error: 'userAuthId and schoolId are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', userAuthId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ success: false, error: 'user_not_found' }, { status: 404 });
    }

    // Build update query
    let query = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('recipient_user_id', profile.id)
      .eq('school_id', schoolId)
      .eq('is_read', false);

    // Filter by role if provided
    if (role) {
      query = query.eq('recipient_role', role);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking all notifications as read:', error);
      return NextResponse.json({ success: false, error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark all read API error:', error);
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}
