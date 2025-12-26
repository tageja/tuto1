import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { MessagePriority } from '../../services/school/messages';

interface MessageThreadCardProps {
  id: string;
  sender: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  priority?: MessagePriority;
  avatarColor?: string;
  role?: string;
  onClick?: () => void;
}

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const getAvatarColor = (name: string, index?: number): string => {
  // Generate consistent color based on name
  const colors = [
    '#6366F1', // Indigo
    '#0B5FFF', // Blue
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#10B981', // Green
    '#F59E0B', // Amber
  ];
  
  if (index !== undefined) {
    return colors[index % colors.length];
  }
  
  // Hash name to get consistent color
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const MessageThreadCard: React.FC<MessageThreadCardProps> = ({
  sender,
  lastMessage,
  timestamp,
  unreadCount = 0,
  priority = 'Normal',
  avatarColor,
  role,
  onClick,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.white,
    },
    unreadContainer: {
      backgroundColor: '#F0F4FF', // Light blue tint
    },
    content: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    avatarContainer: {
      position: 'relative',
      marginRight: spacing.md,
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
    },
    unreadBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 20,
      height: 20,
      borderRadius: 10,
      backgroundColor: colors.status.error,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.white,
    },
    unreadBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
    },
    textContainer: {
      flex: 1,
      minWidth: 0,
    },
    headerRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 4,
    },
    senderContainer: {
      flex: 1,
      minWidth: 0,
      marginRight: spacing.sm,
    },
    senderName: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
      marginBottom: 2,
    },
    unreadSenderName: {
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
    },
    role: {
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
      fontFamily: typography.fontFamily.regular,
    },
    timestamp: {
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
      fontFamily: typography.fontFamily.regular,
      flexShrink: 0,
    },
    lastMessage: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
      marginBottom: 4,
      fontFamily: typography.fontFamily.regular,
    },
    unreadLastMessage: {
      color: colors.text.primary,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
    },
    urgentBadge: {
      alignSelf: 'flex-start',
      backgroundColor: colors.status.error,
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 12,
      marginTop: 4,
    },
    urgentBadgeText: {
      color: colors.white,
      fontSize: 10,
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
    },
  });

  const avatarBgColor = avatarColor || getAvatarColor(sender);
  const initials = getInitials(sender);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        unreadCount > 0 && styles.unreadContainer,
      ]}
      onPress={onClick}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarBgColor }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadBadgeText}>
                {unreadCount > 99 ? '99+' : unreadCount}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.textContainer}>
          <View style={styles.headerRow}>
            <View style={styles.senderContainer}>
              <Text
                style={[
                  styles.senderName,
                  unreadCount > 0 && styles.unreadSenderName,
                ]}
                numberOfLines={1}
              >
                {sender}
              </Text>
              {role && (
                <Text style={styles.role} numberOfLines={1}>
                  {role}
                </Text>
              )}
            </View>
            <Text style={styles.timestamp}>{timestamp}</Text>
          </View>

          <Text
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.unreadLastMessage,
            ]}
            numberOfLines={2}
          >
            {lastMessage || 'No message preview yet'}
          </Text>

          {priority === 'Urgent' && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentBadgeText}>Urgent</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};











