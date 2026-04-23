import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchoolContextType, School, SchoolUser, JoinedSchool } from '../types/school';
// import { useAirtable } from '../hooks/useAirtable';

// School ID mapping from Airtable to Supabase
const SCHOOL_ID_MAPPING: Record<string, string> = {
  'rec6oStnXAgY4VCrC': 'bed99290-1b7c-4e90-ac55-0ec7f496491b', // Tuto Demo School
  // Add more mappings as needed
};

/**
 * Resolve school ID from Airtable format to Supabase UUID
 */
function resolveSchoolId(schoolId: string): string {
  const resolved = SCHOOL_ID_MAPPING[schoolId] || schoolId;
  console.log('🏫 SchoolContext resolveSchoolId:', { input: schoolId, output: resolved, mapped: !!SCHOOL_ID_MAPPING[schoolId] });
  return resolved;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

interface SchoolProviderProps {
  children: ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const [joinedSchools, setJoinedSchools] = useState<JoinedSchool[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schoolUser, setSchoolUser] = useState<SchoolUser | null>(null);
  const [isSchoolMode, setIsSchoolMode] = useState<boolean>(false);
  
// const { fetchRecords, createRecord, updateRecord } = useAirtable();

  // Load school data from storage on app start
  useEffect(() => {
    loadSchoolDataFromStorage();
  }, []);

  const loadSchoolDataFromStorage = async () => {
    try {
      const storedJoinedSchools = await AsyncStorage.getItem('joinedSchools');
      const storedCurrentSchool = await AsyncStorage.getItem('currentSchool');
      const storedSchoolUser = await AsyncStorage.getItem('schoolUser');
      const storedSchoolMode = await AsyncStorage.getItem('isSchoolMode');

      if (storedJoinedSchools) {
        setJoinedSchools(JSON.parse(storedJoinedSchools));
      }
      if (storedCurrentSchool) {
        const school = JSON.parse(storedCurrentSchool);
        // Only process if school is not null
        if (school && school.id) {
          const originalId = school.id;
          school.id = resolveSchoolId(school.id);
          console.log('🏫 SchoolContext: School ID resolved:', { originalId, resolvedId: school.id });
          setCurrentSchool(school);
          // Save back to storage with resolved ID
          await AsyncStorage.setItem('currentSchool', JSON.stringify(school));
        }
      }
      if (storedSchoolUser) {
        setSchoolUser(JSON.parse(storedSchoolUser));
      }
      if (storedSchoolMode) {
        setIsSchoolMode(JSON.parse(storedSchoolMode));
      }
    } catch (error) {
      console.error('Error loading school data from storage:', error);
    }
  };

  const saveSchoolDataToStorage = async () => {
    try {
      await AsyncStorage.setItem('joinedSchools', JSON.stringify(joinedSchools));
      await AsyncStorage.setItem('currentSchool', JSON.stringify(currentSchool));
      await AsyncStorage.setItem('schoolUser', JSON.stringify(schoolUser));
      await AsyncStorage.setItem('isSchoolMode', JSON.stringify(isSchoolMode));
    } catch (error) {
      console.error('Error saving school data to storage:', error);
    }
  };

  // Save data to storage whenever it changes
  useEffect(() => {
    saveSchoolDataToStorage();
  }, [joinedSchools, currentSchool, schoolUser, isSchoolMode]);

  const joinSchool = async (code: string): Promise<boolean> => {
    try {
      // Import supabase client
      const { supabase } = await import('../config/supabase');
      
      // Validate invitation code in Supabase
      const { data: invitations, error: invError } = await supabase
        .from('school_invitations')
        .select('*')
        .eq('token', code)
        .maybeSingle();

      if (invError || !invitations) {
        throw new Error('Invalid invitation code');
      }

      const invitation = invitations;
      
      // Check if invitation is active
      if (invitation.status !== 'pending') {
        throw new Error('Invitation code is not active');
      }

      // Check if expired
      if (invitation.expires_at) {
        const expiryDate = new Date(invitation.expires_at);
        if (expiryDate < new Date()) {
          throw new Error('Invitation code has expired');
        }
      }

      // Get school information from Supabase
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .select('*')
        .eq('id', invitation.school_id)
        .single();

      if (schoolError || !school) {
        throw new Error('School not found');
      }

      const schoolData: School = {
        id: school.id,
        name: school.name,
        logo_url: school.logo_url || undefined,
        code: school.school_code || '',
        address: school.address || '',
        phone: school.phone || '',
        email: school.email || '',
        website: undefined,
        principalName: '',
        principalEmail: '',
        principalPhone: '',
        schoolType: 'Public',
        gradeLevels: [],
        studentCount: 0,
        teacherCount: 0,
        foundedYear: new Date().getFullYear(),
        status: school.status || 'active',
        createdDate: school.created_at || new Date().toISOString(),
        updatedDate: school.updated_at || new Date().toISOString(),
      };

      // Mark invitation as used
      await supabase
        .from('school_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      // Add to joined schools if not already joined
      const existingSchool = joinedSchools.find(js => js.school.id === schoolData.id);
      if (!existingSchool) {
        const newJoinedSchool: JoinedSchool = {
          school: schoolData,
          joinedDate: new Date().toISOString(),
          invitationCode: code,
          role: 'teacher', // Teachers use invitation codes
        };
        setJoinedSchools(prev => [...prev, newJoinedSchool]);
      }

      // Set as current school
      setCurrentSchool(schoolData);
      setIsSchoolMode(true);

      return true;
    } catch (error) {
      console.error('Error joining school:', error);
      return false;
    }
  };

  const joinSchoolByPin = async (schoolId: string, schoolName: string): Promise<void> => {
    const schoolData: School = {
      id: schoolId,
      name: schoolName,
      code: '',
      address: '',
      phone: '',
      email: '',
      principalName: '',
      principalEmail: '',
      principalPhone: '',
      schoolType: 'Public',
      gradeLevels: [],
      studentCount: 0,
      teacherCount: 0,
      foundedYear: new Date().getFullYear(),
      status: 'Active',
      createdDate: new Date().toISOString(),
      updatedDate: new Date().toISOString(),
    };

    const existingSchool = joinedSchools.find(js => js.school.id === schoolId);
    if (!existingSchool) {
      const newJoinedSchool: JoinedSchool = {
        school: schoolData,
        joinedDate: new Date().toISOString(),
        invitationCode: '',
        role: 'parent',
      };
      setJoinedSchools(prev => [...prev, newJoinedSchool]);
    }

    setCurrentSchool(schoolData);
    setIsSchoolMode(true);
  };

  const leaveSchool = () => {
    setCurrentSchool(null);
    setSchoolUser(null);
    setIsSchoolMode(false);
  };

  const switchToSchool = (school: School) => {
    setCurrentSchool(school);
    setIsSchoolMode(true);
  };

  const removeSchool = (schoolId: string) => {
    setJoinedSchools(prev => prev.filter(js => js.school.id !== schoolId));
    if (currentSchool?.id === schoolId) {
      setCurrentSchool(null);
      setSchoolUser(null);
      setIsSchoolMode(false);
    }
  };

  const refreshSchoolData = async () => {
    if (!currentSchool) return;

    try {
      const { supabase } = await import('../config/supabase');
      
      // Refresh school information
      const { data: school, error } = await supabase
        .from('schools')
        .select('*')
        .eq('id', currentSchool.id)
        .single();

      if (!error && school) {
        const mapped: School = {
          id: resolveSchoolId(school.id),
          name: school.name,
          logo_url: school.logo_url || undefined,
          code: school.school_code || '',
          address: school.address || '',
          phone: school.phone || '',
          email: school.email || '',
          website: undefined,
          principalName: '',
          principalEmail: '',
          principalPhone: '',
          schoolType: 'Public',
          gradeLevels: [],
          studentCount: 0,
          teacherCount: 0,
          foundedYear: new Date().getFullYear(),
          status: school.status || 'active',
          createdDate: school.created_at || new Date().toISOString(),
          updatedDate: school.updated_at || new Date().toISOString(),
        };
        console.log('🏫 Mapped school:', mapped);
        setCurrentSchool(mapped);
      }

      // School user information would need to be queried from a different table if needed
      // For now, we'll skip this part since the mobile app may not need it
    } catch (error) {
      console.error('Error refreshing school data:', error);
    }
  };

  const value: SchoolContextType = {
    joinedSchools,
    currentSchool,
    schoolUser,
    isSchoolMode,
    setCurrentSchool,
    setSchoolUser,
    setIsSchoolMode,
    joinSchool,
    joinSchoolByPin,
    leaveSchool,
    switchToSchool,
    removeSchool,
    refreshSchoolData,
  };

  return (
    <SchoolContext.Provider value={value}>
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
