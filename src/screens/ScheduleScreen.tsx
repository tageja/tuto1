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

interface ScheduleScreenProps {
  navigation: any;
}

interface ClassSchedule {
  id: string;
  subject: Subject;
  teacher: string;
  date: string;
  time: string;
  duration: number;
  type: 'online' | 'offline';
  status: 'scheduled' | 'completed' | 'cancelled';
}

export const ScheduleScreen: React.FC<ScheduleScreenProps> = ({ navigation }) => {
  const { t, language } = useLanguage();
  const [selectedWeek, setSelectedWeek] = useState(0);
  
  // Get academic subjects from the subjects data
  const academicSubjects = subjects.filter((subject: Subject) => subject.category === 'academic');

  const [weeklySchedule] = useState<ClassSchedule[]>([
    {
      id: '1',
      subject: academicSubjects.find((s: Subject) => s.key === 'math')!,
      teacher: 'Ms. Sarah Johnson',
      date: '2024-01-22',
      time: '09:00',
      duration: 60,
      type: 'online',
      status: 'scheduled',
    },
    {
      id: '2',
      subject: academicSubjects.find((s: Subject) => s.key === 'english')!,
      teacher: 'Mr. David Chen',
      date: '2024-01-22',
      time: '14:00',
      duration: 45,
      type: 'offline',
      status: 'scheduled',
    },
    {
      id: '3',
      subject: academicSubjects.find((s: Subject) => s.key === 'physics')!,
      teacher: 'Dr. Emily Rodriguez',
      date: '2024-01-23',
      time: '10:30',
      duration: 90,
      type: 'online',
      status: 'scheduled',
    },
    {
      id: '4',
      subject: academicSubjects.find((s: Subject) => s.key === 'math')!,
      teacher: 'Ms. Sarah Johnson',
      date: '2024-01-24',
      time: '15:00',
      duration: 60,
      type: 'offline',
      status: 'scheduled',
    },
    {
      id: '5',
      subject: academicSubjects.find((s: Subject) => s.key === 'history')!,
      teacher: 'Prof. Michael Brown',
      date: '2024-01-25',
      time: '11:00',
      duration: 45,
      type: 'online',
      status: 'scheduled',
    },
    {
      id: '6',
      subject: academicSubjects.find((s: Subject) => s.key === 'english')!,
      teacher: 'Mr. David Chen',
      date: '2024-01-26',
      time: '13:30',
      duration: 60,
      type: 'offline',
      status: 'scheduled',
    },
  ]);

  const getDayColor = (day: string) => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return day === today ? colors.primary : colors.text.secondary;
  };

  const getTypeColor = (type: string) => {
    return type === 'online' ? colors.status.success : colors.status.warning;
  };

  const getTypeIcon = (type: string) => {
    return type === 'online' ? 'videocam' : 'location-on';
  };

  const renderClassCard = (classItem: ClassSchedule) => (
    <View key={classItem.id} style={styles.classCard}>
      <View style={styles.classHeader}>
        <View style={styles.subjectContainer}>
          <Text style={styles.subjectName}>
            {language === 'en' ? classItem.subject.nameEn : classItem.subject.nameVi}
          </Text>
          <Text style={styles.teacherName}>{classItem.teacher}</Text>
        </View>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(classItem.type) }]}>
          <MaterialIcons name={getTypeIcon(classItem.type) as any} size={16} color={colors.background.primary} />
          <Text style={styles.typeText}>{classItem.type}</Text>
        </View>
      </View>
      <View style={styles.classDetails}>
        <View style={styles.detailItem}>
          <MaterialIcons name="event" size={16} color={colors.text.secondary} />
          <Text style={[styles.detailText, { color: getDayColor(classItem.date) }]}>
            {new Date(classItem.date).toLocaleDateString(language, { weekday: 'long' })}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="schedule" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{classItem.time}</Text>
        </View>
        <View style={styles.detailItem}>
          <MaterialIcons name="timer" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{classItem.duration} min</Text>
        </View>
      </View>
    </View>
  );

  const renderWeekSection = (weekSchedule: ClassSchedule[]) => (
    <View key={`week-${selectedWeek}`} style={styles.weekSection}>
      <Text style={styles.weekTitle}>{t('schedule.week')}</Text>
      {weekSchedule.map(renderClassCard)}
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
        <Text style={styles.headerTitle}>{t('schedule.title')}</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AllSubjects')}
        >
          <MaterialIcons name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Summary Stats */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <MaterialIcons name="schedule" size={24} color={colors.primary} />
            <Text style={styles.summaryValue}>6</Text>
            <Text style={styles.summaryLabel}>{t('schedule.totalClasses')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="videocam" size={24} color={colors.status.success} />
            <Text style={styles.summaryValue}>3</Text>
            <Text style={styles.summaryLabel}>{t('schedule.onlineClasses')}</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="location-on" size={24} color={colors.status.warning} />
            <Text style={styles.summaryValue}>3</Text>
            <Text style={styles.summaryLabel}>{t('schedule.offlineClasses')}</Text>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.scheduleContainer}>
          {renderWeekSection(weeklySchedule)}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('AllSubjects')}
          >
            <MaterialIcons name="search" size={20} color={colors.primary} />
            <Text style={styles.quickActionText}>{t('schedule.findMoreTeachers')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickAction}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={20} color={colors.primary} />
            <Text style={styles.quickActionText}>{t('schedule.setReminders')}</Text>
          </TouchableOpacity>
        </View>
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
  addButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginTop: spacing.xs,
  },
  summaryLabel: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  scheduleContainer: {
    padding: spacing.lg,
  },
  weekSection: {
    marginBottom: spacing.xl,
  },
  weekTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  classCard: {
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
  classHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  subjectContainer: {
    flex: 1,
  },
  subjectName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  teacherName: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  typeText: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
    textTransform: 'capitalize',
  },
  classDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    gap: spacing.md,
  },
  quickAction: {
    flex: 1,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
}); 