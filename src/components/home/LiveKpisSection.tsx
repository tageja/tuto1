import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';
import { getPlatformStats } from '../../services/supabase-db';

export const LiveKpisSection: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingVertical: spacing.xl,
      paddingHorizontal: spacing.lg,
      backgroundColor: colors.background.primary,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.background.tertiary,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.lg,
      justifyContent: 'space-between',
    },
    kpiItem: {
      width: '45%',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.xs,
      gap: 4,
    },
    label: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    value: {
      fontSize: 28,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginVertical: spacing.xs,
    },
    footerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#22C55E', // green-500
    },
    liveText: {
      fontSize: 10,
      color: colors.text.light,
    },
  });

  const { t } = useLanguage();
  const [stats, setStats] = useState({
    schools_count: 0,
    homework_completion_rate: 0,
    parent_engagement_rate: 0,
    attendance_rate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        if (mounted) {
          setStats(data);
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch stats', error);
        if (mounted) setLoading(false);
      }
    };

    fetchStats();
    return () => { mounted = false; };
  }, []);

  const items = [
    { 
      label: t('landing.kpis.schoolsTrusted') || 'Schools Trusted', 
      value: `${stats.schools_count}+`, 
      icon: 'school',
      color: '#2563EB' 
    },
    { 
      label: t('landing.kpis.homeworkCompletion') || 'Homework Completion', 
      value: `${stats.homework_completion_rate}%+`, 
      icon: 'check-circle',
      color: '#16A34A' 
    },
    { 
      label: t('landing.kpis.parentEngagement') || 'Parent Engagement', 
      value: `${stats.parent_engagement_rate}%+`, 
      icon: 'people',
      color: '#9333EA' 
    },
    { 
      label: t('landing.kpis.attendanceRate') || 'Attendance Rate', 
      value: `${stats.attendance_rate}%`, 
      icon: 'schedule',
      color: '#D97706' 
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        {items.map((item, index) => (
          <View key={index} style={styles.kpiItem}>
            <View style={styles.headerRow}>
              <MaterialIcons name={item.icon as any} size={16} color={item.color} />
              <Text style={styles.label}>{item.label}</Text>
            </View>
            
            {loading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Text style={styles.value}>{item.value}</Text>
            )}

            <View style={styles.footerRow}>
              <View style={styles.dot} />
              <Text style={styles.liveText}>
                {t('landing.kpis.liveUpdate') || 'Live Update'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};







