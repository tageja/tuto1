import React, { useState, useMemo } from 'react';
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
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';

const { width } = Dimensions.get('window');

// Notification Types
export type NotificationType = 'important' | 'regular';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  icon: string;
  category: string;
  actionScreen?: string;
  actionParams?: any;
}

// Function to generate dummy notifications based on language
const generateDummyNotifications = (t: (key: string) => string): Notification[] => [
  // Important Notifications (Red badges)
  {
    id: '1',
    type: 'important',
    title: t('notifications.dummy.homeworkDeadline'),
    message: t('notifications.dummy.homeworkDeadlineMessage'),
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    isRead: false,
    icon: 'assignment',
    category: 'homework',
    actionScreen: 'Homework',
  },
  {
    id: '2',
    type: 'important',
    title: t('notifications.dummy.overdueHomework'),
    message: t('notifications.dummy.overdueHomeworkMessage'),
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: false,
    icon: 'warning',
    category: 'homework',
    actionScreen: 'Homework',
  },
  {
    id: '3',
    type: 'important',
    title: t('notifications.dummy.upcomingClass'),
    message: t('notifications.dummy.upcomingClassMessage'),
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    isRead: false,
    icon: 'schedule',
    category: 'class',
    actionScreen: 'Schedule',
  },
  {
    id: '4',
    type: 'important',
    title: t('notifications.dummy.feeReminder'),
    message: t('notifications.dummy.feeReminderMessage'),
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    isRead: false,
    icon: 'payment',
    category: 'payment',
    actionScreen: 'Payments',
  },
  {
    id: '5',
    type: 'important',
    title: t('notifications.dummy.holidayNotice'),
    message: t('notifications.dummy.holidayNoticeMessage'),
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    isRead: false,
    icon: 'event',
    category: 'holiday',
  },
  {
    id: '6',
    type: 'important',
    title: t('notifications.dummy.teacherFeedback'),
    message: t('notifications.dummy.teacherFeedbackMessage'),
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    isRead: false,
    icon: 'feedback',
    category: 'feedback',
    actionScreen: 'UserProfile',
  },
  {
    id: '7',
    type: 'important',
    title: t('notifications.dummy.directMessage'),
    message: t('notifications.dummy.directMessageMessage'),
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    isRead: false,
    icon: 'message',
    category: 'message',
    actionScreen: 'Chats',
  },
  {
    id: '8',
    type: 'important',
    title: t('notifications.dummy.classCancellation'),
    message: t('notifications.dummy.classCancellationMessage'),
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    isRead: false,
    icon: 'cancel',
    category: 'class',
    actionScreen: 'Schedule',
  },
  {
    id: '9',
    type: 'important',
    title: t('notifications.dummy.examReminder'),
    message: t('notifications.dummy.examReminderMessage'),
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    isRead: false,
    icon: 'quiz',
    category: 'exam',
    actionScreen: 'Schedule',
  },
  {
    id: '10',
    type: 'important',
    title: t('notifications.dummy.parentMeeting'),
    message: t('notifications.dummy.parentMeetingMessage'),
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    isRead: false,
    icon: 'people',
    category: 'meeting',
    actionScreen: 'Schedule',
  },

  // Regular Notifications (Neutral badges)
  {
    id: '11',
    type: 'regular',
    title: t('notifications.dummy.newTeacher'),
    message: t('notifications.dummy.newTeacherMessage'),
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    isRead: false,
    icon: 'person-add',
    category: 'teacher',
    actionScreen: 'SubjectResults',
    actionParams: { subjectKey: 'french' },
  },
  {
    id: '12',
    type: 'regular',
    title: t('notifications.dummy.specialPromotion'),
    message: t('notifications.dummy.specialPromotionMessage'),
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    isRead: false,
    icon: 'local-offer',
    category: 'promotion',
  },
  {
    id: '13',
    type: 'regular',
    title: t('notifications.dummy.newStudyMaterial'),
    message: t('notifications.dummy.newStudyMaterialMessage'),
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    isRead: false,
    icon: 'book',
    category: 'material',
    actionScreen: 'Dashboard',
  },
  {
    id: '14',
    type: 'regular',
    title: t('notifications.dummy.weeklyProgress'),
    message: t('notifications.dummy.weeklyProgressMessage'),
    timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
    isRead: false,
    icon: 'assessment',
    category: 'report',
    actionScreen: 'Dashboard',
  },
  {
    id: '15',
    type: 'regular',
    title: t('notifications.dummy.newCourse'),
    message: t('notifications.dummy.newCourseMessage'),
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    isRead: false,
    icon: 'school',
    category: 'course',
    actionScreen: 'AllSubjects',
  },
  {
    id: '16',
    type: 'regular',
    title: t('notifications.dummy.appUpdate'),
    message: t('notifications.dummy.appUpdateMessage'),
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), // 6 days ago
    isRead: false,
    icon: 'system-update',
    category: 'app',
  },
  {
    id: '17',
    type: 'regular',
    title: t('notifications.dummy.studyGroup'),
    message: t('notifications.dummy.studyGroupMessage'),
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    isRead: false,
    icon: 'group',
    category: 'group',
    actionScreen: 'Forum',
  },
  {
    id: '18',
    type: 'regular',
    title: t('notifications.dummy.achievement'),
    message: t('notifications.dummy.achievementMessage'),
    timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
    isRead: false,
    icon: 'emoji-events',
    category: 'achievement',
    actionScreen: 'Dashboard',
  },
  {
    id: '19',
    type: 'regular',
    title: t('notifications.dummy.forumPost'),
    message: t('notifications.dummy.forumPostMessage'),
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // 9 days ago
    isRead: false,
    icon: 'forum',
    category: 'forum',
    actionScreen: 'Forum',
  },
  {
    id: '20',
    type: 'regular',
    title: t('notifications.dummy.birthdayReminder'),
    message: t('notifications.dummy.birthdayReminderMessage'),
    timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    isRead: false,
    icon: 'cake',
    category: 'reminder',
  },
];

type FilterType = 'all' | 'regular' | 'important';

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  navigation,
}) => {
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<Notification[]>(() => generateDummyNotifications(t));
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Filter notifications based on active filter
  const filteredNotifications = useMemo(() => {
    if (activeFilter === 'all') {
      return notifications;
    }
    return notifications.filter(notification => notification.type === activeFilter);
  }, [notifications, activeFilter]);

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  // Handle notification tap
  const handleNotificationTap = (notification: Notification) => {
    markAsRead(notification.id);
    
    if (notification.actionScreen) {
      navigation.navigate(notification.actionScreen, notification.actionParams);
    }
  };

  // Get unread count for each filter
  const getUnreadCount = (filter: FilterType) => {
    const filtered = filter === 'all' 
      ? notifications 
      : notifications.filter(n => n.type === filter);
    return filtered.filter(n => !n.isRead).length;
  };

  // Format timestamp
  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInHours < 1) {
      return t('notifications.justNow');
    } else if (diffInHours < 24) {
      return `${diffInHours} ${t('notifications.hoursAgo')}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${t('notifications.daysAgo')}`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  // Render filter button
  const renderFilterButton = (filter: FilterType, label: string) => {
    const isActive = activeFilter === filter;
    const unreadCount = getUnreadCount(filter);
    
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setActiveFilter(filter)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
        {unreadCount > 0 && (
          <View style={[styles.badge, filter === 'important' ? styles.badgeImportant : styles.badgeRegular]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render notification item
  const renderNotificationItem = (notification: Notification) => {
    const isImportant = notification.type === 'important';
    
    return (
      <TouchableOpacity
        key={notification.id}
        style={[styles.notificationItem, !notification.isRead && styles.unreadItem]}
        onPress={() => handleNotificationTap(notification)}
      >
        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <View style={styles.iconContainer}>
              <MaterialIcons
                name={notification.icon as any}
                size={24}
                color={isImportant ? colors.status.error : colors.primary}
              />
              {!notification.isRead && (
                <View style={[styles.unreadIndicator, isImportant ? styles.unreadImportant : styles.unreadRegular]} />
              )}
            </View>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadTitle]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.message}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTimestamp(notification.timestamp)}
              </Text>
            </View>
          </View>
          <View style={[styles.categoryBadge, isImportant ? styles.categoryBadgeImportant : styles.categoryBadgeRegular]}>
            <Text style={[styles.categoryText, isImportant ? styles.categoryTextImportant : styles.categoryTextRegular]}>
              {notification.category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton('all', t('notifications.all'))}
        {renderFilterButton('regular', t('notifications.regular'))}
        {renderFilterButton('important', t('notifications.important'))}
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
        {filteredNotifications.length > 0 ? (
          filteredNotifications.map(renderNotificationItem)
        ) : (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={64} color={colors.text.light} />
            <Text style={styles.emptyStateText}>{t('notifications.noNotifications')}</Text>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  backButton: {
    padding: spacing.xs,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  headerRight: {
    width: 40,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: colors.background.secondary,
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: colors.background.primary,
  },
  badge: {
    marginLeft: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  badgeImportant: {
    backgroundColor: colors.status.error,
  },
  badgeRegular: {
    backgroundColor: colors.text.light,
  },
  badgeText: {
    fontSize: 10,
    color: colors.background.primary,
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  notificationItem: {
    backgroundColor: colors.background.primary,
    borderRadius: spacing.sm,
    padding: spacing.md,
    marginVertical: spacing.xs,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  unreadItem: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  notificationContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  notificationHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  iconContainer: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  unreadIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  unreadImportant: {
    backgroundColor: colors.status.error,
  },
  unreadRegular: {
    backgroundColor: colors.primary,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  unreadTitle: {
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.light,
    marginBottom: spacing.xs,
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: typography.fontSize.xs,
    color: colors.text.light,
  },
  categoryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: spacing.xs,
    marginLeft: spacing.sm,
  },
  categoryBadgeImportant: {
    backgroundColor: colors.status.error + '20',
  },
  categoryBadgeRegular: {
    backgroundColor: colors.background.secondary,
  },
  categoryText: {
    fontSize: typography.fontSize.xs,
    fontWeight: '500',
  },
  categoryTextImportant: {
    color: colors.status.error,
  },
  categoryTextRegular: {
    color: colors.text.light,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: typography.fontSize.md,
    color: colors.text.light,
    marginTop: spacing.md,
    textAlign: 'center',
  },
}); 