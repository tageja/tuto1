import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase';

/**
 * Posts API Route (Social)
 * GET /api/posts?maxRecords=6&status=Active
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const maxRecords = parseInt(searchParams.get('maxRecords') || '20');
    const status = searchParams.get('status') || 'active';

    const supabase = createServerSupabaseClient();

    const { data: posts, error } = await supabase
      .from('posts')
      .select('*')
      .eq('status', status.toLowerCase())
      .order('created_at', { ascending: false })
      .limit(maxRecords);

    if (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      posts: posts || [],
    });
  } catch (error: any) {
    console.error('Posts API error:', error);
    return NextResponse.json(
      { success: false, posts: [], error: error.message },
      { status: 500 }
    );
  }
}
