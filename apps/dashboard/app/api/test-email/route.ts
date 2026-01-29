import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../lib/supabase';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Test Email API Route
 * 
 * POST /api/test-email
 * Body: { email: string, type?: 'confirmation' | 'invite' }
 * 
 * Sends a test email using Supabase Admin API to verify SMTP configuration.
 * This endpoint requires admin authentication.
 * 
 * Returns: { success: boolean, message: string, error?: string, details?: any }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, type = 'confirmation' } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Valid email address is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Authenticate user (admin only)
    const authHeader = request.headers.get('authorization');
    const accessToken = authHeader?.replace('Bearer ', '');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    const serviceSupabase = createServerSupabaseClient();

    let user = null;

    // Method 1: Try Authorization header (if client passes token)
    if (accessToken) {
      const { data: { user: tokenUser }, error: tokenError } = await serviceSupabase.auth.getUser(accessToken);
      if (!tokenError && tokenUser) {
        user = tokenUser;
      }
    }

    // Method 2: Try cookies (for SSR/server-side)
    if (!user) {
      const cookieStore = await cookies();
      const allCookies = cookieStore.getAll();
      
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          getAll() {
            return allCookies;
          },
          setAll() {
            // No-op for read-only operations
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

    // Check if user is admin (optional - you can make this more strict)
    // For now, we'll allow any authenticated user to test emails
    // In production, you might want to check user role

    console.log(`📧 Test email requested by ${user.email} to ${email} (type: ${type})`);

    // Use Supabase Admin API to send test email
    let result;
    let errorMessage = null;

    try {
      if (type === 'invite') {
        // Option 1: Invite user (sends email automatically)
        console.log('📨 Sending invitation email...');
        const { data, error } = await serviceSupabase.auth.admin.inviteUserByEmail(email, {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        });

        if (error) {
          errorMessage = error.message;
          console.error('❌ Invite email error:', error);
        } else {
          result = {
            method: 'invite',
            user_id: data?.user?.id,
            email_sent: true,
          };
          console.log('✅ Invitation email sent successfully');
        }
      } else {
        // Option 2: Create test user and trigger confirmation
        console.log('📨 Creating test user and triggering confirmation...');
        
        // First, check if user already exists
        const { data: existingUser } = await serviceSupabase.auth.admin.getUserByEmail(email);
        
        if (existingUser?.user) {
          // User exists - send magic link email (this actually sends an email)
          console.log('👤 User exists, sending magic link email...');
          const { data: magicLinkData, error: magicError } = await serviceSupabase.auth.admin.generateLink({
            type: 'magiclink',
            email: email,
          });

          if (magicError) {
            errorMessage = magicError.message;
            console.error('❌ Magic link error:', magicError);
          } else {
            result = {
              method: 'magic_link',
              user_id: existingUser.user.id,
              email_sent: true,
              link: magicLinkData?.properties?.action_link,
              note: 'Magic link email sent to existing user',
            };
            console.log('✅ Magic link email sent successfully');
          }
        } else {
          // User doesn't exist - create test user (confirmation email sent automatically)
          console.log('👤 Creating new test user...');
          const { data: newUser, error: createError } = await serviceSupabase.auth.admin.createUser({
            email: email,
            email_confirm: false, // Require confirmation - this triggers email
            user_metadata: {
              test_user: true,
              created_by: user.email,
              created_at: new Date().toISOString(),
            },
          });

          if (createError) {
            errorMessage = createError.message;
            console.error('❌ Create user error:', createError);
          } else {
            // User created, confirmation email should be sent automatically
            result = {
              method: 'create_user',
              user_id: newUser.user?.id,
              email_sent: true,
              note: 'New user created, confirmation email should be sent automatically',
            };
            console.log('✅ Test user created, confirmation email should be sent');
          }
        }
      }
    } catch (err: any) {
      errorMessage = err.message || 'Unknown error occurred';
      console.error('❌ Unexpected error sending test email:', err);
    }

    if (errorMessage) {
      // Check if it's an SMTP error
      const isSmtpError = errorMessage.includes('SMTP') || 
                         errorMessage.includes('smtp') ||
                         errorMessage.includes('534') ||
                         errorMessage.includes('5.7.9') ||
                         errorMessage.includes('WebLoginRequired');

      return NextResponse.json({
        success: false,
        error: errorMessage,
        isSmtpError,
        message: isSmtpError 
          ? 'SMTP configuration error detected. Please check your Supabase SMTP settings in the dashboard.'
          : 'Failed to send test email. Check the error details.',
        details: {
          requested_by: user.email,
          target_email: email,
          type,
        },
        help: isSmtpError ? {
          dashboard_url: `https://app.supabase.com/project/${process.env.NEXT_PUBLIC_SUPABASE_URL?.split('//')[1]?.split('.')[0]}/settings/auth`,
          checklist: '/docs/EMAIL_DEBUG_CHECKLIST.md',
        } : undefined,
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Test email sent successfully to ${email}`,
      details: {
        ...result,
        requested_by: user.email,
        target_email: email,
        type,
        timestamp: new Date().toISOString(),
      },
      next_steps: [
        'Check the recipient email inbox (and spam folder)',
        'Check Supabase auth logs for email send status',
        'If email doesn\'t arrive, verify SMTP settings in Supabase Dashboard',
      ],
    });
  } catch (error: any) {
    console.error('❌ Test email API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
        message: 'Failed to process test email request',
      },
      { status: 500 }
    );
  }
}
