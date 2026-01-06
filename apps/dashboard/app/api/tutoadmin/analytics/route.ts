import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { verifyTutoAdmin } from '../../../../lib/tutoadmin-auth';

/**
 * TutoAdmin Analytics API
 * GET /api/tutoadmin/analytics
 * 
 * Returns aggregated metrics for the TutoAdmin dashboard:
 * - Total schools and active schools
 * - New and churned schools this quarter
 * - Plan distribution
 * - Recent schools list
 */
export async function GET(request: NextRequest) {
  try {
    // Verify TutoAdmin authorization
    const authResult = await verifyTutoAdmin();
    if (!authResult.authorized) {
      return authResult.response;
    }

    const supabase = createServerSupabaseClient();

    // Get current quarter boundaries
    const now = new Date();
    const currentQuarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
    const quarterStartISO = currentQuarterStart.toISOString();

    // Fetch all schools
    const { data: schools, error: schoolsError } = await supabase
      .from('schools')
      .select('id, name, status, subscription_plan, partnership_start_date, offboarded_at, created_at')
      .order('created_at', { ascending: false });

    if (schoolsError) {
      console.error('Error fetching schools:', schoolsError);
      throw schoolsError;
    }

    const allSchools = schools || [];

    // Calculate metrics
    const totalSchools = allSchools.length;
    const activeSchools = allSchools.filter(s => 
      s.status?.toLowerCase() === 'active' && !s.offboarded_at
    ).length;

    // Schools created this quarter
    const newThisQuarter = allSchools.filter(s => 
      s.partnership_start_date && new Date(s.partnership_start_date) >= currentQuarterStart
    ).length;

    // Schools offboarded this quarter
    const churnedThisQuarter = allSchools.filter(s => 
      s.offboarded_at && new Date(s.offboarded_at) >= currentQuarterStart
    ).length;

    // Plan distribution (only active schools)
    const activeSchoolsList = allSchools.filter(s => 
      s.status?.toLowerCase() === 'active' && !s.offboarded_at
    );

    const planDistribution = {
      basic: activeSchoolsList.filter(s => s.subscription_plan === 'basic').length,
      advanced: activeSchoolsList.filter(s => s.subscription_plan === 'advanced').length,
      premium: activeSchoolsList.filter(s => s.subscription_plan === 'premium' || !s.subscription_plan).length,
    };

    // Get recent schools with metrics
    const recentSchoolIds = activeSchoolsList.slice(0, 10).map(s => s.id);

    // Fetch student and teacher counts for recent schools
    const recentSchools = await Promise.all(
      recentSchoolIds.map(async (schoolId) => {
        const school = allSchools.find(s => s.id === schoolId);
        if (!school) return null;

        // Get student count
        const { count: studentCount } = await supabase
          .from('school_students')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('status', 'active');

        // Get teacher count
        const { count: teacherCount } = await supabase
          .from('school_teachers')
          .select('*', { count: 'exact', head: true })
          .eq('school_id', schoolId)
          .eq('status', 'active');

        // Calculate partnership duration in months
        const partnershipStart = school.partnership_start_date 
          ? new Date(school.partnership_start_date) 
          : new Date(school.created_at);
        const partnershipMonths = Math.max(0, Math.floor(
          (now.getTime() - partnershipStart.getTime()) / (1000 * 60 * 60 * 24 * 30)
        ));

        return {
          id: school.id,
          name: school.name,
          plan: school.subscription_plan || 'premium',
          status: school.status?.toLowerCase() || 'active',
          students: studentCount || 0,
          teachers: teacherCount || 0,
          partnershipMonths,
        };
      })
    );

    return NextResponse.json({
      success: true,
      metrics: {
        totalSchools,
        activeSchools,
        newThisQuarter,
        churnedThisQuarter,
        planDistribution,
        recentSchools: recentSchools.filter(Boolean),
      },
    });
  } catch (error: any) {
    console.error('TutoAdmin analytics API error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

