'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSchool } from '../../contexts/SchoolContext';
import { getUserRole, getCurrentUserId, isAuthenticated } from '../../lib/school/auth';
import { getUserSchools } from '../../lib/school/schools';
import { SchoolSelector } from '../../components/school/SchoolSelector';

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  const [userRole, setUserRole] = useState<'admin' | 'parent' | null>(null);
  const [loading, setLoading] = useState(true);
  const { selectedSchool, setAvailableSchools, isLoading: schoolLoading } = useSchool();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function checkAuthAndRole() {
      try {
        // Get current user ID from Supabase
        const uid = await getCurrentUserId();
        
        // Demo mode: Use a mock UID if not authenticated
        const demoUid = uid || 'demo-user-admin';
        
        // Detect role (will use API fallback)
        const role = await getUserRole(demoUid);
        
        if (!role) {
          // Default to admin for demo purposes
          setUserRole('admin');
          // Fetch all schools from Supabase (no role filtering for demo)
          try {
            const response = await fetch('/api/school/user-schools');
            if (response.ok) {
              const data = await response.json();
              if (data.success && data.schools) {
                console.log('📚 Loaded schools in layout:', data.schools.map((s: any) => s.name).join(', '));
                setAvailableSchools(data.schools);
              } else {
                // Fallback: empty array
                console.warn('⚠️ No schools returned from API');
                setAvailableSchools([]);
              }
            } else {
              console.error('⚠️ Failed to fetch schools:', response.status);
              setAvailableSchools([]);
            }
          } catch (error) {
            console.error('Error fetching schools:', error);
            setAvailableSchools([]);
          }
        } else {
          setUserRole(role);
          // Fetch available schools
          const schools = await getUserSchools(demoUid, role);
          console.log('📚 Loaded schools for role:', role, schools.map(s => s.name).join(', '));
          setAvailableSchools(schools.length > 0 ? schools : []);
        }

        // Only redirect if we're on the base /school route and a school is selected
        // Don't redirect if we're already on /school/admin, /school/parent, or URL-based routes
        const isBaseRoute = pathname === '/school' || pathname === '/school/';
        const isAlreadyOnDashboard = pathname?.startsWith('/school/admin') || 
                                     pathname?.startsWith('/school/parent') ||
                                     pathname?.match(/^\/school\/[^\/]+\/(admin|parent)/);
        
        if (selectedSchool && !schoolLoading && isBaseRoute && !isAlreadyOnDashboard) {
          const finalRole = role || 'admin';
          router.push(`/school/${finalRole}`);
        }
      } catch (error) {
        console.error('Error in school layout:', error);
        // Don't redirect on error - fetch schools from Supabase
        setUserRole('admin');
        try {
          const response = await fetch('/api/school/user-schools');
          if (response.ok) {
            const data = await response.json();
            if (data.success && data.schools) {
              setAvailableSchools(data.schools);
            } else {
              setAvailableSchools([]);
            }
          } else {
            setAvailableSchools([]);
          }
        } catch (fetchError) {
          console.error('Error fetching schools in error handler:', fetchError);
          setAvailableSchools([]);
        }
      } finally {
        setLoading(false);
      }
    }

    checkAuthAndRole();
  }, [pathname, selectedSchool, schoolLoading, router, setAvailableSchools]);

  // Add timeout to prevent infinite loading
  // If we're on a dashboard route, don't wait for schoolLoading
  const isDashboardRoute = pathname?.startsWith('/school/admin') || 
                          pathname?.startsWith('/school/parent') ||
                          pathname?.match(/^\/school\/[^\/]+\/(admin|parent)/);
  
  // If we're on a dashboard route, render children immediately
  // This prevents infinite loading when visiting /school/admin directly
  // Don't wait for loading to complete - let the dashboard pages handle their own loading states
  if (isDashboardRoute) {
    return <>{children}</>;
  }

  // Only show loading spinner for non-dashboard routes
  if (loading || schoolLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show school selector if no school is selected and we're on base route
  const isBaseRoute = pathname === '/school' || pathname === '/school/';
  if (!selectedSchool && userRole && isBaseRoute) {
    return <SchoolSelector role={userRole} />;
  }

  // Render children (the actual dashboard layouts)
  return <>{children}</>;
}


