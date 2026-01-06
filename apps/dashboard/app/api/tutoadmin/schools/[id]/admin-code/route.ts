import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../../../lib/supabase';
import { verifyTutoAdmin } from '../../../../../../lib/tutoadmin-auth';

/**
 * TutoAdmin Admin Code Generation API
 * POST /api/tutoadmin/schools/[id]/admin-code - Generate new admin code
 * GET /api/tutoadmin/schools/[id]/admin-code - List admin codes
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

    // Verify school exists
    const { data: school, error: schoolError } = await supabase
      .from('schools')
      .select('id, name, contact_email, email')
      .eq('id', schoolId)
      .single();

    if (schoolError || !school) {
      return NextResponse.json(
        { success: false, error: 'School not found' },
        { status: 404 }
      );
    }

    // Generate admin code
    const adminCode = generateAdminCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiry

    const { data: invitation, error: inviteError } = await supabase
      .from('school_invitations')
      .insert({
        school_id: schoolId,
        email: school.contact_email || school.email || '',
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
      throw inviteError;
    }

    return NextResponse.json({
      success: true,
      code: invitation.token,
      expiresAt: invitation.expires_at,
      invitation,
    });
  } catch (error: any) {
    console.error('TutoAdmin generate admin code error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

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

    const { data: codes, error } = await supabase
      .from('school_invitations')
      .select('*')
      .eq('school_id', schoolId)
      .eq('invitation_type', 'admin_onboarding')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin codes:', error);
      throw error;
    }

    return NextResponse.json({
      success: true,
      codes: codes || [],
    });
  } catch (error: any) {
    console.error('TutoAdmin list admin codes error:', error);
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

