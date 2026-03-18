import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

function ShimmerBox({ style }: { style?: object }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [anim]);

  return <Animated.View style={[styles.shimmer, style, { opacity: anim }]} />;
}

export default function PostCardSkeleton() {
  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.row}>
        <ShimmerBox style={styles.avatar} />
        <View style={styles.headerInfo}>
          <ShimmerBox style={styles.nameLine} />
          <ShimmerBox style={styles.subLine} />
        </View>
      </View>
      {/* Content lines */}
      <ShimmerBox style={styles.contentFull} />
      <ShimmerBox style={styles.contentPartial} />
      {/* Reaction row */}
      <View style={[styles.row, styles.reactionRow]}>
        <ShimmerBox style={styles.reactionBtn} />
        <ShimmerBox style={styles.reactionBtn} />
        <ShimmerBox style={styles.reactionBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius:    16,
    padding:         16,
    marginBottom:    8,
  },
  row: {
    flexDirection: 'row',
    alignItems:    'center',
    marginBottom:  12,
  },
  avatar: {
    width:        44,
    height:       44,
    borderRadius: 22,
    marginRight:  12,
  },
  headerInfo: {
    flex:    1,
    gap:     6,
  },
  nameLine: {
    width:        140,
    height:       14,
    borderRadius: 7,
  },
  subLine: {
    width:        90,
    height:       12,
    borderRadius: 6,
  },
  contentFull: {
    width:        '100%',
    height:       14,
    borderRadius: 7,
    marginBottom: 8,
  },
  contentPartial: {
    width:        '70%',
    height:       14,
    borderRadius: 7,
    marginBottom: 16,
  },
  reactionRow: {
    gap: 16,
    marginBottom: 0,
  },
  reactionBtn: {
    width:        64,
    height:       24,
    borderRadius: 12,
  },
  shimmer: {
    backgroundColor: '#E5E7EB',
  },
});
