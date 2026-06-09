// Supabase Edge Function: social-moderation
// AI content screening (OpenAI) + admin approve/reject
// Deploy: supabase functions deploy social-moderation
// Secrets: OPENAI_API_KEY

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
    const openaiKey = Deno.env.get('OPENAI_API_KEY');

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
    const action = url.searchParams.get('action');

    if (req.method === 'POST') {
      const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;

      // ------------------------------------------------------------------
      // screenText — call OpenAI Moderation API
      // ------------------------------------------------------------------
      if (body.action === 'screenText' || action === 'screenText') {
        const text = String(body.text ?? '').trim();
        if (!text) return errorResponse(400, 'text is required');

        if (!openaiKey) {
          return jsonResponse(200, {
            success: true,
            data: { flagged: false, categories: {}, score: 0 },
            note: 'OPENAI_API_KEY not configured — skipping moderation',
          });
        }

        const openaiRes = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({ input: text }),
        });

        if (!openaiRes.ok) {
          const err = await openaiRes.text();
          return errorResponse(500, `OpenAI moderation failed: ${err}`);
        }

        const mod = (await openaiRes.json()) as {
          results?: Array<{
            flagged: boolean;
            categories?: Record<string, boolean>;
            category_scores?: Record<string, number>;
          }>;
        };
        const r = mod.results?.[0];
        const flagged = r?.flagged ?? false;
        const categories = r?.categories ?? {};
        const scores = r?.category_scores ?? {};
        const score = Math.max(...Object.values(scores), 0);

        return jsonResponse(200, {
          success: true,
          data: { flagged, categories, score },
        });
      }

      // ------------------------------------------------------------------
      // screenPost — fetch post content, screen, update queue
      // ------------------------------------------------------------------
      if (body.action === 'screenPost' || action === 'screenPost') {
        const postId = body.postId as string;
        if (!postId) return errorResponse(400, 'postId is required');

        const { data: post, error: postErr } = await adminClient
          .from('social_posts')
          .select('id, content, media_urls')
          .eq('id', postId)
          .single();

        if (postErr || !post) {
          return errorResponse(404, 'Post not found');
        }

        const textToScreen = [post.content, ...(post.media_urls ?? []).map(String)].filter(Boolean).join(' ');
        if (!textToScreen.trim() && !openaiKey) {
          // No text and no OpenAI — auto-approve
          await updateQueueAndPost(adminClient, postId, 'approved', 'ai', null);
          return jsonResponse(200, { success: true, data: { approved: true } });
        }

        if (!openaiKey) {
          return jsonResponse(200, {
            success: true,
            data: { approved: true },
            note: 'OPENAI_API_KEY not configured',
          });
        }

        const openaiRes = await fetch('https://api.openai.com/v1/moderations', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({ input: textToScreen || ' ' }),
        });

        if (!openaiRes.ok) {
          return errorResponse(500, 'OpenAI moderation failed');
        }

        const mod = (await openaiRes.json()) as { results?: Array<{ flagged: boolean; category_scores?: Record<string, number> }> };
        const r = mod.results?.[0];
        const flagged = r?.flagged ?? false;
        const score = r?.category_scores ? Math.max(...Object.values(r.category_scores)) : 0;

        if (flagged) {
          await updateQueueAndPost(adminClient, postId, 'rejected', 'ai', score);
          return jsonResponse(200, { success: true, data: { approved: false, flagged: true } });
        }

        await updateQueueAndPost(adminClient, postId, 'approved', 'ai', score);
        return jsonResponse(200, { success: true, data: { approved: true } });
      }

      // ------------------------------------------------------------------
      // screenReel — fetch reel description, screen, update social_reels
      // ------------------------------------------------------------------
      if (body.action === 'screenReel' || action === 'screenReel') {
        const reelId = body.reelId as string;
        if (!reelId) return errorResponse(400, 'reelId is required');

        const { data: reel, error: reelErr } = await adminClient
          .from('social_reels')
          .select('id, description')
          .eq('id', reelId)
          .single();

        if (reelErr || !reel) {
          return errorResponse(404, 'Reel not found');
        }

        const textToScreen = String(reel.description ?? '').trim() || ' ';
        let approved = true;

        if (openaiKey) {
          const openaiRes = await fetch('https://api.openai.com/v1/moderations', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${openaiKey}`,
            },
            body: JSON.stringify({ input: textToScreen }),
          });

          if (openaiRes.ok) {
            const mod = (await openaiRes.json()) as { results?: Array<{ flagged: boolean }> };
            approved = !(mod.results?.[0]?.flagged ?? false);
          }
        }

        const newStatus = approved ? 'ai_reviewed' : 'rejected';
        await adminClient
          .from('social_reels')
          .update({ moderation_status: newStatus })
          .eq('id', reelId);

        return jsonResponse(200, { success: true, data: { approved } });
      }

      // ------------------------------------------------------------------
      // approvePost — admin approve
      // ------------------------------------------------------------------
      if (body.action === 'approvePost' || action === 'approvePost') {
        const postId = body.postId as string;
        const moderatorType = (body.moderatorType as string) ?? 'school_admin';
        if (!postId) return errorResponse(400, 'postId is required');

        const profile = await getCallerProfile(adminClient, user.id);
        if (!profile || !['schoolAdmin', 'institute'].includes(profile.role)) {
          return errorResponse(403, 'Admin role required');
        }

        await updateQueueAndPost(adminClient, postId, 'approved', moderatorType, null);
        return jsonResponse(200, { success: true });
      }

      // ------------------------------------------------------------------
      // rejectPost — admin reject
      // ------------------------------------------------------------------
      if (body.action === 'rejectPost' || action === 'rejectPost') {
        const postId = body.postId as string;
        const reason = body.reason as string;
        if (!postId) return errorResponse(400, 'postId is required');

        const profile = await getCallerProfile(adminClient, user.id);
        if (!profile || !['schoolAdmin', 'institute'].includes(profile.role)) {
          return errorResponse(403, 'Admin role required');
        }

        const { data: row } = await adminClient
          .from('social_moderation_queue')
          .select('id')
          .eq('post_id', postId)
          .eq('status', 'pending')
          .single();

        if (!row) {
          return errorResponse(404, 'No pending moderation for this post');
        }

        await adminClient
          .from('social_moderation_queue')
          .update({ status: 'rejected', moderator_type: 'school_admin', reason: reason ?? null, decision_at: new Date().toISOString() })
          .eq('id', row.id);

        await adminClient
          .from('social_posts')
          .update({ moderation_status: 'rejected' })
          .eq('id', postId);

        return jsonResponse(200, { success: true });
      }

      return errorResponse(400, 'Unknown action');
    }

    return errorResponse(405, 'Method not allowed');
  } catch (err) {
    console.error('social-moderation error:', err);
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

async function updateQueueAndPost(
  admin: ReturnType<typeof createClient>,
  postId: string,
  status: 'approved' | 'rejected',
  moderatorType: string,
  aiScore: number | null
) {
  const { data: row } = await admin
    .from('social_moderation_queue')
    .select('id')
    .eq('post_id', postId)
    .eq('status', 'pending')
    .single();

  if (row) {
    await admin
      .from('social_moderation_queue')
      .update({
        status,
        moderator_type: moderatorType,
        decision_at: new Date().toISOString(),
        ai_score: aiScore,
      })
      .eq('id', row.id);
  }

  if (status === 'approved') {
    await admin
      .from('social_posts')
      .update({ moderation_status: 'ai_reviewed' })
      .eq('id', postId);
  } else {
    await admin
      .from('social_posts')
      .update({ moderation_status: 'rejected' })
      .eq('id', postId);
  }
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
