import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * User Devices API Route
 * 
 * GET    /api/school/settings/devices?userId=X - Get user's devices
 * DELETE /api/school/settings/devices?userId=X&id=Y - Revoke a device
 * POST   /api/school/settings/devices?userId=X - Register a device
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

    // Get devices
    const { data: devices, error } = await serviceClient
      .from('user_devices')
      .select('id, device_info, user_agent, ip_address, last_seen_at, created_at')
      .eq('user_id', userData.id)
      .order('last_seen_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: devices || [],
    });
  } catch (error: any) {
    console.error('Error fetching devices:', error);
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
    const deviceId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!deviceId) {
      return NextResponse.json(
        { success: false, error: 'Device ID is required' },
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

    // Verify device belongs to user before deleting
    const { data: device } = await serviceClient
      .from('user_devices')
      .select('id')
      .eq('id', deviceId)
      .eq('user_id', userData.id)
      .single();

    if (!device) {
      return NextResponse.json(
        { success: false, error: 'Device not found' },
        { status: 404 }
      );
    }

    // Delete device
    const { error: deleteError } = await serviceClient
      .from('user_devices')
      .delete()
      .eq('id', deviceId);

    if (deleteError) {
      console.error('Error deleting device:', deleteError);
      return NextResponse.json(
        { success: false, error: 'Failed to revoke device' },
        { status: 500 }
      );
    }

    // Log audit
    await serviceClient.from('audit_logs').insert({
      user_id: userData.id,
      action: 'device.revoke',
      entity_type: 'user_devices',
      entity_id: deviceId,
    });

    return NextResponse.json({
      success: true,
      message: 'Device revoked',
    });
  } catch (error: any) {
    console.error('Error revoking device:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST to register current device
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

    const body = await request.json();
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ipAddress = forwardedFor?.split(',')[0].trim() || 'unknown';

    // Insert device
    const { data: device, error } = await serviceClient
      .from('user_devices')
      .insert({
        user_id: userData.id,
        device_info: body.device_info || {},
        user_agent: userAgent,
        ip_address: ipAddress,
        last_seen_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error registering device:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to register device' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: device,
    });
  } catch (error: any) {
    console.error('Error registering device:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
