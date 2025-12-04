import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Payments Trend API Route - Uses Supabase
 * 
 * GET /api/school/payments/trend?schoolId=X&from=2025-01-01&to=2025-01-31
 * 
 * Returns daily revenue series for line chart
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const from = searchParams.get('from'); // ISO date string
    const to = searchParams.get('to'); // ISO date string

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

    // Build query for daily revenue from materialized view or calculate from items
    const fromDate = from || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const toDate = to || new Date().toISOString().split('T')[0];

    // Query paid items and group by day
    let query = supabase
      .from('payment_items')
      .select('paid_at, amount_cents')
      .eq('school_id', schoolId)
      .eq('status', 'paid')
      .not('paid_at', 'is', null)
      .gte('paid_at', fromDate)
      .lte('paid_at', toDate)
      .order('paid_at', { ascending: true });

    const { data: paidItems, error } = await query;

    if (error) {
      console.error('Error fetching payment trend data:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch trend data', message: error.message },
        { status: 500 }
      );
    }

    // Group by day and sum amounts
    const dailyMap = new Map<string, number>();

    (paidItems || []).forEach((item) => {
      if (item.paid_at) {
        const day = new Date(item.paid_at).toISOString().split('T')[0];
        const current = dailyMap.get(day) || 0;
        dailyMap.set(day, current + (item.amount_cents || 0));
      }
    });

    // Fill in missing days with zero values
    const result: Array<{ date: string; revenue: number }> = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    const current = new Date(start);

    while (current <= end) {
      const dayStr = current.toISOString().split('T')[0];
      result.push({
        date: dayStr,
        revenue: dailyMap.get(dayStr) || 0,
      });
      current.setDate(current.getDate() + 1);
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error in payments trend API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

