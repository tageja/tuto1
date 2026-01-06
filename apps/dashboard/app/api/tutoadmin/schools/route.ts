import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { verifyTutoAdmin } from '../../../../lib/tutoadmin-auth';

/**
 * TutoAdmin Schools API
 * GET /api/tutoadmin/schools - List all schools with metrics
 * POST /api/tutoadmin/schools - Create a new school
 */

export async function GET(request: NextRequest) {
  try {
    // Verify TutoAdmin authorization
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = createServerSupabaseClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Optional filters
    const status = searchParams.get('status');
    const plan = searchParams.get('plan');
    const search = searchParams.get('search');

    // Build query
    let query = supabase
      .from('schools')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      if (status === 'offboarded') {
        query = query.not('offboarded_at', 'is', null);
      } else {
        query = query.eq('status', status).is('offboarded_at', null);
      }
    }

    if (plan && plan !== 'all') {
      query = query.eq('subscription_plan', plan);
    }

    const { data: schools, error } = await query;

    if (error) {
      console.error('Error fetching schools:', error);
      throw error;
    }

    // Filter by search term if provided
    let filteredSchools = schools || [];
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSchools = filteredSchools.filter(school => 
        school.name?.toLowerCase().includes(searchLower) ||
        school.email?.toLowerCase().includes(searchLower) ||
        school.address?.toLowerCase().includes(searchLower)
      );
    }

    // Enhance with metrics for each school
    const now = new Date();
    const schoolsWithMetrics = await Promise.all(
      filteredSchools.map(async (school) => {
        // Get student count
        const { count: studentCount } = await supabase
          .from('school_students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('status', 'active');

        // Get teacher count
        const { count: teacherCount } = await supabase
          .from('school_teachers')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('status', 'active');

        // Get class count
        const { count: classCount } = await supabase
          .from('school_classes')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('status', 'active');

        // Get admin codes count
        const { count: adminCodesCount } = await supabase
          .from('school_invitations')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', school.id)
          .eq('invitation_type', 'admin_onboarding');

        // Calculate partnership duration
        const partnershipStart = school.partnership_start_date 
          ? new Date(school.partnership_start_date) 
          : new Date(school.created_at);
        const partnershipMonths = Math.max(0, Math.floor(
          (now.getTime() - partnershipStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ));

        return {
          ...school,
          metrics: {
            students: studentCount || 0,
            teachers: teacherCount || 0,
            classes: classCount || 0,
            adminCodes: adminCodesCount || 0,
            partnershipMonths,
          },
        };
      })
    );

    return NextResponse.json({
      success: true,
      schools: schoolsWithMetrics,
      total: schoolsWithMetrics.length,
    });
  } catch (error: any) {
    console.error('TutoAdmin schools API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify TutoAdmin authorization
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = createServerSupabaseClient();
    const body = await request.json();

    const {
      name,
      email,
      phone,
      address,
      contactName,
      contactEmail,
      contactPhone,
      subscriptionPlan = 'premium',
    } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { success: false, error: 'School name is required' },
        { status: 400 }
      );
    }

    // Create school
    const { data: school, error: createError } = await supabase
      .from('schools')
      .insert({
        name,
        email,
        phone,
        address,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        subscription_plan: subscriptionPlan,
        partnership_start_date: new Date().toISOString(),
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating school:', createError);
      throw createError;
    }

    // Generate initial admin code
    const adminCode = generateAdminCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error: inviteError } = await supabase
      .from('school_invitations')
      .insert({
        school_id: school.id,
        email: contactEmail || email || '',
        role: 'admin',
        token: adminCode,
        invitation_type: 'admin_onboarding',
        is_single_use: true,
        status: 'pending',
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single();

    if (inviteError) {
      console.error('Error creating admin invitation:', inviteError);
      // Don't fail the school creation, just log the error
    }

    return NextResponse.json({
      success: true,
      school,
      adminCode: invitation?.token || null,
      expiresAt: invitation?.expires_at || null,
    });
  } catch (error: any) {
    console.error('TutoAdmin create school error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate a secure admin onboarding code
 * Format: TUTO-XXXX-XXXX-XXXX (12 alphanumeric chars)
 */
function generateAdminCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding I, O, 0, 1 for clarity
  let code = 'TUTO-';
  for (let i = 0; i < 3; i++) {
    if (i > 0) code += '-';
    for (let j = 0; j < 4; j++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return code;
}

