/**
 * Teacher Homework Screen
 * List of assignments with class filter and submission stats; matches existing homework list aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../contexts/ThemeContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useSchool } from '../../../contexts/SchoolContext';
import { useRoute, RouteProp } from '@react-navigation/native';
import SchoolHeader from '../../../components/common/SchoolHeader';
import { FilterChip } from '../../../components/school/FilterChip';
import { fetchTeacherClasses, fetchTeacherHomework, type TeacherClass, type HomeworkAssignment } from '../../../services/teacher-dashboard';

type NavParams = { TeacherHomework: { schoolId: string } };
type Props = RouteProp<NavParams, 'TeacherHomework'>;

export const TeacherHomeworkScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const route = useRoute<Props>();
  const schoolId = route.params?.schoolId || currentSchool?.id;

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<HomeworkAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<HomeworkAssignment | null>(null);

  const loadClasses = useCallback(async () => {
    if (!schoolId) return;
    try {
      const list = await fetchTeacherClasses(schoolId);
      setClasses(list);
    } catch (e) {
      console.error(e);
    }
  }, [schoolId]);

  const loadHomework = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchTeacherHomework(schoolId, selectedClassId || undefined);
      setAssignments(list);
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
    loadHomework();
  }, [loadHomework]);

  const onRefresh = () => {
    setRefreshing(true);
    loadHomework();
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    screenTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    screenSubtitle: { fontSize: 14, color: colors.text.secondary },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 12, gap: 8 },
    listContent: { paddingBottom: 24, paddingHorizontal: 16 },
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
      ...shadows.sm,
    },
    cardTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
    cardMeta: { fontSize: 13, color: colors.text.secondary, marginBottom: 4 },
    badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 12, fontWeight: '600' },
    loadingWrap: { padding: 24, alignItems: 'center' },
    emptyWrap: { padding: 24, alignItems: 'center' },
    emptyText: { fontSize: 14, color: colors.text.secondary },
    errorWrap: { padding: 16, alignItems: 'center' },
    errorText: { fontSize: 14, color: colors.status.error, marginBottom: 12 },
    retryBtn: { backgroundColor: colors.primary, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    retryBtnText: { color: colors.white, fontWeight: '600' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 },
    modalContent: { backgroundColor: colors.white, borderRadius: 16, padding: 16, maxHeight: '80%' },
    modalTitle: { fontSize: 18, fontWeight: '600', marginBottom: 8 },
    modalBody: { fontSize: 14, color: colors.text.secondary },
    modalClose: { marginTop: 16, alignItems: 'flex-end' },
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
        <Text style={styles.screenTitle}>{t('school.teacher.homework')}</Text>
        <Text style={styles.screenSubtitle}>
          {assignments.length} {t('school.teacher.noAssignments').replace('No ', '')}
        </Text>
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
          <TouchableOpacity style={styles.retryBtn} onPress={loadHomework}>
            <Text style={styles.retryBtnText}>{t('school.teacher.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={assignments}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            !error ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyText}>{t('school.teacher.noAssignments')}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setSelectedAssignment(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMeta}>{item.subject || '—'} • {item.class_name || '—'}</Text>
              <Text style={styles.cardMeta}>
                {new Date(item.due_date).toLocaleDateString()} {item.is_past_due ? ` • ${t('school.teacher.pastDue')}` : ` • ${t('school.teacher.active')}`}
              </Text>
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: '#E8F5E9' }]}>
                  <Text style={[styles.badgeText, { color: '#2E7D32' }]}>
                    {item.submission_count ?? 0}/{item.student_count ?? 0} submitted
                  </Text>
                </View>
                {item.is_past_due && (
                  <View style={[styles.badge, { backgroundColor: '#FFEBEE' }]}>
                    <Text style={[styles.badgeText, { color: '#C62828' }]}>{t('school.teacher.pastDue')}</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      <Modal visible={!!selectedAssignment} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSelectedAssignment(null)}>
          <View style={styles.modalContent}>
            {selectedAssignment && (
              <>
                <Text style={styles.modalTitle}>{selectedAssignment.title}</Text>
                <Text style={styles.modalBody}>{selectedAssignment.description || '—'}</Text>
                <Text style={[styles.modalBody, { marginTop: 8 }]}>
                  {selectedAssignment.submission_count ?? 0}/{selectedAssignment.student_count ?? 0} submitted
                </Text>
                <TouchableOpacity style={styles.modalClose} onPress={() => setSelectedAssignment(null)}>
                  <Text style={[styles.retryBtnText, { color: colors.primary }]}>{t('common.close')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default TeacherHomeworkScreen;
