import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useNotifications } from '../hooks/useNotifications';
import type { Notification } from '../services/notifications';

type TabType = 'urgent' | 'normal';

// Map notification types to icons
const getNotificationIcon = (type: string): string => {
  const iconMap: Record<string, string> = {
    message: 'message',
    announcement: 'campaign',
    event: 'event',
    payment: 'payment',
    homework: 'assignment',
    attendance: 'event-available',
    progress_report: 'assessment',
    daily_activity: 'today',
    photo_album: 'photo-album',
    medicine: 'medication',
    health_incident: 'favorite',
    feedback: 'feedback',
  };
  return iconMap[type] || 'notifications';
};

// Map notification types to category labels
const getNotificationCategory = (type: string): string => {
  const categoryMap: Record<string, string> = {
    message: 'message',
    announcement: 'announcement',
    event: 'event',
    payment: 'payment',
    homework: 'homework',
    attendance: 'attendance',
    progress_report: 'report',
    daily_activity: 'activity',
    photo_album: 'photos',
    medicine: 'medicine',
    health_incident: 'health',
    feedback: 'feedback',
  };
  return categoryMap[type] || 'other';
};

interface NotificationsScreenProps {
  navigation: any;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<TabType>('urgent');
  const {
    notifications,
    urgentNotifications,
    normalNotifications,
    unreadCount,
    urgentUnreadCount,
    normalUnreadCount,
    isLoading,
    error,
    refetch,
    markRead,
    markAllRead,
  } = useNotifications();

  const styles = useMemo(
    () =>
      StyleSheet.create({
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
      shadowColor: '#000',
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
  }),
  [colors, spacing, typography]
);

  // Get notifications for active tab
  const activeNotifications = useMemo(() => {
    return activeTab === 'urgent' ? urgentNotifications : normalNotifications;
  }, [activeTab, urgentNotifications, normalNotifications]);

  // Handle notification tap
  const handleNotificationTap = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        await markRead(notification.id);
      } catch (error) {
        console.error('Error marking notification as read:', error);
      }
    }

    // Navigate based on targetType and targetId
    if (notification.targetType) {
      // Logic for different target types
      switch (notification.targetType) {
        case 'feedback':
          // If it's a message thread
          if (notification.meta?.threadId) {
            navigation.navigate('MessagesConversation', { 
              threadId: notification.meta.threadId 
            });
          } else if (notification.targetId) {
            // If it's a feedback ticket
            navigation.navigate('FeedbackDetails', { 
              feedbackId: notification.targetId 
            });
          } else {
            // Default to feedback list
            navigation.navigate('SchoolFeedback');
          }
          break;
          
        case 'message':
          if (notification.targetId) {
            navigation.navigate('MessagesConversation', { 
              threadId: notification.targetId 
            });
          } else {
            navigation.navigate('SchoolMessages');
          }
          break;

        case 'attendance':
          // Navigate to specific student attendance if available
          if (notification.targetId) { // Usually student ID for attendance
             // We'd ideally want StudentAttendanceDetail but we might need more params
             navigation.navigate('SchoolAttendance');
          } else {
            navigation.navigate('SchoolAttendance');
          }
          break;

        case 'homework':
          if (notification.targetId) {
            navigation.navigate('SchoolHomeworkDetail', { 
              assignmentId: notification.targetId 
            });
          } else {
            navigation.navigate('SchoolHomework');
          }
          break;

        case 'event':
          if (notification.targetId) {
            // We need to fetch event details, but SchoolEventDetail expects an event object
            // For now, go to the list which is safer, or try to navigate with just ID if supported
            // Since SchoolEventDetail requires a full event object in params, we'll go to the list
            navigation.navigate('SchoolEvents');
          } else {
            navigation.navigate('SchoolEvents');
          }
          break;

        case 'payment':
          navigation.navigate('SchoolPayments');
          break;

        case 'photo_album':
          if (notification.targetId) {
             // SchoolAlbumDetail expects 'album' object. Safer to go to list.
            navigation.navigate('SchoolPhotoAlbums');
          } else {
            navigation.navigate('SchoolPhotoAlbums');
          }
          break;
          
        case 'announcement':
          if (notification.targetId) {
             // SchoolAnnouncementDetail expects 'announcement' object.
            navigation.navigate('SchoolAnnouncements');
          } else {
            navigation.navigate('SchoolAnnouncements');
          }
          break;

        case 'medicine':
          navigation.navigate('SchoolMedicine');
          break;
          
        case 'health_incident':
        case 'health':
          navigation.navigate('SchoolHealth');
          break;

        case 'report':
        case 'progress_report':
          navigation.navigate('SchoolProgress');
          break;
          
        case 'student':
          if (notification.targetId) {
            navigation.navigate('StudentDetail', { studentId: notification.targetId });
          } else {
            navigation.navigate('SchoolStudents');
          }
          break;

        case 'daily_activity':
          navigation.navigate('SchoolDailyActivities');
          break;

        default:
          // Fallback to Home if unknown
          console.warn('Unknown notification target type:', notification.targetType);
          navigation.navigate('HomeTab');
      }
    } else {
      // No target type, just stay here (or maybe expand details if we had a modal)
    }
  };

  // Handle mark all as read
  const handleMarkAllRead = async () => {
    try {
      await markAllRead();
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  // Format timestamp
  const formatTimestamp = (timestampString: string) => {
    const timestamp = new Date(timestampString);
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return t('notifications.justNow') || 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} ${t('notifications.minutesAgo') || 'minutes ago'}`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${t('notifications.hoursAgo') || 'hours ago'}`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${t('notifications.daysAgo') || 'days ago'}`;
    } else {
      return timestamp.toLocaleDateString();
    }
  };

  // Render tab button
  const renderTabButton = (tab: TabType, label: string) => {
    const isActive = activeTab === tab;
    const unreadCount = tab === 'urgent' ? urgentUnreadCount : normalUnreadCount;
    
    return (
      <TouchableOpacity
        style={[styles.filterButton, isActive && styles.filterButtonActive]}
        onPress={() => setActiveTab(tab)}
      >
        <Text style={[styles.filterButtonText, isActive && styles.filterButtonTextActive]}>
          {label}
        </Text>
        {unreadCount > 0 && (
          <View style={[styles.badge, tab === 'urgent' ? styles.badgeImportant : styles.badgeRegular]}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render notification item
  const renderNotificationItem = (notification: Notification) => {
    const isUrgent = notification.priority === 'urgent';
    const iconName = getNotificationIcon(notification.type);
    const category = getNotificationCategory(notification.type);
    
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
                name={iconName as any}
                size={24}
                color={isUrgent ? colors.status.error : colors.primary}
              />
              {!notification.isRead && (
                <View style={[styles.unreadIndicator, isUrgent ? styles.unreadImportant : styles.unreadRegular]} />
              )}
            </View>
            <View style={styles.notificationInfo}>
              <Text style={[styles.notificationTitle, !notification.isRead && styles.unreadTitle]}>
                {notification.title}
              </Text>
              <Text style={styles.notificationMessage} numberOfLines={2}>
                {notification.body}
              </Text>
              <Text style={styles.notificationTime}>
                {formatTimestamp(notification.createdAt)}
              </Text>
            </View>
          </View>
          <View style={[styles.categoryBadge, isUrgent ? styles.categoryBadgeImportant : styles.categoryBadgeRegular]}>
            <Text style={[styles.categoryText, isUrgent ? styles.categoryTextImportant : styles.categoryTextRegular]}>
              {category}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (error) {
    return (
      <View style={styles.container}>
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
        <View style={styles.emptyState}>
          <MaterialIcons name="error-outline" size={64} color={colors.status.error} />
          <Text style={styles.emptyStateText}>
            {t('notifications.error') || 'Error loading notifications'}
          </Text>
          <TouchableOpacity
            style={[styles.filterButton, { marginTop: spacing.md }]}
            onPress={() => refetch()}
          >
            <Text style={styles.filterButtonText}>
              {t('common.tryAgain') || 'Try Again'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>{t('notifications.title') || 'Notifications'}</Text>
        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.headerRight}
            onPress={handleMarkAllRead}
          >
            <Text style={[styles.filterButtonText, { fontSize: typography.fontSize.sm }]}>
              {t('notifications.markAllRead') || 'Mark All Read'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Tab Buttons */}
      <View style={styles.filterContainer}>
        {renderTabButton('urgent', t('notifications.important') || 'Important')}
        {renderTabButton('normal', t('notifications.regular') || 'Other')}
      </View>

      {/* Notifications List */}
      {isLoading && activeNotifications.length === 0 ? (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyStateText}>
            {t('common.loading') || 'Loading...'}
          </Text>
        </View>
      ) : (
        <ScrollView
          style={styles.notificationsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        >
          {activeNotifications.length > 0 ? (
            activeNotifications.map(renderNotificationItem)
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="notifications-none" size={64} color={colors.text.light} />
              <Text style={styles.emptyStateText}>
                {t('notifications.noNotifications') || 'No notifications'}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

