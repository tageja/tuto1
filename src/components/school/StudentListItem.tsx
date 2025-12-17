/**
 * Student List Item Component
 * Displays student information in a card format matching Figma design
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SchoolStudent } from '../../types/school';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

interface StudentListItemProps {
  student: SchoolStudent;
  onPress?: () => void;
}

export const StudentListItem: React.FC<StudentListItemProps> = ({
  student,
  onPress,
}) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: 18,
      padding: 16,
      marginHorizontal: 16,
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
      alignItems: 'flex-start',
      marginBottom: 12,
    },
    avatarContainer: {
      marginRight: 12,
    },
    avatar: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: '#0B5FFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.background.primary,
    },
    nameContainer: {
      flex: 1,
      marginRight: 8,
    },
    studentName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    studentCode: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    statusBadgeActive: {
      backgroundColor: '#ECFDF3',
    },
    statusBadgeInactive: {
      backgroundColor: colors.background.tertiary,
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
    },
    statusTextActive: {
      color: '#15803D',
    },
    statusTextInactive: {
      color: colors.text.secondary,
    },
    metaRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
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
      marginBottom: 4,
    },
    metaValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    parentSection: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    parentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    parentLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginLeft: 6,
    },
    parentName: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 6,
    },
    parentContactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
    },
    parentContact: {
      fontSize: 12,
      color: colors.text.secondary,
      marginLeft: 6,
      flex: 1,
    },
    footer: {
      marginTop: 12,
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

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    if (first && last) return `${first}${last}`;
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (lastName) return lastName.substring(0, 2).toUpperCase();
    return '??';
  };

  const initials = getInitials(student.firstName || '', student.lastName || '');
  const isActive = student.status?.toLowerCase() === 'active';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      {/* Top Row: Avatar, Name, Code, Status */}
      <View style={styles.topRow}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>

        {/* Name and Code */}
        <View style={styles.nameContainer}>
          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentCode}>{student.code || 'N/A'}</Text>
        </View>

        {/* Status Badge */}
        <View
          style={[
            styles.statusBadge,
            isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
          ]}
        >
          <Text
            style={[
              styles.statusText,
              isActive ? styles.statusTextActive : styles.statusTextInactive,
            ]}
          >
            {isActive
              ? t('school.students.status.active')
              : t('school.students.status.inactive')}
          </Text>
        </View>
      </View>

      {/* Class and Grade Row */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            {t('school.students.class')}
          </Text>
          <Text style={styles.metaValue} numberOfLines={1}>
            {student.className || t('school.students.unassigned')}
          </Text>
        </View>
        <View style={styles.metaItem}>
          <Text style={styles.metaLabel}>
            {t('school.students.grade')}
          </Text>
          <Text style={styles.metaValue}>
            {student.grade || 'N/A'}
          </Text>
        </View>
      </View>

      {/* Parent Section */}
      {student.parent && (
        <View style={styles.parentSection}>
          <View style={styles.parentRow}>
            <MaterialIcons name="person" size={16} color="#6B7280" />
            <Text style={styles.parentLabel}>
              {t('school.students.parent')}
            </Text>
          </View>
          <Text style={styles.parentName} numberOfLines={1}>
            {student.parent}
          </Text>
          {student.parentEmail && (
            <View style={styles.parentContactRow}>
              <MaterialIcons name="email" size={14} color="#6B7280" />
              <Text style={styles.parentContact} numberOfLines={1}>
                {student.parentEmail}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* View Profile Button */}
      {onPress && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>
              {t('school.students.viewProfile')}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
};


export default StudentListItem;





