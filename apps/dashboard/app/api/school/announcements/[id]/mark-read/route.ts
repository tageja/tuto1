import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';

/**
 * POST /api/school/announcements/[id]/mark-read
 * Mark an announcement as read by the current user
 * Body: { user_id }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();
    
    const { id: announcementId } = await params;
    const body = await request.json();
    const { user_id } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Upsert read receipt (insert or update if already exists)
    const { error } = await supabase
      .from('announcement_reads')
      .upsert([
        {
          announcement_id: announcementId,
          user_id: user_id,
          read_at: new Date().toISOString(),
        },
      ], {
        onConflict: 'announcement_id,user_id',
      });

    if (error) {
      console.error('Error marking announcement as read:', error);
      return NextResponse.json(
        { error: 'Failed to mark as read' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

