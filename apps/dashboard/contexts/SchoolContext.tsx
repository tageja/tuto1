'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export function SchoolProvider({ children }: { children: ReactNode }) {
  const [selectedSchool, setSelectedSchoolState] = useState<School | null>(null);
  const [availableSchools, setAvailableSchools] = useState<School[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected school from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('selectedSchool');
    if (stored) {
      try {
        setSelectedSchoolState(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse stored school:', e);
      }
    }
    setIsLoading(false);
  }, []);

  // Persist selected school to localStorage
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
