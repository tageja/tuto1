/**
 * Notifications Service
 * 
 * Handles all Supabase interactions for notifications
 */

import { supabase } from '../config/supabase';

export interface Notification {
  id: string;
  schoolId: string;
  recipientUserId: string;
  recipientRole: 'parent' | 'admin';
  type: string;
  priority: 'urgent' | 'normal';
  title: string;
  body: string;
  targetType: string | null;
  targetId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  meta: Record<string, unknown> | null;
}

export interface FetchNotificationsParams {
  userId: string;
  schoolId: string;
  role?: 'parent' | 'admin';
  priority?: 'urgent' | 'normal';
  onlyUnread?: boolean;
  limit?: number;
}

/**
 * Fetch notifications from Supabase
 */
export async function fetchNotifications(params: FetchNotificationsParams): Promise<Notification[]> {
  const {
    userId,
    schoolId,
    role,
    priority,
    onlyUnread = false,
    limit = 100,
  } = params;

  try {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('recipient_user_id', userId)
      .eq('school_id', schoolId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (role) {
      query = query.eq('recipient_role', role);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (onlyUnread) {
      query = query.eq('is_read', false);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    // Map database columns to camelCase
    return (data || []).map((row: any) => ({
      id: row.id,
      schoolId: row.school_id,
      recipientUserId: row.recipient_user_id,
      recipientRole: row.recipient_role,
      type: row.type,
      priority: row.priority,
      title: row.title,
      body: row.body,
      targetType: row.target_type,
      targetId: row.target_id,
      isRead: row.is_read,
      readAt: row.read_at,
      createdAt: row.created_at,
      meta: row.meta,
    }));
  } catch (error) {
    console.error('Error in fetchNotifications:', error);
    throw error;
  }
}

/**
 * Mark a single notification as read
 */
export async function markNotificationRead(
  notificationId: string,
  userId: string
): Promise<void> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('id', notificationId)
      .eq('recipient_user_id', userId);

    if (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markNotificationRead:', error);
    throw error;
  }
}

/**
 * Mark all notifications as read for a user and school
 */
export async function markAllNotificationsRead(
  userId: string,
  schoolId: string,
  role?: 'parent' | 'admin'
): Promise<void> {
  try {
    let query = supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
      })
      .eq('recipient_user_id', userId)
      .eq('school_id', schoolId)
      .eq('is_read', false);

    if (role) {
      query = query.eq('recipient_role', role);
    }

    const { error } = await query;

    if (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in markAllNotificationsRead:', error);
    throw error;
  }
}


