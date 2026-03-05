/**
 * Teacher Progress Reports Screen
 * Assessments with expandable per-student scores; matches existing progress aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSchool } from '../../../contexts/SchoolContext';
import { useRoute, RouteProp } from '@react-navigation/native';
import SchoolHeader from '../../../components/common/SchoolHeader';
import { FilterChip } from '../../../components/school/FilterChip';
import {
  fetchTeacherClasses,
  fetchProgressReports,
  type TeacherClass,
  type ProgressReportAssessment,
} from '../../../services/teacher-dashboard';

type NavParams = { TeacherProgressReports: { schoolId: string } };
type Props = RouteProp<NavParams, 'TeacherProgressReports'>;

export const TeacherProgressReportsScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const route = useRoute<Props>();
  const schoolId = route.params?.schoolId || currentSchool?.id;

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [assessments, setAssessments] = useState<ProgressReportAssessment[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    if (!schoolId) return;
    try {
      const list = await fetchTeacherClasses(schoolId);
      setClasses(list);
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const loadReports = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchProgressReports(schoolId, selectedClassId || undefined);
      setAssessments(list);
    } catch (e: any) {
      setError(e?.message || t('school.teacher.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [schoolId, selectedClassId, t]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    setLoading(true);
    loadReports();
  }, [loadReports]);

  const onRefresh = () => {
    setRefreshing(true);
    loadReports();
  };

  const avgScore = (a: ProgressReportAssessment) => {
    if (!a.scores?.length) return '—';
    const sum = a.scores.reduce((acc, s) => acc + Number(s.score) || 0, 0);
    return (sum / a.scores.length).toFixed(1);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    screenTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    screenSubtitle: { fontSize: 14, color: colors.text.secondary },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
    scrollContent: { paddingBottom: 24, paddingHorizontal: 16 },
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
      overflow: 'hidden',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, flex: 1 },
    cardMeta: { fontSize: 13, color: colors.text.secondary, marginTop: 4 },
    expandIcon: { padding: 4 },
    scoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    scoreName: { flex: 1, fontSize: 14, color: colors.text.primary },
    scoreValue: { fontSize: 14, fontWeight: '600', color: colors.text.primary, marginRight: 8 },
    scoreBar: { width: 40, height: 6, backgroundColor: colors.background.tertiary, borderRadius: 3, overflow: 'hidden' },
    scoreBarFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 3 },
    loadingWrap: { padding: 24, alignItems: 'center' },
    emptyWrap: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 14, color: colors.text.secondary },
    errorWrap: { padding: 16, alignItems: 'center' },
    errorText: { fontSize: 14, color: colors.status.error, marginBottom: 12 },
    retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    retryBtnText: { color: colors.white, fontWeight: '600' },
  });

  if (!schoolId) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>{t('school.dashboardSchool.noSchoolJoinedMessage')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.headerSection}>
        <Text style={styles.screenTitle}>{t('school.teacher.progressReports')}</Text>
        <Text style={styles.screenSubtitle}>{assessments.length} assessments</Text>
      </View>
      <View style={styles.filterRow}>
        <FilterChip
          label={t('school.students.filters.all')}
          selected={selectedClassId === null}
          onPress={() => setSelectedClassId(null)}
        />
        {classes.map((c) => (
          <FilterChip
            key={c.id}
            label={c.name}
            selected={selectedClassId === c.id}
            onPress={() => setSelectedClassId(c.id)}
          />
        ))}
      </View>
      {error && (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadReports}>
            <Text style={styles.retryBtnText}>{t('school.teacher.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          style={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        >
          {assessments.length === 0 && !error ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>{t('school.teacher.noAssignments')}</Text>
            </View>
          ) : (
            assessments.map((a) => {
              const isExpanded = expandedId === a.id;
              const maxScore = a.max_score ?? 100;
              return (
                <View key={a.id} style={styles.card}>
                  <TouchableOpacity
                    style={styles.cardHeader}
                    onPress={() => setExpandedId(isExpanded ? null : a.id)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cardTitle}>{a.title}</Text>
                      <Text style={styles.cardMeta}>
                        {a.subject_name || '—'} • {a.class_name || '—'} • {a.date}
                      </Text>
                      <Text style={[styles.cardMeta, { marginTop: 2 }]}>Avg: {avgScore(a)}</Text>
                    </View>
                    <MaterialIcons
                      name={isExpanded ? 'expand-less' : 'expand-more'}
                      size={24}
                      color={colors.text.secondary}
                      style={styles.expandIcon}
                    />
                  </TouchableOpacity>
                  {isExpanded && a.scores && a.scores.length > 0 && (
                    <>
                      {a.scores.map((s) => {
                        const num = Number(s.score);
                        const pct = Number.isNaN(num) ? 0 : Math.min(100, (num / maxScore) * 100);
                        return (
                          <View key={s.student_id} style={styles.scoreRow}>
                            <Text style={styles.scoreName} numberOfLines={1}>{s.student_name}</Text>
                            <Text style={styles.scoreValue}>{s.score}</Text>
                            <View style={styles.scoreBar}>
                              <View style={[styles.scoreBarFill, { width: `${pct}%` }]} />
                            </View>
                            {s.grade_letter && (
                              <Text style={[styles.scoreValue, { marginLeft: 4, minWidth: 16 }]}>{s.grade_letter}</Text>
                            )}
                          </View>
                        );
                      })}
                    </>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default TeacherProgressReportsScreen;
