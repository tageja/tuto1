import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Student Growth API Route
 * 
 * GET /api/school/students/growth?schoolId=X&period=1m|3m|6m|12m&byClass=true
 * 
 * Returns enrollment growth data computed from school_students.enrolled_at
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const period = searchParams.get('period') || '12m'; // 1m, 3m, 6m, 12m
    const byClass = searchParams.get('byClass') === 'true';

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Resolve school identifier
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Calculate date range based on period
    const dateStart = new Date();
    const periodMap: Record<string, number> = {
      '1m': 30,
      '3m': 90,
      '6m': 180,
      '12m': 365,
    };
    const days = periodMap[period] || 365;
    dateStart.setDate(dateStart.getDate() - days);
    const dateStr = dateStart.toISOString().split('T')[0];

    // Fetch all students enrolled in the period
    // Note: school_students uses created_at as enrollment date (enrolled_at field doesn't exist in schema)
    const { data: students, error } = await supabase
      .from('school_students')
      .select('id, created_at, class_id, school_classes(name, grade_level)')
      .eq('school_id', schoolId)
      .gte('created_at', dateStr)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching students:', error);
      throw error;
    }

    // Group by month
    const byMonth: Record<string, number> = {};
    const byMonthAndClass: Record<string, Record<string, number>> = {};

    (students || []).forEach((student) => {
      // Use created_at as enrollment date (enrolled_at field doesn't exist in schema)
      const enrolledDate = student.created_at;
      if (!enrolledDate) return;

      const monthKey = enrolledDate.substring(0, 7); // YYYY-MM
      
      // Overall count
      byMonth[monthKey] = (byMonth[monthKey] || 0) + 1;

      // By class count
      if (byClass) {
        const className = student.school_classes?.name || 'Unassigned';
        if (!byMonthAndClass[monthKey]) {
          byMonthAndClass[monthKey] = {};
        }
        byMonthAndClass[monthKey][className] = (byMonthAndClass[monthKey][className] || 0) + 1;
      }
    });

    // Convert to array format
    const overallData = Object.keys(byMonth)
      .sort()
      .map((month) => ({
        month,
        count: byMonth[month],
      }));

    // Convert by-class data
    const byClassData = byClass ? Object.keys(byMonthAndClass)
      .sort()
      .map((month) => ({
        month,
        byClass: byMonthAndClass[month],
      })) : [];

    return NextResponse.json({
      success: true,
      data: {
        period,
        overall: overallData,
        byClass: byClassData,
      },
    });
  } catch (error: any) {
    console.error('Error in growth API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

