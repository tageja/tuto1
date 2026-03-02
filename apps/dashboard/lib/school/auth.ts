import { supabase } from '../supabase';

export type UserRole = 'admin' | 'parent' | 'teacher' | null;

/**
 * Get user role from Supabase user profile.
 * Teacher is determined by: users.role = 'teacher' OR user linked in school_teachers (takes precedence for dashboard).
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    const { data: profile, error } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', uid)
      .single();

    const userRow = error || !profile ? null : profile;

    // Admin/school_admin role ALWAYS takes precedence — check before school_teachers.
    // A user can be linked in school_teachers (e.g. as a demo teacher) while still being an admin.
    if (userRow?.role === 'admin' || userRow?.role === 'school_admin') {
      return 'admin';
    }

    // For non-admin users: a school_teachers link means they get the teacher view.
    if (userRow?.id) {
      const { data: teacherRow } = await supabase
        .from('school_teachers')
        .select('id')
        .eq('user_id', userRow.id)
        .limit(1)
        .maybeSingle();

      if (teacherRow) {
        return 'teacher';
      }
    }

    // No teacher link; use profile role
    if (userRow?.role === 'teacher') {
      return 'teacher';
    }
    if (userRow?.role === 'parent') {
      return 'parent';
    }

    // Profile missing or role unknown: fallbacks
    if (error || !profile) {
      console.warn('User profile not found, checking school associations...');

      const { data: fallbackUser } = await supabase
        .from('users')
        .select('id, role')
        .eq('auth_user_id', uid)
        .limit(1)
        .maybeSingle();

      if (fallbackUser?.role === 'teacher') return 'teacher';
      if (fallbackUser?.id) {
        const { data: teacherRow } = await supabase
          .from('school_teachers')
          .select('id')
          .eq('user_id', fallbackUser.id)
          .limit(1)
          .maybeSingle();
        if (teacherRow) return 'teacher';
      }

      const userEmail = await getCurrentUserEmail();
      if (userEmail) {
        const { data: students } = await supabase
          .from('school_students')
          .select('id')
          .eq('parent_email', userEmail)
          .limit(1);
        if (students && students.length > 0) return 'parent';

        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .limit(1)
          .maybeSingle();
        if (userRecord?.id) {
          const { data: parentAccess } = await supabase
            .from('school_parents')
            .select('id')
            .eq('parent_user_id', userRecord.id)
            .limit(1);
          if (parentAccess && parentAccess.length > 0) return 'parent';
        }
      }

      return null;
    }

    return null;
  } catch (err) {
    console.error('Error getting user role:', err);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  } catch {
    return false;
  }
}

/**
 * Get current user UID
 */
export async function getCurrentUserId(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.id || null;
  } catch {
    return null;
  }
}

/**
 * Get current user email
 */
export async function getCurrentUserEmail(): Promise<string | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email || null;
  } catch {
    return null;
  }
}
