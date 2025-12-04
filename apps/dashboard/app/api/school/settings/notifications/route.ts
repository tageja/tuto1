import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { NotificationPrefsSchema, NOTIFICATION_CHANNELS, NOTIFICATION_TOPICS } from '../../../../../lib/validation/settings';

/**
 * Notification Preferences API Route
 * 
 * GET  /api/school/settings/notifications?userId=X - Get notification preferences matrix
 * PUT  /api/school/settings/notifications?userId=X - Bulk update notification preferences
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServerSupabaseClient();

    // Verify user exists
    const { data: userData } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get existing preferences
    const { data: prefs, error } = await serviceClient
      .from('notification_preferences')
      .select('channel, topic, enabled')
      .eq('user_id', userData.id);

    if (error) {
      throw error;
    }

    // Build full matrix with defaults (all enabled by default)
    const prefsMap = new Map(
      (prefs || []).map(p => [`${p.channel}:${p.topic}`, p.enabled])
    );

    const matrix: Array<{ channel: string; topic: string; enabled: boolean }> = [];
    
    for (const channel of NOTIFICATION_CHANNELS) {
      for (const topic of NOTIFICATION_TOPICS) {
        const key = `${channel}:${topic}`;
        matrix.push({
          channel,
          topic,
          enabled: prefsMap.has(key) ? prefsMap.get(key)! : true,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        preferences: matrix,
        channels: NOTIFICATION_CHANNELS,
        topics: NOTIFICATION_TOPICS,
      },
    });
  } catch (error: any) {
    console.error('Error fetching notification prefs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    const serviceClient = createServerSupabaseClient();

    // Verify user exists
    const { data: userData } = await serviceClient
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (!userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = NotificationPrefsSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { preferences } = validationResult.data;

    // Upsert all preferences
    const upsertData = preferences.map(pref => ({
      user_id: userData.id,
      channel: pref.channel,
      topic: pref.topic,
      enabled: pref.enabled,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await serviceClient
      .from('notification_preferences')
      .upsert(upsertData, {
        onConflict: 'user_id,channel,topic',
      });

    if (upsertError) {
      console.error('Error updating notification prefs:', upsertError);
      return NextResponse.json(
        { success: false, error: 'Failed to update preferences' },
        { status: 500 }
      );
    }

    // Log audit
    await serviceClient.from('audit_logs').insert({
      user_id: userData.id,
      action: 'notifications.update',
      entity_type: 'notification_preferences',
      meta: { count: preferences.length },
    });

    return NextResponse.json({
      success: true,
      message: 'Notification preferences updated',
    });
  } catch (error: any) {
    console.error('Error updating notification prefs:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
