// tuto.social — Search service (users and posts)

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { mapDbPostToType } from './feed.service';
import { searchUsers as searchUsersFromProfile } from './profile.service';
import type { SocialProfile, SocialPost } from '../../types/social';
import type { ReactionType } from '../../types/social';

const POST_SEARCH_LIMIT = 20;

/** Search users by display name or username (case-insensitive). */
export async function searchUsers(query: string): Promise<SocialProfile[]> {
  return searchUsersFromProfile(query);
}

/** Search posts by content (ilike). */
export async function searchPosts(query: string): Promise<SocialPost[]> {
  const q = query.trim();
  if (!q) return [];

  const term = `%${q}%`;
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified,
        school_id, shield_count
      )
    `)
    .ilike('content', term)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(POST_SEARCH_LIMIT);

  if (error) throw error;

  const rows = data ?? [];
  let userReactions: Record<string, ReactionType> = {};
  let savedPostIds: Set<string> = new Set();

  const { data: { user } } = await socialSupabase.auth.getUser();
  if (user && rows.length > 0) {
    const postIds = rows.map((r) => r.id as string);
    const [reactionsRes, savesRes] = await Promise.all([
      socialSupabase
        .from(SOCIAL_TABLES.likes)
        .select('post_id, reaction_type')
        .eq('user_id', user.id)
        .in('post_id', postIds),
      socialSupabase
        .from(SOCIAL_TABLES.saves)
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds),
    ]);
    (reactionsRes.data ?? []).forEach((r) => {
      userReactions[r.post_id as string] = r.reaction_type as ReactionType;
    });
    (savesRes.data ?? []).forEach((r) => {
      savedPostIds.add(r.post_id as string);
    });
  }

  return rows.map((row) => mapDbPostToType(row, userReactions, savedPostIds));
}
