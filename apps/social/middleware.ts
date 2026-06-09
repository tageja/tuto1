import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// Community-first: the feed and other read-only surfaces are browsable by
// guests (backed by anon-read RLS). Only routes that act on behalf of a user
// require authentication; everything else is public.
const AUTH_REQUIRED_PREFIXES = [
  '/create',
  '/messages',
  '/notifications',
  '/settings',
  '/dashboard',
  '/profile/edit',
];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Refresh session — do not remove this call
  const { data: { user } } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const requiresAuth = AUTH_REQUIRED_PREFIXES.some((p) => pathname.startsWith(p));

  // Only redirect guests away from routes that require an account; the feed,
  // post detail, profiles, search, explore and leaderboard stay public.
  if (!user && requiresAuth) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from login
  if (user && pathname === '/login') {
    const feedUrl = request.nextUrl.clone();
    feedUrl.pathname = '/feed';
    return NextResponse.redirect(feedUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
