// Supabase Edge Function: social-follows
// POST   ?targetProfileId=<uuid>  — follow
// DELETE ?targetProfileId=<uuid>  — unfollow
// GET    ?followers=<profileId>   — list followers
// GET    ?following=<profileId>  — list following
// GET    ?status=<targetProfileId> — check follow status
// Deploy: supabase functions deploy social-follows

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
};

const PROFILE_SELECT = 'id, user_id, username, display_name, avatar_url, role, is_verified, follower_count, following_count';

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'Missing or invalid Authorization header');
    }

    const supabaseUrl   = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnon  = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRole   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authedClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
      auth:   { persistSession: false },
    });

    const { data: { user }, error: authError } = await authedClient.auth.getUser();
    if (authError || !user) {
      return errorResponse(401, 'Invalid JWT token');
    }

    const adminClient = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    const url = new URL(req.url);
    const targetProfileId = url.searchParams.get('targetProfileId');
    const profileId      = url.searchParams.get('followers') ?? url.searchParams.get('following');
    const statusTarget   = url.searchParams.get('status');

    // ------------------------------------------------------------------
    // GET ?status=<targetProfileId> — check if current user follows target
    // ------------------------------------------------------------------
    if (req.method === 'GET' && statusTarget) {
      const { data: myProfile } = await adminClient
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!myProfile) {
        return jsonResponse(200, { success: true, data: { following: false } });
      }

      const { data: row } = await adminClient
        .from('social_follows')
        .select('id')
        .eq('follower_id', myProfile.id)
        .eq('following_id', statusTarget)
        .maybeSingle();

      return jsonResponse(200, { success: true, data: { following: !!row } });
    }

    // ------------------------------------------------------------------
    // GET ?followers=<profileId> — list followers
    // ------------------------------------------------------------------
    if (req.method === 'GET' && url.searchParams.has('followers')) {
      if (!profileId) return errorResponse(400, 'Provide followers=profileId');

      const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10));
      const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10));
      const offset = page * limit;

      const { data: followRows } = await adminClient
        .from('social_follows')
        .select('follower_id')
        .eq('following_id', profileId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const ids = (followRows ?? []).map((r) => r.follower_id);
      if (ids.length === 0) {
        return jsonResponse(200, { success: true, data: [] });
      }

      const { data: profiles, error } = await adminClient
        .from('social_profiles')
        .select(PROFILE_SELECT)
        .in('id', ids);

      if (error) return errorResponse(500, error.message);
      return jsonResponse(200, { success: true, data: profiles ?? [] });
    }

    // ------------------------------------------------------------------
    // GET ?following=<profileId> — list following
    // ------------------------------------------------------------------
    if (req.method === 'GET' && url.searchParams.has('following')) {
      if (!profileId) return errorResponse(400, 'Provide following=profileId');

      const page = Math.max(0, parseInt(url.searchParams.get('page') ?? '0', 10));
      const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10));
      const offset = page * limit;

      const { data: followRows } = await adminClient
        .from('social_follows')
        .select('following_id')
        .eq('follower_id', profileId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const ids = (followRows ?? []).map((r) => r.following_id);
      if (ids.length === 0) {
        return jsonResponse(200, { success: true, data: [] });
      }

      const { data: profiles, error } = await adminClient
        .from('social_profiles')
        .select(PROFILE_SELECT)
        .in('id', ids);

      if (error) return errorResponse(500, error.message);
      return jsonResponse(200, { success: true, data: profiles ?? [] });
    }

    // ------------------------------------------------------------------
    // POST ?targetProfileId=<uuid> — follow
    // ------------------------------------------------------------------
    if (req.method === 'POST') {
      if (!targetProfileId) return errorResponse(400, 'Provide targetProfileId');

      const { data: myProfile } = await adminClient
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!myProfile) return errorResponse(404, 'Profile not found');

      if (myProfile.id === targetProfileId) {
        return errorResponse(400, 'Cannot follow yourself');
      }

      const { error: insertErr } = await adminClient
        .from('social_follows')
        .insert({
          follower_id:  myProfile.id,
          following_id: targetProfileId,
        });

      if (insertErr) {
        if (insertErr.code === '23505') {
          return jsonResponse(200, { success: true, data: { following: true } });
        }
        return errorResponse(500, insertErr.message);
      }

      return jsonResponse(201, { success: true, data: { following: true } });
    }

    // ------------------------------------------------------------------
    // DELETE ?targetProfileId=<uuid> — unfollow
    // ------------------------------------------------------------------
    if (req.method === 'DELETE') {
      if (!targetProfileId) return errorResponse(400, 'Provide targetProfileId');

      const { data: myProfile } = await adminClient
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!myProfile) return errorResponse(404, 'Profile not found');

      await adminClient
        .from('social_follows')
        .delete()
        .eq('follower_id', myProfile.id)
        .eq('following_id', targetProfileId);

      return jsonResponse(200, { success: true, data: { following: false } });
    }

    return errorResponse(405, 'Method not allowed');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(500, message);
  }
});

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(status: number, message: string): Response {
  return jsonResponse(status, { success: false, error: message });
}
