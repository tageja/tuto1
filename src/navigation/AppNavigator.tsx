import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../config/supabase';
import { View, Text, ActivityIndicator } from 'react-native';
import AppLoadingScreen from '../components/common/AppLoadingScreen';
import { useNavigation } from '@react-navigation/native';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { useTheme } from '../contexts/ThemeContext';
import { StatusBar } from 'expo-status-bar';
import { setCurrentScreen } from '../services/analytics';
import { getRememberMe } from '../services/rememberMe';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import AuthUnifiedScreen from '../screens/AuthUnifiedScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
import { ResetPasswordScreen } from '../screens/ResetPasswordScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { AllSubjectsScreen } from '../screens/AllSubjectsScreen';
import { SubjectResultsScreen } from '../screens/SubjectResultsScreen';
import { TeacherProfileScreen } from '../screens/TeacherProfileScreen';
import { BookingScreen } from '../screens/BookingScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { RewardsScreen } from '../screens/RewardsScreen';
import { TutoStoreScreen } from '../screens/TutoStoreScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { HomeworkScreen } from '../screens/HomeworkScreen';
import { ProgressScreen } from '../screens/ProgressScreen';
import { PaymentsScreen } from '../screens/PaymentsScreen';
import { BookingsScreen } from '../screens/BookingsScreen';
import { FeedScreen } from '../screens/FeedScreen';
import { CommentsScreen } from '../screens/CommentsScreen';
import { MainTabs } from './MainTabs';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import SchoolInvitationScreen from '../screens/SchoolInvitationScreen';
import SchoolDashboardScreen from '../screens/SchoolDashboardScreen';
import SchoolSelectionScreen from '../screens/SchoolSelectionScreen';
import AdminDailyActivitiesScreen from '../screens/school/AdminDailyActivitiesScreen';
import ParentDailyActivitiesScreen from '../screens/school/ParentDailyActivitiesScreen';
import MessagesScreen from '../screens/school/MessagesScreen';
import AdminAnnouncementsScreen from '../screens/school/AdminAnnouncementsScreen';
import ParentAnnouncementsScreen from '../screens/school/ParentAnnouncementsScreen';
import TeachersScreen from '../screens/school/TeachersScreen';
import ClassesScreen from '../screens/school/ClassesScreen';
import StudentsScreen from '../screens/school/StudentsScreen';
import StudentDetailScreen from '../screens/school/StudentDetailScreen';
import AttendanceScreen from '../screens/school/AttendanceScreen';
import ParentAttendanceScreen from '../screens/school/ParentAttendanceScreen';
import AdminAttendanceScreen from '../screens/school/AdminAttendanceScreen';
import StudentAttendanceDetailScreen from '../screens/school/StudentAttendanceDetailScreen';
import AdminTeachersScreen from '../screens/school/AdminTeachersScreen';
import TeacherDetailScreen from '../screens/school/TeacherDetailScreen';
import ClassDetailScreen from '../screens/school/ClassDetailScreen';
import SchoolHomeworkScreen from '../screens/school/HomeworkScreen';
import ParentHomeworkScreen from '../screens/school/ParentHomeworkScreen';
import AdminHomeworkScreen from '../screens/school/AdminHomeworkScreen';
import CreateHomeworkAssignmentScreen from '../screens/school/CreateHomeworkAssignmentScreen';
import HomeworkDetailScreen from '../screens/school/HomeworkDetailScreen';
import SchoolProgressScreen from '../screens/school/ProgressScreen';
import AdminEventsScreen from '../screens/school/AdminEventsScreen';
import AdminCreateEventScreen from '../screens/school/AdminCreateEventScreen';
import AdminPhotoAlbumsScreen from '../screens/school/AdminPhotoAlbumsScreen';
import AdminCreateAlbumScreen from '../screens/school/AdminCreateAlbumScreen';
import ParentEventsScreen from '../screens/school/ParentEventsScreen';
import ParentPhotoAlbumsScreen from '../screens/school/ParentPhotoAlbumsScreen';
import SchoolPaymentsScreen from '../screens/school/PaymentsScreen';
import SchoolHealthScreen from '../screens/school/HealthScreen';
import AdminHealthRecordsScreen from '../screens/school/AdminHealthRecordsScreen';
import ParentHealthRecordsScreen from '../screens/school/ParentHealthRecordsScreen';
import AddHealthRecordScreen from '../screens/school/AddHealthRecordScreen';
import StudentHealthDetailScreen from '../screens/school/StudentHealthDetailScreen';
import SchoolMedicineScreen from '../screens/school/MedicineScreen';
import AdminMedicineScreen from '../screens/school/AdminMedicineScreen';
import ParentMedicineScreen from '../screens/school/ParentMedicineScreen';
import AddMedicineReminderScreen from '../screens/school/AddMedicineReminderScreen';
import LogMedicineScreen from '../screens/school/LogMedicineScreen';
import SchoolActivitiesScreen from '../screens/school/ActivitiesScreen';
import SchoolActivityDetailScreen from '../screens/school/ActivityDetailScreen';
import AddActivityScreen from '../screens/school/AddActivityScreen';
import AddAnnouncementScreen from '../screens/school/AddAnnouncementScreen';
import SchoolMessageDetailScreen from '../screens/school/MessageDetailScreen';
import SchoolAnnouncementDetailScreen from '../screens/school/AnnouncementDetailScreen';
import SchoolAlbumDetailScreen from '../screens/school/AlbumDetailScreen';
import MessagesListAdminScreen from '../screens/school/MessagesListAdminScreen';
import MessagesListParentScreen from '../screens/school/MessagesListParentScreen';
import MessagesConversationScreen from '../screens/school/MessagesConversationScreen';
import MessagesComposeScreen from '../screens/school/MessagesComposeScreen';
import ParentFeedbackListScreen from '../screens/school/ParentFeedbackListScreen';
import AdminFeedbackListScreen from '../screens/school/AdminFeedbackListScreen';
import AdminHelpSupportScreen from '../screens/school/AdminHelpSupportScreen';
import ParentCreateFeedbackScreen from '../screens/school/ParentCreateFeedbackScreen';
import FeedbackDetailsScreen from '../screens/school/FeedbackDetailsScreen';
import { SettingsStackNavigator } from './SettingsStack';
import WelcomeScreen from '../screens/WelcomeScreen';
import AdminOnboardingScreen from '../screens/AdminOnboardingScreen';
import SchoolSelectorScreen from '../screens/SchoolSelectorScreen';
import { checkParentSchoolAccess } from '../services/school/parentPin';

import EventDetailScreen from '../screens/school/EventDetailScreen';
import TeacherHomeworkScreen from '../screens/school/teacher/TeacherHomeworkScreen';
import TeacherProgressReportsScreen from '../screens/school/teacher/TeacherProgressReportsScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: undefined;
  Welcome: undefined;
  AdminOnboarding: undefined;
  SchoolSelector: { schools: any[] };
  RoleSelection: undefined;
  Home: undefined;
  Dashboard: undefined;
  AllSubjects: undefined;
  SubjectResults: { subjectKey: string };
  TeacherProfile: {
    teacherId: string;
    teacherName: string;
    subject: string;
    imageUrl?: string;
    rating?: number;
    reviews?: number;
    experience?: number;
    hourlyRate?: number;
  };
  Booking: {
    teacherId: string;
    teacherName: string;
    subject: string;
  };
  UserProfile: undefined;
  Notifications: undefined;
  Rewards: undefined;
  TutoStore: undefined;
  Schedule: undefined;
  Homework: undefined;
  Progress: undefined;
  Payments: undefined;
  Bookings: undefined;
  Feed: undefined;
  Comments: undefined;
  // School screens
  SchoolInvitation: undefined;
  SchoolDashboard: undefined;
  SchoolSelection: undefined;
  SchoolDailyActivities: undefined;
  SchoolMessages: undefined;
  SchoolAnnouncements: undefined;
  SchoolPhotoAlbums: undefined;
  SchoolStudents: undefined;
  SchoolTeachers: undefined;
  SchoolClasses: undefined;
  SchoolAttendance: undefined;
  StudentAttendanceDetail: { 
    studentId: string; 
    studentName: string; 
    studentAvatar?: string; 
    className?: string; 
  };
  SchoolAddActivity: { activity?: any } | undefined;
  SchoolAddAnnouncement: { announcement?: any } | undefined;
  // Teacher & Class Detail Screens
  TeacherDetail: { teacherId: string };
  AdminTeachers: undefined;
  ClassDetail: { classId: string };
  StudentsScreen: undefined;
  StudentDetail: { studentId: string };
  SchoolHomework: undefined;
  SchoolHomeworkDetail: { assignmentId: string };
  SchoolCreateHomework: undefined;
  SchoolProgress: undefined;
  SchoolEvents: undefined;
  SchoolEventDetail: { 
    event: any; 
    childId?: string; 
    childName?: string; 
    isRegistered?: boolean; 
    isParent?: boolean; 
  };
  AdminEvents: undefined;
  AdminCreateEvent: undefined;
  AdminPhotoAlbums: undefined;
  AdminCreateAlbum: undefined;
  ParentEvents: undefined;
  ParentPhotoAlbums: undefined;
  SchoolPayments: undefined;
  SchoolHealth: undefined;
  AddHealthRecord: { studentId?: string };
  StudentHealthDetail: { studentId: string };
  SchoolMedicine: undefined;
  AdminMedicine: undefined;
  ParentMedicine: undefined;
  AddMedicineReminder: { studentId?: string };
  LogMedicine: { reminderId: string };
  SchoolActivities: undefined;
  SchoolSurveys: undefined;
  SchoolSubscriptions: undefined;
  SchoolFeedback: undefined;
  AdminHelpSupport: undefined;
  SchoolSettings: undefined;
  SchoolActivityDetail: { activity: any };
  SchoolMessageDetail: { message: any };
  SchoolAnnouncementDetail: { announcement: any };
  SchoolAlbumDetail: { album: any };
  SchoolAddActivity: undefined;
  SchoolAddMessage: undefined;
  SchoolAddAnnouncement: undefined;
  SchoolAddAlbum: undefined;
  SchoolComposeMessage: undefined;
  MessagesListAdmin: undefined;
  MessagesListParent: undefined;
  MessagesConversation: { threadId: string; userRole?: 'admin' | 'parent' };
  MessagesCompose: undefined;
  SchoolFeedback: undefined;
  AdminHelpSupport: undefined;
  FeedbackCreate: undefined;
  FeedbackDetails: { feedbackId: string };
  // Teacher dashboard (root screens for quick actions)
  TeacherProgressReports: { schoolId: string };
  TeacherHomework: { schoolId: string };
  TeacherStudentDetail: { studentId: string; schoolId: string };
  TeacherClassDetail: { classId: string; schoolId: string };
  // Settings stack
  SettingsStack: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const MIN_SPLASH_MS = 1500;

/**
 * SplashRoute — the true initial route.
 *
 * Shows AppLoadingScreen for at least MIN_SPLASH_MS, then checks for an
 * active Supabase session and routes to "Home" (logged in) or "Login" (not).
 * This ensures the school-branded loading screen is ALWAYS shown on cold
 * launch, regardless of auth state.
 */
const SplashRoute: React.FC<{ navigation: any }> = ({ navigation }) => {
  const startRef = useRef(Date.now());

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      const { data } = await supabase.auth.getSession();
      let hasSession = !!data?.session;

      // Honour the "keep me signed in" preference: if the user opted out, end
      // their persisted session on cold launch so they must sign in again.
      if (hasSession && !(await getRememberMe())) {
        await supabase.auth.signOut();
        hasSession = false;
      }

      const elapsed = Date.now() - startRef.current;
      const remaining = Math.max(0, MIN_SPLASH_MS - elapsed);

      if (cancelled) return;
      setTimeout(() => {
        if (cancelled) return;
        // Route through Welcome (same as AuthUnifiedScreen does) so school
        // associations and role are resolved fresh before entering the app.
        navigation.replace(hasSession ? 'Welcome' : 'Login');
      }, remaining);
    };

    run();
    return () => { cancelled = true; };
  }, [navigation]);

  return <AppLoadingScreen />;
};

const RoleGate: React.FC = () => {
  const { userType, loading } = useUser();

  if (loading) {
    return <AppLoadingScreen />;
  }

  if (!userType) {
    return <RoleSelectionScreen navigation={undefined as any} />;
  }

  return <MainTabs />;
};

/** Access gate: redirect to Welcome if parent has no access to current school */
const SchoolDashboardAccessGate: React.FC = () => {
  const navigation = useNavigation<any>();
  const { currentSchool, leaveSchool } = useSchool();
  const { userData } = useUser();
  const [accessResolved, setAccessResolved] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (!currentSchool) {
      navigation.replace('Welcome');
      return;
    }
    const userEmail = userData?.email;
    const isParent = userData?.type === 'parent';
    if (!isParent) {
      setAccessResolved(true);
      return;
    }
    if (!userEmail) {
      navigation.replace('Welcome');
      return;
    }
    let cancelled = false;
    checkParentSchoolAccess(userEmail, currentSchool.id).then((hasAccess) => {
      if (cancelled) return;
      if (!hasAccess) {
        leaveSchool();
        navigation.replace('Welcome');
      } else {
        setAccessResolved(true);
      }
    });
    return () => { cancelled = true; };
  }, [currentSchool?.id, userData?.email, userData?.type]);

  if (!accessResolved) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background.secondary }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, fontSize: 16, color: colors.text.secondary }}>Checking access...</Text>
      </View>
    );
  }
  return <SchoolDashboardScreen />;
};

const linking = {
  prefixes: ['tuto://'],
  config: {
    screens: {
      Login: 'login',
      Register: 'register',
      ForgotPassword: 'auth/forgot-password',
      ResetPassword: 'auth/reset-password',
      Home: 'home',
    },
  },
};

export const AppNavigator = () => {
  console.log('🧭 AppNavigator: Setting up auth flow');
  const { isDark, colors } = useTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: colors.primary,
      background: colors.background.primary,
      card: colors.background.secondary,
      text: colors.text.primary,
      border: colors.border.light,
      notification: colors.status.error,
    },
  };

  return (
    <NavigationContainer
      theme={navigationTheme}
      linking={linking}
      onStateChange={(state) => {
        try {
          const routes = state?.routes || [];
          const last = routes[routes.length - 1];
          const name = last?.name || 'Unknown';
          setCurrentScreen(name);
        } catch {}
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashRoute as any} />
        <Stack.Screen name="Login" component={AuthUnifiedScreen as any} initialParams={{ mode: 'login' }} />
        <Stack.Screen name="Register" component={AuthUnifiedScreen as any} initialParams={{ mode: 'register' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        
        {/* New Welcome Flow */}
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="AdminOnboarding" component={AdminOnboardingScreen} />
        <Stack.Screen name="SchoolSelector" component={SchoolSelectorScreen} />
        
        <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />

        {/* Shell entry - RoleGate decides which tabs to mount */}
        <Stack.Screen name="Home" component={RoleGate as any} />

        {/* Keep existing screens accessible by navigate where needed */}
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="AllSubjects" component={AllSubjectsScreen} />
        <Stack.Screen name="SubjectResults" component={SubjectResultsScreen} />
        <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
        <Stack.Screen name="Booking" component={BookingScreen} />
        <Stack.Screen name="UserProfile" component={UserProfileScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Rewards" component={RewardsScreen} />
        <Stack.Screen name="TutoStore" component={TutoStoreScreen} />
        <Stack.Screen name="Schedule" component={ScheduleScreen} />
        <Stack.Screen name="Homework" component={HomeworkScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="Payments" component={PaymentsScreen} />
        <Stack.Screen name="Bookings" component={BookingsScreen} />
        <Stack.Screen name="Feed" component={FeedScreen} />
        <Stack.Screen name="Comments" component={CommentsScreen as any} options={{ presentation: 'modal' }} />
        
        {/* School screens */}
        <Stack.Screen name="SchoolInvitation" component={SchoolInvitationScreen} />
        <Stack.Screen name="SchoolDashboard" component={SchoolDashboardAccessGate} />
        <Stack.Screen name="SchoolSelection" component={SchoolSelectionScreen} />
        <Stack.Screen name="SchoolDailyActivities">
          {(props) => {
            const { userType } = useUser();
            // Treat 'teacher' as admin for school dashboard features
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <AdminDailyActivitiesScreen />
            ) : (
              <ParentDailyActivitiesScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="SchoolMessages">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <MessagesListAdminScreen />
            ) : (
              <MessagesListParentScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen 
          name="MessagesListAdmin" 
          component={MessagesListAdminScreen} 
        />
        <Stack.Screen 
          name="MessagesListParent" 
          component={MessagesListParentScreen} 
        />
        <Stack.Screen 
          name="MessagesConversation" 
          component={MessagesConversationScreen} 
        />
        <Stack.Screen 
          name="MessagesCompose" 
          component={MessagesComposeScreen} 
        />
        <Stack.Screen name="SchoolAnnouncements">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <AdminAnnouncementsScreen />
            ) : (
              <ParentAnnouncementsScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="SchoolFeedback">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <AdminFeedbackListScreen />
            ) : (
              <ParentFeedbackListScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="AdminHelpSupport" component={AdminHelpSupportScreen} />
        <Stack.Screen name="FeedbackCreate" component={ParentCreateFeedbackScreen} />
        <Stack.Screen name="FeedbackDetails" component={FeedbackDetailsScreen} />
        <Stack.Screen name="SchoolTeachers" component={TeachersScreen} />
        <Stack.Screen name="SchoolClasses" component={ClassesScreen} />
        <Stack.Screen name="SchoolStudents" component={StudentsScreen} />
        <Stack.Screen name="StudentDetail" component={StudentDetailScreen} />
        <Stack.Screen name="SchoolAttendance">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? <AdminAttendanceScreen /> : <ParentAttendanceScreen />;
          }}
        </Stack.Screen>
        <Stack.Screen name="StudentAttendanceDetail" component={StudentAttendanceDetailScreen} />
        <Stack.Screen name="SchoolHomework">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <AdminHomeworkScreen />
            ) : (
              <ParentHomeworkScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="SchoolCreateHomework" component={CreateHomeworkAssignmentScreen} />
        <Stack.Screen name="SchoolHomeworkDetail" component={HomeworkDetailScreen} />
        <Stack.Screen name="SchoolProgress" component={SchoolProgressScreen} />
        <Stack.Screen name="SchoolEvents">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? <AdminEventsScreen /> : <ParentEventsScreen />;
          }}
        </Stack.Screen>
        <Stack.Screen name="SchoolEventDetail" component={EventDetailScreen} />
        <Stack.Screen name="SchoolPhotoAlbums">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? <AdminPhotoAlbumsScreen /> : <ParentPhotoAlbumsScreen />;
          }}
        </Stack.Screen>
        <Stack.Screen name="AdminEvents" component={AdminEventsScreen} />
        <Stack.Screen name="AdminCreateEvent" component={AdminCreateEventScreen} />
        <Stack.Screen name="AdminPhotoAlbums" component={AdminPhotoAlbumsScreen} />
        <Stack.Screen name="AdminCreateAlbum" component={AdminCreateAlbumScreen} />
        <Stack.Screen name="ParentEvents" component={ParentEventsScreen} />
        <Stack.Screen name="ParentPhotoAlbums" component={ParentPhotoAlbumsScreen} />
        <Stack.Screen name="SchoolPayments" component={SchoolPaymentsScreen} />
        <Stack.Screen name="SchoolHealth">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <AdminHealthRecordsScreen />
            ) : (
              <ParentHealthRecordsScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="AddHealthRecord" component={AddHealthRecordScreen} />
        <Stack.Screen name="StudentHealthDetail" component={StudentHealthDetailScreen} />
        <Stack.Screen name="SchoolMedicine">
          {(props) => {
            const { userType } = useUser();
            const isAdmin = userType === 'teacher' || userType === 'admin';
            return isAdmin ? (
              <AdminMedicineScreen />
            ) : (
              <ParentMedicineScreen />
            );
          }}
        </Stack.Screen>
        <Stack.Screen name="AdminMedicine" component={AdminMedicineScreen} />
        <Stack.Screen name="ParentMedicine" component={ParentMedicineScreen} />
        <Stack.Screen name="AddMedicineReminder" component={AddMedicineReminderScreen} />
        <Stack.Screen name="LogMedicine" component={LogMedicineScreen} />
        <Stack.Screen name="SchoolActivities" component={SchoolActivitiesScreen} />
        <Stack.Screen name="SchoolActivityDetail" component={SchoolActivityDetailScreen} />
        <Stack.Screen name="SchoolAddActivity" component={AddActivityScreen} />
        <Stack.Screen name="SchoolAddAnnouncement" component={AddAnnouncementScreen} />
        <Stack.Screen name="SchoolMessageDetail" component={SchoolMessageDetailScreen} />
        <Stack.Screen name="SchoolAnnouncementDetail" component={SchoolAnnouncementDetailScreen} />
        <Stack.Screen name="SchoolAlbumDetail" component={SchoolAlbumDetailScreen} />
        
        {/* Teacher & Class Detail Screens */}
        <Stack.Screen 
          name="TeacherDetail" 
          component={TeacherDetailScreen} 
          options={{ title: 'Teacher Details' }}
        />
        <Stack.Screen 
          name="AdminTeachers" 
          component={AdminTeachersScreen} 
          options={{ title: 'Teachers' }}
        />
        <Stack.Screen 
          name="ClassDetail" 
          component={ClassDetailScreen} 
          options={{ title: 'Class Details' }}
        />
        <Stack.Screen name="TeacherHomework" component={TeacherHomeworkScreen} />
        <Stack.Screen name="TeacherProgressReports" component={TeacherProgressReportsScreen} />
        
        {/* Settings Stack */}
        <Stack.Screen name="SettingsStack" component={SettingsStackNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};