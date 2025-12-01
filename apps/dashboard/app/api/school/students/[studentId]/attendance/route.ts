import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';
import { mapAttendanceRecord } from '../../../../../../lib/students/adapter';

/**
 * Student Attendance API Route
 * 
 * GET /api/school/students/[studentId]/attendance?schoolId=X&period=1m|3m|6m|12m
 * 
 * Returns attendance records with date range filter and calculates attendance percentage
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const period = searchParams.get('period') || '3m'; // 1m, 3m, 6m, 12m

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

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
    const days = periodMap[period] || 90;
    dateStart.setDate(dateStart.getDate() - days);
    const dateStr = dateStart.toISOString().split('T')[0];

    // Fetch attendance records
    const { data: records, error } = await supabase
      .from('school_attendance')
      .select('*')
      .eq('student_id', studentId)
      .eq('school_id', schoolId)
      .gte('date', dateStr)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching attendance:', error);
      throw error;
    }

    // Map records through attendance view format
    const mappedRecords = (records || []).map((r) => ({
      ...r,
      studentid: r.student_id,
      classid: r.class_id,
      schoolid: r.school_id,
      status: r.status === 'present' ? 'Present' : 
              r.status === 'absent' ? 'Absent' :
              r.status === 'late' ? 'Late' :
              r.status === 'excused' ? 'Excused' : r.status,
    })).map(mapAttendanceRecord);

    // Calculate statistics
    const total = mappedRecords.length;
    const present = mappedRecords.filter((r) => r.status === 'Present').length;
    const absent = mappedRecords.filter((r) => r.status === 'Absent').length;
    const late = mappedRecords.filter((r) => r.status === 'Late').length;
    const excused = mappedRecords.filter((r) => r.status === 'Excused').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

    // Group by month for sparkline chart
    const byMonth: Record<string, { present: number; total: number; percentage: number }> = {};
    mappedRecords.forEach((record) => {
      const monthKey = record.date.substring(0, 7); // YYYY-MM
      if (!byMonth[monthKey]) {
        byMonth[monthKey] = { present: 0, total: 0, percentage: 0 };
      }
      byMonth[monthKey].total++;
      if (record.status === 'Present') {
        byMonth[monthKey].present++;
      }
    });

    // Calculate percentage for each month
    Object.keys(byMonth).forEach((month) => {
      const monthData = byMonth[month];
      monthData.percentage = monthData.total > 0 
        ? Math.round((monthData.present / monthData.total) * 100) 
        : 0;
    });

    // Convert to array for chart
    const chartData = Object.keys(byMonth)
      .sort()
      .map((month) => ({
        month,
        ...byMonth[month],
      }));

    return NextResponse.json({
      success: true,
      data: {
        period,
        total,
        present,
        absent,
        late,
        excused,
        percentage,
        records: mappedRecords,
        chartData,
      },
    });
  } catch (error: any) {
    console.error('Error in attendance API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}








