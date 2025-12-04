import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Payments Items API Route - Uses Supabase
 * 
 * GET /api/school/payments/items?schoolId=X&from=...&to=...&classId=...&studentId=...&type=...&status=...&format=csv
 * 
 * Returns filtered payment items table or CSV export
 */

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const format = searchParams.get('format'); // 'csv' or null

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

    // Build query with joins for student and class names
    let query = supabase
      .from('payment_items')
      .select(`
        id,
        title,
        type,
        amount_cents,
        currency,
        due_date,
        status,
        paid_at,
        method,
        notes,
        created_at,
        student_id,
        class_id,
        school_students!inner(first_name, last_name),
        school_classes(name)
      `, { count: 'exact' })
      .eq('school_id', schoolId)
      .neq('status', 'void')
      .order('due_date', { ascending: false })
      .order('created_at', { ascending: false });

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

    const { data: items, error, count } = await query;

    if (error) {
      console.error('Error fetching payment items:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch payment items', message: error.message },
        { status: 500 }
      );
    }

    // Format data for frontend
    const formattedItems = (items || []).map((item: any) => ({
      id: item.id,
      student_name: `${item.school_students?.first_name || ''} ${item.school_students?.last_name || ''}`.trim(),
      class_name: item.school_classes?.name || null,
      title: item.title,
      type: item.type,
      amount_cents: item.amount_cents,
      amount_dollars: item.amount_cents, // VND doesn't use decimals
      currency: item.currency,
      due_date: item.due_date,
      paid_at: item.paid_at,
      status: item.status,
      method: item.method,
      notes: item.notes,
      student_id: item.student_id,
      class_id: item.class_id,
    }));

    // CSV Export
    if (format === 'csv') {
      const headers = [
        'Student Name',
        'Class',
        'Title',
        'Type',
        'Amount (VND)',
        'Due Date',
        'Paid Date',
        'Status',
        'Payment Method',
      ];

      const rows = formattedItems.map((item) => [
        item.student_name,
        item.class_name || '',
        item.title,
        item.type,
        item.amount_dollars,
        item.due_date ? new Date(item.due_date).toLocaleDateString() : '',
        item.paid_at ? new Date(item.paid_at).toLocaleDateString() : '',
        item.status,
        item.method || '',
      ]);

      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
      ].join('\n');

      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments-${schoolId}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // JSON response
    return NextResponse.json({
      success: true,
      data: formattedItems,
      count: count || formattedItems.length,
    });
  } catch (error: any) {
    console.error('Error in payments items API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

