// tuto.social — Auth service
//
// SSO bridge between the existing Tuto Supabase auth session and
// the social profile layer. On first social login, creates a profile
// if one doesn't exist yet.

import Constants from 'expo-constants';
import { socialSupabase, SOCIAL_TABLES } from './api.client';
import type { User, Session } from '@supabase/supabase-js';
import type { CreateSocialProfilePayload, SocialProfile } from '../../types/social';

// --------------------------------------------------------------------------
// Session helpers
// --------------------------------------------------------------------------

/** Returns the current Supabase auth session, or null if not logged in */
export async function getSocialSession(): Promise<Session | null> {
  const { data: { session } } = await socialSupabase.auth.getSession();
  return session;
}

/** Returns the current Supabase auth user, or null */
export async function getSocialAuthUser(): Promise<User | null> {
  const { data: { user } } = await socialSupabase.auth.getUser();
  return user;
}

/** Signs out from Supabase (clears persisted session) */
export async function signOutSocial(): Promise<void> {
  const { error } = await socialSupabase.auth.signOut();
  if (error) throw error;
}

// --------------------------------------------------------------------------
// SSO integration
// --------------------------------------------------------------------------

/**
 * Called once on app start / social tab mount.
 * Checks if the authenticated user already has a social profile.
 * If not, triggers profile creation with safe defaults.
 *
 * Returns the existing or newly created social profile, or null if
 * the user is not authenticated.
 */
export async function ensureSocialProfile(
  payload?: Partial<CreateSocialProfilePayload>,
): Promise<SocialProfile | null> {
  const user = await getSocialAuthUser();
  if (!user) return null;

  // Check for existing profile
  const { data: existing, error: fetchError } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    console.error('[social/auth] Error fetching social profile:', fetchError.message);
    throw fetchError;
  }

  if (existing) {
    const profile = mapDbProfileToType(existing);
    registerPushToken(user.id).catch(() => { /* ignore push reg errors */ });
    return profile;
  }

  // Create a new profile with sane defaults derived from auth metadata
  const metadata = user.user_metadata ?? {};
  const username = await generateUniqueUsername(
    metadata.full_name || metadata.name || user.email?.split('@')[0] || 'user',
  );

  const newProfile: Record<string, unknown> = {
    user_id:        user.id,
    username,
    display_name:   payload?.displayName || metadata.full_name || metadata.name || username,
    role:           payload?.role ?? 'parent',
    avatar_url:     payload?.avatarUrl || metadata.avatar_url || metadata.picture || null,
    school_id:      payload?.schoolId ?? null,
    linked_tuto_id: payload?.linkedTutoId ?? null,
    settings:       defaultSettings(),
  };

  const { data: created, error: createError } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .insert(newProfile)
    .select()
    .single();

  if (createError) {
    console.error('[social/auth] Error creating social profile:', createError.message);
    throw createError;
  }

  registerPushToken(user.id).catch(() => { /* ignore push reg errors */ });
  return mapDbProfileToType(created);
}

/**
 * Register Expo Push token for the current user. Called on login / ensureSocialProfile.
 * Stores token in social_profiles.push_token for the social-notify Edge Function.
 */
export async function registerPushToken(userId: string): Promise<void> {
  try {
    const { default: Notifications } = await import('expo-notifications');
    const { default: Device } = await import('expo-device');

    if (!Device.isDevice) return;

    const { status: existing } = await Notifications.getPermissionsAsync();
    let permission = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      permission = status;
    }
    if (permission !== 'granted') return;

    const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } })?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const token = tokenData?.data;
    if (!token) return;

    const { error } = await socialSupabase
      .from(SOCIAL_TABLES.profiles)
      .update({ push_token: token })
      .eq('user_id', userId);

    if (error) {
      console.warn('[social/auth] Push token update failed:', error.message);
    }
  } catch (e) {
    console.warn('[social/auth] Push registration skipped:', e);
  }
}

// --------------------------------------------------------------------------
// Internal helpers
// --------------------------------------------------------------------------

async function generateUniqueUsername(base: string): Promise<string> {
  // Sanitise: lowercase, replace spaces/dots with underscores, remove non-word chars
  const sanitised = base
    .toLowerCase()
    .replace(/[\s.]+/g, '_')
    .replace(/[^\w]/g, '')
    .slice(0, 20);

  const candidate = sanitised || 'user';

  // Check if it already exists
  const { count } = await socialSupabase
    .from(SOCIAL_TABLES.profiles)
    .select('id', { count: 'exact', head: true })
    .eq('username', candidate);

  if ((count ?? 0) === 0) return candidate;

  // Append random suffix to avoid collision
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${candidate}_${suffix}`;
}

function defaultSettings() {
  return {
    pushNotifications:     true,
    emailNotifications:    false,
    allowDirectMessages:   true,
    showInDiscovery:       true,
    language:              'vi',
  };
}

/** Maps a raw DB row to the typed SocialProfile interface */
export function mapDbProfileToType(row: Record<string, unknown>): SocialProfile {
  return {
    id:             row.id as string,
    userId:         row.user_id as string,
    username:       row.username as string,
    displayName:    (row.display_name as string) ?? '',
    bio:            row.bio as string | undefined,
    avatarUrl:      row.avatar_url as string | undefined,
    coverUrl:       row.cover_url as string | undefined,
    role:           row.role as SocialProfile['role'],
    isVerified:     (row.is_verified as boolean) ?? false,
    isPrivate:      (row.is_private as boolean) ?? false,
    followerCount:  (row.follower_count as number) ?? 0,
    followingCount: (row.following_count as number) ?? 0,
    postCount:      (row.post_count as number) ?? 0,
    schoolId:       row.school_id as string | undefined,
    xp:             (row.xp as number) ?? 0,
    level:          (row.level as number) ?? 1,
    streakCount:    (row.streak_count as number) ?? 0,
    shieldCount:    (row.shield_count as number) ?? 0,
    shieldRank:     (row.shield_rank as SocialProfile['shieldRank']) ?? 'beginner',
    linkedTutoId:   row.linked_tuto_id as string | undefined,
    subjects:       (row.subjects as string[]) ?? [],
    settings:       (row.settings as SocialProfile['settings']) ?? defaultSettings(),
    createdAt:      row.created_at as string,
    updatedAt:      row.updated_at as string,
  };
}
