import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { ProfileSchema } from '../../../../../lib/validation/settings';

/**
 * Settings Profile API Route
 * 
 * GET  /api/school/settings/profile?userId=X - Get user's profile
 * PUT  /api/school/settings/profile?userId=X - Update user's profile
 * 
 * Note: Uses service role client. User ID is passed as query param from authenticated client.
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

    const supabase = createServerSupabaseClient();

    // Get user from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, name, role, avatar, phone')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Get extended profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userData.id)
      .single();

    // Merge base user data with profile
    const mergedProfile = {
      id: userData.id,
      email: userData.email,
      full_name: profile?.full_name || userData.name,
      phone: profile?.phone || userData.phone,
      avatar_url: profile?.avatar_url || userData.avatar,
      bio: profile?.bio || null,
      locale: profile?.locale || 'vi',
      theme: profile?.theme || 'system',
      timezone: profile?.timezone || 'Asia/Ho_Chi_Minh',
      twofa_enabled: profile?.twofa_enabled || false,
      updated_at: profile?.updated_at || null,
    };

    return NextResponse.json({
      success: true,
      data: mergedProfile,
    });
  } catch (error: any) {
    console.error('Error fetching profile:', error);
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

    const supabase = createServerSupabaseClient();

    // Verify user exists
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationResult = ProfileSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: validationResult.error.flatten() },
        { status: 400 }
      );
    }

    const profileData = validationResult.data;

    // Upsert profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userData.id,
        ...profileData,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      })
      .select()
      .single();

    if (profileError) {
      console.error('Error updating profile:', profileError);
      return NextResponse.json(
        { success: false, error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    // Also update name in users table if full_name changed
    if (profileData.full_name) {
      await supabase
        .from('users')
        .update({ name: profileData.full_name, updated_at: new Date().toISOString() })
        .eq('id', userData.id);
    }

    // Log audit
    await supabase.from('audit_logs').insert({
      user_id: userData.id,
      action: 'profile.update',
      entity_type: 'user_profiles',
      entity_id: userData.id,
      meta: { fields: Object.keys(profileData) },
    });

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
