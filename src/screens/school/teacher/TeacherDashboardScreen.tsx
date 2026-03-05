/**
 * Teacher Dashboard Screen
 * KPIs and quick actions; matches SchoolDashboardScreen aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../../../contexts/SchoolContext';
import { useUser } from '../../../contexts/UserContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import SchoolHeader from '../../../components/common/SchoolHeader';
import { KPICard } from '../../../components/school/KPICard';
import { fetchTeacherStats, type TeacherStats } from '../../../services/teacher-dashboard';

const DEFAULT_STATS: TeacherStats = {
  classesCount: 0,
  studentsCount: 0,
  todayAttendanceRate: null,
  homeworkPending: 0,
};

export const TeacherDashboardScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t, language } = useLanguage();
  const { currentSchool } = useSchool();
  const { userData } = useUser();
  const navigation = useNavigation<any>();

  const [stats, setStats] = useState<TeacherStats>(DEFAULT_STATS);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!currentSchool?.id) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const data = await fetchTeacherStats(currentSchool.id);
      setStats(data);
    } catch (e: any) {
      setError(e?.message || t('school.teacher.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const teacherName = userData?.name?.trim() || userData?.email?.split('@')[0] || '';
  const schoolName = currentSchool?.name || '';
  const dateStr = new Date().toLocaleDateString(
    language === 'vi' ? 'vi-VN' : 'en-US',
    { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  );

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    scrollContent: { flex: 1 },
    pageHeader: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    welcomeCard: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.lg,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderLeftWidth: 4,
      borderLeftColor: colors.white,
    },
    welcomeTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.white,
      marginBottom: spacing.xs,
    },
    welcomeSub: {
      fontSize: typography.fontSize.sm,
      color: 'rgba(255,255,255,0.9)',
    },
    kpiSection: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
    },
    kpiRow: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    quickSection: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.xl,
    },
    quickTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    quickGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    quickButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.white,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
      minWidth: '47%',
    },
    quickButtonText: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    loadingWrap: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 48,
    },
    loadingText: { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: 12 },
    errorWrap: {
      padding: spacing.lg,
      alignItems: 'center',
    },
    errorText: { fontSize: typography.fontSize.md, color: colors.status.error, textAlign: 'center', marginBottom: spacing.md },
    retryButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
    },
    retryText: { color: colors.white, fontWeight: '600', fontSize: typography.fontSize.sm },
    emptyWrap: {
      padding: spacing.xl,
      alignItems: 'center',
    },
    emptyText: { fontSize: typography.fontSize.md, color: colors.text.secondary },
  });

  if (!currentSchool) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('school.dashboardSchool.noSchoolJoinedMessage')}</Text>
        </View>
      </View>
    );
  }

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.pageHeader}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>
              {t('school.teacher.welcomeBack', { name: teacherName || '—' })}
            </Text>
            <Text style={styles.welcomeSub}>{schoolName}</Text>
            <Text style={[styles.welcomeSub, { marginTop: 4 }]}>{dateStr}</Text>
          </View>
        </View>

        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={loadData}>
              <Text style={styles.retryText}>{t('school.teacher.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && (
          <>
            <View style={styles.kpiSection}>
              <View style={styles.kpiRow}>
                <View style={{ flex: 1 }}>
                  <KPICard
                    label={t('school.teacher.classes')}
                    value={stats.classesCount}
                    icon="class"
                    color={colors.primary}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <KPICard
                    label={t('school.teacher.students')}
                    value={stats.studentsCount}
                    icon="people"
                    color="#4CAF50"
                  />
                </View>
              </View>
              <View style={styles.kpiRow}>
                <View style={{ flex: 1 }}>
                  <KPICard
                    label={t('school.teacher.todayAttendance')}
                    value={stats.todayAttendanceRate != null ? `${stats.todayAttendanceRate}%` : '—'}
                    icon="event-available"
                    color="#9C27B0"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <KPICard
                    label={t('school.teacher.homeworkPending')}
                    value={stats.homeworkPending}
                    icon="assignment"
                    color="#FF9800"
                  />
                </View>
              </View>
            </View>

            <View style={styles.quickSection}>
              <Text style={styles.quickTitle}>{t('school.dashboardSchool.quickActions')}</Text>
              <View style={styles.quickGrid}>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => navigation.navigate('ClassesTab')}
                >
                  <MaterialIcons name="class" size={20} color={colors.primary} />
                  <Text style={styles.quickButtonText}>{t('school.teacher.classes')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => navigation.navigate('AttendanceTab')}
                >
                  <MaterialIcons name="event-available" size={20} color={colors.primary} />
                  <Text style={styles.quickButtonText}>{t('school.teacher.attendance')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => {
                    const root = navigation.getParent()?.getParent();
                    (root as any)?.navigate('TeacherHomework', { schoolId: currentSchool.id });
                  }}
                >
                  <MaterialIcons name="assignment" size={20} color={colors.primary} />
                  <Text style={styles.quickButtonText}>{t('school.teacher.homework')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.quickButton}
                  onPress={() => {
                    const root = navigation.getParent()?.getParent();
                    (root as any)?.navigate('TeacherProgressReports', { schoolId: currentSchool.id });
                  }}
                >
                  <MaterialIcons name="trending-up" size={20} color={colors.primary} />
                  <Text style={styles.quickButtonText}>{t('school.teacher.progressReports')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};

export default TeacherDashboardScreen;
