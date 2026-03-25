import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from '../../contexts/LanguageContext';
import UserListItem from '../../components/social/UserListItem';
import { getStoryViewers, type StoryViewer } from '../../services/social/stories.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';
import type { SocialProfile } from '../../types/social';

type StoryViewersRouteProp = RouteProp<SocialStackParamList, 'StoryViewers'>;

function viewerToProfile(v: StoryViewer): SocialProfile {
  const w = v.viewer;
  return {
    id: v.viewer_id,
    displayName: w?.display_name ?? 'Unknown',
    username: w?.username,
    avatarUrl: w?.avatar_url,
    role: 'guest',
    isVerified: false,
  };
}

export default function StoryViewersScreen() {
  const route = useRoute<StoryViewersRouteProp>();
  const { t } = useLanguage();
  const { storyId } = route.params ?? {};

  const [viewers, setViewers] = useState<StoryViewer[]>([]);
  const [loading, setLoading] = useState(true);

  const loadViewers = useCallback(async () => {
    if (!storyId) return;
    try {
      const data = await getStoryViewers(storyId);
      setViewers(data);
    } catch (err) {
      console.warn('Viewers load error', err);
      setViewers([]);
    } finally {
      setLoading(false);
    }
  }, [storyId]);

  useEffect(() => {
    loadViewers();
  }, [loadViewers]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0B5FFF" />
      </View>
    );
  }

  const count = viewers.length;
  const viewersLabel = (t('community.stories.viewers') as string).replace('{n}', String(count));
  const header = (
    <View style={styles.header}>
      <Text style={styles.headerText}>{viewersLabel}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={viewers}
        keyExtractor={(item) => item.viewer_id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <UserListItem profile={viewerToProfile(item)} />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
});
