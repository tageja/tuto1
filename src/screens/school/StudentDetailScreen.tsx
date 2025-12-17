/**
 * Student Detail Screen
 * Shows detailed information about a student
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSchool } from '../../contexts/SchoolContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { getStudentById, SchoolStudent } from '../../services/supabase-students';
import { useTheme } from '../../contexts/ThemeContext';

const StudentDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 14,
      color: colors.text.secondary,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.secondary,
      paddingHorizontal: 32,
    },
    errorTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginTop: 16,
    },
    errorSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 8,
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButtonHeader: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      flex: 1,
      textAlign: 'center',
    },
    editButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      padding: 16,
    },
    profileSection: {
      alignItems: 'center',
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 24,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    avatar: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#0B5FFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 16,
    },
    avatarText: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.background.primary,
    },
    studentName: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 8,
    },
    studentCode: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 12,
    },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 16,
    },
    statusBadgeActive: {
      backgroundColor: '#ECFDF3',
    },
    statusBadgeInactive: {
      backgroundColor: colors.background.tertiary,
    },
    statusText: {
      fontSize: 14,
      fontWeight: '600',
    },
    statusTextActive: {
      color: '#15803D',
    },
    statusTextInactive: {
      color: colors.text.secondary,
    },
    classInfo: {
      alignItems: 'center',
    },
    classLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    classValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    gradeValue: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 4,
    },
    section: {
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 16,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      minWidth: 100,
    },
    infoValue: {
      fontSize: 14,
      color: colors.text.primary,
      flex: 1,
    },
    backButton: {
      marginTop: 24,
      paddingVertical: 12,
      paddingHorizontal: 24,
      backgroundColor: '#0B5FFF',
      borderRadius: 12,
    },
    backButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background.primary,
    },
  });
  const { t } = useLanguage();
  const { currentSchool } = useSchool();
  const navigation = useNavigation();
  const route = useRoute();

  // @ts-ignore - Route params
  const { studentId } = route.params || {};

  const [student, setStudent] = useState<SchoolStudent | null>(null);
  const [loading, setLoading] = useState(true);

  // Load student data
  const loadStudent = useCallback(async () => {
    if (!currentSchool?.id || !studentId) return;

    try {
      setLoading(true);
      const studentData = await getStudentById(studentId, currentSchool.id);
      setStudent(studentData);
    } catch (error) {
      console.error('Error loading student:', error);
    } finally {
      setLoading(false);
    }
  }, [currentSchool, studentId]);

  useEffect(() => {
    loadStudent();
  }, [loadStudent]);

  // Get initials for avatar
  const getInitials = (firstName: string, lastName: string): string => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    if (first && last) return `${first}${last}`;
    if (firstName) return firstName.substring(0, 2).toUpperCase();
    if (lastName) return lastName.substring(0, 2).toUpperCase();
    return '??';
  };

  // Format date
  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  // Calculate age from date of birth
  const calculateAge = (dob: string | null): string => {
    if (!dob) return 'N/A';
    try {
      const birthDate = new Date(dob);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age.toString();
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0B5FFF" size="large" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color="#D0D4DA" />
        <Text style={styles.errorTitle}>
          {t('school.students.notFound')}
        </Text>
        <Text style={styles.errorSubtitle}>
          {t('school.students.noStudentsSubtitle')}
        </Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const initials = getInitials(student.firstName || '', student.lastName || '');
  const isActive = student.status?.toLowerCase() === 'active';

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t('school.students.title')}
        </Text>
        <TouchableOpacity style={styles.editButton}>
          <MaterialIcons name="edit" size={24} color="#0B5FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          {student.photoUrl ? (
            <Image
              source={{ uri: student.photoUrl }}
              style={styles.avatar}
            />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}

          <Text style={styles.studentName}>{student.name}</Text>
          <Text style={styles.studentCode}>
            {t('school.students.class')}: {student.code || 'N/A'}
          </Text>

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

          {student.className && (
            <View style={styles.classInfo}>
              <Text style={styles.classLabel}>
                {t('school.students.class')}:
              </Text>
              <Text style={styles.classValue}>{student.className}</Text>
              {student.grade && (
                <Text style={styles.gradeValue}>
                  ({t('school.students.grade')} {student.grade})
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('common.personalInfo') || 'Personal Information'}
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('common.dateOfBirth') || 'Date of Birth'}:
            </Text>
            <Text style={styles.infoValue}>
              {formatDate(student.dateOfBirth)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              {t('school.students.detail.age') || 'Age'}:
            </Text>
            <Text style={styles.infoValue}>
              {calculateAge(student.dateOfBirth)} {t('school.students.detail.years') || 'years'}
            </Text>
          </View>

          {student.gender && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('common.gender') || 'Gender'}:
              </Text>
              <Text style={styles.infoValue}>{student.gender}</Text>
            </View>
          )}

          {student.address && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('common.address') || 'Address'}:
              </Text>
              <Text style={styles.infoValue}>{student.address}</Text>
            </View>
          )}
        </View>

        {/* Parent Information */}
        {student.parent && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t('school.students.parent')}
            </Text>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('common.name') || 'Name'}:
              </Text>
              <Text style={styles.infoValue}>{student.parent}</Text>
            </View>

            {student.parentEmail && (
              <View style={styles.infoRow}>
                <MaterialIcons name="email" size={16} color={colors.text.secondary} />
                <Text style={styles.infoValue}>{student.parentEmail}</Text>
              </View>
            )}

            {student.parentPhone && (
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={16} color={colors.text.secondary} />
                <Text style={styles.infoValue}>{student.parentPhone}</Text>
              </View>
            )}
          </View>
        )}

        {/* Enrollment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('common.enrollment') || 'Enrollment Information'}
          </Text>

          {student.enrolledAt && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {t('common.enrollmentDate') || 'Enrollment Date'}:
              </Text>
              <Text style={styles.infoValue}>
                {formatDate(student.enrolledAt)}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

export default StudentDetailScreen;


