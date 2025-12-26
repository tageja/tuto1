import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { useLanguage } from '../../contexts/LanguageContext';

interface WeeklyAttendanceChartProps {
  data?: Array<{ day: string; percentage: number }>;
}

export const WeeklyAttendanceChart: React.FC<WeeklyAttendanceChartProps> = ({ data }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    chartContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      height: 150,
      paddingBottom: spacing.md,
    },
    barContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'flex-end',
    },
    barWrapper: {
      width: '80%',
      alignItems: 'center',
      justifyContent: 'flex-end',
      marginBottom: spacing.sm,
    },
    bar: {
      width: '100%',
      backgroundColor: '#4CAF50',
      borderRadius: 4,
      minHeight: 20,
    },
    dayLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontWeight: '500',
      marginTop: spacing.xs,
    },
  });

  const { language } = useLanguage();

  // Default data if not provided
  const weekData = data || [
    { day: language === 'vi' ? 'T2' : 'Mon', percentage: 95 },
    { day: language === 'vi' ? 'T3' : 'Tue', percentage: 92 },
    { day: language === 'vi' ? 'T4' : 'Wed', percentage: 98 },
    { day: language === 'vi' ? 'T5' : 'Thu', percentage: 94 },
    { day: language === 'vi' ? 'T6' : 'Fri', percentage: 96 },
  ];

  const maxHeight = 120;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {language === 'vi' ? 'Điểm danh hàng tuần' : 'Weekly Attendance'}
      </Text>
      
      <View style={styles.chartContainer}>
        {weekData.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar,
                  { height: (item.percentage / 100) * maxHeight }
                ]}
              />
            </View>
            <Text style={styles.dayLabel}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
};











