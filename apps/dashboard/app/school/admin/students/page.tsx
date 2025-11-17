'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSchool } from '../../../../contexts/SchoolContext';

/**
 * OLD ROUTE - Redirects to new URL-based route
 * This page redirects /school/admin/students to /school/[schoolId]/admin/students
 * Preserves query parameters (e.g., ?classId=, ?q=)
 */
export default function StudentsPageRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedSchool, schoolIdFromUrl } = useSchool();

  useEffect(() => {
    // Get school ID from context or use default
    const schoolId = schoolIdFromUrl || selectedSchool?.id || selectedSchool?.name || 'Tuto Demo School';
    const encodedSchoolId = encodeURIComponent(schoolId);
    
    // Preserve query parameters
    const queryString = searchParams.toString();
    const queryPart = queryString ? `?${queryString}` : '';
    
    // Redirect to URL-based route
    router.replace(`/school/${encodedSchoolId}/admin/students${queryPart}`);
  }, [selectedSchool, schoolIdFromUrl, router, searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to students page...</p>
      </div>
    </div>
  );
}









