/**
 * Teacher Student Detail Screen
 * Profile, parent contact, attendance summary, recent scores; matches StudentDetailScreen aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSchool } from '../../../contexts/SchoolContext';
import { useRoute, RouteProp } from '@react-navigation/native';
import SchoolHeader from '../../../components/common/SchoolHeader';
import {
  fetchStudentDetail,
  fetchStudentAttendance,
  fetchProgressReports,
  type StudentDetailResponse,
  type StudentAttendanceSummary,
  type ProgressReportAssessment,
} from '../../../services/teacher-dashboard';

type NavParams = { TeacherStudentDetail: { studentId: string; schoolId: string } };
type Props = RouteProp<NavParams, 'TeacherStudentDetail'>;

const PERIODS: Array<{ key: '1m' | '3m' | '6m' | '12m'; labelKey: string }> = [
  { key: '1m', labelKey: 'period30d' },
  { key: '3m', labelKey: 'period90d' },
  { key: '6m', labelKey: 'period180d' },
];

export const TeacherStudentDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const route = useRoute<Props>();
  const { studentId, schoolId } = route.params || {};

  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [attendance, setAttendance] = useState<StudentAttendanceSummary | null>(null);
  const [recentScores, setRecentScores] = useState<Array<{ title: string; subject_name?: string; date: string; score: string | number; max_score?: number; grade_letter?: string }>>([]);
  const [period, setPeriod] = useState<'1m' | '3m' | '6m' | '12m'>('1m');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sid = schoolId || currentSchool?.id;

  const loadData = useCallback(async () => {
    if (!studentId || !sid) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [detail, att, reports] = await Promise.all([
        fetchStudentDetail(studentId, sid),
        fetchStudentAttendance(studentId, sid, period),
        fetchProgressReports(sid),
      ]);
      setStudent(detail || null);
      setAttendance(att);
      const scores: typeof recentScores = [];
      (reports || []).forEach((a) => {
        const row = a.scores?.find((s: any) => s.student_id === studentId);
        if (row) {
          scores.push({
            title: a.title,
            subject_name: a.subject_name,
            date: a.date,
            score: row.score,
            max_score: a.max_score,
            grade_letter: row.grade_letter,
          });
        }
      });
      setRecentScores(scores.slice(0, 5));
    } catch (e: any) {
      setError(e?.message || t('school.teacher.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [studentId, sid, period, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const openPhone = (phone: string) => {
    if (phone) Linking.openURL(`tel:${phone}`);
  };
  const openEmail = (email: string) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    scrollContent: { paddingBottom: spacing.xl },
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    cardTitle: { fontSize: typography.fontSize.lg, fontWeight: '600', color: colors.text.primary, marginBottom: spacing.sm },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 14, color: colors.text.secondary },
    value: { fontSize: 14, fontWeight: '500', color: colors.text.primary },
    linkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, gap: 12 },
    linkBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, paddingHorizontal: 10, backgroundColor: colors.background.tertiary, borderRadius: 12 },
    periodRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
    periodChip: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.background.tertiary },
    periodChipActive: { backgroundColor: `${colors.primary}20` },
    periodChipText: { fontSize: 13, color: colors.text.secondary, fontWeight: '500' },
    periodChipTextActive: { color: colors.primary, fontWeight: '600' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
    errorWrap: { padding: 16, alignItems: 'center' },
    errorText: { fontSize: 14, color: colors.status.error },
    retryBtn: { marginTop: 12, backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    retryBtnText: { color: colors.white, fontWeight: '600' },
  });

  if (!studentId || !sid) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingWrap}>
          <Text style={styles.errorText}>{t('school.teacher.loadError')}</Text>
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
        </View>
      </View>
    );
  }

  const name = student ? `${student.first_name} ${student.last_name}`.trim() || '—' : '—';
  const dob = student?.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString() : '—';

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
              <Text style={styles.retryBtnText}>{t('school.teacher.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {student && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{name}</Text>
              <View style={styles.row}>
                <Text style={styles.label}>{t('common.dateOfBirth')}</Text>
                <Text style={styles.value}>{dob}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>{t('common.gender')}</Text>
                <Text style={styles.value}>{student.gender || '—'}</Text>
              </View>
              {student.student_number && (
                <View style={styles.row}>
                  <Text style={styles.label}>{t('school.students.add.studentCode')}</Text>
                  <Text style={styles.value}>{student.student_number}</Text>
                </View>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('school.teacher.parentContact')}</Text>
              {student.parent_name && (
                <View style={styles.row}>
                  <Text style={styles.label}>{t('school.students.parent')}</Text>
                  <Text style={styles.value}>{student.parent_name}</Text>
                </View>
              )}
              <View style={styles.linkRow}>
                {student.parent_phone && (
                  <TouchableOpacity style={styles.linkBtn} onPress={() => openPhone(student.parent_phone!)}>
                    <MaterialIcons name="phone" size={18} color={colors.primary} />
                    <Text style={[styles.value, { marginLeft: 6 }]}>{student.parent_phone}</Text>
                  </TouchableOpacity>
                )}
                {student.parent_email && (
                  <TouchableOpacity style={styles.linkBtn} onPress={() => openEmail(student.parent_email!)}>
                    <MaterialIcons name="email" size={18} color={colors.primary} />
                    <Text style={[styles.value, { marginLeft: 6 }]} numberOfLines={1}>{student.parent_email}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('school.teacher.attendanceSummary')}</Text>
              <View style={styles.periodRow}>
                {PERIODS.map((p) => (
                  <TouchableOpacity
                    key={p.key}
                    style={[styles.periodChip, period === p.key && styles.periodChipActive]}
                    onPress={() => setPeriod(p.key)}
                  >
                    <Text style={[styles.periodChipText, period === p.key && styles.periodChipTextActive]}>
                      {t(`school.teacher.${p.labelKey}`)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {attendance && (
                <>
                  <View style={styles.row}>
                    <Text style={styles.label}>{t('school.teacher.present')}</Text>
                    <Text style={styles.value}>{attendance.present}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>{t('school.teacher.absent')}</Text>
                    <Text style={styles.value}>{attendance.absent}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>{t('school.teacher.late')}</Text>
                    <Text style={styles.value}>{attendance.late}</Text>
                  </View>
                  <View style={styles.row}>
                    <Text style={styles.label}>{t('school.attendance.attendanceRate')}</Text>
                    <Text style={styles.value}>{attendance.percentage}%</Text>
                  </View>
                </>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('school.teacher.recentScores')}</Text>
              {recentScores.length === 0 ? (
                <Text style={styles.label}>{t('school.teacher.noAssignments')}</Text>
              ) : (
                recentScores.map((s, i) => (
                  <View key={i} style={[styles.row, { marginBottom: 8 }]}>
                    <Text style={styles.value} numberOfLines={1}>
                      {s.subject_name || s.title} – {String(s.score)}{s.max_score != null ? ` / ${s.max_score}` : ''} {s.grade_letter ? `(${s.grade_letter})` : ''}
                    </Text>
                    <Text style={styles.label}>{s.date}</Text>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default TeacherStudentDetailScreen;
