/**
 * Teacher Classes Screen
 * List of teacher's assigned classes; matches ClassesScreen aesthetics.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSchool } from '../../../contexts/SchoolContext';
import { useLanguage } from '../../../contexts/LanguageContext';
import { useTheme } from '../../../contexts/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import SchoolHeader from '../../../components/common/SchoolHeader';
import { ClassListItem } from '../../../components/school/ClassListItem';
import { fetchTeacherClasses, type TeacherClass } from '../../../services/teacher-dashboard';
import type { SchoolClass } from '../../../services/supabase-classes';

function toSchoolClass(c: TeacherClass, schoolId: string): SchoolClass {
  return {
    id: c.id,
    school_id: c.school_id || schoolId,
    name: c.name,
    grade_level: c.grade_level,
    room_number: c.room_number,
    capacity: c.capacity,
    status: c.status || 'active',
    teacher_name: '',
    student_count: 0,
  };
}

export const TeacherClassesScreen: React.FC = () => {
  const { colors, spacing, typography } = useTheme();
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const navigation = useNavigation<any>();

  const [classes, setClasses] = useState<TeacherClass[]>([]);
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
      const data = await fetchTeacherClasses(currentSchool.id);
      setClasses(data);
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

  const handleClassPress = (classId: string) => {
    navigation.navigate('TeacherClassDetail', {
      classId,
      schoolId: currentSchool?.id,
    });
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    headerSection: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
    screenTitle: { fontSize: 24, fontWeight: '700', color: colors.text.primary, marginBottom: 4 },
    screenSubtitle: { fontSize: 14, color: colors.text.secondary },
    listContent: { paddingBottom: 24, paddingHorizontal: 8 },
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

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.headerSection}>
          <Text style={styles.screenTitle}>{t('school.teacher.classes')}</Text>
          <Text style={styles.screenSubtitle}>{t('school.classes.subtitle')}</Text>
        </View>
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
      <View style={styles.headerSection}>
        <Text style={styles.screenTitle}>{t('school.teacher.classes')}</Text>
        <Text style={styles.screenSubtitle}>{t('school.classes.subtitle')}</Text>
      </View>
      {error && (
        <View style={styles.errorWrap}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadData}>
            <Text style={styles.retryText}>{t('school.teacher.retry')}</Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={classes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTitle}>{t('school.teacher.noClasses')}</Text>
              <Text style={styles.emptySubtitle}>{t('school.classes.noClassesSubtitle')}</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <ClassListItem
            classData={toSchoolClass(item, currentSchool.id)}
            onPress={() => handleClassPress(item.id)}
          />
        )}
      />
    </View>
  );
};

export default TeacherClassesScreen;
