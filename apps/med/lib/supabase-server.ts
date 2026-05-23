import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies, headers } from 'next/headers'
import type { NursedProfile, UserRole } from './supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Server component / API route client — reads/writes cookies for session.
 * Use in Server Components, Route Handlers, and Server Actions.
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies()
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
          // setAll called from a Server Component — safe to ignore
        }
      },
    },
  })
}

/**
 * Service-role server client — bypasses RLS.
 * Use ONLY in API routes that need elevated DB access (e.g. profile creation).
 */
export async function createSupabaseServiceServerClient() {
  const { createClient } = await import('@supabase/supabase-js')
  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: { persistSession: false },
  })
}

/**
 * Returns the current session user + their profile row.
 * Supports both cookie-based sessions and Authorization: Bearer <token> headers.
 * Returns null for both if not authenticated.
 */
export async function getSessionAndProfile(): Promise<{
  user: { id: string; email: string | undefined } | null
  profile: NursedProfile | null
}> {
  const headerStore = await headers()
  const authHeader = headerStore.get('authorization') ?? ''
  const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  let supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>

  if (bearerToken) {
    const bearerClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: `Bearer ${bearerToken}` } },
    })
    const {
      data: { user },
    } = await bearerClient.auth.getUser(bearerToken)

    if (!user) return { user: null, profile: null }

    const serviceDb = await createSupabaseServiceServerClient()
    const { data: profile } = await serviceDb
      .from('nursed_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { user: { id: user.id, email: user.email }, profile: profile ?? null }
  }

  supabase = await createSupabaseServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { user: null, profile: null }

  const { data: profile } = await supabase
    .from('nursed_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return {
    user: { id: user.id, email: user.email },
    profile: profile ?? null,
  }
}

/**
 * Convenience: get role for the current user. Returns null if not logged in.
 */
export async function getCurrentRole(): Promise<UserRole | null> {
  const { profile } = await getSessionAndProfile()
  return profile?.role ?? null
}

export const ADMIN_ROLES: UserRole[] = ['hospital_admin', 'super_admin']
export const TEACHER_ROLES: UserRole[] = ['teacher', 'hospital_admin', 'super_admin']
export const CREATOR_ROLES: UserRole[] = ['course_creator', 'super_admin']
