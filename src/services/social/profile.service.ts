// tuto.social — Profile service (CRUD)

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { mapDbProfileToType } from './auth.service';
import { mapDbPostToType } from './feed.service';
import { uploadToStorage } from './media.service';
import type {
  SocialProfile,
  SocialPost,
  CreateSocialProfilePayload,
  UpdateSocialProfilePayload,
  SocialFollow,
} from '../../types/social';
import type { ReactionType } from '../../types/social';

// --------------------------------------------------------------------------
// School profile types
// --------------------------------------------------------------------------

export interface SchoolProfile {
  id: string;
  username: string;
  displayName: string;
  bio: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  isVerified: boolean;
  followerCount: number;
  postCount: number;
  schoolId: string;
}

export interface StaffMember {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  shieldCount: number;
  shieldRank: string;
  isVerified: boolean;
}

// --------------------------------------------------------------------------
// Read
// --------------------------------------------------------------------------

/** Fetch a profile by auth user ID */
export async function getProfileByUserId(userId: string): Promise<SocialProfile | null> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbProfileToType(data) : null;
}

/** Fetch a profile by social profile ID */
export async function getProfileById(profileId: string): Promise<SocialProfile | null> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .eq('id', profileId)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbProfileToType(data) : null;
}

/** Fetch a profile by username (case-insensitive) */
export async function getProfileByUsername(username: string): Promise<SocialProfile | null> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .ilike('username', username)
    .maybeSingle();

  if (error) throw error;
  return data ? mapDbProfileToType(data) : null;
}

/** Fetch all profiles belonging to a school */
export async function getSchoolProfiles(
  schoolId: string,
  options?: { role?: string; limit?: number; offset?: number },
): Promise<SocialProfile[]> {
  let query = socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .eq('school_id', schoolId)
    .order('display_name', { ascending: true });

  if (options?.role) query = query.eq('role', options.role);
  if (options?.limit) query = query.limit(options.limit);
  if (options?.offset) query = query.range(options.offset, (options.offset + (options.limit ?? 20)) - 1);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapDbProfileToType);
}

/** Fetch the school admin profile for a given school_id */
export async function getSchoolProfile(schoolId: string): Promise<SchoolProfile | null> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id, username, display_name, bio, avatar_url, cover_url, is_verified, follower_count, post_count, school_id')
    .eq('school_id', schoolId)
    .eq('role', 'school_admin')
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  return {
    id: data.id as string,
    username: (data.username as string) ?? '',
    displayName: (data.display_name as string) ?? '',
    bio: data.bio as string | null,
    avatarUrl: data.avatar_url as string | null,
    coverUrl: data.cover_url as string | null,
    isVerified: (data.is_verified as boolean) ?? false,
    followerCount: (data.follower_count as number) ?? 0,
    postCount: (data.post_count as number) ?? 0,
    schoolId: data.school_id as string,
  };
}

/** Fetch teachers belonging to this school — sorted by shield_count DESC */
export async function getSchoolStaff(schoolId: string): Promise<StaffMember[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id, username, display_name, avatar_url, shield_count, shield_rank, is_verified')
    .eq('school_id', schoolId)
    .eq('role', 'teacher')
    .order('shield_count', { ascending: false })
    .limit(20);

  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id as string,
    username: (p.username as string) ?? '',
    displayName: (p.display_name as string) ?? '',
    avatarUrl: p.avatar_url as string | null,
    shieldCount: (p.shield_count as number) ?? 0,
    shieldRank: (p.shield_rank as string) ?? 'beginner',
    isVerified: (p.is_verified as boolean) ?? false,
  }));
}

/** Fetch pinned + recent announcements for this school */
export async function getSchoolAnnouncements(schoolId: string, limit = 20): Promise<SocialPost[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified,
        school_id, shield_count
      )
    `)
    .eq('school_id', schoolId)
    .eq('post_type', 'announcement')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = data ?? [];
  let userReactions: Record<string, ReactionType> = {};
  const savedPostIds = new Set<string>();

  const { data: { user } } = await socialSupabase.auth.getUser();
  if (user && rows.length > 0) {
    const postIds = rows.map((r) => r.id as string);
    const { data: reactionsData } = await socialSupabase
      .from(SOCIAL_TABLES.likes)
      .select('post_id, reaction_type')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    (reactionsData ?? []).forEach((r: { post_id: string; reaction_type: string }) => {
      userReactions[r.post_id] = r.reaction_type as ReactionType;
    });
  }

  return rows.map((row) => mapDbPostToType(row, userReactions, savedPostIds));
}

/** Fetch recent achievement posts from this school (for spotlight section) */
export async function getSchoolAchievementSpotlights(schoolId: string, limit = 6): Promise<SocialPost[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.posts)
    .select(`
      *,
      author:social_profiles!social_posts_author_id_fkey(
        id, user_id, username, display_name, avatar_url, role, is_verified,
        school_id, shield_count
      )
    `)
    .eq('school_id', schoolId)
    .eq('post_type', 'achievement')
    .in('moderation_status', ['ai_reviewed', 'parent_approved'])
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;

  const rows = data ?? [];
  const userReactions: Record<string, ReactionType> = {};
  const savedPostIds = new Set<string>();

  const { data: { user } } = await socialSupabase.auth.getUser();
  if (user && rows.length > 0) {
    const postIds = rows.map((r) => r.id as string);
    const { data: reactionsData } = await socialSupabase
      .from(SOCIAL_TABLES.likes)
      .select('post_id, reaction_type')
      .eq('user_id', user.id)
      .in('post_id', postIds);
    (reactionsData ?? []).forEach((r: { post_id: string; reaction_type: string }) => {
      userReactions[r.post_id] = r.reaction_type as ReactionType;
    });
  }

  return rows.map((row) => mapDbPostToType(row, userReactions, savedPostIds));
}

// --------------------------------------------------------------------------
// Write
// --------------------------------------------------------------------------

/** Create a new social profile */
export async function createProfile(
  payload: CreateSocialProfilePayload,
): Promise<SocialProfile> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .insert({
      username:       payload.username,
      display_name:   payload.displayName,
      role:           payload.role,
      school_id:      payload.schoolId ?? null,
      linked_tuto_id: payload.linkedTutoId ?? null,
      avatar_url:     payload.avatarUrl ?? null,
      settings:       {
        pushNotifications:   true,
        emailNotifications:  false,
        allowDirectMessages: true,
        showInDiscovery:     true,
        language:            'vi',
      },
    })
    .select()
    .single();

  if (error) throw error;
  return mapDbProfileToType(data);
}

/** Update profile fields for the current user's profile */
export async function updateProfile(
  profileId: string,
  payload: UpdateSocialProfilePayload,
): Promise<SocialProfile> {
  const updateData: Record<string, unknown> = {};

  if (payload.displayName !== undefined) updateData.display_name = payload.displayName;
  if (payload.username !== undefined) {
    const lower = payload.username.toLowerCase().trim();
    const { count } = await socialSupabase
      .from(SOCIAL_TABLES.profiles)
      .select('id', { count: 'exact', head: true })
      .ilike('username', lower)
      .neq('id', profileId);
    if ((count ?? 0) > 0) throw new Error('Username already taken');
    updateData.username = lower;
  }
  if (payload.bio         !== undefined) updateData.bio          = payload.bio;
  if (payload.avatarUrl   !== undefined) updateData.avatar_url   = payload.avatarUrl;
  if (payload.coverUrl    !== undefined) updateData.cover_url    = payload.coverUrl;
  if (payload.isPrivate   !== undefined) updateData.is_private   = payload.isPrivate;
  if (payload.subjects    !== undefined) updateData.subjects     = payload.subjects;
  if (payload.settings) {
    // Merge settings — do not overwrite the entire JSONB column
    const { data: existing } = await socialSupabase
      .from(SOCIAL_TABLES.profiles)
      .select('settings')
      .eq('id', profileId)
      .single();

    updateData.settings = { ...(existing?.settings ?? {}), ...payload.settings };
  }

  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .update(updateData)
    .eq('id', profileId)
    .select()
    .single();

  if (error) throw error;
  return mapDbProfileToType(data);
}

// --------------------------------------------------------------------------
// Follow / Unfollow
// --------------------------------------------------------------------------

export interface FollowResult {
  following: boolean;
}

/** Follow another profile. Returns the resulting follow state. */
export async function followProfile(
  followerProfileId: string,
  followingProfileId: string,
): Promise<FollowResult> {
  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .insert({ follower_id: followerProfileId, following_id: followingProfileId });

  if (error) {
    // Unique constraint violation means already following — treat as success
    if (error.code === '23505') return { following: true };
    throw error;
  }

  return { following: true };
}

/** Unfollow a profile */
export async function unfollowProfile(
  followerProfileId: string,
  followingProfileId: string,
): Promise<FollowResult> {
  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .delete()
    .eq('follower_id', followerProfileId)
    .eq('following_id', followingProfileId);

  if (error) throw error;
  return { following: false };
}

/** Check if followerProfileId is following followingProfileId */
export async function isFollowing(
  followerProfileId: string,
  followingProfileId: string,
): Promise<boolean> {
  const { count, error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', followerProfileId)
    .eq('following_id', followingProfileId);

  if (error) throw error;
  return (count ?? 0) > 0;
}

/** Get followers of a profile (raw follow records) */
export async function getFollowers(
  profileId: string,
  limit = 20,
  offset = 0,
): Promise<SocialFollow[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .select('*')
    .eq('following_id', profileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id:          row.id as string,
    followerId:  row.follower_id as string,
    followingId: row.following_id as string,
    createdAt:   row.created_at as string,
  }));
}

/** Get profiles that a user is following */
export async function getFollowing(
  profileId: string,
  limit = 20,
  offset = 0,
): Promise<SocialFollow[]> {
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .select('*')
    .eq('follower_id', profileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;
  return (data ?? []).map((row) => ({
    id:          row.id as string,
    followerId:  row.follower_id as string,
    followingId: row.following_id as string,
    createdAt:   row.created_at as string,
  }));
}

// --------------------------------------------------------------------------
// Avatar & cover upload
// --------------------------------------------------------------------------

/** Upload avatar image and return public URL. Updates profile. */
export async function uploadAvatar(uri: string): Promise<string> {
  const url = await uploadToStorage(uri);
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!profile) throw new Error('Profile not found');
  await updateProfile(profile.id, { avatarUrl: url });
  return url;
}

/** Upload cover photo and return public URL. Updates profile. */
export async function uploadCoverPhoto(uri: string): Promise<string> {
  const url = await uploadToStorage(uri);
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const { data: profile } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id')
    .eq('user_id', user.id)
    .single();
  if (!profile) throw new Error('Profile not found');
  await updateProfile(profile.id, { coverUrl: url });
  return url;
}

/** Search users by display name or username. */
export async function searchUsers(query: string): Promise<SocialProfile[]> {
  const q = query.trim();
  if (!q) return [];

  const term = `%${q}%`;
  const { data, error } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .or(`display_name.ilike.${term},username.ilike.${term}`)
    .limit(30);

  if (error) throw error;
  return (data ?? []).map(mapDbProfileToType);
}
