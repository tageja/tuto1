import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { HomeScreen } from '../screens/HomeScreen';
import { NotificationsScreen } from '../screens/NotificationsScreen';
import { UserProfileScreen } from '../screens/UserProfileScreen';
import ParentAttendanceScreen from '../screens/school/ParentAttendanceScreen';
import ParentEventsScreen from '../screens/school/ParentEventsScreen';
import ParentPhotoAlbumsScreen from '../screens/school/ParentPhotoAlbumsScreen';
import AlbumDetailScreen from '../screens/school/AlbumDetailScreen';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotifications } from '../hooks/useNotifications';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { SocialStackNavigator } from './SocialStack';

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
      <PhotosStack.Screen name="SchoolAlbumDetail" component={AlbumDetailScreen} />
    </PhotosStack.Navigator>
  );
};

export const ParentTabs = () => {
  const { colors, spacing, typography } = useTheme();
  const { unreadCount, urgentUnreadCount, hasUrgentUnread } = useNotifications();
  const { t } = useLanguage();

  // Notification bell component with badge
  const NotificationBell = ({ color, size }: { color: string; size: number }) => {
    // Determine icon color: red for urgent, blue for normal, default otherwise
    const iconColor = hasUrgentUnread
      ? colors.status.error
      : unreadCount > 0
      ? colors.primary
      : color;

    return (
      <View style={styles.iconContainer}>
        <MaterialIcons name="notifications" color={iconColor} size={size} />
        {unreadCount > 0 && (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: hasUrgentUnread ? colors.status.error : colors.primary,
              },
            ]}
          >
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </Text>
          </View>
        )}
      </View>
    );
  };

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
        options={{
          tabBarIcon: ({ color, size }) => <NotificationBell color={color} size={size} />,
          title: 'Notifications',
        }}
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
        options={{ tabBarIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} />, title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
