import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../../../lib/school/resolveSchoolId';

/**
 * Medicine Reminder Detail API Route
 * 
 * PATCH /api/school/[schoolId]/medicine/reminders/[reminderId]
 * DELETE /api/school/[schoolId]/medicine/reminders/[reminderId]
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; reminderId: string }> }
) {
  try {
    const { schoolId: schoolIdParam, reminderId } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);
    const body = await request.json();

    if (!schoolIdentifier || !reminderId) {
      return NextResponse.json(
        { success: false, error: 'School ID and Reminder ID are required' },
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

    // Verify reminder belongs to school
    const { data: existing, error: fetchError } = await supabase
      .from('medicine_reminders')
      .select('id, school_id')
      .eq('id', reminderId)
      .eq('school_id', schoolId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found' },
        { status: 404 }
      );
    }

    // Update reminder
    const updateData: any = {};
    if (body.status !== undefined) updateData.status = body.status;
    if (body.medicine_name !== undefined) updateData.medicine_name = body.medicine_name;
    if (body.dosage !== undefined) updateData.dosage = body.dosage;
    if (body.frequency !== undefined) updateData.frequency = body.frequency;
    if (body.time_of_day !== undefined) updateData.time_of_day = body.time_of_day;
    if (body.start_date !== undefined) updateData.start_date = body.start_date;
    if (body.end_date !== undefined) updateData.end_date = body.end_date;
    if (body.notes !== undefined) updateData.notes = body.notes;
    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('medicine_reminders')
      .update(updateData)
      .eq('id', reminderId)
      .select()
      .single();

    if (error) {
      console.error('Error updating reminder:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update reminder', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error updating reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update reminder', message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string; reminderId: string }> }
) {
  try {
    const { schoolId: schoolIdParam, reminderId } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);
    const searchParams = request.nextUrl.searchParams;
    const hardDelete = searchParams.get('hard') === 'true';

    if (!schoolIdentifier || !reminderId) {
      return NextResponse.json(
        { success: false, error: 'School ID and Reminder ID are required' },
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

    // Verify reminder belongs to school
    const { data: existing, error: fetchError } = await supabase
      .from('medicine_reminders')
      .select('id, school_id')
      .eq('id', reminderId)
      .eq('school_id', schoolId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json(
        { success: false, error: 'Reminder not found' },
        { status: 404 }
      );
    }

    if (hardDelete) {
      // Hard delete
      const { error } = await supabase
        .from('medicine_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) {
        console.error('Error deleting reminder:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to delete reminder', message: error.message },
          { status: 500 }
        );
      }
    } else {
      // Soft delete (set status to 'ended')
      const { error } = await supabase
        .from('medicine_reminders')
        .update({ status: 'ended', updated_at: new Date().toISOString() })
        .eq('id', reminderId);

      if (error) {
        console.error('Error ending reminder:', error);
        return NextResponse.json(
          { success: false, error: 'Failed to end reminder', message: error.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: hardDelete ? 'Reminder deleted' : 'Reminder ended',
    });
  } catch (error: any) {
    console.error('Error deleting reminder:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete reminder', message: error.message },
      { status: 500 }
    );
  }
}


