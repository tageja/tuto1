'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { usePathname } from 'next/navigation';

export interface School {
  id: string;
  name: string;
  type?: string;
  studentCount?: number;
  address?: string;
}

interface SchoolContextType {
  selectedSchool: School | null;
  setSelectedSchool: (school: School | null) => void;
  availableSchools: School[];
  setAvailableSchools: (schools: School[]) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  schoolIdFromUrl: string | null;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [selectedSchool, setSelectedSchoolState] = useState<School | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [schoolIdFromUrl, setSchoolIdFromUrl] = useState<string | null>(null);

  // Enhanced school selection logic: supports both URL-based and localStorage-based routing
  useEffect(() => {
    async function loadSchool() {
      try {
        // Priority 1: Extract schoolId from URL pattern (new URL-based routes)
        // Pattern: /school/:schoolId/(admin|parent)/...
        const urlMatch = pathname?.match(/^\/school\/([^\/]+)\/(admin|parent)/);
        
        if (urlMatch) {
          const schoolIdFromUrl = decodeURIComponent(urlMatch[1]);
          setSchoolIdFromUrl(schoolIdFromUrl);
          
          // Try to find school in availableSchools (case-insensitive)
          const schoolFromList = availableSchools.find(
            s => s.id.toLowerCase() === schoolIdFromUrl.toLowerCase() || 
                 s.name.toLowerCase() === schoolIdFromUrl.toLowerCase()
          );
          
          if (schoolFromList) {
            setSelectedSchoolState(schoolFromList);
            localStorage.setItem('selectedSchool', JSON.stringify(schoolFromList));
          } else if (availableSchools.length > 0) {
            // Only fetch if we have loaded availableSchools and school not found
            // Fetch school details if not in list (for direct URL access)
            try {
              const response = await fetch(`/api/school/user-schools?schoolId=${schoolIdFromUrl}`);
              if (response.ok) {
                const data = await response.json();
                if (data.school) {
                  const school = data.school;
                  setSelectedSchoolState(school);
                  localStorage.setItem('selectedSchool', JSON.stringify(school));
                }
              } else {
                // Fallback: create minimal school object from URL
                const school: School = {
                  id: schoolIdFromUrl,
                  name: schoolIdFromUrl,
                };
                setSelectedSchoolState(school);
                localStorage.setItem('selectedSchool', JSON.stringify(school));
              }
            } catch (error) {
              console.error('Failed to fetch school from URL:', error);
              // Use URL schoolId as fallback
              const school: School = {
                id: schoolIdFromUrl,
                name: schoolIdFromUrl,
              };
              setSelectedSchoolState(school);
            }
          } else {
            // availableSchools not loaded yet, use URL schoolId as temporary
            const school: School = {
              id: schoolIdFromUrl,
              name: schoolIdFromUrl,
            };
            setSelectedSchoolState(school);
          }
        } 
        // Priority 2: Use localStorage (for legacy context-based routes)
        else {
          setSchoolIdFromUrl(null);
          const stored = localStorage.getItem('selectedSchool');
          if (stored) {
            try {
              setSelectedSchoolState(JSON.parse(stored));
            } catch (e) {
              console.error('Failed to parse stored school:', e);
            }
          }
        }
      } catch (error) {
        console.error('Error in school selection logic:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSchool();
  }, [pathname]); // Only depend on pathname to avoid infinite loop

  // Persist selected school to localStorage when changed externally
  const setSelectedSchool = (school: School | null) => {
    setSelectedSchoolState(school);
    if (school) {
      localStorage.setItem('selectedSchool', JSON.stringify(school));
    } else {
      localStorage.removeItem('selectedSchool');
    }
  };

  return (
    <SchoolContext.Provider
      value={{
        selectedSchool,
        setSelectedSchool,
        availableSchools,
        setAvailableSchools,
        isLoading,
        setIsLoading,
        schoolIdFromUrl,
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
}

export function useSchool() {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within SchoolProvider');
  }
  return context;
}
