import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLanguage } from '../../contexts/LanguageContext';
import type { SocialPost } from '../../types/social';

const { width } = Dimensions.get('window');
const GAP = 2;
const COLS = 3;
const CELL_SIZE = (width - GAP * (COLS - 1)) / COLS;

const ACHIEVEMENT_GRADIENTS: Record<string, [string, string]> = {
  academic:    ['#F59E0B', '#F97316'],
  streak:      ['#3B82F6', '#14B8A6'],
  score:       ['#8B5CF6', '#6366F1'],
  first:       ['#10B981', '#059669'],
  certificate: ['#F59E0B', '#EAB308'],
};

const ACHIEVEMENT_EMOJI: Record<string, string> = {
  academic:    '🏆',
  streak:      '🔥',
  score:       '⭐',
  first:       '🎀',
  certificate: '📜',
};

interface Props {
  posts: SocialPost[];
  loading?: boolean;
  onPostPress: (postId: string) => void;
}

function GridItem({
  post,
  onPress,
}: {
  post: SocialPost;
  onPress: () => void;
}) {
  if (post.postType === 'achievement') {
    const type = post.achievement?.type ?? 'academic';
    const gradient = ACHIEVEMENT_GRADIENTS[type] ?? ACHIEVEMENT_GRADIENTS.academic;
    const emoji = ACHIEVEMENT_EMOJI[type] ?? '🏆';
    return (
      <Pressable style={styles.cell} onPress={onPress}>
        <LinearGradient
          colors={gradient}
          style={styles.achievementCell}
        >
          <Text style={styles.achievementEmoji}>{emoji}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  if (post.postType === 'photo' && post.mediaUrls?.length > 0) {
    return (
      <Pressable style={styles.cell} onPress={onPress}>
        <Image
          source={{ uri: post.mediaUrls[0] }}
          style={styles.image}
          resizeMode="cover"
        />
      </Pressable>
    );
  }

  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <View style={styles.textCell}>
        <Text style={styles.textPreview} numberOfLines={3}>
          {post.content?.slice(0, 30) ?? ''}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ProfilePostGrid({
  posts,
  loading,
  onPostPress,
}: Props) {
  const { t } = useLanguage();
  if (loading) {
    return (
      <View style={styles.grid}>
        {Array.from({ length: 9 }).map((_, i) => (
          <View key={i} style={[styles.cell, styles.skeleton]} />
        ))}
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          {t('community.feed.emptyTitle') as string}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.grid}>
      {posts.map((post) => (
        <GridItem
          key={post.id}
          post={post}
          onPress={() => onPostPress(post.id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GAP,
  },
  cell: {
    width:  CELL_SIZE,
    height: CELL_SIZE,
  },
  image: {
    width:  '100%',
    height: '100%',
  },
  textCell: {
    width:  '100%',
    height: '100%',
    backgroundColor: '#F3F4F6',
    padding: 8,
    justifyContent: 'center',
  },
  textPreview: {
    fontSize:   12,
    color:       '#6B7280',
    lineHeight:  16,
  },
  achievementCell: {
    width:  '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementEmoji: {
    fontSize: 32,
  },
  skeleton: {
    backgroundColor: '#E5E7EB',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    fontSize:   14,
    color:       '#6B7280',
  },
});
