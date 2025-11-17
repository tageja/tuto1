import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';

/**
 * Class Students API Route - Uses Supabase
 * 
 * GET /api/school/classes/[classId]/students
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Fetch students for this class
    const { data: students, error } = await supabase
      .from('school_students')
      .select('*')
      .eq('class_id', classId)
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true });

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Format students to match expected structure
    const formattedStudents = (students || []).map(student => ({
      id: student.id,
      code: student.student_number || student.id.slice(-6),
      name: `${student.first_name} ${student.last_name}`.trim(),
      first_name: student.first_name,
      last_name: student.last_name,
      dob: student.date_of_birth,
      date_of_birth: student.date_of_birth,
      gender: student.gender,
      status: student.status || 'active',
      parent_name: student.parent_name,
      parent_email: student.parent_email,
      parent_phone: student.parent_phone,
      address: student.address,
    }));

    return NextResponse.json({ students: formattedStudents });
  } catch (error: any) {
    console.error('Error fetching class students:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
