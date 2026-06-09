// tuto.social — Stories API (calls Edge Function)

import { getSupabaseBrowserClient } from './supabase';

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

export async function getFeedStories(): Promise<StoryGroup[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-stories?feed=1`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch stories');
  return json.data ?? [];
}

export async function getAuthorStories(authorId: string): Promise<Story[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return [];

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-stories?authorId=${encodeURIComponent(authorId)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${session.access_token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to fetch stories');
  return json.data ?? [];
}

export async function markViewed(storyId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-stories?view=1`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storyId }),
  });
}

export async function reactToStory(storyId: string, reaction = 'emoji'): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-stories?react=1`;
  await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ storyId, reaction }),
  });
}

export async function createStory(formData: FormData): Promise<Story> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/social-stories`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? 'Failed to create story');
  return json.data;
}
