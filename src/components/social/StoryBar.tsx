import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../../contexts/LanguageContext';
import StoryRing from './StoryRing';
import { getFeedStories } from '../../services/social/stories.service';
import type { StoryGroup } from '../../services/social/stories.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';
import type { SocialProfile } from '../../types/social';

type NavProp = StackNavigationProp<SocialStackParamList>;

interface Props {
  currentProfile: SocialProfile | null;
}

type Item =
  | { type: 'own'; profile: SocialProfile }
  | { type: 'group'; group: StoryGroup };

export default function StoryBar({ currentProfile }: Props) {
  const navigation = useNavigation<NavProp>();
  const { t } = useLanguage();
  const [groups, setGroups] = useState<StoryGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const loadStories = useCallback(async () => {
    try {
      const data = await getFeedStories();
      setGroups(data);
    } catch (err) {
      console.warn('Stories load error', err);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  const handleOwnPress = useCallback(() => {
    navigation.navigate('CreateStory');
  }, [navigation]);

  const handleGroupPress = useCallback(
    (group: StoryGroup) => {
      navigation.navigate('StoryViewer', {
        groups,
        initialGroupIndex: groups.findIndex((g) => g.authorId === group.authorId),
      });
    },
    [navigation, groups],
  );

  const items: Item[] = [];
  if (currentProfile) {
    items.push({ type: 'own', profile: currentProfile });
  }
  groups.forEach((g) => items.push({ type: 'group', group: g }));

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loading}>
          <ActivityIndicator size="small" color="#0B5FFF" />
        </View>
      </View>
    );
  }

  if (items.length === 0) return null;

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) =>
          item.type === 'own' ? 'own' : (item as { group: StoryGroup }).group.authorId
        }
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => {
          if (item.type === 'own') {
            return (
              <StoryRing
                avatarUrl={item.profile.avatarUrl}
                displayName={item.profile.displayName}
                isOwn
                hasUnviewed
                label={t('community.stories.yourStory') as string}
                onPress={handleOwnPress}
              />
            );
          }
          const g = item.group;
          const author = g.author as { display_name?: string; avatar_url?: string } | undefined;
          const hasUnviewed = (g.stories?.length ?? 0) > 0;
          return (
            <StoryRing
              avatarUrl={author?.avatar_url}
              displayName={author?.display_name}
              hasUnviewed={hasUnviewed}
              onPress={() => handleGroupPress(g)}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#fff',
  },
  list: {
    paddingHorizontal: 12,
    gap: 8,
  },
  loading: {
    paddingVertical: 24,
    alignItems: 'center',
  },
});
