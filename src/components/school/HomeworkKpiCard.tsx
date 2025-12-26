import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface HomeworkKpiCardProps {
  value: number | string;
  label: string;
  backgroundColor: string;
  textColor: string;
}

export const HomeworkKpiCard: React.FC<HomeworkKpiCardProps> = ({
  value,
  label,
  backgroundColor,
  textColor,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 80,
      margin: spacing.xs,
    },
    value: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
      marginBottom: spacing.xs,
    },
    label: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
      textAlign: 'center',
    },
  });

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.value, { color: textColor }]}>{value}</Text>
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};







