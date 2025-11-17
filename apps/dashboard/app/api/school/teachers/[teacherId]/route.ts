import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Single Teacher API Route - Uses Supabase
 * 
 * GET   /api/school/teachers/[teacherId]?schoolId=X
 * PATCH /api/school/teachers/[teacherId] (admin only)
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const teacherId = params.teacherId;
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Build query
    let query = supabase
      .from('school_teachers')
      .select('*')
      .eq('id', teacherId);

    // If schoolId provided, also filter by school
    if (schoolIdentifier) {
      const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
      if (schoolId) {
        query = query.eq('school_id', schoolId);
      }
    }

    const { data: teacher, error } = await query.maybeSingle();

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: 'Teacher not found' },
        { status: 404 }
      );
    }

    // Calculate stats
    const stats = {
      tenure: 0,
      absences: 0,
      avgFeedbackRating: 0,
      feedbackCount: 0,
      avgWorkload: 0,
    };

    // Calculate tenure from hire_date
    if (teacher.hire_date) {
      const hired = new Date(teacher.hire_date);
      const now = new Date();
      stats.tenure = Math.floor((now.getTime() - hired.getTime()) / (1000 * 60 * 60 * 24 * 365));
    }

    return NextResponse.json({
      success: true,
      data: { ...teacher, stats }
    });
  } catch (error: any) {
    console.error('Error in teacher detail API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Update teacher (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { teacherId: string } }
) {
  try {
    const teacherId = params.teacherId;
    const body = await request.json();

    if (!teacherId) {
      return NextResponse.json(
        { success: false, error: 'Teacher ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Update teacher
    const { data: teacher, error } = await supabase
      .from('school_teachers')
      .update({
        name: body.name,
        email: body.email,
        phone: body.phone,
        subjects: body.subjects,
        qualifications: body.qualifications,
        status: body.status,
        hire_date: body.hire_date,
      })
      .eq('id', teacherId)
      .select()
      .single();

    if (error) {
      console.error('Error updating teacher:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    });
  } catch (error: any) {
    console.error('Error updating teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
