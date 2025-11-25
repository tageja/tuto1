import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';

/**
 * Emergency Contacts API Route
 * 
 * PATCH /api/health/contacts/[studentId]
 * 
 * Body: { primary_name, primary_phone, alt_name?, alt_phone? }
 * 
 * Upserts emergency contacts for a student
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const body = await request.json();
    const { primary_name, primary_phone, alt_name, alt_phone } = body;

    if (!studentId) {
      return NextResponse.json(
        { success: false, error: 'Student ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Verify student exists
    const { data: student, error: studentError } = await supabase
      .from('school_students')
      .select('id')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Check if contacts exist
    const { data: existing } = await supabase
      .from('health_emergency_contacts')
      .select('id')
      .eq('student_id', studentId)
      .maybeSingle();

    let result;
    if (existing) {
      // Update
      const { data, error } = await supabase
        .from('health_emergency_contacts')
        .update({
          primary_name: primary_name || null,
          primary_phone: primary_phone || null,
          alt_name: alt_name || null,
          alt_phone: alt_phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      result = data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('health_emergency_contacts')
        .insert({
          student_id: studentId,
          primary_name: primary_name || null,
          primary_phone: primary_phone || null,
          alt_name: alt_name || null,
          alt_phone: alt_phone || null,
        })
        .select()
        .single();

      if (error) throw error;
      result = data;
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    console.error('Error upserting emergency contacts:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update emergency contacts', message: error.message },
      { status: 500 }
    );
  }
}

