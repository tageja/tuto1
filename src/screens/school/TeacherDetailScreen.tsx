/**
 * Teacher Detail Screen
 * Displays detailed information about a teacher (Parent view)
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import { getTeacherById, getTeacherClasses, SchoolTeacher } from '../../services/supabase-teachers';
import { useTheme } from '../../contexts/ThemeContext';

const TeacherDetailScreen: React.FC = () => {
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
      padding: 24,
      margin: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    avatarContainer: {
      alignItems: 'center',
      marginBottom: 16,
    },
    avatar: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: '#0B5FFF',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 32,
      fontWeight: '600',
      color: colors.background.primary,
    },
    name: {
      fontSize: 24,
      fontWeight: '600',
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 8,
    },
    statusBadge: {
      alignSelf: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      marginBottom: 24,
    },
    statusActive: {
      backgroundColor: '#10B98120',
    },
    statusText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#10B981',
    },
    section: {
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    subjectsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    subjectChip: {
      backgroundColor: colors.background.secondary,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    subjectText: {
      fontSize: 14,
      color: colors.text.primary,
    },
    contactRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    contactText: {
      fontSize: 16,
      color: '#0B5FFF',
      marginLeft: 12,
    },
    classRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
    },
    className: {
      fontSize: 16,
      color: colors.text.primary,
      marginLeft: 12,
    },
  });
  const { t } = useLanguage();
  const navigation = useNavigation();
  const route = useRoute();
  const { teacherId } = route.params as { teacherId: string };

  const [teacher, setTeacher] = useState<SchoolTeacher | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeacher();
  }, [teacherId]);

  const loadTeacher = async () => {
    try {
      setLoading(true);
      const teacherData = await getTeacherById(teacherId);
      setTeacher(teacherData);

      if (teacherData) {
        const classesData = await getTeacherClasses(teacherId);
        setClasses(classesData);
      }
    } catch (error) {
      console.error('Error loading teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = () => {
    if (teacher?.email) {
      Linking.openURL(`mailto:${teacher.email}`);
    }
  };

  const handlePhone = () => {
    if (teacher?.phone) {
      Linking.openURL(`tel:${teacher.phone}`);
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

  if (!teacher) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="error-outline" size={48} color="#D0D4DA" />
        <Text style={styles.errorText}>{t('school.teachers.notFound')}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{teacher.name}</Text>
      </View>

      {/* Profile Card */}
      <View style={styles.card}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{teacher.name.charAt(0).toUpperCase()}</Text>
          </View>
        </View>

        <Text style={styles.name}>{teacher.name}</Text>
        
        {teacher.status && (
          <View style={[styles.statusBadge, styles.statusActive]}>
            <Text style={styles.statusText}>{teacher.status}</Text>
          </View>
        )}

        {/* Subjects */}
        {teacher.subjects && teacher.subjects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('school.teachers.subjects')}</Text>
            <View style={styles.subjectsContainer}>
              {teacher.subjects.map((subject, index) => (
                <View key={index} style={styles.subjectChip}>
                  <Text style={styles.subjectText}>{subject}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('school.teachers.contact')}</Text>
          
          {teacher.email && (
            <TouchableOpacity style={styles.contactRow} onPress={handleEmail}>
              <MaterialIcons name="email" size={20} color="#0B5FFF" />
              <Text style={styles.contactText}>{teacher.email}</Text>
            </TouchableOpacity>
          )}

          {teacher.phone && (
            <TouchableOpacity style={styles.contactRow} onPress={handlePhone}>
              <MaterialIcons name="phone" size={20} color="#0B5FFF" />
              <Text style={styles.contactText}>{teacher.phone}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Classes */}
        {classes.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('school.teachers.classes')}</Text>
            {classes.map((cls) => (
              <View key={cls.id} style={styles.classRow}>
                <MaterialIcons name="class" size={20} color={colors.text.secondary} />
                <Text style={styles.className}>{cls.name}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default TeacherDetailScreen;











