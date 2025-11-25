import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { resolveSchoolId } from '../../../../../lib/school/resolveSchoolId';

/**
 * Notifications API Route
 * 
 * POST /api/school/[schoolId]/notifications
 * 
 * Creates notification rows for medicine reminders and logs
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ schoolId: string }> }
) {
  try {
    const { schoolId: schoolIdParam } = await params;
    const schoolIdentifier = decodeURIComponent(schoolIdParam);
    const body = await request.json();

    const {
      user_ids,
      type,
      payload,
    } = body;

    if (!schoolIdentifier || !user_ids || !Array.isArray(user_ids) || user_ids.length === 0 || !type || !payload) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: user_ids (array), type, payload' },
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

    // Insert notifications for each user
    const notifications = user_ids.map((user_id: string) => ({
      school_id: schoolId,
      user_id,
      type,
      payload,
    }));

    const { data, error } = await supabase
      .from('school_notifications')
      .insert(notifications)
      .select();

    if (error) {
      console.error('Error creating notifications:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create notifications', message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error('Error creating notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create notifications', message: error.message },
      { status: 500 }
    );
  }
}

