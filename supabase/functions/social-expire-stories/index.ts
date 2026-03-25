// supabase/functions/social-expire-stories/index.ts
// DELETE FROM social_stories WHERE expires_at < NOW()
// Call via Supabase cron or dashboard. Feed already filters by expires_at > NOW().

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  try {
    const { data, error } = await adminClient
      .from('social_stories')
      .delete()
      .lt('expires_at', new Date().toISOString())
      .select('id');

    if (error) throw error;

    const count = (data ?? []).length;
    return new Response(
      JSON.stringify({ success: true, deleted: count }),
      { headers: CORS },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String(err) }),
      { status: 500, headers: CORS },
    );
  }
});
