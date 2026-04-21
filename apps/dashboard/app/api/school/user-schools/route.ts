import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * User Schools API - Get schools accessible to current user
 * GET /api/school/user-schools?uid=xxx
 *
 * - Tuto global admin (role='admin'): returns ALL active schools
 * - School admin (role='school_admin'): returns ONLY their linked school(s) via school_admins
 * - Everyone else: returns empty (no cross-school access)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    const supabase = createServerSupabaseClient();

    // If schoolId provided, get that specific school
    if (schoolIdentifier) {
      const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
      if (!schoolId) {
        return NextResponse.json({ success: false, school: null }, { status: 404 });
      }
      const { data: school, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single();
      if (error) {
        console.error('Error fetching school:', error);
        return NextResponse.json({ success: false, school: null }, { status: 404 });
      }
      return NextResponse.json({ success: true, school });
    }

    // Identify the calling user — uid is passed as query param by the layout
    const uid = searchParams.get('uid');

    // Look up the user's role in public.users using the service-role client
    let userRole: string | null = null;
    let userRowId: string | null = null;
    if (uid) {
      const { data: userRow } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_user_id', uid)
        .maybeSingle();
      userRole = userRow?.role ?? null;
      userRowId = userRow?.id ?? null;
    }

    // school_admin: return ONLY their linked school(s)
    if (userRole === 'school_admin' && userRowId) {
      const { data: adminRows } = await supabase
        .from('school_admins')
        .select('school_id')
        .eq('user_id', userRowId);

      const schoolIds = (adminRows ?? []).map((r: any) => r.school_id).filter(Boolean);

      if (schoolIds.length === 0) {
        console.warn(`⚠️ school_admin ${uid} has no linked schools in school_admins`);
        return NextResponse.json({ success: true, schools: [] });
      }

      const { data: linkedSchools, error: linkedErr } = await supabase
        .from('schools')
        .select('*')
        .in('id', schoolIds)
        .order('name');

      if (linkedErr) {
        console.error('Error fetching linked schools:', linkedErr);
        throw linkedErr;
      }

      console.log(`📚 school_admin ${uid}: returning ${linkedSchools?.length ?? 0} linked school(s)`);
      return NextResponse.json({ success: true, schools: linkedSchools ?? [] });
    }

    // Tuto global admin: return all active schools
    if (userRole === 'admin') {
      const { data: allSchools, error: fetchError } = await supabase
        .from('schools')
        .select('*')
        .order('name');

      if (fetchError) {
        console.error('Error fetching schools:', fetchError);
        throw fetchError;
      }

      const schools = (allSchools || []).filter(
        (s: any) => s.status && s.status.toLowerCase() === 'active'
      );

      if (process.env.NODE_ENV === 'development') {
        console.log(`📚 admin: returning ${schools.length} active schools`);
      }

      return NextResponse.json({ success: true, schools });
    }

    // Any other role: no cross-school access
    console.warn(`⚠️ user-schools called by role='${userRole}' (uid=${uid}) — returning empty`);
    return NextResponse.json({ success: true, schools: [] });
  } catch (error: any) {
    console.error('User schools API error:', error);
    return NextResponse.json(
      { success: false, schools: [], error: error.message },
      { status: 500 }
    );
  }
}
