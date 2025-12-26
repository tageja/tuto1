/**
 * Health Screen Router
 * Routes to appropriate Health Records screen based on user role
 * Uses Supabase for all data operations
 */
import React from 'react';
import { useUser } from '../../contexts/UserContext';
import AdminHealthRecordsScreen from './AdminHealthRecordsScreen';
import ParentHealthRecordsScreen from './ParentHealthRecordsScreen';

const HealthScreen: React.FC = () => {
  const { userType } = useUser();
  const isAdmin = userType === 'teacher' || userType === 'admin';

  // Route to appropriate screen based on user role
  if (isAdmin) {
    return <AdminHealthRecordsScreen />;
  }
  return <ParentHealthRecordsScreen />;
};

export default HealthScreen;



