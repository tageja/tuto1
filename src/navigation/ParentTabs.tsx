import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import ParentAttendanceScreen from '../screens/school/ParentAttendanceScreen';
import ParentEventsScreen from '../screens/school/ParentEventsScreen';
import ParentPhotoAlbumsScreen from '../screens/school/ParentPhotoAlbumsScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const AttendanceStack = createStackNavigator();
const EventsStack = createStackNavigator();
const PhotosStack = createStackNavigator();

const AttendanceStackNavigator = () => {
  return (
    <AttendanceStack.Navigator screenOptions={{ headerShown: false }}>
      <AttendanceStack.Screen name="AttendanceMain" component={ParentAttendanceScreen} />
    </AttendanceStack.Navigator>
  );
};

const EventsStackNavigator = () => {
  return (
    <EventsStack.Navigator screenOptions={{ headerShown: false }}>
      <EventsStack.Screen name="EventsMain" component={ParentEventsScreen} />
    </EventsStack.Navigator>
  );
};

const PhotosStackNavigator = () => {
  return (
    <PhotosStack.Navigator screenOptions={{ headerShown: false }}>
      <PhotosStack.Screen name="PhotosMain" component={ParentPhotoAlbumsScreen} />
    </PhotosStack.Navigator>
  );
};

export const ParentTabs = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="home" color={color} size={size} />, title: 'Home' }}
      />
      <Tab.Screen
        name="MessagesTab"
        component={NotificationsScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="chat" color={color} size={size} />, title: 'Messages' }}
      />
      <Tab.Screen
        name="AttendanceTab"
        component={AttendanceStackNavigator}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="event" color={color} size={size} />, title: 'Attendance' }}
      />
      <Tab.Screen
        name="EventsTab"
        component={EventsStackNavigator}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="event-note" color={color} size={size} />, title: 'Events' }}
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
