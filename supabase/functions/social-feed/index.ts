// supabase/functions/social-feed/index.ts
// GET /social-feed?tab=school|forYou|following&cursor=<ISO>&limit=20
// Returns paginated posts for the requested feed tab. School-scoped per JWT.

import { serve }          from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient }   from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL       = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY  = Deno.env.get('SUPABASE_ANON_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const POST_SELECT = `
  *,
  author:social_profiles!social_posts_author_id_fkey(
    id, user_id, username, display_name, avatar_url, role, is_verified, shield_count
  )
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  try {
    const jwt = req.headers.get('Authorization')?.replace('Bearer ', '');
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${jwt}` } },
    });

    // Authenticate caller
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...CORS, 'Content-Type': 'application/json' },
      });
    }

    const url    = new URL(req.url);
    const tab    = url.searchParams.get('tab') ?? 'school';
    const cursor = url.searchParams.get('cursor');
    const limit  = Math.min(parseInt(url.searchParams.get('limit') ?? '20', 10), 50);

    // Fetch caller's profile for school_id
    const { data: profile } = await supabase
      .from('social_profiles')
      .select('id, school_id')
      .eq('user_id', user.id)
      .single();

    let query = supabase
      .from('social_posts')
      .select(POST_SELECT)
      .in('moderation_status', ['ai_reviewed', 'parent_approved'])
      .order('created_at', { ascending: false })
      .limit(limit + 1);

    if (cursor) query = query.lt('created_at', cursor);

    if (tab === 'school' && profile?.school_id) {
      query = query.eq('school_id', profile.school_id);
    } else if (tab === 'following') {
      const { data: follows } = await supabase
        .from('social_follows')
        .select('following_id')
        .eq('follower_id', profile?.id ?? '');

      const ids = (follows ?? []).map((f: Record<string, string>) => f.following_id);
      if (ids.length === 0) {
        return new Response(
          JSON.stringify({ data: [], hasMore: false, nextCursor: null }),
          { headers: { ...CORS, 'Content-Type': 'application/json' } },
        );
      }
      query = query.in('author_id', ids);
    } else if (tab === 'forYou' && profile?.school_id) {
      query = query.or(`visibility.eq.public,school_id.eq.${profile.school_id}`);
    } else {
      query = query.eq('visibility', 'public');
    }

    const { data, error } = await query;
    if (error) throw error;

    const rows     = data ?? [];
    const hasMore  = rows.length > limit;
    const slice    = hasMore ? rows.slice(0, limit) : rows;
    const nextCursor = hasMore
      ? (slice[slice.length - 1] as Record<string, unknown>).created_at as string
      : null;

    return new Response(
      JSON.stringify({ data: slice, hasMore, nextCursor }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
