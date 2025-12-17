/**
 * Filter Chips Component
 * Horizontal scrollable filter chips
 */

import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export interface FilterOption {
  id: string;
  label: string;
}

interface FilterChipsProps {
  options: FilterOption[];
  selected: string;
  onSelect: (id: string) => void;
}

export const FilterChips: React.FC<FilterChipsProps> = ({
  options,
  selected,
  onSelect,
}) => {
  const { colors, spacing, typography, borderRadius } = useTheme();

  const styles = StyleSheet.create({
    scrollView: {
      marginVertical: 8,
    },
    scrollContainer: {
      paddingHorizontal: 16,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginRight: 8,
    },
    chipSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    chipText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    chipTextSelected: {
      color: colors.white,
    },
  });

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContainer}
      style={styles.scrollView}
    >
      {options.map((option) => {
        const isSelected = selected === option.id;
        return (
          <TouchableOpacity
            key={option.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(option.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};



export default FilterChips;






