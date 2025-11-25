import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * PATCH /api/school/announcements/[id]
 * Update an announcement (edit, publish, archive, restore)
 * Body: { title?, body?, category?, priority?, status?, target_scope?, class_ids?, expires_at? }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();
    
    const { id } = await params;
    const body = await request.json();
    const {
      title,
      body: announcementBody,
      category,
      priority,
      status,
      target_scope,
      class_ids,
      expires_at,
    } = body;

    // Build update data
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (announcementBody !== undefined) updateData.body = announcementBody;
    if (category !== undefined) updateData.category = category;
    if (priority !== undefined) updateData.priority = priority;
    if (status !== undefined) updateData.status = status;
    if (target_scope !== undefined) updateData.target_scope = target_scope;
    if (class_ids !== undefined) updateData.class_ids = class_ids;
    if (expires_at !== undefined) updateData.expires_at = expires_at;

    // If changing to Published status, set published_at
    if (status === 'Published' && !updateData.published_at) {
      updateData.published_at = new Date().toISOString();
    }

    // Validate class targeting
    if (target_scope === 'Classes' && (!class_ids || class_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Class IDs are required when target scope is Classes' },
        { status: 400 }
      );
    }

    // Update announcement
    const { data: announcement, error } = await supabase
      .from('school_announcements')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to update announcement' },
        { status: 500 }
      );
    }

    // If status changed to Published, create notification
    if (status === 'Published') {
      // Check if notification already exists
      const { data: existingNotif } = await supabase
        .from('school_notifications')
        .select('id')
        .eq('type', 'announcement')
        .eq('ref_id', id)
        .single();

      if (!existingNotif) {
        await supabase.from('school_notifications').insert([
          {
            school_id: announcement.school_id,
            type: 'announcement',
            ref_id: announcement.id,
            title: announcement.title,
            audience_scope: announcement.target_scope,
            class_ids: announcement.class_ids,
          },
        ]);
      }
    }

    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/school/announcements/[id]
 * Delete an announcement (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();
    
    const { id } = await params;

    // Delete announcement (cascade will handle reads and notifications)
    const { error } = await supabase
      .from('school_announcements')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting announcement:', error);
      return NextResponse.json(
        { error: 'Failed to delete announcement' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Announcement deleted' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

