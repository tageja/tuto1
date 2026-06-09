// tuto.social — Notifications service

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { mapDbProfileToType } from './auth.service';
import type { SocialNotification } from '../../types/social';
import type { SocialProfile, SocialUser } from '../../types/social/profile.types';

export interface SocialNotificationRow {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  post_id: string | null;
  comment_id: string | null;
  reel_id: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
}

function profileToSocialUser(p: SocialProfile): SocialUser {
  return {
    id: p.id,
    username: p.username,
    displayName: p.displayName ?? '',
    avatarUrl: p.avatarUrl,
    role: p.role,
    verified: p.isVerified,
  };
}

function mapRowToNotification(
  row: SocialNotificationRow,
  actor?: SocialProfile | null
): SocialNotification {
  const actorUser: SocialUser | undefined = actor ? profileToSocialUser(actor) : undefined;

  return {
    id: row.id,
    recipientId: row.recipient_id,
    actor: actorUser,
    type: row.type as SocialNotification['type'],
    postId: row.post_id ?? undefined,
    commentId: row.comment_id ?? undefined,
    reelId: row.reel_id ?? (row.data?.reelId as string) ?? undefined,
    data: row.data ?? {},
    read: row.read,
    createdAt: row.created_at,
  };
}

/**
 * Fetch notifications for the current user (recipient_id = auth.uid())
 */
export async function getNotifications(
  limit = 30,
  cursor?: string
): Promise<{ notifications: SocialNotification[]; hasMore: boolean }> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) return { notifications: [], hasMore: false };

  let query = socialSupabase
    .from(SOCIAL_TABLES.notifications)
    .select('*')
    .eq('recipient_id', user.id)
    .order('created_at', { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data: rows, error } = await query;

  if (error) throw error;

  const items = (rows ?? []) as SocialNotificationRow[];
  const hasMore = items.length > limit;
  const slice = hasMore ? items.slice(0, limit) : items;

  const actorIds = [...new Set(slice.map((r) => r.actor_id).filter(Boolean) as string[])];
  const actors: Record<string, SocialProfile | null> = {};

  for (const uid of actorIds) {
    const { data } = await socialSupabase
      .from(SOCIAL_TABLES.profiles)
      .select('*')
      .eq('user_id', uid)
      .maybeSingle();
    if (data) {
      actors[uid] = mapDbProfileToType(data);
    }
  }

  const notifications = slice.map((r) =>
    mapRowToNotification(r, r.actor_id ? actors[r.actor_id] ?? null : null)
  );

  return { notifications, hasMore };
}

/**
 * Get unread count for badge
 */
export async function getUnreadCount(): Promise<number> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) return 0;

  const { count, error } = await socialSupabase
    .from(SOCIAL_TABLES.notifications)
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', user.id)
    .eq('read', false);

  if (error) throw error;
  return count ?? 0;
}

/**
 * Mark a single notification as read
 */
export async function markAsRead(notificationId: string): Promise<void> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) return;

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.notifications)
    .update({ read: true })
    .eq('id', notificationId)
    .eq('recipient_id', user.id);

  if (error) throw error;
}

/**
 * Mark all notifications as read for the current user
 */
export async function markAllAsRead(): Promise<void> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) return;

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.notifications)
    .update({ read: true })
    .eq('recipient_id', user.id)
    .eq('read', false);

  if (error) throw error;
}
