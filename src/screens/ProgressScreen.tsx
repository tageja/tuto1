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
import { subjects, Subject } from '../data/subjects';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface ProgressScreenProps {
  navigation: any;
}

interface ProgressData {
  month: string;
  score: number;
}

interface SubjectProgress {
  id: string;
  subject: Subject;
  currentScore: number;
  previousScore: number;
  trend: 'up' | 'down' | 'stable';
  needsAttention: boolean;
  alertLevel: 'none' | 'warning' | 'critical';
}

export const ProgressScreen: React.FC<ProgressScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


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
    periodTabs: {
      flexDirection: 'row',
      backgroundColor: colors.background.secondary,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.md,
      borderRadius: 12,
      padding: spacing.xs,
    },
    periodTab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: 8,
    },
    activePeriodTab: {
      backgroundColor: colors.background.primary,
    },
    periodTabText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    activePeriodTabText: {
      color: colors.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    graphContainer: {
      padding: spacing.lg,
    },
    graphTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    graphArea: {
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    graphBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-around',
      height: 140,
    },
    barContainer: {
      alignItems: 'center',
      flex: 1,
    },
    bar: {
      width: 20,
      backgroundColor: colors.primary,
      borderRadius: 10,
      marginBottom: spacing.xs,
    },
    barLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    barValue: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginTop: spacing.xs,
    },
    subjectsSection: {
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
    subjectHeader: {
      flexDirection: 'row',
      alignItems: 'center',
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
    scoreContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    currentScore: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
    },
    scoreChange: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    scoreChangeText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
    },
    trendContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    trendText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
    },
    alertBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    attentionContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    attentionText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      flex: 1,
    },
    alertsSection: {
      padding: spacing.lg,
    },
    alertCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.sm,
      borderLeftWidth: 4,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    alertInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },
    alertTitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    alertDescription: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
  }); 

  const { t, language } = useLanguage();
  const [selectedPeriod, setSelectedPeriod] = useState<'1m' | '3m' | '6m' | '12m'>('3m');
  
  const [progressData] = useState<ProgressData[]>([
    { month: 'Oct', score: 75 },
    { month: 'Nov', score: 82 },
    { month: 'Dec', score: 78 },
    { month: 'Jan', score: 85 },
  ]);

  // Get academic subjects from the subjects data
  const academicSubjects = subjects.filter((subject: Subject) => subject.category === 'academic');

  const [subjectProgress] = useState<SubjectProgress[]>([
    {
      id: 'math',
      subject: academicSubjects.find((s: Subject) => s.key === 'math')!,
      currentScore: 85,
      previousScore: 78,
      trend: 'up',
      needsAttention: false,
      alertLevel: 'none',
    },
    {
      id: 'english',
      subject: academicSubjects.find((s: Subject) => s.key === 'english')!,
      currentScore: 92,
      previousScore: 95,
      trend: 'down',
      needsAttention: true,
      alertLevel: 'warning',
    },
    {
      id: 'physics',
      subject: academicSubjects.find((s: Subject) => s.key === 'physics')!,
      currentScore: 72,
      previousScore: 80,
      trend: 'down',
      needsAttention: true,
      alertLevel: 'critical',
    },
    {
      id: 'history',
      subject: academicSubjects.find((s: Subject) => s.key === 'history')!,
      currentScore: 88,
      previousScore: 85,
      trend: 'up',
      needsAttention: false,
      alertLevel: 'none',
    },
  ]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-flat';
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return colors.status.success;
      case 'down':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const getAlertColor = (level: string) => {
    switch (level) {
      case 'warning':
        return colors.status.warning;
      case 'critical':
        return colors.status.error;
      default:
        return colors.text.secondary;
    }
  };

  const renderPeriodTabs = () => (
    <View style={styles.periodTabs}>
      {[
        { key: '1m', label: '1 Month' },
        { key: '3m', label: '3 Months' },
        { key: '6m', label: '6 Months' },
        { key: '12m', label: '12 Months' },
      ].map((period) => (
        <TouchableOpacity
          key={period.key}
          style={[
            styles.periodTab,
            selectedPeriod === period.key && styles.activePeriodTab
          ]}
          onPress={() => setSelectedPeriod(period.key as any)}
        >
          <Text style={[
            styles.periodTabText,
            selectedPeriod === period.key && styles.activePeriodTabText
          ]}>
            {period.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderProgressGraph = () => (
    <View style={styles.graphContainer}>
      <Text style={styles.graphTitle}>{t('progress.overallProgress')}</Text>
      <View style={styles.graphArea}>
        <View style={styles.graphBars}>
          {progressData.map((data, index) => (
            <View key={index} style={styles.barContainer}>
                              <View 
                  style={[
                    styles.bar, 
                    { height: (data.score / 100) * 120 }
                  ]} 
                />
              <Text style={styles.barLabel}>{data.month}</Text>
              <Text style={styles.barValue}>{data.score}%</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderSubjectCard = (subject: SubjectProgress) => (
    <View key={subject.id} style={styles.subjectCard}>
      <View style={styles.subjectHeader}>
        <View style={styles.subjectIcon}>
          <MaterialIcons name={subject.subject.icon as any} size={24} color={colors.primary} />
        </View>
        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>
            {language === 'en' ? subject.subject.nameEn : subject.subject.nameVi}
          </Text>
          <View style={styles.scoreContainer}>
            <Text style={styles.currentScore}>{subject.currentScore}%</Text>
            <View style={styles.scoreChange}>
              <MaterialIcons 
                name={getTrendIcon(subject.trend) as any} 
                size={16} 
                color={getTrendColor(subject.trend)} 
              />
              <Text style={[styles.scoreChangeText, { color: getTrendColor(subject.trend) }]}>
                {subject.currentScore > subject.previousScore ? '+' : ''}
                {subject.currentScore - subject.previousScore}%
              </Text>
            </View>
          </View>
        </View>
        {subject.needsAttention && (
          <View style={[styles.alertBadge, { backgroundColor: getAlertColor(subject.alertLevel) }]}>
            <MaterialIcons 
              name={subject.alertLevel === 'critical' ? 'error' : 'warning'} 
              size={16} 
              color={colors.background.primary} 
            />
          </View>
        )}
      </View>
    </View>
  );

  const renderAlerts = () => {
    const criticalSubjects = subjectProgress.filter(s => s.alertLevel === 'critical');
    const warningSubjects = subjectProgress.filter(s => s.alertLevel === 'warning');

    if (criticalSubjects.length === 0 && warningSubjects.length === 0) {
      return null;
    }

    return (
      <View style={styles.alertsSection}>
        <Text style={styles.sectionTitle}>{t('progress.alerts')}</Text>
        {criticalSubjects.map(subject => (
          <View key={subject.id} style={[styles.alertCard, { borderLeftColor: colors.status.error }]}>
            <MaterialIcons name="error" size={20} color={colors.status.error} />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{subject.subject.name}</Text>
              <Text style={styles.alertDescription}>
                Performance dropped by {subject.previousScore - subject.currentScore}% this month
              </Text>
            </View>
          </View>
        ))}
        {warningSubjects.map(subject => (
          <View key={subject.id} style={[styles.alertCard, { borderLeftColor: colors.status.warning }]}>
            <MaterialIcons name="warning" size={20} color={colors.status.warning} />
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>{subject.subject.name}</Text>
              <Text style={styles.alertDescription}>
                Slight decline in performance, consider extra practice
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

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
        <Text style={styles.headerTitle}>{t('progress.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Tabs */}
        {renderPeriodTabs()}

        {/* Progress Graph */}
        {renderProgressGraph()}

        {/* Subject Performance */}
        <View style={styles.subjectsSection}>
          <Text style={styles.sectionTitle}>{t('progress.subjectPerformance')}</Text>
          {subjectProgress.map(renderSubjectCard)}
        </View>

        {/* Alerts */}
        {renderAlerts()}
      </ScrollView>
    </SafeAreaView>
  );
};
