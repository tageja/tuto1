/**
 * Auth redirect URL helpers.
 *
 * Uses NEXT_PUBLIC_SITE_URL when available (set in Vercel env vars for
 * production and in .env.local for local dev) so that Supabase always
 * receives a redirect URL that is in the project's redirect allowlist —
 * even when the shared Supabase project's Site URL points elsewhere.
 */

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  return 'http://localhost:3001'
}

export function getAuthCallbackUrl(next?: string): string {
  const base = getSiteUrl()
  const url = new URL('/auth/callback', base)
  if (next) url.searchParams.set('next', next)
  return url.toString()
}
