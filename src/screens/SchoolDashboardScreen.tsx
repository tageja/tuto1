import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSchool } from '../contexts/SchoolContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAirtable } from '../hooks/useAirtable';
import { colors } from '../theme';
import { DailyActivity, SchoolAnnouncement, SchoolMessage } from '../types/school';
import SchoolHeader from '../components/common/SchoolHeader';

const SchoolDashboardScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [recentActivities, setRecentActivities] = useState<DailyActivity[]>([]);
  const [announcements, setAnnouncements] = useState<SchoolAnnouncement[]>([]);
  const [unreadMessages, setUnreadMessages] = useState<number>(0);
  
  const navigation = useNavigation();
  const { currentSchool, schoolUser, leaveSchool, refreshSchoolData } = useSchool();
  const { language, t } = useLanguage();
  const { fetchRecords } = useAirtable();

  useEffect(() => {
    loadDashboardData();
  }, [currentSchool]);

  const loadDashboardData = async () => {
    if (!currentSchool) return;

    try {
      // Load recent activities
      const activities = await fetchRecords('TutoDailyActivities', {
        filterByFormula: `{School Name} = '${currentSchool.name}'`,
        sort: [{ field: 'Date', direction: 'desc' }],
        maxRecords: 5,
      });
      setRecentActivities((activities || []).map((r: any) => ({
        id: r.id,
        title: r.fields['Activity Title'] || r.fields['Title'] || '—',
        schoolId: r.fields['School ID'] || '',
        schoolName: r.fields['School Name'] || currentSchool.name,
        classId: r.fields['Class ID'] || '',
        className: r.fields['Class Name'] || '',
        date: r.fields['Date'] || new Date().toISOString(),
        activityType: r.fields['Activity Type'] || 'Other',
        description: r.fields['Description'] || '',
        location: r.fields['Location'] || '',
        startTime: r.fields['Start Time'] || '',
        endTime: r.fields['End Time'] || '',
        teacherId: r.fields['Teacher ID'] || '',
        studentsPresent: r.fields['Students Present'] || 0,
        status: r.fields['Status'] || 'Planned',
        createdDate: r.fields['Created Date'] || new Date().toISOString(),
      })));

      // Load announcements
      const schoolAnnouncements = await fetchRecords('TutoAnnouncements', {
        filterByFormula: `AND({School Name} = '${currentSchool.name}', {Status} = 'Published')`,
        sort: [{ field: 'Publish Date', direction: 'desc' }],
        maxRecords: 3,
      });
      setAnnouncements((schoolAnnouncements || []).map((r: any) => ({
        id: r.id,
        title: r.fields['Announcement Title'] || r.fields['Title'] || '—',
        schoolId: r.fields['School ID'] || '',
        schoolName: r.fields['School Name'] || currentSchool.name,
        content: r.fields['Content'] || '',
        category: r.fields['Category'] || 'General',
        targetAudience: r.fields['Target Audience'] || [],
        priority: r.fields['Priority'] || 'Low',
        publishDate: r.fields['Publish Date'] || new Date().toISOString(),
        expiryDate: r.fields['Expiry Date'] || undefined,
        author: r.fields['Author'] || '',
        attachments: r.fields['Attachments'] || [],
        status: r.fields['Status'] || 'Published',
        createdDate: r.fields['Created Date'] || new Date().toISOString(),
      })));

      // Load unread messages count
      const messages = await fetchRecords('TutoMessages', {
        filterByFormula: `AND({School Name} = '${currentSchool.name}', {Status} = 'Sent')`,
      });
      setUnreadMessages(messages?.length || 0);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      loadDashboardData(),
      refreshSchoolData(),
    ]);
    setRefreshing(false);
  };

  const handleLeaveSchool = () => {
    Alert.alert(
      t('school.dashboard.leaveSchool.title'),
      t('school.dashboard.leaveSchool.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('school.dashboard.leaveSchool.confirm'),
          style: 'destructive',
          onPress: () => {
            leaveSchool();
            navigation.navigate('Home' as never);
          },
        },
      ]
    );
  };

  const navigateToFeature = (feature: string) => {
    const screenMap: { [key: string]: string } = {
      'DailyActivities': 'SchoolDailyActivities',
      'Messages': 'SchoolMessages',
      'Announcements': 'SchoolAnnouncements',
      'PhotoAlbums': 'SchoolPhotoAlbums',
      'Teachers': 'SchoolTeachers',
      'Classes': 'SchoolClasses',
      'Attendance': 'SchoolAttendance',
    };
    
    const screenName = screenMap[feature];
    if (screenName) {
      navigation.navigate(screenName as never);
    } else {
      console.warn(`Screen not found for feature: ${feature}`);
    }
  };

  if (!currentSchool) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{t('school.dashboard.noSchool')}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <SchoolHeader />
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.branding} />
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.navigate('Home' as never)}
          >
            <MaterialIcons name="home" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveSchool}>
            <MaterialIcons name="exit-to-app" size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* School Info */}
      <View style={styles.schoolInfo}>
        <MaterialIcons name="school" size={32} color={colors.primary} />
        <View style={styles.schoolDetails}>
          <Text style={styles.schoolName}>{currentSchool.name}</Text>
          <Text style={styles.schoolType}>{currentSchool.schoolType}</Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('school.dashboard.quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('DailyActivities')}
          >
            <MaterialIcons name="today" size={32} color={colors.primary} />
                         <Text style={styles.actionTitle}>{t('school.dashboard.dailyActivities')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('Messages')}
          >
            <MaterialIcons name="message" size={32} color={colors.primary} />
                         <Text style={styles.actionTitle}>{t('school.dashboard.messages')}</Text>
            {unreadMessages > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadMessages}</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('Announcements')}
          >
            <MaterialIcons name="announcement" size={32} color={colors.primary} />
                         <Text style={styles.actionTitle}>{t('school.dashboard.announcements')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('PhotoAlbums')}
          >
            <MaterialIcons name="photo-library" size={32} color={colors.primary} />
                         <Text style={styles.actionTitle}>{t('school.dashboard.photoAlbums')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('Teachers')}
          >
            <MaterialIcons name="group" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.teachers')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('Classes')}
          >
            <MaterialIcons name="class" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.classes')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigateToFeature('Attendance')}
          >
            <MaterialIcons name="event-available" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.attendance')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolHomework' as never)}
          >
            <MaterialIcons name="assignment" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('homework.title')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolProgress' as never)}
          >
            <MaterialIcons name="trending-up" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('progress.title')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolEvents' as never)}
          >
            <MaterialIcons name="event" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.events.title')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolPayments' as never)}
          >
            <MaterialIcons name="payments" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.payments')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolHealth' as never)}
          >
            <MaterialIcons name="medical-services" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.health')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolMedicine' as never)}
          >
            <MaterialIcons name="medication" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.medicine')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('SchoolActivities' as never)}
          >
            <MaterialIcons name="emoji-events" size={32} color={colors.primary} />
            <Text style={styles.actionTitle}>{t('school.dashboard.activities')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Activities */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
                     <Text style={styles.sectionTitle}>{t('school.dashboard.recentActivities')}</Text>
           <TouchableOpacity onPress={() => navigateToFeature('DailyActivities')}>
             <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {recentActivities.length > 0 ? (
          recentActivities.map((activity) => (
            <View key={activity.id} style={styles.activityCard}>
              <View style={styles.activityHeader}>
                <Text style={styles.activityTitle}>{activity.title}</Text>
                <Text style={styles.activityDate}>
                  {new Date(activity.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.activityDescription} numberOfLines={2}>
                {activity.description}
              </Text>
              <View style={styles.activityMeta}>
                <Text style={styles.activityType}>{activity.activityType}</Text>
                <Text style={styles.activityLocation}>{activity.location}</Text>
              </View>
            </View>
          ))
        ) : (
                     <Text style={styles.emptyText}>{t('school.dashboard.noActivities')}</Text>
        )}
      </View>

      {/* Announcements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
                     <Text style={styles.sectionTitle}>{t('school.dashboard.announcements')}</Text>
           <TouchableOpacity onPress={() => navigateToFeature('Announcements')}>
             <Text style={styles.seeAllText}>{t('common.seeAll')}</Text>
          </TouchableOpacity>
        </View>
        {announcements.length > 0 ? (
          announcements.map((announcement) => (
            <View key={announcement.id} style={styles.announcementCard}>
              <View style={styles.announcementHeader}>
                <Text style={styles.announcementTitle}>{announcement.title}</Text>
                <View style={[styles.priorityBadge, 
                  announcement.priority === 'Urgent' && styles.urgentBadge]}>
                  <Text style={styles.priorityText}>{announcement.priority}</Text>
                </View>
              </View>
              <Text style={styles.announcementContent} numberOfLines={3}>
                {announcement.content}
              </Text>
              <Text style={styles.announcementDate}>
                {new Date(announcement.publishDate).toLocaleDateString()}
              </Text>
            </View>
          ))
        ) : (
                     <Text style={styles.emptyText}>{t('school.dashboard.noAnnouncements')}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  branding: {
    flex: 1,
  },
  brandText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  brandSubtext: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },
  schoolInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schoolDetails: {
    marginLeft: 12,
    flex: 1,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  schoolType: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  leaveButton: {
    padding: 8,
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border.light,
    position: 'relative',
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginTop: 8,
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  activityDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  activityDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  activityMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  activityType: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  activityLocation: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  announcementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border.light,
  },
  announcementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
  },
  priorityBadge: {
    backgroundColor: colors.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  urgentBadge: {
    backgroundColor: colors.error,
  },
  priorityText: {
    fontSize: 10,
    color: colors.white,
    fontWeight: 'bold',
  },
  announcementContent: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: 8,
  },
  announcementDate: {
    fontSize: 12,
    color: colors.text.secondary,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 100,
  },
});

export default SchoolDashboardScreen;
