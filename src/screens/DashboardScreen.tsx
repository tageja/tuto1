import React, { useState, useEffect } from 'react';
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
import { useUser } from '../contexts/UserContext';
import { colors, spacing, typography } from '../theme';

const { width } = Dimensions.get('window');

interface DashboardScreenProps {
  navigation: any;
}

interface DashboardWidget {
  id: string;
  title: string;
  icon: string;
  color: string;
  value: string;
  subtitle?: string;
  action?: () => void;
  showFor: ('parent' | 'student' | 'both')[];
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { t } = useLanguage();
  const { userType } = useUser();
  const [studentData, setStudentData] = useState({
    xp: 1250,
    tokens: 85,
    level: 8,
    streak: 12,
    completedHomework: 15,
    totalHomework: 20,
    upcomingClasses: 3,
    achievements: 5,
  });

  const [parentData, setParentData] = useState({
    upcomingClasses: 3,
    pendingPayments: 2,
    totalSpent: 2500000,
    sessionsLeft: 8,
    childrenCount: 2,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getDashboardWidgets = (): DashboardWidget[] => {
    const widgets: DashboardWidget[] = [
      // Common widgets for both roles
      {
        id: 'upcomingClasses',
        title: t('dashboard.upcomingClasses'),
        icon: 'schedule',
        color: colors.primary,
        value: userType === 'student' ? `${studentData.upcomingClasses}` : `${parentData.upcomingClasses}`,
        subtitle: t('dashboard.classesThisWeek'),
        action: () => navigation.navigate('Schedule'),
        showFor: ['parent', 'student'],
      },
      {
        id: 'homework',
        title: t('dashboard.homework'),
        icon: 'assignment',
        color: '#FF6B35',
        value: `${studentData.completedHomework}/${studentData.totalHomework}`,
        subtitle: t('dashboard.completed'),
        action: () => navigation.navigate('Homework'),
        showFor: ['parent', 'student'],
      },
      {
        id: 'progress',
        title: t('dashboard.progress'),
        icon: 'trending-up',
        color: '#4CAF50',
        value: '85%',
        subtitle: t('dashboard.thisMonth'),
        action: () => navigation.navigate('Progress'),
        showFor: ['parent', 'student'],
      },

    ];

    // Parent-only widgets
    if (userType === 'parent') {
      widgets.push(
        {
          id: 'payments',
          title: t('dashboard.payments'),
          icon: 'payment',
          color: '#2196F3',
          value: formatCurrency(parentData.totalSpent),
          subtitle: t('dashboard.totalSpent'),
          action: () => navigation.navigate('Payments'),
          showFor: ['parent'],
        },
        {
          id: 'bookings',
          title: t('dashboard.bookings'),
          icon: 'book-online',
          color: '#FF9800',
          value: `${parentData.sessionsLeft}`,
          subtitle: t('dashboard.sessionsLeft'),
          action: () => navigation.navigate('Bookings'),
          showFor: ['parent'],
        }
      );
    }

    // Student-only widgets
    if (userType === 'student') {
      widgets.push(
        {
          id: 'rewards',
          title: t('dashboard.rewards'),
          icon: 'emoji-events',
          color: '#FFD700',
          value: `${studentData.tokens}`,
          subtitle: t('dashboard.tokensAvailable'),
          action: () => navigation.navigate('Rewards'),
          showFor: ['student'],
        },
        {
          id: 'store',
          title: t('dashboard.tutoStore'),
          icon: 'store',
          color: '#E91E63',
          value: `${studentData.achievements}`,
          subtitle: t('dashboard.achievements'),
          action: () => navigation.navigate('TutoStore'),
          showFor: ['student'],
        }
      );
    }

    return widgets;
  };

  const renderWidget = (widget: DashboardWidget) => (
    <TouchableOpacity
      key={widget.id}
      style={[styles.widget, { borderLeftColor: widget.color }]}
      onPress={widget.action}
      activeOpacity={0.8}
    >
      <View style={styles.widgetHeader}>
        <View style={[styles.widgetIcon, { backgroundColor: widget.color }]}>
          <MaterialIcons name={widget.icon as any} size={24} color={colors.background.primary} />
        </View>
        <View style={styles.widgetContent}>
          <Text style={styles.widgetTitle}>{widget.title}</Text>
          <Text style={styles.widgetValue}>{widget.value}</Text>
          {widget.subtitle && (
            <Text style={styles.widgetSubtitle}>{widget.subtitle}</Text>
          )}
        </View>
        <MaterialIcons name="chevron-right" size={20} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );

  const renderStudentStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialIcons name="star" size={24} color="#FFD700" />
          <Text style={styles.statValue}>{studentData.xp}</Text>
          <Text style={styles.statLabel}>{t('dashboard.xp')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="local-fire-department" size={24} color="#FF6B35" />
          <Text style={styles.statValue}>{studentData.streak}</Text>
          <Text style={styles.statLabel}>{t('dashboard.streak')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="emoji-events" size={24} color="#9C27B0" />
          <Text style={styles.statValue}>{studentData.level}</Text>
          <Text style={styles.statLabel}>{t('dashboard.level')}</Text>
        </View>
      </View>
    </View>
  );

  const renderParentStats = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <MaterialIcons name="child-care" size={24} color={colors.primary} />
          <Text style={styles.statValue}>{parentData.childrenCount}</Text>
          <Text style={styles.statLabel}>{t('dashboard.children')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="payment" size={24} color="#FF6B35" />
          <Text style={styles.statValue}>{parentData.pendingPayments}</Text>
          <Text style={styles.statLabel}>{t('dashboard.pendingPayments')}</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialIcons name="schedule" size={24} color="#4CAF50" />
          <Text style={styles.statValue}>{parentData.sessionsLeft}</Text>
          <Text style={styles.statLabel}>{t('dashboard.sessionsLeft')}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>{t('dashboard.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {userType === 'student' ? t('dashboard.welcomeStudent') : t('dashboard.welcomeParent')}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('UserProfile')}
        >
          <MaterialIcons name="person" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        {userType === 'student' ? renderStudentStats() : renderParentStats()}

        {/* Widgets Section */}
        <View style={styles.widgetsSection}>
          <Text style={styles.sectionTitle}>{t('dashboard.overview')}</Text>
          <View style={styles.widgetsContainer}>
            {getDashboardWidgets().map(renderWidget)}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={styles.sectionTitle}>{t('dashboard.quickActions')}</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('AllSubjects')}
            >
              <MaterialIcons name="search" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>{t('dashboard.findTeacher')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.quickAction}
              onPress={() => navigation.navigate('Notifications')}
            >
              <MaterialIcons name="notifications" size={24} color={colors.primary} />
              <Text style={styles.quickActionText}>{t('dashboard.viewNotifications')}</Text>
            </TouchableOpacity>
            {userType === 'student' && (
              <TouchableOpacity
                style={styles.quickAction}
                onPress={() => navigation.navigate('TutoStore')}
              >
                <MaterialIcons name="store" size={24} color={colors.primary} />
                <Text style={styles.quickActionText}>{t('dashboard.visitStore')}</Text>
              </TouchableOpacity>
            )}
          </View>
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
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  profileButton: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statCard: {
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
  widgetsSection: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  widgetsContainer: {
    gap: spacing.md,
  },
  widget: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
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
  widgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  widgetIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  widgetContent: {
    flex: 1,
  },
  widgetTitle: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  widgetValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  widgetSubtitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
  },
  quickActionsSection: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
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
}); 