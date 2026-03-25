// tuto.social — Reels service
// Fetches reel feed, single reel, author reels; toggles likes; creates reels

// expo-file-system v54+ moved readAsStringAsync to the legacy API
import * as FileSystem from 'expo-file-system/legacy';
import { socialSupabase } from './api.client';

export interface CreateReelInput {
  videoUri: string;
  description?: string;
  subjects?: string[];
  audience?: 'public' | 'school' | 'followers' | 'private';
  durationSeconds?: number;
}

export interface Reel {
  id: string;
  authorId: string;
  videoUrl: string;
  thumbnailUrl?: string;
  description?: string;
  durationSeconds: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  viewCount: number;
  isLiked: boolean;
  subjects?: string[];
  author: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl?: string;
    role: string;
  };
}

interface DbReelRow {
  id: string;
  author_id: string;
  video_url: string;
  thumbnail_url?: string;
  description?: string;
  duration_seconds: number;
  like_count: number;
  comment_count: number;
  share_count: number;
  view_count: number;
  subjects?: string[];
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    role?: string;
  };
}

function mapReel(row: DbReelRow, isLiked = false): Reel {
  const a = row.author ?? {};
  return {
    id: row.id,
    authorId: row.author_id,
    videoUrl: row.video_url,
    thumbnailUrl: row.thumbnail_url,
    description: row.description,
    durationSeconds: row.duration_seconds ?? 0,
    likeCount: row.like_count ?? 0,
    commentCount: row.comment_count ?? 0,
    shareCount: row.share_count ?? 0,
    viewCount: row.view_count ?? 0,
    isLiked,
    subjects: row.subjects ?? [],
    author: {
      id: a.id as string,
      username: (a.username as string) ?? '',
      displayName: (a.display_name as string) ?? 'Unknown',
      avatarUrl: a.avatar_url as string | undefined,
      role: (a.role as string) ?? 'guest',
    },
  };
}

export async function getReelsFeed(
  limit = 20,
  profileId?: string,
): Promise<Reel[]> {
  const { data, error } = await socialSupabase
    .from('social_reels')
    .select(
      `
      id, author_id, video_url, thumbnail_url, description,
      duration_seconds, like_count, comment_count, share_count, view_count, subjects,
      author:social_profiles!social_reels_author_id_fkey(
        id, username, display_name, avatar_url, role
      )
    `,
    )
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .eq('audience', 'public')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  const rows = (data ?? []) as DbReelRow[];

  let likedReelIds = new Set<string>();
  if (profileId && rows.length > 0) {
    const reelIds = rows.map((r) => r.id);
    const { data: likes } = await socialSupabase
      .from('social_reel_likes')
      .select('reel_id')
      .eq('profile_id', profileId)
      .in('reel_id', reelIds);
    likedReelIds = new Set((likes ?? []).map((l) => l.reel_id as string));
  }

  return rows.map((r) => mapReel(r, likedReelIds.has(r.id)));
}

export async function getReelById(
  reelId: string,
  profileId?: string,
): Promise<Reel | null> {
  const { data, error } = await socialSupabase
    .from('social_reels')
    .select(
      `
      id, author_id, video_url, thumbnail_url, description,
      duration_seconds, like_count, comment_count, share_count, view_count, subjects,
      author:social_profiles!social_reels_author_id_fkey(
        id, username, display_name, avatar_url, role
      )
    `,
    )
    .eq('id', reelId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  let isLiked = false;
  if (profileId) {
    const { data: like } = await socialSupabase
      .from('social_reel_likes')
      .select('id')
      .eq('reel_id', reelId)
      .eq('profile_id', profileId)
      .maybeSingle();
    isLiked = !!like;
  }

  return mapReel(data as DbReelRow, isLiked);
}

export async function getReelsByAuthorId(
  authorId: string,
  limit = 50,
  profileId?: string,
): Promise<Reel[]> {
  const { data, error } = await socialSupabase
    .from('social_reels')
    .select(
      `
      id, author_id, video_url, thumbnail_url, description,
      duration_seconds, like_count, comment_count, share_count, view_count, subjects,
      author:social_profiles!social_reels_author_id_fkey(
        id, username, display_name, avatar_url, role
      )
    `,
    )
    .eq('author_id', authorId)
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  const rows = (data ?? []) as DbReelRow[];

  let likedReelIds = new Set<string>();
  if (profileId && rows.length > 0) {
    const reelIds = rows.map((r) => r.id);
    const { data: likes } = await socialSupabase
      .from('social_reel_likes')
      .select('reel_id')
      .eq('profile_id', profileId)
      .in('reel_id', reelIds);
    likedReelIds = new Set((likes ?? []).map((l) => l.reel_id as string));
  }

  return rows.map((r) => mapReel(r, likedReelIds.has(r.id)));
}

export async function toggleReelLike(
  reelId: string,
  profileId: string,
  currentlyLiked: boolean,
): Promise<void> {
  if (currentlyLiked) {
    const { error } = await socialSupabase
      .from('social_reel_likes')
      .delete()
      .eq('reel_id', reelId)
      .eq('profile_id', profileId);
    if (error) throw error;
  } else {
    const { error } = await socialSupabase
      .from('social_reel_likes')
      .insert({ reel_id: reelId, profile_id: profileId });
    if (error) throw error;
  }
}

export async function createReel(
  profileId: string,
  schoolId: string | null,
  input: CreateReelInput,
): Promise<string> {
  const {
    videoUri,
    description,
    subjects = [],
    audience = 'public',
    durationSeconds = 0,
  } = input;

  const ext = (videoUri.split('.').pop() ?? 'mp4').toLowerCase();
  const fileName = `${profileId}/${Date.now()}.${ext}`;
  const contentType =
    ext === 'mov' ? 'video/quicktime' : ext === 'webm' ? 'video/webm' : 'video/mp4';

  const base64 = await FileSystem.readAsStringAsync(videoUri, {
    encoding: 'base64' as FileSystem.EncodingType,
  });

  // Decode base64 → Uint8Array using only built-in JS (no extra packages)
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const { error: uploadError } = await socialSupabase.storage
    .from('social-reels')
    .upload(fileName, bytes, {
      contentType,
      upsert: false,
    });

  if (uploadError) throw uploadError;

  const { data: urlData } = socialSupabase.storage
    .from('social-reels')
    .getPublicUrl(fileName);

  const { data: reel, error: insertError } = await socialSupabase
    .from('social_reels')
    .insert({
      author_id: profileId,
      school_id: schoolId,
      video_url: urlData.publicUrl,
      duration_seconds: durationSeconds,
      description: description ?? null,
      subjects,
      audience,
      moderation_status: 'pending',
    })
    .select('id')
    .single();

  if (insertError) throw insertError;

  // Trigger AI content screening (async — do not block)
  socialSupabase.functions
    .invoke('social-moderation', { body: { action: 'screenReel', reelId: (reel as { id: string }).id } })
    .catch(() => {});

  return (reel as { id: string }).id;
}
