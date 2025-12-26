/**
 * Parent Homework Screen
 * Displays homework assignments for selected child with filters, stats, and completion tracking
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
  fetchParentChildren,
  fetchParentHomeworkData,
  type HomeworkAssignment,
  type HomeworkStats,
  type Child,
  type HomeworkStatusTab,
  type TimeRange,
  isAssignmentOverdue,
} from '../../services/school/homework';
import type { HomeworkFilters } from '../../types/school/homework';

const { width } = Dimensions.get('window');

// Simple Donut Chart Component
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

const ParentHomeworkScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('');
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [stats, setStats] = useState<HomeworkStats>({
    total: 0,
    pending: 0,
    completed: 0,
    completionRate: 0,
  });
  const [statusTab, setStatusTab] = useState<HomeworkStatusTab>('all');
  const [baseDate, setBaseDate] = useState<Date>(new Date());
  const [range, setRange] = useState<TimeRange>('week');
  const [searchQuery, setSearchQuery] = useState('');
  const [childDropdownVisible, setChildDropdownVisible] = useState(false);
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
    childSelector: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    dropdown: {
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
    rangeDropdown: {
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
      minWidth: 50,
    },
    childScoreText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
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
    if (!currentSchool?.id || !selectedChildId) return;

    try {
      setLoading(true);
      const filters: HomeworkFilters = {
        status: statusTab,
        baseDate,
        range,
        search: searchQuery || undefined,
      };

      const result = await fetchParentHomeworkData(currentSchool.id, selectedChildId, filters);
      setAssignments(result.assignments);
      setStats(result.stats);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading homework data:', error);
      Alert.alert(t('common.error'), 'Failed to load homework data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, selectedChildId, statusTab, baseDate, range, searchQuery, t]);

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
      Alert.alert(t('common.error'), 'Failed to load children');
    }
  }, [currentSchool?.id, selectedChildId, t]);

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

  const selectedChild = children.find((c) => c.id === selectedChildId);

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
              {selectedChild && (
                <Text style={styles.screenSubtitle}>
                  {selectedChild.firstName} {selectedChild.lastName} • {selectedChild.className}
                </Text>
              )}
            </View>
          </View>
          <View style={styles.syncBadge}>
            <View style={styles.syncDot} />
            <Text style={styles.syncText}>
              {t('common.synced')} 2 {t('feed.minutes')} {t('feed.ago')}
            </Text>
          </View>
        </View>

        {/* Child Selector */}
        <View style={styles.childSelector}>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => setChildDropdownVisible(!childDropdownVisible)}
          >
            <Text style={styles.dropdownText}>
              {selectedChild
                ? `${selectedChild.firstName} ${selectedChild.lastName} – ${selectedChild.className}`
                : t('school.homework.selectChild')}
            </Text>
            <MaterialIcons name={childDropdownVisible ? 'expand-less' : 'expand-more'} size={24} color={colors.text.primary} />
          </TouchableOpacity>
          {childDropdownVisible && (
            <View style={styles.dropdownModal}>
              {children.map((child) => (
                <TouchableOpacity
                  key={child.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedChildId(child.id);
                    setChildDropdownVisible(false);
                  }}
                >
                  <Text style={styles.dropdownItemText}>
                    {child.firstName} {child.lastName} – {child.className}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
            <TouchableOpacity style={styles.rangeDropdown}>
              <Text style={styles.dropdownText}>{t(`school.homework.ranges.${range}`)}</Text>
              <MaterialIcons name="expand-more" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <View style={styles.searchBar}>
            <MaterialIcons name="search" size={20} color={colors.text.secondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('school.homework.searchAssignments')}
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
              </View>

              {/* Score Trends Placeholder */}
              <View style={styles.chartCard}>
                <Text style={styles.chartTitle}>{t('school.homework.charts.scoreTrends')}</Text>
                <View style={styles.chartContent}>
                  <Text style={styles.emptyText}>{t('school.homework.charts.noData')}</Text>
                </View>
              </View>
            </View>

            {/* Assignments List */}
            <View style={styles.assignmentsSection}>
              <Text style={styles.sectionTitle}>{t('school.homework.list.title')}</Text>
              {assignments.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <MaterialIcons name="assignment" size={48} color={colors.text.secondary} />
                  <Text style={styles.emptyText}>{t('school.homework.noAssignmentsPeriod')}</Text>
                </View>
              ) : (
                assignments.map((assignment) => {
                  const submission = assignment.submission;
                  const overdue = submission && isAssignmentOverdue(assignment.due_date, submission.status);
                  const completedTasks = submission ? (submission.status === 'graded' || submission.status === 'submitted' ? assignment.total_tasks : 0) : 0;
                  const progressPercentage = assignment.total_tasks > 0
                    ? Math.round((completedTasks / assignment.total_tasks) * 100)
                    : 0;

                  return (
                    <TouchableOpacity key={assignment.id} style={styles.assignmentCard}>
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
                            submission && (submission.status === 'graded' || submission.status === 'submitted')
                              ? styles.statusPillCompleted
                              : styles.statusPillPending,
                          ]}
                        >
                          <Text style={styles.statusPillText}>
                            {submission && (submission.status === 'graded' || submission.status === 'submitted')
                              ? t('school.homework.status.completed')
                              : t('school.homework.status.pending')}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.assignmentTitle}>{assignment.title}</Text>
                      <Text style={styles.assignmentMeta}>
                        {assignment.class_name} • {t('common.due')} {formatDate(assignment.due_date)}
                      </Text>
                      <View style={styles.assignmentFooter}>
                        <View style={styles.progressRow}>
                          <View style={styles.progressBar}>
                            <View
                              style={[styles.progressFill, { width: `${progressPercentage}%` }]}
                            />
                          </View>
                          <Text style={styles.progressText}>
                            {completedTasks}/{assignment.total_tasks}
                          </Text>
                        </View>
                        <Text style={styles.childScoreText}>
                          {t('school.homework.yourChild')}: {submission?.score !== null ? `${submission.score}%` : '--'}
                        </Text>
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

export default ParentHomeworkScreen;

