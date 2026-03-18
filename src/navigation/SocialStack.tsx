import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SocialFeedScreen    from '../screens/social/SocialFeedScreen';
import PostDetailScreen    from '../screens/social/PostDetailScreen';
import CreatePostScreen    from '../screens/social/CreatePostScreen';

export type SocialStackParamList = {
  SocialFeed:  undefined;
  PostDetail:  { postId: string };
  CreatePost:  undefined;
};

const Stack = createStackNavigator<SocialStackParamList>();

export const SocialStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="SocialFeed"
      component={SocialFeedScreen}
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
  </Stack.Navigator>
);
