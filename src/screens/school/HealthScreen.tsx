/**
 * @deprecated This screen has been replaced by AdminHealthRecordsScreen and ParentHealthRecordsScreen
 * Health Records now use Supabase instead of Airtable
 * This file is kept for backward compatibility but should not be used
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useUser } from '../../contexts/UserContext';
import AdminHealthRecordsScreen from './AdminHealthRecordsScreen';
import ParentHealthRecordsScreen from './ParentHealthRecordsScreen';
import { useTheme } from '../../contexts/ThemeContext';

const HealthScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    card: { backgroundColor: colors.background.secondary, borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.border.light },
    title: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
    meta: { fontSize: 12, color: colors.text.secondary },
    searchBar: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginTop: 12, marginBottom: 8, backgroundColor: colors.background.secondary, borderRadius: 16, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 1, borderColor: colors.border.light },
    searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 6, fontSize: 16 },
    loadingText: { fontSize: 12, color: colors.text.secondary, marginTop: 8 },
    emptyWrap: { alignItems: 'center', marginTop: 48, paddingHorizontal: 24 },
    emptyTitle: { fontSize: 16, color: colors.text.primary, marginTop: 12 },
    emptySubtitle: { fontSize: 12, color: colors.text.secondary, marginTop: 4, textAlign: 'center' },
  });
  const navigation = useNavigation<any>();
  const { userType } = useUser();
  const isAdmin = userType === 'teacher' || userType === 'admin';

  // Redirect to appropriate screen based on user role
  // This is a fallback - navigation should handle routing directly
  if (isAdmin) {
    return <AdminHealthRecordsScreen />;
  }
  return <ParentHealthRecordsScreen />;
};

export default HealthScreen;



