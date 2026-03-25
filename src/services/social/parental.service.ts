// tuto.social — Parental controls service

import Constants from 'expo-constants';
import { socialSupabase } from './api.client';

export interface ParentalSettings {
  screen_time_limit_mins?: number | null;
  content_filter_level?: string | null;
  activity_report_frequency?: string | null;
}

export interface ChildActivity {
  postsCreated: number;
  likesGiven: number;
  commentsMade: number;
  period: string;
  profile: { id: string; display_name: string };
  parental_settings: Record<string, unknown>;
}

const getSupabaseUrl = () =>
  (Constants.expoConfig?.extra?.supabaseUrl as string) || process.env.EXPO_PUBLIC_SUPABASE_URL || '';

export async function getChildActivity(profileId: string, period = '7d'): Promise<ChildActivity> {
  const { data: { session } } = await socialSupabase.auth.getSession();
  const baseUrl = getSupabaseUrl();
  const res = await fetch(
    `${baseUrl}/functions/v1/social-parental?profileId=${encodeURIComponent(profileId)}&period=${encodeURIComponent(period)}`,
    {
      headers: { Authorization: `Bearer ${session?.access_token ?? ''}` },
    }
  );

  const json = (await res.json()) as { error?: string; data?: ChildActivity };
  if (!res.ok || json.error) throw new Error(json.error ?? 'Failed to fetch activity');
  if (!json.data) throw new Error('No data returned');
  return json.data;
}

export async function setParentalControls(childProfileId: string, settings: ParentalSettings): Promise<void> {
  const { data, error } = await socialSupabase.functions.invoke('social-parental', {
    method: 'POST',
    body: { action: 'setControls', profileId: childProfileId, settings },
  });

  const body = data as { error?: string };
  if (error) throw error;
  if (body?.error) throw new Error(body.error);
}
