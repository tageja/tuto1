import { supabase } from '../../config/supabase';
import { Announcement, AnnouncementFilters, AnnouncementRead } from '../../types/school/announcements';

// Helper to resolve school identifier (name or UUID) to UUID
async function resolveSchoolId(schoolIdentifier: string): Promise<string | null> {
  try {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(schoolIdentifier)) {
      return schoolIdentifier;
    }

    if (schoolIdentifier.startsWith('rec')) {
      const { data, error } = await supabase
        .from('schools')
        .select('id')
        .eq('name', 'Tuto Demo School')
        .single();

      if (error || !data) return null;
      return data.id;
    }

    const { data, error } = await supabase
      .from('schools')
      .select('id')
      .eq('name', schoolIdentifier)
      .single();

    if (error || !data) return null;
    return data.id;
  } catch (error) {
    console.error('Error resolving school ID:', error);
    return null;
  }
}

export async function fetchAnnouncements(
  schoolId: string,
  filters: AnnouncementFilters
): Promise<Announcement[]> {
  try {
    const resolvedSchoolId = await resolveSchoolId(schoolId);
    if (!resolvedSchoolId) throw new Error('Invalid school ID');

    // Auto-archive expired announcements (mirroring web logic)
    // In a real mobile app, this might be better left to the backend/web, 
    // but we'll include it for completeness if the user hits mobile first.
    // However, since we can't run background jobs easily here, we'll just skip the update 
    // or assume the API/web handles it. 
    // We will just fetch.

    let query = supabase
      .from('school_announcements')
      .select('*')
      .eq('school_id', resolvedSchoolId);

    // Apply status filter
    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    // Apply tab-based filters (for parent view)
    if (filters.tab) {
      const now = new Date().toISOString();
      if (filters.tab === 'active' || filters.tab === 'all') {
        query = query
          .eq('status', 'Published')
          .or(`expires_at.is.null,expires_at.gt.${now}`);
      } else if (filters.tab === 'urgent') {
        query = query
          .eq('status', 'Published')
          .eq('priority', 'Urgent')
          .or(`expires_at.is.null,expires_at.gt.${now}`);
      } else if (filters.tab === 'expired') {
        query = query
          .eq('status', 'Published')
          .lte('expires_at', now);
      } else if (filters.tab === 'draft') {
          query = query.eq('status', 'Draft');
      } else if (filters.tab === 'published') {
          query = query.eq('status', 'Published');
      } else if (filters.tab === 'archived') {
          query = query.eq('status', 'Archived');
      }
    }

    // Apply priority filter
    if (filters.priority) {
      query = query.eq('priority', filters.priority);
    }

    // Apply search filter
    if (filters.q) {
      query = query.or(`title.ilike.%${filters.q}%,body.ilike.%${filters.q}%`);
    }

    // Sort: Urgent first, then by published_at desc
    query = query.order('priority', { ascending: false }).order('published_at', { ascending: false, nullsFirst: false });

    const { data, error } = await query;

    if (error) throw error;

    return (data || []) as Announcement[];
  } catch (error) {
    console.error('Error fetching announcements:', error);
    return [];
  }
}

export async function markAnnouncementAsRead(
  announcementId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('announcement_reads')
      .upsert(
        { announcement_id: announcementId, user_id: userId, read_at: new Date().toISOString() },
        { onConflict: 'announcement_id,user_id' }
      );

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    return false;
  }
}

export async function fetchAnnouncementReadReceipts(
  userId: string,
  announcementIds: string[]
): Promise<string[]> {
  try {
    if (announcementIds.length === 0) return [];
    
    const { data, error } = await supabase
      .from('announcement_reads')
      .select('announcement_id')
      .eq('user_id', userId)
      .in('announcement_id', announcementIds);

    if (error) throw error;

    return (data || []).map((r: any) => r.announcement_id);
  } catch (error) {
    console.error('Error fetching read receipts:', error);
    return [];
  }
}






