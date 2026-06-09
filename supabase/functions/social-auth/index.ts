// Supabase Edge Function: social-auth
// SSO endpoint: ensures an authenticated user has a social profile.
// Called from the mobile app on first social tab visit.
// Deploy: supabase functions deploy social-auth

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return errorResponse(405, 'Method not allowed');
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return errorResponse(401, 'Missing Authorization header');
    }

    const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRoleKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    // Verify JWT
    const authedClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
      auth:   { persistSession: false },
    });

    const { data: { user }, error: authError } = await authedClient.auth.getUser();
    if (authError || !user) {
      return errorResponse(401, 'Invalid token');
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    // Check if profile already exists
    const { data: existing } = await adminClient
      .from('social_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      return jsonResponse(200, {
        success:   true,
        created:   false,
        profile:   existing,
        message:   'Profile already exists',
      });
    }

    // Parse optional body for extra profile fields
    const body = await req.json().catch(() => ({})) as Record<string, unknown>;

    // Generate a username from auth metadata
    const meta = user.user_metadata ?? {};
    const baseName = (
      (meta.full_name as string) ||
      (meta.name as string) ||
      user.email?.split('@')[0] ||
      'user'
    );
    const username = await generateUniqueUsername(baseName, adminClient);

    const newProfile = {
      user_id:        user.id,
      username,
      display_name:   (body.displayName as string) || baseName,
      role:           (body.role as string) || 'parent',
      avatar_url:     (body.avatarUrl as string) || (meta.avatar_url as string) || (meta.picture as string) || null,
      school_id:      (body.schoolId as string)   || null,
      linked_tuto_id: (body.linkedTutoId as string) || null,
      settings: {
        pushNotifications:   true,
        emailNotifications:  false,
        allowDirectMessages: true,
        showInDiscovery:     true,
        language:            'vi',
      },
    };

    const { data: created, error: createError } = await adminClient
      .from('social_profiles')
      .insert(newProfile)
      .select()
      .single();

    if (createError) {
      return errorResponse(500, `Failed to create profile: ${createError.message}`);
    }

    return jsonResponse(201, {
      success: true,
      created: true,
      profile: created,
      message: 'Social profile created',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';
    return errorResponse(500, message);
  }
});

// --------------------------------------------------------------------------
// Helpers
// --------------------------------------------------------------------------

async function generateUniqueUsername(
  base: string,
  // deno-lint-ignore no-explicit-any
  adminClient: any,
): Promise<string> {
  const sanitised = base
    .toLowerCase()
    .replace(/[\s.]+/g, '_')
    .replace(/[^\w]/g, '')
    .slice(0, 20) || 'user';

  const { count } = await adminClient
    .from('social_profiles')
    .select('id', { count: 'exact', head: true })
    .eq('username', sanitised);

  if ((count ?? 0) === 0) return sanitised;

  // Append random 4-digit suffix
  const suffix = Math.floor(Math.random() * 9000) + 1000;
  return `${sanitised}_${suffix}`;
}

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(status: number, message: string): Response {
  return jsonResponse(status, { success: false, error: message });
}
