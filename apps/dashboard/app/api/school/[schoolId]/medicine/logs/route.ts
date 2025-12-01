import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';

/**
 * Medicine Administration Logs API Route
 * 
 * GET  /api/school/[schoolId]/medicine/logs?studentId=X&reminderId=Y
 * POST /api/school/[schoolId]/medicine/logs
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
    const reminderId = searchParams.get('reminderId');

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
      .from('medicine_administration_logs')
      .select(`
        id,
        reminder_id,
        student_id,
        administered_at,
        administered_by,
        status,
        note,
        created_at,
        medicine_reminders(medicine_name, dosage),
        school_students!inner(id, first_name, last_name)
      `);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (reminderId) {
      query = query.eq('reminder_id', reminderId);
    }

    // Filter by school via student_id
    if (!studentId) {
      const { data: schoolStudents } = await supabase
        .from('school_students')
        .select('id')
        .eq('school_id', schoolId);

      const studentIds = schoolStudents?.map(s => s.id) || [];
      if (studentIds.length > 0) {
        query = query.in('student_id', studentIds);
      } else {
        return NextResponse.json({
          success: true,
          data: [],
        });
      }
    } else {
      // Verify student belongs to school
      const { data: student } = await supabase
        .from('school_students')
        .select('id, school_id')
        .eq('id', studentId)
        .eq('school_id', schoolId)
        .single();

      if (!student) {
        return NextResponse.json(
          { success: false, error: 'Student not found in this school' },
          { status: 404 }
        );
      }
    }

    query = query.order('administered_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching logs:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch logs', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching logs:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch logs', message: error.message },
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
      reminder_id,
      student_id,
      administered_at,
      administered_by,
      status,
      note,
    } = body;

    if (!schoolIdentifier || !student_id || !status) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['completed', 'missed', 'skipped'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be completed, missed, or skipped' },
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

    // Verify reminder if provided
    if (reminder_id) {
      const { data: reminder, error: reminderError } = await supabase
        .from('medicine_reminders')
        .select('id, student_id, school_id')
        .eq('id', reminder_id)
        .eq('school_id', schoolId)
        .single();

      if (reminderError || !reminder) {
        return NextResponse.json(
          { success: false, error: 'Reminder not found' },
          { status: 404 }
        );
      }

      if (reminder.student_id !== student_id) {
        return NextResponse.json(
          { success: false, error: 'Reminder does not belong to this student' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('medicine_administration_logs')
      .insert({
        reminder_id: reminder_id || null,
        student_id,
        administered_at: administered_at || new Date().toISOString(),
        administered_by: administered_by || null,
        status,
        note: note || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating log:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create log', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error creating log:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create log', message: error.message },
      { status: 500 }
    );
  }
}


