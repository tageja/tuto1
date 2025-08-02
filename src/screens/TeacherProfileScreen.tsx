import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';

interface TeacherProfileScreenProps {
  navigation: any;
  route: {
    params: {
      teacherId: string;
      teacherName: string;
      subject: string;
      imageUrl?: string;
      rating?: number;
      reviews?: number;
      experience?: number;
      hourlyRate?: number;
    };
  };
}

export const TeacherProfileScreen: React.FC<TeacherProfileScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { language, t } = useLanguage();
  const { 
    teacherId,
    teacherName,
    subject,
    imageUrl,
    rating = 4.5,
    reviews = 127,
    experience = 5,
    hourlyRate = 25,
  } = route.params;

  const handleBooking = () => {
    navigation.navigate('Booking', {
      teacherId,
      teacherName,
      subject,
    });
  };

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
        <Text style={styles.headerTitle}>
          {t('teacherProfile.title')}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Teacher Basic Info */}
        <View style={styles.profileHeader}>
          <Image
            source={
              imageUrl 
                ? { uri: imageUrl }
                : require('../../assets/images/default-teacher.png.png')
            }
            style={styles.profileImage}
          />
          <Text style={styles.teacherName}>{teacherName}</Text>
          <Text style={styles.subject}>{subject}</Text>

          {/* Rating */}
          <View style={styles.ratingContainer}>
            <MaterialIcons name="star" size={20} color={colors.rating.filled} />
            <Text style={styles.rating}>{rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({reviews} {t('common.reviews')})</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <MaterialIcons name="school" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{experience}+</Text>
            <Text style={styles.statLabel}>
              {t('teacherProfile.yearsExperience')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="people" size={24} color={colors.primary} />
            <Text style={styles.statValue}>{reviews}+</Text>
            <Text style={styles.statLabel}>
              {t('teacherProfile.studentsTaught')}
            </Text>
          </View>
          <View style={styles.statItem}>
            <MaterialIcons name="attach-money" size={24} color={colors.primary} />
            <Text style={styles.statValue}>${hourlyRate}</Text>
            <Text style={styles.statLabel}>
              {t('teacherProfile.hourlyRate')}
            </Text>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('teacherProfile.about')}
          </Text>
          <Text style={styles.aboutText}>
            {language === 'en' 
              ? `Experienced ${subject} teacher with a passion for helping students succeed. Specializing in personalized learning approaches and exam preparation.`
              : `Gia sư ${subject} có kinh nghiệm với niềm đam mê giúp học sinh thành công. Chuyên về phương pháp học cá nhân hóa và ôn thi.`}
          </Text>
        </View>

        {/* Subjects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('teacherProfile.subjects')}
          </Text>
          <View style={styles.subjectTags}>
            <View style={styles.subjectTag}>
              <Text style={styles.subjectTagText}>{subject}</Text>
            </View>
          </View>
        </View>

        {/* Book Button */}
        <TouchableOpacity 
          style={styles.bookButton}
          onPress={handleBooking}
        >
          <Text style={styles.bookButtonText}>
            {t('teacherProfile.bookSession')}
          </Text>
          <MaterialIcons name="arrow-forward" size={20} color={colors.secondary} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
  },
  teacherName: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subject: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    marginLeft: spacing.xs,
  },
  reviews: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: spacing.lg,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border.light,
    marginBottom: spacing.lg,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  aboutText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  subjectTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },
  subjectTag: {
    backgroundColor: colors.background.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    margin: spacing.xs,
  },
  subjectTagText: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    margin: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  bookButtonText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.secondary,
    marginRight: spacing.sm,
  },
});