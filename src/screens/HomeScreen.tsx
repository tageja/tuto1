import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ViewStyle,
  Dimensions,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { colors, spacing, typography } from '../theme';
import { LanguageToggle } from '../components/LanguageToggle';
import { subjects } from '../data/subjects';
import { dummyTeachers } from '../data/dummyTeachers';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
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

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { language } = useLanguage();
  const popularSubjects = subjects.slice(0, 4);
  const recommendedTeachers = dummyTeachers.slice(0, 3);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/images/tuto-logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <LanguageToggle />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('AllSubjects')}
        >
          <MaterialIcons name="search" size={24} color={colors.text.secondary} />
          <Text style={styles.searchText}>
            {language === 'en' ? 'Find your perfect tutor...' : 'Tìm gia sư phù hợp...'}
          </Text>
        </TouchableOpacity>

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          <Image
            source={require('../../assets/images/home-illustration.png')}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        {/* Popular Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Popular Subjects' : 'Môn Học Phổ Biến'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllSubjects')}>
              <Text style={styles.viewAll}>
                {language === 'en' ? 'View All' : 'Xem Tất Cả'}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.subjectsRow}>
              {popularSubjects.map((subject) => (
                <TouchableOpacity
                  key={subject.key}
                  style={styles.subjectCard}
                  onPress={() => navigation.navigate('SubjectResults', { subjectKey: subject.key })}
                >
                  <MaterialIcons name={subject.icon} size={32} color={colors.primary} />
                  <Text style={styles.subjectName}>
                    {language === 'en' ? subject.nameEn : subject.nameVi}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Book Session Banner */}
        <TouchableOpacity
          style={styles.bookingBanner}
          onPress={() => navigation.navigate('TeacherProfile', {
            teacherId: recommendedTeachers[0].id,
            teacherName: recommendedTeachers[0].name,
            subject: recommendedTeachers[0].subjects[0],
            imageUrl: recommendedTeachers[0].imageUrl,
            rating: recommendedTeachers[0].rating,
            reviews: recommendedTeachers[0].reviews,
            experience: recommendedTeachers[0].experience,
            hourlyRate: recommendedTeachers[0].hourlyRate,
          })}
        >
          <ImageBackground
            source={require('../../assets/images/partial-react-logo.png')}
            style={styles.bannerBackground}
            resizeMode="cover"
          >
            <View style={styles.bannerContent}>
              <Text style={styles.bannerTitle}>
                {language === 'en' ? 'Book Your Session Now' : 'Đặt Lịch Học Ngay'}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {language === 'en' ? 'Start your learning journey today' : 'Bắt đầu hành trình học tập của bạn'}
              </Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>
                  {language === 'en' ? 'Get Started' : 'Bắt Đầu'}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Recommended Teachers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {language === 'en' ? 'Recommended Teachers' : 'Gia Sư Được Đề Xuất'}
            </Text>
          </View>
          {recommendedTeachers.map((teacher) => (
            <TouchableOpacity
              key={teacher.id}
              style={[styles.teacherCard, shadowStyle]}
              onPress={() => navigation.navigate('TeacherProfile', {
                teacherId: teacher.id,
                teacherName: teacher.name,
                subject: teacher.subjects[0],
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
                <Text style={styles.teacherSubjects}>
                  {teacher.subjects.map(subject => {
                    const subjectData = subjects.find(s => s.key === subject);
                    return language === 'en' ? subjectData?.nameEn : subjectData?.nameVi;
                  }).join(' • ')}
                </Text>
                <View style={styles.ratingContainer}>
                  <MaterialIcons name="star" size={16} color={colors.rating.filled} />
                  <Text style={styles.rating}>{teacher.rating.toFixed(1)}</Text>
                  <Text style={styles.reviews}>
                    ({teacher.reviews} {language === 'en' ? 'reviews' : 'đánh giá'})
                  </Text>
                </View>
                <Text style={styles.price}>
                  {formatCurrency(teacher.hourlyRate)}/{language === 'en' ? 'hour' : 'giờ'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  logo: {
    height: 40,
    width: 120,
  },
  content: {
    flex: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm, // Reduced gap
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
  },
  searchText: {
    marginLeft: spacing.sm,
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  heroContainer: {
    width: width, // Full screen width
    height: 200,
    marginBottom: spacing.xl,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
  },
  viewAll: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.primary,
  },
  subjectsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  subjectCard: {
    alignItems: 'center',
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 100,
  },
  subjectName: {
    marginTop: spacing.sm,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    color: colors.text.primary,
    textAlign: 'center',
  },
  bookingBanner: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    borderRadius: 12,
    overflow: 'hidden',
    height: 180,
  },
  bannerBackground: {
    width: '100%',
    height: '100%',
  },
  bannerContent: {
    flex: 1,
    padding: spacing.lg,
    justifyContent: 'center',
    backgroundColor: 'rgba(11, 95, 255, 0.9)',
  },
  bannerTitle: {
    color: colors.background.primary,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    marginBottom: spacing.xs,
  },
  bannerSubtitle: {
    color: colors.background.primary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    marginBottom: spacing.md,
  },
  bannerButton: {
    backgroundColor: colors.background.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  bannerButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
  },
  teacherCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
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
  teacherSubjects: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  rating: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  reviews: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  price: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
});