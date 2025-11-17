import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { activities } = body;

    if (!Array.isArray(activities) || activities.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Activities array is required' },
        { status: 400 }
      );
    }

    // Use server Supabase client with service role (bypasses RLS)
    let supabase;
    try {
      supabase = createServerSupabaseClient();
      console.log('✅ Service role client created successfully');
    } catch (err: any) {
      console.error('❌ Failed to create service role client:', err.message);
      // Fallback: Try direct creation
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      console.log('Env check:', {
        hasUrl: !!supabaseUrl,
        hasKey: !!serviceKey,
        keyPrefix: serviceKey?.substring(0, 20),
      });
      
      throw new Error(`Service role setup failed: ${err.message}`);
    }

    // Bulk insert activities
    const { data, error } = await supabase
      .from('school_daily_activities')
      .insert(activities)
      .select('id, date, time');

    if (error) {
      console.error('Bulk insert error:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      activities: data,
      count: data?.length || 0,
    });
  } catch (error: any) {
    console.error('Error in bulk activities API:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

