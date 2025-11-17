import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { resolveSchoolId } from '../../../../lib/school/resolveSchoolId';

/**
 * Teachers API Route - Uses Supabase
 * 
 * GET  /api/school/teachers?schoolId=X&status=active&subject=Math&q=John&page=1
 * POST /api/school/teachers (admin only)
 * 
 * Architecture: Next.js API → Supabase Database (with RLS)
 */

/**
 * Get teachers list with filters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const schoolIdentifier = searchParams.get('schoolId');
    const status = searchParams.get('status');
    const subject = searchParams.get('subject');
    const q = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!schoolIdentifier) {
      return NextResponse.json(
        { success: false, error: 'School ID is required' },
        { status: 400 }
      );
    }

    // Create Supabase client with service role (server-side)
    const supabase = createServerSupabaseClient();

    // Resolve school identifier (name or UUID) to UUID
    const schoolId = await resolveSchoolId(supabase, schoolIdentifier);
    
    if (!schoolId) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Build query
    let query = supabase
      .from('school_teachers')
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

    if (subject && subject !== 'all') {
      query = query.contains('subjects', [subject]);
    }

    if (q) {
      query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%`);
    }

    // Pagination and ordering
    query = query
      .order('name', { ascending: true })
      .range(offset, offset + limit - 1);

    const { data: teachers, error, count } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: {
        records: teachers || [],
        total: count || 0,
        hasMore: (count || 0) > offset + limit,
        page: Math.floor(offset / limit) + 1,
        limit,
      },
    });
  } catch (error: any) {
    console.error('Error in teachers API route:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

/**
 * Create a new teacher (admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.school_id) {
      return NextResponse.json(
        { success: false, error: 'Teacher name and school_id are required' },
        { status: 400 }
      );
    }

    // Create Supabase client
    const supabase = createServerSupabaseClient();

    // Insert teacher
    const { data: teacher, error } = await supabase
      .from('school_teachers')
      .insert({
        school_id: body.school_id,
        name: body.name,
        email: body.email || null,
        phone: body.phone || null,
        subjects: body.subjects || null,
        qualifications: body.qualifications || body.education || null,
        hire_date: body.hire_date || new Date().toISOString().split('T')[0],
        status: body.status || 'active',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating teacher:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: teacher,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating teacher:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
