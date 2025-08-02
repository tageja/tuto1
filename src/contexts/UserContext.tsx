import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserType = 'parent' | 'student' | 'teacher';

interface UserContextType {
  userType: UserType | null;
  setUserType: (type: UserType) => Promise<void>;
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

  console.log('👤 UserProvider: Component mounted');

  useEffect(() => {
    console.log('👤 UserProvider: useEffect triggered');
    loadUserType();
  }, []);

  const loadUserType = async () => {
    try {
      console.log('👤 UserProvider: Loading user type from storage');
      const savedUserType = await AsyncStorage.getItem('userType');
      console.log('👤 UserProvider: Saved user type:', savedUserType);
      if (savedUserType && ['parent', 'student', 'teacher'].includes(savedUserType)) {
        setUserTypeState(savedUserType as UserType);
        console.log('👤 UserProvider: User type set to:', savedUserType);
      } else {
        console.log('👤 UserProvider: No saved user type found');
      }
    } catch (error) {
      console.error('👤 UserProvider: Error loading user type:', error);
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

  const clearUser = async () => {
    try {
      console.log('👤 UserProvider: Clearing user data');
      await AsyncStorage.removeItem('userType');
      setUserTypeState(null);
      console.log('👤 UserProvider: User data cleared successfully');
    } catch (error) {
      console.error('👤 UserProvider: Error clearing user data:', error);
    }
  };

  console.log('👤 UserProvider: Rendering with user type:', userType);

  return (
    <UserContext.Provider value={{ userType, setUserType, clearUser }}>
      {children}
    </UserContext.Provider>
  );
}; 