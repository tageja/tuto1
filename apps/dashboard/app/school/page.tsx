'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSchool } from '../../contexts/SchoolContext';

export default function SchoolPage() {
  const { selectedSchool } = useSchool();
  const router = useRouter();

  useEffect(() => {
    // This page should never render because the layout redirects
    // But if it does, show the school selector (handled by layout)
    if (selectedSchool) {
      // User will be redirected by the layout based on role
      return;
    }
  }, [selectedSchool, router]);

  // Placeholder - actual content is in the layout
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

















