// tuto.social — Stories API (direct Supabase queries; no edge function required)
import { getSupabaseBrowserClient } from './supabase';

export interface Story {
  id:               string;
  author_id:        string;
  school_id:        string | null;
  media_url:        string;
  media_type:       'photo' | 'video';
  duration_seconds: number;
  text_overlay:     string | null;
  text_color:       string;
  audience:         string;
  view_count:       number;
  expires_at:       string;
  created_at:       string;
  author?: {
    id:           string;
    username?:    string;
    display_name?: string;
    avatar_url?:  string;
  };
}

export interface StoryGroup {
  authorId: string;
  author:   Story['author'];
  stories:  Story[];
  hasUnseen?: boolean;
}

const STORY_SELECT = `
  id, author_id, school_id, media_url, media_type, duration_seconds,
  text_overlay, text_color, audience, view_count, expires_at, created_at,
  author:social_profiles!social_stories_author_id_fkey(
    id, username, display_name, avatar_url
  )
`;

export async function getFeedStories(): Promise<StoryGroup[]> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();

  let seenStoryIds = new Set<string>();

  if (session) {
    // Get current viewer's profile id
    const { data: profile } = await supabase
      .from('social_profiles')
      .select('id')
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (profile) {
      const { data: views } = await supabase
        .from('social_story_views')
        .select('story_id')
        .eq('viewer_id', profile.id);
      seenStoryIds = new Set((views ?? []).map((v: { story_id: string }) => v.story_id));
    }
  }

  const { data, error } = await supabase
    .from('social_stories')
    .select(STORY_SELECT)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  const stories = (data ?? []) as unknown as Story[];

  // Group by author
  const byAuthor = new Map<string, Story[]>();
  for (const story of stories) {
    const arr = byAuthor.get(story.author_id) ?? [];
    arr.push(story);
    byAuthor.set(story.author_id, arr);
  }

  return Array.from(byAuthor.entries()).map(([authorId, authorStories]) => ({
    authorId,
    author: authorStories[0].author,
    stories: authorStories,
    hasUnseen: authorStories.some((s) => !seenStoryIds.has(s.id)),
  }));
}

export async function getAuthorStories(authorId: string): Promise<Story[]> {
  const supabase = getSupabaseBrowserClient();
  const { data, error } = await supabase
    .from('social_stories')
    .select(STORY_SELECT)
    .eq('author_id', authorId)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as Story[];
}

export async function markViewed(storyId: string): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: profile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (!profile) return;

  await supabase.from('social_story_views').upsert(
    { story_id: storyId, viewer_id: profile.id },
    { onConflict: 'story_id,viewer_id' },
  );

  // Increment view count via DB RPC (migration 082)
  const { error: rpcErr } = await supabase.rpc('increment_story_view', { story_id: storyId });
  if (rpcErr) console.error('[stories] increment_story_view failed:', rpcErr.message);
}

export async function reactToStory(storyId: string, reaction = 'emoji'): Promise<void> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;

  const { data: profile } = await supabase
    .from('social_profiles')
    .select('id')
    .eq('user_id', session.user.id)
    .maybeSingle();
  if (!profile) return;

  await supabase.from('social_story_reactions').upsert(
    { story_id: storyId, reactor_id: profile.id, reaction },
    { onConflict: 'story_id,reactor_id' },
  );
}

export async function createStory(formData: FormData): Promise<Story> {
  const supabase = getSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('social_profiles')
    .select('id, school_id')
    .eq('user_id', session.user.id)
    .single();
  if (!profile) throw new Error('Profile not found');

  const file = formData.get('file') as File | null;
  if (!file) throw new Error('No file provided');

  const ext  = file.name.split('.').pop() ?? 'jpg';
  const path = `stories/${session.user.id}/${Date.now()}.${ext}`;
  const { error: uploadErr } = await supabase.storage
    .from('social-media')
    .upload(path, file, { cacheControl: '3600', upsert: false });
  if (uploadErr) throw uploadErr;

  const { data: { publicUrl } } = supabase.storage.from('social-media').getPublicUrl(path);

  const { data, error } = await supabase
    .from('social_stories')
    .insert({
      author_id:        profile.id,
      school_id:        profile.school_id,
      media_url:        publicUrl,
      media_type:       'photo',
      duration_seconds: 5,
      text_overlay:     (formData.get('textOverlay') as string | null) ?? null,
      audience:         (formData.get('audience') as string | null) ?? 'schoolOnly',
    })
    .select(STORY_SELECT)
    .single();

  if (error) throw error;
  return data as unknown as Story;
}
