import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../lib/school/resolveSchoolId';

/**
 * Medicine Emergency Items API Route
 * 
 * GET  /api/school/[schoolId]/medicine/emergency?studentId=X
 * POST /api/school/[schoolId]/medicine/emergency (UPSERT)
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
      .from('medicine_emergency_items')
      .select(`
        id,
        school_id,
        student_id,
        item_name,
        expiry_date,
        location,
        updated_at,
        school_students!inner(id, first_name, last_name)
      `)
      .eq('school_id', schoolId);

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    query = query.order('updated_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching emergency items:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch emergency items', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    console.error('Error fetching emergency items:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch emergency items', message: error.message },
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
      id,
      student_id,
      item_name,
      expiry_date,
      location,
    } = body;

    if (!schoolIdentifier || !student_id || !item_name) {
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

    // UPSERT: if id provided, update; otherwise insert
    if (id) {
      // Update existing
      const { data, error } = await supabase
        .from('medicine_emergency_items')
        .update({
          item_name,
          expiry_date: expiry_date || null,
          location: location || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('school_id', schoolId)
        .select()
        .single();

      if (error) {
        console.error('Error updating emergency item:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to update emergency item', message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    } else {
      // Insert new
      const { data, error } = await supabase
        .from('medicine_emergency_items')
        .insert({
          school_id: schoolId,
          student_id,
          item_name,
          expiry_date: expiry_date || null,
          location: location || null,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating emergency item:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to create emergency item', message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        data,
      });
    }
  } catch (error: any) {
    console.error('Error upserting emergency item:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upsert emergency item', message: error.message },
      { status: 500 }
    );
  }
}

