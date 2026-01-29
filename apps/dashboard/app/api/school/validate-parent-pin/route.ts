import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Validate Parent PIN API Route
 * 
 * POST /api/school/validate-parent-pin
 * 
 * Validates a 6-digit PIN and links the authenticated parent to the school
 * Body: { pin: string }
 * Returns: { success: boolean, schoolId: string, schoolName: string, studentsLinked: number }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pin } = body;

    if (!pin || typeof pin !== 'string') {
      return NextResponse.json(
        { success: false, error: 'PIN is required' },
        { status: 400 }
      );
    }

    // Try to get auth token from Authorization header first (client-side fetch)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceSupabase = createServerSupabaseClient();

    let user = null;
    let authError = null;

    // Method 1: Try Authorization header (if client passes token)
    if (accessToken) {
      const { data: { user: tokenUser }, error: tokenError } = await serviceSupabase.auth.getUser(accessToken);
      if (!tokenError && tokenUser) {
        user = tokenUser;
        console.log('✅ Auth via Authorization header:', user.email);
      } else {
        authError = tokenError;
      }
    }

    // Method 2: Try cookies (for SSR/server-side)
    if (!user) {
      try {
        const cookieStore = await cookies();
        const allCookies = cookieStore.getAll();
        console.log('🍪 Available cookies:', allCookies.map(c => c.name));

        const authClient = createServerClient(supabaseUrl, supabaseAnonKey, {
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
        });

        // Try getSession first (works better with cookies)
        const { data: { session }, error: sessionError } = await authClient.auth.getSession();
        
        if (session?.user) {
          user = session.user;
          console.log('✅ Auth via cookies (session):', user.email);
        } else if (!sessionError) {
          // Fallback to getUser
          const getUserResult = await authClient.auth.getUser();
          if (getUserResult.data?.user) {
            user = getUserResult.data.user;
            console.log('✅ Auth via cookies (getUser):', user.email);
          } else {
            authError = getUserResult.error;
          }
        } else {
          authError = sessionError;
        }
      } catch (cookieError: any) {
        console.error('Cookie auth error:', cookieError);
        authError = cookieError;
      }
    }

    if (!user || !user.email) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    const userEmail = user.email;

    // Call the RPC function to validate PIN
    // serviceSupabase is already declared above
    const { data: result, error: rpcError } = await serviceSupabase.rpc(
      'validate_parent_pin',
      {
        pin: pin.trim(),
        user_email: userEmail.toLowerCase().trim(),
      }
    );

    if (rpcError) {
      console.error('Error validating PIN:', rpcError);
      return NextResponse.json(
        { success: false, error: rpcError.message || 'Failed to validate PIN' },
        { status: 500 }
      );
    }

    // Parse the JSON result from RPC
    if (!result || !result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result?.error || 'Invalid PIN or unable to link to school' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      schoolId: result.school_id,
      schoolName: result.school_name,
      studentsLinked: result.students_linked || 0,
    });
  } catch (error: any) {
    console.error('Error in validate-parent-pin API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
