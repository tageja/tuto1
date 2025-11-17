import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Classes API Route - Uses Supabase
 * 
 * GET  /api/school/classes?schoolId=X&status=active&q=Class5A
 * POST /api/school/classes (admin only)
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

/**
 * Get classes list with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const status = searchParams.get('status');
    const gradeLevel = searchParams.get('gradeLevel');
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role
    const supabase = createServerSupabaseClient();

    // Resolve school identifier (name or UUID) to UUID
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Build query - get classes first, then join teacher info separately
    let query = supabase
      .from('school_classes')
      .select('*', { count: 'exact' })
      .eq('school_id', schoolId);

    // Apply filters
    if (status && status !== 'all') {
      // Handle both 'active' and 'Active' status values
      const statusLower = status.toLowerCase();
      if (statusLower === 'active') {
        // Use .in() to match both 'active' and 'Active'
        query = query.in('status', ['active', 'Active']);
      } else {
        query = query.eq('status', status);
      }
    }

    if (gradeLevel && gradeLevel !== 'all') {
      query = query.eq('grade_level', gradeLevel);
    }

    if (q) {
      query = query.ilike('name', `%${q}%`);
    }

    // Pagination and ordering
    query = query
      .order('grade_level', { ascending: true })
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: classes, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Get student counts and teacher info for each class
    const classesWithCounts = await Promise.all(
      (classes || []).map(async (classItem) => {
        // Get student count for this class
        const { count: studentCount } = await supabase
          .from('school_students')
          .select('*', { count: 'exact', head: true })
          .eq('class_id', classItem.id);

        // Get teacher info if teacher_id exists
        let teacherName = 'Not assigned';
        if (classItem.teacher_id) {
          const { data: teacher } = await supabase
            .from('school_teachers')
            .select('name, email')
            .eq('id', classItem.teacher_id)
            .single();
          
          if (teacher) {
            teacherName = teacher.name || teacher.email || 'Not assigned';
          }
        }

        return {
          ...classItem,
          student_count: studentCount || 0,
          homeroomTeacherName: teacherName,
          studentCount: studentCount || 0,
          roomNumber: classItem.room_number,
          grade: classItem.grade_level,
        };
      })
    );

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📚 Found ${count || 0} classes for school ${schoolId}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        records: classesWithCounts || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Error in classes API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create a new class (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.school_id) {
      return NextResponse.json(
        { success: false, error: 'Class name and school_id are required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Insert class
    const { data: classData, error } = await supabase
      .from('school_classes')
      .insert({
        school_id: body.school_id,
        teacher_id: body.teacher_id || null,
        name: body.name,
        grade_level: body.grade_level || null,
        academic_year: body.academic_year || new Date().getFullYear().toString(),
        room_number: body.room_number || null,
        capacity: body.capacity || null,
        status: body.status || 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating class:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: classData,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
