// tuto.social — Feed service
// Fetches paginated posts for the three feed tabs

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { mapDbProfileToType } from './auth.service';
import type { SocialPost, SocialUser } from '../../types/social';
import type { PostType, PostVisibility, ModerationStatus, ReactionType } from '../../types/social';

export type FeedTab = 'school' | 'forYou' | 'following';

export interface FeedOptions {
  tab: FeedTab;
  schoolId?: string;
  currentProfileId?: string;
  limit?: number;
  cursor?: string; // ISO timestamp — fetch posts older than this
}

export interface FeedResult {
  posts: SocialPost[];
  hasMore: boolean;
  nextCursor: string | null;
}

// --------------------------------------------------------------------------
// Main feed fetch
// --------------------------------------------------------------------------

export async function getFeedPosts(options: FeedOptions): Promise<FeedResult> {
  const { tab, schoolId, currentProfileId, limit = 20, cursor } = options;

  let query = socialSupabase
    .from(SOCIAL_TABLES.posts)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified,
        school_id, shield_count
      )
    `)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(limit + 1); // fetch one extra to detect hasMore

  // Tab-specific filters
  if (tab === 'school' && schoolId) {
    query = query.eq('school_id', schoolId);
  } else if (tab === 'forYou') {
    // Public posts OR same-school posts
    if (schoolId) {
      query = query.or(`visibility.eq.public,school_id.eq.${schoolId}`);
    } else {
      query = query.eq('visibility', 'public' as PostVisibility);
    }
  } else if (tab === 'following' && currentProfileId) {
    // Posts from profiles the current user follows
    const { data: followingIds } = await socialSupabase
      .from(SOCIAL_TABLES.follows)
      .select('following_id')
      .eq('follower_id', currentProfileId);

    const ids = (followingIds ?? []).map((r) => r.following_id as string);
    if (ids.length === 0) return { posts: [], hasMore: false, nextCursor: null };
    query = query.in('author_id', ids);
  }

  // Cursor pagination
  if (cursor) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;
  if (error) throw error;

  const rows = data ?? [];
  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? (slice[slice.length - 1].created_at as string) : null;

  // Attach user reactions and saved state if logged in
  let userReactions: Record<string, ReactionType> = {};
  let savedPostIds: Set<string> = new Set();

  const { data: { user } } = await socialSupabase.auth.getUser();
  if (user && slice.length > 0) {
    const postIds = slice.map((r) => r.id as string);

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

  const posts = slice.map((row) => mapDbPostToType(row, userReactions, savedPostIds));

  return { posts, hasMore, nextCursor };
}

// --------------------------------------------------------------------------
// Pinned posts (announcement banner)
// --------------------------------------------------------------------------

export async function getPinnedPosts(schoolId: string): Promise<SocialPost[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified, school_id, shield_count
      )
    `)
    .eq('school_id', schoolId)
    .eq('is_pinned', true)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('pin_order', { ascending: true })
    .limit(3);

  if (error) throw error;
  return (data ?? []).map((row) => mapDbPostToType(row, {}, new Set()));
}

// --------------------------------------------------------------------------
// DB row → SocialPost mapper
// --------------------------------------------------------------------------

export function mapDbPostToType(
  row: Record<string, unknown>,
  userReactions: Record<string, ReactionType>,
  savedPostIds: Set<string>,
): SocialPost {
  const authorRow = row.author as Record<string, unknown> | null;
  const author: SocialUser = authorRow
    ? {
        id:          authorRow.id as string,
        displayName: (authorRow.display_name as string) ?? '',
        avatarUrl:   authorRow.avatar_url as string | undefined,
        role:        authorRow.role as SocialUser['role'],
        verified:    (authorRow.is_verified as boolean) ?? false,
        username:    authorRow.username as string | undefined,
      }
    : {
        id:          '',
        displayName: 'Unknown',
        role:        'guest',
      };

  const postId = row.id as string;

  return {
    id:               postId,
    author,
    postType:         row.post_type as PostType,
    content:          (row.content as string) ?? '',
    mediaUrls:        (row.media_urls as string[]) ?? [],
    visibility:       row.visibility as PostVisibility,
    audienceLabel:    row.audience_label as string | undefined,
    subjects:         (row.subjects as string[]) ?? [],
    location:         row.location as string | undefined,
    schoolId:         row.school_id as string | undefined,
    classId:          row.class_id as string | undefined,
    moderationStatus: row.moderation_status as ModerationStatus,
    reactions: {
      like:    (row.like_count as number) ?? 0,
      applaud: (row.applaud_count as number) ?? 0,
      curious: (row.curious_count as number) ?? 0,
    },
    userReaction:  userReactions[postId],
    commentsCount: (row.comments_count as number) ?? 0,
    sharesCount:   (row.shares_count as number) ?? 0,
    savesCount:    (row.saves_count as number) ?? 0,
    viewCount:     (row.view_count as number) ?? 0,
    saved:         savedPostIds.size > 0 ? savedPostIds.has(postId) : false,
    isPinned:      (row.is_pinned as boolean) ?? false,
    pinOrder:      row.pin_order as number | undefined,
    poll:          row.poll as SocialPost['poll'],
    event:         row.event as SocialPost['event'],
    assignment:    row.assignment as SocialPost['assignment'],
    achievement:   row.achievement as SocialPost['achievement'],
    createdAt:     row.created_at as string,
    updatedAt:     row.updated_at as string,
  };
}
