// supabase/functions/social-stories/index.ts
// GET  ?feed=1              — grouped stories from followed + same school
// GET  ?authorId=UUID       — active stories for author
// GET  ?storyId=UUID&viewers=1 — viewers list (author only)
// POST /                    — multipart: media + JSON; upload, insert
// POST ?view=1              — insert view (ignore duplicate)
// POST ?react=1             — insert/upsert reaction
// DELETE ?storyId=UUID       — delete own story

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const STORY_SELECT = `
  id,
  author_id,
  school_id,
  media_url,
  media_type,
  duration_seconds,
  text_overlay,
  text_color,
  audience,
  view_count,
  expires_at,
  created_at,
  author:social_profiles!social_stories_author_id_fkey(
    id, username, display_name, avatar_url
  )
`;

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: CORS });
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });
  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return jsonResponse(401, { error: 'Unauthorized' });
  }

  const url = new URL(req.url);
  const feed = url.searchParams.get('feed');
  const authorId = url.searchParams.get('authorId');
  const storyId = url.searchParams.get('storyId');
  const viewers = url.searchParams.get('viewers');
  const view = url.searchParams.get('view');
  const react = url.searchParams.get('react');

  try {
    // ── GET ?feed=1 ────────────────────────────────────────────────────────
    if (req.method === 'GET' && feed === '1') {
      const { data: rows, error } = await supabase
        .from('social_stories')
        .select(STORY_SELECT)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      const groups: Record<string, unknown[]> = {};
      for (const row of rows ?? []) {
        const r = row as Record<string, unknown>;
        const aid = r.author_id as string;
        if (!groups[aid]) groups[aid] = [];
        groups[aid].push(r);
      }
      const data = Object.entries(groups).map(([authorIdKey, stories]) => ({
        authorId: authorIdKey,
        author: (stories[0] as Record<string, unknown>).author,
        stories,
      }));
      return jsonResponse(200, { success: true, data });
    }

    // ── GET ?authorId=UUID ─────────────────────────────────────────────────
    if (req.method === 'GET' && authorId) {
      const { data, error } = await supabase
        .from('social_stories')
        .select(STORY_SELECT)
        .eq('author_id', authorId)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;
      return jsonResponse(200, { success: true, data: data ?? [] });
    }

    // ── GET ?storyId=UUID&viewers=1 ───────────────────────────────────────
    if (req.method === 'GET' && storyId && viewers === '1') {
      const { data: story } = await supabase
        .from('social_stories')
        .select('author_id')
        .eq('id', storyId)
        .single();

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!story || !profile || (story as { author_id: string }).author_id !== profile.id) {
        return jsonResponse(403, { error: 'Only author can view viewers list' });
      }

      const { data, error } = await supabase
        .from('social_story_views')
        .select(`
          viewer_id,
          viewed_at,
          viewer:social_profiles!social_story_views_viewer_id_fkey(
            id, username, display_name, avatar_url
          )
        `)
        .eq('story_id', storyId)
        .order('viewed_at', { ascending: false });

      if (error) throw error;
      return jsonResponse(200, { success: true, data: data ?? [] });
    }

    // ── POST ?view=1 ───────────────────────────────────────────────────────
    if (req.method === 'POST' && view === '1') {
      const body = (await req.json().catch(() => ({}))) as { storyId?: string };
      const sid = body.storyId ?? storyId;
      if (!sid) return jsonResponse(400, { error: 'Missing storyId' });

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) return jsonResponse(422, { error: 'Profile not found' });

      const { error } = await supabase
        .from('social_story_views')
        .upsert(
          { story_id: sid, viewer_id: profile.id },
          { onConflict: 'story_id,viewer_id' },
        );

      if (error) {
        if (error.code === '23503') return jsonResponse(404, { error: 'Story not found' });
        throw error;
      }
      return jsonResponse(201, { success: true });
    }

    // ── POST ?react=1 ───────────────────────────────────────────────────────
    if (req.method === 'POST' && react === '1') {
      const body = (await req.json().catch(() => ({}))) as { storyId?: string; reaction?: string };
      const sid = body.storyId ?? storyId;
      const reaction = body.reaction ?? 'emoji';
      if (!sid) return jsonResponse(400, { error: 'Missing storyId' });

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) return jsonResponse(422, { error: 'Profile not found' });

      const validReactions = ['emoji', 'like', 'love', 'laugh', 'wow', 'sad', 'angry'];
      const r = validReactions.includes(reaction) ? reaction : 'emoji';

      const { error } = await supabase
        .from('social_story_reactions')
        .upsert(
          { story_id: sid, reactor_id: profile.id, reaction: r },
          { onConflict: 'story_id,reactor_id' },
        );

      if (error) {
        if (error.code === '23503') return jsonResponse(404, { error: 'Story not found' });
        throw error;
      }
      return jsonResponse(201, { success: true });
    }

    // ── POST / (create story) ───────────────────────────────────────────────
    if (req.method === 'POST' && !view && !react) {
      const contentType = req.headers.get('Content-Type') ?? '';
      let mediaUrl: string;
      let payload: Record<string, unknown>;

      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('media') as File | null;
        const jsonStr = formData.get('json') as string | null;

        if (!file || !(file instanceof File)) {
          return jsonResponse(400, { error: 'Missing media file' });
        }

        payload = jsonStr ? (JSON.parse(jsonStr) as Record<string, unknown>) : {};

        const { data: profile } = await supabase
          .from('social_profiles')
          .select('id, school_id')
          .eq('user_id', user.id)
          .single();
        if (!profile) return jsonResponse(422, { error: 'Profile not found' });

        const storyIdNew = crypto.randomUUID();
        const ext = file.name.split('.').pop() ?? 'jpg';
        const path = `${(profile as { id: string }).id}/${storyIdNew}.${ext}`;

        const { error: uploadErr } = await adminClient.storage
          .from('social-stories')
          .upload(path, await file.arrayBuffer(), {
            contentType: file.type || 'image/jpeg',
            upsert: false,
          });
        if (uploadErr) return jsonResponse(500, { error: uploadErr.message });

        const { data: urlData } = adminClient.storage.from('social-stories').getPublicUrl(path);
        mediaUrl = urlData.publicUrl;

        const duration = (payload.durationSeconds as number) ?? 5;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const { data: inserted, error: insertErr } = await supabase
          .from('social_stories')
          .insert({
            id: storyIdNew,
            author_id: (profile as { id: string }).id,
            school_id: (profile as { school_id: string | null }).school_id,
            media_url: mediaUrl,
            media_type: (payload.mediaType as string) ?? 'photo',
            duration_seconds: Math.min(60, Math.max(1, duration)),
            text_overlay: (payload.textOverlay as string) ?? null,
            text_color: (payload.textColor as string) ?? '#FFFFFF',
            audience: (payload.audience as string) ?? 'school',
            expires_at: expiresAt.toISOString(),
          })
          .select(STORY_SELECT)
          .single();

        if (insertErr) throw insertErr;
        return jsonResponse(201, { success: true, data: inserted });
      }

      return jsonResponse(400, { error: 'Expect multipart/form-data with media and json' });
    }

    // ── DELETE ?storyId=UUID ────────────────────────────────────────────────
    if (req.method === 'DELETE' && storyId) {
      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();
      if (!profile) return jsonResponse(422, { error: 'Profile not found' });

      const { error } = await supabase
        .from('social_stories')
        .delete()
        .eq('id', storyId)
        .eq('author_id', (profile as { id: string }).id);

      if (error) throw error;
      return jsonResponse(200, { success: true });
    }

    return jsonResponse(405, { error: 'Method not allowed' });
  } catch (err) {
    return jsonResponse(500, { error: String(err) });
  }
});
