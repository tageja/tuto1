/**
 * KPI Card Component
 * Displays a single metric with icon, label, and value
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';

interface KpiCardProps {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string | number;
  color?: string;
  iconColor?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({
  icon,
  label,
  value,
  color,
  iconColor,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderLeftWidth: 4,
    },
    iconContainer: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: colors.background.secondary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    content: {
      flex: 1,
    },
    label: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    value: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text.primary,
    },
  });

  return (
    <View style={[styles.card, { borderLeftColor: color }]}>
      <View style={styles.iconContainer}>
        <MaterialIcons name={icon} size={24} color={iconColor} />
      </View>
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
    </View>
  );
};


export default KpiCard;






