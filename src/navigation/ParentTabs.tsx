import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

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
        name="ProfileTab"
        component={UserProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />, title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
