import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Announcement } from '../../types/school/announcements';

interface AnnouncementCardProps {
  announcement: Announcement;
  isRead?: boolean;
  onPress: () => void;
  onMarkAsRead?: () => void;
  onOverflowPress?: (announcement: Announcement) => void;
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({ 
  announcement, 
  isRead = false, 
  onPress, 
  onMarkAsRead,
  onOverflowPress
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Urgent': return colors.status.error;
      case 'High': return colors.status.warning;
      case 'Normal': return colors.primary;
      case 'Low': return colors.status.success;
      default: return colors.disabled;
    }
  };

  const getPriorityBg = (priority: string) => {
    switch (priority) {
      case 'Urgent': return `${colors.status.error}15`;
      case 'High': return `${colors.status.warning}15`;
      case 'Normal': return `${colors.primary}15`;
      case 'Low': return `${colors.status.success}15`;
      default: return `${colors.disabled}15`;
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };


  // Styles with dynamic theme


  const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  unreadContainer: {
    borderLeftColor: colors.primary,
    backgroundColor: '#F8F9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 6,
  },
  unreadTitle: {
    fontWeight: '700',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  markReadButton: {
    padding: 4,
  },
  overflowButton: {
    padding: 4,
  },
  content: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: colors.text.light,
  },
  scopeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scopeText: {
    fontSize: 12,
    color: colors.text.light,
    marginLeft: 4,
  },
});


  return (
    <TouchableOpacity style={[styles.container, !isRead && styles.unreadContainer]} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={[styles.title, !isRead && styles.unreadTitle]} numberOfLines={2}>
            {announcement.title}
          </Text>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: getPriorityBg(announcement.priority) }]}>
              <Text style={[styles.badgeText, { color: getPriorityColor(announcement.priority) }]}>
                {announcement.priority}
              </Text>
            </View>
            {announcement.status !== 'Published' && (
              <View style={[styles.badge, { backgroundColor: colors.border.light, marginLeft: 6 }]}>
                <Text style={[styles.badgeText, { color: '#666' }]}>
                  {announcement.status}
                </Text>
              </View>
            )}
          </View>
        </View>
        {!isRead && onMarkAsRead && (
          <TouchableOpacity onPress={onMarkAsRead} style={styles.markReadButton}>
            <MaterialIcons name="mark-email-read" size={20} color={colors.primary} />
          </TouchableOpacity>
        )}
        {onOverflowPress && (
          <TouchableOpacity onPress={() => onOverflowPress(announcement)} style={styles.overflowButton}>
            <MaterialIcons name="more-vert" size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content} numberOfLines={3}>
        {announcement.body}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.date}>
          {formatDate(announcement.published_at || announcement.created_at)}
        </Text>
        {announcement.target_scope === 'Classes' && (
          <View style={styles.scopeContainer}>
            <MaterialIcons name="class" size={14} color={colors.text.light} />
            <Text style={styles.scopeText}>Classes</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

