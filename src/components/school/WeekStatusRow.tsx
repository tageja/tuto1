import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { getAttendanceStatusColor } from '../../services/school/attendance';
import type { AttendanceStatus } from '../../types/school/attendance';
import { useTheme } from '../../contexts/ThemeContext';

interface WeekStatusRowProps {
  statusMap: { [date: string]: AttendanceStatus | null };
  weekStart: Date;
  onDayPress?: (date: string) => void;
  showLabels?: boolean; // Show M, T, W, T, F labels
}

const weekDays = ['M', 'T', 'W', 'T', 'F'];

export const WeekStatusRow: React.FC<WeekStatusRowProps> = ({
  statusMap,
  weekStart,
  onDayPress,
  showLabels = true,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginVertical: spacing.xs,
    },
    dayLabels: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: spacing.xs,
    },
    dayLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontFamily: typography.fontFamily.medium,
      width: 24,
      textAlign: 'center',
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    dayContainer: {
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.1)',
    },
    statusLetter: {
      color: colors.background.primary,
      fontSize: typography.fontSize.xs,
      fontWeight: '700',
      fontFamily: typography.fontFamily.bold,
    },
    tooltip: {
      position: 'absolute',
      bottom: 32,
      backgroundColor: colors.text.primary,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: borderRadius.sm,
      zIndex: 1000,
    },
    tooltipText: {
      color: colors.background.primary,
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.medium,
    },
  });

  const [tooltipDate, setTooltipDate] = useState<string | null>(null);

  // Get Monday-Friday dates for the week
  const getWeekDates = (): string[] => {
    const dates: string[] = [];
    const current = new Date(weekStart);
    const dayOfWeek = current.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    current.setDate(current.getDate() + mondayOffset);

    // Get Monday to Friday (5 days)
    for (let i = 0; i < 5; i++) {
      const date = new Date(current);
      date.setDate(current.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const getStatusLetter = (status: AttendanceStatus | null): string => {
    if (!status) return '';
    switch (status) {
      case 'present':
        return 'P';
      case 'absent':
        return 'A';
      case 'late':
        return 'L';
      case 'excused':
        return 'E';
      default:
        return '';
    }
  };

  const handleLongPress = (date: string) => {
    setTooltipDate(date);
    setTimeout(() => setTooltipDate(null), 2000);
  };

  const getStatusLabel = (status: AttendanceStatus | null): string => {
    if (!status) return '';
    switch (status) {
      case 'present':
        return 'Present';
      case 'absent':
        return 'Absent';
      case 'late':
        return 'Late';
      case 'excused':
        return 'Excused';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.dayLabels}>
          {weekDays.map((day, index) => (
            <Text key={index} style={styles.dayLabel}>
              {day}
            </Text>
          ))}
        </View>
      )}
      <View style={styles.statusRow}>
        {weekDates.map((date, index) => {
          const status = statusMap[date] || null;
          const color = status ? getAttendanceStatusColor(status) : '#E0E0E0';
          const letter = getStatusLetter(status);
          const isTooltipVisible = tooltipDate === date && status;

          return (
            <TouchableOpacity
              key={date}
              style={styles.dayContainer}
              onPress={() => onDayPress?.(date)}
              onLongPress={() => handleLongPress(date)}
              activeOpacity={0.7}
            >
              <View style={[styles.statusCircle, { backgroundColor: color }]}>
                {letter ? (
                  <Text style={styles.statusLetter}>{letter}</Text>
                ) : null}
              </View>
              {isTooltipVisible && (
                <View style={styles.tooltip}>
                  <Text style={styles.tooltipText}>
                    {getStatusLabel(status)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};



