/**
 * Teacher Attendance Screen
 * Mark attendance and homework by class/date; matches AdminAttendanceScreen aesthetics.
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
  Modal,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../../contexts/SchoolContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import SchoolHeader from '../../../components/common/SchoolHeader';
import {
  fetchTeacherClasses,
  fetchTeacherStudents,
  fetchTeacherAttendance,
  fetchHomeworkSubmissions,
  saveTeacherAttendance,
  saveHomeworkSubmissions,
  type TeacherClass,
  type TeacherStudent,
  type HomeworkAssignment,
} from '../../../services/teacher-dashboard';

const STATUS_OPTIONS = ['present', 'absent', 'late', 'excused'] as const;
const TRACK_OPTIONS = ['', 'on_track', 'off_track'] as const;
const HW_OPTIONS = ['', 'submitted', 'incomplete'] as const;

export const TeacherAttendanceScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t, language } = useLanguage();
  const { currentSchool } = useSchool();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [date, setDate] = useState(() => new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [attendance, setAttendance] = useState<Record<string, { status: string; track_status: string }>>({});
  const [hwAssignments, setHwAssignments] = useState<HomeworkAssignment[]>([]);
  const [hwSubmissions, setHwSubmissions] = useState<Record<string, Record<string, string>>>({});
  const [noHomework, setNoHomework] = useState(false);
  const [classesLoading, setClassesLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [classPickerOpen, setClassPickerOpen] = useState(false);

  const schoolId = currentSchool?.id ?? '';
  const dateStr = date.toISOString().split('T')[0];

  const loadClasses = useCallback(async () => {
    if (!schoolId) return;
    setClassesLoading(true);
    try {
      const list = await fetchTeacherClasses(schoolId);
      setClasses(list);
      if (list.length > 0 && !selectedClassId) setSelectedClassId(list[0].id);
    } catch (e) {
      console.error(e);
    } finally {
      setClassesLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const loadAttendanceAndHomework = useCallback(async () => {
    if (!schoolId || !selectedClassId) {
      setStudents([]);
      setAttendance({});
      setHwAssignments([]);
      setHwSubmissions({});
      return;
    }
    setDataLoading(true);
    try {
      const [studentsList, attData, hwData] = await Promise.all([
        fetchTeacherStudents(schoolId, selectedClassId),
        fetchTeacherAttendance(schoolId, selectedClassId, dateStr),
        fetchHomeworkSubmissions(schoolId, selectedClassId, dateStr),
      ]);
      setStudents(studentsList);
      const initial: Record<string, { status: string; track_status: string }> = {};
      studentsList.forEach((s) => {
        const e = attData[s.id];
        initial[s.id] = e ? { status: e.status || 'present', track_status: e.track_status || '' } : { status: 'present', track_status: '' };
      });
      setAttendance(initial);
      setHwAssignments(hwData.assignments || []);
      const hwInit: Record<string, Record<string, string>> = {};
      studentsList.forEach((s) => {
        hwInit[s.id] = {};
        (hwData.assignments || []).forEach((a) => {
          const ex = hwData.submissions?.[s.id]?.[a.id];
          hwInit[s.id][a.id] = ex?.status === 'submitted' ? 'submitted' : ex?.status === 'incomplete' ? 'incomplete' : '';
        });
      });
      setHwSubmissions(hwInit);
    } catch (e) {
      console.error(e);
    } finally {
      setDataLoading(false);
      setRefreshing(false);
    }
  }, [schoolId, selectedClassId, dateStr]);

  useEffect(() => {
    loadAttendanceAndHomework();
  }, [loadAttendanceAndHomework]);

  const onRefresh = () => {
    setRefreshing(true);
    loadAttendanceAndHomework();
  };

  const setStatus = (studentId: string, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
  };

  const setTrack = (studentId: string, track_status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: { ...prev[studentId], track_status } }));
  };

  const setHw = (studentId: string, assignmentId: string, status: string) => {
    setHwSubmissions((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], [assignmentId]: status },
    }));
  };

  const markAllStatus = (status: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => { next[s.id] = { ...next[s.id], status }; });
      return next;
    });
  };

  const markAllTrack = (track_status: string) => {
    setAttendance((prev) => {
      const next = { ...prev };
      students.forEach((s) => { next[s.id] = { ...next[s.id], track_status }; });
      return next;
    });
  };

  const markAllHw = (status: string) => {
    setHwSubmissions((prev) => {
      const next = { ...prev };
      students.forEach((s) => {
        next[s.id] = { ...next[s.id] };
        hwAssignments.forEach((a) => { next[s.id][a.id] = status; });
      });
      return next;
    });
  };

  const handleSave = async () => {
    if (!schoolId || !selectedClassId) return;
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const attPayload = students.map((s) => ({
        student_id: s.id,
        status: attendance[s.id]?.status || 'present',
        track_status: attendance[s.id]?.track_status || '',
      }));
      const hwRecords: Array<{ student_id: string; assignment_id: string; status: string }> = [];
      if (!noHomework && hwAssignments.length > 0) {
        students.forEach((s) => {
          hwAssignments.forEach((a) => {
            const st = hwSubmissions[s.id]?.[a.id] ?? '';
            if (st) hwRecords.push({ student_id: s.id, assignment_id: a.id, status: st });
          });
        });
      }
      await Promise.all([
        saveTeacherAttendance(schoolId, selectedClassId, dateStr, attPayload),
        saveHomeworkSubmissions(schoolId, selectedClassId, noHomework, hwRecords),
      ]);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (e: any) {
      setSaveError(e?.message || t('school.teacher.saveError'));
    } finally {
      setSaving(false);
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    scrollContent: { paddingBottom: spacing.xl },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    screenTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    screenSubtitle: { fontSize: 14, color: colors.text.secondary },
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
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md },
    filterTouch: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.tertiary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    filterTouchText: { fontSize: 14, color: colors.text.primary, marginLeft: 6 },
    bulkRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
    bulkBtn: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, backgroundColor: colors.background.tertiary },
    bulkBtnText: { fontSize: 12, fontWeight: '600', color: colors.text.primary },
    studentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    studentName: { flex: 1, fontSize: 14, fontWeight: '500', color: colors.text.primary },
    pickerRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    pill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    pillText: { fontSize: 12, fontWeight: '600' },
    saveBtn: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      marginHorizontal: spacing.md,
      marginTop: 8,
    },
    saveBtnText: { color: colors.white, fontSize: 16, fontWeight: '600' },
    loadingWrap: { padding: 24, alignItems: 'center' },
    emptyWrap: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 14, color: colors.text.secondary },
    successText: { fontSize: 14, color: colors.status.success, marginTop: 8, textAlign: 'center' },
    errorText: { fontSize: 14, color: colors.status.error, marginTop: 8, textAlign: 'center' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.white, borderRadius: 16, maxHeight: 400 },
    modalItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    modalItemText: { fontSize: 16, color: colors.text.primary },
  });

  const statusLabel = (s: string) => t(`school.teacher.${s === 'present' ? 'present' : s === 'absent' ? 'absent' : s === 'late' ? 'late' : 'excused'}`);
  const trackLabel = (s: string) => (s === 'on_track' ? t('school.teacher.onTrack') : s === 'off_track' ? t('school.teacher.offTrack') : '—');
  const hwLabel = (s: string) => (s === 'submitted' ? t('school.teacher.done') : s === 'incomplete' ? t('school.teacher.notDone') : '—');

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

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <ScrollView
        style={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>{t('school.teacher.attendance')}</Text>
          <Text style={styles.screenSubtitle}>
            {language === 'vi' ? 'Điểm danh theo lớp và ngày' : 'Mark attendance by class and date'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('school.attendance.class')}</Text>
          <View style={styles.filterRow}>
            <TouchableOpacity style={styles.filterTouch} onPress={() => setClassPickerOpen(true)}>
              <MaterialIcons name="class" size={20} color={colors.text.primary} />
              <Text style={styles.filterTouchText}>{selectedClass?.name || t('common.select')}</Text>
              <MaterialIcons name="arrow-drop-down" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.filterTouch} onPress={() => setShowDatePicker(true)}>
              <MaterialIcons name="event" size={20} color={colors.text.primary} />
              <Text style={styles.filterTouchText}>{dateStr}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, d) => {
              setShowDatePicker(Platform.OS !== 'ios');
              if (d) setDate(d);
            }}
          />
        )}

        <Modal visible={classPickerOpen} transparent animationType="fade">
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setClassPickerOpen(false)}>
            <View style={styles.modalContent}>
              <FlatList
                data={classes}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSelectedClassId(item.id);
                      setClassPickerOpen(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item.name}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        {!selectedClassId ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{language === 'vi' ? 'Vui lòng chọn một lớp.' : 'Please select a class.'}</Text>
          </View>
        ) : dataLoading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : students.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>{t('school.teacher.noStudents')}</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('school.attendance.attendance')}</Text>
              <View style={styles.bulkRow}>
                <TouchableOpacity style={styles.bulkBtn} onPress={() => markAllStatus('present')}>
                  <Text style={styles.bulkBtnText}>{t('school.teacher.allPresent')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bulkBtn} onPress={() => markAllStatus('absent')}>
                  <Text style={styles.bulkBtnText}>{t('school.teacher.allAbsent')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.bulkBtn} onPress={() => markAllTrack('on_track')}>
                  <Text style={styles.bulkBtnText}>{t('school.teacher.allOnTrack')}</Text>
                </TouchableOpacity>
              </View>
              {students.map((s) => (
                <View key={s.id} style={styles.studentRow}>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {`${s.first_name} ${s.last_name}`.trim() || '—'}
                  </Text>
                  <View style={styles.pickerRow}>
                    {STATUS_OPTIONS.map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.pill,
                          { backgroundColor: (attendance[s.id]?.status || 'present') === opt ? '#E8F5E9' : colors.background.tertiary },
                        ]}
                        onPress={() => setStatus(s.id, opt)}
                      >
                        <Text style={[styles.pillText, { color: (attendance[s.id]?.status || 'present') === opt ? '#2E7D32' : colors.text.secondary }]}>
                          {statusLabel(opt).slice(0, 1)}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <View style={[styles.pickerRow, { marginLeft: 8 }]}>
                    {TRACK_OPTIONS.filter((o) => o).map((opt) => (
                      <TouchableOpacity
                        key={opt}
                        style={[
                          styles.pill,
                          { backgroundColor: (attendance[s.id]?.track_status || '') === opt ? '#E3F2FD' : colors.background.tertiary },
                        ]}
                        onPress={() => setTrack(s.id, opt)}
                      >
                        <Text style={[styles.pillText, { color: (attendance[s.id]?.track_status || '') === opt ? colors.primary : colors.text.secondary }]}>
                          {opt === 'on_track' ? '✓' : '✗'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>{t('school.teacher.homework')}</Text>
              <TouchableOpacity
                style={[styles.bulkRow, { marginBottom: 8 }]}
                onPress={() => setNoHomework(!noHomework)}
              >
                <MaterialIcons name={noHomework ? 'check-box' : 'check-box-outline-blank'} size={24} color={colors.primary} />
                <Text style={styles.studentName}>{t('school.teacher.noHomeworkToday')}</Text>
              </TouchableOpacity>
              {!noHomework && hwAssignments.length > 0 && (
                <>
                  <TouchableOpacity style={styles.bulkRow} onPress={() => markAllHw('submitted')}>
                    <Text style={styles.bulkBtnText}>{t('school.teacher.markAllDone')}</Text>
                  </TouchableOpacity>
                  {students.map((s) => (
                    <View key={s.id} style={styles.studentRow}>
                      <Text style={styles.studentName} numberOfLines={1}>
                        {`${s.first_name} ${s.last_name}`.trim() || '—'}
                      </Text>
                      <View style={styles.pickerRow}>
                        {HW_OPTIONS.map((opt) => (
                          <TouchableOpacity
                            key={opt || 'empty'}
                            style={[
                              styles.pill,
                              { backgroundColor: (hwSubmissions[s.id]?.[hwAssignments[0]?.id] || '') === opt ? '#E8F5E9' : colors.background.tertiary },
                            ]}
                            onPress={() => hwAssignments[0] && setHw(s.id, hwAssignments[0].id, opt)}
                          >
                            <Text style={[styles.pillText, { color: (hwSubmissions[s.id]?.[hwAssignments[0]?.id] || '') === opt ? '#2E7D32' : colors.text.secondary }]}>
                              {hwLabel(opt).slice(0, 1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={saving}>
              {saving ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.saveBtnText}>{t('school.teacher.save')}</Text>
              )}
            </TouchableOpacity>
            {saveSuccess && <Text style={[styles.successText, { marginHorizontal: spacing.md }]}>{t('school.teacher.saveSuccess')}</Text>}
            {saveError && <Text style={[styles.errorText, { marginHorizontal: spacing.md }]}>{saveError}</Text>}
          </>
        )}
      </ScrollView>
    </View>
  );
};

export default TeacherAttendanceScreen;
