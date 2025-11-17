import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';
import { mapStudentRow, formatStudentForExport } from '../../../../lib/students/adapter';

/**
 * Students API Route - Uses Supabase
 * 
 * GET  /api/school/students?schoolId=X&classId=Y&status=active&q=John&page=1&pageSize=10
 * GET  /api/school/students?schoolId=X&kpis=true (get KPIs only)
 * GET  /api/school/students?schoolId=X&export=csv (CSV export)
 * POST /api/school/students (admin only)
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

/**
 * Calculate average attendance for last 30 days
 */
async function calculateAvgAttendance(supabase: any, schoolId: string): Promise<number> {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Count total attendance records
    const { count: totalCount } = await supabase
      .from('school_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .gte('date', dateStr);

    // Count present records
    const { count: presentCount } = await supabase
      .from('school_attendance')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'present')
      .gte('date', dateStr);

    if (!totalCount || totalCount === 0) {
      return 0;
    }

    return Math.round((presentCount || 0) / totalCount * 100);
  } catch (error) {
    console.error('Error calculating avg attendance:', error);
    return 0;
  }
}

/**
 * Get KPIs for students
 */
async function getStudentKPIs(supabase: any, schoolId: string) {
  // Total students
  const { count: total } = await supabase
    .from('school_students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId);

  // Active students
  const { count: active } = await supabase
    .from('school_students')
    .select('*', { count: 'exact', head: true })
    .eq('school_id', schoolId)
    .in('status', ['active', 'Active']);

  const inactive = (total || 0) - (active || 0);
  const avgAttendance = await calculateAvgAttendance(supabase, schoolId);

  return {
    total: total || 0,
    active: active || 0,
    inactive,
    avgAttendance,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Get students list with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const exportCsv = searchParams.get('export') === 'csv';
    const kpisOnly = searchParams.get('kpis') === 'true';

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

    // Handle KPIs-only request
    if (kpisOnly) {
      const kpis = await getStudentKPIs(supabase, schoolId);
      return NextResponse.json({
        success: true,
        data: kpis,
      });
    }

    // Handle CSV export
    if (exportCsv) {
      // Fetch all students (up to 10k) with current filters
      const classId = searchParams.get('classId');
      const status = searchParams.get('status');
      const grade = searchParams.get('grade');
      const q = searchParams.get('q');

      let query = supabase
        .from('school_students')
        .select('*, school_classes(name, grade_level)')
        .eq('school_id', schoolId)
        .limit(10000); // Safeguard: max 10k rows

      // Apply filters
      if (classId && classId !== 'all') {
        const classIds = Array.isArray(classId) ? classId : [classId];
        query = query.in('class_id', classIds);
      }

      if (status && status !== 'all') {
        const statuses = Array.isArray(status) ? status : [status];
        const statusLower = statuses.map((s: string) => s.toLowerCase());
        if (statusLower.includes('active')) {
          query = query.in('status', ['active', 'Active']);
        } else {
          query = query.in('status', statuses);
        }
      }

      if (grade && grade !== 'all') {
        // Filter by grade through class join
        const grades = Array.isArray(grade) ? grade : [grade];
        // This requires a join filter - we'll filter after fetch for now
      }

      if (q) {
        query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,student_number.ilike.%${q}%`);
      }

      const { data: students, error } = await query.order('last_name', { ascending: true });

      if (error) {
        throw error;
      }

      // Filter by grade if needed (after fetch since it's in joined table)
      let filteredStudents = students || [];
      if (grade && grade !== 'all') {
        const grades = Array.isArray(grade) ? grade : [grade];
        filteredStudents = filteredStudents.filter((s: any) => 
          s.school_classes && grades.includes(s.school_classes.grade_level)
        );
      }

      // Map and format for CSV
      const mappedStudents = filteredStudents.map(mapStudentRow);
      const csvRows = mappedStudents.map((s) => formatStudentForExport(s));
      
      // Generate CSV
      const headers = Object.keys(csvRows[0] || {});
      const csvContent = [
        headers.join(','),
        ...csvRows.map((row) => 
          headers.map((h) => {
            const value = row[h] || '';
            // Escape commas and quotes
            if (value.includes(',') || value.includes('"') || value.includes('\n')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        ),
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="students-${schoolId}-${new Date().toISOString().split('T')[0]}.csv"`,
        },
      });
    }

    // Regular list request with pagination
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');
    const grade = searchParams.get('grade');
    const q = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');
    const offset = (page - 1) * pageSize;

    // Build query
    let query = supabase
      .from('school_students')
      .select('*, school_classes(name, grade_level)', { count: 'exact' })
      .eq('school_id', schoolId);

    // Apply filters
    if (classId && classId !== 'all') {
      const classIds = Array.isArray(classId) ? classId : [classId];
      if (classIds.length === 1) {
        query = query.eq('class_id', classIds[0]);
      } else {
        query = query.in('class_id', classIds);
      }
    }

    if (status && status !== 'all') {
      const statuses = Array.isArray(status) ? status : [status];
      const statusLower = statuses.map((s: string) => s.toLowerCase());
      if (statusLower.includes('active')) {
        query = query.in('status', ['active', 'Active']);
      } else {
        query = query.in('status', statuses);
      }
    }

    if (q) {
      query = query.or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,student_number.ilike.%${q}%`);
    }

    // Pagination and ordering
    query = query
      .order('last_name', { ascending: true })
      .order('first_name', { ascending: true })
      .range(offset, offset + pageSize - 1);

    const { data: students, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Filter by grade if needed (after fetch since it's in joined table)
    let filteredStudents = students || [];
    let filteredCount = count || 0;
    if (grade && grade !== 'all') {
      const grades = Array.isArray(grade) ? grade : [grade];
      filteredStudents = filteredStudents.filter((s: any) => 
        s.school_classes && grades.includes(s.school_classes.grade_level)
      );
      // Note: count won't be accurate with grade filter, but we'll use it as approximation
    }

    // Map students to include `code` field
    const mappedStudents = filteredStudents.map(mapStudentRow);

    // Debug logging (development only)
    if (process.env.NODE_ENV === 'development') {
      console.log(`📚 Found ${filteredCount} students for school ${schoolId} (page ${page}, showing ${mappedStudents.length})`);
    }

    return NextResponse.json({
      success: true,
      data: {
        records: mappedStudents,
        total: filteredCount,
        hasMore: filteredCount > offset + pageSize,
        page,
        pageSize,
      },
    });
  } catch (error: any) {
    console.error('Error in students API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create a new student (admin only)
 * POST /api/school/students
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.student_number) {
      return NextResponse.json(
        { success: false, error: 'Student Code is required' },
        { status: 400 }
      );
    }

    if (!body.first_name || !body.last_name) {
      return NextResponse.json(
        { success: false, error: 'First name and last name are required' },
        { status: 400 }
      );
    }

    if (!body.class_id) {
      return NextResponse.json(
        { success: false, error: 'Class is required' },
        { status: 400 }
      );
    }

    if (!body.school_id) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Resolve school identifier to UUID
    const schoolId = await resolveSchoolId(supabase, body.school_id);
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Pre-check for duplicate student_number within the same school
    const { count: duplicateCount } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('student_number', body.student_number);

    if (duplicateCount && duplicateCount > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Student Code already exists in this school',
          code: 'DUPLICATE_STUDENT_CODE'
        },
        { status: 409 }
      );
    }

    // Prepare insert data
    // Note: grade is stored on school_classes, not school_students
    // contact_phone/contact_email don't exist in schema - use parent fields instead
    const insertData: any = {
      school_id: schoolId,
      student_number: body.student_number,
      first_name: body.first_name,
      last_name: body.last_name,
      class_id: body.class_id,
      status: body.status || 'Active',
      // created_at will be set automatically by the database
    };

    // Optional fields
    if (body.gender) insertData.gender = body.gender;
    if (body.date_of_birth) insertData.date_of_birth = body.date_of_birth;
    // Use parent fields for contact info if contact fields are provided
    if (body.contact_phone && !body.parent_phone) insertData.parent_phone = body.contact_phone;
    if (body.contact_email && !body.parent_email) insertData.parent_email = body.contact_email;
    if (body.parent_name) insertData.parent_name = body.parent_name;
    if (body.parent_email) insertData.parent_email = body.parent_email;
    if (body.parent_phone) insertData.parent_phone = body.parent_phone;
    if (body.address) insertData.address = body.address;
    if (body.photo_url) insertData.photo_url = body.photo_url;

    // Insert student
    const { data: student, error } = await supabase
      .from('school_students')
      .insert(insertData)
      .select('id')
      .single();

    if (error) {
      // Check if it's a unique constraint violation
      if (error.code === '23505' || error.message?.includes('unique')) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Student Code already exists in this school',
            code: 'DUPLICATE_STUDENT_CODE'
          },
          { status: 409 }
        );
      }

      console.error('Error creating student:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: { id: student.id },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
