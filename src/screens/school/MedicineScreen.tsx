/**
 * MedicineScreen - Legacy screen, now redirects to role-based screens
 * This file is kept for backward compatibility but redirects to AdminMedicine or ParentMedicine
 * based on user role. All Airtable dependencies have been removed.
 */

import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { useTheme } from '../../contexts/ThemeContext';

const MedicineScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { userType } = useUser();

  useEffect(() => {
    // Redirect to role-based screen
    const isAdmin = userType === 'teacher' || userType === 'admin';
    if (isAdmin) {
      navigation.replace('AdminMedicine' as never);
    } else {
      navigation.replace('ParentMedicine' as never);
    }
  }, [userType, navigation]);


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});


  return (
    <View style={styles.container}>
      <DashboardHeader
        schoolName="Medicine Management"
        onNotificationPress={() => navigation.navigate('Notifications' as never)}
      />
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    </View>
  );
};

export default MedicineScreen;


