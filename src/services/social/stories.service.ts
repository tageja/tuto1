// tuto.social — Stories service
// Fetches feed/author stories, creates, views, reacts via Edge Function

import { socialSupabase } from './api.client';
import Constants from 'expo-constants';

export interface Story {
  id: string;
  author_id: string;
  school_id: string | null;
  media_url: string;
  media_type: 'photo' | 'video';
  duration_seconds: number;
  text_overlay: string | null;
  text_color: string;
  audience: string;
  view_count: number;
  expires_at: string;
  created_at: string;
  author?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
}

export interface StoryGroup {
  authorId: string;
  author: Story['author'];
  stories: Story[];
}

export interface CreateStoryParams {
  mediaUri: string;
  mediaType: 'photo' | 'video';
  durationSeconds?: number;
  textOverlay?: string;
  textColor?: string;
  audience?: 'public' | 'school' | 'followers';
}

const supabaseUrl =
  (Constants.expoConfig?.extra?.supabaseUrl as string) ||
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  '';

async function authedFetch(
  path: string,
  init?: RequestInit & { body?: unknown },
): Promise<Response> {
  const { data: { session } } = await socialSupabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const url = `${supabaseUrl}/functions/v1/social-stories${path}`;
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    ...(init?.headers as Record<string, string>),
  };
  if (init?.body && typeof init.body === 'object' && !(init.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return fetch(url, {
    ...init,
    headers,
    body: init?.body instanceof FormData ? init.body : init?.body ? JSON.stringify(init.body) : undefined,
  });
}

async function fetchJson<T>(path: string, init?: RequestInit & { body?: unknown }): Promise<T> {
  const res = await authedFetch(path, init);
  const data = await res.json();
  if (!res.ok) throw new Error((data as { error?: string }).error ?? 'Request failed');
  return data as T;
}

export async function getFeedStories(): Promise<StoryGroup[]> {
  const data = await fetchJson<{ success: boolean; data: StoryGroup[] }>('?feed=1');
  return data.data ?? [];
}

export async function getAuthorStories(authorId: string): Promise<Story[]> {
  const data = await fetchJson<{ success: boolean; data: Story[] }>(
    `?authorId=${encodeURIComponent(authorId)}`,
  );
  return data.data ?? [];
}

export async function createStory(params: CreateStoryParams): Promise<Story> {
  const formData = new FormData();
  const json = JSON.stringify({
    mediaType: params.mediaType,
    durationSeconds: params.durationSeconds ?? 5,
    textOverlay: params.textOverlay ?? null,
    textColor: params.textColor ?? '#FFFFFF',
    audience: params.audience ?? 'school',
  });
  formData.append('json', json);

  const { data: { session } } = await socialSupabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const uri = params.mediaUri;
  const ext = uri.split('.').pop()?.toLowerCase() ?? 'jpg';
  const filename = `story.${ext}`;
  const mimeType = params.mediaType === 'video' ? 'video/mp4' : 'image/jpeg';

  // React Native FormData accepts { uri, type, name }
  formData.append('media', {
    uri,
    type: mimeType,
    name: filename,
  } as unknown as Blob);

  const url = `${supabaseUrl}/functions/v1/social-stories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });

  const result = await res.json();
  if (!res.ok) throw new Error((result as { error?: string }).error ?? 'Upload failed');
  return (result as { data: Story }).data;
}

export async function markViewed(storyId: string): Promise<void> {
  await fetchJson<{ success: boolean }>('?view=1', {
    method: 'POST',
    body: { storyId },
  });
}

export async function reactToStory(storyId: string, reaction = 'emoji'): Promise<void> {
  await fetchJson<{ success: boolean }>('?react=1', {
    method: 'POST',
    body: { storyId, reaction },
  });
}

export async function deleteStory(storyId: string): Promise<void> {
  const { data: { session } } = await socialSupabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Not authenticated');

  const url = `${supabaseUrl}/functions/v1/social-stories?storyId=${encodeURIComponent(storyId)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  const result = await res.json();
  if (!res.ok) throw new Error((result as { error?: string }).error ?? 'Delete failed');
}

export interface StoryViewer {
  viewer_id: string;
  viewed_at: string;
  viewer?: { id: string; username?: string; display_name?: string; avatar_url?: string };
}

export async function getStoryViewers(storyId: string): Promise<StoryViewer[]> {
  const data = await fetchJson<{ success: boolean; data: StoryViewer[] }>(
    `?storyId=${encodeURIComponent(storyId)}&viewers=1`,
  );
  return data.data ?? [];
}
