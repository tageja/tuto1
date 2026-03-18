import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { SocialStackNavigator } from './SocialStack';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import AdminPhotoAlbumsScreen from '../screens/school/AdminPhotoAlbumsScreen';
import AdminCreateAlbumScreen from '../screens/school/AdminCreateAlbumScreen';
import AlbumDetailScreen from '../screens/school/AlbumDetailScreen';
import TeacherDashboardScreen from '../screens/school/teacher/TeacherDashboardScreen';
import TeacherClassesScreen from '../screens/school/teacher/TeacherClassesScreen';
import TeacherClassDetailScreen from '../screens/school/teacher/TeacherClassDetailScreen';
import TeacherAttendanceScreen from '../screens/school/teacher/TeacherAttendanceScreen';
import TeacherStudentsScreen from '../screens/school/teacher/TeacherStudentsScreen';
import TeacherStudentDetailScreen from '../screens/school/teacher/TeacherStudentDetailScreen';

const Tab = createBottomTabNavigator();
const PhotosStack = createStackNavigator();
const ClassesStack = createStackNavigator();
const StudentsStack = createStackNavigator();

const PhotosStackNavigator = () => (
  <PhotosStack.Navigator screenOptions={{ headerShown: false }}>
    <PhotosStack.Screen name="PhotosMain" component={AdminPhotoAlbumsScreen} />
    <PhotosStack.Screen name="AdminCreateAlbum" component={AdminCreateAlbumScreen} />
    <PhotosStack.Screen name="SchoolAlbumDetail" component={AlbumDetailScreen} />
  </PhotosStack.Navigator>
);

const TeacherClassesStackNavigator = () => (
  <ClassesStack.Navigator screenOptions={{ headerShown: false }}>
    <ClassesStack.Screen name="TeacherClassesList" component={TeacherClassesScreen} />
    <ClassesStack.Screen name="TeacherClassDetail" component={TeacherClassDetailScreen} />
  </ClassesStack.Navigator>
);

const TeacherStudentsStackNavigator = () => (
  <StudentsStack.Navigator screenOptions={{ headerShown: false }}>
    <StudentsStack.Screen name="TeacherStudentsList" component={TeacherStudentsScreen} />
    <StudentsStack.Screen name="TeacherStudentDetail" component={TeacherStudentDetailScreen} />
  </StudentsStack.Navigator>
);

export const TeacherTabs = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="DashboardTab"
        component={TeacherDashboardScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="dashboard" color={color} size={size} />,
          title: t('school.teacher.dashboard'),
        }}
      />
      <Tab.Screen
        name="ClassesTab"
        component={TeacherClassesStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="class" color={color} size={size} />,
          title: t('school.teacher.classes'),
        }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={TeacherAttendanceScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="event-available" color={color} size={size} />,
          title: t('school.teacher.attendance'),
        }}
      />
      <Tab.Screen
        name="StudentsTab"
        component={TeacherStudentsStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="people" color={color} size={size} />,
          title: t('school.teacher.students'),
        }}
      />
      <Tab.Screen
        name="PhotosTab"
        component={PhotosStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="photo-album" color={color} size={size} />,
          title: 'Photos',
        }}
      />
      <Tab.Screen
        name="CommunityTab"
        component={SocialStackNavigator}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="people" color={color} size={size} />,
          title: t('community.tab'),
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={UserProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />,
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
