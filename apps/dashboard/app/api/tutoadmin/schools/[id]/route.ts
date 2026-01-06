import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../lib/supabase';
import { verifyTutoAdmin } from '../../../../../lib/tutoadmin-auth';

/**
 * TutoAdmin School Detail API
 * GET /api/tutoadmin/schools/[id] - Get school details
 * PUT /api/tutoadmin/schools/[id] - Update school
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify TutoAdmin authorization
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = createServerSupabaseClient();
    const { id: schoolId } = await params;

    // Fetch school
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('*')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Fetch metrics
    const { count: studentCount } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    const { count: teacherCount } = await supabase
      .from('school_teachers')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    const { count: classCount } = await supabase
      .from('school_classes')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId)
      .eq('status', 'active');

    // Fetch admin codes history
    const { data: adminCodes } = await supabase
      .from('school_invitations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('invitation_type', 'admin_onboarding')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch offboarding record if exists
    let offboardingRecord = null;
    if (school.offboarding_record_id) {
      const { data } = await supabase
        .from('school_offboarding_records')
        .select('*')
        .eq('id', school.offboarding_record_id)
        .single();
      offboardingRecord = data;
    }

    // Calculate partnership duration
    const now = new Date();
    const partnershipStart = school.partnership_start_date 
      ? new Date(school.partnership_start_date) 
      : new Date(school.created_at);
    const partnershipMonths = Math.max(0, Math.floor(
      (now.getTime() - partnershipStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));

    return NextResponse.json({
      success: true,
      school: {
        ...school,
        metrics: {
          students: studentCount || 0,
          teachers: teacherCount || 0,
          classes: classCount || 0,
          partnershipMonths,
        },
        adminCodes: adminCodes || [],
        offboardingRecord,
      },
    });
  } catch (error: any) {
    console.error('TutoAdmin school detail error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify TutoAdmin authorization
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = createServerSupabaseClient();
    const { id: schoolId } = await params;
    const body = await request.json();

    const {
      name,
      email,
      phone,
      address,
      contactName,
      contactEmail,
      contactPhone,
      subscriptionPlan,
      status,
    } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (contactName !== undefined) updateData.contact_name = contactName;
    if (contactEmail !== undefined) updateData.contact_email = contactEmail;
    if (contactPhone !== undefined) updateData.contact_phone = contactPhone;
    if (subscriptionPlan !== undefined) updateData.subscription_plan = subscriptionPlan;
    if (status !== undefined) updateData.status = status;
    updateData.updated_at = new Date().toISOString();

    const { data: school, error } = await supabase
      .from('schools')
      .update(updateData)
      .eq('id', schoolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating school:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      school,
    });
  } catch (error: any) {
    console.error('TutoAdmin update school error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

