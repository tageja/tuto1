import React, { useState } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';
import { followUser, unfollowUser } from '../../services/social/follows.service';
import * as Haptics from 'expo-haptics';

type FollowStatus = 'following' | 'not_following' | 'loading';

interface Props {
  targetProfileId: string;
  initialStatus?: 'following' | 'not_following';
  onStatusChange?: (status: 'following' | 'not_following') => void;
  size?: 'default' | 'small';
}

export default function FollowButton({
  targetProfileId,
  initialStatus = 'not_following',
  onStatusChange,
  size = 'default',
}: Props) {
  const { t } = useLanguage();
  const [status, setStatus] = useState<FollowStatus>(initialStatus);

  const handlePress = async () => {
    if (status === 'loading') return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const wasFollowing = status === 'following';
    setStatus('loading');

    try {
      if (wasFollowing) {
        await unfollowUser(targetProfileId);
        setStatus('not_following');
        onStatusChange?.('not_following');
      } else {
        await followUser(targetProfileId);
        setStatus('following');
        onStatusChange?.('following');
      }
    } catch (err) {
      setStatus(wasFollowing ? 'following' : 'not_following');
    }
  };

  if (status === 'loading') {
    return (
      <Pressable style={[styles.btn, styles.primary, size === 'small' && styles.small]} disabled>
        <ActivityIndicator size="small" color="#fff" />
      </Pressable>
    );
  }

  const isFollowing = status === 'following';

  return (
    <Pressable
      style={[
        styles.btn,
        isFollowing ? styles.outline : styles.primary,
        size === 'small' && styles.small,
      ]}
      onPress={handlePress}
    >
      <Text
        style={[
          styles.text,
          isFollowing ? styles.outlineText : styles.primaryText,
          size === 'small' && styles.smallText,
        ]}
      >
        {isFollowing
          ? (t('community.profile.following_button') as string)
          : (t('community.profile.follow_button') as string)}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  small: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 80,
  },
  primary: {
    backgroundColor: '#0B5FFF',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#6B7280',
  },
  smallText: {
    fontSize: 12,
  },
});
