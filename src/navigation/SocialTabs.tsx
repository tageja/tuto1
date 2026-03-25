import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import SocialFeedScreen from '../screens/social/SocialFeedScreen';
import ReelsScreen from '../screens/social/ReelsScreen';
import SocialSearchScreen from '../screens/social/SocialSearchScreen';
import SocialProfileScreen from '../screens/social/SocialProfileScreen';
import ConversationsScreen from '../screens/social/ConversationsScreen';

const Tab = createBottomTabNavigator();

export type SocialTabParamList = {
  Feed: undefined;
  Reels: undefined;
  Search: undefined;
  Messages: undefined;
  Profile: undefined;
};

export const SocialTabNavigator = () => {
  const { t } = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#0B5FFF',
        tabBarInactiveTintColor: '#888',
      }}
    >
      <Tab.Screen
        name="Feed"
        component={SocialFeedScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" color={color} size={size} />
          ),
          title: t('community.feed.title') as string,
        }}
      />
      <Tab.Screen
        name="Reels"
        component={ReelsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="videocam" color={color} size={size} />
          ),
          title: t('community.reels.tab') as string,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SocialSearchScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="search" color={color} size={size} />
          ),
          title: t('common.search') as string,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={ConversationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="chat-bubble-outline" color={color} size={size} />
          ),
          title: t('community.messages.tab') as string,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={SocialProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" color={color} size={size} />
          ),
          title: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
};
