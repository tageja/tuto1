import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../../lib/supabase';

/**
 * PATCH /api/school/classes/[classId]/schedules/[slotId]
 * Updates a single schedule slot.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string; slotId: string }> }
) {
  try {
    const { classId, slotId } = await params;
    if (!classId || !slotId) {
      return NextResponse.json({ success: false, error: 'classId and slotId required' }, { status: 400 });
    }
    const body = await request.json();
    const allowed = ['day_of_week', 'start_time', 'end_time', 'subject_or_slot_name', 'room_number'];
    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (key in body) updates[key] = body[key] ?? null;
    }
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('school_class_schedules')
      .update(updates)
      .eq('id', slotId)
      .eq('class_id', classId)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Schedules PATCH error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

/**
 * DELETE /api/school/classes/[classId]/schedules/[slotId]
 * Removes a single schedule slot.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ classId: string; slotId: string }> }
) {
  try {
    const { classId, slotId } = await params;
    if (!classId || !slotId) {
      return NextResponse.json({ success: false, error: 'classId and slotId required' }, { status: 400 });
    }
    const supabase = createServerSupabaseClient();
    const { error } = await supabase
      .from('school_class_schedules')
      .delete()
      .eq('id', slotId)
      .eq('class_id', classId);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Schedules DELETE error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
