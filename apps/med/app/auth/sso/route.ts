import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * SSO receiving endpoint for the Home-Learning / Courses app (pro.tuto.asia).
 *
 * Accepts Supabase session tokens forwarded from another Tuto ecosystem app
 * (the tuto.social feed or the tuto.asia / tutoglobal.com dashboard) and
 * establishes a session here without showing a login form, then ensures the
 * learner has a nursed_profiles row.
 *
 * Flow:
 *   feed/dashboard → /auth/sso?access_token=...&refresh_token=...&next=/learn/courses
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const accessToken = searchParams.get('access_token')
  const refreshToken = searchParams.get('refresh_token')
  const rawNext = searchParams.get('next') ?? searchParams.get('redirectTo') ?? '/learn/courses'
  const next = rawNext.startsWith('/') ? rawNext : '/learn/courses'

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

  // Resolve the user either from forwarded tokens or an existing cookie session.
  let userId: string | null = null
  let fullName: string | null = null

  if (accessToken && refreshToken) {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
    if (error) {
      console.error('[auth/sso] setSession error:', error.message)
      return NextResponse.redirect(`${origin}/auth/login?error=sso_failed`)
    }
    userId = data.user?.id ?? null
    fullName = (data.user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? null
  } else {
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
    fullName = (user?.user_metadata as { full_name?: string } | undefined)?.full_name ?? null
  }

  if (!userId) {
    return NextResponse.redirect(`${origin}/auth/login?next=${encodeURIComponent(next)}`)
  }

  // Ensure a learner profile exists (mirrors the OAuth callback behaviour).
  try {
    const service = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } },
    )
    await service.from('nursed_profiles').upsert(
      {
        id: userId,
        full_name: fullName,
        hospital_id: null,
        role: 'learner',
        avatar_url: null,
      },
      { onConflict: 'id', ignoreDuplicates: true },
    )
  } catch (upsertErr) {
    // Non-fatal — the user is still authenticated.
    console.error('[auth/sso] profile upsert error:', upsertErr)
  }

  return NextResponse.redirect(`${origin}${next}`)
}
