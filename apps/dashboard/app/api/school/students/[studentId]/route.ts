import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';
import { mapStudentRow } from '../../../../../lib/students/adapter';

/**
 * Single Student API Route - Uses Supabase
 * 
 * GET   /api/school/students/[studentId]?schoolId=X
 * PATCH /api/school/students/[studentId] (admin only)
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    if (!schoolIdentifier) {
      return NextResponse.json(
        { error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Resolve school identifier (name or UUID) to UUID
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    
    if (!schoolId) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }

    // Fetch student first
    const { data: student, error } = await supabase
      .from('school_students')
      .select('*')
      .eq('id', studentId)
      .eq('school_id', schoolId)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Student not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Fetch class info if class_id exists
    let className = null;
    let gradeLevel = null;
    let roomNumber = null;
    let classData = null;
    
    if (student.class_id) {
      const { data: classInfo } = await supabase
        .from('school_classes')
        .select('name, grade_level, room_number')
        .eq('id', student.class_id)
        .single();
      
      if (classInfo) {
        classData = classInfo;
        className = classInfo.name;
        gradeLevel = classInfo.grade_level;
        roomNumber = classInfo.room_number;
      }
    }

    // Fetch attendance summary (last 30d, 90d, 180d, 365d)
    const attendanceSummaries: any = {};
    const periods = [
      { key: '30d', days: 30 },
      { key: '90d', days: 90 },
      { key: '180d', days: 180 },
      { key: '365d', days: 365 },
    ];

    for (const period of periods) {
      const dateStart = new Date();
      dateStart.setDate(dateStart.getDate() - period.days);
      const dateStr = dateStart.toISOString().split('T')[0];

      const { count: total } = await supabase
        .from('school_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .gte('date', dateStr);

      const { count: present } = await supabase
        .from('school_attendance')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', studentId)
        .eq('status', 'present')
        .gte('date', dateStr);

      attendanceSummaries[period.key] = {
        total: total || 0,
        present: present || 0,
        percentage: total && total > 0 ? Math.round((present || 0) / total * 100) : 0,
      };
    }

    // Fetch notes (if table exists)
    let notes: any[] = [];
    try {
      const { data: notesData } = await supabase
        .from('student_notes')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50);
      notes = notesData || [];
    } catch (error) {
      // Table doesn't exist, use empty array
      console.log('student_notes table not found, skipping');
    }

    // Fetch fees (if table exists)
    let fees: any[] = [];
    try {
      const { data: feesData } = await supabase
        .from('fees_summary')
        .select('*')
        .eq('student_id', studentId)
        .order('due_date', { ascending: false })
        .limit(10);
      fees = feesData || [];
    } catch (error) {
      // Table doesn't exist, use empty array
      console.log('fees_summary table not found, skipping');
    }

    // Fetch attendance records for chart (grouped by month, last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    const dateStr = twelveMonthsAgo.toISOString().split('T')[0];

    const { data: attendanceRecords } = await supabase
      .from('school_attendance')
      .select('*')
      .eq('student_id', studentId)
      .gte('date', dateStr)
      .order('date', { ascending: true });

    // Format response to match expected structure
    const studentWithClass = {
      ...student,
      school_classes: classData ? { name: className, grade_level: gradeLevel } : null,
    };
    const formattedStudent = mapStudentRow(studentWithClass);

    return NextResponse.json({
      success: true,
      data: {
        ...formattedStudent,
        classDetails: classData ? {
          id: student.class_id,
          name: className,
          gradeLevel: gradeLevel,
          roomNumber: roomNumber,
        } : null,
        parentPrimary: student.parent_name ? {
          name: student.parent_name,
          phone: student.parent_phone,
          email: student.parent_email,
        } : null,
        parentSecondary: null, // Can be populated if secondary parent fields exist
        attendanceSummary: attendanceSummaries,
        notes: notes,
        fees: fees,
        attendanceRecords: attendanceRecords || [],
      },
    });
  } catch (error: any) {
    console.error('Error fetching student:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      stack: error.stack,
    });
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error', 
        message: error.message,
        code: error.code,
        details: error.details,
      },
      { status: 500 }
    );
  }
}

/**
 * Update student (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Update student
    const { data: studentData, error } = await supabase
      .from('school_students')
      .update({
        first_name: body.first_name,
        last_name: body.last_name,
        student_number: body.student_number,
        date_of_birth: body.date_of_birth || body.dob,
        gender: body.gender,
        status: body.status,
        class_id: body.class_id,
        parent_name: body.parent_name,
        parent_email: body.parent_email,
        parent_phone: body.parent_phone,
        address: body.address,
        enrollment_date: body.enrollment_date,
      })
      .eq('id', studentId)
      .select()
      .single();

    if (error) {
      console.error('Error updating student:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: studentData,
    });
  } catch (error: any) {
    console.error('Error updating student:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

