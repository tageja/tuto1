import React, { useState, useEffect } from 'react';
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
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import { colors, spacing, typography } from '../theme';
import { LanguageToggle } from '../components/LanguageToggle';
import { subjects } from '../data/subjects';
import { useAirtable } from '../hooks/useAirtable';
import { PostCard } from '../components/feed/PostCard';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetwork } from '../hooks/network';

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
  const { isSchoolMode, currentSchool, joinedSchools } = useSchool();
  const { getTeachers, getPosts, loading, error } = useAirtable();
  
  const [teachers, setTeachers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const { isOffline, retryNow } = useNetwork();
  
  const popularSubjects = subjects.slice(0, 4);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch teachers
        const teachersData = await getTeachers({ maxRecords: 3 });
        setTeachers(teachersData);
        await AsyncStorage.setItem('cache_teachers_home', JSON.stringify(teachersData));
        
        // Fetch posts
        const postsData = await getPosts({ maxRecords: 3 });
        setPosts(postsData);
        await AsyncStorage.setItem('cache_posts_home', JSON.stringify(postsData));
      } catch (err) {
        console.error('Error fetching data:', err);
        // Try load from cache on failure
        const t = await AsyncStorage.getItem('cache_teachers_home');
        const p = await AsyncStorage.getItem('cache_posts_home');
        if (t) setTeachers(JSON.parse(t));
        if (p) setPosts(JSON.parse(p));
      }
    };

    fetchData();
  }, [getTeachers, getPosts]);

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
    
    // Common actions for all user types (always show these)
    actions.push(
      { key: 'dashboard', icon: 'dashboard', title: t('home.learningDashboard'), color: colors.primary },
      { key: 'feed', icon: 'forum', title: t('feed.title'), color: '#9C27B0' },
      { key: 'ask', icon: 'help', title: t('home.ask'), color: '#FF6B35' },
      { key: 'chats', icon: 'chat', title: t('home.chats'), color: '#4CAF50' }
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

    // Add School Dashboard as 7th action if user has joined schools
    if (joinedSchools.length > 0) {
      actions.push(
        { key: 'schoolDashboard', icon: 'school', title: t('school.dashboard.schoolDashboard'), color: '#673AB7' }
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

      {isOffline && (
        <View style={styles.offlineBanner}>
          <MaterialIcons name="cloud-off" size={20} color={colors.background.primary} />
          <Text style={styles.offlineText}>{t('common.offline') || 'You are offline. Showing last known data.'}</Text>
          <TouchableOpacity style={styles.offlineRetry} onPress={retryNow}>
            <Text style={styles.offlineRetryText}>{t('common.tryAgain') || 'Retry'}</Text>
          </TouchableOpacity>
        </View>
      )}
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

        {/* School Banner - Always show for all users */}
        <View style={styles.schoolBanner}>
          <View style={styles.schoolBannerContent}>
            <MaterialIcons name="school" size={24} color={colors.background.primary} />
            <Text style={styles.schoolBannerText}>
              {joinedSchools.length === 0 
                ? t('school.invitation.title')
                : `You have ${joinedSchools.length} school${joinedSchools.length > 1 ? 's' : ''} joined`
              }
            </Text>
          </View>
          <TouchableOpacity
            style={styles.schoolBannerButton}
            onPress={() => {
              if (joinedSchools.length === 0) {
                navigation.navigate('SchoolInvitation');
              } else {
                navigation.navigate('SchoolSelection');
              }
            }}
          >
            <Text style={styles.schoolBannerButtonText}>
              {joinedSchools.length === 0 
                ? t('school.invitation.joinButton')
                : 'Select School'
              }
            </Text>
          </TouchableOpacity>
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
                    case 'feed':
                      navigation.navigate('Feed');
                      break;
                    case 'ask':
                      navigation.navigate('Feed');
                      break;
                    case 'chats':
                      navigation.navigate('Notifications');
                      break;
                    case 'children':
                      navigation.navigate('UserProfile');
                      break;
                    case 'payments':
                      navigation.navigate('Payments');
                      break;
                    case 'assignments':
                      navigation.navigate('Homework');
                      break;
                    case 'progress':
                      navigation.navigate('Progress');
                      break;
                    case 'schedule':
                      navigation.navigate('Schedule');
                      break;
                    case 'earnings':
                      navigation.navigate('TutoStore');
                      break;
                    // School actions
                    case 'schoolDashboard':
                      if (joinedSchools.length > 0) {
                        // If user has joined schools, navigate to school selection
                        navigation.navigate('SchoolSelection');
                      } else {
                        // If user hasn't joined any school, show alert and navigate to invitation
                        Alert.alert(
                          t('school.dashboard.noSchoolJoined'),
                          t('school.dashboard.noSchoolJoinedMessage'),
                          [
                            { text: t('common.cancel'), style: 'cancel' },
                            { 
                              text: t('school.invitation.joinButton'), 
                              onPress: () => navigation.navigate('SchoolInvitation')
                            }
                          ]
                        );
                      }
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

        {/* Community Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('feed.title')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Feed')}>
              <Text style={styles.viewAll}>
                {t('home.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.feedRow}>
              {posts.map((post) => (
                <View key={post.id} style={styles.feedCard}>
                  <PostCard
                    post={post}
                    onLike={() => console.log('Like pressed')}
                    onComment={() => console.log('Comment pressed')}
                    onShare={() => console.log('Share pressed')}
                    onSave={() => console.log('Save pressed')}
                  />
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Recommended Teachers */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {t('home.recommendedTeachers')}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('AllSubjects')}>
              <Text style={styles.viewAll}>
                {t('home.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.teachersRow}>
              {teachers.map((teacher) => (
                <TouchableOpacity
                  key={teacher.id}
                  style={[styles.teacherCardHorizontal, shadowStyle]}
                  onPress={() => navigation.navigate('TeacherProfile', {
                    teacherId: teacher.id,
                    teacherName: teacher.name,
                    subject: teacher.subjects[0] || 'math',
                    imageUrl: teacher.avatar,
                    rating: teacher.rating,
                    reviews: teacher.reviewCount,
                    experience: teacher.experience,
                    hourlyRate: teacher.hourlyRate,
                  })}
                >
                  <Image
                    source={require('../../assets/images/default-teacher.png.png')}
                    style={styles.teacherImageHorizontal}
                  />
                  <View style={styles.teacherInfoHorizontal}>
                    <Text style={styles.teacherNameHorizontal}>{teacher.name}</Text>
                    <Text style={styles.teacherSubjectsHorizontal}>
                      {teacher.subjects.map((subject: string) => {
                        const subjectData = subjects.find(s => s.key === subject);
                        return language === 'en' ? subjectData?.nameEn : subjectData?.nameVi;
                      }).join(' • ')}
                    </Text>
                    <View style={styles.ratingContainerHorizontal}>
                      <MaterialIcons name="star" size={16} color={colors.rating.filled} />
                      <Text style={styles.ratingHorizontal}>{teacher.rating.toFixed(1)}</Text>
                      <Text style={styles.reviewsHorizontal}>
                        ({teacher.reviews} {t('common.reviews')})
                      </Text>
                    </View>
                    <Text style={styles.priceHorizontal}>
                      {formatCurrency(teacher.hourlyRate)}/{t('common.perHour')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
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
  feedRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  feedCard: {
    width: 300,
    marginRight: spacing.md,
  },
  teachersRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
  },
  teacherCardHorizontal: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: spacing.md,
    marginRight: spacing.md,
    width: 280,
    borderWidth: 1,
    borderColor: colors.border.light,
    ...shadowStyle,
  },
  teacherImageHorizontal: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: spacing.sm,
  },
  teacherInfoHorizontal: {
    flex: 1,
  },
  teacherNameHorizontal: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  teacherSubjectsHorizontal: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  ratingContainerHorizontal: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  ratingHorizontal: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  reviewsHorizontal: {
    marginLeft: spacing.xs,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  priceHorizontal: {
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
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
    fontSize: typography.fontSize.xs,
    fontFamily: typography.fontFamily.bold,
    color: colors.background.primary,
  },
  schoolBanner: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginVertical: spacing.md,
    borderRadius: 12,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...shadowStyle,
  },
  schoolBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schoolBannerText: {
    color: colors.background.primary,
    fontSize: typography.fontSize.md,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.sm,
  },
  schoolBannerButton: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  schoolBannerButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.semiBold,
  },
  offlineBanner: {
    backgroundColor: colors.disabled,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  offlineText: {
    color: colors.background.primary,
    flex: 1,
  },
  offlineRetry: {
    backgroundColor: colors.background.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 8,
  },
  offlineRetryText: {
    color: colors.primary,
    fontFamily: typography.fontFamily.medium,
  },
});