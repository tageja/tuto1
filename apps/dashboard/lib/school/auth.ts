import { supabase } from '../supabase';

export type UserRole = 'admin' | 'parent' | null;

/**
 * Get user role from Supabase user profile
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    // Get user profile from Supabase database
    const { data: profile, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_user_id', uid)
      .single();

    if (error || !profile) {
      console.warn('User profile not found, checking school associations...');
      
      // Fallback: Check if user is a school teacher (admin role)
      const { data: teacher } = await supabase
        .from('school_teachers')
        .select('id')
        .eq('user_id', uid)
        .limit(1)
        .single();
      
      if (teacher) {
        return 'admin';
      }
      
      // Check if user is a parent (has students OR PIN access)
      const userEmail = await getCurrentUserEmail();
      
      if (userEmail) {
        // Check via school_students (existing students)
        const { data: students } = await supabase
          .from('school_students')
          .select('id')
          .eq('parent_email', userEmail)
          .limit(1);
        
        if (students && students.length > 0) {
          return 'parent';
        }
        
        // Check via school_parents (PIN-linked parents)
        const { data: userRecord } = await supabase
          .from('users')
          .select('id')
          .eq('email', userEmail)
          .limit(1)
          .single();
        
        if (userRecord) {
          const { data: parentAccess } = await supabase
            .from('school_parents')
            .select('id')
            .eq('parent_user_id', userRecord.id)
            .limit(1);
          
          if (parentAccess && parentAccess.length > 0) {
            return 'parent';
          }
        }
      }
      
      return null;
    }

    const role = profile.role;
    
    // Map roles
    if (role === 'admin' || role === 'school_admin' || role === 'teacher') {
      return 'admin';
    } else if (role === 'parent') {
      return 'parent';
    }

    return null;
  } catch (error) {
    console.error('Error getting user role:', error);
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
