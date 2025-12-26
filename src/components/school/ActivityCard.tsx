import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { DailyActivity } from '../../types/school/activities';

interface ActivityCardProps {
  activity: DailyActivity;
  onPress: () => void;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({ activity, onPress }) => {
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
    titleContainer: {
      flex: 1,
      marginRight: spacing.sm,
    },
    title: {
      fontSize: typography.fontSize.md,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    typeBadge: {
      backgroundColor: colors.background.tertiary,
      alignSelf: 'flex-start',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    typeText: {
      fontSize: 10,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '600',
    },
    details: {
      marginTop: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    detailText: {
      fontSize: 13,
      color: colors.text.secondary,
      marginLeft: 6,
    },
    description: {
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: 8,
      lineHeight: 18,
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return colors.status.success;
      case 'In Progress': return colors.status.warning; // or info
      case 'Pending': return colors.disabled;
      default: return colors.disabled;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Completed': return `${colors.status.success}15`;
      case 'In Progress': return `${colors.status.warning}15`;
      case 'Pending': return `${colors.disabled}15`;
      default: return `${colors.disabled}15`;
    }
  };

  const formatTime = (time: string) => {
    if (!time) return '';
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>{activity.title}</Text>
          {activity.type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{activity.type}</Text>
            </View>
          )}
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusBg(activity.status) }]}>
          <Text style={[styles.statusText, { color: getStatusColor(activity.status) }]}>
            {activity.status}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <View style={styles.row}>
          <MaterialIcons name="schedule" size={16} color={colors.text.light} />
          <Text style={styles.detailText}>{formatTime(activity.time)}</Text>
        </View>
        <View style={styles.row}>
          <MaterialIcons name="class" size={16} color={colors.text.light} />
          <Text style={styles.detailText}>{activity.class_name || activity.grade}</Text>
        </View>
        {activity.description && (
          <Text style={styles.description} numberOfLines={2}>
            {activity.description}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};











