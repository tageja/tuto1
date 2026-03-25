// tuto.social — Follow service (follow/unfollow, followers/following lists)

import { socialSupabase, SOCIAL_TABLES } from './api.client';
import { getProfileByUserId } from './profile.service';
import { mapDbProfileToType } from './auth.service';
import type { SocialProfile } from '../../types/social';

const PAGE_SIZE = 20;

/** Follow another user by their profile ID. Resolves current user's profile from auth. */
export async function followUser(targetProfileId: string): Promise<void> {
  const profile = await getCurrentUserProfile();
  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .insert({ follower_id: profile.id, following_id: targetProfileId });

  if (error) {
    if (error.code === '23505') return; // already following
    throw error;
  }
}

/** Unfollow a user by their profile ID. */
export async function unfollowUser(targetProfileId: string): Promise<void> {
  const profile = await getCurrentUserProfile();
  const { error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .delete()
    .eq('follower_id', profile.id)
    .eq('following_id', targetProfileId);

  if (error) throw error;
}

/** Get followers of a profile as full SocialProfile objects. */
export async function getFollowersProfiles(
  profileId: string,
  page = 0,
): Promise<SocialProfile[]> {
  const offset = page * PAGE_SIZE;
  const { data: followRows, error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .select('follower_id')
    .eq('following_id', profileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;
  if (!followRows?.length) return [];

  const followerIds = followRows.map((r) => r.follower_id as string);
  const { data: profiles, error: profilesError } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .in('id', followerIds);

  if (profilesError) throw profilesError;
  return (profiles ?? []).map(mapDbProfileToType);
}

/** Get profiles that a user is following. */
export async function getFollowingProfiles(
  profileId: string,
  page = 0,
): Promise<SocialProfile[]> {
  const offset = page * PAGE_SIZE;
  const { data: followRows, error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .select('following_id')
    .eq('follower_id', profileId)
    .order('created_at', { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (error) throw error;
  if (!followRows?.length) return [];

  const followingIds = followRows.map((r) => r.following_id as string);
  const { data: profiles, error: profilesError } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .in('id', followingIds);

  if (profilesError) throw profilesError;
  return (profiles ?? []).map(mapDbProfileToType);
}

/** Check if current user is following target profile. */
export async function getFollowStatus(
  targetProfileId: string,
): Promise<'following' | 'not_following'> {
  const profile = await getCurrentUserProfile();
  const { count, error } = await socialSupabase
    .from(SOCIAL_TABLES.follows)
    .select('id', { count: 'exact', head: true })
    .eq('follower_id', profile.id)
    .eq('following_id', targetProfileId);

  if (error) throw error;
  return (count ?? 0) > 0 ? 'following' : 'not_following';
}

async function getCurrentUserProfile(): Promise<SocialProfile> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  const profile = await getProfileByUserId(user.id);
  if (!profile) throw new Error('Social profile not found');
  return profile;
}
