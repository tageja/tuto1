import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSchool } from '../../contexts/SchoolContext';

const { width } = Dimensions.get('window');

const DOT_COUNT = 3;
const DOT_DELAY = 200;

/**
 * AppLoadingScreen — shown in place of the plain ActivityIndicator while
 * the app resolves auth + school context on first load.
 *
 * If the user belongs to a school that has a logo_url, the screen shows:
 *   - School logo (large, centred)
 *   - School name
 *   - Animated loading dots
 *   - "Powered by tuto." at the bottom
 *
 * If no school logo is set (new user / pre-login), it shows the standard
 * Tuto splash layout so there is never a blank white screen.
 */
const AppLoadingScreen: React.FC = () => {
  const { currentSchool } = useSchool();
  const schoolLogoUrl = currentSchool?.logo_url ?? null;

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
            <Text style={styles.schoolName}>{currentSchool?.name ?? ''}</Text>
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
    width: width * 0.35,
    height: width * 0.35,
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
