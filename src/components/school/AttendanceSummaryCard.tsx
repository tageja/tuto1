import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface AttendanceSummaryCardProps {
  count: number;
  label: string;
  color: string;
  subtitle?: string;
}

export const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  count,
  label,
  color,
  subtitle,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 100,
      margin: spacing.xs,
    },
    count: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
    },
    subtitle: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      fontFamily: typography.fontFamily.regular,
    },
  });

  const bgColor = `${color}20`; // 20% opacity

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <Text style={[styles.count, { color }]}>{count}</Text>
      <Text style={[styles.label, { color }]}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
};



