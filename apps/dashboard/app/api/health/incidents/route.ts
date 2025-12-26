import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createAuthenticatedSupabaseClient } from '../../../../lib/supabase';
import { createNotification } from '../../../../lib/notifications.server';

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
      const notificationPromises = parentMappings.map(async (mapping) => {
        try {
          await createNotification({
            supabase,
            schoolId: student.school_id,
            recipientUserId: mapping.parent_user_id,
            recipientRole: 'parent',
            type: 'medicine', // Using medicine type as health_incident doesn't exist in enum
            priority: 'urgent',
            title: `Health Incident: ${category.charAt(0).toUpperCase() + category.slice(1)}`,
            body: `${student.first_name} ${student.last_name} reported: ${category}`,
            targetType: 'other', // Health incidents don't have a specific target type
            targetId: incident.id,
            meta: {
              studentId,
              studentName: `${student.first_name} ${student.last_name}`,
              category,
              meta: meta || {},
              happened_at: happened_at || incident.happened_at,
            },
          });
        } catch (notifError) {
          console.error('Failed to create notification for parent:', mapping.parent_user_id, notifError);
        }
      });

      await Promise.allSettled(notificationPromises);
      console.log('✅ Health incident notifications created for', parentMappings.length, 'parents');

      // Also notify admins about the health incident
      const { data: adminUsers } = await supabase
        .from('school_users')
        .select('user_id')
        .eq('school_id', student.school_id)
        .in('role', ['admin', 'teacher']);

      if (adminUsers && adminUsers.length > 0) {
        const adminNotificationPromises = adminUsers.map(async (admin) => {
          try {
            await createNotification({
              supabase,
              schoolId: student.school_id,
              recipientUserId: admin.user_id,
              recipientRole: 'admin',
              type: 'medicine',
              priority: 'urgent',
              title: `Health Incident: ${student.first_name} ${student.last_name}`,
              body: `Category: ${category.charAt(0).toUpperCase() + category.slice(1)}`,
              targetType: 'other',
              targetId: incident.id,
              meta: {
                studentId,
                studentName: `${student.first_name} ${student.last_name}`,
                category,
                meta: meta || {},
                happened_at: happened_at || incident.happened_at,
              },
            });
          } catch (notifError) {
            console.error('Failed to create notification for admin:', admin.user_id, notifError);
          }
        });

        await Promise.allSettled(adminNotificationPromises);
        console.log('✅ Health incident notifications created for', adminUsers.length, 'admins');
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


