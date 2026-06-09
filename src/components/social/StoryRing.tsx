import React from 'react';
import { View, Image, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const RING_SIZE = 72;
const AVATAR_SIZE = 64;

interface Props {
  avatarUrl?: string;
  displayName?: string;
  isOwn?: boolean;
  hasUnviewed?: boolean;
  label?: string;
  onPress: () => void;
}

export default function StoryRing({
  avatarUrl,
  displayName,
  isOwn = false,
  hasUnviewed = true,
  label,
  onPress,
}: Props) {
  const initial = displayName?.charAt(0)?.toUpperCase() ?? '?';

  const ring = (
    <View style={[styles.ring, hasUnviewed && styles.ringUnviewed]}>
      {hasUnviewed ? (
        <LinearGradient
          colors={['#F58529', '#DD2A7B', '#8134AF', '#515BD4']}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <View style={styles.avatarInner}>
            {avatarUrl ? (
              <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarFallback}>
                <Text style={styles.avatarText}>{initial}</Text>
              </View>
            )}
          </View>
        </LinearGradient>
      ) : (
        <View style={styles.avatarOuter}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarFallback, styles.avatarGray]}>
              <Text style={styles.avatarText}>{initial}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );

  return (
    <Pressable onPress={onPress} style={styles.wrapper}>
      {ring}
      <Text style={styles.label} numberOfLines={1}>
        {label ?? (isOwn ? '' : displayName ?? '')}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    width: RING_SIZE + 16,
  },
  ring: {
    width: RING_SIZE,
    height: RING_SIZE,
    borderRadius: RING_SIZE / 2,
    padding: 3,
    backgroundColor: '#E5E7EB',
  },
  ringUnviewed: {
    backgroundColor: 'transparent',
  },
  gradient: {
    flex: 1,
    borderRadius: (RING_SIZE - 6) / 2,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInner: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  avatarOuter: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    overflow: 'hidden',
    backgroundColor: '#fff',
    margin: 2,
  },
  avatarImg: {
    width: '100%',
    height: '100%',
  },
  avatarFallback: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarGray: {
    backgroundColor: '#9CA3AF',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#6B7280',
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    maxWidth: RING_SIZE + 16,
  },
});
