import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { formatEventDate, formatEventTime } from '../../services/school/events';
import type { EventWithCounts } from '../../types/school/events';

interface EventCardProps {
  event: EventWithCounts;
  role: 'admin' | 'parent';
  onViewDetails: () => void;
  onManage?: () => void;
  isRegistered?: boolean;
  participantCount?: number;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    school: '#2196F3',
    class: '#9C27B0',
    competition: '#4CAF50',
    workshop: '#FFC107',
    outing: '#FF9800',
    practice: '#3F51B5',
    celebration: '#E91E63',
  };
  return colors[category] || '#666666';
};

export const EventCard: React.FC<EventCardProps> = ({
  event,
  role,
  onViewDetails,
  onManage,
  isRegistered = false,
  participantCount,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginBottom: spacing.md,
      marginHorizontal: spacing.md,
      ...shadows.md,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    categoryBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: 12,
    },
    categoryText: {
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.semiBold,
    },
    participantCount: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    participantText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.medium,
    },
    participantTextRegistered: {
      color: '#4CAF50',
      fontFamily: typography.fontFamily.semiBold,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    details: {
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    detailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    detailText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.regular,
    },
    parentNoteContainer: {
      backgroundColor: '#E3F2FD',
      borderWidth: 1,
      borderColor: '#BBDEFB',
      borderRadius: borderRadius.md,
      padding: spacing.sm,
      marginBottom: spacing.md,
    },
    parentNoteLabel: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: '#1565C0',
      marginBottom: spacing.xs,
    },
    parentNoteText: {
      fontSize: typography.fontSize.sm,
      color: '#0D47A1',
      fontFamily: typography.fontFamily.regular,
    },
    actions: {
      flexDirection: 'row',
      gap: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    viewButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.primary,
      alignItems: 'center',
    },
    viewButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.primary,
    },
    manageButton: {
      flex: 1,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: borderRadius.md,
      backgroundColor: colors.primary,
      alignItems: 'center',
    },
    manageButtonText: {
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.white,
    },
  });

  const { t } = useLanguage();
  const categoryColor = getCategoryColor(event.category);

  const displayCount = participantCount !== undefined 
    ? participantCount 
    : (event.registered_count || 0);
  
  const capacityDisplay = event.capacity 
    ? `${displayCount}/${event.capacity}` 
    : `${displayCount}`;

  return (
    <View style={styles.container}>
      {/* Header: Category badge and participant count */}
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
          <Text style={[styles.categoryText, { color: categoryColor }]}>
            {event.category.charAt(0).toUpperCase() + event.category.slice(1)}
          </Text>
        </View>
        {event.capacity && (
          <View style={styles.participantCount}>
            <MaterialIcons name="people" size={16} color={colors.text.secondary} />
            <Text style={[
              styles.participantText,
              isRegistered && styles.participantTextRegistered
            ]}>
              {capacityDisplay}
              {isRegistered && role === 'parent' && ' (Registered)'}
            </Text>
          </View>
        )}
      </View>

      {/* Title */}
      <Text style={styles.title}>{event.title}</Text>

      {/* Date, Time, Location */}
      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialIcons name="calendar-today" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>{formatEventDate(event.starts_at)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialIcons name="access-time" size={16} color={colors.text.secondary} />
          <Text style={styles.detailText}>
            {formatEventTime(event.starts_at, event.ends_at)}
          </Text>
        </View>
        {event.location && (
          <View style={styles.detailRow}>
            <MaterialIcons name="place" size={16} color={colors.text.secondary} />
            <Text style={styles.detailText}>{event.location}</Text>
          </View>
        )}
      </View>

      {/* Parent Note */}
      {event.parent_note && (
        <View style={styles.parentNoteContainer}>
          <Text style={styles.parentNoteLabel}>
            {t('school.events.noteForParents')}
          </Text>
          <Text style={styles.parentNoteText}>{event.parent_note}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={onViewDetails}
        >
          <Text style={styles.viewButtonText}>{t('school.events.viewDetails')}</Text>
        </TouchableOpacity>
        {role === 'admin' && onManage && (
          <TouchableOpacity
            style={styles.manageButton}
            onPress={onManage}
            disabled={event.status === 'draft'}
          >
            <Text style={styles.manageButtonText}>{t('school.events.manage')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};



