import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { setCurrentScreen } from '../services/analytics';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import AuthUnifiedScreen from '../screens/AuthUnifiedScreen';
import { ForgotPasswordScreen } from '../screens/ForgotPasswordScreen';
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
import { ParentTabs } from './ParentTabs';
import { TeacherTabs } from './TeacherTabs';
import { useUser } from '../contexts/UserContext';
import { useSchool } from '../contexts/SchoolContext';
import SchoolInvitationScreen from '../screens/SchoolInvitationScreen';
import SchoolDashboardScreen from '../screens/SchoolDashboardScreen';
import SchoolSelectionScreen from '../screens/SchoolSelectionScreen';
import DailyActivitiesScreen from '../screens/school/DailyActivitiesScreen';
import MessagesScreen from '../screens/school/MessagesScreen';
import AnnouncementsScreen from '../screens/school/AnnouncementsScreen';
import PhotoAlbumsScreen from '../screens/school/PhotoAlbumsScreen';
import TeachersScreen from '../screens/school/TeachersScreen';
import ClassesScreen from '../screens/school/ClassesScreen';
import AttendanceScreen from '../screens/school/AttendanceScreen';
import SchoolHomeworkScreen from '../screens/school/HomeworkScreen';
import SchoolProgressScreen from '../screens/school/ProgressScreen';
import SchoolEventsScreen from '../screens/school/EventsScreen';
import SchoolPaymentsScreen from '../screens/school/PaymentsScreen';
import SchoolHealthScreen from '../screens/school/HealthScreen';
import SchoolMedicineScreen from '../screens/school/MedicineScreen';
import SchoolActivitiesScreen from '../screens/school/ActivitiesScreen';
import SchoolActivityDetailScreen from '../screens/school/ActivityDetailScreen';
import SchoolMessageDetailScreen from '../screens/school/MessageDetailScreen';
import SchoolAnnouncementDetailScreen from '../screens/school/AnnouncementDetailScreen';
import SchoolAlbumDetailScreen from '../screens/school/AlbumDetailScreen';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
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
  SchoolHomework: undefined;
  SchoolProgress: undefined;
  SchoolEvents: undefined;
  SchoolPayments: undefined;
  SchoolHealth: undefined;
  SchoolMedicine: undefined;
  SchoolActivities: undefined;
  SchoolSurveys: undefined;
  SchoolSubscriptions: undefined;
  SchoolActivityDetail: { activity: any };
  SchoolMessageDetail: { message: any };
  SchoolAnnouncementDetail: { announcement: any };
  SchoolAlbumDetail: { album: any };
  SchoolAddActivity: undefined;
  SchoolAddMessage: undefined;
  SchoolAddAnnouncement: undefined;
  SchoolAddAlbum: undefined;
  SchoolComposeMessage: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const RoleGate: React.FC = () => {
  const { userType } = useUser();
  
  // If no userType set yet, show RoleSelection
  if (!userType) {
    return <RoleSelectionScreen navigation={undefined as any} />;
  }
  
  // Always show the appropriate tabs based on user type
  // Users will navigate to school features from within the app
  if (userType === 'teacher') return <TeacherTabs />;
  return <ParentTabs />;
};

export const AppNavigator = () => {
  console.log('🧭 AppNavigator: Setting up auth flow');
  return (
    <NavigationContainer
      onStateChange={(state) => {
        try {
          const routes = state?.routes || [];
          const last = routes[routes.length - 1];
          const name = last?.name || 'Unknown';
          setCurrentScreen(name);
        } catch {}
      }}
    >
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={AuthUnifiedScreen as any} initialParams={{ mode: 'login' }} />
        <Stack.Screen name="Register" component={AuthUnifiedScreen as any} initialParams={{ mode: 'register' }} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
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
        <Stack.Screen name="SchoolDashboard" component={SchoolDashboardScreen} />
        <Stack.Screen name="SchoolSelection" component={SchoolSelectionScreen} />
        <Stack.Screen name="SchoolDailyActivities" component={DailyActivitiesScreen} />
        <Stack.Screen name="SchoolMessages" component={MessagesScreen} />
        <Stack.Screen name="SchoolAnnouncements" component={AnnouncementsScreen} />
        <Stack.Screen name="SchoolPhotoAlbums" component={PhotoAlbumsScreen} />
        <Stack.Screen name="SchoolTeachers" component={TeachersScreen} />
        <Stack.Screen name="SchoolClasses" component={ClassesScreen} />
        <Stack.Screen name="SchoolAttendance" component={AttendanceScreen} />
        <Stack.Screen name="SchoolHomework" component={SchoolHomeworkScreen} />
        <Stack.Screen name="SchoolProgress" component={SchoolProgressScreen} />
        <Stack.Screen name="SchoolEvents" component={SchoolEventsScreen} />
        <Stack.Screen name="SchoolPayments" component={SchoolPaymentsScreen} />
        <Stack.Screen name="SchoolHealth" component={SchoolHealthScreen} />
        <Stack.Screen name="SchoolMedicine" component={SchoolMedicineScreen} />
        <Stack.Screen name="SchoolActivities" component={SchoolActivitiesScreen} />
        <Stack.Screen name="SchoolActivityDetail" component={SchoolActivityDetailScreen} />
        <Stack.Screen name="SchoolMessageDetail" component={SchoolMessageDetailScreen} />
        <Stack.Screen name="SchoolAnnouncementDetail" component={SchoolAnnouncementDetailScreen} />
        <Stack.Screen name="SchoolAlbumDetail" component={SchoolAlbumDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};