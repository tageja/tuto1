import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * Single Class API Route - Uses Supabase
 * 
 * GET   /api/school/classes/[classId]
 * PATCH /api/school/classes/[classId] (admin only)
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

    // Fetch class with teacher info
    const { data: classData, error } = await supabase
      .from('school_classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) {
      console.error('Supabase query error:', error);
      if (error.code === 'PGRST116') {
        // No rows returned
        return NextResponse.json(
          { error: 'Class not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    if (!classData) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      );
    }

    // Get teacher info if teacher_id exists
    let teacherName = null;
    if (classData.teacher_id) {
      const { data: teacher } = await supabase
        .from('school_teachers')
        .select('name, email')
        .eq('id', classData.teacher_id)
        .single();
      
      if (teacher) {
        teacherName = teacher.name || teacher.email;
      }
    }

    // Format response to match expected structure
    const formattedClass = {
      id: classData.id,
      name: classData.name,
      grade: classData.grade_level,
      grade_level: classData.grade_level,
      roomNumber: classData.room_number,
      room_number: classData.room_number,
      capacity: classData.capacity,
      status: classData.status || 'active',
      academic_year: classData.academic_year,
      teacher_id: classData.teacher_id,
      teacherName: teacherName,
      school_id: classData.school_id,
      created_at: classData.created_at,
      updated_at: classData.updated_at,
    };

    return NextResponse.json(formattedClass);
  } catch (error: any) {
    console.error('Error fetching class:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update class (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await request.json();

    if (!classId) {
      return NextResponse.json(
        { error: 'Class ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Update class
    const { data: classData, error } = await supabase
      .from('school_classes')
      .update({
        name: body.name,
        grade_level: body.grade_level || body.grade,
        room_number: body.room_number || body.roomNumber,
        capacity: body.capacity,
        teacher_id: body.teacher_id,
        status: body.status,
        academic_year: body.academic_year,
      })
      .eq('id', classId)
      .select()
      .single();

    if (error) {
      console.error('Error updating class:', error);
      throw error;
    }

    return NextResponse.json(classData);
  } catch (error: any) {
    console.error('Error updating class:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
