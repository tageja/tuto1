/**
 * Class Detail Screen
 * Displays detailed information about a class
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { getClassById, getClassStudents, SchoolClass } from '../../services/supabase-classes';
import { useTheme } from '../../contexts/ThemeContext';

const ClassDetailScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background.secondary,
    },
    loadingText: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 8,
    },
    errorText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
      backgroundColor: colors.background.primary,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      marginRight: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    card: {
      backgroundColor: colors.background.primary,
      borderRadius: 16,
      padding: 20,
      margin: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    cardTitle: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 20,
    },
    infoRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.secondary,
    },
    infoContent: {
      flex: 1,
      marginLeft: 12,
    },
    infoLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    infoValue: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 16,
    },
    studentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.background.secondary,
    },
    studentAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#0B5FFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    studentAvatarText: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.background.primary,
    },
    studentName: {
      fontSize: 16,
      color: colors.text.primary,
    },
  });
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { classId } = route.params as { classId: string };

  const [classData, setClassData] = useState<SchoolClass | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClass();
  }, [classId]);

  const loadClass = async () => {
    try {
      setLoading(true);
      const data = await getClassById(classId);
      setClassData(data);

      if (data) {
        const studentsData = await getClassStudents(classId);
        setStudents(studentsData);
      }
    } catch (error) {
      console.error('Error loading class:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#0B5FFF" size="large" />
        <Text style={styles.loadingText}>{t('school.common.loading')}</Text>
      </View>
    );
  }

  if (!classData) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color="#D0D4DA" />
        <Text style={styles.errorText}>{t('school.classes.notFound')}</Text>
      </View>
    );
  }

  const capacityPercent = classData.capacity
    ? Math.round(((classData.student_count || 0) / classData.capacity) * 100)
    : 0;

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{classData.name}</Text>
      </View>

      {/* Overview Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{classData.name}</Text>

        {/* Grade */}
        {classData.grade_level && (
          <View style={styles.infoRow}>
            <MaterialIcons name="school" size={20} color={colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('school.classes.grade')}</Text>
              <Text style={styles.infoValue}>{classData.grade_level}</Text>
            </View>
          </View>
        )}

        {/* Teacher */}
        {classData.teacher_name && (
          <View style={styles.infoRow}>
            <MaterialIcons name="person" size={20} color={colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('school.classes.teacher')}</Text>
              <Text style={styles.infoValue}>{classData.teacher_name}</Text>
            </View>
          </View>
        )}

        {/* Room */}
        {classData.room_number && (
          <View style={styles.infoRow}>
            <MaterialIcons name="meeting-room" size={20} color={colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('school.classes.room')}</Text>
              <Text style={styles.infoValue}>Room {classData.room_number}</Text>
            </View>
          </View>
        )}

        {/* Academic Year */}
        {classData.academic_year && (
          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-today" size={20} color={colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('school.classes.academicYear')}</Text>
              <Text style={styles.infoValue}>{classData.academic_year}</Text>
            </View>
          </View>
        )}

        {/* Capacity */}
        {classData.capacity && (
          <View style={styles.infoRow}>
            <MaterialIcons name="people" size={20} color={colors.text.secondary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>{t('school.classes.capacity')}</Text>
              <Text style={styles.infoValue}>
                {classData.student_count || 0} / {classData.capacity} ({capacityPercent}%)
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Students List */}
      {students.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            {t('school.classes.students')} ({students.length})
          </Text>
          {students.map((student) => (
            <View key={student.id} style={styles.studentRow}>
              <View style={styles.studentAvatar}>
                <Text style={styles.studentAvatarText}>
                  {student.first_name?.charAt(0).toUpperCase() || '?'}
                </Text>
              </View>
              <Text style={styles.studentName}>
                {student.first_name} {student.last_name}
              </Text>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

export default ClassDetailScreen;







