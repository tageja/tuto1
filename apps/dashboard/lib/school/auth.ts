import { auth } from '../firebase/config';

export type UserRole = 'admin' | 'parent' | null;

/**
 * Get user role from Firebase custom claims with Airtable fallback
 * Priority:
 * 1. Firebase custom claims
 * 2. Query TutoSchoolTeachers for admin role
 * 3. Query TutoSchoolStudents parent linkage for parent role
 */
export async function getUserRole(uid: string): Promise<UserRole> {
  try {
    // Check Firebase custom claims first
    const user = auth.currentUser;
    if (user) {
      const idTokenResult = await user.getIdTokenResult();
      const role = idTokenResult.claims.schoolRole as string | undefined;
      
      if (role === 'admin' || role === 'parent') {
        return role as UserRole;
      }
    }

    // Fallback: Query Airtable via API route
    const response = await fetch(`/api/school/user-role?uid=${uid}`);
    if (response.ok) {
      const data = await response.json();
      return data.role as UserRole;
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
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(!!user);
    });
  });
}

/**
 * Get current user UID
 */
export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid || null;
}





