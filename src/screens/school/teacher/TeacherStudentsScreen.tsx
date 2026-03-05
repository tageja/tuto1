/**
 * Teacher Students Screen
 * List of students across teacher's classes with search and class filter; matches StudentsScreen aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useSchool } from '../../../contexts/SchoolContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import SchoolHeader from '../../../components/common/SchoolHeader';
import { StudentListItem } from '../../../components/school/StudentListItem';
import { FilterChip } from '../../../components/school/FilterChip';
import { fetchTeacherClasses, fetchTeacherStudents, type TeacherClass, type TeacherStudent } from '../../../services/teacher-dashboard';
import type { SchoolStudent } from '../../../types/school';

function toSchoolStudent(s: TeacherStudent, schoolId: string): SchoolStudent {
  const firstName = s.first_name || '';
  const lastName = s.last_name || '';
  const status = s.status === 'active' || s.status === 'Active' ? 'Active' : 'Inactive';
  return {
    id: s.id,
    name: `${firstName} ${lastName}`.trim() || '—',
    schoolId,
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
    address: null,
    status: status as 'Active' | 'Inactive',
    enrollmentDate: null,
    enrolledAt: null,
    photoUrl: null,
  };
}

export const TeacherStudentsScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const navigation = useNavigation<any>();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [students, setStudents] = useState<TeacherStudent[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = useCallback(async () => {
    if (!currentSchool?.id) return;
    try {
      const list = await fetchTeacherClasses(currentSchool.id);
      setClasses(list);
    } catch (e) {
      console.error(e);
    }
  }, [currentSchool?.id]);

  const loadStudents = useCallback(async () => {
    if (!currentSchool?.id) {
      setLoading(false);
      return;
    }
    setError(null);
    try {
      const list = await fetchTeacherStudents(currentSchool.id, selectedClassId || undefined);
      setStudents(list);
    } catch (e: any) {
      setError(e?.message || t('school.teacher.loadError'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentSchool?.id, selectedClassId, t]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    setLoading(true);
    loadStudents();
  }, [loadStudents]);

  const onRefresh = () => {
    setRefreshing(true);
    loadStudents();
  };

  const filtered = students.filter((s) => {
    const name = `${s.first_name} ${s.last_name}`.toLowerCase();
    const q = search.trim().toLowerCase();
    return !q || name.includes(q);
  });

  const handleStudentPress = (studentId: string) => {
    navigation.navigate('TeacherStudentDetail', {
      studentId,
      schoolId: currentSchool?.id,
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    screenTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    screenSubtitle: { fontSize: 14, color: colors.text.secondary },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 16,
      marginVertical: 8,
      backgroundColor: colors.white,
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    searchInput: { flex: 1, paddingHorizontal: 8, paddingVertical: 4, fontSize: 16, color: colors.text.primary },
    filterRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 8, gap: 8 },
    listContent: { paddingBottom: 24 },
    loadingWrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: 64 },
    loadingText: { fontSize: 14, color: colors.text.secondary, marginTop: 12 },
    emptyWrap: { alignItems: 'center', paddingVertical: 64, paddingHorizontal: 32 },
    emptyTitle: { fontSize: 18, color: colors.text.primary, marginTop: 16, fontWeight: '600' },
    emptySubtitle: { fontSize: 14, color: colors.text.secondary, marginTop: 8, textAlign: 'center' },
    errorWrap: { padding: spacing.lg, alignItems: 'center' },
    errorText: { fontSize: typography.fontSize.md, color: colors.status.error, textAlign: 'center', marginBottom: spacing.md },
    retryButton: { backgroundColor: colors.primary, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: 12 },
    retryText: { color: colors.white, fontWeight: '600', fontSize: typography.fontSize.sm },
  });

  if (!currentSchool) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.emptyWrap}>
          <Text style={styles.emptySubtitle}>{t('school.dashboardSchool.noSchoolJoinedMessage')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      <View style={styles.headerSection}>
        <Text style={styles.screenTitle}>{t('school.teacher.students')}</Text>
        <Text style={styles.screenSubtitle}>{t('school.students.subtitle')}</Text>
      </View>
      <View style={styles.searchBar}>
        <MaterialIcons name="search" size={20} color={colors.text.secondary} />
        <TextInput
          style={styles.searchInput}
          placeholder={t('common.search')}
          placeholderTextColor={colors.text.light}
          value={search}
          onChangeText={setSearch}
        />
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
          <TouchableOpacity style={styles.retryButton} onPress={loadStudents}>
            <Text style={styles.retryText}>{t('school.teacher.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
      {loading && !refreshing ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            !error ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>{t('school.teacher.noStudents')}</Text>
                <Text style={styles.emptySubtitle}>{t('school.students.noStudentsSubtitle')}</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <StudentListItem
              student={toSchoolStudent(item, currentSchool.id)}
              onPress={() => handleStudentPress(item.id)}
            />
          )}
        />
      )}
    </View>
  );
};

export default TeacherStudentsScreen;
