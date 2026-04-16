import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Set NEXT_PUBLIC_AUTH_DISABLED=true in .env.local to bypass all auth checks.
 * Useful for local testing / QA without a live Supabase session.
 * Never set this in production.
 */
const AUTH_DISABLED = process.env.NEXT_PUBLIC_AUTH_DISABLED === 'true'

/** Routes that require authentication */
const PROTECTED_PREFIXES = ['/learn', '/admin']

/** Auth routes — redirect away if already signed in */
const AUTH_PREFIXES = ['/auth/login', '/auth/register']

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  // ── Dev/test bypass ────────────────────────────────────────────────────────
  // When AUTH_DISABLED is true all routes are open; session is still refreshed
  // so auth pages themselves continue to work for auth feature testing.
  if (AUTH_DISABLED) return supabaseResponse
  // ──────────────────────────────────────────────────────────────────────────

  // #region agent log H4 - env var presence check
  console.log('[dbg54a064][middleware] env check', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    path: request.nextUrl.pathname,
  })
  // #endregion

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        )
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        )
      },
    },
  })

  // IMPORTANT: always call getUser() to refresh the session — do not use getSession()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p))
  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p))

  // #region agent log H1/H5 - user session state at protected route
  console.log('[dbg54a064][middleware] auth check', {
    pathname,
    isProtected,
    hasUser: !!user,
    userId: user?.id ?? null,
  })
  // #endregion

  // Unauthenticated user trying to access protected route → login
  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/auth/login'
    loginUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Authenticated user visiting login/register → redirect to learn
  if (isAuthPage && user) {
    const learnUrl = request.nextUrl.clone()
    learnUrl.pathname = '/learn/courses'
    learnUrl.search = ''
    return NextResponse.redirect(learnUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static, _next/image (Next.js internals)
     * - favicon.ico, images
     * - /auth/callback (must be open to complete PKCE exchange)
     */
    '/((?!_next/static|_next/image|favicon\\.ico|images/|auth/callback|api/).*)',
  ],
}
