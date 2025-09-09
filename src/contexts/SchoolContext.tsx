import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SchoolContextType, School, SchoolUser, JoinedSchool } from '../types/school';
import { useAirtable } from '../hooks/useAirtable';

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

interface SchoolProviderProps {
  children: ReactNode;
}

export const SchoolProvider: React.FC<SchoolProviderProps> = ({ children }) => {
  const [joinedSchools, setJoinedSchools] = useState<JoinedSchool[]>([]);
  const [currentSchool, setCurrentSchool] = useState<School | null>(null);
  const [schoolUser, setSchoolUser] = useState<SchoolUser | null>(null);
  const [isSchoolMode, setIsSchoolMode] = useState<boolean>(false);
  
  const { fetchRecords, createRecord, updateRecord } = useAirtable();

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
        setCurrentSchool(JSON.parse(storedCurrentSchool));
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
      // Validate invitation code
      const invitations = await fetchRecords('TutoSchoolInvitations', {
        filterByFormula: `{Invitation Code} = '${code}'`
      });

      if (!invitations || invitations.length === 0) {
        throw new Error('Invalid invitation code');
      }

      const invitation = invitations[0];
      
      // Check if invitation is active and not expired
      if (invitation.fields['Status'] !== 'Active') {
        throw new Error('Invitation code is not active');
      }

      const expiryDate = new Date(invitation.fields['Expiry Date']);
      if (expiryDate < new Date()) {
        throw new Error('Invitation code has expired');
      }

      // Check if max uses reached
      if (invitation.fields['Current Uses'] >= invitation.fields['Max Uses']) {
        throw new Error('Invitation code usage limit reached');
      }

      // Get school information
      const schools = await fetchRecords('TutoSchools', {
        filterByFormula: `{School Name} = '${invitation.fields['School Name']}'`
      });

      if (!schools || schools.length === 0) {
        throw new Error('School not found');
      }

      const school = {
        id: schools[0].id,
        name: schools[0].fields['School Name'] || schools[0].fields['name'],
        code: schools[0].fields['School Code'] || '',
        address: schools[0].fields['Address'] || '',
        phone: schools[0].fields['Phone'] || '',
        email: schools[0].fields['Email'] || '',
        website: schools[0].fields['Website'] || undefined,
        principalName: schools[0].fields['Principal Name'] || '',
        principalEmail: schools[0].fields['Principal Email'] || '',
        principalPhone: schools[0].fields['Principal Phone'] || '',
        schoolType: schools[0].fields['School Type'] || 'Public',
        gradeLevels: schools[0].fields['Grade Levels'] || [],
        studentCount: schools[0].fields['Student Count'] || 0,
        teacherCount: schools[0].fields['Teacher Count'] || 0,
        foundedYear: schools[0].fields['Founded Year'] || new Date().getFullYear(),
        status: schools[0].fields['Status'] || 'Active',
        createdDate: schools[0].fields['Created Date'] || new Date().toISOString(),
        updatedDate: schools[0].fields['Updated Date'] || new Date().toISOString(),
      } as School;
      
      // Update invitation usage
      await updateRecord('TutoSchoolInvitations', invitation.id, {
        'Current Uses': invitation.fields['Current Uses'] + 1
      });

      // Add to joined schools if not already joined
      const existingSchool = joinedSchools.find(js => js.school.id === school.id);
      if (!existingSchool) {
        const newJoinedSchool: JoinedSchool = {
          school,
          joinedDate: new Date().toISOString(),
          invitationCode: code,
          role: 'parent', // Default role, can be updated later
        };
        setJoinedSchools(prev => [...prev, newJoinedSchool]);
      }

      // Set as current school
      setCurrentSchool(school);
      setIsSchoolMode(true);

      return true;
    } catch (error) {
      console.error('Error joining school:', error);
      return false;
    }
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
      // Refresh school information
      const schools = await fetchRecords('TutoSchools', {
        filterByFormula: `{School Name} = '${currentSchool.name}'`
      });

      if (schools && schools.length > 0) {
        const mapped = {
          id: schools[0].id,
          name: schools[0].fields['School Name'] || schools[0].fields['name'],
          code: schools[0].fields['School Code'] || '',
          address: schools[0].fields['Address'] || '',
          phone: schools[0].fields['Phone'] || '',
          email: schools[0].fields['Email'] || '',
          website: schools[0].fields['Website'] || undefined,
          principalName: schools[0].fields['Principal Name'] || '',
          principalEmail: schools[0].fields['Principal Email'] || '',
          principalPhone: schools[0].fields['Principal Phone'] || '',
          schoolType: schools[0].fields['School Type'] || 'Public',
          gradeLevels: schools[0].fields['Grade Levels'] || [],
          studentCount: schools[0].fields['Student Count'] || 0,
          teacherCount: schools[0].fields['Teacher Count'] || 0,
          foundedYear: schools[0].fields['Founded Year'] || new Date().getFullYear(),
          status: schools[0].fields['Status'] || 'Active',
          createdDate: schools[0].fields['Created Date'] || new Date().toISOString(),
          updatedDate: schools[0].fields['Updated Date'] || new Date().toISOString(),
        } as School;
        setCurrentSchool(mapped);
      }

      // Refresh school user information if exists
      if (schoolUser) {
        const schoolUsers = await fetchRecords('TutoSchoolUsers', {
          filterByFormula: `{User ID} = '${schoolUser.userId}' AND {School Name} = '${currentSchool.name}'`
        });

        if (schoolUsers && schoolUsers.length > 0) {
          const su = schoolUsers[0];
          const mappedUser: SchoolUser = {
            id: su.id,
            userId: su.fields['User ID'] || su.fields['userId'],
            schoolId: su.fields['School ID'] || '',
            schoolName: su.fields['School Name'] || currentSchool.name,
            role: su.fields['Role'] || 'parent',
            className: su.fields['Class Name'] || undefined,
            studentId: su.fields['Student ID'] || undefined,
            parentId: su.fields['Parent ID'] || undefined,
            teacherId: su.fields['Teacher ID'] || undefined,
            status: su.fields['Status'] || 'Active',
            joinedDate: su.fields['Joined Date'] || new Date().toISOString(),
            createdDate: su.fields['Created Date'] || new Date().toISOString(),
          };
          setSchoolUser(mappedUser);
        }
      }
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
