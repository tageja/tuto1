import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const Stub = ({ title }: { title: string }) => (
  <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
    <Text>{title}</Text>
  </View>
);

export const TeacherTabs = () => {
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
        name="InboxTab"
        children={() => <Stub title="Inbox" />}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="inbox" color={color} size={size} />, title: 'Inbox' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={UserProfileScreen}
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />, title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};
