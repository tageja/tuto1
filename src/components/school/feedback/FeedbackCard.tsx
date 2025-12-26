import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

import { FeedbackItem } from '../../../types/school/feedback';
import { FeedbackBadge } from './FeedbackBadge';

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onPress: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onPress }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      padding: spacing.md,
      borderRadius: borderRadius.lg,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.sm,
    },
    headerLeft: {
      flex: 1,
    },
    feedbackCode: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.primary,
      fontFamily: 'monospace',
      marginBottom: spacing.xs,
    },
    badges: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    badgeSpacer: {
      width: 6,
    },
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    description: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    studentInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.xs,
    },
    avatarText: {
      color: colors.white,
      fontSize: 12,
      fontWeight: '600',
    },
    studentName: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      flex: 1,
    },
    dueBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: `${colors.primary}15`,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    dueText: {
      fontSize: 11,
      color: colors.primary,
      fontWeight: '600',
      marginLeft: 4,
    },
  });

  const formatDeadline = (deadlineAt: string): string => {
    const deadline = new Date(deadlineAt);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Overdue';
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due in 1 day';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const getInitials = (name: string | null): string => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.feedbackCode}>{feedback.code}</Text>
          <View style={styles.badges}>
            <FeedbackBadge type="category" value={feedback.category} />
            <View style={styles.badgeSpacer} />
            <FeedbackBadge type="status" value={feedback.status} />
          </View>
        </View>
      </View>

      <Text style={styles.title} numberOfLines={1}>
        {feedback.title}
      </Text>

      <Text style={styles.description} numberOfLines={2}>
        {feedback.description}
      </Text>

      <View style={styles.footer}>
        <View style={styles.studentInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {getInitials(feedback.student_name)}
            </Text>
          </View>
          <Text style={styles.studentName} numberOfLines={1}>
            {feedback.student_name || 'Unknown Student'}
          </Text>
        </View>

        {feedback.deadline_at && (
          <View style={styles.dueBadge}>
            <MaterialIcons name="schedule" size={14} color={colors.primary} />
            <Text style={styles.dueText}>
              {formatDeadline(feedback.deadline_at)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};









