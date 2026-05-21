import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  BASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  SUPABASE_URL,
  TEST_ADMIN_USER,
  requireSupabaseAdmin,
} from './env';

let cached: SupabaseClient | null = null;

/**
 * Server-side Supabase client with service role privileges.
 * Use ONLY in tests for setup/cleanup/assertions on database state.
 *
 * Throws if credentials are missing — tests that need this must call
 * requireSupabaseAdmin() in their before-hook so the failure is clear.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;
  requireSupabaseAdmin('getSupabaseAdmin');
  cached = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}

/**
 * Reset progress for a specific user + lesson — used by bug-016
 * (re-entering completed lesson wipes progress).
 */
export async function resetLessonProgress(userId: string, lessonId: string): Promise<void> {
  const sb = getSupabaseAdmin();
  await sb.from('nursed_progress').delete().eq('user_id', userId).eq('lesson_id', lessonId);
  await sb.from('nursed_submissions').delete().eq('user_id', userId).eq('lesson_id', lessonId);
}

export async function getProgress(
  userId: string,
  lessonId: string,
): Promise<{ completion_pct: number; completed: boolean } | null> {
  const sb = getSupabaseAdmin();
  const { data } = await sb
    .from('nursed_progress')
    .select('completion_pct, completed')
    .eq('user_id', userId)
    .eq('lesson_id', lessonId)
    .maybeSingle();
  return data;
}

/**
 * Ensures admin@test.com exists in auth + nursed_profiles with super_admin role.
 * Safe to call before admin Playwright setup.
 */
export async function ensureTestAdminProfile(): Promise<void> {
  requireSupabaseAdmin('ensureTestAdminProfile');
  const sb = getSupabaseAdmin();
  const email = TEST_ADMIN_USER.email;

  let userId = await getTestUserId(email);
  if (!userId) {
    const { data: created, error } = await sb.auth.admin.createUser({
      email,
      password: TEST_ADMIN_USER.password,
      email_confirm: true,
    });
    if (error && !/already been registered/i.test(error.message)) {
      throw new Error(`ensureTestAdminProfile createUser: ${error.message}`);
    }
    userId = created?.user?.id ?? (await getTestUserId(email));
  }
  if (!userId) {
    throw new Error(`ensureTestAdminProfile: could not resolve user id for ${email}`);
  }

  const { error: profileErr } = await sb.from('nursed_profiles').upsert(
    {
      id: userId,
      full_name: 'QA Admin',
      hospital_id: null,
      role: 'super_admin',
      avatar_url: null,
      onboarding_done: true,
    },
    { onConflict: 'id' },
  );
  if (profileErr) {
    throw new Error(`ensureTestAdminProfile profile upsert: ${profileErr.message}`);
  }
}

/** Build Playwright storage state for admin@test.com via password grant (no UI login). */
export async function buildAdminStorageState(): Promise<{
  cookies: Array<{
    name: string;
    value: string;
    domain: string;
    path: string;
    expires: number;
    httpOnly: boolean;
    secure: boolean;
    sameSite: 'Lax';
  }>;
  origins: Array<{ origin: string; localStorage: Array<{ name: string; value: string }> }>;
}> {
  requireSupabaseAdmin('buildAdminStorageState');
  if (!SUPABASE_ANON_KEY) {
    throw new Error('buildAdminStorageState requires NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  await ensureTestAdminProfile();

  const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await anon.auth.signInWithPassword({
    email: TEST_ADMIN_USER.email,
    password: TEST_ADMIN_USER.password,
  });
  if (error || !data.session) {
    throw new Error(`buildAdminStorageState signIn: ${error?.message ?? 'no session'}`);
  }

  const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
  const cookieName = `sb-${projectRef}-auth-token`;
  const payload = Buffer.from(
    JSON.stringify({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      expires_at: data.session.expires_at,
      expires_in: data.session.expires_in,
      token_type: data.session.token_type,
      user: data.session.user,
    }),
  ).toString('base64');
  const origin = BASE_URL.replace(/\/$/, '');
  const hostname = new URL(origin).hostname;

  return {
    cookies: [
      {
        name: cookieName,
        value: `base64-${payload}`,
        domain: hostname,
        path: '/',
        expires: data.session.expires_at ?? Math.floor(Date.now() / 1000) + 3600,
        httpOnly: false,
        secure: origin.startsWith('https'),
        sameSite: 'Lax',
      },
    ],
    origins: [{ origin, localStorage: [] }],
  };
}

export async function getTestUserId(email: string): Promise<string | null> {
  const sb = getSupabaseAdmin();
  // Use a SECURITY DEFINER RPC to look up the auth.users table directly.
  // auth.admin.listUsers() can fail silently when the service role key differs
  // from the anon key origin, and direct from('auth.users') is blocked by RLS.
  const { data, error } = await sb.rpc('get_auth_user_id_by_email', { user_email: email });
  if (!error && data) return data as string;

  // Fallback: paginated admin list (catches cases where RPC isn't deployed yet).
  const { data: listData } = await sb.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const u = listData?.users?.find((x) => x.email === email);
  return u?.id ?? null;
}
