import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Get Parent PIN API Route (Admin Only)
 * 
 * GET /api/school/parent-pin?schoolId=xxx
 * 
 * Returns the school's parent PIN for admin users only
 * Returns: { success: boolean, pin: string }
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
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
      } catch (cookieError) {
        console.error('Cookie auth error:', cookieError);
      }
    }

    console.log('🔐 Final auth check:', {
      hasUser: !!user,
      userEmail: user?.email,
      error: authError?.message,
      usedHeader: !!accessToken
    });

    if (authError || !user || !user.email) {
      console.error('❌ Auth failed:', {
        error: authError?.message,
        hasUser: !!user,
        userEmail: user?.email,
        hasAuthHeader: !!authHeader
      });
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    // Resolve school ID
    const schoolId = await resolveSchoolId(serviceSupabase, schoolIdentifier);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Check if user is an admin/teacher for this school
    const { data: teacher, error: teacherError } = await serviceSupabase
      .from('school_teachers')
      .select('id, status')
      .eq('school_id', schoolId)
      .eq('email', user.email.toLowerCase().trim())
      .eq('status', 'active')
      .single();

    if (teacherError || !teacher) {
      return NextResponse.json(
        { success: false, error: 'Access denied - Admin access required' },
        { status: 403 }
      );
    }

    // Get school PIN
    const { data: school, error: schoolError } = await serviceSupabase
      .from('schools')
      .select('parent_pin')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Return success with pin (or null if not set) so UI can show "Not set"
    return NextResponse.json({
      success: true,
      pin: school.parent_pin ?? null,
    });
  } catch (error: any) {
    console.error('Error in parent-pin API:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
