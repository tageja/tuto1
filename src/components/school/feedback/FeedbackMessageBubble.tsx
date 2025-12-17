import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../contexts/ThemeContext';
import { FeedbackMessage } from '../../../types/school/feedback';

interface FeedbackMessageBubbleProps {
  message: FeedbackMessage & { sender_name?: string | null };
  isCurrentUser: boolean;
}

export const FeedbackMessageBubble: React.FC<FeedbackMessageBubbleProps> = ({
  message,
  isCurrentUser,
}) => {
  const { colors, spacing, typography } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.md,
    },
    currentUserContainer: {
      flexDirection: 'row-reverse',
    },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.xs,
    },
    messageContent: {
      flex: 1,
    },
    messageHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    senderName: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.primary,
      marginRight: spacing.xs,
    },
    timestamp: {
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
    },
    bubble: {
      backgroundColor: colors.background.tertiary,
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      maxWidth: '85%',
    },
    currentUserBubble: {
      backgroundColor: colors.primary,
      alignSelf: 'flex-end',
    },
    messageText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
      lineHeight: 20,
    },
    currentUserText: {
      color: colors.white,
    },
    avatarText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
  });
  const getInitials = (name: string | null | undefined): string => {
    if (!name) return message.sender_role === 'admin' ? 'AT' : 'P';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const formatTimestamp = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
      });
    }
  };

  const senderName = message.sender_name || 
    (message.sender_role === 'admin' ? 'Admin Team' : 'Parent');

  return (
    <View style={[styles.container, isCurrentUser && styles.currentUserContainer]}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {getInitials(message.sender_name)}
        </Text>
      </View>
      <View style={styles.messageContent}>
        <View style={styles.messageHeader}>
          <Text style={styles.senderName}>{senderName}</Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(message.created_at)}
          </Text>
        </View>
        <View style={[styles.bubble, isCurrentUser && styles.currentUserBubble]}>
          <Text style={[styles.messageText, isCurrentUser && styles.currentUserText]}>
            {message.message}
          </Text>
        </View>
      </View>
    </View>
  );
};





