/**
 * Supabase Configuration for Web Dashboard
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Lazy singleton — avoids throwing at module load time when env vars are absent.
// Next.js (Turbopack) evaluates API route modules during build-time page-data
// collection without runtime env vars present, which would otherwise crash the
// build with "supabaseUrl is required".
let _supabase: ReturnType<typeof createClient> | null = null;

function getSupabaseClient() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('⚠️  Supabase configuration missing');
      console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
      throw new Error('Supabase configuration missing: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
    }
    _supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'tuto-dashboard-auth',
        // Route the session to localStorage (persistent) or sessionStorage
        // (per-session) based on the remember-me preference.
        storage: rememberMeStorage,
        debug: process.env.NODE_ENV === 'development',
      },
      global: {
        headers: {
          'X-Client-Info': 'tuto-dashboard',
        },
      },
    });
  }
  return _supabase;
}

const REMEMBER_ME_KEY = 'tuto-remember-me';

/**
 * Set the "keep me signed in" preference for this browser.
 * When false, the auth session lives in sessionStorage (cleared when the
 * browser/tab is closed); when true (default), it lives in localStorage and
 * survives restarts. Call this BEFORE signing in so the session lands in the
 * correct store.
 */
export function setRememberMe(value: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REMEMBER_ME_KEY, value ? 'true' : 'false');
    // Migrate any existing token to the now-correct store.
    const target = value ? window.localStorage : window.sessionStorage;
    const other = value ? window.sessionStorage : window.localStorage;
    const existing = other.getItem('tuto-dashboard-auth');
    if (existing !== null) {
      target.setItem('tuto-dashboard-auth', existing);
      other.removeItem('tuto-dashboard-auth');
    }
  } catch {
    // Non-fatal: falls back to default storage behaviour.
  }
}

function rememberMeEnabled(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(REMEMBER_ME_KEY) !== 'false';
}

/**
 * Storage adapter that routes the auth session to localStorage (persistent)
 * or sessionStorage (per-session) based on the remember-me preference.
 * SSR-safe: no-ops when window is unavailable.
 */
const rememberMeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    const store = rememberMeEnabled() ? window.localStorage : window.sessionStorage;
    return store.getItem(key) ?? window.localStorage.getItem(key) ?? window.sessionStorage.getItem(key);
  },
  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    const store = rememberMeEnabled() ? window.localStorage : window.sessionStorage;
    store.setItem(key, value);
  },
  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(key);
    window.sessionStorage.removeItem(key);
  },
};

// Proxy that defers client creation until first property access (build-safe:
// `next build` page-data collection won't crash with "supabaseUrl is required"
// because the client is only constructed at runtime on first use).
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(_target, prop) {
    return (getSupabaseClient() as any)[prop];
  },
});

/**
 * Server-side Supabase client (with service role)
 * Use only in API routes and server components where you need to bypass RLS
 */
export function createServerSupabaseClient() {
  const serverUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!serverUrl || !serviceRoleKey) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  }
  
  return createClient(serverUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Supabase client scoped to the caller's JWT (RLS applies).
 * Use in API routes with Bearer access token for platform_feedback etc.
 */
export function createBearerSupabaseClient(accessToken: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

/**
 * Server-side Supabase client with user session (for API routes)
 * Use in API routes where you need to authenticate the user
 */
export async function createAuthenticatedSupabaseClient(request?: Request) {
  // Import cookies inside function to avoid client-side import errors
  const { cookies: nextCookies } = await import('next/headers');
  const cookieStore = await nextCookies();
  
  // Get all cookies as a formatted string for Authorization header
  const allCookies = cookieStore.getAll();
  const cookieString = allCookies.map(c => `${c.name}=${c.value}`).join('; ');
  
  // Find the session cookie
  const sessionCookie = allCookies.find(c => 
    c.name.startsWith('sb-') && c.name.includes('-auth-token')
  );
  
  console.log('🍪 Cookies available:', { 
    count: allCookies.length,
    hasSession: !!sessionCookie,
    cookieNames: allCookies.map(c => c.name)
  });
  
  return createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Handle case where cookies can't be set
          }
        },
      },
      global: {
        headers: {
          cookie: cookieString,
        },
      },
    }
  );
}

/**
 * Helper functions
 */

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentSession() {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.toLowerCase().trim(),
    password,
  });
  
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signUpWithEmail(email: string, password: string, metadata?: any) {
  const { data, error } = await supabase.auth.signUp({
    email: email.toLowerCase().trim(),
    password,
    options: {
      data: metadata,
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });
  
  if (error) {
    // Handle rate limiting - signup may have succeeded
    if (error.message.includes('security purposes') || error.message.includes('after')) {
      return {
        user: null,
        session: null,
        emailConfirmationRequired: true,
        rateLimited: true,
      };
    }
    throw error;
  }
  
  // Check if email confirmation is required (user exists but no session)
  const emailConfirmationRequired = data.user && !data.session;
  
  return {
    ...data,
    emailConfirmationRequired,
    rateLimited: false,
  };
}

// Database helpers — all accessors are lazy (no module-level supabase property reads).
export const db = {
  from: (table: string) => supabase.from(table),
  rpc: (fn: string, params?: any) => supabase.rpc(fn, params),
  get storage() { return supabase.storage; },
};

export default supabase;









