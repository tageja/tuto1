// tuto.social — Posts CRUD service

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { mapDbPostToType } from './feed.service';
import type { SocialPost, CreatePostPayload } from '../../types/social';

// --------------------------------------------------------------------------
// Create post
// --------------------------------------------------------------------------

export async function createPost(payload: CreatePostPayload): Promise<SocialPost> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  // Fetch author's profile id
  const { data: profile, error: profileErr } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id, school_id')
    .eq('user_id', user.id)
    .single();
  if (profileErr || !profile) throw new Error('Social profile not found');

  const insertData: Record<string, unknown> = {
    author_id:   profile.id,
    school_id:   profile.school_id,
    post_type:   payload.postType,
    content:     payload.content ?? '',
    media_urls:  payload.mediaUrls ?? [],
    visibility:  payload.visibility ?? 'school_only',
    subjects:    payload.subjects ?? [],
    location:    payload.location ?? null,
    poll:        payload.poll ?? null,
    event:       payload.event ?? null,
    assignment:  payload.assignment ?? null,
    achievement: payload.achievement ?? null,
  };

  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .insert(insertData)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified, school_id, shield_count
      )
    `)
    .single();

  if (error) throw error;
  return mapDbPostToType(data as Record<string, unknown>, {}, new Set());
}

// --------------------------------------------------------------------------
// Get single post
// --------------------------------------------------------------------------

export async function getPostById(postId: string): Promise<SocialPost | null> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified, school_id, shield_count
      )
    `)
    .eq('id', postId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }
  return mapDbPostToType(data as Record<string, unknown>, {}, new Set());
}

// --------------------------------------------------------------------------
// Delete own post
// --------------------------------------------------------------------------

export async function deletePost(postId: string): Promise<void> {
  const { data: { user }, error: authErr } = await socialSupabase.auth.getUser();
  if (authErr || !user) throw new Error('Not authenticated');

  const { data: profile } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id')
    .eq('user_id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .delete()
    .eq('id', postId)
    .eq('author_id', profile.id); // safety: can only delete own posts

  if (error) throw error;
}
