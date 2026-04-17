import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase PKCE / OAuth callback.
 * Supabase redirects here after Google OAuth or email confirmation:
 *   /auth/callback?code=<code>&next=/learn/courses
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const rawNext = searchParams.get('next') ?? '/learn/courses'
  const next = rawNext.startsWith('/') ? rawNext : '/learn/courses'

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`)
  }

  let exchangeResult: { data: { user: unknown } | null; error: { message: string } | null } = { data: null, error: null }
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options),
              )
            } catch {
              // Cookie store may be read-only in some contexts — safe to ignore
            }
          },
        },
      },
    )

    const result = await supabase.auth.exchangeCodeForSession(code)
    exchangeResult = result as typeof exchangeResult
  } catch (err) {
    console.error('[auth/callback] exchangeCodeForSession threw:', err)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  if (exchangeResult.error || !exchangeResult.data?.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', exchangeResult.error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  // Upsert profile row — falls back to anon key when service role key is not configured
  try {
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )

    await service.from('nursed_profiles').upsert(
      {
        id: (exchangeResult.data.user as { id: string }).id,
        full_name: ((exchangeResult.data.user as { user_metadata?: { full_name?: string } }).user_metadata?.full_name) ?? null,
        hospital_id: null,
        role: 'learner',
        avatar_url: null,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  } catch (upsertErr) {
    // Profile upsert failure is non-fatal — user is still authenticated
    console.error('[auth/callback] profile upsert error:', upsertErr)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
