/**
 * MainTabs — role-adaptive 4-tab bottom navigator.
 *
 * Role → tabs:
 *   parent  : Home | Attendance | Photos     | Find Tutor
 *   teacher : Home | Attendance | Classes    | Students
 *   admin   : Home | School     | Students   | Announcements
 */

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useUser } from '../contexts/UserContext';
import { useTheme } from '../contexts/ThemeContext';

// Shared screens
import { HomeScreen } from '../screens/HomeScreen';

// Parent screens
import ParentAttendanceScreen from '../screens/school/ParentAttendanceScreen';
import ParentPhotoAlbumsScreen from '../screens/school/ParentPhotoAlbumsScreen';
import AlbumDetailScreen from '../screens/school/AlbumDetailScreen';
import { AllSubjectsScreen } from '../screens/AllSubjectsScreen';

// Teacher screens
import TeacherAttendanceScreen from '../screens/school/teacher/TeacherAttendanceScreen';
import TeacherClassesScreen from '../screens/school/teacher/TeacherClassesScreen';
import TeacherClassDetailScreen from '../screens/school/teacher/TeacherClassDetailScreen';
import TeacherStudentsScreen from '../screens/school/teacher/TeacherStudentsScreen';
import TeacherStudentDetailScreen from '../screens/school/teacher/TeacherStudentDetailScreen';

// Admin screens
import SchoolDashboardScreen from '../screens/SchoolDashboardScreen';
import StudentsScreen from '../screens/school/StudentsScreen';
import AdminAnnouncementsScreen from '../screens/school/AdminAnnouncementsScreen';

const Tab = createBottomTabNavigator();

// ----- Stack wrappers -----

const PhotosStack = createStackNavigator();
const PhotosStackNavigator = () => (
  <PhotosStack.Navigator screenOptions={{ headerShown: false }}>
    <PhotosStack.Screen name="PhotosMain" component={ParentPhotoAlbumsScreen} />
    <PhotosStack.Screen name="SchoolAlbumDetail" component={AlbumDetailScreen} />
  </PhotosStack.Navigator>
);

const TeacherClassesStack = createStackNavigator();
const TeacherClassesStackNavigator = () => (
  <TeacherClassesStack.Navigator screenOptions={{ headerShown: false }}>
    <TeacherClassesStack.Screen name="TeacherClassesList" component={TeacherClassesScreen} />
    <TeacherClassesStack.Screen name="TeacherClassDetail" component={TeacherClassDetailScreen} />
  </TeacherClassesStack.Navigator>
);

const TeacherStudentsStack = createStackNavigator();
const TeacherStudentsStackNavigator = () => (
  <TeacherStudentsStack.Navigator screenOptions={{ headerShown: false }}>
    <TeacherStudentsStack.Screen name="TeacherStudentsList" component={TeacherStudentsScreen} />
    <TeacherStudentsStack.Screen name="TeacherStudentDetail" component={TeacherStudentDetailScreen} />
  </TeacherStudentsStack.Navigator>
);

// ----- Icon helper -----
const Icon = (name: keyof typeof MaterialIcons.glyphMap) =>
  ({ color, size }: { color: string; size: number }) =>
    <MaterialIcons name={name} color={color} size={size} />;

// ----- Main navigator -----
export const MainTabs: React.FC = () => {
  const { userType } = useUser();
  const { colors, typography } = useTheme();

  const tabBarOptions = {
    headerShown: false,
    tabBarStyle: {
      borderTopWidth: 1,
      borderTopColor: colors.border?.light ?? '#E5E7EB',
      backgroundColor: colors.background?.primary ?? '#FFFFFF',
      height: 60,
      paddingBottom: 8,
      paddingTop: 6,
    },
    tabBarLabelStyle: {
      fontSize: 10,
      fontFamily: typography.fontFamily.medium,
    },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: '#93B4FF',
  };

  // ---- TEACHER tabs ----
  if (userType === 'teacher') {
    return (
      <Tab.Navigator screenOptions={tabBarOptions}>
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ title: 'Home', tabBarIcon: Icon('home') }}
        />
        <Tab.Screen
          name="AttendanceTab"
          component={TeacherAttendanceScreen}
          options={{ title: 'Attendance', tabBarIcon: Icon('fact-check') }}
        />
        <Tab.Screen
          name="ClassesTab"
          component={TeacherClassesStackNavigator}
          options={{ title: 'Classes', tabBarIcon: Icon('auto-stories') }}
        />
        <Tab.Screen
          name="StudentsTab"
          component={TeacherStudentsStackNavigator}
          options={{ title: 'Students', tabBarIcon: Icon('people') }}
        />
      </Tab.Navigator>
    );
  }

  // ---- ADMIN tabs ----
  if (userType === 'admin') {
    return (
      <Tab.Navigator screenOptions={tabBarOptions}>
        <Tab.Screen
          name="HomeTab"
          component={HomeScreen}
          options={{ title: 'Home', tabBarIcon: Icon('home') }}
        />
        <Tab.Screen
          name="SchoolTab"
          component={SchoolDashboardScreen}
          options={{ title: 'School', tabBarIcon: Icon('corporate-fare') }}
        />
        <Tab.Screen
          name="StudentsTab"
          component={StudentsScreen}
          options={{ title: 'Students', tabBarIcon: Icon('people') }}
        />
        <Tab.Screen
          name="AnnouncementsTab"
          component={AdminAnnouncementsScreen}
          options={{ title: 'Announce', tabBarIcon: Icon('campaign') }}
        />
      </Tab.Navigator>
    );
  }

  // ---- PARENT tabs (default) ----
  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ title: 'Home', tabBarIcon: Icon('home') }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={ParentAttendanceScreen}
        options={{ title: 'Attendance', tabBarIcon: Icon('fact-check') }}
      />
      <Tab.Screen
        name="PhotosTab"
        component={PhotosStackNavigator}
        options={{ title: 'Photos', tabBarIcon: Icon('collections') }}
      />
      <Tab.Screen
        name="FindTutorTab"
        component={AllSubjectsScreen}
        options={{ title: 'Find Tutor', tabBarIcon: Icon('person-search') }}
      />
    </Tab.Navigator>
  );
};
