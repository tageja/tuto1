import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { colors, spacing, typography } from '../../theme';
import { FilterType, SubjectFilter } from '../../screens/FeedScreen';

interface FilterBarProps {
  roleFilter: FilterType;
  subjectFilter: SubjectFilter;
  onRoleFilterChange: (filter: FilterType) => void;
  onSubjectFilterChange: (filter: SubjectFilter) => void;
}

const roleFilters: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'parents', label: 'Parents' },
  { key: 'students', label: 'Students' },
];

const subjectFilters: { key: SubjectFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'math', label: 'Math' },
  { key: 'english', label: 'English' },
  { key: 'science', label: 'Science' },
  { key: 'music', label: 'Music' },
  { key: 'sports', label: 'Sports' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  roleFilter,
  subjectFilter,
  onRoleFilterChange,
  onSubjectFilterChange,
}) => {
  const { t } = useLanguage();

  const renderFilterPill = (
    filter: { key: string; label: string },
    isActive: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity
      key={filter.key}
      style={[
        styles.filterPill,
        isActive && styles.activeFilterPill,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterText,
          isActive && styles.activeFilterText,
        ]}
      >
        {t(`feed.filters.${filter.key}`)}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Role Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{t('feed.filters.byRole')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {roleFilters.map((filter) =>
            renderFilterPill(
              filter,
              roleFilter === filter.key,
              () => onRoleFilterChange(filter.key as FilterType)
            )
          )}
        </ScrollView>
      </View>

      {/* Subject Filters */}
      <View style={styles.filterSection}>
        <Text style={styles.sectionTitle}>{t('feed.filters.bySubject')}</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {subjectFilters.map((filter) =>
            renderFilterPill(
              filter,
              subjectFilter === filter.key,
              () => onSubjectFilterChange(filter.key as SubjectFilter)
            )
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterSection: {
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.lg,
  },
  filterRow: {
    paddingHorizontal: spacing.lg,
  },
  filterPill: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activeFilterPill: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  activeFilterText: {
    color: colors.background.primary,
  },
}); 