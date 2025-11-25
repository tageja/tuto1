import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';

/**
 * Medicine KPIs API Route
 * 
 * GET /api/school/[schoolId]/medicine/kpis
 * 
 * Returns:
 * - totalReminders: Count of all reminders
 * - active: Count of active reminders
 * - dueToday: Count of reminders due today
 * - completedToday: Count of completed administrations today
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdParam } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);

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

    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(today + 'T00:00:00Z').toISOString();
    const todayEnd = new Date(today + 'T23:59:59Z').toISOString();

    // Total Reminders
    const { count: totalReminders } = await supabase
      .from('medicine_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    // Active Reminders
    const { count: active } = await supabase
      .from('medicine_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // Due Today: active reminders where start_date <= today and (end_date is null or end_date >= today)
    const { count: dueToday } = await supabase
      .from('medicine_reminders')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active')
      .lte('start_date', today)
      .or(`end_date.is.null,end_date.gte.${today}`);

    // Completed Today: count of logs with status='completed' today
    // First get student IDs for this school (subquery not supported in .in())
    const { data: schoolStudents } = await supabase
      .from('school_students')
      .select('id')
      .eq('school_id', schoolId);

    const studentIds = schoolStudents?.map(s => s.id) || [];
    
    const { count: completedTodayFixed } = studentIds.length > 0
      ? await supabase
          .from('medicine_administration_logs')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'completed')
          .gte('administered_at', todayStart)
          .lte('administered_at', todayEnd)
          .in('student_id', studentIds)
      : { count: 0 };

    return NextResponse.json({
      success: true,
      data: {
        totalReminders: totalReminders || 0,
        active: active || 0,
        dueToday: dueToday || 0,
        completedToday: completedTodayFixed || 0,
      },
    });
  } catch (error: any) {
    console.error('Error fetching medicine KPIs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch medicine KPIs', message: error.message },
      { status: 500 }
    );
  }
}

