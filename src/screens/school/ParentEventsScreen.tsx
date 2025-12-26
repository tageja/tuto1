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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DashboardHeader } from '../../components/school/DashboardHeader';
import { ChildSelectorBottomSheet } from '../../components/school/ChildSelectorBottomSheet';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useParentEvents, useParentChildren } from '../../hooks/useEventsData';
import { 
  formatEventDate, 
  formatEventTime,
  registerForEvent,
  unregisterFromEvent,
  isEventUpcoming,
} from '../../services/school/events';
import { getCurrentUser, supabase } from '../../config/supabase';
import type { EventStatusTab, EventWithCounts, Child } from '../../types/school/events';

const STATUS_TABS: EventStatusTab[] = ['All', 'Registered', 'Upcoming'];

const ParentEventsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [selectedStatusTab, setSelectedStatusTab] = useState<EventStatusTab>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  );
  const [refreshing, setRefreshing] = useState(false);
  const [childPickerVisible, setChildPickerVisible] = useState(false);
  const [registeringEventId, setRegisteringEventId] = useState<string | null>(null);

  // Load children
  const { children, loading: loadingChildren } = useParentChildren(
    currentSchool?.id || currentSchool?.name || null
  );

  // Set first child as default when children load
  React.useEffect(() => {
    if (children.length > 0 && !selectedChild) {
      setSelectedChild(children[0]);
    }
  }, [children, selectedChild]);

  const filters = useMemo(
    () => ({
      category: 'All Events',
      month: selectedMonth,
      search: searchQuery,
      statusTab: selectedStatusTab,
    }),
    [selectedMonth, searchQuery, selectedStatusTab]
  );

  const { events, kpis, loading, isRegistered, refetch } = useParentEvents(
    currentSchool?.id || currentSchool?.name || null,
    selectedChild?.id || null,
    filters
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleViewDetails = (event: EventWithCounts) => {
    navigation.navigate('SchoolEventDetail', { 
      event,
      childId: selectedChild?.id,
      childName: selectedChild ? `${selectedChild.first_name} ${selectedChild.last_name}` : undefined,
      isRegistered: isRegistered(event.id),
      isParent: true,
    });
  };

  const handleRegister = useCallback(async (eventId: string) => {
    if (!selectedChild || !currentSchool) {
      Alert.alert(t('common.error'), t('school.events.selectChildFirst'));
      return;
    }

    try {
      setRegisteringEventId(eventId);
      
      const authUser = await getCurrentUser();
      if (!authUser) {
        Alert.alert(t('common.error'), t('common.notAuthenticated'));
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUser.id)
        .single();

      if (!userData) {
        Alert.alert(t('common.error'), t('common.userNotFound'));
        return;
      }

      const schoolId = currentSchool.id || currentSchool.name;
      const childName = `${selectedChild.first_name} ${selectedChild.last_name}`;

      await registerForEvent(eventId, selectedChild.id, userData.id, schoolId);
      Alert.alert(
        t('common.success'),
        t('school.events.registrationSuccess', { childName })
      );
      await refetch(); // Refresh to update registration status
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(t('common.error'), t('school.events.registrationError'));
    } finally {
      setRegisteringEventId(null);
    }
  }, [selectedChild, currentSchool, t, refetch]);

  const handleUnregister = useCallback(async (eventId: string) => {
    if (!selectedChild) return;

    const childName = `${selectedChild.first_name} ${selectedChild.last_name}`;

    Alert.alert(
      t('school.events.confirmUnregister'),
      t('school.events.confirmUnregisterMessage', { childName }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('school.events.unregister'),
          style: 'destructive',
          onPress: async () => {
            try {
              setRegisteringEventId(eventId);
              await unregisterFromEvent(eventId, selectedChild.id);
              Alert.alert(t('common.success'), t('school.events.unregistrationSuccess'));
              await refetch(); // Refresh to update registration status
            } catch (error) {
              console.error('Unregistration error:', error);
              Alert.alert(t('common.error'), t('school.events.unregistrationError'));
            } finally {
              setRegisteringEventId(null);
            }
          },
        },
      ]
    );
  }, [selectedChild, t, refetch]);

  const childDisplayName = selectedChild
    ? `${selectedChild.first_name} ${selectedChild.last_name}`
    : '';

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
    childSelector: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.secondary,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    childSelectorText: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.primary,
    },
    summaryContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    summaryCard: {
      flex: 1,
      minWidth: '30%',
      backgroundColor: colors.background.primary,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
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
    summaryValue: {
      fontSize: typography.fontSize.xxl,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    statusSection: {
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    statusLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.sm,
    },
    statusTabs: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    statusTab: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.background.primary,
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
    participantCountRegistered: {
      color: colors.status.success,
    },
    registeredBadge: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.status.success,
      marginLeft: spacing.xs,
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
    viewDetailsButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    viewDetailsButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.primary,
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
    cardButtonsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    registerButton: {
      flex: 1,
      backgroundColor: colors.primary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: spacing.xs,
    },
    registerButtonDisabled: {
      backgroundColor: colors.text.light,
    },
    unregisterButton: {
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.status.error,
    },
    registerButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
    },
    unregisterButtonText: {
      color: colors.status.error,
    },
  });

  const renderEventCard = ({ item }: { item: EventWithCounts }) => {
    const participantCount = item.registered_count || 0;
    const capacity = item.capacity || null;
    const registered = isRegistered(item.id);
    const participantText = capacity ? `${participantCount}/${capacity}` : `${participantCount}`;
    const isUpcoming = isEventUpcoming(item);

    return (
      <View style={styles.eventCard}>
        <View style={styles.eventCardHeader}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{t(`school.events.${item.category}`)}</Text>
          </View>
          <View style={styles.participantCount}>
            <MaterialIcons name="people" size={16} color={colors.text.secondary} />
            <Text
              style={[
                styles.participantCountText,
                registered && styles.participantCountRegistered,
              ]}
            >
              {participantText}
            </Text>
            {registered && (
              <Text style={styles.registeredBadge}>({t('school.events.registered')})</Text>
            )}
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

        <View style={styles.cardButtonsRow}>
          <TouchableOpacity
            style={styles.viewDetailsButton}
            onPress={() => handleViewDetails(item)}
          >
            <Text style={styles.viewDetailsButtonText}>{t('school.events.viewDetails')}</Text>
          </TouchableOpacity>

          {/* Only show register/unregister for upcoming events */}
          {isUpcoming && (
            registered ? (
              <TouchableOpacity
                style={[styles.registerButton, styles.unregisterButton]}
                onPress={() => handleUnregister(item.id)}
                disabled={registeringEventId === item.id}
              >
                {registeringEventId === item.id ? (
                  <ActivityIndicator size="small" color={colors.status.error} />
                ) : (
                  <>
                    <MaterialIcons name="cancel" size={16} color={colors.status.error} />
                    <Text style={[styles.registerButtonText, styles.unregisterButtonText]}>
                      {t('school.events.unregister')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.registerButton,
                  item.is_full && styles.registerButtonDisabled,
                ]}
                onPress={() => handleRegister(item.id)}
                disabled={registeringEventId === item.id || item.is_full}
              >
                {registeringEventId === item.id ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : (
                  <>
                    <MaterialIcons name="how-to-reg" size={16} color={colors.white} />
                    <Text style={styles.registerButtonText}>
                      {item.is_full 
                        ? t('school.events.eventFull') 
                        : t('school.events.registerNow')}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )
          )}
        </View>
      </View>
    );
  };

  if (loadingChildren) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DashboardHeader
          schoolName={currentSchool?.name || ''}
          onNotificationPress={() => {}}
        />
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (children.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <DashboardHeader
          schoolName={currentSchool?.name || ''}
          onNotificationPress={() => {}}
        />
        <View style={styles.emptyContainer}>
          <MaterialIcons
            name="child-care"
            size={48}
            color={colors.text.light}
            style={styles.emptyIcon}
          />
          {/* Changed text to indicate loading/no children found state more accurately */}
          <Text style={styles.emptyTitle}>{t('school.medicine.parent.noChildren')}</Text>
          <Text style={styles.emptySubtitle}>
            {t('school.medicine.parent.loadError')}
          </Text>
          {/* Added retry button */}
          <TouchableOpacity 
            style={[styles.viewDetailsButton, { paddingHorizontal: spacing.xl, marginTop: spacing.lg }]} 
            onPress={onRefresh}
          >
            <Text style={styles.viewDetailsButtonText}>{t('common.retry') || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

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
              <Text style={styles.headerSubtitle}>
                {t('school.events.subtitleParent')} {childDisplayName}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.childSelector}
            onPress={() => setChildPickerVisible(true)}
          >
            <Text style={styles.childSelectorText}>
              {selectedChild
                ? `${childDisplayName} - ${selectedChild.class_name || 'No Class'}`
                : t('school.events.selectChild')}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
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
        </View>

        {/* Status Tabs */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>{t('school.events.status')}</Text>
          <View style={styles.statusTabs}>
            {STATUS_TABS.map((tab) => {
              const isActive = selectedStatusTab === tab;
              return (
                <TouchableOpacity
                  key={tab}
                  style={[styles.statusTab, isActive && styles.statusTabActive]}
                  onPress={() => setSelectedStatusTab(tab)}
                >
                  <Text
                    style={[styles.statusTabText, isActive && styles.statusTabTextActive]}
                  >
                    {tab === 'All'
                      ? t('school.events.allEvents')
                      : tab === 'Registered'
                      ? t('school.events.registered')
                      : t('school.events.upcoming')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
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
          <TouchableOpacity style={styles.monthPicker}>
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

        {/* Child Picker - Reusing ChildSelectorBottomSheet */}
        <ChildSelectorBottomSheet
          visible={childPickerVisible}
          onClose={() => setChildPickerVisible(false)}
          children={children.map(c => ({
            id: c.id,
            firstName: c.first_name,
            lastName: c.last_name,
            className: c.class_name || undefined,
          }))}
          selectedId={selectedChild?.id || null}
          onSelect={(childId) => {
            const child = children.find(c => c.id === childId);
            if (child) {
              setSelectedChild(child);
            }
            setChildPickerVisible(false);
          }}
        />
    </SafeAreaView>
  );
};

export default ParentEventsScreen;

