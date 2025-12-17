import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import type { EventKPIs } from '../../types/school/events';

interface EventSummaryCardsProps {
  kpis: EventKPIs;
  loading?: boolean;
}

export const EventSummaryCards: React.FC<EventSummaryCardsProps> = ({
  kpis,
  loading = false,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      gap: spacing.sm,
    },
    card: {
      flex: 1,
      padding: spacing.md,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 80,
    },
    loadingCard: {
      backgroundColor: colors.background.secondary,
    },
    count: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
      textAlign: 'center',
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.card, styles.loadingCard]}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ))}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.card, { backgroundColor: '#E0F2F1' }]}>
        <Text style={[styles.count, { color: '#00695C' }]}>{kpis.totalEvents}</Text>
        <Text style={[styles.label, { color: '#00695C' }]}>Total Events</Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#FFF9C4' }]}>
        <Text style={[styles.count, { color: '#F57F17' }]}>{kpis.upcoming}</Text>
        <Text style={[styles.label, { color: '#F57F17' }]}>Upcoming</Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#C8E6C9' }]}>
        <Text style={[styles.count, { color: '#2E7D32' }]}>{kpis.completed}</Text>
        <Text style={[styles.label, { color: '#2E7D32' }]}>Completed</Text>
      </View>
      <View style={[styles.card, { backgroundColor: '#E1BEE7' }]}>
        <Text style={[styles.count, { color: '#7B1FA2' }]}>{kpis.totalParticipants}</Text>
        <Text style={[styles.label, { color: '#7B1FA2' }]}>Total Participants</Text>
      </View>
    </View>
  );
};



