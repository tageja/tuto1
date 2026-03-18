// tuto.social — Profile service (CRUD)

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { mapDbProfileToType } from './auth.service';
import type {
  SocialProfile,
  CreateSocialProfilePayload,
  UpdateSocialProfilePayload,
  SocialFollow,
} from '../../types/social';

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

/** Get followers of a profile */
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
