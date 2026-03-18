import React, { useRef, useCallback } from 'react';
import { View, Text, Pressable, Animated, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import type { ReactionType, ReactionCounts } from '../../types/social';

interface Props {
  reactions:    ReactionCounts;
  userReaction: ReactionType | undefined;
  commentsCount: number;
  saved:         boolean;
  onReact:       (type: ReactionType) => void;
  onComment?:    () => void;
  onShare?:      () => void;
  onSave?:       () => void;
  compact?:      boolean;
}

const REACTION_COLOR: Record<ReactionType, string> = {
  like:    '#FF3B5C',
  applaud: '#6366F1',
  curious: '#F59E0B',
};

const REACTION_ICON: Record<ReactionType, React.ComponentProps<typeof MaterialIcons>['name']> = {
  like:    'favorite',
  applaud: 'emoji-events',
  curious: 'help',
};

function ReactionButton({
  type,
  count,
  active,
  onPress,
  compact,
}: {
  type:    ReactionType;
  count:   number;
  active:  boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const { t } = useLanguage();

  const handle = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.3, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,   useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  }, [onPress, scale]);

  const color  = active ? REACTION_COLOR[type] : '#888';
  const icon   = active ? REACTION_ICON[type] : (`${REACTION_ICON[type]}-border` as never) ?? REACTION_ICON[type];
  const label  = t(`community.post.${type}` as never) as string;
  const total  = count > 999 ? `${(count / 1000).toFixed(1)}k` : String(count);

  return (
    <Pressable style={styles.reactionBtn} onPress={handle} hitSlop={6}>
      <Animated.View style={[styles.reactionInner, { transform: [{ scale }] }]}>
        <MaterialIcons name={icon} size={compact ? 18 : 20} color={color} />
        {count > 0 && (
          <Text style={[styles.count, { color }, compact && styles.countCompact]}>
            {total}
          </Text>
        )}
        {!compact && <Text style={[styles.label, active && { color }]}>{label}</Text>}
      </Animated.View>
    </Pressable>
  );
}

export default function ReactionBar({
  reactions,
  userReaction,
  commentsCount,
  saved,
  onReact,
  onComment,
  onShare,
  onSave,
  compact,
}: Props) {
  const { t } = useLanguage();
  const commentTotal = commentsCount > 999 ? `${(commentsCount / 1000).toFixed(1)}k` : String(commentsCount);

  return (
    <View style={[styles.bar, compact && styles.barCompact]}>
      <ReactionButton
        type="like"
        count={reactions.like}
        active={userReaction === 'like'}
        onPress={() => onReact('like')}
        compact={compact}
      />
      <ReactionButton
        type="applaud"
        count={reactions.applaud}
        active={userReaction === 'applaud'}
        onPress={() => onReact('applaud')}
        compact={compact}
      />
      <ReactionButton
        type="curious"
        count={reactions.curious}
        active={userReaction === 'curious'}
        onPress={() => onReact('curious')}
        compact={compact}
      />

      <View style={styles.spacer} />

      {onComment !== undefined && (
        <Pressable style={styles.reactionBtn} onPress={onComment} hitSlop={6}>
          <MaterialIcons name="chat-bubble-outline" size={compact ? 18 : 20} color="#888" />
          {commentsCount > 0 && (
            <Text style={[styles.count, compact && styles.countCompact]}>{commentTotal}</Text>
          )}
        </Pressable>
      )}

      {onShare !== undefined && (
        <Pressable style={styles.reactionBtn} onPress={onShare} hitSlop={6}>
          <MaterialIcons name="share" size={compact ? 18 : 20} color="#888" />
        </Pressable>
      )}

      {onSave !== undefined && (
        <Pressable style={styles.reactionBtn} onPress={onSave} hitSlop={6}>
          <MaterialIcons
            name={saved ? 'bookmark' : 'bookmark-border'}
            size={compact ? 18 : 20}
            color={saved ? '#0B5FFF' : '#888'}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingTop:    10,
    gap:           2,
  },
  barCompact: {
    paddingTop: 6,
  },
  reactionBtn: {
    flexDirection: 'row',
    alignItems:    'center',
    paddingHorizontal: 6,
    paddingVertical:   4,
    gap: 3,
  },
  reactionInner: {
    flexDirection: 'row',
    alignItems:    'center',
    gap:           3,
  },
  count: {
    fontSize:   13,
    fontWeight: '600',
    color:      '#888',
  },
  countCompact: {
    fontSize: 12,
  },
  label: {
    fontSize: 12,
    color:    '#888',
  },
  spacer: {
    flex: 1,
  },
});
