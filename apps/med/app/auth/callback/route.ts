import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Supabase PKCE email-confirmation callback.
 * Supabase redirects here after the user clicks the confirmation link:
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
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.user) {
    console.error('[auth/callback] exchangeCodeForSession error:', error?.message)
    return NextResponse.redirect(`${origin}/auth/login?error=callback_failed`)
  }

  // Upsert profile row — service-role client bypasses RLS
  const service = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  )

  await service.from('nursed_profiles').upsert(
    {
      id: data.user.id,
      full_name: (data.user.user_metadata?.full_name as string) ?? null,
      hospital_id: (data.user.user_metadata?.hospital_id as string) ?? null,
      role: (data.user.user_metadata?.role as string) ?? 'learner',
      avatar_url: null,
    },
    { onConflict: 'id', ignoreDuplicates: true },
  )

  return NextResponse.redirect(`${origin}${next}`)
}
