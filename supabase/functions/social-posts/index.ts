// supabase/functions/social-posts/index.ts
// GET    /social-posts?id=<uuid>       — single post
// POST   /social-posts                 — create post (multipart/json body)
// DELETE /social-posts?id=<uuid>       — delete own post

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type':                 'application/json',
};

const POST_SELECT = `
  *,
  author:social_profiles!social_posts_author_id_fkey(
    id, user_id, username, display_name, avatar_url, role, is_verified, shield_count
  )
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data: { user }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: CORS });
  }

  const url    = new URL(req.url);
  const postId = url.searchParams.get('id');

  try {
    // ── GET ──────────────────────────────────────────────────────────────────
    if (req.method === 'GET') {
      if (!postId) {
        return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: CORS });
      }

      const { data, error } = await supabase
        .from('social_posts')
        .select(POST_SELECT)
        .eq('id', postId)
        .single();

      if (error || !data) {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404, headers: CORS });
      }

      return new Response(JSON.stringify({ data }), { headers: CORS });
    }

    // ── POST ─────────────────────────────────────────────────────────────────
    if (req.method === 'POST') {
      const body = await req.json() as Record<string, unknown>;

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id, school_id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 422, headers: CORS });
      }

      const { data, error } = await supabase
        .from('social_posts')
        .insert({
          author_id:   profile.id,
          school_id:   profile.school_id,
          post_type:   body.postType,
          content:     body.content ?? '',
          media_urls:  body.mediaUrls ?? [],
          visibility:  body.visibility ?? 'school_only',
          subjects:    body.subjects ?? [],
          location:    body.location ?? null,
          poll:        body.poll ?? null,
          event:       body.event ?? null,
          assignment:  body.assignment ?? null,
          achievement: body.achievement ?? null,
        })
        .select(POST_SELECT)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), { status: 201, headers: CORS });
    }

    // ── DELETE ───────────────────────────────────────────────────────────────
    if (req.method === 'DELETE') {
      if (!postId) {
        return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400, headers: CORS });
      }

      const { data: profile } = await supabase
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!profile) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 422, headers: CORS });
      }

      const { error } = await supabase
        .from('social_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', profile.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), { headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS });
  }
});
