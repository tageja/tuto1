import React, { useCallback } from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Share } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Reel } from '../../services/social/reels.service';

const SOCIAL_BASE_URL = process.env.EXPO_PUBLIC_SOCIAL_URL ?? 'http://localhost:3001';

interface Props {
  reel: Reel;
  onLike: () => void;
  onComment: () => void;
  onAuthorPress: () => void;
  isMuted: boolean;
  onMuteToggle: () => void;
}

export default function ReelActions({
  reel,
  onLike,
  onComment,
  onAuthorPress,
  isMuted,
  onMuteToggle,
}: Props) {
  const handleShare = useCallback(async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const url = `${SOCIAL_BASE_URL}/reel/${reel.id}`;
    const message = `${reel.description ?? 'Reel'}\n\nĐược chia sẻ từ Tuto Community\n${url}`;
    await Share.share({ message, url });
  }, [reel.id, reel.description]);

  return (
    <View style={styles.container}>
      <Pressable
        style={styles.action}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onAuthorPress();
        }}
      >
        <Image
          source={{ uri: reel.author.avatarUrl ?? `https://picsum.photos/seed/${reel.author.id}/64` }}
          style={styles.avatar}
        />
      </Pressable>
      <Pressable style={styles.action} onPress={onLike}>
        <MaterialIcons
          name={reel.isLiked ? 'favorite' : 'favorite-border'}
          size={28}
          color={reel.isLiked ? '#FF3B5C' : '#fff'}
        />
        <Text style={styles.count}>{reel.likeCount}</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={onComment}>
        <MaterialIcons name="chat-bubble-outline" size={28} color="#fff" />
        <Text style={styles.count}>{reel.commentCount}</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={handleShare}>
        <MaterialIcons name="share" size={28} color="#fff" />
        <Text style={styles.count}>{reel.shareCount}</Text>
      </Pressable>
      <Pressable style={styles.action} onPress={onMuteToggle}>
        <MaterialIcons
          name={isMuted ? 'volume-off' : 'volume-up'}
          size={28}
          color="#fff"
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: 16,
    bottom: 160,
    alignItems: 'center',
    gap: 20,
  },
  action: {
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: '#fff',
  },
  count: {
    fontSize: 12,
    color: '#fff',
    marginTop: 2,
  },
});
