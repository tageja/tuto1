import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Payments Summary API Route - Uses Supabase
 * 
 * GET /api/school/payments/summary?schoolId=X&from=2025-01-01&to=2025-01-31&classId=...&studentId=...&type=...&status=...
 * 
 * Returns KPIs and donut chart data for filtered payment items
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const from = searchParams.get('from'); // ISO date string
    const to = searchParams.get('to'); // ISO date string
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type'); // tuition, trip, club, misc
    const status = searchParams.get('status'); // pending, paid, overdue, void, or 'all'

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

    // Build base query
    let query = supabase
      .from('payment_items')
      .select('id, amount_cents, status, due_date, paid_at, student_id', { count: 'exact' })
      .eq('school_id', schoolId);

    // Apply filters
    if (from) {
      query = query.gte('due_date', from);
    }
    if (to) {
      query = query.lte('due_date', to);
    }
    if (classId) {
      query = query.eq('class_id', classId);
    }
    if (studentId) {
      query = query.eq('student_id', studentId);
    }
    if (type) {
      query = query.eq('type', type);
    }
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Exclude void items from calculations
    query = query.neq('status', 'void');

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Error fetching payment items:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment items', message: error.message },
        { status: 500 }
      );
    }

    // Calculate KPIs
    const totalCollection = (items || []).reduce((sum, item) => sum + (item.amount_cents || 0), 0);
    const paid = (items || []).filter((item) => item.status === 'paid').reduce((sum, item) => sum + (item.amount_cents || 0), 0);
    const pending = (items || []).filter((item) => item.status === 'pending').reduce((sum, item) => sum + (item.amount_cents || 0), 0);
    const overdue = (items || []).filter((item) => item.status === 'overdue').reduce((sum, item) => sum + (item.amount_cents || 0), 0);

    // Get unique students count
    const uniqueStudents = new Set((items || []).map((item) => item.student_id)).size;
    const revenuePerStudent = uniqueStudents > 0 ? Math.round(paid / uniqueStudents) : 0;

    // Calculate donut chart data (percentages)
    const total = paid + pending + overdue;
    const paidPercent = total > 0 ? Math.round((paid / total) * 100) : 0;
    const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
    const overduePercent = total > 0 ? Math.round((overdue / total) * 100) : 0;

    // Donut chart data structure
    const donutData = {
      labels: ['Paid', 'Pending', 'Overdue'],
      datasets: [
        {
          data: [paidPercent, pendingPercent, overduePercent],
          values: [paid, pending, overdue], // Actual amounts for display
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: {
        kpis: {
          total_collection: totalCollection,
          paid,
          pending,
          overdue,
          total_students: uniqueStudents,
          revenue_per_student: revenuePerStudent,
        },
        donut: donutData,
      },
    });
  } catch (error: any) {
    console.error('Error in payments summary API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

