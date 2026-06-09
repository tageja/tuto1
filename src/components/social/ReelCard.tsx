import React from 'react';
import { View, Text, Image, Pressable, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import type { Reel } from '../../services/social/reels.service';

const { width } = Dimensions.get('window');
const GAP = 2;
const COLS = 3;
const CELL_SIZE = (width - GAP * (COLS - 1)) / COLS;

interface Props {
  reel: Reel;
  onPress: () => void;
}

export default function ReelCard({ reel, onPress }: Props) {
  return (
    <Pressable style={styles.cell} onPress={onPress}>
      <Image
        source={{ uri: reel.thumbnailUrl ?? 'https://picsum.photos/400' }}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.overlay}>
        <MaterialIcons name="play-circle-filled" size={32} color="rgba(255,255,255,0.9)" />
      </View>
      <View style={styles.viewCount}>
        <MaterialIcons name="visibility" size={14} color="#fff" />
        <Text style={styles.viewText}>{reel.viewCount}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    backgroundColor: '#1a1a1a',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  viewCount: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
});
