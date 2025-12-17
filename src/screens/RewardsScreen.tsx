import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';


const { width } = Dimensions.get('window');

interface RewardsScreenProps {
  navigation: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xpReward: number;
  tokenReward: number;
  isUnlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface RewardHistory {
  id: string;
  type: 'xp' | 'tokens';
  amount: number;
  reason: string;
  date: string;
}

export const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
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
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background.secondary,
      marginHorizontal: spacing.lg,
      borderRadius: 12,
      padding: spacing.xs,
    },
    tab: {
      flex: 1,
      paddingVertical: spacing.sm,
      alignItems: 'center',
      borderRadius: 8,
    },
    activeTab: {
      backgroundColor: colors.background.primary,
    },
    tabText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
    },
    activeTabText: {
      color: colors.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    content: {
      flex: 1,
    },
    overviewContainer: {
      padding: spacing.lg,
    },
    levelCard: {
      backgroundColor: colors.background.secondary,
      borderRadius: 16,
      padding: spacing.lg,
      marginBottom: spacing.lg,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    levelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    levelTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginLeft: spacing.sm,
    },
    progressContainer: {
      marginTop: spacing.sm,
    },
    progressBar: {
      height: 8,
      backgroundColor: colors.border.light,
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: colors.primary,
      borderRadius: 4,
    },
    progressText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.md,
      marginBottom: spacing.lg,
    },
    statCard: {
      width: (width - spacing.lg * 3) / 2,
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
    statValue: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginTop: spacing.xs,
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginTop: spacing.xs,
      textAlign: 'center',
    },
    quickActionsContainer: {
      flexDirection: 'row',
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
    achievementsContainer: {
      padding: spacing.lg,
    },
    achievementCard: {
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
    achievementHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    achievementIcon: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    achievementInfo: {
      flex: 1,
    },
    achievementTitle: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    achievementDescription: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    achievementRewards: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    rewardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    rewardText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
    },
    historyContainer: {
      padding: spacing.lg,
    },
    historyCard: {
      flexDirection: 'row',
      alignItems: 'center',
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
    historyIcon: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
    },
    historyInfo: {
      flex: 1,
    },
    historyReason: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    historyDate: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.regular,
      color: colors.text.secondary,
    },
    historyAmount: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.bold,
    },
  }); 

  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'history'>('overview');
  
  const [studentStats, setStudentStats] = useState({
    xp: 1250,
    tokens: 85,
    level: 8,
    streak: 12,
    totalAchievements: 15,
    unlockedAchievements: 8,
  });

  const [achievements] = useState<Achievement[]>([
    {
      id: '1',
      title: t('rewards.firstClass'),
      description: t('rewards.firstClassDesc'),
      icon: 'school',
      xpReward: 50,
      tokenReward: 10,
      isUnlocked: true,
      progress: 1,
      maxProgress: 1,
    },
    {
      id: '2',
      title: t('rewards.homeworkStreak'),
      description: t('rewards.homeworkStreakDesc'),
      icon: 'assignment',
      xpReward: 100,
      tokenReward: 20,
      isUnlocked: true,
      progress: 7,
      maxProgress: 7,
    },
    {
      id: '3',
      title: t('rewards.perfectScore'),
      description: t('rewards.perfectScoreDesc'),
      icon: 'star',
      xpReward: 200,
      tokenReward: 50,
      isUnlocked: false,
      progress: 2,
      maxProgress: 5,
    },
    {
      id: '4',
      title: t('rewards.attendance'),
      description: t('rewards.attendanceDesc'),
      icon: 'schedule',
      xpReward: 150,
      tokenReward: 30,
      isUnlocked: true,
      progress: 10,
      maxProgress: 10,
    },
    {
      id: '5',
      title: t('rewards.subjectMaster'),
      description: t('rewards.subjectMasterDesc'),
      icon: 'psychology',
      xpReward: 300,
      tokenReward: 75,
      isUnlocked: false,
      progress: 3,
      maxProgress: 10,
    },
  ]);

  const [rewardHistory] = useState<RewardHistory[]>([
    {
      id: '1',
      type: 'xp',
      amount: 50,
      reason: t('rewards.completedHomework'),
      date: '2024-01-15',
    },
    {
      id: '2',
      type: 'tokens',
      amount: 10,
      reason: t('rewards.attendedClass'),
      date: '2024-01-14',
    },
    {
      id: '3',
      type: 'xp',
      amount: 100,
      reason: t('rewards.achievementUnlocked'),
      date: '2024-01-13',
    },
    {
      id: '4',
      type: 'tokens',
      amount: 20,
      reason: t('rewards.weeklyStreak'),
      date: '2024-01-12',
    },
  ]);

  const getLevelProgress = () => {
    const xpForCurrentLevel = studentStats.level * 100;
    const xpForNextLevel = (studentStats.level + 1) * 100;
    const progress = ((studentStats.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;
    return Math.min(progress, 100);
  };

  const renderOverview = () => (
    <View style={styles.overviewContainer}>
      {/* Level Progress */}
      <View style={styles.levelCard}>
        <View style={styles.levelHeader}>
          <MaterialIcons name="emoji-events" size={32} color="#FFD700" />
          <Text style={styles.levelTitle}>{t('rewards.level')} {studentStats.level}</Text>
        </View>
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getLevelProgress()}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {studentStats.xp} / {(studentStats.level + 1) * 100} XP
          </Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialIcons name="star" size={24} color="#FFD700" />
          <Text style={styles.statValue}>{studentStats.xp}</Text>
          <Text style={styles.statLabel}>{t('rewards.totalXp')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="monetization-on" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{studentStats.tokens}</Text>
          <Text style={styles.statLabel}>{t('rewards.tokens')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF6B35" />
          <Text style={styles.statValue}>{studentStats.streak}</Text>
          <Text style={styles.statLabel}>{t('rewards.streak')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="emoji-events" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{studentStats.unlockedAchievements}</Text>
          <Text style={styles.statLabel}>{t('rewards.achievements')}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => navigation.navigate('TutoStore')}
        >
          <MaterialIcons name="store" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>{t('rewards.visitStore')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.quickAction}
          onPress={() => setActiveTab('achievements')}
        >
          <MaterialIcons name="emoji-events" size={24} color={colors.primary} />
          <Text style={styles.quickActionText}>{t('rewards.viewAchievements')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.achievementsContainer}>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={styles.achievementCard}>
          <View style={styles.achievementHeader}>
            <View style={[
              styles.achievementIcon,
              { backgroundColor: achievement.isUnlocked ? colors.status.success : colors.border.medium }
            ]}>
              <MaterialIcons 
                name={achievement.icon as any} 
                size={24} 
                color={achievement.isUnlocked ? colors.background.primary : colors.text.secondary} 
              />
            </View>
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              <View style={styles.achievementRewards}>
                <View style={styles.rewardItem}>
                  <MaterialIcons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rewardText}>+{achievement.xpReward} XP</Text>
                </View>
                <View style={styles.rewardItem}>
                  <MaterialIcons name="monetization-on" size={16} color="#4CAF50" />
                  <Text style={styles.rewardText}>+{achievement.tokenReward} {t('rewards.tokens')}</Text>
                </View>
              </View>
            </View>
            {achievement.isUnlocked && (
              <MaterialIcons name="check-circle" size={24} color={colors.status.success} />
            )}
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { 
                    width: `${(achievement.progress / achievement.maxProgress) * 100}%`,
                    backgroundColor: achievement.isUnlocked ? colors.status.success : colors.primary
                  }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress} / {achievement.maxProgress}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderHistory = () => (
    <View style={styles.historyContainer}>
      {rewardHistory.map((reward) => (
        <View key={reward.id} style={styles.historyCard}>
          <View style={styles.historyIcon}>
            <MaterialIcons 
              name={reward.type === 'xp' ? 'star' : 'monetization-on'} 
              size={20} 
              color={reward.type === 'xp' ? '#FFD700' : '#4CAF50'} 
            />
          </View>
          <View style={styles.historyInfo}>
            <Text style={styles.historyReason}>{reward.reason}</Text>
            <Text style={styles.historyDate}>{reward.date}</Text>
          </View>
          <Text style={[
            styles.historyAmount,
            { color: reward.type === 'xp' ? '#FFD700' : '#4CAF50' }
          ]}>
            +{reward.amount} {reward.type === 'xp' ? 'XP' : t('rewards.tokens')}
          </Text>
        </View>
      ))}
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
        <Text style={styles.headerTitle}>{t('rewards.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'overview' && styles.activeTab]}
          onPress={() => setActiveTab('overview')}
        >
          <Text style={[styles.tabText, activeTab === 'overview' && styles.activeTabText]}>
            {t('rewards.overview')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.activeTab]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text style={[styles.tabText, activeTab === 'achievements' && styles.activeTabText]}>
            {t('rewards.achievements')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>
            {t('rewards.history')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'achievements' && renderAchievements()}
        {activeTab === 'history' && renderHistory()}
      </ScrollView>
    </SafeAreaView>
  );
};
