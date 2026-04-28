import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSchool } from '../../contexts/SchoolContext';

const { width } = Dimensions.get('window');

const DOT_COUNT = 3;
const DOT_DELAY = 200;

/**
 * AppLoadingScreen — shown while the app resolves auth + school context.
 *
 * Reads cached school from AsyncStorage directly on mount so the school
 * logo appears immediately, even before SchoolContext has initialised.
 * Falls back to the standard Tuto splash when no logo is available.
 */
const AppLoadingScreen: React.FC = () => {
  const { currentSchool } = useSchool();
  const [cachedLogoUrl, setCachedLogoUrl] = useState<string | null>(null);
  const [cachedSchoolName, setCachedSchoolName] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('currentSchool').then(stored => {
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.logo_url) setCachedLogoUrl(parsed.logo_url);
        if (parsed?.name) setCachedSchoolName(parsed.name);
      } catch { /* ignore corrupt cache */ }
    });
  }, []);

  const schoolLogoUrl = currentSchool?.logo_url ?? cachedLogoUrl;
  const schoolName = currentSchool?.name ?? cachedSchoolName;

  // Fade-in for the whole screen
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Three pulsing dots
  const dotAnims = useRef(
    Array.from({ length: DOT_COUNT }, () => new Animated.Value(0.3))
  ).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    const dotLoops = dotAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * DOT_DELAY),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(anim, {
            toValue: 0.3,
            duration: 400,
            useNativeDriver: true,
          }),
        ])
      )
    );

    dotLoops.forEach(loop => loop.start());
    return () => dotLoops.forEach(loop => loop.stop());
  }, [fadeAnim, dotAnims]);

  const isSchoolBranded = !!schoolLogoUrl;

  return (
    <Animated.View
      style={[
        styles.container,
        isSchoolBranded ? styles.containerLight : styles.containerDark,
        { opacity: fadeAnim },
      ]}
    >
      <StatusBar
        barStyle={isSchoolBranded ? 'dark-content' : 'light-content'}
        backgroundColor={isSchoolBranded ? '#ffffff' : '#000000'}
      />

      {/* Centre section */}
      <View style={styles.centre}>
        {isSchoolBranded ? (
          <>
            <Image
              source={{ uri: schoolLogoUrl! }}
              style={styles.schoolLogo}
              resizeMode="contain"
            />
            <Text style={styles.schoolName}>{schoolName ?? ''}</Text>
            <View style={styles.dotsRow}>
              {dotAnims.map((anim, i) => (
                <Animated.View
                  key={i}
                  style={[styles.dot, { opacity: anim }]}
                />
              ))}
            </View>
          </>
        ) : (
          <Image
            source={require('../../../assets/splash-logo.png')}
            style={styles.tutoLogoLarge}
            resizeMode="contain"
          />
        )}
      </View>

      {/* Bottom: "Powered by tuto." — only shown in school-branded mode */}
      {isSchoolBranded && (
        <View style={styles.footer}>
          <Text style={styles.poweredByText}>
            Powered by{' '}
            <Text style={styles.tutoWordmark}>tuto.</Text>
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  containerLight: {
    backgroundColor: '#ffffff',
  },
  containerDark: {
    backgroundColor: '#000000',
    justifyContent: 'center',
  },
  centre: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  schoolLogo: {
    width: width * 0.45,
    height: width * 0.45,
    borderRadius: 16,
  },
  schoolName: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    textAlign: 'center',
    marginTop: 4,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#d1d5db',
  },
  tutoLogoLarge: {
    width: width * 0.55,
    height: width * 0.55,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 8,
  },
  poweredByText: {
    fontSize: 13,
    color: '#9ca3af',
    fontWeight: '500',
  },
  tutoWordmark: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0B5FFF',
  },
});

export default AppLoadingScreen;
