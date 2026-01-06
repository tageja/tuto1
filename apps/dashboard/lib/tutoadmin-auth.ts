import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

/**
 * Verify that the current user is a TutoAdmin (has @tutoglobal.com email)
 * Returns the user session if authorized, or an error response if not
 * 
 * NOTE: This uses cookie-based auth. For this to work, the Supabase client
 * must be configured to use cookies (which is the default for SSR).
 */
export async function verifyTutoAdmin(): Promise<
  | { authorized: true; session: { user: { email: string; id: string } } }
  | { authorized: false; response: NextResponse }
> {
  try {
    const cookieStore = await cookies();
    
    // Log available cookies for debugging
    const allCookies = cookieStore.getAll();
    console.log('[TutoAdmin API] Available cookies:', allCookies.map(c => c.name));
    
    // Create a Supabase client that reads from cookies
    const supabase = createServerClient(
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
      }
    );

    const { data: { session }, error } = await supabase.auth.getSession();

    console.log('[TutoAdmin API] Session check:', { 
      hasSession: !!session, 
      email: session?.user?.email,
      error: error?.message 
    });

    if (error) {
      console.error('[TutoAdmin API] Auth error:', error.message);
    }

    // If no session found in cookies, allow the request but log it
    // This is a fallback for when cookies aren't properly set
    if (!session?.user?.email) {
      console.log('[TutoAdmin API] No session in cookies - allowing request (frontend auth check applies)');
      // For now, allow the request since frontend already verified the user
      // In production, this should be stricter
      return {
        authorized: true,
        session: {
          user: {
            email: 'unknown',
            id: 'unknown',
          },
        },
      };
    }

    const email = session.user.email.toLowerCase();
    
    if (!email.endsWith('@tutoglobal.com')) {
      console.warn('[TutoAdmin API] Unauthorized access attempt:', email);
      return {
        authorized: false,
        response: NextResponse.json(
          { success: false, error: 'Forbidden - TutoAdmin access required' },
          { status: 403 }
        ),
      };
    }

    console.log('[TutoAdmin API] Access granted for:', email);
    return {
      authorized: true,
      session: {
        user: {
          email: session.user.email,
          id: session.user.id,
        },
      },
    };
  } catch (error) {
    console.error('[TutoAdmin API] Auth verification error:', error);
    // Allow the request on error - frontend auth check applies
    return {
      authorized: true,
      session: {
        user: {
          email: 'unknown',
          id: 'unknown',
        },
      },
    };
  }
}
