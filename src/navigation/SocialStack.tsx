import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import PostDetailScreen    from '../screens/social/PostDetailScreen';
import CreatePostScreen    from '../screens/social/CreatePostScreen';
import SocialProfileScreen from '../screens/social/SocialProfileScreen';
import EditProfileScreen   from '../screens/social/EditProfileScreen';
import FollowersScreen     from '../screens/social/FollowersScreen';
import FollowingScreen    from '../screens/social/FollowingScreen';
import SocialSearchScreen    from '../screens/social/SocialSearchScreen';
import StoryViewerScreen     from '../screens/social/StoryViewerScreen';
import CreateStoryScreen     from '../screens/social/CreateStoryScreen';
import StoryViewersScreen    from '../screens/social/StoryViewersScreen';
import ReelDetailScreen      from '../screens/social/ReelDetailScreen';
import CreateReelScreen      from '../screens/social/CreateReelScreen';
import ChatScreen            from '../screens/social/ChatScreen';
import NewMessageScreen     from '../screens/social/NewMessageScreen';
import NewGroupScreen        from '../screens/social/NewGroupScreen';
import GroupChatInfoScreen       from '../screens/social/GroupChatInfoScreen';
import SocialNotificationsScreen from '../screens/social/SocialNotificationsScreen';
import BlockedUsersScreen     from '../screens/social/BlockedUsersScreen';
import MutedUsersScreen      from '../screens/social/MutedUsersScreen';
import ParentalControlsScreen from '../screens/social/ParentalControlsScreen';
import CreatorDashboardScreen from '../screens/social/CreatorDashboardScreen';
import LeaderboardScreen from '../screens/social/LeaderboardScreen';
import SchoolProfileScreen from '../screens/social/SchoolProfileScreen';
import { SocialTabNavigator } from './SocialTabs';
import type { StoryGroup }   from '../services/social/stories.service';

export type SocialStackParamList = {
  SocialTabs:  undefined;
  PostDetail:  { postId: string };
  CreatePost:  undefined;
  SocialProfile:  { userId?: string };
  EditProfile:  undefined;
  Followers:  { userId: string; displayName: string };
  Following:  { userId: string; displayName: string };
  SocialSearch:  undefined;
  StoryViewer:  { groups: StoryGroup[]; initialGroupIndex: number };
  CreateStory:  undefined;
  StoryViewers:  { storyId: string };
  ReelDetail:  { reelId: string; authorId?: string; initialIndex?: number };
  CreateReel:  undefined;
  Chat:  { conversationId: string };
  NewMessage:  undefined;
  NewGroup:  undefined;
  GroupChatInfo:  { conversationId: string };
  SocialNotifications: undefined;
  BlockedUsers: undefined;
  MutedUsers: undefined;
  ParentalControls: undefined;
  CreatorDashboard: undefined;
  Leaderboard: undefined;
  SchoolProfile: { schoolId: string };
};

const Stack = createStackNavigator<SocialStackParamList>();

function SocialStackWithHiddenTabBar() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen
      name="SocialTabs"
      component={SocialTabNavigator}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="PostDetail"
      component={PostDetailScreen}
      options={{
        headerShown:       true,
        title:             'Bài viết',
        headerBackTitle:   '',
        headerTintColor:   '#0B5FFF',
        headerStyle:       { backgroundColor: '#fff' },
        headerShadowVisible: false,
      }}
    />
    <Stack.Screen
      name="CreatePost"
      component={CreatePostScreen}
      options={{
        headerShown:  false,
        presentation: 'modal',
      }}
    />
    <Stack.Screen
      name="SocialProfile"
      component={SocialProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="Followers"
      component={FollowersScreen}
      options={({ route }) => ({
        headerShown: true,
        title: `${(route.params as { displayName: string }).displayName} — Người theo dõi`,
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      })}
    />
    <Stack.Screen
      name="Following"
      component={FollowingScreen}
      options={({ route }) => ({
        headerShown: true,
        title: `${(route.params as { displayName: string }).displayName} — Đang theo dõi`,
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      })}
    />
    <Stack.Screen
      name="SocialSearch"
      component={SocialSearchScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="StoryViewer"
      component={StoryViewerScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateStory"
      component={CreateStoryScreen}
      options={{
        headerShown: false,
        presentation: 'modal',
      }}
    />
    <Stack.Screen
      name="StoryViewers"
      component={StoryViewersScreen}
      options={{
        headerShown: true,
        title: 'Người đã xem',
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      }}
    />
    <Stack.Screen
      name="ReelDetail"
      component={ReelDetailScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="CreateReel"
      component={CreateReelScreen}
      options={{ headerShown: false, presentation: 'modal' }}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="NewMessage"
      component={NewMessageScreen}
      options={{
        headerShown: true,
        title: 'Tin nhắn mới',
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      }}
    />
    <Stack.Screen
      name="NewGroup"
      component={NewGroupScreen}
      options={{
        headerShown: true,
        title: 'Tạo nhóm',
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      }}
    />
    <Stack.Screen
      name="GroupChatInfo"
      component={GroupChatInfoScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="SocialNotifications"
      component={SocialNotificationsScreen}
      options={{ headerShown: false }}
    />
    <Stack.Screen
      name="BlockedUsers"
      component={BlockedUsersScreen}
      options={{
        headerShown: true,
        title: 'Blocked Users',
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      }}
    />
    <Stack.Screen
      name="MutedUsers"
      component={MutedUsersScreen}
      options={{
        headerShown: true,
        title: 'Muted Users',
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      }}
    />
    <Stack.Screen
      name="ParentalControls"
      component={ParentalControlsScreen}
      options={{
        headerShown: true,
        title: 'Parental Controls',
        headerBackTitle: '',
        headerTintColor: '#0B5FFF',
      }}
    />
    <Stack.Screen
      name="CreatorDashboard"
      component={CreatorDashboardScreen}
      options={{
        headerShown: true,
        title: 'Creator Dashboard',
        headerBackTitle: '',
        headerTintColor: '#F59E0B',
        headerStyle: { backgroundColor: '#fff' },
      }}
    />
    <Stack.Screen
      name="Leaderboard"
      component={LeaderboardScreen}
      options={{
        headerShown: true,
        title: 'Leaderboard',
        headerBackTitle: '',
        headerTintColor: '#F59E0B',
        headerStyle: { backgroundColor: '#fff' },
      }}
    />
    <Stack.Screen
      name="SchoolProfile"
      component={SchoolProfileScreen}
      options={{ headerShown: false }}
    />
  </Stack.Navigator>
  );
}

export const SocialStackNavigator = () => <SocialStackWithHiddenTabBar />;
