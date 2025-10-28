'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSchool } from '../../contexts/SchoolContext';
import { getUserRole, getCurrentUserId, isAuthenticated } from '../../lib/school/auth';
import { getUserSchools } from '../../lib/school/schools';
import { SchoolSelector } from '../../components/school/SchoolSelector';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'admin' | 'parent' | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedSchool, setAvailableSchools, isLoading: schoolLoading } = useSchool();
  const router = useRouter();

  useEffect(() => {
    async function checkAuthAndRole() {
      try {
        // For now, use demo mode - skip strict auth check
        // In production, enable Firebase auth check
        const uid = getCurrentUserId();
        
        // Demo mode: Use a mock UID if not authenticated
        const demoUid = uid || 'demo-user-admin';
        
        // Detect role (will use API fallback)
        const role = await getUserRole(demoUid);
        
        if (!role) {
          // Default to admin for demo purposes
          setUserRole('admin');
          // Set demo schools
          setAvailableSchools([
            { id: 'Sunrise International School', name: 'Sunrise International School', type: 'International', studentCount: 144 },
            { id: 'Green Valley Academy', name: 'Green Valley Academy', type: 'Private', studentCount: 89 },
          ]);
        } else {
          setUserRole(role);
          // Fetch available schools
          const schools = await getUserSchools(demoUid, role);
          setAvailableSchools(schools.length > 0 ? schools : [
            { id: 'Sunrise International School', name: 'Sunrise International School', type: 'International', studentCount: 144 },
          ]);
        }

        // If school is selected, redirect to appropriate dashboard
        if (selectedSchool && !schoolLoading) {
          const finalRole = role || 'admin';
          router.push(`/school/${finalRole}`);
        }
      } catch (error) {
        console.error('Error in school layout:', error);
        // Don't redirect on error - show demo data instead
        setUserRole('admin');
        setAvailableSchools([
          { id: 'Sunrise International School', name: 'Sunrise International School', type: 'International', studentCount: 144 },
        ]);
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndRole();
  }, []);

  if (loading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show school selector if no school is selected
  if (!selectedSchool && userRole) {
    return <SchoolSelector role={userRole} />;
  }

  // Render children (the actual dashboard layouts)
  return <>{children}</>;
}


