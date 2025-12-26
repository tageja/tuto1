/**
 * Parent Attendance Screen
 * Displays attendance records for selected child with calendar, history, and summary
 * UI matches Figma design exactly
 */

import React, { useCallback, useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Calendar } from 'react-native-calendars';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { darkColors } from '../../theme';
import SchoolHeader from '../../components/common/SchoolHeader';
import { ChildSelectorBottomSheet } from '../../components/school/ChildSelectorBottomSheet';
import {
  fetchParentChildren,
  fetchAttendanceKPIs,
  fetchAttendanceRange,
  calculateDateRange,
  getAttendanceStatusColor,
  type Child,
  type AttendanceRecord,
  type AttendanceKPIs,
  type TimeRange,
} from '../../services/school/attendance';

const { width } = Dimensions.get('window');

// Student Avatar Component with fallback to initials
const StudentAvatar: React.FC<{
  avatarUrl: string | null | undefined;
  firstName: string;
  lastName: string;
  size?: number;
}> = ({ avatarUrl, firstName, lastName, size = 40 }) => {
  const { colors } = useTheme();
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

  if (avatarUrl) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
        }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: `${colors.primary}20`,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Text
        style={{
          fontSize: size * 0.4,
          fontWeight: '600',
          color: colors.primary,
        }}
      >
        {initials || '?'}
      </Text>
    </View>
  );
};

const ParentAttendanceScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [childPickerVisible, setChildPickerVisible] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [kpis, setKpis] = useState<AttendanceKPIs>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    rate: 0,
  });
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  const isDark = colors.background.primary === darkColors.background.primary;

  // Summary card colors (left border style - matching Figma)
  const summaryColors = {
    present: '#4CAF50',
    absent: '#F44336',
    late: '#FF9800',
    excused: '#2196F3',
    rate: '#2196F3',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    syncPill: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      marginHorizontal: spacing.md,
      marginTop: spacing.sm,
      marginBottom: spacing.md,
    },
    syncPillText: {
      fontSize: typography.fontSize.xs,
      color: colors.white,
      marginLeft: spacing.xs,
      fontFamily: typography.fontFamily.medium,
    },
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    cardTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
      fontFamily: typography.fontFamily.semiBold,
    },
    selectChildRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
    },
    childInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    childName: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
      marginLeft: spacing.md,
      fontFamily: typography.fontFamily.medium,
    },
    timeRangeRow: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    timeRangeButton: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    timeRangeButtonActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    timeRangeButtonText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.medium,
    },
    timeRangeButtonTextActive: {
      color: colors.white,
    },
    // Summary cards with colored LEFT BORDER (matching Figma)
    summaryCardsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.sm,
    },
    summaryCard: {
      width: (width - spacing.md * 3 - spacing.sm) / 2,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    summaryCardFull: {
      width: width - spacing.md * 2,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    summaryCardLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      marginBottom: spacing.xs,
      fontFamily: typography.fontFamily.semiBold,
    },
    summaryCardValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.bold,
    },
    summaryCardPeriod: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      fontFamily: typography.fontFamily.regular,
    },
    // Calendar
    calendarCard: {
      marginBottom: spacing.md,
    },
    legendRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: spacing.xs,
    },
    legendText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    // History items
    historyItem: {
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    historyItemLast: {
      borderBottomWidth: 0,
    },
    historyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    historyDate: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    historyStatusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.full,
      marginLeft: spacing.sm,
    },
    historyStatusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      fontFamily: typography.fontFamily.medium,
    },
    historyMeta: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    // Attendance Summary (blue background card)
    attendanceSummaryCard: {
      backgroundColor: isDark ? '#1565C0' : '#E3F2FD',
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    attendanceSummaryTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '700',
      color: isDark ? colors.white : '#1565C0',
      marginBottom: spacing.sm,
      fontFamily: typography.fontFamily.bold,
    },
    attendanceSummaryText: {
      fontSize: typography.fontSize.sm,
      color: isDark ? colors.white : '#1565C0',
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
    },
    lastUpdated: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      textAlign: 'center',
      marginVertical: spacing.md,
      fontFamily: typography.fontFamily.regular,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.md,
      fontFamily: typography.fontFamily.regular,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const selectedChild = children.find((c) => c.id === selectedChildId);

  const loadChildren = useCallback(async () => {
    if (!currentSchool?.id) return;
    try {
      const childrenList = await fetchParentChildren(currentSchool.id);
      setChildren(childrenList);
      if (childrenList.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenList[0].id);
      }
    } catch (error) {
      console.error('Error loading children:', error);
    }
  }, [currentSchool?.id, selectedChildId]);

  const loadData = useCallback(async () => {
    if (!currentSchool?.id || !selectedChildId) return;
    try {
      setLoading(true);
      const [startDate, endDate] = calculateDateRange(timeRange);

      const [kpisData, recordsData] = await Promise.all([
        fetchAttendanceKPIs(currentSchool.id, startDate, endDate, null, selectedChildId),
        fetchAttendanceRange(currentSchool.id, startDate, endDate, null, selectedChildId),
      ]);

      setKpis(kpisData);
      setRecords(recordsData);
      setLastSync(new Date());
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, selectedChildId, timeRange]);

  useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  useEffect(() => {
    if (selectedChildId) {
      loadData();
    }
  }, [loadData, selectedChildId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  // Calendar marked dates
  const markedDates = useMemo(() => {
    const marked: any = {};
    records.forEach((record) => {
      const statusColor = getAttendanceStatusColor(record.status);
      marked[record.date] = {
        marked: true,
        dotColor: statusColor,
        selected: record.date === selectedDate,
        selectedColor: colors.primary,
      };
    });
    if (selectedDate && !marked[selectedDate]) {
      marked[selectedDate] = { selected: true, selectedColor: colors.primary };
    }
    return marked;
  }, [records, selectedDate, colors.primary]);

  // History sorted by date (most recent first)
  const sortedHistory = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  // Attendance summary text
  const attendanceSummaryText = useMemo(() => {
    if (!selectedChild) return '';
    const absenceRate = kpis.total > 0 ? ((kpis.absent / kpis.total) * 100).toFixed(0) : '0';
    const name = `${selectedChild.firstName} ${selectedChild.lastName}`.trim();

    let template = '';
    if (parseFloat(absenceRate) === 0) {
      template = t('school.attendance.summaryPerfect');
    } else if (parseFloat(absenceRate) < 10) {
      template = t('school.attendance.summaryGood');
    } else {
      template = t('school.attendance.summaryNeedsImprovement');
    }

    return template.replace('{name}', name).replace('{rate}', absenceRate);
  }, [selectedChild, kpis, t]);

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getTimeRangeLabel = (range: TimeRange): string => {
    const map: Record<TimeRange, string> = {
      week: t('school.attendance.week'),
      '1m': '1M',
      '3m': '3M',
      '6m': '6M',
      full: t('school.attendance.full'),
    };
    return map[range] || range;
  };

  const getStatusPillStyle = (status: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      present: { bg: isDark ? '#1B5E20' : '#E8F5E9', text: isDark ? '#81C784' : '#2E7D32' },
      absent: { bg: isDark ? '#B71C1C' : '#FFEBEE', text: isDark ? '#EF5350' : '#C62828' },
      late: { bg: isDark ? '#E65100' : '#FFF3E0', text: isDark ? '#FFB74D' : '#EF6C00' },
      excused: { bg: isDark ? '#0D47A1' : '#E3F2FD', text: isDark ? '#64B5F6' : '#1565C0' },
    };
    return colorMap[status] || colorMap.present;
  };

  const minutesAgo = Math.floor((Date.now() - lastSync.getTime()) / 60000);

  if (!currentSchool) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>{t('school.dashboard.noSchool')}</Text>
        </View>
      </View>
    );
  }

  if (loading && records.length === 0) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Sync Status Pill */}
        <View style={styles.syncPill}>
          <MaterialIcons name="sync" size={14} color={colors.white} />
          <Text style={styles.syncPillText}>
            {t('common.synced')} {minutesAgo} {t('feed.minutes')} {t('feed.ago')}
          </Text>
        </View>

        {/* Select Child Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('school.attendance.selectChild')}</Text>
          <TouchableOpacity
            style={styles.selectChildRow}
            onPress={() => setChildPickerVisible(true)}
          >
            <View style={styles.childInfo}>
              {selectedChild && (
                <StudentAvatar
                  avatarUrl={selectedChild.photoUrl}
                  firstName={selectedChild.firstName}
                  lastName={selectedChild.lastName}
                  size={32}
                />
              )}
              <Text style={styles.childName}>
                {selectedChild
                  ? `${selectedChild.firstName} ${selectedChild.lastName}`
                  : t('school.attendance.selectChild')}
              </Text>
            </View>
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        {/* Time Range Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('school.attendance.timeRange')}</Text>
          <View style={styles.timeRangeRow}>
            {(['week', '1m', '3m', '6m', 'full'] as TimeRange[]).map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  timeRange === range && styles.timeRangeButtonActive,
                ]}
                onPress={() => setTimeRange(range)}
              >
                <Text
                  style={[
                    styles.timeRangeButtonText,
                    timeRange === range && styles.timeRangeButtonTextActive,
                  ]}
                >
                  {getTimeRangeLabel(range)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Summary Cards - 2x2 grid with colored left border */}
        <View style={styles.summaryCardsGrid}>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.present }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.present }]}>
              {t('school.attendance.present')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.present}</Text>
            <Text style={styles.summaryCardPeriod}>{t('school.attendance.thisPeriod')}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.absent }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.absent }]}>
              {t('school.attendance.absent')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.absent}</Text>
            <Text style={styles.summaryCardPeriod}>{t('school.attendance.thisPeriod')}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.late }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.late }]}>
              {t('school.attendance.late')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.late}</Text>
            <Text style={styles.summaryCardPeriod}>{t('school.attendance.thisPeriod')}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.excused }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.excused }]}>
              {t('school.attendance.excused')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.excused}</Text>
            <Text style={styles.summaryCardPeriod}>{t('school.attendance.thisPeriod')}</Text>
          </View>
        </View>

        {/* Attendance Rate - Full width card */}
        <View
          style={[
            styles.summaryCard,
            styles.summaryCardFull,
            { borderLeftColor: summaryColors.rate },
          ]}
        >
          <Text style={[styles.summaryCardLabel, { color: summaryColors.rate }]}>
            {t('school.attendance.attendanceRate')}
          </Text>
          <Text style={styles.summaryCardValue}>{kpis.rate}%</Text>
          <Text style={styles.summaryCardPeriod}>{t('school.attendance.thisPeriod')}</Text>
        </View>

        {/* Calendar */}
        <View style={[styles.card, styles.calendarCard]}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: colors.background.primary,
              calendarBackground: colors.background.primary,
              textSectionTitleColor: colors.text.secondary,
              selectedDayBackgroundColor: colors.primary,
              selectedDayTextColor: colors.white,
              todayTextColor: colors.primary,
              dayTextColor: colors.text.primary,
              textDisabledColor: colors.text.light,
              dotColor: colors.primary,
              selectedDotColor: colors.white,
              arrowColor: colors.primary,
              monthTextColor: colors.text.primary,
              textDayFontFamily: typography.fontFamily.regular,
              textMonthFontFamily: typography.fontFamily.semiBold,
              textDayHeaderFontFamily: typography.fontFamily.medium,
            }}
          />
          <View style={styles.legendRow}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: getAttendanceStatusColor('present') }]}
              />
              <Text style={styles.legendText}>{t('school.attendance.present')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: getAttendanceStatusColor('absent') }]}
              />
              <Text style={styles.legendText}>{t('school.attendance.absent')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: getAttendanceStatusColor('late') }]}
              />
              <Text style={styles.legendText}>{t('school.attendance.late')}</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: getAttendanceStatusColor('excused') }]}
              />
              <Text style={styles.legendText}>{t('school.attendance.excused')}</Text>
            </View>
          </View>
        </View>

        {/* Attendance History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('school.attendance.attendanceHistory')}</Text>
          {sortedHistory.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color={colors.text.light} />
              <Text style={styles.emptyText}>{t('school.attendance.noRecords')}</Text>
            </View>
          ) : (
            sortedHistory.slice(0, 10).map((record, index) => {
              const date = new Date(record.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayMonth = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
              const statusStyle = getStatusPillStyle(record.status);

              return (
                <View
                  key={record.id}
                  style={[
                    styles.historyItem,
                    index === Math.min(sortedHistory.length - 1, 9) && styles.historyItemLast,
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {dayName}, {dayMonth}
                    </Text>
                    <View
                      style={[styles.historyStatusPill, { backgroundColor: statusStyle.bg }]}
                    >
                      <Text style={[styles.historyStatusText, { color: statusStyle.text }]}>
                        {t(`school.attendance.${record.status}`)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.historyMeta}>
                    {selectedChild?.className || 'Class'}
                    {record.check_in_time && record.check_out_time
                      ? `  ${record.check_in_time} - ${record.check_out_time}`
                      : ''}
                  </Text>
                </View>
              );
            })
          )}
        </View>

        {/* Attendance Summary - Blue background card */}
        {attendanceSummaryText && (
          <View style={styles.attendanceSummaryCard}>
            <Text style={styles.attendanceSummaryTitle}>
              {t('school.attendance.attendanceSummary')}
            </Text>
            <Text style={styles.attendanceSummaryText}>{attendanceSummaryText}</Text>
          </View>
        )}

        {/* Last Updated */}
        <Text style={styles.lastUpdated}>
          {t('school.attendance.lastUpdated')}: {formatTime(lastSync)}
        </Text>
      </ScrollView>

      {/* Child Selector Bottom Sheet */}
      <ChildSelectorBottomSheet
        children={children}
        selectedId={selectedChildId}
        visible={childPickerVisible}
        onSelect={setSelectedChildId}
        onClose={() => setChildPickerVisible(false)}
      />
    </View>
  );
};

export default ParentAttendanceScreen;
