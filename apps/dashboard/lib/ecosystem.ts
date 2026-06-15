'use client';

import { supabase } from './supabase';

/**
 * Tuto ecosystem cross-app navigation with single sign-on (SSO) handoff.
 * From the School Dashboard, users can jump to the Community feed or the
 * Home-Learning courses, carrying their signed-in session via the target app's
 * `/auth/sso` receiving route.
 */
export type EcosystemApp = 'school' | 'feed' | 'courses';

export const ECOSYSTEM_URLS: Record<Exclude<EcosystemApp, 'school'>, string> = {
  // Community feed (tuto.social)
  feed: process.env.NEXT_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001',
  // Home Learning / Courses (NurseEd at pro.tuto.asia)
  courses: process.env.NEXT_PUBLIC_COURSES_URL ?? 'https://pro.tuto.asia',
};

/**
 * Navigate to another ecosystem app carrying the current session via SSO.
 * Tokens are passed in the URL fragment (#) so they are never sent to the
 * server and do not appear in access logs or Referer headers.
 *
 * Falls back to plain navigation when there is no active session.
 *
 * @param redirectTo  Optional path on the target app to land on after SSO.
 */
export async function handoffTo(
  target: Exclude<EcosystemApp, 'school'>,
  redirectTo?: string,
): Promise<void> {
  const base = ECOSYSTEM_URLS[target];
  const ssoPath = target === 'feed' ? '/auth/sso-exchange' : '/auth/sso-exchange';
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token && session?.refresh_token) {
      const fragment = new URLSearchParams({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        ...(redirectTo ? { redirectTo } : {}),
      });
      window.location.href = `${base}${ssoPath}#${fragment.toString()}`;
      return;
    }
  } catch {
    // Fall through to plain navigation.
  }
  const dest = redirectTo ? `${base}${redirectTo}` : base;
  window.location.href = dest;
}
