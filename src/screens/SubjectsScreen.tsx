import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ViewStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAirtable } from '../hooks/useAirtable';
import { useTheme } from '../contexts/ThemeContext';

interface SubjectsScreenProps {
  navigation: any;
}

const shadowStyle: ViewStyle = {
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 2,
};

export const SubjectsScreen: React.FC<SubjectsScreenProps> = ({ navigation }) => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    backButton: {
      marginRight: spacing.md,
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.semiBold,
      color: colors.text.primary,
    },
    content: {
      flex: 1,
    },
    contentContainer: {
      padding: spacing.lg,
    },
    section: {
      marginBottom: spacing.xl,
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.md,
    },
    subjectCard: {
      width: '48%',
      backgroundColor: colors.background.primary,
      borderRadius: 12,
      padding: spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    subjectName: {
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.medium,
      color: colors.text.primary,
      marginTop: spacing.sm,
      textAlign: 'center',
    },
  });

  const { language } = useLanguage();
  const { getSubjectsByCategory, loading, error } = useAirtable();
  const [academicSubjects, setAcademicSubjects] = useState<any[]>([]);
  const [extracurricularSubjects, setExtracurricularSubjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const academic = await getSubjectsByCategory('academic');
        const extracurricular = await getSubjectsByCategory('extracurricular');
        
        setAcademicSubjects(academic);
        setExtracurricularSubjects(extracurricular);
      } catch (err) {
        console.error('Error fetching subjects:', err);
      }
    };

    fetchSubjects();
  }, [getSubjectsByCategory]);

  const SubjectCard = ({ subject }: { subject: any }) => (
    <TouchableOpacity
      style={[styles.subjectCard, shadowStyle]}
      onPress={() => navigation.navigate('SubjectResults', { subjectKey: subject.nameEn?.toLowerCase() || subject.key })}
    >
      <MaterialIcons 
        name={subject.icon as any}
        size={32}
        color={colors.primary}
      />
      <Text style={styles.subjectName}>
        {language === 'en' ? subject.nameEn : subject.nameVi}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'All Subjects' : 'Tất Cả Môn Học'}
        </Text>
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Academic Subjects' : 'Môn Học Chính'}
          </Text>
          <View style={styles.grid}>
            {academicSubjects.map(subject => (
              <SubjectCard key={subject.key} subject={subject} />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Extracurricular Activities' : 'Hoạt Động Ngoại Khóa'}
          </Text>
          <View style={styles.grid}>
            {extracurricularSubjects.map(subject => (
              <SubjectCard key={subject.key} subject={subject} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
