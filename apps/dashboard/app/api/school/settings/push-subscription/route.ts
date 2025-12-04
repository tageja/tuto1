import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { PushSubscriptionSchema } from '../../../../../lib/validation/settings';

/**
 * Web Push Subscription API Route
 * 
 * GET    /api/school/settings/push-subscription?userId=X - Check subscription status
 * POST   /api/school/settings/push-subscription?userId=X - Subscribe to push notifications
 * DELETE /api/school/settings/push-subscription?userId=X - Unsubscribe
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

    // Get subscriptions
    const { data: subscriptions } = await serviceClient
      .from('web_push_subscriptions')
      .select('id, endpoint, created_at')
      .eq('user_id', userData.id);

    return NextResponse.json({
      success: true,
      data: {
        subscribed: (subscriptions?.length || 0) > 0,
        count: subscriptions?.length || 0,
      },
    });
  } catch (error: any) {
    console.error('Error checking push status:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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
    const validationResult = PushSubscriptionSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const { endpoint, p256dh, auth } = validationResult.data;

    // Upsert subscription (unique on endpoint)
    const { data: subscription, error } = await serviceClient
      .from('web_push_subscriptions')
      .upsert({
        user_id: userData.id,
        endpoint,
        p256dh,
        auth,
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'endpoint',
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving push subscription:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    // Log audit
    await serviceClient.from('audit_logs').insert({
      user_id: userData.id,
      action: 'push.subscribe',
      entity_type: 'web_push_subscriptions',
      entity_id: subscription.id,
    });

    return NextResponse.json({
      success: true,
      data: { id: subscription.id },
    });
  } catch (error: any) {
    console.error('Error saving push subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const endpoint = searchParams.get('endpoint');

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

    // Delete subscription(s) for this user
    let deleteQuery = serviceClient
      .from('web_push_subscriptions')
      .delete()
      .eq('user_id', userData.id);

    if (endpoint) {
      deleteQuery = deleteQuery.eq('endpoint', endpoint);
    }

    const { error: deleteError } = await deleteQuery;

    if (deleteError) {
      console.error('Error deleting push subscription:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to unsubscribe' },
        { status: 500 }
      );
    }

    // Log audit
    await serviceClient.from('audit_logs').insert({
      user_id: userData.id,
      action: 'push.unsubscribe',
      entity_type: 'web_push_subscriptions',
    });

    return NextResponse.json({
      success: true,
      message: 'Unsubscribed from push notifications',
    });
  } catch (error: any) {
    console.error('Error unsubscribing:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
