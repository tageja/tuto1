// apps/social/app/auth/sso/route.ts
// SSO entry point — receives Supabase session tokens from school.tuto.asia
// and establishes a session in tuto.social without showing a login form.
//
// Flow:
//   school.tuto.asia (dashboard) → /auth/sso?access_token=...&refresh_token=... → /feed

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const DASHBOARD_URL = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? 'http://localhost:3000';
const SOCIAL_URL    = process.env.NEXT_PUBLIC_APP_URL       ?? 'http://localhost:3001';

/** Auto-create a social_profile for the user if one doesn't exist yet. */
async function ensureSocialProfile(supabase: ReturnType<typeof createServerClient>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Check if profile already exists
    const { data: existing } = await supabase
      .from('social_profiles')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) return;

    // Derive a username from email or name
    const email    = user.email ?? '';
    const metaName = (user.user_metadata?.full_name as string | undefined)
                  ?? (user.user_metadata?.name as string | undefined)
                  ?? '';
    const baseSlug = (metaName || email.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '_')
      .slice(0, 24);

    // Ensure uniqueness by appending random suffix if needed
    const username = `${baseSlug}_${Math.random().toString(36).slice(2, 6)}`;

    const displayName = metaName || email.split('@')[0];

    // Infer role from existing school association
    const { data: schoolUser } = await supabase
      .from('school_users')
      .select('role, school_id')
      .eq('user_id', user.id)
      .maybeSingle();

    const roleMap: Record<string, string> = {
      teacher:    'teacher',
      schoolAdmin: 'schoolAdmin',
      parent:     'parent',
      student:    'student',
    };

    const role     = roleMap[schoolUser?.role ?? ''] ?? 'parent';
    const schoolId = schoolUser?.school_id ?? null;

    await supabase.from('social_profiles').insert({
      user_id:      user.id,
      username,
      display_name: displayName,
      role,
      school_id:    schoolId,
    });
  } catch (err) {
    // Non-fatal — user still gets into feed, profile created on next visit
    console.warn('[SSO] ensureSocialProfile failed:', err);
  }
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const accessToken  = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');

  // Next.js 16+ — cookies() is async
  const cookieStore = await cookies();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll:  ()             => cookieStore.getAll(),
      setAll:  (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  // ── Case 1: tokens provided by the dashboard ─────────────────────────────
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token:  accessToken,
      refresh_token: refreshToken,
    });

    if (!error) {
      await ensureSocialProfile(supabase);
      return NextResponse.redirect(new URL('/feed', origin));
    }

    console.warn('[SSO] setSession failed:', error.message);
  }

  // ── Case 2: already has a valid session cookie (same-domain / dev) ────────
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await ensureSocialProfile(supabase);
    return NextResponse.redirect(new URL('/feed', origin));
  }

  // ── Case 3: no session — send user to the main platform to log in ─────────
  const socialRedirect = encodeURIComponent(`${SOCIAL_URL}/feed`);
  return NextResponse.redirect(
    `${DASHBOARD_URL}/login?redirectTo=/community&socialRedirect=${socialRedirect}`,
  );
}
