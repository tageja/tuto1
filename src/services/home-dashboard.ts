/**
 * Home Dashboard Service
 * Provides role-specific stats and recent activity for the Role-Smart home screen.
 */

import { supabase } from '../config/supabase';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AdminHomeStats {
  studentsCount: number;
  teachersCount: number;
  attendanceRate: number | null;
}

export interface ActivityItem {
  id: string;
  type: 'announcement' | 'homework' | 'attendance' | 'event';
  title: string;
  subtitle: string;
  tag: string;
  tagColor: string;
  tagBg: string;
  timeAgo: string;
  iconBg: string;
  iconName: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const past = new Date(dateStr).getTime();
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return diffMins <= 1 ? 'Just now' : `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Yesterday';
  return `${diffDays}d ago`;
}

// ---------------------------------------------------------------------------
// Admin Stats
// ---------------------------------------------------------------------------

export async function fetchAdminHomeStats(schoolId: string): Promise<AdminHomeStats> {
  const empty: AdminHomeStats = { studentsCount: 0, teachersCount: 0, attendanceRate: null };
  if (!schoolId) return empty;

  const [studentsRes, teachersRes, attendanceRes] = await Promise.all([
    supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .in('status', ['active', 'Active']),

    supabase
      .from('school_teachers')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId),

    supabase
      .from('school_attendance')
      .select('status')
      .eq('school_id', schoolId)
      .eq('date', new Date().toISOString().split('T')[0]),
  ]);

  const studentsCount = studentsRes.count ?? 0;
  const teachersCount = teachersRes.count ?? 0;

  let attendanceRate: number | null = null;
  const attendanceRows = attendanceRes.data ?? [];
  if (attendanceRows.length > 0) {
    const present = attendanceRows.filter((r) => r.status === 'present').length;
    attendanceRate = Math.round((present / attendanceRows.length) * 100);
  }

  return { studentsCount, teachersCount, attendanceRate };
}

// ---------------------------------------------------------------------------
// Recent Activity
// ---------------------------------------------------------------------------

export async function fetchRecentActivity(schoolId: string): Promise<ActivityItem[]> {
  if (!schoolId) return [];

  const [announcementsRes, homeworkRes] = await Promise.all([
    supabase
      .from('school_announcements')
      .select('id, title, content, status, created_at')
      .eq('school_id', schoolId)
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3),

    supabase
      .from('school_homework_assignments')
      .select('id, title, subject, due_date, is_active, created_at')
      .eq('school_id', schoolId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(3),
  ]);

  const items: ActivityItem[] = [];

  for (const a of announcementsRes.data ?? []) {
    items.push({
      id: `ann-${a.id}`,
      type: 'announcement',
      title: a.title || 'Announcement',
      subtitle: a.content ? a.content.slice(0, 60) + (a.content.length > 60 ? '…' : '') : 'Tap to read',
      tag: 'Announcement',
      tagColor: '#2563EB',
      tagBg: '#EFF6FF',
      timeAgo: timeAgo(a.created_at),
      iconBg: '#EFF6FF',
      iconName: 'campaign',
    });
  }

  for (const h of homeworkRes.data ?? []) {
    const today = new Date().toISOString().split('T')[0];
    const overdue = h.due_date < today;
    items.push({
      id: `hw-${h.id}`,
      type: 'homework',
      title: h.title || 'Homework',
      subtitle: h.subject ? `${h.subject} · Due ${h.due_date}` : `Due ${h.due_date}`,
      tag: overdue ? 'Overdue' : 'Active',
      tagColor: overdue ? '#D97706' : '#16A34A',
      tagBg: overdue ? '#FEF3C7' : '#DCFCE7',
      timeAgo: timeAgo(h.created_at),
      iconBg: '#F0FDF4',
      iconName: 'menu-book',
    });
  }

  // Sort by recency — approximate by type ordering (announcements first)
  return items.slice(0, 5);
}
