import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Check Parent Access API Route
 * 
 * GET /api/school/check-parent-access?schoolId=xxx (optional)
 * 
 * Checks if authenticated parent has access to schools
 * Returns: { success: boolean, isParent: boolean, hasAccess: boolean, schools: array }
 */
export const dynamic = 'force-dynamic'; // Disable caching
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get('schoolId');

    // Try to get auth token from Authorization header first (client-side fetch)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

    let user = null;
    let authError = null;

    // Method 1: Try Authorization header (if client passes token)
    if (accessToken) {
      const serviceSupabase = createServerSupabaseClient();
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

    // Get user's school associations
    const serviceSupabaseClient = createServerSupabaseClient();
    const { data: schools, error: schoolsError } = await serviceSupabaseClient.rpc(
      'get_user_school_associations',
      { user_email: user.email.toLowerCase().trim() }
    );

    if (schoolsError) {
      console.error('Error fetching school associations:', schoolsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check access' },
        { status: 500 }
      );
    }

    const schoolList = schools || [];
    const hasAccess = schoolList.length > 0;
    
    // Check if user is a parent (has any parent role schools)
    const isParent = schoolList.some((s: any) => s.role === 'parent');
    
    // If specific schoolId requested, check access to that school
    let hasSpecificAccess = true;
    if (schoolId) {
      hasSpecificAccess = schoolList.some(
        (s: any) => s.school_id === schoolId || s.school_id === decodeURIComponent(schoolId)
      );
    }

    return NextResponse.json({
      success: true,
      isParent,
      hasAccess,
      hasSpecificAccess: schoolId ? hasSpecificAccess : hasAccess,
      schools: schoolList,
    });
  } catch (error: any) {
    console.error('Error in check-parent-access API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
