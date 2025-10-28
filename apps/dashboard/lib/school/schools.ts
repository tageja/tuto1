import { School } from '../../contexts/SchoolContext';
import { UserRole } from './auth';

/**
 * Get list of schools accessible by the user based on their role
 * Admin: Schools where user is a teacher
 * Parent: Schools where user's children are enrolled
 */
export async function getUserSchools(uid: string, role: UserRole): Promise<School[]> {
  try {
    const response = await fetch(`/api/school/user-schools?uid=${uid}&role=${role}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch schools');
    }

    const data = await response.json();
    return data.schools || [];
  } catch (error) {
    console.error('Error fetching user schools:', error);
    return [];
  }
}

/**
 * Get school details by ID
 */
export async function getSchoolById(schoolId: string): Promise<School | null> {
  try {
    const response = await fetch(`/api/school/${schoolId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch school');
    }

    const data = await response.json();
    return data.school || null;
  } catch (error) {
    console.error('Error fetching school:', error);
    return null;
  }
}



