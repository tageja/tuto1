import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { subjects, Subject } from '../data/subjects';

const { width } = Dimensions.get('window');

interface HomeworkScreenProps {
  navigation: any;
}

interface SubjectWithHomework {
  id: string;
  subject: Subject;
  attemptedCount: number;
  totalAssignments: number;
  averageScore: number;
}

interface Exercise {
  id: string;
  title: string;
  date: string;
  score: number;
  maxScore: number;
  status: 'completed' | 'pending' | 'overdue';
}

interface UpcomingAssignment {
  id: string;
  title: string;
  subject: Subject;
  deadline: string;
  daysLeft: number;
}

export const HomeworkScreen: React.FC<HomeworkScreenProps> = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  
  // Get academic subjects from the subjects data
  const academicSubjects = subjects.filter(subject => subject.category === 'academic');
  
  const [subjectsWithHomework] = useState<SubjectWithHomework[]>([
    {
      id: 'math',
      subject: academicSubjects.find(s => s.key === 'math')!,
      attemptedCount: 8,
      totalAssignments: 12,
      averageScore: 85,
    },
    {
      id: 'english',
      subject: academicSubjects.find(s => s.key === 'english')!,
      attemptedCount: 6,
      totalAssignments: 8,
      averageScore: 92,
    },
    {
      id: 'physics',
      subject: academicSubjects.find(s => s.key === 'physics')!,
      attemptedCount: 4,
      totalAssignments: 6,
      averageScore: 78,
    },
    {
      id: 'history',
      subject: academicSubjects.find(s => s.key === 'history')!,
      attemptedCount: 3,
      totalAssignments: 5,
      averageScore: 88,
    },
  ]);

  const [exercises] = useState<Exercise[]>([
    {
      id: '1',
      title: 'Algebra Basics - Chapter 3',
      date: '2024-01-15',
      score: 85,
      maxScore: 100,
      status: 'completed',
    },
    {
      id: '2',
      title: 'Geometry Problems',
      date: '2024-01-12',
      score: 92,
      maxScore: 100,
      status: 'completed',
    },
    {
      id: '3',
      title: 'Trigonometry Quiz',
      date: '2024-01-10',
      score: 78,
      maxScore: 100,
      status: 'completed',
    },
    {
      id: '4',
      title: 'Calculus Introduction',
      date: '2024-01-08',
      score: 95,
      maxScore: 100,
      status: 'completed',
    },
    {
      id: '5',
      title: 'Statistics Problems',
      date: '2024-01-05',
      score: 88,
      maxScore: 100,
      status: 'completed',
    },
  ]);

  const [upcomingAssignments] = useState<UpcomingAssignment[]>([
    {
      id: '1',
      title: 'Advanced Algebra',
      subject: academicSubjects.find(s => s.key === 'math')!,
      deadline: '2024-01-25',
      daysLeft: 3,
    },
    {
      id: '2',
      title: 'Essay Writing',
      subject: academicSubjects.find(s => s.key === 'english')!,
      deadline: '2024-01-28',
      daysLeft: 6,
    },
    {
      id: '3',
      title: 'Physics Lab Report',
      subject: academicSubjects.find(s => s.key === 'physics')!,
      deadline: '2024-01-30',
      daysLeft: 8,
    },
  ]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.status.success;
    if (score >= 70) return colors.status.warning;
    return colors.status.error;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return colors.status.success;
      case 'pending':
        return colors.status.warning;
      case 'overdue':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'overdue':
        return 'Overdue';
      default:
        return '';
    }
  };

  const renderSubjectCard = (subject: SubjectWithHomework) => (
    <TouchableOpacity
      key={subject.id}
      style={[styles.subjectCard, selectedSubject === subject.id && styles.selectedCard]}
      onPress={() => setSelectedSubject(selectedSubject === subject.id ? null : subject.id)}
    >
      <View style={styles.subjectHeader}>
        <View style={styles.subjectIcon}>
          <MaterialIcons name={subject.subject.icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>
            {language === 'en' ? subject.subject.nameEn : subject.subject.nameVi}
          </Text>
          <Text style={styles.subjectStats}>
            {subject.attemptedCount}/{subject.totalAssignments} assignments
          </Text>
        </View>
        <View style={styles.subjectScore}>
          <Text style={styles.scoreText}>{subject.averageScore}%</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderExerciseItem = (exercise: Exercise) => (
    <View key={exercise.id} style={styles.exerciseCard}>
      <View style={styles.exerciseHeader}>
        <Text style={styles.exerciseTitle}>{exercise.title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(exercise.status) }]}>
          <Text style={styles.statusText}>{getStatusText(exercise.status)}</Text>
        </View>
      </View>
      <View style={styles.exerciseDetails}>
        <View style={styles.exerciseInfo}>
          <MaterialIcons name="event" size={16} color={colors.text.secondary} />
          <Text style={styles.exerciseDate}>{exercise.date}</Text>
        </View>
        {exercise.status === 'completed' && (
          <View style={styles.scoreInfo}>
            <MaterialIcons name="star" size={16} color={getScoreColor(exercise.score)} />
            <Text style={[styles.scoreValue, { color: getScoreColor(exercise.score) }]}>
              {exercise.score}/{exercise.maxScore}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  const renderUpcomingAssignment = (assignment: UpcomingAssignment) => (
    <View key={assignment.id} style={styles.upcomingCard}>
      <View style={styles.upcomingHeader}>
        <Text style={styles.upcomingTitle}>{assignment.title}</Text>
        <View style={styles.deadlineContainer}>
          <MaterialIcons name="schedule" size={16} color={colors.text.secondary} />
          <Text style={styles.deadlineText}>{assignment.deadline}</Text>
        </View>
      </View>
      <View style={styles.upcomingInfo}>
        <MaterialIcons name="school" size={16} color={colors.text.secondary} />
        <Text style={styles.upcomingSubject}>
          {language === 'en' ? assignment.subject.nameEn : assignment.subject.nameVi}
        </Text>
      </View>
      <View style={styles.upcomingInfo}>
        <MaterialIcons name="warning" size={16} color={colors.text.secondary} />
        <Text style={styles.daysLeft}>
          {assignment.daysLeft} {assignment.daysLeft === 1 ? 'day' : 'days'} left
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('homework.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!selectedSubject ? (
          // Subjects List
          <View style={styles.subjectsContainer}>
            <Text style={styles.sectionTitle}>{t('homework.subjectsWithHomework')}</Text>
            {subjectsWithHomework.map(renderSubjectCard)}
          </View>
        ) : (
          // Subject Details
          <View style={styles.detailsContainer}>
            <TouchableOpacity
              style={styles.backToSubjects}
              onPress={() => setSelectedSubject(null)}
            >
              <MaterialIcons name="arrow-back" size={20} color={colors.primary} />
              <Text style={styles.backToSubjectsText}>{t('homework.backToSubjects')}</Text>
            </TouchableOpacity>

            {/* Exercises Section */}
            <View style={styles.exercisesSection}>
              <Text style={styles.sectionTitle}>{t('homework.exercises')}</Text>
              {exercises.map(renderExerciseItem)}
            </View>

            {/* Upcoming Assignments Section */}
            <View style={styles.upcomingSection}>
              <Text style={styles.sectionTitle}>{t('homework.upcomingAssignments')}</Text>
              {upcomingAssignments.map(renderUpcomingAssignment)}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  subjectsContainer: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  subjectCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedCard: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  subjectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  subjectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  subjectInfo: {
    flex: 1,
  },
  subjectName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subjectStats: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  subjectScore: {
    alignItems: 'center',
  },
  scoreText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
  },
  scoreLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.border.light,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  detailsContainer: {
    padding: spacing.lg,
  },
  backToSubjects: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  backToSubjectsText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
    marginLeft: spacing.xs,
  },
  exercisesSection: {
    marginBottom: spacing.xl,
  },
  exerciseCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  exerciseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  exerciseTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
  },
  exerciseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  exerciseDate: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  scoreInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  scoreValue: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.bold,
  },
  upcomingSection: {
    marginBottom: spacing.xl,
  },
  upcomingCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  upcomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  upcomingTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    flex: 1,
  },
  deadlineBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  deadlineText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
  },
  upcomingDetails: {
    gap: spacing.xs,
  },
  upcomingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  upcomingSubject: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  upcomingDeadline: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  daysLeft: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
}); 