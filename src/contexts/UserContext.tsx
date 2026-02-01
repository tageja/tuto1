import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, getCurrentUser } from '../config/supabase';
import { clearParentAccessCache } from '../services/school/parentPin';

type UserType = 'parent' | 'student' | 'teacher' | 'admin' | null;

interface UserData {
  id: string;
  name: string;
  email: string;
  type: UserType;
}

interface UserContextType {
  userType: UserType;
  userData: UserData | null;
  loading: boolean;
  setUserType: (type: UserType) => Promise<void>;
  setActiveRole: (type: UserType) => Promise<void>;
  setUserData: (data: UserData | Omit<UserData, 'type'> & { type: UserType }) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearUser: () => Promise<void>;
}

interface UserContextType {
  userType: UserType | null;
  userData: UserData | null;
  loading: boolean;
  setUserType: (type: UserType) => Promise<void>;
  setActiveRole: (type: UserType) => Promise<void>;
  setUserData: (data: UserData) => Promise<void>;
  refreshProfile: () => Promise<void>;
  clearUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userType, setUserTypeState] = useState<UserType | null>(null);
  const [userData, setUserDataState] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  console.log('👤 UserProvider: Component mounted');

  useEffect(() => {
    console.log('👤 UserProvider: useEffect triggered');
    loadUserData();
    // Background revalidation of role from server if signed-in
    refreshProfile().catch(() => undefined);
  }, []);

  const loadUserData = async () => {
    try {
      console.log('👤 UserProvider: Loading user data from storage');
      const savedUserType = await AsyncStorage.getItem('userType');
      const savedUserData = await AsyncStorage.getItem('userData');
      
      console.log('👤 UserProvider: Saved user type:', savedUserType);
      console.log('👤 UserProvider: Saved user data:', savedUserData);
      
      if (savedUserType && ['parent', 'student', 'teacher', 'admin'].includes(savedUserType)) {
        setUserTypeState(savedUserType as UserType);
        console.log('👤 UserProvider: User type set to:', savedUserType);
      }
      
      if (savedUserData) {
        const parsedUserData = JSON.parse(savedUserData) as UserData;
        setUserDataState(parsedUserData);
        console.log('👤 UserProvider: User data set to:', parsedUserData);
      } else {
        console.log('👤 UserProvider: No saved user data found');
      }
    } catch (error) {
      console.error('👤 UserProvider: Error loading user data:', error);
    }
  };

  const setUserType = async (type: UserType) => {
    try {
      console.log('👤 UserProvider: Setting user type to:', type);
      await AsyncStorage.setItem('userType', type);
      setUserTypeState(type);
      console.log('👤 UserProvider: User type saved successfully');
    } catch (error) {
      console.error('👤 UserProvider: Error saving user type:', error);
    }
  };

  const setActiveRole = async (type: UserType) => {
    // Alias for setUserType; kept for clarity with PRD terminology
    return setUserType(type);
  };

  const setUserData = async (data: UserData) => {
    // Update in-memory state first so the current session has correct role even if persistence fails
    const safeData: UserData = {
      id: String(data?.id ?? ''),
      name: String(data?.name ?? ''),
      email: String(data?.email ?? ''),
      type: data?.type ?? null,
    };
    setUserDataState(safeData);
    setUserTypeState(safeData.type);
    try {
      console.log('👤 UserProvider: Setting user data to:', safeData);
      await AsyncStorage.setItem('userData', JSON.stringify(safeData));
      if (safeData.type != null) {
        await AsyncStorage.setItem('userType', String(safeData.type));
      }
      console.log('👤 UserProvider: User data saved successfully');
    } catch (error) {
      console.error('👤 UserProvider: Error saving user data:', error);
      // State already updated above; user will have correct role for this session
    }
  };

  const refreshProfile = async () => {
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('👤 UserProvider: No Supabase user; skipping profile refresh');
        return;
      }
      
      setLoading(true);
      console.log('👤 UserProvider: Fetching profile from Supabase for user:', user.email);
      
      // Fetch user profile from Supabase database
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', user.id)
        .single();
      
      if (error) {
        console.warn('👤 UserProvider: Profile not found, user may need to complete registration');
        return;
      }
      
      if (profile && profile.role) {
        const role = profile.role as UserType;
        if (['parent', 'student', 'teacher', 'admin'].includes(role)) {
          console.log('👤 UserProvider: Server role resolved to:', role);
          await AsyncStorage.setItem('userType', role);
          setUserTypeState(role);
          
          // Update full user data
          const fullUserData: UserData = {
            id: profile.id,
            name: profile.name || user.email?.split('@')[0] || 'User',
            email: profile.email,
            type: role,
          };
          await setUserData(fullUserData);
        }
      }
    } catch (error) {
      console.warn('👤 UserProvider: refreshProfile failed (non-blocking):', error);
    } finally {
      setLoading(false);
    }
  };

  const clearUser = async () => {
    try {
      console.log('👤 UserProvider: Clearing user data');
      const userEmail = userDataState?.email;
      if (userEmail) {
        await clearParentAccessCache(userEmail);
      }
      await AsyncStorage.removeItem('userType');
      await AsyncStorage.removeItem('userData');
      setUserTypeState(null);
      setUserDataState(null);
      console.log('👤 UserProvider: User data cleared successfully');
    } catch (error) {
      console.error('👤 UserProvider: Error clearing user data:', error);
    }
  };

  console.log('👤 UserProvider: Rendering with user type:', userType, 'userData:', userData);

  return (
    <UserContext.Provider value={{ userType, userData, loading, setUserType, setActiveRole, setUserData, refreshProfile, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}; 