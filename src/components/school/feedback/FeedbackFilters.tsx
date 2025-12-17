import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { FilterChip } from '../FilterChip';
import { useTheme } from '../../../contexts/ThemeContext';
import { FeedbackFilters as FeedbackFiltersType } from '../../../types/school/feedback';

interface FeedbackFiltersProps {
  categoryFilter: 'request' | 'complaint' | 'information' | 'all';
  statusFilter: 'open' | 'overdue' | 'closed' | 'all';
  onCategoryChange: (category: 'request' | 'complaint' | 'information' | 'all') => void;
  onStatusChange: (status: 'open' | 'overdue' | 'closed' | 'all') => void;
  showSort?: boolean;
  sortBy?: 'newest' | 'oldest' | 'deadline';
  onSortChange?: (sort: 'newest' | 'oldest' | 'deadline') => void;
}

export const FeedbackFilters: React.FC<FeedbackFiltersProps> = ({
  categoryFilter,
  statusFilter,
  onCategoryChange,
  onStatusChange,
  showSort = false,
  sortBy = 'newest',
  onSortChange,
}) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    section: {
      marginBottom: spacing.md,
    },
    sectionLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    chipsContainer: {
      flexDirection: 'row',
    },
  });
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <FilterChip
            label="All"
            selected={categoryFilter === 'all'}
            onPress={() => onCategoryChange('all')}
          />
          <FilterChip
            label="Request"
            selected={categoryFilter === 'request'}
            onPress={() => onCategoryChange('request')}
          />
          <FilterChip
            label="Complaint"
            selected={categoryFilter === 'complaint'}
            onPress={() => onCategoryChange('complaint')}
          />
          <FilterChip
            label="Information"
            selected={categoryFilter === 'information'}
            onPress={() => onCategoryChange('information')}
          />
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Status</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          <FilterChip
            label="All"
            selected={statusFilter === 'all'}
            onPress={() => onStatusChange('all')}
          />
          <FilterChip
            label="Open"
            selected={statusFilter === 'open'}
            onPress={() => onStatusChange('open')}
          />
          <FilterChip
            label="Closed"
            selected={statusFilter === 'closed'}
            onPress={() => onStatusChange('closed')}
          />
          {showSort && (
            <>
              <FilterChip
                label="Overdue"
                selected={statusFilter === 'overdue'}
                onPress={() => onStatusChange('overdue')}
              />
            </>
          )}
        </ScrollView>
      </View>

      {showSort && onSortChange && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Sort</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
            <FilterChip
              label="Newest"
              selected={sortBy === 'newest'}
              onPress={() => onSortChange('newest')}
            />
            <FilterChip
              label="Oldest"
              selected={sortBy === 'oldest'}
              onPress={() => onSortChange('oldest')}
            />
            <FilterChip
              label="Deadline"
              selected={sortBy === 'deadline'}
              onPress={() => onSortChange('deadline')}
            />
          </ScrollView>
        </View>
      )}
    </View>
  );
};





