import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import type { HomeworkListItem as HomeworkListItemType } from '../../types/school/homework';
import { isOverdue } from '../../services/school/homework';

interface HomeworkListItemProps {
  item: HomeworkListItemType;
  onPress?: () => void;
  showChildPerformance?: boolean;
}

const getSubjectColor = (subject: string): string => {
  const colors: { [key: string]: string } = {
    Mathematics: '#2196F3',
    Science: '#4CAF50',
    English: '#9C27B0',
    History: '#FF9800',
    Geography: '#00BCD4',
    Art: '#E91E63',
    Music: '#FF5722',
    Physical: '#795548',
  };
  return colors[subject] || '#0B5FFF';
};

const getStatusColor = (status: string): { bg: string; text: string } => {
  switch (status.toLowerCase()) {
    case 'completed':
      return { bg: '#E8F5E9', text: '#4CAF50' };
    case 'pending':
      return { bg: '#FFF9E6', text: '#FF9800' };
    default:
      return { bg: '#F5F5F5', text: '#666666' };
  }
};

export const HomeworkListItem: React.FC<HomeworkListItemProps> = ({
  item,
  onPress,
  showChildPerformance = false,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      marginHorizontal: spacing.md,
      ...shadows.sm,
    },
    overdueContainer: {
      backgroundColor: '#FFF5F5',
      borderLeftWidth: 4,
      borderLeftColor: colors.error,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    subjectPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    subjectText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
    },
    statusPill: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.full,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
    },
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
      marginBottom: spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    meta: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
      marginRight: spacing.xs,
    },
    progressRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs,
    },
    progressInfo: {
      flex: 1,
    },
    progressText: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
      marginBottom: 2,
    },
    childScore: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    progressPercent: {
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: colors.text.primary,
      fontFamily: typography.fontFamily.semiBold,
    },
    progressBarContainer: {
      height: 8,
      backgroundColor: colors.background.secondary,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      marginBottom: spacing.sm,
    },
    progressBar: {
      height: '100%',
      borderRadius: borderRadius.full,
    },
    viewButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-end',
      marginTop: spacing.xs,
    },
    viewButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: '600',
      fontFamily: typography.fontFamily.semiBold,
      marginRight: spacing.xs,
    },
  });

  const subjectColor = getSubjectColor(item.subject);
  const statusColors = getStatusColor(item.status);
  const overdue = isOverdue(item.due_date) && item.status === 'pending';

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  return (
    <TouchableOpacity
      style={[styles.container, overdue && styles.overdueContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={[styles.subjectPill, { backgroundColor: `${subjectColor}20` }]}>
          <Text style={[styles.subjectText, { color: subjectColor }]}>{item.subject}</Text>
        </View>
        <View style={[styles.statusPill, { backgroundColor: statusColors.bg }]}>
          <Text style={[styles.statusText, { color: statusColors.text }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <Text style={styles.title}>{item.title}</Text>

      <View style={styles.metaRow}>
        {item.class_name && (
          <Text style={styles.meta}>
            {item.class_name} • Due {formatDate(item.due_date)}
          </Text>
        )}
        {overdue && (
          <MaterialIcons name="warning" size={16} color={colors.error} />
        )}
      </View>

      <View style={styles.progressRow}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Progress: {item.submitted}/{item.total}
          </Text>
          {showChildPerformance && (
            <Text style={styles.childScore}>
              Your Child: {item.child_score !== null ? `${item.child_score}%` : '--'}
            </Text>
          )}
        </View>
        <Text style={styles.progressPercent}>{item.progress_percent}%</Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${item.progress_percent}%`, backgroundColor: subjectColor },
          ]}
        />
      </View>

      {onPress && (
        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View</Text>
          <MaterialIcons name="chevron-right" size={20} color={colors.primary} />
        </View>
      )}
    </TouchableOpacity>
  );
};



