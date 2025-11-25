import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';

/**
 * Medicine Reminders API Route
 * 
 * GET  /api/school/[schoolId]/medicine/reminders?studentId=X&status=active&due=true
 * POST /api/school/[schoolId]/medicine/reminders
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdParam } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');
    const due = searchParams.get('due') === 'true';

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

    let query = supabase
      .from('medicine_reminders')
      .select(`
        id,
        school_id,
        student_id,
        medicine_name,
        dosage,
        frequency,
        time_of_day,
        start_date,
        end_date,
        status,
        notes,
        created_by,
        created_at,
        updated_at,
        school_students!inner(id, first_name, last_name, class_id)
      `)
      .eq('school_id', schoolId);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (due) {
      const today = new Date().toISOString().split('T')[0];
      query = query
        .eq('status', 'active')
        .lte('start_date', today)
        .or(`end_date.is.null,end_date.gte.${today}`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reminders:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch reminders', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching reminders:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch reminders', message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdParam } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);
    const body = await request.json();

    const {
      student_id,
      medicine_name,
      dosage,
      frequency,
      time_of_day,
      start_date,
      end_date,
      notes,
      created_by,
    } = body;

    if (!schoolIdentifier || !student_id || !medicine_name || !frequency || !start_date) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
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

    // Verify student belongs to school
    const { data: student, error: studentError } = await supabase
      .from('school_students')
      .select('id, school_id')
      .eq('id', student_id)
      .eq('school_id', schoolId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found in this school' },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from('medicine_reminders')
      .insert({
        school_id: schoolId,
        student_id,
        medicine_name,
        dosage,
        frequency,
        time_of_day: time_of_day || null,
        start_date,
        end_date: end_date || null,
        notes: notes || null,
        status: 'active',
        created_by: created_by || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating reminder:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create reminder', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error creating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create reminder', message: error.message },
      { status: 500 }
    );
  }
}

