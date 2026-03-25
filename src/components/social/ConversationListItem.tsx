import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { ConversationPreview } from '../../services/social/conversations.service';

function formatTime(iso: string | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return 'Vừa xong';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}p`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[d.getDay()];
}

interface Props {
  conversation: ConversationPreview;
  onPress: () => void;
}

export default function ConversationListItem({ conversation, onPress }: Props) {
  const isGroup = conversation.type === 'group';
  const avatar = isGroup
    ? undefined
    : conversation.otherParticipant?.avatarUrl ??
      conversation.avatarUrl ??
      'https://picsum.photos/64';
  const name =
    conversation.type === 'group'
      ? (conversation.title ?? 'Nhóm')
      : conversation.otherParticipant?.displayName ??
        conversation.title ??
        'Unknown';
  const preview = (conversation.lastMessagePreview ?? '').slice(0, 40);
  const time = formatTime(conversation.lastMessageAt);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      {isGroup ? (
        <View style={[styles.avatar, styles.avatarGroup]}>
          <MaterialIcons name="group" size={24} color="#6B7280" />
        </View>
      ) : (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      )}
      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          {time ? <Text style={styles.time}>{time}</Text> : null}
        </View>
        {preview ? (
          <Text style={styles.preview} numberOfLines={1}>
            {preview}
          </Text>
        ) : null}
      </View>
      {conversation.unreadCount > 0 ? (
        <View style={styles.unreadDot} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  avatarGroup: {
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  time: {
    fontSize: 12,
    color: '#888',
    marginLeft: 8,
  },
  preview: {
    fontSize: 14,
    color: '#888',
  },
  unreadDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0B5FFF',
    marginLeft: 8,
  },
});
