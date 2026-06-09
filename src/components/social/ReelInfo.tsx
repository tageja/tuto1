import React, { useState, useCallback } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Reel } from '../../services/social/reels.service';

interface Props {
  reel: Reel;
  onAuthorPress: () => void;
}

export default function ReelInfo({ reel, onAuthorPress }: Props) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = (reel.description?.length ?? 0) > 60;

  const toggleExpand = useCallback(() => {
    if (hasMore) setExpanded((e) => !e);
  }, [hasMore]);

  const desc = reel.description ?? '';
  const displayDesc = expanded || !hasMore ? desc : `${desc.slice(0, 60)}…`;

  return (
    <View style={styles.container}>
      <Pressable onPress={onAuthorPress}>
        <Text style={styles.displayName}>{reel.author.displayName}</Text>
        <Text style={styles.username}>@{reel.author.username}</Text>
      </Pressable>
      {desc ? (
        <Pressable onPress={toggleExpand}>
          <Text style={styles.description} numberOfLines={expanded ? undefined : 2}>
            {displayDesc}
          </Text>
          {hasMore && (
            <Text style={styles.more}>{expanded ? 'Thu gọn' : 'Xem thêm'}</Text>
          )}
        </Pressable>
      ) : null}
      {reel.subjects && reel.subjects.length > 0 ? (
        <View style={styles.chips}>
          {reel.subjects.slice(0, 3).map((s) => (
            <View key={s} style={styles.chip}>
              <Text style={styles.chipText}>{s}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    bottom: 160,
    right: 80,
  },
  displayName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  username: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.95)',
    marginTop: 6,
    lineHeight: 20,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  more: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
});
