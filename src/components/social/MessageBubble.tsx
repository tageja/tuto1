import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Message } from '../../services/social/conversations.service';

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
}

interface Props {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  readAt?: string | null;
}

export default function MessageBubble({ message, isOwn, showSender, readAt }: Props) {
  if (message.isDeleted) {
    return (
      <View style={[styles.wrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
        <Text style={styles.deleted}>Tin nhắn đã bị xóa</Text>
      </View>
    );
  }

  return (
    <View style={[styles.wrapper, isOwn ? styles.ownWrapper : styles.otherWrapper]}>
      {showSender && !isOwn ? (
        <View style={styles.senderRow}>
          <Image
            source={{ uri: message.sender.avatarUrl ?? 'https://picsum.photos/32' }}
            style={styles.senderAvatar}
          />
          <Text style={styles.senderName}>{message.sender.displayName}</Text>
        </View>
      ) : null}
      <View style={[styles.bubble, isOwn ? styles.ownBubble : styles.otherBubble]}>
        <Text style={[styles.content, isOwn ? styles.ownContent : styles.otherContent]}>
          {message.content ?? ''}
        </Text>
      </View>
      <View style={styles.timeRow}>
        <Text style={styles.time}>{formatTimestamp(message.createdAt)}</Text>
        {isOwn && (
          <View style={styles.tickRow}>
            <MaterialIcons
              name={readAt ? 'done-all' : 'done'}
              size={14}
              color={readAt ? '#0B5FFF' : '#9CA3AF'}
            />
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 4,
    maxWidth: '80%',
  },
  ownWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 6,
  },
  senderName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  ownBubble: {
    backgroundColor: '#0B5FFF',
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F0F0F0',
    borderBottomLeftRadius: 4,
  },
  content: {
    fontSize: 15,
  },
  ownContent: {
    color: '#fff',
  },
  otherContent: {
    color: '#333',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  time: {
    fontSize: 11,
    color: '#888',
  },
  tickRow: {
    marginLeft: 2,
  },
  deleted: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
});
