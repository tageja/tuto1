/**
 * Class List Item Component
 * Displays class information in a card format
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SchoolClass } from '../../services/supabase-classes';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface ClassListItemProps {
  classData: SchoolClass;
  onPress?: () => void;
}

export const ClassListItem: React.FC<ClassListItemProps> = ({
  classData,
  onPress,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    gradePill: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: '#EEF2FF',
    },
    gradeText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#4338CA',
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#ECFDF3',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#15803D',
    },
    className: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 8,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 8,
    },
    metaItem: {
      flex: 1,
      backgroundColor: colors.background.secondary,
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    metaLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },
    metaValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 2,
    },
    footer: {
      marginTop: 10,
    },
    button: {
      backgroundColor: colors.background.tertiary,
      paddingVertical: 10,
      borderRadius: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    buttonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
  });

  const { t } = useLanguage();
  const getGradeColor = (grade: string) => {
    // Color code by grade level
    const gradeNum = parseInt(grade, 10);
    if (gradeNum <= 3) return '#10B981';
    if (gradeNum <= 6) return '#F59E0B';
    if (gradeNum <= 9) return '#EF4444';
    return '#8B5CF6';
  };

  const capacityPercent = classData.capacity
    ? Math.round(((classData.student_count || 0) / classData.capacity) * 100)
    : 0;

  const getCapacityColor = (percent: number) => {
    if (percent >= 90) return '#EF4444';
    if (percent >= 75) return '#F59E0B';
    return '#10B981';
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.topRow}>
        <View style={styles.gradePill}>
          <Text style={styles.gradeText}>{classData.grade_level || '-'}</Text>
        </View>
        <View style={styles.statusPill}>
          <MaterialIcons name="check-circle" size={14} color="#10B981" />
          <Text style={styles.statusText}>{classData.status || t('school.classes.active')}</Text>
        </View>
      </View>

      <Text style={styles.className}>{classData.name}</Text>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="person" size={16} color="#6B7280" />
          <Text style={styles.metaLabel}>{t('school.classes.teacher')}</Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {classData.teacher_name || t('school.classes.notAssigned')}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="people" size={16} color="#6B7280" />
          <Text style={styles.metaLabel}>{t('school.classes.students')}</Text>
          <Text style={styles.metaValue}>
            {classData.student_count || 0}
            {classData.capacity ? ` / ${classData.capacity}` : ''}
          </Text>
        </View>
      </View>

      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <MaterialIcons name="meeting-room" size={16} color="#6B7280" />
          <Text style={styles.metaLabel}>{t('school.classes.room')}</Text>
          <Text style={styles.metaValue}>{classData.room_number || '—'}</Text>
        </View>
        <View style={styles.metaItem}>
          <MaterialIcons name="pie-chart" size={16} color="#6B7280" />
          <Text style={styles.metaLabel}>{t('school.classes.capacity')}</Text>
          <Text style={[styles.metaValue, { color: getCapacityColor(capacityPercent) }]}>
            {capacityPercent}%
          </Text>
        </View>
      </View>

      {onPress && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{t('school.classes.viewDetails')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};


export default ClassListItem;

