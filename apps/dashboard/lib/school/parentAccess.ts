/**
 * Parent Access Validation Utility
 * 
 * Provides functions to check if a parent user has access to a specific school.
 * Access can be via:
 * - PIN code entry (school_parents table)
 * - Existing student relationship (school_students.parent_email)
 */

import { supabase } from '../supabase';

export interface ParentAccessResult {
  hasAccess: boolean;
  accessType: 'pin' | 'student' | null;
  error?: string;
  schools?: Array<{
    school_id: string;
    school_name: string;
    role: string;
    access_type: string;
  }>;
}

/**
 * Check if a parent has access to a specific school
 * 
 * @param userEmail - The parent's email address
 * @param schoolId - The school ID to check access for
 * @returns Promise with access result
 */
export async function checkParentSchoolAccess(
  userEmail: string,
  schoolId: string
): Promise<ParentAccessResult> {
  try {
    // Get access token from session (if available)
    let authHeader: Record<string, string> = {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (tokenError) {
      // If we can't get token, continue without it (API will try cookies)
      console.warn('Could not get access token, will try cookies:', tokenError);
    }

    // Check via API endpoint
    const response = await fetch(
      `/api/school/check-parent-access?schoolId=${encodeURIComponent(schoolId)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...authHeader,
        },
      }
    );

    const data = await response.json();

    if (!data.success) {
      return {
        hasAccess: false,
        accessType: null,
        error: data.error || 'Failed to check access',
      };
    }

    // Check if user has access to this specific school
    const schoolList = data.schools || [];
    const hasSpecificAccess = schoolList.some(
      (s: any) =>
        s.school_id === schoolId ||
        s.school_id === decodeURIComponent(schoolId) ||
        s.school_id === encodeURIComponent(schoolId)
    );

    // Determine access type if access exists
    let accessType: 'pin' | 'student' | null = null;
    if (hasSpecificAccess) {
      const school = schoolList.find(
        (s: any) =>
          s.school_id === schoolId ||
          s.school_id === decodeURIComponent(schoolId) ||
          s.school_id === encodeURIComponent(schoolId)
      );
      // If access_type is 'parent', it could be from PIN or student
      // We'll check the access_type field
      accessType = school?.access_type === 'parent' ? 'pin' : 'student';
    }

    return {
      hasAccess: hasSpecificAccess || false,
      accessType,
      schools: schoolList,
    };
  } catch (error: any) {
    console.error('Error checking parent school access:', error);
    return {
      hasAccess: false,
      accessType: null,
      error: error.message || 'Failed to check access',
    };
  }
}

/**
 * Check if a parent has access to any school
 * 
 * @param userEmail - The parent's email address
 * @returns Promise with access result
 */
export async function checkParentHasAnyAccess(
  userEmail: string
): Promise<ParentAccessResult> {
  try {
    // Get access token from session (if available)
    let authHeader: Record<string, string> = {};
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        authHeader['Authorization'] = `Bearer ${session.access_token}`;
      }
    } catch (tokenError) {
      // If we can't get token, continue without it (API will try cookies)
      console.warn('Could not get access token, will try cookies:', tokenError);
    }

    const response = await fetch('/api/school/check-parent-access', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...authHeader,
      },
    });

    const data = await response.json();

    if (!data.success) {
      return {
        hasAccess: false,
        accessType: null,
        error: data.error || 'Failed to check access',
      };
    }

    const hasAccess = data.hasAccess || false;
    const schoolList = data.schools || [];

    return {
      hasAccess,
      accessType: hasAccess ? 'pin' : null,
      schools: schoolList,
    };
  } catch (error: any) {
    console.error('Error checking parent access:', error);
    return {
      hasAccess: false,
      accessType: null,
      error: error.message || 'Failed to check access',
    };
  }
}
