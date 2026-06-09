// supabase/functions/social-notify/index.ts
// Invoked by Database Webhook on social_notifications INSERT.
// Sends Expo Push notification to recipient's device.
//
// Configure webhook: Supabase Dashboard → Database → Webhooks
// - Table: social_notifications
// - Events: INSERT
// - URL: https://<project-ref>.supabase.co/functions/v1/social-notify

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

type NotificationRecord = {
  id: string;
  recipient_id: string;
  actor_id: string | null;
  type: string;
  post_id: string | null;
  comment_id: string | null;
  reel_id: string | null;
  data: Record<string, unknown>;
  read: boolean;
  created_at: string;
};

type WebhookPayload = {
  type: 'INSERT';
  table: string;
  schema: string;
  record: NotificationRecord;
  old_record: null;
};

function jsonResponse(status: number, body: unknown) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS } });
}

function getMessageForType(
  type: string,
  actorName?: string
): { title: string; body: string } {
  const who = actorName ?? 'Someone';
  switch (type) {
    case 'like':
      return { title: 'New like', body: `${who} liked your post` };
    case 'applaud':
      return { title: 'New reaction', body: `${who} applauded your post` };
    case 'curious':
      return { title: 'New reaction', body: `${who} is curious about your post` };
    case 'reel_like':
      return { title: 'New like', body: `${who} liked your reel` };
    case 'comment':
      return { title: 'New comment', body: `${who} commented on your post` };
    case 'follow':
      return { title: 'New follower', body: `${who} started following you` };
    case 'achievement':
      return { title: 'Achievement!', body: 'You earned an achievement' };
    case 'level_up':
      return { title: 'Level up!', body: 'You reached a new level!' };
    default:
      return { title: 'Notification', body: 'You have a new notification' };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  if (req.method !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  try {
    const body = (await req.json()) as WebhookPayload;

    if (body.type !== 'INSERT' || body.table !== 'social_notifications') {
      return jsonResponse(200, { ok: true, skipped: 'Not a notification insert' });
    }

    const record = body.record as NotificationRecord;
    const recipientId = record.recipient_id;
    const notifType = record.type;

    if (!recipientId) {
      return jsonResponse(400, { error: 'Missing recipient_id' });
    }

    const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    const { data: profile, error: profileErr } = await adminClient
      .from('social_profiles')
      .select('push_token, display_name, username')
      .eq('user_id', recipientId)
      .maybeSingle();

    if (profileErr) {
      console.error('Profile fetch error:', profileErr);
      return jsonResponse(500, { error: 'Profile fetch failed' });
    }

    const pushToken = profile?.push_token;
    if (!pushToken || !pushToken.startsWith('ExponentPushToken')) {
      return jsonResponse(200, { ok: true, skipped: 'No push token' });
    }

    let actorName: string | undefined;
    if (record.actor_id) {
      const { data: actorProfile } = await adminClient
        .from('social_profiles')
        .select('display_name, username')
        .eq('user_id', record.actor_id)
        .maybeSingle();
      actorName = (actorProfile?.display_name || actorProfile?.username) ?? undefined;
    }

    const { title, body: msgBody } = getMessageForType(notifType, actorName);

    const pushPayload = {
      to: pushToken,
      title,
      body: msgBody,
      data: {
        notificationId: record.id,
        type: notifType,
        postId: record.post_id,
        commentId: record.comment_id,
        reelId: record.reel_id,
      },
      sound: 'default',
      priority: 'high',
    };

    const pushRes = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pushPayload),
    });

    if (!pushRes.ok) {
      const errText = await pushRes.text();
      console.error('Expo Push error:', pushRes.status, errText);
      return jsonResponse(500, { error: 'Push send failed', detail: errText });
    }

    return jsonResponse(200, { ok: true, sent: true });
  } catch (e) {
    console.error('social-notify error:', e);
    return jsonResponse(500, { error: 'Internal error', message: String(e) });
  }
});
