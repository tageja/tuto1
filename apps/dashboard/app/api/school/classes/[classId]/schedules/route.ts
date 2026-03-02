import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';

/**
 * GET /api/school/classes/[classId]/schedules
 * Returns weekly schedule slots for the class (school_class_schedules).
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    if (!classId) {
      return NextResponse.json({ success: false, error: 'classId required' }, { status: 400 });
    }
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('school_class_schedules')
      .select('*')
      .eq('class_id', classId)
      .order('day_of_week', { ascending: true })
      .order('start_time', { ascending: true });
    if (error) throw error;
    return NextResponse.json({ success: true, data: data ?? [] });
  } catch (err: any) {
    console.error('Schedules GET error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}

/**
 * POST /api/school/classes/[classId]/schedules
 * Body: { school_id, day_of_week, start_time, end_time, subject_or_slot_name?, room_number? }
 * Creates a schedule slot (admin only in practice; RLS enforces).
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params;
    const body = await request.json();
    if (!classId || !body?.school_id || body.day_of_week == null || !body.start_time || !body.end_time) {
      return NextResponse.json(
        { success: false, error: 'classId, school_id, day_of_week, start_time, end_time required' },
        { status: 400 }
      );
    }
    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('school_class_schedules')
      .insert({
        school_id: body.school_id,
        class_id: classId,
        day_of_week: Number(body.day_of_week),
        start_time: body.start_time,
        end_time: body.end_time,
        subject_or_slot_name: body.subject_or_slot_name || null,
        room_number: body.room_number || null,
      })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (err: any) {
    console.error('Schedules POST error:', err);
    return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
  }
}
