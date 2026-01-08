import { supabase } from '../config/supabase';

export interface SchoolAssociation {
  school_id: string;
  school_name: string;
  school_logo_url: string | null;
  role: 'admin' | 'parent';
  access_type: 'teacher' | 'parent';
}

export interface AdminCodeValidation {
  success: boolean;
  schoolId?: string;
  schoolName?: string;
  message?: string;
}

/**
 * Get all schools associated with a user's email
 */
export async function getUserSchoolAssociations(email: string): Promise<SchoolAssociation[]> {
  try {
    console.log('🏫 Fetching school associations for:', email);
    
    const { data, error } = await supabase
      .rpc('get_user_school_associations', { user_email: email });

    if (error) {
      console.error('❌ Error fetching school associations:', error);
      throw error;
    }

    console.log('✅ Found school associations:', data);
    return data || [];
  } catch (error) {
    console.error('❌ Exception in getUserSchoolAssociations:', error);
    return [];
  }
}

/**
 * Validate an admin onboarding code
 */
export async function validateAdminCode(code: string): Promise<AdminCodeValidation> {
  try {
    console.log('🔑 Validating admin code:', code);

    const { data: invitations, error } = await supabase
      .from('school_invitations')
      .select(`
        id,
        school_id,
        invitation_type,
        status,
        is_single_use,
        expires_at,
        schools (
          id,
          name,
          status
        )
      `)
      .eq('token', code.trim().toUpperCase())
      .eq('invitation_type', 'admin_onboarding')
      .eq('status', 'pending')
      .maybeSingle();

    if (error) {
      console.error('❌ Error validating admin code:', error);
      return { success: false, message: 'Error validating code' };
    }

    if (!invitations) {
      console.log('❌ Invalid or used admin code');
      return { success: false, message: 'Invalid or already used code' };
    }

    // Check if code is expired
    if (invitations.expires_at) {
      const expiryDate = new Date(invitations.expires_at);
      if (expiryDate < new Date()) {
        console.log('❌ Admin code has expired');
        return { success: false, message: 'This code has expired' };
      }
    }

    // Check school status
    const school = invitations.schools as any;
    if (!school || school.status !== 'active') {
      console.log('❌ School is not active');
      return { success: false, message: 'School is not active' };
    }

    console.log('✅ Admin code is valid:', school.name);
    return {
      success: true,
      schoolId: school.id,
      schoolName: school.name,
    };
  } catch (error) {
    console.error('❌ Exception in validateAdminCode:', error);
    return { success: false, message: 'Error validating code' };
  }
}

/**
 * Redeem an admin onboarding code and setup the user as school admin
 */
export async function redeemAdminCode(
  code: string,
  userId: string,
  userEmail: string
): Promise<{ success: boolean; schoolId?: string; message?: string }> {
  try {
    console.log('🎫 Redeeming admin code for user:', userId);

    // First validate the code
    const validation = await validateAdminCode(code);
    if (!validation.success || !validation.schoolId) {
      return { success: false, message: validation.message };
    }

    const schoolId = validation.schoolId;

    // Start a transaction-like operation
    // 1. Mark invitation as accepted
    const { error: inviteError } = await supabase
      .from('school_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('token', code.trim().toUpperCase())
      .eq('invitation_type', 'admin_onboarding');

    if (inviteError) {
      console.error('❌ Error updating invitation:', inviteError);
      return { success: false, message: 'Failed to redeem code' };
    }

    // 2. Create school_admin entry
    const { error: adminError } = await supabase
      .from('school_admins')
      .insert({
        school_id: schoolId,
        user_id: userId,
      });

    if (adminError) {
      // Check if already exists (ignore duplicate error)
      if (adminError.code === '23505') {
        console.log('ℹ️ User already admin of this school');
      } else {
        console.error('❌ Error creating school admin:', adminError);
        return { success: false, message: 'Failed to setup admin access' };
      }
    }

    // 3. Update user role to admin
    const { error: userError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('auth_user_id', userId);

    if (userError) {
      console.error('❌ Error updating user role:', userError);
      // Don't fail completely if this fails
    }

    // 4. Create or update school_teachers entry for consistency
    const { data: existingTeacher } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', userEmail)
      .maybeSingle();

    if (!existingTeacher) {
      const { error: teacherError } = await supabase
        .from('school_teachers')
        .insert({
          school_id: schoolId,
          user_id: userId,
          name: userEmail.split('@')[0], // Use email prefix as name
          email: userEmail,
          status: 'active',
        });

      if (teacherError && teacherError.code !== '23505') {
        console.error('❌ Error creating teacher entry:', teacherError);
      }
    }

    console.log('✅ Admin code redeemed successfully');
    return { success: true, schoolId };
  } catch (error) {
    console.error('❌ Exception in redeemAdminCode:', error);
    return { success: false, message: 'An error occurred' };
  }
}

/**
 * Auto-detect user's role for a specific school
 */
export async function autoDetectUserRole(
  userEmail: string,
  schoolId: string
): Promise<'admin' | 'parent' | null> {
  try {
    console.log('🔍 Auto-detecting role for:', userEmail, 'in school:', schoolId);

    // Check if user is a teacher/admin
    const { data: teacher } = await supabase
      .from('school_teachers')
      .select('id')
      .eq('school_id', schoolId)
      .eq('email', userEmail)
      .eq('status', 'active')
      .maybeSingle();

    if (teacher) {
      console.log('✅ User is admin/teacher');
      return 'admin';
    }

    // Check if user is a parent
    const { data: student } = await supabase
      .from('school_students')
      .select('id')
      .eq('school_id', schoolId)
      .eq('parent_email', userEmail)
      .eq('status', 'active')
      .maybeSingle();

    if (student) {
      console.log('✅ User is parent');
      return 'parent';
    }

    console.log('❌ User has no role in this school');
    return null;
  } catch (error) {
    console.error('❌ Exception in autoDetectUserRole:', error);
    return null;
  }
}



