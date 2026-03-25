import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';

interface Props {
  displayName: string;
}

export default function TypingIndicator({ displayName }: Props) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animate = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      );

    const a1 = animate(dot1, 0);
    const a2 = animate(dot2, 100);
    const a3 = animate(dot3, 200);
    a1.start();
    a2.start();
    a3.start();
    return () => {
      a1.stop();
      a2.stop();
      a3.stop();
    };
  }, [dot1, dot2, dot3]);

  const opacity = (anim: Animated.Value) =>
    anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.3, 1],
    });

  return (
    <View style={styles.container}>
      <View style={styles.bubble}>
        <Text style={styles.text}>{displayName} is typing</Text>
        <View style={styles.dots}>
          <Animated.Text style={[styles.dot, { opacity: opacity(dot1) }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: opacity(dot2) }]}>.</Animated.Text>
          <Animated.Text style={[styles.dot, { opacity: opacity(dot3) }]}>.</Animated.Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'flex-start',
  },
  bubble: {
    backgroundColor: '#E5E7EB',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    color: '#6B7280',
  },
  dots: {
    flexDirection: 'row',
    marginLeft: 2,
  },
  dot: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '700',
  },
});
