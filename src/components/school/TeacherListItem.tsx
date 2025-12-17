/**
 * Teacher List Item Component
 * Displays teacher information in a card format
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SchoolTeacher } from '../../services/supabase-teachers';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface TeacherListItemProps {
  teacher: SchoolTeacher;
  onPress?: () => void;
}

export const TeacherListItem: React.FC<TeacherListItemProps> = ({
  teacher,
  onPress,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background.primary,
      borderRadius: 18,
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
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginRight: 12,
      backgroundColor: '#EEF2FF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#4338CA',
    },
    content: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    name: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      flex: 1,
      marginRight: 8,
    },
    subtitle: {
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '600',
      textTransform: 'uppercase',
    },
    chipsRow: {
      flexDirection: 'row',
      gap: 6,
      flexWrap: 'wrap',
      marginTop: 6,
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      backgroundColor: colors.background.tertiary,
    },
    chipText: {
      fontSize: 12,
      color: colors.text.primary,
      fontWeight: '500',
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 8,
    },
    infoText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginLeft: 6,
      flex: 1,
    },
  });

  const { t } = useLanguage();

  const initials = (teacher.name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('');

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return '#10B981';
      case 'on leave':
      case 'onleave':
        return '#F59E0B';
      default:
        return '#888888';
    }
  };

  const translateStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return t('school.teachers.status.active');
      case 'on leave':
      case 'onleave':
        return t('school.teachers.status.onLeave');
      default:
        return status;
    }
  };

  const translateSubject = (subject: string) => {
    // Common subject translations
    const subjectKey = subject?.toLowerCase().replace(/\s+/g, '');
    const translationKey = `school.subjects.${subjectKey}`;
    const translated = t(translationKey);
    // If no translation found, return original (fallback)
    return translated === translationKey ? subject : translated;
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{initials || 'T'}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {teacher.name || '—'}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(teacher.status) + '20' },
            ]}
          >
            <Text
              style={[styles.statusText, { color: getStatusColor(teacher.status) }]}
            >
              {translateStatus(teacher.status || 'Unknown')}
            </Text>
          </View>
        </View>

        {!!teacher.qualifications && (
          <Text style={styles.subtitle} numberOfLines={1}>
            {teacher.qualifications}
          </Text>
        )}

        {teacher.subjects && teacher.subjects.length > 0 && (
          <View style={styles.chipsRow}>
            {teacher.subjects.slice(0, 3).map((subj) => (
              <View key={subj} style={styles.chip}>
                <Text style={styles.chipText}>{translateSubject(subj)}</Text>
              </View>
            ))}
          </View>
        )}

        {teacher.email && (
          <View style={styles.infoRow}>
            <MaterialIcons name="email" size={14} color="#888888" />
            <Text style={styles.infoText} numberOfLines={1}>
              {teacher.email}
            </Text>
          </View>
        )}

        {teacher.phone && (
          <View style={styles.infoRow}>
            <MaterialIcons name="phone" size={14} color="#888888" />
            <Text style={styles.infoText} numberOfLines={1}>
              {teacher.phone}
            </Text>
          </View>
        )}
      </View>

      {onPress && (
        <MaterialIcons name="chevron-right" size={22} color="#A0AEC0" />
      )}
    </TouchableOpacity>
  );
};


export default TeacherListItem;

