// Supabase Edge Function: social-parental
// Parental controls, child activity, activity reports
// Deploy: supabase functions deploy social-parental

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(401, 'Missing or invalid Authorization header');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnon = Deno.env.get('SUPABASE_ANON_KEY')!;
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const authedClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false },
    });

    const { data: { user }, error: authError } = await authedClient.auth.getUser();
    if (authError || !user) {
      return errorResponse(401, 'Invalid JWT token');
    }

    const adminClient = createClient(supabaseUrl, serviceRole, {
      auth: { persistSession: false },
    });

    const url = new URL(req.url);
    const profileId = url.searchParams.get('profileId');
    const period = url.searchParams.get('period') ?? '7d';

    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const action = body.action as string;

      if (action === 'setControls') {
        const childProfileId = (body.profileId ?? body.childProfileId) as string;
        const settings = body.settings as Record<string, unknown>;
        if (!childProfileId || !settings) {
          return errorResponse(400, 'profileId and settings required');
        }

        const parentProfile = await getCallerProfile(adminClient, user.id);
        if (!parentProfile) return errorResponse(404, 'Profile not found');

        const { data: childProfile } = await adminClient
          .from('social_profiles')
          .select('id, user_id, role, school_id')
          .eq('id', childProfileId)
          .maybeSingle();

        if (!childProfile) return errorResponse(404, 'Child profile not found');

        const canManage = await canParentViewChild(adminClient, user.id, parentProfile, childProfile);
        if (!canManage) {
          return errorResponse(403, 'Not authorized to set controls for this profile');
        }

        const { error: updateErr } = await adminClient
          .from('social_profiles')
          .update({
            parental_settings: {
              screen_time_limit_mins: settings.screenTimeLimitMins ?? null,
              content_filter_level: settings.contentFilterLevel ?? null,
              activity_report_frequency: settings.activityReportFrequency ?? null,
              updated_at: new Date().toISOString(),
            },
          })
          .eq('id', childProfileId);

        if (updateErr) return errorResponse(500, updateErr.message);
        return jsonResponse(200, { success: true });
      }

      return errorResponse(400, 'Unknown action');
    }

    if (req.method === 'GET') {
      if (!profileId) return errorResponse(400, 'profileId required');

      const parentProfile = await getCallerProfile(adminClient, user.id);
      if (!parentProfile) return errorResponse(404, 'Profile not found');

      const { data: childProfile } = await adminClient
        .from('social_profiles')
        .select('id, user_id, display_name, role, school_id, parental_settings')
        .eq('id', profileId)
        .maybeSingle();

      if (!childProfile) return errorResponse(404, 'Profile not found');

      // Verify parent-child relationship: same school + caller is parent, target is student
      const isLinked = await canParentViewChild(adminClient, user.id, parentProfile, childProfile);
      if (!isLinked) {
        return errorResponse(403, 'Not authorized to view this profile');
      }

      const since = periodToDate(period);

      // Activity summary: posts, likes, comments
      const [postsRes, likesRes, commentsRes] = await Promise.all([
        adminClient.from('social_posts').select('id', { count: 'exact', head: true }).eq('author_id', profileId).gte('created_at', since),
        adminClient.from('social_likes').select('id', { count: 'exact', head: true }).eq('profile_id', profileId).gte('created_at', since),
        adminClient.from('social_comments').select('id', { count: 'exact', head: true }).eq('author_id', profileId).gte('created_at', since),
      ]);

      const activity = {
        postsCreated: postsRes.count ?? 0,
        likesGiven: likesRes.count ?? 0,
        commentsMade: commentsRes.count ?? 0,
        period,
        profile: { id: childProfile.id, display_name: childProfile.display_name },
        parental_settings: childProfile.parental_settings ?? {},
      };

      return jsonResponse(200, { success: true, data: activity });
    }

    return errorResponse(405, 'Method not allowed');
  } catch (err) {
    console.error('social-parental error:', err);
    return errorResponse(500, err instanceof Error ? err.message : 'Internal error');
  }
});

async function getCallerProfile(admin: ReturnType<typeof createClient>, userId: string) {
  const { data } = await admin
    .from('social_profiles')
    .select('id, role, school_id, user_id')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
}

// Check if parent can view/manage child: same school + parent role + child is student
async function canParentViewChild(
  admin: ReturnType<typeof createClient>,
  parentAuthUserId: string,
  parentProfile: { id: string; role: string; school_id: string | null },
  childProfile: { id: string; user_id: string; role: string; school_id: string | null }
): Promise<boolean> {
  if (parentProfile.role !== 'parent' || childProfile.role !== 'student') return false;
  if (!parentProfile.school_id || !childProfile.school_id) return false;
  if (parentProfile.school_id !== childProfile.school_id) return false;
  // Optionally: verify via school_parent_students (parent users.id -> student's school_students)
  // For MVP we allow same-school parent+student
  return true;
}

function periodToDate(period: string): string {
  const now = new Date();
  if (period === '24h') {
    now.setDate(now.getDate() - 1);
  } else if (period === '7d') {
    now.setDate(now.getDate() - 7);
  } else if (period === '30d') {
    now.setDate(now.getDate() - 30);
  } else {
    now.setDate(now.getDate() - 7);
  }
  return now.toISOString();
}

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function errorResponse(status: number, message: string) {
  return jsonResponse(status, { error: message });
}
