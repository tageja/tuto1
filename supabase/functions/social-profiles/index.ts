// Supabase Edge Function: social-profiles
// Handles GET (fetch profile) and POST (upsert profile)
// Deploy: supabase functions deploy social-profiles

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Verify JWT — extract user from Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'Missing or invalid Authorization header');
    }

    const supabaseUrl    = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Use authed client to verify JWT
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth:   { persistSession: false },
    });

    const { data: { user }, error: authError } = await authedClient.auth.getUser();
    if (authError || !user) {
      return errorResponse(401, 'Invalid JWT token');
    }

    // Use service role client for DB writes (bypasses RLS where needed)
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const url = new URL(req.url);

    // ----------------------------------------------------------------
    // GET /social-profiles?userId=<uuid>
    //     /social-profiles?username=<str>
    // ----------------------------------------------------------------
    if (req.method === 'GET') {
      const userId   = url.searchParams.get('userId');
      const username = url.searchParams.get('username');

      if (!userId && !username) {
        return errorResponse(400, 'Provide userId or username query param');
      }

      let query = authedClient.from('social_profiles').select('*');

      if (userId)   query = query.eq('user_id', userId);
      if (username) query = query.ilike('username', username);

      const { data, error } = await query.maybeSingle();
      if (error) return errorResponse(500, error.message);

      if (!data) return errorResponse(404, 'Profile not found');

      return jsonResponse(200, { success: true, data });
    }

    // ----------------------------------------------------------------
    // POST /social-profiles — create or upsert profile for current user
    // ----------------------------------------------------------------
    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));

      const {
        username,
        displayName,
        role     = 'parent',
        schoolId,
        linkedTutoId,
        avatarUrl,
        bio,
      } = body as Record<string, string | undefined>;

      if (!username) {
        return errorResponse(400, 'username is required');
      }

      // Check username uniqueness (case-insensitive)
      const { count } = await adminClient
        .from('social_profiles')
        .select('id', { count: 'exact', head: true })
        .ilike('username', username)
        .neq('user_id', user.id);  // allow re-using own username

      if ((count ?? 0) > 0) {
        return errorResponse(409, 'Username already taken');
      }

      const profileData = {
        user_id:        user.id,
        username:       username.toLowerCase().trim(),
        display_name:   displayName || username,
        role,
        school_id:      schoolId   || null,
        linked_tuto_id: linkedTutoId || null,
        avatar_url:     avatarUrl  || user.user_metadata?.avatar_url || null,
        bio:            bio        || null,
        settings: {
          pushNotifications:   true,
          emailNotifications:  false,
          allowDirectMessages: true,
          showInDiscovery:     true,
          language:            'vi',
        },
      };

      const { data, error } = await adminClient
        .from('social_profiles')
        .upsert(profileData, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) return errorResponse(500, error.message);

      return jsonResponse(201, { success: true, data });
    }

    // ----------------------------------------------------------------
    // PUT /social-profiles — update fields for current user's profile
    // ----------------------------------------------------------------
    if (req.method === 'PUT') {
      const body = await req.json().catch(() => ({}));

      // Find the profile for this user
      const { data: existing } = await adminClient
        .from('social_profiles')
        .select('id, settings')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!existing) {
        return errorResponse(404, 'Profile not found. Create it first.');
      }

      const allowed = [
        'display_name', 'bio', 'avatar_url', 'cover_url',
        'is_private', 'subjects',
      ] as const;

      const updateData: Record<string, unknown> = {};
      for (const key of allowed) {
        if (body[key] !== undefined) updateData[key] = body[key];
      }

      // Merge settings
      if (body.settings && typeof body.settings === 'object') {
        updateData.settings = { ...(existing.settings ?? {}), ...body.settings };
      }

      if (Object.keys(updateData).length === 0) {
        return errorResponse(400, 'No valid fields to update');
      }

      const { data, error } = await adminClient
        .from('social_profiles')
        .update(updateData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) return errorResponse(500, error.message);

      return jsonResponse(200, { success: true, data });
    }

    return errorResponse(405, 'Method not allowed');
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(500, message);
  }
});

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(status: number, message: string): Response {
  return jsonResponse(status, { success: false, error: message });
}
