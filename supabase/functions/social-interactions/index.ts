// supabase/functions/social-interactions/index.ts
//
// POST   /social-interactions/react     { postId, reactionType }  — upsert reaction
// DELETE /social-interactions/react     { postId }                — remove reaction
// POST   /social-interactions/save      { postId }                — save post
// DELETE /social-interactions/save      { postId }                — unsave post
// POST   /social-interactions/comment   { postId, content, parentId? } — add comment
// GET    /social-interactions/comments?postId=<uuid>&limit=30&offset=0

import { serve }        from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL      = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type':                 'application/json',
};

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

  const url     = new URL(req.url);
  const action  = url.pathname.split('/').pop(); // react | save | comment | comments

  try {
    // ── GET: list comments ───────────────────────────────────────────────────
    if (req.method === 'GET' && action === 'comments') {
      const postId = url.searchParams.get('postId');
      const limit  = parseInt(url.searchParams.get('limit')  ?? '30', 10);
      const offset = parseInt(url.searchParams.get('offset') ?? '0',  10);

      if (!postId) {
        return new Response(JSON.stringify({ error: 'Missing postId' }), { status: 400, headers: CORS });
      }

      const { data, error } = await supabase
        .from('social_comments')
        .select(`
          *,
          author:social_profiles!social_comments_author_id_fkey(
            id, display_name, avatar_url, role, is_verified
          )
        `)
        .eq('post_id', postId)
        .is('parent_id', null)
        .order('is_pinned',  { ascending: false })
        .order('created_at', { ascending: true })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return new Response(JSON.stringify({ data }), { headers: CORS });
    }

    // All remaining actions require a JSON body
    const body = req.method !== 'GET' ? await req.json() as Record<string, unknown> : {};

    // Get caller's profile for user_id lookups
    const { data: profile } = await supabase
      .from('social_profiles')
      .select('id')
      .eq('user_id', user.id)
      .single();

    // ── React ────────────────────────────────────────────────────────────────
    if (action === 'react') {
      const postId = body.postId as string;
      if (!postId) return new Response(JSON.stringify({ error: 'Missing postId' }), { status: 400, headers: CORS });

      if (req.method === 'POST') {
        const { error } = await supabase
          .from('social_likes')
          .upsert(
            { post_id: postId, user_id: user.id, reaction_type: body.reactionType },
            { onConflict: 'post_id,user_id' },
          );
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: CORS });
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('social_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: CORS });
      }
    }

    // ── Save ─────────────────────────────────────────────────────────────────
    if (action === 'save') {
      const postId = body.postId as string;
      if (!postId) return new Response(JSON.stringify({ error: 'Missing postId' }), { status: 400, headers: CORS });

      if (req.method === 'POST') {
        const { error } = await supabase
          .from('social_saves')
          .insert({ post_id: postId, user_id: user.id });
        if (error && error.code !== '23505') throw error;
        return new Response(JSON.stringify({ success: true }), { headers: CORS });
      }

      if (req.method === 'DELETE') {
        const { error } = await supabase
          .from('social_saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        if (error) throw error;
        return new Response(JSON.stringify({ success: true }), { headers: CORS });
      }
    }

    // ── Comment ──────────────────────────────────────────────────────────────
    if (action === 'comment' && req.method === 'POST') {
      const postId = body.postId as string;
      if (!postId || !body.content) {
        return new Response(JSON.stringify({ error: 'Missing postId or content' }), { status: 400, headers: CORS });
      }
      if (!profile) {
        return new Response(JSON.stringify({ error: 'Profile not found' }), { status: 422, headers: CORS });
      }

      const { data, error } = await supabase
        .from('social_comments')
        .insert({
          post_id:   postId,
          author_id: profile.id,
          content:   body.content,
          parent_id: body.parentId ?? null,
        })
        .select(`
          *,
          author:social_profiles!social_comments_author_id_fkey(
            id, display_name, avatar_url, role, is_verified
          )
        `)
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ data }), { status: 201, headers: CORS });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: CORS });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: CORS });
  }
});
