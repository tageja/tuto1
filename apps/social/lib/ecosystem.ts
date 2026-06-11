'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase';

/**
 * Tuto ecosystem cross-app navigation with single sign-on (SSO) handoff.
 *
 * The three consumer surfaces share one Supabase project, so we can carry the
 * signed-in session from one app to another by forwarding the access/refresh
 * tokens to the target app's `/auth/sso` receiving route, which calls
 * `supabase.auth.setSession()` and drops the user straight in.
 */

export type EcosystemApp = 'feed' | 'school' | 'courses';

export const ECOSYSTEM_URLS: Record<Exclude<EcosystemApp, 'feed'>, string> = {
  // School dashboard / LMS (tuto.asia / tutoglobal.com)
  school: process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3000',
  // Home Learning / Courses (NurseEd at pro.tuto.asia)
  courses: process.env.NEXT_PUBLIC_COURSES_URL ?? 'https://pro.tuto.asia',
};

/**
 * Navigate to another ecosystem app, carrying the current session via SSO.
 *
 * Security: tokens are passed via URL fragment (#) so they are never sent to
 * the server and do not appear in access logs or Referer headers. The target
 * app's /auth/sso page reads them client-side from window.location.hash.
 *
 * Falls back to plain navigation when there is no active session (target app
 * will prompt for login).
 *
 * @param redirectTo  Optional path on the target app to land on after SSO.
 */
export async function handoffTo(
  target: Exclude<EcosystemApp, 'feed'>,
  redirectTo?: string,
): Promise<void> {
  const base = ECOSYSTEM_URLS[target];
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && session?.refresh_token) {
      // Tokens in fragment — never reaches the server, not in history body
      const fragment = new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        ...(redirectTo ? { redirectTo } : {}),
      });
      window.location.href = `${base}/auth/sso-exchange#${fragment.toString()}`;
      return;
    }
  } catch {
    // Fall through to plain navigation.
  }
  const dest = redirectTo ? `${base}${redirectTo}` : base;
  window.location.href = dest;
}
