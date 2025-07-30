import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ViewStyle,
  TextStyle,
  ImageStyle,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { dummyTeachers } from '../data/dummyTeachers';

interface SubjectResultsScreenProps {
  navigation: any;
  route: {
    params: {
      subjectKey: string;
    };
  };
}

interface Styles {
  container: ViewStyle;
  header: ViewStyle;
  backButton: ViewStyle;
  headerTitle: TextStyle;
  content: ViewStyle;
  contentContainer: ViewStyle;
  centerContent: ViewStyle;
  noResultsText: TextStyle;
  teacherCard: ViewStyle;
  teacherImage: ImageStyle;
  teacherInfo: ViewStyle;
  teacherName: TextStyle;
  subjects: TextStyle;
  ratingContainer: ViewStyle;
  rating: TextStyle;
  reviews: TextStyle;
  priceContainer: ViewStyle;
  price: TextStyle;
  perHour: TextStyle;
}

export const SubjectResultsScreen: React.FC<SubjectResultsScreenProps> = ({ 
  navigation, 
  route 
}) => {
  const { subjectKey } = route.params;
  const { language } = useLanguage();

  // Filter teachers by subject
  const teachers = dummyTeachers.filter(teacher => 
    teacher.subjects.includes(subjectKey)
  );

  const TeacherCard = ({ teacher }: { teacher: typeof dummyTeachers[0] }) => (
    <TouchableOpacity
      style={[styles.teacherCard, shadowStyle]}
      onPress={() => navigation.navigate('TeacherProfile', {
        teacherId: teacher.id,
        teacherName: teacher.name,
        subject: subjectKey,
        imageUrl: teacher.imageUrl,
        rating: teacher.rating,
        reviews: teacher.reviews,
        experience: teacher.experience,
        hourlyRate: teacher.hourlyRate,
      })}
    >
      <Image
        source={require('../../assets/images/default-teacher.png.png')}
        style={styles.teacherImage}
      />
      <View style={styles.teacherInfo}>
        <Text style={styles.teacherName}>{teacher.name}</Text>
        <Text style={styles.subjects}>
          {teacher.subjects.join(' • ')}
        </Text>
        <View style={styles.ratingContainer}>
          <MaterialIcons name="star" size={16} color={colors.rating.filled} />
          <Text style={styles.rating}>{teacher.rating.toFixed(1)}</Text>
          <Text style={styles.reviews}>
            ({teacher.reviews} {language === 'en' ? 'reviews' : 'đánh giá'})
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>${teacher.hourlyRate}</Text>
          <Text style={styles.perHour}>
            {language === 'en' ? '/hour' : '/giờ'}
          </Text>
        </View>
      </View>
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
        <Text style={styles.headerTitle}>
          {language === 'en' ? 'Available Teachers' : 'Gia Sư Khả Dụng'}
        </Text>
      </View>

      {/* Content */}
      {teachers.length === 0 ? (
        <View style={styles.centerContent}>
          <Text style={styles.noResultsText}>
            {language === 'en' 
              ? 'No teachers available for this subject'
              : 'Không tìm thấy gia sư cho môn học này'}
          </Text>
        </View>
      ) : (
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {teachers.map(teacher => (
            <TeacherCard key={teacher.id} teacher={teacher} />
          ))}
        </ScrollView>
      )}
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

const styles = StyleSheet.create<Styles>({
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
  contentContainer: {
    padding: spacing.lg,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  noResultsText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  teacherCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: spacing.md,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subjects: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rating: {
    fontSize: typography.fontSize.sm,
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
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  perHour: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.regular,
    color: colors.text.secondary,
    marginLeft: spacing.xs,
  },
});