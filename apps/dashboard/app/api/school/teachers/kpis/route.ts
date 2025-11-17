import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Teacher KPIs API Route - Uses Supabase
 * 
 * GET /api/school/teachers/kpis?schoolId=X
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
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

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Resolve school identifier (name or UUID) to UUID
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Fetch all teachers for this school
    // Note: school_teachers table doesn't have a rating field
    // Rating is only in the marketplace teachers table
    const { data: teachers, error, count } = await supabase
      .from('school_teachers')
      .select('status', { count: 'exact' })
      .eq('school_id', schoolId);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Calculate KPIs
    const total = count || 0;
    
    // Filter by status (case-insensitive)
    const active = (teachers || []).filter((t: any) => 
      t.status && t.status.toLowerCase() === 'active'
    ).length;
    
    const onLeave = (teachers || []).filter((t: any) => 
      t.status && (t.status.toLowerCase() === 'on leave' || t.status.toLowerCase() === 'onleave')
    ).length;

    // Rating is not available in school_teachers table
    // For now, set to 0 (N/A)
    // TODO: If rating is needed, it should come from marketplace teachers or feedback table
    const avgRating = 0;

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Teacher KPIs for school ${schoolId}:`, {
        total,
        active,
        onLeave,
        avgRating: Math.round(avgRating * 10) / 10,
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        total,
        active,
        onLeave,
        avgRating: Math.round(avgRating * 10) / 10,
      },
    });
  } catch (error: any) {
    console.error('Error in teacher KPIs API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
