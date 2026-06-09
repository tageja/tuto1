import React, { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { useLanguage } from '../../contexts/LanguageContext';
import AchievementBadge from './AchievementBadge';

interface Props {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
  xp?: number;
  level?: number;
  streakCount?: number;
}

export default function ProfileStats({
  postsCount,
  followersCount,
  followingCount,
  onFollowersPress,
  onFollowingPress,
  xp = 0,
  level = 1,
  streakCount = 0,
}: Props) {
  const { t } = useLanguage();

  const postsScale = useSharedValue(0.8);
  const followersScale = useSharedValue(0.8);
  const followingScale = useSharedValue(0.8);

  useEffect(() => {
    postsScale.value = withSpring(1, { damping: 12 });
    followersScale.value = withSpring(1, { damping: 12 });
    followingScale.value = withSpring(1, { damping: 12 });
  }, [postsCount, followersCount, followingCount]);

  const postsStyle = useAnimatedStyle(() => ({
    transform: [{ scale: postsScale.value }],
  }));
  const followersStyle = useAnimatedStyle(() => ({
    transform: [{ scale: followersScale.value }],
  }));
  const followingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: followingScale.value }],
  }));

  const postsLabel = (t('community.profile.posts_count') as string).replace('{count}', String(postsCount));
  const followersLabel = (t('community.profile.followers_count') as string).replace('{count}', String(followersCount));
  const followingLabel = (t('community.profile.following_count') as string).replace('{count}', String(followingCount));

  return (
    <View style={styles.container}>
      {(xp > 0 || streakCount >= 3) && (
        <View style={styles.achievementRow}>
          <AchievementBadge
            xp={xp}
            level={level}
            streakCount={streakCount}
            size="compact"
          />
        </View>
      )}
      <View style={styles.statsRow}>
        <Pressable style={styles.stat} onPress={onFollowersPress}>
          <Animated.Text style={[styles.number, postsStyle]}>{postsCount}</Animated.Text>
          <Text style={styles.label}>{postsLabel}</Text>
        </Pressable>
        <Pressable style={styles.stat} onPress={onFollowersPress}>
          <Animated.Text style={[styles.number, followersStyle]}>{followersCount}</Animated.Text>
          <Text style={styles.label}>{followersLabel}</Text>
        </Pressable>
        <Pressable style={styles.stat} onPress={onFollowingPress}>
          <Animated.Text style={[styles.number, followingStyle]}>{followingCount}</Animated.Text>
          <Text style={styles.label}>{followingLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F3F4F6',
  },
  achievementRow: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
  },
  number: {
    fontSize:   20,
    fontWeight:  '700',
    color:       '#111827',
  },
  label: {
    fontSize:   12,
    color:       '#6B7280',
    marginTop:   2,
  },
});
