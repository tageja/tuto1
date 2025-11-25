import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

/**
 * GET /api/school/announcements
 * Fetch announcements for a school with filters
 * Query params: schoolId (required), status?, priority?, q? (search), tab?, id?
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const q = searchParams.get('q'); // search query
    const tab = searchParams.get('tab');
    const id = searchParams.get('id'); // specific announcement deep link

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();

    // Auto-archive expired announcements
    await supabase
      .from('school_announcements')
      .update({ status: 'Archived' })
      .eq('school_id', schoolId)
      .eq('status', 'Published')
      .not('expires_at', 'is', null)
      .lte('expires_at', new Date().toISOString());

    // Build query
    let query = supabase
      .from('school_announcements')
      .select('*')
      .eq('school_id', schoolId);

    // Apply status filter
    if (status) {
      query = query.eq('status', status);
    }

    // Apply tab-based filters (for parent view)
    if (tab) {
      if (tab === 'active' || tab === 'all') {
        query = query
          .eq('status', 'Published')
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      } else if (tab === 'urgent') {
        query = query
          .eq('status', 'Published')
          .eq('priority', 'Urgent')
          .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
      } else if (tab === 'expired') {
        query = query
          .eq('status', 'Published')
          .lte('expires_at', new Date().toISOString());
      }
    }

    // Apply priority filter
    if (priority) {
      query = query.eq('priority', priority);
    }

    // Apply search filter
    if (q) {
      query = query.or(`title.ilike.%${q}%,body.ilike.%${q}%`);
    }

    // If specific ID requested (deep link)
    if (id) {
      query = query.eq('id', id);
    }

    // Sort: Urgent first, then by published_at desc
    query = query.order('priority', { ascending: false }).order('published_at', { ascending: false, nullsFirst: false });

    const { data: announcements, error } = await query;

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json(
        { error: 'Failed to fetch announcements' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: announcements || [] });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/school/announcements
 * Create a new announcement
 * Body: { school_id, title, body, category?, priority, status, target_scope, class_ids?, expires_at?, created_by }
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client with service role (bypasses RLS)
    const supabase = createServerSupabaseClient();
    
    const body = await request.json();
    const {
      school_id,
      title,
      body: announcementBody,
      category,
      priority = 'Normal',
      status = 'Draft',
      target_scope = 'School',
      class_ids,
      expires_at,
      created_by,
    } = body;

    // Validation
    if (!school_id || !title || !announcementBody) {
      return NextResponse.json(
        { error: 'School ID, title, and body are required' },
        { status: 400 }
      );
    }

    if (target_scope === 'Classes' && (!class_ids || class_ids.length === 0)) {
      return NextResponse.json(
        { error: 'Class IDs are required when target scope is Classes' },
        { status: 400 }
      );
    }

    // Prepare announcement data
    const announcementData: any = {
      school_id,
      title,
      body: announcementBody,
      category,
      priority,
      status,
      target_scope,
      class_ids: target_scope === 'Classes' ? class_ids : null,
      expires_at: expires_at || null,
      created_by: created_by || null,
    };

    // If publishing immediately, set published_at
    if (status === 'Published') {
      announcementData.published_at = new Date().toISOString();
    }

    // Insert announcement
    const { data: announcement, error } = await supabase
      .from('school_announcements')
      .insert([announcementData])
      .select()
      .single();

    if (error) {
      console.error('Error creating announcement:', error);
      return NextResponse.json(
        { error: 'Failed to create announcement' },
        { status: 500 }
      );
    }

    // If published, create notification
    if (status === 'Published') {
      await supabase.from('school_notifications').insert([
        {
          school_id,
          type: 'announcement',
          ref_id: announcement.id,
          title: title,
          audience_scope: target_scope,
          class_ids: target_scope === 'Classes' ? class_ids : null,
        },
      ]);
    }

    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

