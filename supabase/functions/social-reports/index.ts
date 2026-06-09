// Supabase Edge Function: social-reports
// Create report, list reports (admin), resolve report
// Deploy: supabase functions deploy social-reports

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const REPORT_REASONS = [
  'spam',
  'harassment',
  'inappropriate',
  'misinformation',
  'impersonation',
  'child_safety',
  'other',
];

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

    // ------------------------------------------------------------------
    // POST — create report
    // ------------------------------------------------------------------
    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
      const action = body.action as string;

      if (action === 'resolve') {
        // Resolve report (admin only)
        const reportId = body.reportId as string;
        const resolveAction = body.resolveAction as string;
        const adminNotes = body.adminNotes as string;
        if (!reportId || !resolveAction) {
          return errorResponse(400, 'reportId and resolveAction required');
        }

        const profile = await getCallerProfile(adminClient, user.id);
        if (!profile || !['schoolAdmin', 'institute'].includes(profile.role)) {
          return errorResponse(403, 'Admin role required');
        }

        const validActions = ['actioned', 'dismissed'];
        if (!validActions.includes(resolveAction)) {
          return errorResponse(400, 'resolveAction must be actioned or dismissed');
        }

        const { error: updateErr } = await adminClient
          .from('social_reports')
          .update({
            status: resolveAction,
            admin_notes: adminNotes ?? null,
            resolved_by: profile.id,
            resolved_at: new Date().toISOString(),
          })
          .eq('id', reportId);

        if (updateErr) return errorResponse(500, updateErr.message);
        return jsonResponse(200, { success: true });
      }

      // Create report
      const targetType = body.targetType as string;
      const targetId = body.targetId as string;
      const reason = body.reason as string;
      const description = body.description as string;

      if (!targetType || !targetId || !reason) {
        return errorResponse(400, 'targetType, targetId, and reason required');
      }
      if (!['user', 'post', 'comment', 'reel'].includes(targetType)) {
        return errorResponse(400, 'targetType must be user, post, comment, or reel');
      }
      if (!REPORT_REASONS.includes(reason) && reason.length > 50) {
        return errorResponse(400, 'Invalid reason');
      }

      const { data: profile } = await adminClient
        .from('social_profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!profile) return errorResponse(404, 'Profile not found');

      const { data: report, error: insertErr } = await adminClient
        .from('social_reports')
        .insert({
          reporter_id: profile.id,
          target_type: targetType,
          target_id: targetId,
          reason,
          description: description?.trim() || null,
          evidence: {},
          status: 'pending',
        })
        .select('id')
        .single();

      if (insertErr) return errorResponse(500, insertErr.message);
      return jsonResponse(201, { success: true, data: { id: report.id } });
    }

    // ------------------------------------------------------------------
    // GET — list reports (admin only)
    // ------------------------------------------------------------------
    if (req.method === 'GET') {
      const status = url.searchParams.get('status');
      const schoolId = url.searchParams.get('schoolId');
      const limit = Math.min(50, parseInt(url.searchParams.get('limit') ?? '20', 10));

      const profile = await getCallerProfile(adminClient, user.id);
      if (!profile || !['schoolAdmin', 'institute'].includes(profile.role)) {
        return errorResponse(403, 'Admin role required');
      }

      let query = adminClient
        .from('social_reports')
        .select(`
          id, reporter_id, target_type, target_id, reason, description,
          status, admin_notes, resolved_by, resolved_at, created_at,
          reporter:social_profiles!social_reports_reporter_id_fkey(id, username, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (status) {
        query = query.eq('status', status);
      }

      // School admins see only reports for content in their school
      if (profile.role === 'schoolAdmin' && profile.school_id) {
        // Target could be post, comment, reel, user — we need to join to get school scope
        // For now return all; filter by school can be done in a follow-up
        // Simplification: school admin sees all pending; Tuto HQ sees all
      }

      const { data: reports, error } = await query;

      if (error) return errorResponse(500, error.message);
      return jsonResponse(200, { success: true, data: reports ?? [] });
    }

    return errorResponse(405, 'Method not allowed');
  } catch (err) {
    console.error('social-reports error:', err);
    return errorResponse(500, err instanceof Error ? err.message : 'Internal error');
  }
});

async function getCallerProfile(admin: ReturnType<typeof createClient>, userId: string) {
  const { data } = await admin
    .from('social_profiles')
    .select('id, role, school_id')
    .eq('user_id', userId)
    .maybeSingle();
  return data;
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
