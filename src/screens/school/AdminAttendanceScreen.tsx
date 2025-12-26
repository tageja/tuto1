/**
 * Admin Attendance Screen
 * Displays attendance records for all students with filters, summaries, and student list
 * UI matches Figma design exactly
 */

import React, { useCallback, useEffect, useState } from 'react';
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
  Modal,
  FlatList,
  Pressable,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { darkColors } from '../../theme';
import SchoolHeader from '../../components/common/SchoolHeader';
import {
  fetchClassesForSchool,
  fetchStudentsForSchool,
  fetchAttendanceKPIs,
  buildStudentAttendanceSummaries,
  calculateDateRange,
  getAttendanceStatusColor,
  type ClassOption,
  type StudentOption,
  type AttendanceKPIs,
  type StudentAttendanceSummary,
  type TimeRange,
  type AttendanceStatus,
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

// Weekday Status Row Component
const WeekdayStatusRow: React.FC<{
  weekStatus: { [date: string]: AttendanceStatus | null };
  weekStart: Date;
  weekEnd: Date;
}> = ({ weekStatus, weekEnd }) => {
  const { colors, typography, spacing } = useTheme();
  const isDark = colors.background.primary === darkColors.background.primary;

  // Calculate display week (Monday-Friday of the week containing weekEnd)
  const displayEnd = new Date(weekEnd);
  const currentMonday = new Date(displayEnd);
  const diff = displayEnd.getDay() === 0 ? 6 : displayEnd.getDay() - 1;
  currentMonday.setDate(displayEnd.getDate() - diff);

  const weekdays: { label: string; date: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    weekdays.push({
      label: ['M', 'T', 'W', 'T', 'F'][i],
      date: d.toISOString().split('T')[0],
    });
  }

  const getStatusColor = (status: AttendanceStatus | null): string => {
    if (!status) return isDark ? '#444444' : '#E0E0E0';
    return getAttendanceStatusColor(status);
  };

  const getStatusLabel = (status: AttendanceStatus | null): string => {
    if (!status) return '';
    return status.charAt(0).toUpperCase();
  };

  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, alignItems: 'center' }}>
      {weekdays.map((day, index) => {
        const status = weekStatus[day.date];
        const color = getStatusColor(status);
        const label = getStatusLabel(status);
        const isFuture = new Date(day.date) > new Date();

        return (
          <View key={index} style={{ alignItems: 'center', opacity: isFuture ? 0.3 : 1 }}>
            <Text
              style={{
                fontSize: typography.fontSize.xs,
                color: colors.text.secondary,
                marginBottom: 4,
                fontFamily: typography.fontFamily.medium,
              }}
            >
              {day.label}
            </Text>
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: status ? color : (isDark ? '#333' : '#F0F0F0'),
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {label ? (
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: '700',
                    color: status ? colors.white : colors.text.light,
                  }}
                >
                  {label}
                </Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const AdminAttendanceScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [timeRange, setTimeRange] = useState<TimeRange>('6m');
  const [kpis, setKpis] = useState<AttendanceKPIs>({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    rate: 0,
  });
  const [studentSummaries, setStudentSummaries] = useState<StudentAttendanceSummary[]>([]);
  const [lastSync, setLastSync] = useState<Date>(new Date());
  const [classPickerVisible, setClassPickerVisible] = useState(false);
  const [studentPickerVisible, setStudentPickerVisible] = useState(false);

  const isDark = colors.background.primary === darkColors.background.primary;

  // Summary card colors (left border style)
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
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    cardHeaderIcons: {
      flexDirection: 'row',
      gap: spacing.sm,
    },
    filterLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
      fontFamily: typography.fontFamily.medium,
    },
    filterInput: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.secondary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    filterInputText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
      flex: 1,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.md,
    },
    filterColumn: {
      flex: 1,
    },
    timeRangeRow: {
      flexDirection: 'row',
      gap: spacing.xs,
      marginBottom: spacing.md,
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
    summaryCardsRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      borderLeftWidth: 4,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    summaryCardLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      marginBottom: spacing.xs,
      fontFamily: typography.fontFamily.semiBold,
    },
    summaryCardValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.bold,
    },
    // Student list
    studentCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    studentCardLast: {
      borderBottomWidth: 0,
    },
    studentInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    studentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.xs,
    },
    studentName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
      fontFamily: typography.fontFamily.semiBold,
    },
    studentAttendanceLabel: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    studentPercentage: {
      fontSize: typography.fontSize.lg,
      fontWeight: '700',
      color: colors.primary,
      fontFamily: typography.fontFamily.bold,
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
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      width: width * 0.85,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    modalItem: {
      padding: spacing.md,
      borderRadius: borderRadius.md,
      marginBottom: spacing.xs,
      backgroundColor: colors.background.secondary,
    },
    modalItemSelected: {
      backgroundColor: `${colors.primary}15`,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    modalItemText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      fontFamily: typography.fontFamily.regular,
    },
    modalItemTextSelected: {
      color: colors.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
  });

  const loadClasses = useCallback(async () => {
    if (!currentSchool?.id) return;
    try {
      const classesList = await fetchClassesForSchool(currentSchool.id);
      setClasses(classesList);
    } catch (error) {
      console.error('Error loading classes:', error);
    }
  }, [currentSchool?.id]);

  const loadStudents = useCallback(async () => {
    if (!currentSchool?.id) return;
    try {
      const studentsList = await fetchStudentsForSchool(currentSchool.id, selectedClassId || null);
      setStudents(studentsList);
    } catch (error) {
      console.error('Error loading students:', error);
    }
  }, [currentSchool?.id, selectedClassId]);

  const loadData = useCallback(async () => {
    if (!currentSchool?.id) return;
    try {
      setLoading(true);
      const [startDate, endDate] = calculateDateRange(timeRange, selectedDate);

      const kpisData = await fetchAttendanceKPIs(
        currentSchool.id,
        startDate,
        endDate,
        selectedClassId || null,
        selectedStudentId || null
      );
      setKpis(kpisData);

      // If a student is selected, only show that student
      let targetStudentIds: string[] = [];
      if (selectedStudentId) {
        targetStudentIds = [selectedStudentId];
      } else {
        targetStudentIds = students.map((s) => s.id);
      }

      if (targetStudentIds.length > 0) {
        const summaries = await buildStudentAttendanceSummaries(
          currentSchool.id,
          targetStudentIds,
          startDate,
          endDate
        );
        setStudentSummaries(summaries);
      } else {
        setStudentSummaries([]);
      }

      setLastSync(new Date());
    } catch (error) {
      console.error('Error loading attendance data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, selectedClassId, selectedStudentId, timeRange, selectedDate, students]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  useEffect(() => {
    if (currentSchool?.id) {
      loadData();
    }
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
    });
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

        {/* Filters Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('school.attendance.title')}</Text>
            <View style={styles.cardHeaderIcons}>
              <TouchableOpacity>
                <MaterialIcons name="filter-list" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity>
                <MaterialIcons name="file-download" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Date */}
          <Text style={styles.filterLabel}>{t('school.attendance.date')}</Text>
          <TouchableOpacity
            style={[styles.filterInput, { marginBottom: spacing.md }]}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
            <Text style={[styles.filterInputText, { marginLeft: spacing.sm }]}>
              {formatDate(selectedDate)}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
          </TouchableOpacity>

          {/* Range */}
          <Text style={styles.filterLabel}>{t('school.attendance.timeRange')}</Text>
          <View style={styles.timeRangeRow}>
            {(['week', '1m', '3m', '6m'] as TimeRange[]).map((range) => (
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

          {/* Class and Student - Side by Side */}
          <View style={styles.filterRow}>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>{t('school.attendance.class')}</Text>
              <TouchableOpacity
                style={styles.filterInput}
                onPress={() => setClassPickerVisible(true)}
              >
                <Text style={styles.filterInputText} numberOfLines={1}>
                  {selectedClass?.name || t('school.attendance.allClasses')}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
            <View style={styles.filterColumn}>
              <Text style={styles.filterLabel}>{t('school.attendance.student')}</Text>
              <TouchableOpacity
                style={styles.filterInput}
                onPress={() => setStudentPickerVisible(true)}
              >
                <Text style={styles.filterInputText} numberOfLines={1}>
                  {selectedStudent
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : t('school.attendance.allStudents')}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Summary Cards - with colored left border */}
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
        </View>

        {/* Student Attendance List */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{t('school.attendance.studentAttendance')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialIcons name="people" size={20} color={colors.text.secondary} />
              <Text
                style={{
                  fontSize: typography.fontSize.md,
                  color: colors.text.secondary,
                  marginLeft: spacing.xs,
                  fontFamily: typography.fontFamily.medium,
                }}
              >
                {studentSummaries.length}
              </Text>
            </View>
          </View>

          {loading && studentSummaries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : studentSummaries.length === 0 ? (
            <View style={styles.emptyContainer}>
              <MaterialIcons name="people-outline" size={48} color={colors.text.light} />
              <Text style={styles.emptyText}>{t('school.attendance.noStudents')}</Text>
            </View>
          ) : (
            studentSummaries.map((summary, index) => {
              const [startDate, endDate] = calculateDateRange(timeRange, selectedDate);
              // Find class name for this student
              const studentData = students.find((s) => s.id === summary.studentId);
              const studentClassName = studentData?.className;

              const handleStudentPress = () => {
                navigation.navigate('StudentAttendanceDetail', {
                  studentId: summary.studentId,
                  studentName: summary.studentName,
                  studentAvatar: summary.avatar,
                  className: studentClassName,
                });
              };

              return (
                <TouchableOpacity
                  key={summary.studentId}
                  style={[
                    styles.studentCard,
                    index === studentSummaries.length - 1 && styles.studentCardLast,
                  ]}
                  onPress={handleStudentPress}
                  activeOpacity={0.7}
                >
                  <StudentAvatar
                    avatarUrl={summary.avatar}
                    firstName={summary.studentName.split(' ')[0] || ''}
                    lastName={summary.studentName.split(' ').slice(1).join(' ') || ''}
                    size={44}
                  />
                  <View style={styles.studentInfo}>
                    <View style={styles.studentHeader}>
                      <View style={{ flex: 1, marginRight: spacing.sm }}>
                        <Text style={styles.studentName}>{summary.studentName}</Text>
                        <Text style={styles.studentAttendanceLabel}>
                          {t('school.attendance.attendance')}: {summary.attendanceRate}%
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text style={styles.studentPercentage}>{summary.attendanceRate}%</Text>
                        <MaterialIcons name="chevron-right" size={20} color={colors.text.light} style={{ marginLeft: spacing.xs }} />
                      </View>
                    </View>
                    <View style={{ marginTop: spacing.sm }}>
                      <WeekdayStatusRow
                        weekStatus={summary.weekStatus}
                        weekStart={startDate}
                        weekEnd={endDate}
                      />
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Date Picker Modal */}
      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) {
              setSelectedDate(date);
            }
          }}
        />
      )}

      {/* Class Picker Modal */}
      <Modal
        visible={classPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setClassPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setClassPickerVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('school.attendance.selectClass')}</Text>
              <TouchableOpacity onPress={() => setClassPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ id: null, name: t('school.attendance.allClasses') }, ...classes]}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => {
                const isSelected = selectedClassId === item.id;
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      setSelectedClassId(item.id);
                      setSelectedStudentId(null); // Reset student when class changes
                      setClassPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}
                    >
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Student Picker Modal */}
      <Modal
        visible={studentPickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setStudentPickerVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setStudentPickerVisible(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t('school.attendance.selectStudent')}</Text>
              <TouchableOpacity onPress={() => setStudentPickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={[{ id: null, firstName: '', lastName: '', className: undefined }, ...students]}
              keyExtractor={(item) => item.id || 'all'}
              renderItem={({ item }) => {
                const isSelected = selectedStudentId === item.id;
                const displayName = item.id
                  ? `${item.firstName} ${item.lastName}`
                  : t('school.attendance.allStudents');
                return (
                  <TouchableOpacity
                    style={[styles.modalItem, isSelected && styles.modalItemSelected]}
                    onPress={() => {
                      setSelectedStudentId(item.id);
                      setStudentPickerVisible(false);
                    }}
                  >
                    <Text
                      style={[styles.modalItemText, isSelected && styles.modalItemTextSelected]}
                    >
                      {displayName}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default AdminAttendanceScreen;
