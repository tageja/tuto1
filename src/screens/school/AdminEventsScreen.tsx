import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useAdminEvents, useEventMonths } from '../../hooks/useEventsData';
import { formatEventDate, formatEventTime } from '../../services/school/events';
import type { EventCategory, EventWithCounts } from '../../types/school/events';

const CATEGORIES: (EventCategory | 'All Events')[] = [
  'All Events',
  'school',
  'class',
  'competition',
  'workshop',
  'outing',
  'practice',
  'celebration',
];

const AdminEventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [selectedCategory, setSelectedCategory] = useState<string>('All Events');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filters = useMemo(
    () => ({
      category: selectedCategory,
      month: selectedMonth,
      search: searchQuery,
    }),
    [selectedCategory, selectedMonth, searchQuery]
  );

  const { events, kpis, loading, refetch } = useAdminEvents(
    currentSchool?.id || currentSchool?.name || null,
    filters
  );

  const { months: availableMonths, loading: loadingMonths } = useEventMonths(
    currentSchool?.id || currentSchool?.name || null
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleCreateEvent = () => {
    navigation.navigate('AdminCreateEvent');
  };

  const handleViewDetails = (event: EventWithCounts) => {
    navigation.navigate('SchoolEventDetail', { event });
  };

  const handleManage = (event: EventWithCounts) => {
    // TODO: Navigate to event management screen when implemented
    console.log('Manage event:', event.id);
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    content: {
      flex: 1,
    },
    headerCard: {
      backgroundColor: colors.background.primary,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.xxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      marginTop: spacing.xs,
    },
    createButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      gap: spacing.xs,
    },
    createButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
    },
    summaryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      justifyContent: 'space-between',
    },
    summaryCard: {
      width: '48%', // Ensure 2 items per row with small gap
      backgroundColor: colors.background.primary,
      padding: spacing.sm, // Reduced padding for compactness
      borderRadius: borderRadius.lg,
      marginBottom: spacing.sm, // Vertical gap
      ...shadows.sm,
    },
    summaryCardBlue: {
      backgroundColor: '#E3F2FD',
    },
    summaryCardYellow: {
      backgroundColor: '#FFF9E6',
    },
    summaryCardGreen: {
      backgroundColor: '#E8F5E9',
    },
    summaryCardPurple: {
      backgroundColor: '#F3E5F5',
    },
    summaryValue: {
      fontSize: typography.fontSize.xl, // Slightly smaller font
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: 2, // Reduced margin
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    categorySection: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    categoryLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    categoryChips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    categoryChip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      backgroundColor: colors.background.primary,
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
    filtersRow: {
      flexDirection: 'row',
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    searchContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchInput: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    searchInputPlaceholder: {
      color: colors.text.light,
    },
    monthPicker: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
      gap: spacing.xs,
    },
    monthPickerText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    eventCard: {
      backgroundColor: colors.background.primary,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    eventCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    categoryPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      backgroundColor: colors.background.tertiary,
    },
    categoryPillText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      textTransform: 'capitalize',
    },
    participantCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    participantCountText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    eventTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    eventMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
      gap: spacing.xs,
    },
    eventMetaText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    parentNoteContainer: {
      backgroundColor: '#E3F2FD',
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    parentNoteLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.primary,
      marginBottom: spacing.xs,
    },
    parentNoteText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    eventActions: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    viewDetailsButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    viewDetailsButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.primary,
    },
    manageButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
    },
    manageButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing.xxl,
    },
    emptyIcon: {
      marginBottom: spacing.md,
    },
    emptyTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    emptySubtitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background.primary,
      width: '80%',
      maxHeight: '60%',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.lg,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
      textAlign: 'center',
    },
    monthItem: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    monthItemActive: {
      backgroundColor: colors.background.tertiary,
    },
    monthItemText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      textAlign: 'center',
    },
    monthItemTextActive: {
      color: colors.primary,
      fontFamily: typography.fontFamily.bold,
    },
  });

  const renderEventCard = ({ item }: { item: EventWithCounts }) => {
    const participantCount = item.registered_count || 0;
    const capacity = item.capacity || null;
    const participantText = capacity ? `${participantCount}/${capacity}` : `${participantCount}`;

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventCardHeader}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{t(`school.events.${item.category}`)}</Text>
          </View>
          <View style={styles.participantCount}>
            <MaterialIcons name="people" size={16} color={colors.text.secondary} />
            <Text style={styles.participantCountText}>{participantText}</Text>
          </View>
        </View>

        <Text style={styles.eventTitle}>{item.title}</Text>

        <View style={styles.eventMetaRow}>
          <MaterialIcons name="event" size={16} color={colors.text.secondary} />
          <Text style={styles.eventMetaText}>{formatEventDate(item.starts_at)}</Text>
        </View>

        <View style={styles.eventMetaRow}>
          <MaterialIcons name="access-time" size={16} color={colors.text.secondary} />
          <Text style={styles.eventMetaText}>
            {formatEventTime(item.starts_at, item.ends_at)}
          </Text>
        </View>

        {item.location && (
          <View style={styles.eventMetaRow}>
            <MaterialIcons name="place" size={16} color={colors.text.secondary} />
            <Text style={styles.eventMetaText}>{item.location}</Text>
          </View>
        )}

        {item.parent_note && (
          <View style={styles.parentNoteContainer}>
            <Text style={styles.parentNoteLabel}>{t('school.events.noteForParents')}</Text>
            <Text style={styles.parentNoteText}>{item.parent_note}</Text>
          </View>
        )}

        <View style={styles.eventActions}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.viewDetailsButtonText}>{t('school.events.viewDetails')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.manageButton} onPress={() => handleManage(item)}>
            <Text style={styles.manageButtonText}>{t('school.events.manage')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <DashboardHeader
        schoolName={currentSchool?.name || ''}
        onNotificationPress={() => {}}
      />

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle}>{t('school.events.title')}</Text>
              <Text style={styles.headerSubtitle}>{t('school.events.subtitle')}</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateEvent}>
              <MaterialIcons name="add" size={20} color={colors.white} />
              <Text style={styles.createButtonText}>{t('school.events.createEvent')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={styles.summaryValue}>{kpis.totalEvents}</Text>
            <Text style={styles.summaryLabel}>{t('school.events.totalEvents')}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardYellow]}>
            <Text style={styles.summaryValue}>{kpis.upcoming}</Text>
            <Text style={styles.summaryLabel}>{t('school.events.upcoming')}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryValue}>{kpis.completed}</Text>
            <Text style={styles.summaryLabel}>{t('school.events.completed')}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPurple]}>
            <Text style={styles.summaryValue}>{kpis.totalParticipants}</Text>
            <Text style={styles.summaryLabel}>{t('school.events.totalParticipants')}</Text>
          </View>
        </View>

        {/* Category Filters */}
        <View style={styles.categorySection}>
          <Text style={styles.categoryLabel}>{t('school.events.category')}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryChips}
          >
            {CATEGORIES.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <TouchableOpacity
                  key={category}
                  style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      isActive && styles.categoryChipTextActive,
                    ]}
                  >
                    {category === 'All Events'
                      ? t('school.events.allEvents')
                      : t(`school.events.${category}`)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Search and Month Filters */}
        <View style={styles.filtersRow}>
          <View style={styles.searchContainer}>
            <MaterialIcons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('school.events.search')}
              placeholderTextColor={colors.text.light}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.monthPicker}
            onPress={() => setShowMonthPicker(true)}
          >
            <MaterialIcons name="calendar-today" size={16} color={colors.text.secondary} />
            <Text style={styles.monthPickerText}>{selectedMonth}</Text>
            <MaterialIcons name="arrow-drop-down" size={16} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Events List */}
        {loading ? (
          <View style={styles.emptyContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialIcons
              name="event-busy"
              size={48}
              color={colors.text.light}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyTitle}>{t('school.events.noEvents')}</Text>
            <Text style={styles.emptySubtitle}>{t('school.events.noEventsSubtitle')}</Text>
          </View>
        ) : (
          <FlatList
            data={events}
            renderItem={renderEventCard}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ListFooterComponent={<View style={{ height: spacing.xl }} />}
          />
        )}
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <TouchableWithoutFeedback onPress={() => setShowMonthPicker(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>{t('school.events.selectMonth')}</Text>
                {loadingMonths ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <FlatList
                    data={availableMonths}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={[
                          styles.monthItem,
                          selectedMonth === item && styles.monthItemActive,
                        ]}
                        onPress={() => {
                          setSelectedMonth(item);
                          setShowMonthPicker(false);
                        }}
                      >
                        <Text
                          style={[
                            styles.monthItemText,
                            selectedMonth === item && styles.monthItemTextActive,
                          ]}
                        >
                          {item}
                        </Text>
                      </TouchableOpacity>
                    )}
                    showsVerticalScrollIndicator={false}
                  />
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </SafeAreaView>
  );
};

export default AdminEventsScreen;

