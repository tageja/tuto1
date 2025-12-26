import React from 'react';
import { Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

interface FilterChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
}

export const FilterChip: React.FC<FilterChipProps> = ({ label, selected, onPress }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.background.tertiary,
      marginRight: 8,
      borderWidth: 1,
      borderColor: 'transparent',
    },
    selectedContainer: {
      backgroundColor: `${colors.primary}15`,
      borderColor: colors.primary,
    },
    label: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    selectedLabel: {
      color: colors.primary,
      fontWeight: '600',
    },
  });

  return (
    <TouchableOpacity
      style={[
        styles.container,
        selected && styles.selectedContainer,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.label,
          selected && styles.selectedLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};











