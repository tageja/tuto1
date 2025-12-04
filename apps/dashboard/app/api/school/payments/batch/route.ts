import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Payments Batch API Route - Uses Supabase
 * 
 * POST /api/school/payments/batch
 * 
 * Creates a payment batch and fans out payment items to students
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      schoolId: schoolIdentifier,
      title,
      description,
      target, // 'school', 'class', 'students'
      classId,
      studentIds, // Array of student IDs
      type,
      amount_cents,
      currency = 'VND',
      due_date,
      late_fee_cents,
      late_fee_rule, // JSONB: { after_days: number, mode: 'flat'|'%', amount?: number, percent?: number }
      notes,
      created_by,
    } = body;

    if (!schoolIdentifier || !title || !target || !type || !amount_cents || !due_date || !created_by) {
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

    // Determine which students to create items for
    let studentList: Array<{ id: string; class_id: string | null }> = [];

    if (target === 'school') {
      // Get all active students in the school
      const { data: students, error: studentsError } = await supabase
        .from('school_students')
        .select('id, class_id')
        .eq('school_id', schoolId)
        .in('status', ['active', 'Active']);

      if (studentsError) {
        throw studentsError;
      }
      studentList = students || [];
    } else if (target === 'class') {
      if (!classId) {
        return NextResponse.json(
          { success: false, error: 'classId is required when target is "class"' },
          { status: 400 }
        );
      }
      // Get all students in the class
      const { data: students, error: studentsError } = await supabase
        .from('school_students')
        .select('id, class_id')
        .eq('school_id', schoolId)
        .eq('class_id', classId)
        .in('status', ['active', 'Active']);

      if (studentsError) {
        throw studentsError;
      }
      studentList = students || [];
    } else if (target === 'students') {
      if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
        return NextResponse.json(
          { success: false, error: 'studentIds array is required when target is "students"' },
          { status: 400 }
        );
      }
      // Get the specified students and their class_ids
      const { data: students, error: studentsError } = await supabase
        .from('school_students')
        .select('id, class_id')
        .eq('school_id', schoolId)
        .in('id', studentIds);

      if (studentsError) {
        throw studentsError;
      }
      studentList = students || [];
    }

    if (studentList.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No students found for the specified target' },
        { status: 400 }
      );
    }

    // Create payment batch
    const { data: batch, error: batchError } = await supabase
      .from('payment_batches')
      .insert({
        school_id: schoolId,
        title,
        description: description || null,
        target,
        class_id: classId || null,
        student_ids: target === 'students' ? studentIds : null,
        late_fee_cents: late_fee_cents || null,
        late_fee_rule: late_fee_rule || null,
        due_date,
        created_by,
      })
      .select()
      .single();

    if (batchError) {
      console.error('Error creating payment batch:', batchError);
      throw batchError;
    }

    // Create payment items for each student
    const paymentItems = studentList.map((student) => ({
      school_id: schoolId,
      student_id: student.id,
      class_id: student.class_id,
      batch_id: batch.id,
      title,
      type,
      amount_cents,
      currency,
      due_date,
      status: 'pending' as const,
      notes: notes || null,
      created_by,
    }));

    const { data: items, error: itemsError } = await supabase
      .from('payment_items')
      .insert(paymentItems)
      .select();

    if (itemsError) {
      console.error('Error creating payment items:', itemsError);
      // Try to delete the batch if items creation fails
      await supabase.from('payment_batches').delete().eq('id', batch.id);
      throw itemsError;
    }

    return NextResponse.json({
      success: true,
      data: {
        batch,
        items: items || [],
        item_count: items?.length || 0,
      },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error in payments batch API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}

