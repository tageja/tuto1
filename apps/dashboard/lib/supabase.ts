/**
 * Supabase Configuration for Web Dashboard
 */

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('⚠️  Supabase configuration missing');
  console.error('Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local');
}

// Create Supabase client for browser
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
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
    },
  });
  
  if (error) throw error;
  return data;
}

// Database helpers
export const db = {
  from: (table: string) => supabase.from(table),
  rpc: (fn: string, params?: any) => supabase.rpc(fn, params),
  storage: supabase.storage,
};

export default supabase;









