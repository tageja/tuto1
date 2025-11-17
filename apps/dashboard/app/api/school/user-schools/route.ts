import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * User Schools API - Get schools accessible to current user
 * GET /api/school/user-schools?uid=xxx
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const uid = searchParams.get('uid');

    const supabase = createServerSupabaseClient();

    // If schoolId provided, get that specific school
    if (schoolIdentifier) {
      // Resolve school identifier (name or UUID) to UUID
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

    // Otherwise, get all schools (handle both 'active' and 'Active' status)
    // Fetch all schools first, then filter for active status (case-insensitive)
    const { data: allSchools, error: fetchError } = await supabase
      .from('schools')
      .select('*')
      .order('name');

    if (fetchError) {
      console.error('Error fetching schools:', fetchError);
      throw fetchError;
    }

    // Filter for active schools (case-insensitive)
    const schools = (allSchools || []).filter(
      school => school.status && school.status.toLowerCase() === 'active'
    );

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📚 Found ${schools.length} active schools:`, schools.map(s => `"${s.name}" (${s.status})`).join(', '));
    }

    return NextResponse.json({
      success: true,
      schools: schools || [],
    });
  } catch (error: any) {
    console.error('User schools API error:', error);
    return NextResponse.json(
      { success: false, schools: [], error: error.message },
      { status: 500 }
    );
  }
}
