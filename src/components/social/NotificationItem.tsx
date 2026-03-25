import React from 'react';
import { View, Text, Pressable, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import type { SocialNotification } from '../../types/social';

interface Props {
  notification: SocialNotification;
  onPress: () => void;
  onMarkRead?: () => void;
}

const ICON_MAP: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  like: 'favorite',
  applaud: 'celebration',
  curious: 'psychology',
  reel_like: 'favorite',
  comment: 'chat-bubble-outline',
  follow: 'person-add',
  achievement: 'emoji-events',
  level_up: 'star',
};

function getIconName(type: string): keyof typeof MaterialIcons.glyphMap {
  return ICON_MAP[type] ?? 'notifications';
}

function formatTimeAgo(createdAt: string): string {
  const d = new Date(createdAt);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return d.toLocaleDateString();
}

export default function NotificationItem({ notification, onPress, onMarkRead }: Props) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!notification.read && onMarkRead) {
      onMarkRead();
    }
    onPress();
  };

  const actorName = notification.actor?.displayName || notification.actor?.username || 'Someone';
  const iconName = getIconName(notification.type);

  let message = '';
  switch (notification.type) {
    case 'like':
    case 'applaud':
    case 'curious':
      message = `${actorName} liked your post`;
      break;
    case 'reel_like':
      message = `${actorName} liked your reel`;
      break;
    case 'comment':
      message = `${actorName} commented on your post`;
      break;
    case 'follow':
      message = `${actorName} started following you`;
      break;
    case 'achievement':
      message = 'You earned an achievement';
      break;
    case 'level_up':
      message = 'You reached a new level!';
      break;
    default:
      message = 'You have a new notification';
  }

  return (
    <Pressable
      style={[styles.container, !notification.read && styles.unread]}
      onPress={handlePress}
    >
      <View style={styles.left}>
        {notification.actor?.avatarUrl ? (
          <Image source={{ uri: notification.actor.avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <MaterialIcons name={iconName} size={20} color="#6B7280" />
          </View>
        )}
        <View style={styles.content}>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
          <Text style={styles.time}>{formatTimeAgo(notification.createdAt)}</Text>
        </View>
      </View>
      <MaterialIcons
        name={iconName}
        size={24}
        color={notification.type === 'like' || notification.type === 'reel_like' ? '#FF3B5C' : '#6B7280'}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  unread: {
    backgroundColor: '#F9FAFB',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
  },
  avatarFallback: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
  },
  message: {
    fontSize: 15,
    color: '#111827',
    fontWeight: '500',
  },
  time: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
});
