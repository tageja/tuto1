/**
 * Teacher Class Detail Screen
 * Class info with Overview / Students / Timetable tabs; matches existing class detail aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSchool } from '../../../contexts/SchoolContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import SchoolHeader from '../../../components/common/SchoolHeader';
import { StudentListItem } from '../../../components/school/StudentListItem';
import {
  fetchTeacherClasses,
  fetchTeacherStudents,
  fetchClassSchedule,
  type TeacherClass,
  type TeacherStudent,
  type ScheduleSlot,
} from '../../../services/teacher-dashboard';
import { getSlotColors, formatTime } from '../../../utils/timetableColors';
import type { SchoolStudent } from '../../../types/school';

type NavParams = { TeacherClassDetail: { classId: string; schoolId: string } };
type Props = RouteProp<NavParams, 'TeacherClassDetail'>;

function toSchoolStudent(s: TeacherStudent): SchoolStudent {
  const firstName = s.first_name || '';
  const lastName = s.last_name || '';
  return {
    id: s.id,
    name: `${firstName} ${lastName}`.trim() || '—',
    schoolId: '',
    classId: s.class_id || null,
    className: (s.class as any)?.name || null,
    code: s.student_number || '',
    firstName,
    lastName,
    dateOfBirth: s.date_of_birth || null,
    dob: s.date_of_birth || null,
    gender: (s.gender as any) || null,
    gradeLevel: null,
    grade: null,
    parentName: s.parent_name || undefined,
    parent: s.parent_name || null,
    parentEmail: s.parent_email || null,
    parentPhone: s.parent_phone || null,
    contactEmail: s.parent_email || null,
    contactPhone: s.parent_phone || null,
    status: (s.status === 'active' || s.status === 'Active' ? 'Active' : 'Inactive') as 'Active' | 'Inactive',
  };
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS_VI = ['T2', 'T3', 'T4', 'T5', 'T6'];

export const TeacherClassDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t, language } = useLanguage();
  const { currentSchool } = useSchool();
  const navigation = useNavigation<any>();
  const route = useRoute<Props>();
  const { classId, schoolId } = route.params || {};

  const [classInfo, setClassInfo] = useState<TeacherClass | null>(null);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [schedule, setSchedule] = useState<ScheduleSlot[]>([]);
  const [tab, setTab] = useState<'overview' | 'students' | 'timetable'>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!schoolId || !classId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const [classesList, studentsList, scheduleList] = await Promise.all([
        fetchTeacherClasses(schoolId),
        fetchTeacherStudents(schoolId, classId),
        fetchClassSchedule(classId),
      ]);
      const cls = classesList.find((c) => c.id === classId) || null;
      setClassInfo(cls);
      setStudents(studentsList);
      setSchedule(scheduleList);
    } catch (e: any) {
      setError(e?.message || t('school.teacher.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [schoolId, classId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleStudentPress = (studentId: string) => {
    navigation.navigate('TeacherStudentDetail', { studentId, schoolId: schoolId || currentSchool?.id });
  };

  const dayLabels = language === 'vi' ? DAY_LABELS_VI : DAY_LABELS;
  const slotsByDay: Record<number, ScheduleSlot[]> = { 0: [], 1: [], 2: [], 3: [], 4: [] };
  schedule.forEach((s) => {
    const d = s.day_of_week;
    const idx = d >= 1 && d <= 5 ? d - 1 : d === 0 ? 4 : -1;
    if (idx >= 0 && idx <= 4) slotsByDay[idx].push(s);
  });
  Object.keys(slotsByDay).forEach((k) => slotsByDay[Number(k)].sort((a, b) => a.start_time.localeCompare(b.start_time)));

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 12 },
    screenTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    screenSubtitle: { fontSize: 14, color: colors.text.secondary },
    tabRow: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      marginBottom: 12,
      gap: 8,
    },
    tab: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      backgroundColor: colors.background.tertiary,
    },
    tabActive: { backgroundColor: colors.primary },
    tabText: { fontSize: 14, fontWeight: '600', color: colors.text.primary },
    tabTextActive: { color: colors.white },
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    overviewRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    overviewLabel: { fontSize: 14, color: colors.text.secondary },
    overviewValue: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
    slotCard: {
      marginHorizontal: 16,
      marginBottom: 8,
      borderRadius: 12,
      padding: 12,
      borderLeftWidth: 4,
    },
    slotTime: { fontSize: 12, color: colors.text.secondary, marginBottom: 4 },
    slotName: { fontSize: 16, fontWeight: '600' },
    loadingWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 48 },
    errorWrap: { padding: 16, alignItems: 'center' },
    errorText: { fontSize: 14, color: colors.status.error, marginBottom: 12 },
    retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    retryBtnText: { color: colors.white, fontWeight: '600' },
    listContent: { paddingBottom: 24 },
  });

  if (!classId || !schoolId) {
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

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>{classInfo?.name || '—'}</Text>
          <Text style={styles.screenSubtitle}>
            {classInfo?.grade_level ? `${t('school.classes.grade')} ${classInfo.grade_level}` : ''}
            {classInfo?.room_number ? ` • ${t('school.classes.room')} ${classInfo.room_number}` : ''}
          </Text>
        </View>

        <View style={styles.tabRow}>
          {(['overview', 'students', 'timetable'] as const).map((tkey) => (
            <TouchableOpacity
              key={tkey}
              style={[styles.tab, tab === tkey && styles.tabActive]}
              onPress={() => setTab(tkey)}
            >
              <Text style={[styles.tabText, tab === tkey && styles.tabTextActive]}>
                {tkey === 'overview' ? t('school.teacher.overview') : tkey === 'students' ? t('school.teacher.students') : t('school.teacher.timetable')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {error && (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadData}>
              <Text style={styles.retryBtnText}>{t('school.teacher.retry')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {!error && tab === 'overview' && (
          <View style={styles.card}>
            <View style={styles.overviewRow}>
              <Text style={styles.overviewLabel}>{t('school.classes.students')}</Text>
              <Text style={styles.overviewValue}>{students.length}</Text>
            </View>
          </View>
        )}

        {!error && tab === 'students' && (
          <View style={styles.listContent}>
            {students.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={styles.overviewLabel}>{t('school.teacher.noStudents')}</Text>
              </View>
            ) : (
              students.map((s) => (
                <StudentListItem
                  key={s.id}
                  student={toSchoolStudent(s)}
                  onPress={() => handleStudentPress(s.id)}
                />
              ))
            )}
          </View>
        )}

        {!error && tab === 'timetable' && (
          <View style={{ paddingBottom: 24 }}>
            {schedule.length === 0 ? (
              <View style={{ padding: 24, alignItems: 'center' }}>
                <Text style={styles.overviewLabel}>{t('school.teacher.noAssignments')}</Text>
              </View>
            ) : (
              dayLabels.map((label, dayIndex) => {
                const slots = slotsByDay[dayIndex] || [];
                return (
                  <View key={dayIndex} style={{ marginBottom: 16 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.secondary, marginHorizontal: 16, marginBottom: 8 }}>
                      {label}
                    </Text>
                    {slots.map((slot, i) => {
                      const pal = getSlotColors(slot.subject_or_slot_name);
                      return (
                        <View
                          key={slot.id || i}
                          style={[
                            styles.slotCard,
                            { backgroundColor: pal.bg, borderLeftColor: pal.border },
                          ]}
                        >
                          <Text style={styles.slotTime}>
                            {formatTime(slot.start_time)} – {formatTime(slot.end_time)}
                          </Text>
                          <Text style={[styles.slotName, { color: pal.text }]}>
                            {slot.subject_or_slot_name || '—'}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default TeacherClassDetailScreen;
