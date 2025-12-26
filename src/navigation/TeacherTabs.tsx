import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text } from 'react-native';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import AdminPhotoAlbumsScreen from '../screens/school/AdminPhotoAlbumsScreen';
import AdminCreateAlbumScreen from '../screens/school/AdminCreateAlbumScreen';
import AlbumDetailScreen from '../screens/school/AlbumDetailScreen';
import AdminAttendanceScreen from '../screens/school/AdminAttendanceScreen';
import StudentAttendanceDetailScreen from '../screens/school/StudentAttendanceDetailScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';

const Tab = createBottomTabNavigator();
const PhotosStack = createStackNavigator();
const AttendanceStack = createStackNavigator();

const Stub = ({ title }: { title: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{title}</Text>
  </View>
);

const PhotosStackNavigator = () => {
  return (
    <PhotosStack.Navigator screenOptions={{ headerShown: false }}>
      <PhotosStack.Screen name="PhotosMain" component={AdminPhotoAlbumsScreen} />
      <PhotosStack.Screen name="AdminCreateAlbum" component={AdminCreateAlbumScreen} />
      <PhotosStack.Screen name="SchoolAlbumDetail" component={AlbumDetailScreen} />
    </PhotosStack.Navigator>
  );
};

const AttendanceStackNavigator = () => {
  return (
    <AttendanceStack.Navigator screenOptions={{ headerShown: false }}>
      <AttendanceStack.Screen name="AttendanceMain" component={AdminAttendanceScreen} />
      <AttendanceStack.Screen name="StudentAttendanceDetail" component={StudentAttendanceDetailScreen} />
    </AttendanceStack.Navigator>
  );
};

export const TeacherTabs = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="ClassesTab"
        children={() => <Stub title="Classes" />}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="class" color={color} size={size} />, title: 'Classes' }}
      />
      <Tab.Screen
        name="StudentsTab"
        children={() => <Stub title="Students" />}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="people" color={color} size={size} />, title: 'Students' }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceStackNavigator}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="event-available" color={color} size={size} />, title: t('school.attendance.title') }}
      />
      <Tab.Screen
        name="InboxTab"
        children={() => <Stub title="Inbox" />}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="inbox" color={color} size={size} />, title: 'Inbox' }}
      />
      <Tab.Screen
        name="PhotosTab"
        component={PhotosStackNavigator}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="photo-album" color={color} size={size} />, title: 'Photos' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={UserProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />, title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
