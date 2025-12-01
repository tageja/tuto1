import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createAuthenticatedSupabaseClient } from '../../../../lib/supabase';

/**
 * Health Incidents API Route
 * 
 * POST /api/health/incidents
 * 
 * Body: { studentId, category, meta?, happened_at? }
 * 
 * Creates incident report and notifies parent(s)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { studentId, category, meta, happened_at } = body;

    if (!studentId || !category) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: studentId, category' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = ['fever', 'cough', 'tired', 'injury'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { success: false, error: `Invalid category. Must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get student to find school_id
    const { data: student, error: studentError } = await supabase
      .from('school_students')
      .select('school_id, first_name, last_name')
      .eq('id', studentId)
      .single();

    if (studentError || !student) {
      return NextResponse.json(
        { success: false, error: 'Student not found' },
        { status: 404 }
      );
    }

    // Get authenticated user for created_by
    let createdBy: string | null = null;
    try {
      const authSupabase = await createAuthenticatedSupabaseClient(request);
      const { data: { user } } = await authSupabase.auth.getUser();
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('id')
          .eq('auth_user_id', user.id)
          .maybeSingle();
        createdBy = userData?.id || null;
      }
    } catch (authError) {
      console.warn('Could not get authenticated user:', authError);
    }

    // Insert incident report
    const { data: incident, error: incidentError } = await supabase
      .from('health_incident_reports')
      .insert({
        school_id: student.school_id,
        student_id: studentId,
        category,
        meta: meta || {},
        happened_at: happened_at || new Date().toISOString(),
        created_by: createdBy,
      })
      .select()
      .single();

    if (incidentError) {
      console.error('Error inserting incident:', incidentError);
      return NextResponse.json(
        { success: false, error: 'Failed to create incident report', message: incidentError.message },
        { status: 500 }
      );
    }

    // Lookup parent user_id(s) via school_parent_students
    const { data: parentMappings } = await supabase
      .from('school_parent_students')
      .select('parent_user_id')
      .eq('student_id', studentId)
      .eq('school_id', student.school_id);

    if (parentMappings && parentMappings.length > 0) {
      // Create notifications for each parent
      const notifications = parentMappings.map(mapping => ({
        school_id: student.school_id,
        type: 'health_incident',
        ref_id: incident.id,
        title: `Health Incident: ${category.charAt(0).toUpperCase() + category.slice(1)}`,
        message: `${student.first_name} ${student.last_name} reported: ${category}`,
        audience_scope: 'Users',
        user_id: mapping.parent_user_id,
        payload: {
          studentId,
          studentName: `${student.first_name} ${student.last_name}`,
          category,
          meta: meta || {},
          happened_at: happened_at || incident.happened_at,
        },
      }));

      const { error: notifError } = await supabase
        .from('school_notifications')
        .insert(notifications);

      if (notifError) {
        console.error('Error creating notifications:', notifError);
        // Don't fail the request if notifications fail
      }
    }

    return NextResponse.json({
      success: true,
      data: incident,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating health incident:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create health incident', message: error.message },
      { status: 500 }
    );
  }
}


