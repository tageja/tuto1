import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase';

/**
 * Teachers API Route (Marketplace)
 * GET /api/teachers?maxRecords=8&status=Active
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxRecords = parseInt(searchParams.get('maxRecords') || '20');
    const status = searchParams.get('status') || 'active';

    const supabase = createServerSupabaseClient();

    const { data: teachers, error } = await supabase
      .from('teachers')
      .select('*')
      .eq('status', status.toLowerCase())
      .order('rating', { ascending: false })
      .limit(maxRecords);

    if (error) {
      console.error('Error fetching teachers:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      teachers: teachers || [],
    });
  } catch (error: any) {
    console.error('Teachers API error:', error);
    return NextResponse.json(
      { success: false, teachers: [], error: error.message },
      { status: 500 }
    );
  }
}
