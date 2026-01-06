import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAuthenticatedSupabaseClient } from '../../../../../../lib/supabase';
import { verifyTutoAdmin } from '../../../../../../lib/tutoadmin-auth';

/**
 * TutoAdmin School Offboarding API
 * POST /api/tutoadmin/schools/[id]/offboard - Offboard a school
 */

export async function POST(
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
      reason,
      reasonDetails,
      offboardDate,
      scheduledDate,
      outstandingBalanceCents,
      dataRetentionMonths,
      dataExportProvided,
      exitInterviewConducted,
      exitInterviewNotes,
      satisfactionRating,
      wouldRecommend,
      likelihoodToReturn,
      handledByEmail,
    } = body;

    // Verify school exists
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

    // Check if already offboarded
    if (school.offboarded_at) {
      return NextResponse.json(
        { success: false, error: 'School is already offboarded' },
        { status: 400 }
      );
    }

    // Calculate partnership metrics
    const now = new Date();
    const partnershipStart = school.partnership_start_date 
      ? new Date(school.partnership_start_date) 
      : new Date(school.created_at);
    const partnershipMonths = Math.max(0, Math.floor(
      (now.getTime() - partnershipStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
    ));

    // Get student and teacher counts
    const { count: studentCount } = await supabase
      .from('school_students')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    const { count: teacherCount } = await supabase
      .from('school_teachers')
      .select('*', { count: 'exact', head: true })
      .eq('school_id', schoolId);

    // Create offboarding record
    const { data: offboardingRecord, error: offboardError } = await supabase
      .from('school_offboarding_records')
      .insert({
        school_id: schoolId,
        reason,
        reason_details: reasonDetails,
        offboard_date: offboardDate,
        scheduled_date: scheduledDate || null,
        final_billing_date: scheduledDate || offboardDate,
        outstanding_balance_cents: outstandingBalanceCents || 0,
        data_retention_months: dataRetentionMonths || 12,
        data_export_provided: dataExportProvided || false,
        exit_interview_conducted: exitInterviewConducted || false,
        exit_interview_notes: exitInterviewNotes || null,
        satisfaction_rating: satisfactionRating || null,
        would_recommend: wouldRecommend,
        likelihood_to_return: likelihoodToReturn || 'unknown',
        partnership_duration_months: partnershipMonths,
        total_students_served: studentCount || 0,
        total_teachers_served: teacherCount || 0,
        handled_by_email: handledByEmail,
      })
      .select()
      .single();

    if (offboardError) {
      console.error('Error creating offboarding record:', offboardError);
      throw offboardError;
    }

    // Update school status
    const { error: updateError } = await supabase
      .from('schools')
      .update({
        status: 'offboarded',
        offboarded_at: new Date().toISOString(),
        offboarding_record_id: offboardingRecord.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', schoolId);

    if (updateError) {
      console.error('Error updating school status:', updateError);
      throw updateError;
    }

    return NextResponse.json({
      success: true,
      offboardingRecord,
      message: 'School has been successfully offboarded',
    });
  } catch (error: any) {
    console.error('TutoAdmin offboard school error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

