import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  BackHandler,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../contexts/SchoolContext';
import { useUser } from '../contexts/UserContext';
import { useLanguage } from '../contexts/LanguageContext';
import { checkParentSchoolAccess } from '../services/school/parentPin';
import { getUserSchoolAssociations } from '../services/school.service';
import { DashboardHeader } from '../components/school/DashboardHeader';
import { DashboardMenu } from '../components/school/DashboardMenu';
import { WeeklyAttendanceChart } from '../components/school/WeeklyAttendanceChart';
import {
  fetchDashboardKPIs,
  fetchWeeklyAttendance,
  fetchAnnouncements,
  fetchUpcomingHomework,
  fetchSchoolDetails,
  type DashboardKPIs,
  type WeeklyAttendanceData,
  type Announcement,
  type Homework,
} from '../services/school-dashboard';
import { useTheme } from '../contexts/ThemeContext';

const SchoolDashboardScreen: React.FC = () => {
  const { colors, spacing, typography, borderRadius, shadows } = useTheme();

  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [menuVisible, setMenuVisible] = useState(false);
  const [kpiData, setKpiData] = useState<DashboardKPIs>({
    totalStudents: 0,
    activeTeachers: 0,
    attendanceRate: 0,
    upcomingEvents: 0,
    feeCollection: 0,
    averageRating: 'N/A',
  });
  const [weeklyAttendance, setWeeklyAttendance] = useState<WeeklyAttendanceData[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [schoolDetails, setSchoolDetails] = useState<any>(null);
  
  const navigation = useNavigation<any>();
  const { currentSchool, refreshSchoolData, leaveSchool } = useSchool();
  const { userData } = useUser();
  const { language, t } = useLanguage();
  const [copiedPin, setCopiedPin] = useState(false);
  const [isAdminForSchool, setIsAdminForSchool] = useState<boolean | null>(null);

  // Resolve admin status for current school (in case userData.type is not set)
  useEffect(() => {
    if (!currentSchool?.id || !userData?.email) {
      setIsAdminForSchool(null);
      return;
    }
    let cancelled = false;
    getUserSchoolAssociations(userData.email).then((associations) => {
      if (cancelled) return;
      const forThisSchool = associations.find(
        (a) => a.school_id === currentSchool.id
      );
      setIsAdminForSchool(forThisSchool?.role === 'admin');
    });
    return () => { cancelled = true; };
  }, [currentSchool?.id, userData?.email]);

  // Validate parent access on mount (cache or RPC)
  useEffect(() => {
    if (!currentSchool) {
      navigation.replace('Welcome');
      return;
    }
    const userEmail = userData?.email;
    const isParent = userData?.type === 'parent';
    if (!isParent || !userEmail) return;

    let cancelled = false;
    checkParentSchoolAccess(userEmail, currentSchool.id).then((hasAccess) => {
      if (cancelled) return;
      if (!hasAccess) {
        leaveSchool();
        navigation.replace('Welcome');
      }
    });
    return () => { cancelled = true; };
  }, [currentSchool?.id, userData?.email, userData?.type]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.secondary,
    },
    scrollContent: {
      flex: 1,
    },
    pageHeader: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.sm,
      paddingBottom: spacing.md,
    },
    schoolInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    schoolLogo: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.lg,
      marginRight: spacing.md,
    },
    schoolLogoPlaceholder: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.lg,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing.md,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    schoolTextInfo: {
      flex: 1,
    },
    schoolName: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 2,
    },
    currentDate: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
    kpiSection: {
      paddingHorizontal: spacing.md,
      marginBottom: spacing.lg,
    },
    kpiRow: {
      flexDirection: 'row',
      marginBottom: spacing.sm,
    },
    kpiCard: {
      flex: 1,
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.xs,
      ...shadows.md,
      alignItems: 'center',
    },
    kpiIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    kpiValue: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    kpiLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    card: {
      backgroundColor: colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing.md,
      marginHorizontal: spacing.md,
      marginBottom: spacing.md,
      ...shadows.sm,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    cardTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: '600',
      color: colors.text.primary,
    },
    viewAllLink: {
      fontSize: typography.fontSize.sm,
      color: colors.primary,
      fontWeight: '500',
    },
    announcementItem: {
      paddingVertical: spacing.md,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    announcementBorder: {
      borderBottomWidth: 1,
      borderBottomColor: colors.background.tertiary,
    },
    announcementContent: {
      flex: 1,
      marginRight: spacing.sm,
    },
    announcementTitle: {
      fontSize: typography.fontSize.md,
      fontWeight: '500',
      color: colors.text.primary,
      marginBottom: 4,
    },
    announcementBody: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    announcementPriority: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: 12,
      backgroundColor: '#E3F2FF',
    },
    priorityHigh: {
      backgroundColor: '#FFE5E5',
    },
    priorityUrgent: {
      backgroundColor: '#FFE5E5',
    },
    priorityText: {
      fontSize: typography.fontSize.xs,
      color: '#2563EB',
      fontWeight: '600',
    },
    homeworkItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      backgroundColor: '#F9FAFB',
      borderRadius: borderRadius.md,
      marginBottom: spacing.sm,
    },
    homeworkDetails: {
      flex: 1,
    },
    homeworkTitle: {
      fontSize: typography.fontSize.sm,
      fontWeight: '500',
      color: colors.text.primary,
    },
    homeworkSubject: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
      marginTop: 2,
    },
    homeworkDueDate: {
      fontSize: typography.fontSize.xs,
      color: colors.text.light,
    },
    emptyText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.light,
      textAlign: 'center',
      paddingVertical: spacing.xl,
    },
    errorText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      textAlign: 'center',
      marginTop: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    loadingText: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
    },
    pinCode: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
      letterSpacing: 4,
    },
    pinHint: {
      fontSize: typography.fontSize.xs,
      color: colors.text.secondary,
    },
    copyButton: {
      padding: spacing.sm,
      borderRadius: borderRadius.md,
      backgroundColor: colors.surface,
    },
  });


  useEffect(() => {
    loadDashboardData();
  }, [currentSchool]);

  // Handle hardware back button - go to Home instead of Login
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' as never }],
      });
      return true; // Prevent default back behavior
    });

    return () => backHandler.remove();
  }, [navigation]);

  const loadDashboardData = async () => {
    if (!currentSchool) {
      console.log('❌ No currentSchool found');
      return;
    }

    console.log('📊 Loading dashboard data for school:', {
      id: currentSchool.id,
      name: currentSchool.name,
      code: currentSchool.code,
      fullSchool: currentSchool,
    });

    try {
      setLoading(true);

      // Fetch all data in parallel
      const [kpis, weeklyData, announcementsData, homeworkData, details] = await Promise.all([
        fetchDashboardKPIs(currentSchool.id),
        fetchWeeklyAttendance(currentSchool.id, language),
        fetchAnnouncements(currentSchool.id, 3),
        fetchUpcomingHomework(currentSchool.id, 3),
        fetchSchoolDetails(currentSchool.id),
      ]);

      console.log('✅ Dashboard data loaded:', {
        kpis,
        announcements: announcementsData.length,
        homework: homeworkData.length,
        schoolDetails: details?.name,
      });

      setKpiData(kpis);
      setWeeklyAttendance(weeklyData);
      setAnnouncements(announcementsData);
      setHomework(homeworkData);
      setSchoolDetails(details);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadDashboardData(),
        refreshSchoolData(),
      ]);
    } catch (error) {
      console.error('Error refreshing:', error);
    }
    setRefreshing(false);
  };

  const handleNotificationPress = () => {
    navigation.navigate('Notifications' as never);
  };

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleLeaveSchool = () => {
    Alert.alert(
      t('school.dashboard.leaveSchool.title') || 'Leave School',
      t('school.dashboard.leaveSchool.message') || 'Are you sure you want to leave this school?',
      [
        { text: t('common.cancel') || 'Cancel', style: 'cancel' },
        {
          text: t('school.dashboard.leaveSchool.confirm') || 'Leave',
          style: 'destructive',
          onPress: () => {
            leaveSchool();
            navigation.navigate('Home' as never);
          },
        },
      ]
    );
  };

  const handleCopyPin = async () => {
    if (schoolDetails?.parent_pin) {
      try {
        await Clipboard.setStringAsync(schoolDetails.parent_pin);
        setCopiedPin(true);
        setTimeout(() => setCopiedPin(false), 2000);
        Alert.alert(
          language === 'vi' ? 'Đã sao chép' : 'Copied',
          language === 'vi'
            ? `Mã PIN ${schoolDetails.parent_pin} đã được sao chép`
            : `PIN code ${schoolDetails.parent_pin} copied to clipboard`
        );
      } catch (error) {
        Alert.alert(
          language === 'vi' ? 'Lỗi' : 'Error',
          language === 'vi'
            ? 'Không thể sao chép mã PIN'
            : 'Could not copy PIN code'
        );
      }
    }
  };

  // Show admin PIN card only when user is explicitly admin/teacher; never for parent or when role unknown
  const isAdmin =
    (userData?.type === 'admin' ||
      userData?.type === 'teacher' ||
      (userData as any)?.type === 'school_admin') ||
    (userData?.type != null && userData?.type !== 'parent' && isAdminForSchool === true);

  if (!currentSchool) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('school.dashboard.noSchool')}</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <DashboardHeader
          schoolName={currentSchool.name || 'School'}
          onNotificationPress={handleNotificationPress}
        />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <DashboardHeader
        schoolName={currentSchool.name || schoolDetails?.name || 'School'}
        onMenuPress={handleMenuPress}
        onNotificationPress={handleNotificationPress}
      />

      {/* Menu Modal */}
      <DashboardMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onLeaveSchool={handleLeaveSchool}
      />

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header - School Logo, Name and Date */}
        <View style={styles.pageHeader}>
          <View style={styles.schoolInfo}>
            {schoolDetails?.logo_url ? (
              <Image 
                source={{ uri: schoolDetails.logo_url }} 
                style={styles.schoolLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={styles.schoolLogoPlaceholder}>
                <MaterialIcons name="school" size={28} color={colors.primary} />
              </View>
            )}
            <View style={styles.schoolTextInfo}>
              <Text style={styles.schoolName}>
                {schoolDetails?.name || currentSchool.name || 'School'}
              </Text>
              <Text style={styles.currentDate}>
                {new Date().toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Parent PIN Card - admin/teacher only, at top for visibility */}
        {isAdmin && (
        <View style={[styles.card, { marginHorizontal: spacing.md, marginBottom: spacing.md, backgroundColor: '#E3F2FF', borderLeftWidth: 4, borderLeftColor: colors.primary }]}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <MaterialIcons name="vpn-key" size={24} color={colors.primary} style={{ marginRight: spacing.sm }} />
              <Text style={[styles.cardTitle, { fontSize: typography.fontSize.lg }]}>
                {language === 'vi' ? 'Mã PIN Phụ huynh' : 'Parent PIN Code'}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md }}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.pinCode, { fontFamily: 'monospace', letterSpacing: 6, fontSize: 28 }]}>
                {schoolDetails?.parent_pin ?? (language === 'vi' ? 'Chưa có mã' : 'Not set')}
              </Text>
              <Text style={[styles.pinHint, { fontSize: typography.fontSize.sm, color: colors.text.secondary, marginTop: spacing.sm }]}>
                {language === 'vi'
                  ? 'Mã này cho phép phụ huynh tham gia trường học'
                  : 'Share this code with parents to join the school'}
              </Text>
            </View>
            {schoolDetails?.parent_pin ? (
              <TouchableOpacity
                onPress={handleCopyPin}
                style={[styles.copyButton, { padding: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.surface }]}
              >
                <MaterialIcons
                  name={copiedPin ? 'check' : 'content-copy'}
                  size={24}
                  color={copiedPin ? colors.status.success : colors.primary}
                />
              </TouchableOpacity>
            ) : null}
          </View>
        </View>
        )}

        {/* KPI Cards - Admin/teacher only; parents should not see school-wide metrics */}
        {isAdmin && (
        <View style={styles.kpiSection}>
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#E3F2FF' }]}>
                <MaterialIcons name="people" size={24} color="#0B5FFF" />
              </View>
              <Text style={styles.kpiValue}>{kpiData.totalStudents.toLocaleString()}</Text>
              <Text style={styles.kpiLabel}>{language === 'vi' ? 'Tổng số học sinh' : 'Total Students'}</Text>
            </View>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialIcons name="school" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.kpiValue}>{kpiData.activeTeachers}</Text>
              <Text style={styles.kpiLabel}>{language === 'vi' ? 'Giáo viên hoạt động' : 'Active Teachers'}</Text>
            </View>
          </View>
          
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#F3E5F5' }]}>
                <MaterialIcons name="check-circle" size={24} color="#9C27B0" />
              </View>
              <Text style={styles.kpiValue}>{kpiData.attendanceRate}%</Text>
              <Text style={styles.kpiLabel}>{language === 'vi' ? 'Tỷ lệ điểm danh' : 'Attendance Rate'}</Text>
            </View>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#FFF3E0' }]}>
                <MaterialIcons name="event" size={24} color="#FF9800" />
              </View>
              <Text style={styles.kpiValue}>{kpiData.upcomingEvents}</Text>
              <Text style={styles.kpiLabel}>{language === 'vi' ? 'Sự kiện sắp tới' : 'Upcoming Events'}</Text>
            </View>
          </View>
          
          <View style={styles.kpiRow}>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#FFFBEA' }]}>
                <MaterialIcons name="attach-money" size={24} color="#FFD700" />
              </View>
              <Text style={styles.kpiValue}>${(kpiData.feeCollection / 1000).toFixed(0)}K</Text>
              <Text style={styles.kpiLabel}>{language === 'vi' ? 'Thu học phí' : 'Fee Collection'}</Text>
            </View>
            <View style={styles.kpiCard}>
              <View style={[styles.kpiIconContainer, { backgroundColor: '#E8F5E9' }]}>
                <MaterialIcons name="star" size={24} color="#4CAF50" />
              </View>
              <Text style={styles.kpiValue}>{kpiData.averageRating}</Text>
              <Text style={styles.kpiLabel}>{language === 'vi' ? 'Đánh giá TB' : 'Avg Rating'}</Text>
            </View>
          </View>
        </View>
        )}

        {/* Recent Announcements */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {language === 'vi' ? 'Thông báo gần đây' : 'Recent Announcements'}
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SchoolAnnouncements' as never)}>
              <Text style={styles.viewAllLink}>
                {language === 'vi' ? 'Xem tất cả' : 'View All'}
              </Text>
            </TouchableOpacity>
          </View>
          {announcements.map((announcement, index) => (
            <View 
              key={announcement.id} 
              style={[
                styles.announcementItem,
                index < announcements.length - 1 && styles.announcementBorder
              ]}
            >
              <View style={styles.announcementContent}>
                <Text style={styles.announcementTitle} numberOfLines={1}>
                  {announcement.title}
                </Text>
                <Text style={styles.announcementBody} numberOfLines={2}>
                  {announcement.body || announcement.content}
                </Text>
              </View>
              <View style={[
                styles.announcementPriority,
                announcement.priority?.toLowerCase() === 'high' && styles.priorityHigh,
                announcement.priority?.toLowerCase() === 'urgent' && styles.priorityUrgent,
              ]}>
                <Text style={styles.priorityText}>{announcement.priority || 'Normal'}</Text>
              </View>
            </View>
          ))}
          {announcements.length === 0 && (
            <Text style={styles.emptyText}>
              {language === 'vi' ? 'Chưa có thông báo' : 'No announcements yet'}
            </Text>
          )}
        </View>

        {/* Attendance Trend - Admin/teacher only; shows school-wide attendance */}
        {isAdmin && <WeeklyAttendanceChart data={weeklyAttendance} />}

        {/* Secondary Grid: Upcoming Homework */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>
              {language === 'vi' ? 'Bài tập sắp tới' : 'Upcoming Homework'}
            </Text>
          </View>
          {homework.map((hw) => (
            <View key={hw.id} style={styles.homeworkItem}>
              <View style={styles.homeworkDetails}>
                <Text style={styles.homeworkTitle}>{hw.title}</Text>
                <Text style={styles.homeworkSubject}>{hw.subject}</Text>
              </View>
              <Text style={styles.homeworkDueDate}>
                {new Date(hw.due_date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          ))}
          {homework.length === 0 && (
            <Text style={styles.emptyText}>
              {language === 'vi' ? 'Không có bài tập sắp tới' : 'No upcoming homework'}
            </Text>
          )}
        </View>

        {/* Bottom spacing */}
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </View>
  );
};


export default SchoolDashboardScreen;
