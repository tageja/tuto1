/**
 * Admin Homework Screen
 * Full-featured homework management for school admins
 * Displays KPIs, filters, charts, and assignment list with create functionality
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
  TextInput,
  Alert,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import {
  fetchHomeworkStats,
  fetchHomeworkAssignments,
  fetchClassesForSchool,
  fetchSubjectsForSchool,
  fetchStudentsForSchool,
  isAssignmentOverdue,
  type HomeworkAssignment,
  type HomeworkStats,
  type HomeworkStatusTab,
  type TimeRange,
  type ClassOption,
  type SubjectOption,
  type StudentOption,
} from '../../services/school/homework';
import type { HomeworkFilters } from '../../types/school/homework';

const { width } = Dimensions.get('window');

// Simple Donut Chart Component (reused from parent screen)
const DonutChart: React.FC<{
  percentage: number;
  size?: number;
  strokeWidth?: number;
  colors: any;
}> = ({ percentage, size = 120, strokeWidth = 12, colors }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.border.light,
          position: 'absolute',
        }}
      />
      <View
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: colors.primary,
          borderLeftColor: 'transparent',
          borderBottomColor: percentage >= 50 ? colors.primary : 'transparent',
          transform: [{ rotate: '-90deg' }],
          position: 'absolute',
        }}
      />
      <Text
        style={{
          fontSize: 24,
          fontWeight: '700',
          color: colors.text.primary,
        }}
      >
        {percentage}%
      </Text>
    </View>
  );
};

const AdminHomeworkScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [stats, setStats] = useState<HomeworkStats>({
    total: 0,
    pending: 0,
    completed: 0,
    completionRate: 0,
  });
  const [classes, setClasses] = useState<ClassOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [students, setStudents] = useState<StudentOption[]>([]);
  const [statusTab, setStatusTab] = useState<HomeworkStatusTab>('all');
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [range, setRange] = useState<TimeRange>('week');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [classDropdownVisible, setClassDropdownVisible] = useState(false);
  const [subjectDropdownVisible, setSubjectDropdownVisible] = useState(false);
  const [studentDropdownVisible, setStudentDropdownVisible] = useState(false);
  const [rangeDropdownVisible, setRangeDropdownVisible] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerSection: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.md,
      paddingBottom: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    headerTextContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    screenTitle: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    screenSubtitle: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    createButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
    },
    syncBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: colors.background.tertiary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.md,
      marginTop: spacing.sm,
    },
    syncDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.status.success,
      marginRight: spacing.xs,
    },
    syncText: {
      fontSize: typography.fontSize.xs,
      color: colors.primary,
      fontWeight: '500',
    },
    filtersContainer: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    statusCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    statusTabs: {
      flexDirection: 'row',
      gap: spacing.xs,
    },
    statusTab: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
    },
    statusTabActive: {
      backgroundColor: colors.primary,
    },
    statusTabText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    statusTabTextActive: {
      color: colors.white,
    },
    filterRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    dateInput: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    dateInputText: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    dropdown: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 44,
    },
    dropdownText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginTop: spacing.sm,
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    dropdownModal: {
      position: 'absolute',
      top: 100,
      left: spacing.md,
      right: spacing.md,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      maxHeight: 200,
      zIndex: 1000,
      elevation: 5,
      ...shadows.md,
    },
    dropdownItem: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    dropdownItemText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    summaryCards: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    summaryCard: {
      width: (width - spacing.md * 3) / 2,
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    summaryCardBlue: {
      backgroundColor: '#E3F2FD',
      borderColor: '#BBDEFB',
    },
    summaryCardYellow: {
      backgroundColor: '#FFF9C4',
      borderColor: '#FFF59D',
    },
    summaryCardGreen: {
      backgroundColor: '#E8F5E9',
      borderColor: '#C8E6C9',
    },
    summaryCardPurple: {
      backgroundColor: '#F3E5F5',
      borderColor: '#E1BEE7',
    },
    summaryLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    summaryValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
    },
    lastUpdated: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.sm,
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
    },
    chartsContainer: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    chartCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    chartTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    chartContent: {
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    chartLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    legendDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    legendText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    assignmentsSection: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    assignmentCard: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    assignmentCardOverdue: {
      backgroundColor: '#FFEBEE',
      borderColor: '#EF5350',
    },
    assignmentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    subjectPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    },
    subjectPillText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.white,
    },
    statusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
      alignSelf: 'flex-start',
    },
    statusPillPending: {
      backgroundColor: '#FFE082',
    },
    statusPillCompleted: {
      backgroundColor: '#81C784',
    },
    statusPillText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.white,
    },
    assignmentTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    assignmentMeta: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    assignmentMetaOverdue: {
      color: colors.status.error,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    assignmentFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    progressBar: {
      flex: 1,
      height: 8,
      backgroundColor: colors.background.tertiary,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: borderRadius.full,
    },
    progressText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.primary,
      minWidth: 60,
    },
    viewButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    viewButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
    },
    emptyText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: spacing.md,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

  const loadData = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      setLoading(true);
      const filters: HomeworkFilters = {
        status: statusTab,
        baseDate,
        range,
        classId: selectedClassId || undefined,
        subject: selectedSubject || undefined,
        studentId: selectedStudentId || undefined,
        search: searchQuery || undefined,
      };

      const [statsData, assignmentsData] = await Promise.all([
        fetchHomeworkStats(currentSchool.id, filters),
        fetchHomeworkAssignments(currentSchool.id, filters),
      ]);

      setStats(statsData);
      setAssignments(assignmentsData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading homework data:', error);
      Alert.alert(t('common.error'), 'Failed to load homework data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, statusTab, baseDate, range, selectedClassId, selectedSubject, selectedStudentId, searchQuery, t]);

  const loadFilters = useCallback(async () => {
    if (!currentSchool?.id) return;

    try {
      const [classesData, subjectsData] = await Promise.all([
        fetchClassesForSchool(currentSchool.id),
        fetchSubjectsForSchool(currentSchool.id),
      ]);

      setClasses(classesData);
      setSubjects(subjectsData);

      if (selectedClassId) {
        const studentsData = await fetchStudentsForSchool(currentSchool.id, selectedClassId);
        setStudents(studentsData);
      } else {
        setStudents([]);
        setSelectedStudentId('');
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  }, [currentSchool?.id, selectedClassId]);

  useEffect(() => {
    loadFilters();
  }, [loadFilters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const handleCreateAssignment = useCallback(() => {
    navigation.navigate('SchoolCreateHomework');
  }, [navigation]);

  const handleViewAssignment = useCallback(
    (assignmentId: string) => {
      navigation.navigate('SchoolHomeworkDetail', { assignmentId });
    },
    [navigation]
  );

  const getSubjectColor = (subject: string): string => {
    const colors: Record<string, string> = {
      Mathematics: '#3B82F6',
      Science: '#10B981',
      English: '#8B5CF6',
      History: '#F59E0B',
      Geography: '#EC4899',
      Literature: '#EF4444',
    };
    return colors[subject] || colors.primary;
  };

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  // Show chart message if filters are too broad
  const shouldShowChartMessage = !selectedClassId && !selectedSubject;

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
        style={{ flex: 1 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.screenTitle}>{t('school.homework.title')}</Text>
              <Text style={styles.screenSubtitle}>{t('school.homework.manageAndTrack')}</Text>
            </View>
            <TouchableOpacity style={styles.createButton} onPress={handleCreateAssignment}>
              <MaterialIcons name="add" size={20} color={colors.white} />
              <Text style={styles.createButtonText}>{t('school.homework.createAssignment')}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>
              {t('common.synced')} 2 {t('feed.minutes')} {t('feed.ago')}
            </Text>
          </View>
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <View style={styles.statusCard}>
            <View style={styles.statusTabs}>
              {(['all', 'pending', 'completed'] as HomeworkStatusTab[]).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  style={[styles.statusTab, statusTab === tab && styles.statusTabActive]}
                  onPress={() => setStatusTab(tab)}
                >
                  <Text
                    style={[styles.statusTabText, statusTab === tab && styles.statusTabTextActive]}
                  >
                    {t(`school.homework.status.${tab}`)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.dateInput}>
              <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
              <Text style={styles.dateInputText}>{baseDate.toLocaleDateString()}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setRangeDropdownVisible(!rangeDropdownVisible)}
            >
              <Text style={styles.dropdownText}>{t(`school.homework.ranges.${range}`)}</Text>
              <MaterialIcons name={rangeDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {rangeDropdownVisible && (
              <View style={[styles.dropdownModal, { top: 200, zIndex: 2000 }]}>
                {(['week', '1m', '3m', '6m'] as TimeRange[]).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setRange(r);
                      setRangeDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{t(`school.homework.ranges.${r}`)}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <View style={styles.filterRow}>
            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setClassDropdownVisible(!classDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedClass ? selectedClass.name : t('school.homework.filters.allClasses')}
              </Text>
              <MaterialIcons name={classDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {classDropdownVisible && (
              <View style={[styles.dropdownModal, { top: 260, zIndex: 2000 }]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedClassId('');
                    setClassDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{t('school.homework.filters.allClasses')}</Text>
                </TouchableOpacity>
                {classes.map((cls) => (
                  <TouchableOpacity
                    key={cls.id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedClassId(cls.id);
                      setClassDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{cls.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            <TouchableOpacity
              style={styles.dropdown}
              onPress={() => setSubjectDropdownVisible(!subjectDropdownVisible)}
            >
              <Text style={styles.dropdownText}>
                {selectedSubject || t('school.homework.filters.allSubjects')}
              </Text>
              <MaterialIcons name={subjectDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
            </TouchableOpacity>
            {subjectDropdownVisible && (
              <View style={[styles.dropdownModal, { top: 260, left: width / 2, right: spacing.md, zIndex: 2000 }]}>
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedSubject('');
                    setSubjectDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>{t('school.homework.filters.allSubjects')}</Text>
                </TouchableOpacity>
                {subjects.map((subj) => (
                  <TouchableOpacity
                    key={subj.name}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedSubject(subj.name);
                      setSubjectDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{subj.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {selectedClassId && (
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={styles.dropdown}
                onPress={() => setStudentDropdownVisible(!studentDropdownVisible)}
              >
                <Text style={styles.dropdownText}>
                  {selectedStudent
                    ? `${selectedStudent.firstName} ${selectedStudent.lastName}`
                    : t('school.homework.filters.allStudents')}
                </Text>
                <MaterialIcons name={studentDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
              </TouchableOpacity>
              {studentDropdownVisible && (
                <View style={[styles.dropdownModal, { top: 320, zIndex: 2000 }]}>
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSelectedStudentId('');
                      setStudentDropdownVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{t('school.homework.filters.allStudents')}</Text>
                  </TouchableOpacity>
                  {students.map((student) => (
                    <TouchableOpacity
                      key={student.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setSelectedStudentId(student.id);
                        setStudentDropdownVisible(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>
                        {student.firstName} {student.lastName}
                        {student.className ? ` • ${student.className}` : ''}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('school.homework.filters.search')}
              placeholderTextColor={colors.text.secondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <>
            {/* Summary Cards */}
            <View style={styles.summaryCards}>
              <View style={[styles.summaryCard, styles.summaryCardBlue]}>
                <Text style={styles.summaryLabel}>{t('school.homework.kpis.total')}</Text>
                <Text style={styles.summaryValue}>{stats.total}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardYellow]}>
                <Text style={styles.summaryLabel}>{t('school.homework.kpis.pending')}</Text>
                <Text style={styles.summaryValue}>{stats.pending}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardGreen]}>
                <Text style={styles.summaryLabel}>{t('school.homework.kpis.completed')}</Text>
                <Text style={styles.summaryValue}>{stats.completed}</Text>
              </View>
              <View style={[styles.summaryCard, styles.summaryCardPurple]}>
                <Text style={styles.summaryLabel}>{t('school.homework.kpis.completionRate')}</Text>
                <Text style={styles.summaryValue}>{stats.completionRate}%</Text>
              </View>
            </View>

            <Text style={styles.lastUpdated}>
              {t('school.homework.kpis.lastUpdated')}: {formatTime(lastUpdated)}
            </Text>

            {/* Completion Rate Chart */}
            <View style={styles.chartsContainer}>
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>{t('school.homework.charts.completionRate')}</Text>
                {shouldShowChartMessage ? (
                  <View style={styles.chartContent}>
                    <Text style={styles.emptyText}>{t('school.homework.charts.selectClassOrSubject')}</Text>
                  </View>
                ) : (
                  <View style={styles.chartContent}>
                    <DonutChart percentage={stats.completionRate} colors={colors} />
                    <View style={styles.chartLegend}>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#81C784' }]} />
                        <Text style={styles.legendText}>{t('school.homework.charts.complete')}</Text>
                      </View>
                      <View style={styles.legendItem}>
                        <View style={[styles.legendDot, { backgroundColor: '#FFE082' }]} />
                        <Text style={styles.legendText}>{t('school.homework.status.pending')}</Text>
                      </View>
                    </View>
                  </View>
                )}
              </View>
            </View>

            {/* Assignments List */}
            <View style={styles.assignmentsSection}>
              <Text style={styles.sectionTitle}>{t('school.homework.list.title')}</Text>
              {assignments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="assignment" size={48} color={colors.text.secondary} />
                  <Text style={styles.emptyText}>{t('school.homework.list.noAssignments')}</Text>
                </View>
              ) : (
                assignments.map((assignment) => {
                  const overdue = isAssignmentOverdue(
                    assignment.due_date,
                    assignment.completed_submissions! < assignment.total_submissions!
                      ? 'pending'
                      : 'completed'
                  );
                  const completionRate = assignment.completion_rate || 0;

                  return (
                    <TouchableOpacity
                      key={assignment.id}
                      style={[styles.assignmentCard, overdue && styles.assignmentCardOverdue]}
                      onPress={() => handleViewAssignment(assignment.id)}
                    >
                      <View style={styles.assignmentHeader}>
                        <View
                          style={[
                            styles.subjectPill,
                            { backgroundColor: getSubjectColor(assignment.subject) },
                          ]}
                        >
                          <Text style={styles.subjectPillText}>{assignment.subject}</Text>
                        </View>
                        <View
                          style={[
                            styles.statusPill,
                            completionRate >= 100
                              ? styles.statusPillCompleted
                              : styles.statusPillPending,
                          ]}
                        >
                          <Text style={styles.statusPillText}>
                            {completionRate >= 100
                              ? t('school.homework.status.completed')
                              : t('school.homework.status.pending')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                      <View style={overdue ? styles.assignmentMetaOverdue : {}}>
                        {overdue && <MaterialIcons name="warning" size={16} color={colors.status.error} />}
                        <Text style={[styles.assignmentMeta, overdue && { color: colors.status.error }]}>
                          {assignment.class_name} • {t('common.due')} {formatDate(assignment.due_date)}
                        </Text>
                      </View>
                      <View style={styles.assignmentFooter}>
                        <View style={styles.progressRow}>
                          <View style={styles.progressBar}>
                            <View
                              style={[styles.progressFill, { width: `${completionRate}%` }]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {assignment.completed_submissions || 0}/{assignment.total_submissions || 0} ({completionRate}%)
                          </Text>
                        </View>
                        <TouchableOpacity style={styles.viewButton}>
                          <Text style={styles.viewButtonText}>{t('school.homework.list.view')}</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default AdminHomeworkScreen;

