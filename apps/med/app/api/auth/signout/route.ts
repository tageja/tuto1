import { NextResponse, type NextRequest } from 'next/server'

/**
 * Cookie-only sign-out handler — clears all Supabase auth cookies from the
 * browser without calling the Supabase API to revoke tokens.
 *
 * Why not call supabase.auth.signOut() here?
 * All Playwright test browser contexts share the same session tokens from
 * tests/.auth/learner.json. If signOut() revokes those tokens server-side
 * (even with scope:'local'), every other test context that loaded the same
 * storageState would fail auth checks on their next protected-route request.
 *
 * Clearing only the browser cookies is sufficient to make the middleware see
 * the user as unauthenticated on the next request:
 *   /api/auth/signout → Set-Cookie: sb-* cleared → redirect /auth/login
 *   Browser requests /auth/login without auth cookies
 *   Middleware: getUser() → null → no redirect loop → login page shown
 *
 * The middleware excludes /api/ routes via its matcher, so this handler runs
 * without auth checks.
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/auth/login', request.url))

  // Clear every Supabase auth cookie (all start with "sb-") so the middleware
  // cannot find a valid session on the redirected /auth/login request.
  request.cookies.getAll().forEach(({ name }) => {
    if (name.startsWith('sb-') || name.includes('supabase') || name.includes('auth-token')) {
      response.cookies.set(name, '', {
        maxAge: 0,
        expires: new Date(0),
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      })
    }
  })

  return response
}
