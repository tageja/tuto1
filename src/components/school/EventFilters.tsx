import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import type { EventCategory, EventStatusTab } from '../../types/school/events';

interface EventFiltersProps {
  role: 'admin' | 'parent';
  selectedCategory?: string;
  selectedMonth?: string;
  searchQuery?: string;
  statusTab?: EventStatusTab;
  onFilterChange: (filters: {
    category?: string;
    month?: string;
    search?: string;
    statusTab?: EventStatusTab;
  }) => void;
}

const CATEGORIES: EventCategory[] = [
  'school',
  'class',
  'competition',
  'workshop',
  'outing',
  'practice',
  'celebration',
];

export const EventFilters: React.FC<EventFiltersProps> = ({
  role,
  selectedCategory = 'All Events',
  selectedMonth,
  searchQuery = '',
  statusTab = 'All',
  onFilterChange,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();
  const [search, setSearch] = useState(searchQuery);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);
  const [monthPickerVisible, setMonthPickerVisible] = useState(false);

  // Debounce search input
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      onFilterChange({ search });
    }, 300);

    setDebounceTimer(timer);


    // Styles with dynamic theme


    const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.md,
  },
  section: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
  },
  sectionLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  categoryRow: {
    paddingRight: spacing.md,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  categoryChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  categoryChipTextActive: {
    color: colors.white,
  },
  statusRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.background.secondary,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  statusTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  statusTabText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  statusTabTextActive: {
    color: colors.white,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    gap: spacing.xs,
  },
  searchInput: {
    flex: 1,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  monthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  monthText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    minWidth: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  monthList: {
    maxHeight: 400,
  },
  monthOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  monthOptionActive: {
    backgroundColor: `${colors.primary}10`,
  },
  monthOptionText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.primary,
  },
  monthOptionTextActive: {
    fontFamily: typography.fontFamily.semiBold,
    color: colors.primary,
  },
});


    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [search]);

  const handleCategoryChange = (category: string) => {
    onFilterChange({ category });
  };

  const handleStatusTabChange = (tab: EventStatusTab) => {
    onFilterChange({ statusTab: tab });
  };

  // Generate month options (last 3 months + current month + next 6 months)
  const getMonthOptions = (): string[] => {
    const options: string[] = [];
    const now = new Date();
    // Start from 3 months ago
    for (let i = -3; i < 7; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      options.push(monthName);
    }
    return options;
  };

  const monthOptions = getMonthOptions();
  const currentMonth = selectedMonth || monthOptions[3]; // Default to current month (index 3, since we start from -3)

  const handleMonthPress = () => {
    setMonthPickerVisible(true);
  };

  const handleMonthSelect = (month: string) => {
    onFilterChange({ month });
    setMonthPickerVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Category Section (Admin only) */}
      {role === 'admin' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('school.events.category')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryRow}
          >
            <TouchableOpacity
              style={[
                styles.categoryChip,
                selectedCategory === 'All Events' && styles.categoryChipActive,
              ]}
              onPress={() => handleCategoryChange('All Events')}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'All Events' && styles.categoryChipTextActive,
                ]}
              >
                {t('school.events.allEvents')}
              </Text>
            </TouchableOpacity>
            {CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.categoryChipActive,
                ]}
                onPress={() => handleCategoryChange(category)}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    selectedCategory === category && styles.categoryChipTextActive,
                  ]}
                >
                  {t(`school.events.${category}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Status Tabs (Parent only) */}
      {role === 'parent' && (
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('school.events.status')}</Text>
          <View style={styles.statusRow}>
            {(['All', 'Registered', 'Upcoming'] as EventStatusTab[]).map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.statusTab,
                  statusTab === tab && styles.statusTabActive,
                ]}
                onPress={() => handleStatusTabChange(tab)}
              >
                <Text
                  style={[
                    styles.statusTabText,
                    statusTab === tab && styles.statusTabTextActive,
                  ]}
                >
                  {tab === 'All' ? t('school.events.allEvents') : t(`school.events.${tab.toLowerCase()}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Search and Month */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <MaterialIcons name="search" size={20} color={colors.text.secondary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('school.events.search')}
            placeholderTextColor={colors.text.light}
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <TouchableOpacity style={styles.monthContainer} onPress={handleMonthPress}>
          <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
          <Text style={styles.monthText}>{currentMonth}</Text>
          <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
        </TouchableOpacity>
      </View>

      {/* Month Picker Modal */}
      <Modal
        visible={monthPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMonthPickerVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMonthPickerVisible(false)}
        >
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('school.events.selectMonth')}</Text>
              <TouchableOpacity onPress={() => setMonthPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.monthList}>
              {monthOptions.map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.monthOption,
                    currentMonth === month && styles.monthOptionActive,
                  ]}
                  onPress={() => handleMonthSelect(month)}
                >
                  <Text
                    style={[
                      styles.monthOptionText,
                      currentMonth === month && styles.monthOptionTextActive,
                    ]}
                  >
                    {month}
                  </Text>
                  {currentMonth === month && (
                    <MaterialIcons name="check" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

