'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSchool } from '../../../../contexts/SchoolContext';

/**
 * OLD ROUTE - Redirects to new URL-based route
 * This page redirects /school/parent/teachers to /school/[schoolId]/parent/teachers
 */
export default function ParentTeachersPageRedirect() {
  const router = useRouter();
  const { selectedSchool } = useSchool();

  useEffect(() => {
    const schoolId = selectedSchool?.id || selectedSchool?.name || 'Sunrise International School';
    const encodedSchoolId = encodeURIComponent(schoolId);
    
    // Redirect to URL-based route
    router.replace(`/school/${encodedSchoolId}/parent/teachers`);
  }, [selectedSchool, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to teachers page...</p>
      </div>
    </div>
  );
}













