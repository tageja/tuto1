/**
 * Student Attendance Detail Screen
 * Shows monthly calendar view with attendance records for a specific student
 * Calendar is navigatable to previous/next months
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { darkColors } from '../../theme';
import {
  fetchAttendanceRange,
  fetchAttendanceKPIs,
  getAttendanceStatusColor,
  type AttendanceRecord,
  type AttendanceKPIs,
} from '../../services/school/attendance';

const { width } = Dimensions.get('window');

type RouteParams = {
  StudentAttendanceDetail: {
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    className?: string;
  };
};

// Student Avatar Component with fallback to initials
const StudentAvatar: React.FC<{
  avatarUrl: string | null | undefined;
  firstName: string;
  lastName: string;
  size?: number;
}> = ({ avatarUrl, firstName, lastName, size = 60 }) => {
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

const StudentAttendanceDetailScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'StudentAttendanceDetail'>>();
  const { studentId, studentName, studentAvatar, className } = route.params;

  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [kpis, setKpis] = useState<AttendanceKPIs>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    rate: 0,
  });
  const [currentMonth, setCurrentMonth] = useState<string>(
    new Date().toISOString().split('T')[0].substring(0, 7) // YYYY-MM format
  );

  const isDark = colors.background.primary === darkColors.background.primary;

  // Summary card colors
  const summaryColors = {
    present: '#4CAF50',
    absent: '#F44336',
    late: '#FF9800',
    excused: '#2196F3',
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    header: {
      backgroundColor: colors.background.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      padding: spacing.xs,
      marginRight: spacing.sm,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    scrollContent: {
      paddingBottom: spacing.xl,
    },
    studentCard: {
      backgroundColor: colors.background.primary,
      padding: spacing.lg,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
      borderRadius: borderRadius.lg,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    studentInfo: {
      marginLeft: spacing.md,
      flex: 1,
    },
    studentName: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.bold,
    },
    studentClass: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      fontFamily: typography.fontFamily.regular,
    },
    studentRate: {
      alignItems: 'flex-end',
    },
    rateValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: typography.fontFamily.bold,
    },
    rateLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
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
    summaryCardsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginTop: spacing.md,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
      ...shadows.sm,
    },
    summaryCardLabel: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      marginBottom: spacing.xs,
      fontFamily: typography.fontFamily.medium,
    },
    summaryCardValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.bold,
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
      width: 10,
      height: 10,
      borderRadius: 5,
      marginRight: spacing.xs,
    },
    legendText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
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
      justifyContent: 'space-between',
    },
    historyDate: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    historyStatusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
    },
    historyStatusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      fontFamily: typography.fontFamily.medium,
    },
    historyMeta: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: spacing.xs,
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

  // Get start and end of current month
  const getMonthRange = (monthStr: string): [Date, Date] => {
    const [year, month] = monthStr.split('-').map(Number);
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0); // Last day of month
    return [startDate, endDate];
  };

  const loadData = useCallback(async () => {
    if (!currentSchool?.id || !studentId) return;
    try {
      setLoading(true);
      const [startDate, endDate] = getMonthRange(currentMonth);

      const [recordsData, kpisData] = await Promise.all([
        fetchAttendanceRange(currentSchool.id, startDate, endDate, null, studentId),
        fetchAttendanceKPIs(currentSchool.id, startDate, endDate, null, studentId),
      ]);

      setRecords(recordsData);
      setKpis(kpisData);
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, studentId, currentMonth]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        customStyles: {
          container: {
            backgroundColor: `${statusColor}20`,
            borderRadius: 8,
          },
          text: {
            color: statusColor,
            fontWeight: '600',
          },
        },
      };
    });
    return marked;
  }, [records]);

  // Records for current month sorted by date
  const monthRecords = useMemo(() => {
    return [...records].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [records]);

  const getStatusPillStyle = (status: string) => {
    const colorMap: Record<string, { bg: string; text: string }> = {
      present: { bg: isDark ? '#1B5E20' : '#E8F5E9', text: isDark ? '#81C784' : '#2E7D32' },
      absent: { bg: isDark ? '#B71C1C' : '#FFEBEE', text: isDark ? '#EF5350' : '#C62828' },
      late: { bg: isDark ? '#E65100' : '#FFF3E0', text: isDark ? '#FFB74D' : '#EF6C00' },
      excused: { bg: isDark ? '#0D47A1' : '#E3F2FD', text: isDark ? '#64B5F6' : '#1565C0' },
    };
    return colorMap[status] || colorMap.present;
  };

  const formatMonthYear = (monthStr: string): string => {
    const [year, month] = monthStr.split('-').map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const nameParts = studentName.split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('school.attendance.title')}</Text>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Student Info Card */}
        <View style={styles.studentCard}>
          <StudentAvatar
            avatarUrl={studentAvatar}
            firstName={firstName}
            lastName={lastName}
            size={64}
          />
          <View style={styles.studentInfo}>
            <Text style={styles.studentName}>{studentName}</Text>
            {className && <Text style={styles.studentClass}>{className}</Text>}
          </View>
          <View style={styles.studentRate}>
            <Text style={styles.rateValue}>{kpis.rate}%</Text>
            <Text style={styles.rateLabel}>{t('school.attendance.attendanceRate')}</Text>
          </View>
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryCardsRow}>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.present }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.present }]}>
              {t('school.attendance.present')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.present}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.absent }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.absent }]}>
              {t('school.attendance.absent')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.absent}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.late }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.late }]}>
              {t('school.attendance.late')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.late}</Text>
          </View>
          <View style={[styles.summaryCard, { borderLeftColor: summaryColors.excused }]}>
            <Text style={[styles.summaryCardLabel, { color: summaryColors.excused }]}>
              {t('school.attendance.excused')}
            </Text>
            <Text style={styles.summaryCardValue}>{kpis.excused}</Text>
          </View>
        </View>

        {/* Calendar Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{formatMonthYear(currentMonth)}</Text>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <Calendar
                current={`${currentMonth}-01`}
                onMonthChange={(month) => {
                  setCurrentMonth(`${month.year}-${String(month.month).padStart(2, '0')}`);
                }}
                markedDates={markedDates}
                markingType="custom"
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
                enableSwipeMonths
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
            </>
          )}
        </View>

        {/* Attendance History for Current Month */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('school.attendance.attendanceHistory')}</Text>
          {monthRecords.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="event-busy" size={48} color={colors.text.light} />
              <Text style={styles.emptyText}>{t('school.attendance.noRecords')}</Text>
            </View>
          ) : (
            monthRecords.map((record, index) => {
              const date = new Date(record.date);
              const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
              const dayMonth = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' });
              const statusStyle = getStatusPillStyle(record.status);

              return (
                <View
                  key={record.id}
                  style={[
                    styles.historyItem,
                    index === monthRecords.length - 1 && styles.historyItemLast,
                  ]}
                >
                  <View style={styles.historyHeader}>
                    <Text style={styles.historyDate}>
                      {dayName}, {dayMonth}
                    </Text>
                    <View style={[styles.historyStatusPill, { backgroundColor: statusStyle.bg }]}>
                      <Text style={[styles.historyStatusText, { color: statusStyle.text }]}>
                        {t(`school.attendance.${record.status}`)}
                      </Text>
                    </View>
                  </View>
                  {(record.check_in_time || record.check_out_time) && (
                    <Text style={styles.historyMeta}>
                      {record.check_in_time && record.check_out_time
                        ? `${record.check_in_time} - ${record.check_out_time}`
                        : record.check_in_time || record.check_out_time}
                    </Text>
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StudentAttendanceDetailScreen;


