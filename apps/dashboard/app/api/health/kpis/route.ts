import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Health KPIs API Route
 * 
 * GET /api/health/kpis?schoolId=X
 * 
 * Returns:
 * - totalStudents: Count of all students in school
 * - allergies: Count of distinct students with ≥1 allergy record
 * - medications: Count of distinct students with ≥1 medication record
 * - updatedThisMonth: Count of health records updated in current month
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

    const supabase = createServerSupabaseClient();
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);

    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Get current month start and end
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Total Students
    const { count: totalStudents } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // Allergies: Count distinct students with allergy records
    // Allergy records are record_type='general' with details->>'type'='allergy'
    const { data: allergyRecords } = await supabase
      .from('health_records')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('record_type', 'general')
      .eq('details->>type', 'allergy');

    const allergies = new Set(allergyRecords?.map(r => r.student_id) || []).size;

    // Medications: Count distinct students with medication records
    // Medication records are record_type='general' with details->>'type'='medication'
    const { data: medicationRecords } = await supabase
      .from('health_records')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('record_type', 'general')
      .eq('details->>type', 'medication');

    const medications = new Set(medicationRecords?.map(r => r.student_id) || []).size;

    // Updated This Month: Count records where recorded_at is in current month
    const { count: updatedThisMonth } = await supabase
      .from('health_records')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('recorded_at', monthStart.toISOString())
      .lte('recorded_at', monthEnd.toISOString());

    return NextResponse.json({
      success: true,
      data: {
        totalStudents: totalStudents || 0,
        allergies,
        medications,
        updatedThisMonth: updatedThisMonth || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching health KPIs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch health KPIs', message: error.message },
      { status: 500 }
    );
  }
}


