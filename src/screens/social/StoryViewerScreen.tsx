import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  GestureResponderEvent,
} from 'react-native';
import { Video } from 'expo-av';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { useLanguage } from '../../contexts/LanguageContext';
import { markViewed, reactToStory } from '../../services/social/stories.service';
import type { SocialStackParamList } from '../../navigation/SocialStack';

type NavProp = StackNavigationProp<SocialStackParamList, 'StoryViewer'>;
type StoryRouteProp = RouteProp<SocialStackParamList, 'StoryViewer'>;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const PROGRESS_HEIGHT = 3;
const PROGRESS_GAP = 4;

export default function StoryViewerScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<StoryRouteProp>();
  const { t } = useLanguage();
  const { groups = [], initialGroupIndex = 0 } = route.params ?? {};

  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const group = groups[groupIndex];
  const stories = group?.stories ?? [];
  const story = stories[storyIndex];

  const advanceStory = useCallback(() => {
    if (storyIndex < stories.length - 1) {
      setStoryIndex((i) => i + 1);
      setProgress(0);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
      setProgress(0);
    } else {
      navigation.goBack();
    }
  }, [storyIndex, stories.length, groupIndex, groups.length, navigation]);

  const goBack = useCallback(() => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
      setProgress(0);
    } else if (groupIndex > 0) {
      setGroupIndex((i) => i - 1);
      const prevStories = groups[groupIndex - 1]?.stories ?? [];
      setStoryIndex(prevStories.length - 1);
      setProgress(0);
    } else {
      navigation.goBack();
    }
  }, [storyIndex, groupIndex, groups, navigation]);

  useEffect(() => {
    if (!story || paused) return;

    const duration = (story.duration_seconds ?? 5) * 1000;
    const interval = 50;
    const step = interval / duration;

    timerRef.current = setInterval(() => {
      setProgress((p) => {
        const next = p + step;
        if (next >= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          advanceStory();
          return 0;
        }
        return next;
      });
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [story?.id, paused, advanceStory]);

  useEffect(() => {
    if (story) {
      markViewed(story.id).catch(console.warn);
    }
  }, [story?.id]);

  const handleTap = useCallback(
    (ev: GestureResponderEvent) => {
      const { locationX } = ev.nativeEvent;
      if (locationX < SCREEN_WIDTH / 2) {
        goBack();
      } else {
        advanceStory();
      }
    },
    [goBack, advanceStory],
  );

  const handleLongPressIn = useCallback(() => setPaused(true), []);
  const handleLongPressOut = useCallback(() => setPaused(false), []);

  const handleReply = useCallback(() => {
    // DM stub — coming soon
    const msg = t('community.stories.dmComingSoon') as string;
    if (typeof (global as { alert?: (s: string) => void }).alert === 'function') {
      (global as { alert: (s: string) => void }).alert(msg);
    }
  }, [t]);

  const handleReact = useCallback(() => {
    if (story) reactToStory(story.id).catch(console.warn);
  }, [story?.id]);

  const handleViewersPress = useCallback(() => {
    if (story) navigation.navigate('StoryViewers', { storyId: story.id });
  }, [story?.id, navigation]);

  if (!group || stories.length === 0) {
    return (
      <View style={styles.container}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={28} color="#fff" />
        </Pressable>
        <Text style={styles.emptyText}>{t('community.feed.emptyTitle') as string}</Text>
      </View>
    );
  }

  const author = group.author as { display_name?: string; avatar_url?: string } | undefined;

  return (
    <View style={styles.container}>
      <Pressable
        style={StyleSheet.absoluteFill}
        onPress={handleTap}
        onLongPress={handleLongPressIn}
        onPressOut={handleLongPressOut}
      >
        {story.media_type === 'video' ? (
          <Video
            source={{ uri: story.media_url }}
            style={styles.media}
            resizeMode="cover"
            shouldPlay={!paused}
            isLooping={false}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded && status.didJustFinishPlayback) {
                advanceStory();
              }
            }}
          />
        ) : (
          <Image source={{ uri: story.media_url }} style={styles.media} resizeMode="cover" />
        )}
        {story.text_overlay ? (
          <Text
            style={[
              styles.textOverlay,
              { color: story.text_color || '#FFFFFF' },
            ]}
          >
            {story.text_overlay}
          </Text>
        ) : null}
      </Pressable>

      {/* Progress bars */}
      <View style={styles.progressRow}>
        {stories.map((_, i) => (
          <View key={i} style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${i < storyIndex ? 100 : i === storyIndex ? progress * 100 : 0}%`,
                },
              ]}
            />
          </View>
        ))}
      </View>

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.closeBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="close" size={28} color="#fff" />
        </Pressable>
        <View style={styles.authorRow}>
          {author?.avatar_url ? (
            <Image source={{ uri: author.avatar_url }} style={styles.authorAvatar} />
          ) : (
            <View style={[styles.authorAvatar, styles.avatarFallback]}>
              <Text style={styles.avatarText}>
                {author?.display_name?.charAt(0)?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <Text style={styles.authorName}>{author?.display_name ?? 'Unknown'}</Text>
        </View>
      </View>

      {/* Bottom actions */}
      <View style={styles.footer}>
        <Pressable style={styles.footerInput} onPress={handleReply}>
          <Text style={styles.footerPlaceholder}>{t('community.stories.reply') as string}</Text>
        </Pressable>
        <Pressable onPress={handleReact} style={styles.reactBtn}>
          <MaterialIcons name="favorite-border" size={28} color="#fff" />
        </Pressable>
        <Pressable onPress={handleViewersPress} style={styles.viewersBtn}>
          <MaterialIcons name="visibility" size={24} color="#fff" />
          <Text style={styles.viewersText}>{story.view_count}</Text>
        </Pressable>
      </View>

      {paused && (
        <View style={styles.pauseOverlay}>
          <Text style={styles.pauseText}>{t('community.stories.holdToPause') as string}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  media: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 120,
    left: 24,
    right: 24,
    fontSize: 18,
    textAlign: 'center',
  },
  progressRow: {
    position: 'absolute',
    top: 48,
    left: 8,
    right: 8,
    flexDirection: 'row',
    gap: PROGRESS_GAP,
  },
  progressTrack: {
    flex: 1,
    height: PROGRESS_HEIGHT,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  closeBtn: {
    padding: 8,
  },
  authorRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  authorAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  authorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  footer: {
    position: 'absolute',
    bottom: 48,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  footerInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  footerPlaceholder: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
  reactBtn: {
    padding: 8,
  },
  viewersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewersText: {
    color: '#fff',
    fontSize: 14,
  },
  pauseOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pauseText: {
    color: '#fff',
    fontSize: 14,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 24,
  },
});
