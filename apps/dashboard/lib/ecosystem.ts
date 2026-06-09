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

export async function handoffTo(target: Exclude<EcosystemApp, 'school'>): Promise<void> {
  const base = ECOSYSTEM_URLS[target];
  try {
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
