import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Dimensions, StyleSheet, Pressable, Animated } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import type { AVPlaybackStatus } from 'expo-av';
import type { Reel } from '../../services/social/reels.service';
import ReelInfo from './ReelInfo';
import ReelActions from './ReelActions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Props {
  reel: Reel;
  isActive: boolean;
  onLike: () => void;
  onComment: () => void;
  onAuthorPress: () => void;
  bottomOffset?: number;
}

export default function ReelItem({
  reel,
  isActive,
  onLike,
  onComment,
  onAuthorPress,
  bottomOffset = 0,
}: Props) {
  const videoRef = useRef<Video>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const handlePlaybackStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      const duration = status.durationMillis ?? 0;
      if (duration > 0) {
        const ratio = (status.positionMillis ?? 0) / duration;
        Animated.timing(progressAnim, {
          toValue: ratio,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }
    },
    [progressAnim],
  );

  useEffect(() => {
    if (!videoRef.current) return;
    if (isActive) {
      videoRef.current.playAsync().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    }
  }, [isActive, reel.id]);

  const handleTap = useCallback(() => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pauseAsync().catch(() => {});
      setIsPlaying(false);
    } else {
      videoRef.current.playAsync().catch(() => {});
      setIsPlaying(true);
    }
  }, [isPlaying]);

  return (
    <View style={styles.container}>
      <Pressable style={StyleSheet.absoluteFill} onPress={handleTap}>
        <Video
          ref={videoRef}
          source={{ uri: reel.videoUrl }}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={isMuted}
          shouldPlay={false}
          useNativeControls={false}
          onPlaybackStatusUpdate={handlePlaybackStatus}
          onLoad={() => {
            if (isActive && videoRef.current) {
              videoRef.current.playAsync().catch(() => {});
              setIsPlaying(true);
            }
          }}
          onError={(err) => console.warn('Video error', reel.id, err)}
        />
      </Pressable>
      {/* Progress bar */}
      <View style={[styles.progressTrack, { bottom: bottomOffset }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        />
      </View>
      <ReelInfo reel={reel} onAuthorPress={onAuthorPress} />
      <ReelActions
        reel={reel}
        onLike={onLike}
        onComment={onComment}
        onAuthorPress={onAuthorPress}
        isMuted={isMuted}
        onMuteToggle={() => setIsMuted((prev) => !prev)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#000',
  },
  progressTrack: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.25)',
    zIndex: 20,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
});
