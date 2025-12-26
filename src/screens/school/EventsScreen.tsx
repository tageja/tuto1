/**
 * DEPRECATED: This file uses Airtable and is no longer used.
 * Events are now handled by:
 * - AdminEventsScreen.tsx (for admin/teacher role)
 * - ParentEventsScreen.tsx (for parent role)
 * 
 * Navigation routes to these screens via SchoolEvents route with role-based routing.
 * This file is kept for reference but should not be imported anywhere.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const EventsScreen: React.FC = () => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16,
    },
    message: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.message}>
        This screen has been migrated to Supabase.{'\n'}
        Please use AdminEventsScreen or ParentEventsScreen instead.
      </Text>
    </View>
  );
};

export default EventsScreen;



