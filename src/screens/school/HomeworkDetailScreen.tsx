/**
 * Homework Detail Screen
 * Displays detailed information about an assignment and student submission status
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import SchoolHeader from '../../components/common/SchoolHeader';
import { supabase } from '../../config/supabase';
import { RootStackParamList } from '../../navigation/AppNavigator';

type HomeworkDetailRouteProp = RouteProp<RootStackParamList, 'SchoolHomeworkDetail'>;

interface SubmissionRecord {
  id: string;
  student_name: string;
  status: string;
  score: number | null;
  submitted_at: string | null;
}

const HomeworkDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<HomeworkDetailRouteProp>();
  const { currentSchool } = useSchool();
  const { t } = useLanguage();
  const { assignmentId } = route.params || {};

  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<SubmissionRecord[]>([]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.primary,
    },
    headerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing.xs,
    },
    headerBackText: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.primary,
      marginLeft: spacing.xs,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
    },
    content: {
      flex: 1,
    },
    detailsCard: {
      backgroundColor: colors.background.primary,
      margin: spacing.md,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      ...shadows.sm,
    },
    title: {
      fontSize: typography.fontSize.xl,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: spacing.xs,
      flexWrap: 'wrap',
      gap: spacing.md,
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    metaText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    descriptionContainer: {
      marginTop: spacing.md,
      paddingTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    descriptionLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    descriptionText: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      lineHeight: 22,
    },
    submissionsSection: {
      flex: 1,
      backgroundColor: colors.background.primary,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      padding: spacing.md,
      ...shadows.sm,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    submissionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    studentInfo: {
      flex: 1,
    },
    studentName: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
    },
    submissionStatus: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginTop: 2,
    },
    scoreContainer: {
      alignItems: 'flex-end',
    },
    scoreText: {
      fontSize: typography.fontSize.md,
      fontWeight: '700',
      color: colors.primary,
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      marginTop: 4,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: colors.white,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.text.secondary,
      marginTop: spacing.lg,
    },
  });

  const loadData = useCallback(async () => {
    if (!assignmentId) return;

    try {
      setLoading(true);
      
      // Fetch assignment details
      const { data: assignmentData, error: assignError } = await supabase
        .from('school_homework_assignments')
        .select(`
          *,
          school_classes (name)
        `)
        .eq('id', assignmentId)
        .single();

      if (assignError) throw assignError;
      setAssignment(assignmentData);

      // Fetch submissions
      const { data: submissionsData, error: subsError } = await supabase
        .from('school_homework_submissions')
        .select(`
          id,
          status,
          score,
          submitted_at,
          school_students (first_name, last_name)
        `)
        .eq('assignment_id', assignmentId);

      if (subsError) throw subsError;

      const formattedSubmissions = (submissionsData || []).map((sub: any) => ({
        id: sub.id,
        student_name: `${sub.school_students?.first_name || ''} ${sub.school_students?.last_name || ''}`.trim(),
        status: sub.status,
        score: sub.score,
        submitted_at: sub.submitted_at,
      }));

      setSubmissions(formattedSubmissions);

    } catch (error) {
      console.error('Error loading assignment details:', error);
      Alert.alert(t('common.error'), 'Failed to load assignment details');
    } finally {
      setLoading(false);
    }
  }, [assignmentId, t]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'graded':
        return '#81C784'; // Green
      case 'pending':
        return '#FFE082'; // Yellow
      case 'late':
        return '#EF5350'; // Red
      default:
        return colors.disabled;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.container}>
        <SchoolHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>{t('common.notFound')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SchoolHeader />
      
      {/* Navigation Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          <Text style={styles.headerBackText}>{t('school.homework.title')}</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('school.homework.details')}</Text>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.detailsCard}>
          <Text style={styles.title}>{assignment.title}</Text>
          
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <MaterialIcons name="class" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>{assignment.school_classes?.name || 'All Classes'}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="subject" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>{assignment.subject}</Text>
            </View>
            <View style={styles.metaItem}>
              <MaterialIcons name="event" size={16} color={colors.text.secondary} />
              <Text style={styles.metaText}>{t('common.due')}: {formatDate(assignment.due_date)}</Text>
            </View>
          </View>

          {assignment.description && (
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>{t('school.homework.createModal.descriptionLabel')}</Text>
              <Text style={styles.descriptionText}>{assignment.description}</Text>
            </View>
          )}
        </View>

        <View style={styles.submissionsSection}>
          <Text style={styles.sectionTitle}>{t('school.homework.list.submissions')}</Text>
          {submissions.length === 0 ? (
            <Text style={styles.emptyText}>{t('school.homework.list.noSubmissions')}</Text>
          ) : (
            submissions.map((sub) => (
              <View key={sub.id} style={styles.submissionItem}>
                <View style={styles.studentInfo}>
                  <Text style={styles.studentName}>{sub.student_name}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(sub.status), alignSelf: 'flex-start' }]}>
                    <Text style={styles.statusText}>{t(`school.homework.status.${sub.status}`)}</Text>
                  </View>
                </View>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>
                    {sub.score !== null ? `${sub.score}%` : '--'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default HomeworkDetailScreen;


