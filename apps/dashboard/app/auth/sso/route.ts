// apps/dashboard/app/auth/sso/route.ts
// SSO receiving endpoint for the School Dashboard (tuto.asia / tutoglobal.com).
// Accepts Supabase session tokens forwarded from another ecosystem app
// (tuto.social feed or pro.tuto.asia courses) and establishes a session here
// without showing a login form.
//
// Flow:
//   feed/courses → /auth/sso?access_token=...&refresh_token=...&redirectTo=/welcome

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const accessToken = searchParams.get('access_token');
  const refreshToken = searchParams.get('refresh_token');
  const redirectTo = searchParams.get('redirectTo') ?? '/welcome';

  const cookieStore = await cookies();

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });

  // Case 1: tokens forwarded from another ecosystem app.
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (!error) {
      return NextResponse.redirect(new URL(redirectTo, origin));
    }
    console.warn('[Dashboard SSO] setSession failed:', error.message);
  }

  // Case 2: already authenticated via cookie.
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    return NextResponse.redirect(new URL(redirectTo, origin));
  }

  // Case 3: no session — send to login, preserving intended destination.
  return NextResponse.redirect(
    new URL(`/login?redirectTo=${encodeURIComponent(redirectTo)}`, origin),
  );
}
