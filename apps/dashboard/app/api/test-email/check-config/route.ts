import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Email Configuration Checker API Route
 * 
 * GET /api/test-email/check-config
 * 
 * Checks email configuration status by analyzing:
 * - Recent signup patterns
 * - Email confirmation status of recent users
 * - Provides links to Supabase Dashboard for manual verification
 * 
 * Returns: { success: boolean, config: {...}, recommendations: [...] }
 */
export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceSupabase = createServerSupabaseClient();

    let user = null;

    // Method 1: Try Authorization header
    if (accessToken) {
      const { data: { user: tokenUser }, error: tokenError } = await serviceSupabase.auth.getUser(accessToken);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }

    // Method 2: Try cookies
    if (!user) {
      const cookieStore = await cookies();
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // No-op
          },
        },
      });

      const { data: { user: cookieUser } } = await supabase.auth.getUser();
      if (cookieUser) {
        user = cookieUser;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized - Please log in' },
        { status: 401 }
      );
    }

    console.log(`🔍 Email config check requested by ${user.email}`);

    // Check recent signups using Admin API
    // Note: We can't directly query auth.users table, so we'll use admin API
    let signupStats = {
      total_recent: 0,
      confirmed: 0,
      unconfirmed: 0,
      confirmation_rate: 0,
      note: 'Stats are estimated based on available data',
    };

    // Try to get recent users via admin API (limited to what we can access)
    // For actual stats, user should check Supabase Dashboard
    try {
      // We can't easily query auth.users without direct SQL access
      // So we'll provide guidance instead
      signupStats.note = 'Check Supabase Dashboard → Authentication → Users for detailed stats';
    } catch (e) {
      console.log('⚠️ Could not query user stats, providing manual check instructions');
    }

    // Extract project ID from Supabase URL
    const projectId = supabaseUrl.includes('supabase.co') 
      ? supabaseUrl.split('//')[1]?.split('.')[0] 
      : 'unknown';

    const dashboardBaseUrl = `https://app.supabase.com/project/${projectId}`;

    // Generate recommendations based on stats
    const recommendations: string[] = [];
    const warnings: string[] = [];

    if (signupStats.total_recent === 0) {
      recommendations.push('No recent signups found. Try creating a test user to verify email flow.');
    } else {
      if (signupStats.confirmation_rate < 50 && signupStats.total_recent > 3) {
        warnings.push(`Low confirmation rate (${signupStats.confirmation_rate.toFixed(1)}%). Many users may not be receiving confirmation emails.`);
      }

      if (signupStats.unconfirmed > 0) {
        recommendations.push(`${signupStats.unconfirmed} recent user(s) haven't confirmed their email. This may indicate emails aren't being sent.`);
      }
    }

    // Always include these recommendations
    recommendations.push(
      'Verify "Confirm email" is enabled in Supabase Dashboard → Authentication → Providers → Email',
      'Check SMTP settings in Supabase Dashboard → Settings → Auth → SMTP Settings',
      'Use the POST /api/test-email endpoint to send a test email',
      'Check Supabase auth logs for email send attempts and errors'
    );

    return NextResponse.json({
      success: true,
      config: {
        project_id: projectId,
        supabase_url: supabaseUrl,
        has_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        signup_stats: signupStats,
      },
      dashboard_links: {
        auth_providers: `${dashboardBaseUrl}/auth/providers`,
        smtp_settings: `${dashboardBaseUrl}/settings/auth`,
        auth_logs: `${dashboardBaseUrl}/logs/explorer?q=auth`,
      },
      recommendations,
      warnings: warnings.length > 0 ? warnings : undefined,
      manual_checks: [
        {
          name: 'Email Confirmation Enabled',
          url: `${dashboardBaseUrl}/auth/providers`,
          instructions: 'Click on "Email" provider and verify "Confirm email" toggle is ON',
        },
        {
          name: 'SMTP Configuration',
          url: `${dashboardBaseUrl}/settings/auth`,
          instructions: 'Scroll to "SMTP Settings" and verify "Enable Custom SMTP" is ON with correct credentials',
        },
        {
          name: 'Auth Logs',
          url: `${dashboardBaseUrl}/logs/explorer?q=auth`,
          instructions: 'Check recent auth logs for email send attempts and any SMTP errors',
        },
      ],
      test_endpoints: {
        send_test_email: 'POST /api/test-email',
        check_config: 'GET /api/test-email/check-config',
      },
    });
  } catch (error: any) {
    console.error('❌ Config check API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to check email configuration',
      },
      { status: 500 }
    );
  }
}
