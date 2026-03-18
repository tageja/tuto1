import React, { useRef, useCallback } from 'react';
import { Animated, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { MaterialIcons } from '@expo/vector-icons';

interface Props {
  liked:    boolean;
  onPress:  () => void;
  size?:    number;
}

export default function LikeButton({ liked, onPress, size = 24 }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.35, useNativeDriver: true, speed: 40 }),
      Animated.spring(scale, { toValue: 1,    useNativeDriver: true, speed: 20 }),
    ]).start();
    onPress();
  }, [onPress, scale]);

  return (
    <Pressable onPress={handlePress} hitSlop={8}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <MaterialIcons
          name={liked ? 'favorite' : 'favorite-border'}
          size={size}
          color={liked ? '#FF3B5C' : '#888'}
        />
      </Animated.View>
    </Pressable>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const styles = StyleSheet.create({});
