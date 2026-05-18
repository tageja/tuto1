import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_SERVICE_ROLE_KEY, SUPABASE_URL, requireSupabaseAdmin } from './env';

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
