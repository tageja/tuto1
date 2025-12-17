export type AnnouncementPriority = 'Low' | 'Normal' | 'High' | 'Urgent';
export type AnnouncementStatus = 'Draft' | 'Published' | 'Archived';
export type AnnouncementTargetScope = 'School' | 'Classes';
export type AnnouncementTab = 'all' | 'active' | 'urgent' | 'expired' | 'draft' | 'published' | 'archived';

export interface Announcement {
  id: string;
  school_id: string;
  title: string;
  body: string;
  category: string | null;
  priority: AnnouncementPriority;
  status: AnnouncementStatus;
  target_scope: AnnouncementTargetScope;
  class_ids: string[] | null;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface AnnouncementRead {
  announcement_id: string;
  user_id: string;
  read_at: string;
}

export interface AnnouncementFilters {
  tab?: AnnouncementTab;
  status?: AnnouncementStatus;
  priority?: AnnouncementPriority;
  q?: string; // search query
  id?: string; // deep link to specific announcement
}






