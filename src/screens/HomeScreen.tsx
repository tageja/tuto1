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
import { useUser } from '../contexts/UserContext';
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
  const { language, t } = useLanguage();
  const { userType, clearUser } = useUser();
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

  const handleLogout = async () => {
    await clearUser();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  const renderQuickActions = () => {
    const actions = [];
    
    // Common actions for all user types
    actions.push(
      { key: 'dashboard', icon: 'dashboard', title: t('home.learningDashboard'), color: colors.primary },
      { key: 'ask', icon: 'help', title: t('home.ask'), color: '#FF6B35' },
      { key: 'chats', icon: 'chat', title: t('home.chats'), color: '#4CAF50' },
      { key: 'forum', icon: 'forum', title: t('home.forum'), color: '#9C27B0' }
    );

    // Role-specific actions
    if (userType === 'parent') {
      actions.push(
        { key: 'children', icon: 'child-care', title: t('home.myChildren'), color: '#FF9800' },
        { key: 'payments', icon: 'payment', title: t('home.payments'), color: '#2196F3' }
      );
    } else if (userType === 'student') {
      actions.push(
        { key: 'assignments', icon: 'assignment', title: t('home.assignments'), color: '#FF9800' },
        { key: 'progress', icon: 'trending-up', title: t('home.progress'), color: '#2196F3' }
      );
    } else if (userType === 'teacher') {
      actions.push(
        { key: 'schedule', icon: 'schedule', title: t('home.mySchedule'), color: '#FF9800' },
        { key: 'earnings', icon: 'account-balance-wallet', title: t('home.earnings'), color: '#2196F3' }
      );
    }

    return actions;
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../assets/images/tuto-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications')}
          >
            <MaterialIcons name="notifications" size={24} color={colors.primary} />
            {/* Badge for unread notifications */}
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.profileButton}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <MaterialIcons name="person" size={24} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <LanguageToggle />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchBar}
          onPress={() => navigation.navigate('AllSubjects')}
        >
          <MaterialIcons name="search" size={24} color={colors.text.secondary} />
          <Text style={styles.searchText}>
            {t('home.searchPlaceholder')}
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

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.quickActions')}
            </Text>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActionsContainer}
          >
            {renderQuickActions().map((action) => (
              <TouchableOpacity
                key={action.key}
                style={[styles.actionCard, { backgroundColor: action.color }]}
                onPress={() => {
                  // Handle navigation based on action key
                  switch (action.key) {
                    case 'dashboard':
                      navigation.navigate('Dashboard');
                      break;
                    case 'ask':
                      // TODO: Navigate to Ask screen
                      break;
                    case 'chats':
                      // TODO: Navigate to Chats screen
                      break;
                    case 'forum':
                      // TODO: Navigate to Forum screen
                      break;
                    case 'children':
                      // TODO: Navigate to Children screen
                      break;
                    case 'payments':
                      // TODO: Navigate to Payments screen
                      break;
                    case 'assignments':
                      // TODO: Navigate to Assignments screen
                      break;
                    case 'progress':
                      // TODO: Navigate to Progress screen
                      break;
                    case 'schedule':
                      navigation.navigate('Schedule');
                      break;
                    case 'earnings':
                      // TODO: Navigate to Earnings screen
                      break;
                    default:
                      break;
                  }
                }}
              >
                <MaterialIcons name={action.icon as any} size={20} color={colors.background.primary} />
                <Text style={styles.actionTitle}>
                  {action.title}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Popular Subjects */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.popularSubjects')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllSubjects')}>
              <Text style={styles.viewAll}>
                {t('home.viewAll')}
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
                {t('booking.bookSession')}
              </Text>
              <Text style={styles.bannerSubtitle}>
                {t('home.trialDescription')}
              </Text>
              <View style={styles.bannerButton}>
                <Text style={styles.bannerButtonText}>
                  {t('home.bookTrial')}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Recommended Teachers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.recommendedTeachers')}
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
                    ({teacher.reviews} {t('common.reviews')})
                  </Text>
                </View>
                <Text style={styles.price}>
                  {formatCurrency(teacher.hourlyRate)}/{t('common.perHour')}
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
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.primary,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileButton: {
    padding: spacing.xs,
  },
  logoutButton: {
    padding: spacing.xs,
  },
  logo: {
    height: 20,
    width: 59,
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
    marginBottom: spacing.md,
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
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
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
  quickActionsContainer: {
    paddingHorizontal: spacing.lg,
    gap: spacing.xs,
  },
  actionCard: {
    width: 100,
    height: 80,
    borderRadius: 12,
    padding: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.xs,
    ...shadowStyle,
  },
  actionTitle: {
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.medium,
    color: colors.background.primary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  notificationButton: {
    position: 'relative',
    padding: spacing.xs,
    marginRight: spacing.xs,
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: colors.status.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.background.primary,
  },
  notificationBadgeText: {
    color: colors.background.primary,
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    fontWeight: 'bold',
  },
});