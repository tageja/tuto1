import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, userAuthId } = body;

    if (!userAuthId || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: 'userAuthId and ids array are required' },
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

    // Update notifications - only mark ones owned by this user
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .in('id', ids)
      .eq('recipient_user_id', profile.id);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ success: false, error: 'update_failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Mark read API error:', error);
    return NextResponse.json(
      { success: false, error: 'server_error', message: error.message },
      { status: 500 }
    );
  }
}
