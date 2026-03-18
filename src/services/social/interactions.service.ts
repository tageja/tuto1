// tuto.social — Interactions service (likes, saves, comments)

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import type {
  ReactionType,
  SocialComment,
  CreateCommentPayload,
} from '../../types/social';

// --------------------------------------------------------------------------
// Reactions
// --------------------------------------------------------------------------

export async function reactToPost(postId: string, reactionType: ReactionType): Promise<void> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.likes)
    .upsert(
      { post_id: postId, user_id: user.id, reaction_type: reactionType },
      { onConflict: 'post_id,user_id' },
    );

  if (error) throw error;
}

export async function removeReaction(postId: string): Promise<void> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.likes)
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

export async function getUserReaction(postId: string): Promise<ReactionType | null> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) return null;

  const { data } = await socialSupabase
    .from(SOCIAL_TABLES.likes)
    .select('reaction_type')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle();

  return (data?.reaction_type as ReactionType) ?? null;
}

// --------------------------------------------------------------------------
// Saves
// --------------------------------------------------------------------------

export async function savePost(postId: string): Promise<void> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.saves)
    .insert({ post_id: postId, user_id: user.id });

  if (error && error.code !== '23505') throw error; // ignore duplicate
}

export async function unsavePost(postId: string): Promise<void> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.saves)
    .delete()
    .eq('post_id', postId)
    .eq('user_id', user.id);

  if (error) throw error;
}

// --------------------------------------------------------------------------
// Comments
// --------------------------------------------------------------------------

export async function addComment(payload: CreateCommentPayload): Promise<SocialComment> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { data: profile } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.comments)
    .insert({
      post_id:   payload.postId,
      author_id: profile.id,
      content:   payload.content,
      parent_id: payload.parentId ?? null,
    })
    .select(`
      *,
      author:social_profiles!social_comments_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified
      )
    `)
    .single();

  if (error) throw error;
  return mapDbCommentToType(data as Record<string, unknown>);
}

export async function getComments(
  postId: string,
  limit = 30,
  offset = 0,
): Promise<SocialComment[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.comments)
    .select(`
      *,
      author:social_profiles!social_comments_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified
      )
    `)
    .eq('post_id', postId)
    .is('parent_id', null) // top-level only
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []).map((row) => mapDbCommentToType(row as Record<string, unknown>));
}

export async function likeComment(commentId: string): Promise<void> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.commentLikes)
    .insert({ comment_id: commentId, user_id: user.id });

  if (error && error.code !== '23505') throw error;
}

// --------------------------------------------------------------------------
// Comment mapper
// --------------------------------------------------------------------------

function mapDbCommentToType(row: Record<string, unknown>): SocialComment {
  const authorRow = row.author as Record<string, unknown> | null;
  return {
    id:        row.id as string,
    postId:    row.post_id as string,
    parentId:  row.parent_id as string | undefined,
    author: {
      id:          (authorRow?.id as string) ?? '',
      displayName: (authorRow?.display_name as string) ?? 'Unknown',
      avatarUrl:   authorRow?.avatar_url as string | undefined,
      role:        (authorRow?.role as SocialComment['author']['role']) ?? 'guest',
      verified:    (authorRow?.is_verified as boolean) ?? false,
      username:    authorRow?.username as string | undefined,
    },
    content:       row.content as string,
    likeCount:     (row.like_count as number) ?? 0,
    isPinned:      (row.is_pinned as boolean) ?? false,
    isTeacherPin:  (row.is_teacher_pin as boolean) ?? false,
    createdAt:     row.created_at as string,
    updatedAt:     row.updated_at as string,
  };
}
