import React from 'react';
import { View, StyleSheet, Dimensions, StatusBar, Text } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { colors } from '../theme';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onVideoEnd: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onVideoEnd }) => {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <Video
        source={require('../../assets/videos/tuto-intro.mp4')}
        style={styles.video}
        resizeMode={ResizeMode.CONTAIN}
        shouldPlay
        isLooping={false}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            onVideoEnd();
          }
        }}
      />
      {/* Fallback brand for extremely fast finishes */}
      <View style={styles.brandOverlay}>
        <Text style={styles.brandText}>Tuto</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: width,
    height: height,
  },
  brandOverlay: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  brandText: {
    color: '#ffffff',
    fontSize: 24,
    opacity: 0.65,
  },
});