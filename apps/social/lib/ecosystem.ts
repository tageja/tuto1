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
 * Navigate to another ecosystem app, carrying the current session via SSO when
 * available. Falls back to a plain navigation (the target app will prompt for
 * login) when there is no active session.
 */
export async function handoffTo(target: Exclude<EcosystemApp, 'feed'>): Promise<void> {
  const base = ECOSYSTEM_URLS[target];
  try {
    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && session?.refresh_token) {
      const params = new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
      });
      window.location.href = `${base}/auth/sso?${params.toString()}`;
      return;
    }
  } catch {
    // Fall through to plain navigation.
  }
  window.location.href = base;
}
