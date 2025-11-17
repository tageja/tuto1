import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase';

/**
 * Bookings API Route
 * GET /api/bookings?maxRecords=5&upcoming=true
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxRecords = parseInt(searchParams.get('maxRecords') || '20');
    const upcoming = searchParams.get('upcoming') === 'true';

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('bookings')
      .select('*, teachers(name), students(name)')
      .order('date', { ascending: false })
      .limit(maxRecords);

    if (upcoming) {
      const today = new Date().toISOString().split('T')[0];
      query = query.gte('date', today);
    }

    const { data: bookings, error } = await query;

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      bookings: bookings || [],
    });
  } catch (error: any) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { success: false, bookings: [], error: error.message },
      { status: 500 }
    );
  }
}
