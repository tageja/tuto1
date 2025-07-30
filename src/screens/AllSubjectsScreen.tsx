import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ViewStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { subjects, Subject } from '../data/subjects';

interface AllSubjectsScreenProps {
  navigation: any;
}

export const AllSubjectsScreen: React.FC<AllSubjectsScreenProps> = ({ navigation }) => {
  const { language } = useLanguage();

  // Group subjects by category
  const academicSubjects = subjects.filter(subject => subject.category === 'academic');
  const extracurricularSubjects = subjects.filter(subject => subject.category === 'extracurricular');

  const SubjectPill = ({ subject }: { subject: Subject }) => (
    <TouchableOpacity
      style={[styles.subjectPill, shadowStyle]}
      onPress={() => navigation.navigate('SubjectResults', { subjectKey: subject.key })}
    >
      <MaterialIcons name={subject.icon} size={24} color={colors.background.primary} />
      <Text style={styles.subjectText}>
        {language === 'en' ? subject.nameEn : subject.nameVi}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Image
          source={require('../../assets/images/tuto-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          {language === 'en' ? 'Find Your Perfect Tutor' : 'Tìm Gia Sư Phù Hợp'}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Academic Subjects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Academic Subjects' : 'Môn Học Chính'}
          </Text>
          <View style={styles.pillGrid}>
            {academicSubjects.map((subject) => (
              <SubjectPill key={subject.key} subject={subject} />
            ))}
          </View>
        </View>

        {/* Extracurricular Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en' ? 'Extracurricular Activities' : 'Hoạt Động Ngoại Khóa'}
          </Text>
          <View style={styles.pillGrid}>
            {extracurricularSubjects.map((subject) => (
              <SubjectPill key={subject.key} subject={subject} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  backButton: {
    position: 'absolute',
    left: spacing.lg,
    zIndex: 1,
  },
  logo: {
    height: 40,
    width: 120,
  },
  titleContainer: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.background.primary,
    textAlign: 'center',
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
  pillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  subjectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    width: '48%',
  },
  subjectText: {
    color: colors.background.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
    flex: 1,
  },
});