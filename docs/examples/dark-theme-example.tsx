/**
 * Dark Theme Usage Example
 * 
 * This file demonstrates how to properly use the dark theme system
 * in your React Native components.
 */

import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/contexts/ThemeContext';

/**
 * Example 1: Basic Theme Usage
 */
export function BasicThemeExample() {
  const { colors, spacing, typography, isDark } = useTheme();

  // Styles moved inside component to access dynamic colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
      padding: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: spacing.md,
    },
    card: {
      backgroundColor: colors.surface,
      padding: spacing.lg,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    description: {
      fontSize: typography.fontSize.md,
      color: colors.text.secondary,
      lineHeight: 22,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      <Text style={styles.title}>Hello, Themed World!</Text>
      <View style={styles.card}>
        <Text style={styles.description}>
          This component automatically adapts to dark and light themes.
        </Text>
      </View>
    </SafeAreaView>
  );
}

/**
 * Example 2: Performance-Optimized with useMemo
 */
export function OptimizedThemeExample() {
  const { colors, spacing, typography, isDark } = useTheme();

  // Use useMemo to prevent recreating styles on every render
  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background.primary,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        },
        headerText: {
          fontSize: typography.fontSize.lg,
          fontWeight: '600',
          color: colors.text.primary,
          marginLeft: spacing.sm,
        },
      }),
    [colors, spacing, typography]
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="palette" size={24} color={colors.primary} />
        <Text style={styles.headerText}>Optimized Theme Component</Text>
      </View>
    </View>
  );
}

/**
 * Example 3: Conditional Styling Based on Theme
 */
export function ConditionalThemeExample() {
  const { colors, spacing, isDark } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background.primary }}>
      {/* Different content/icons for dark vs light */}
      <View style={{ padding: spacing.lg, alignItems: 'center' }}>
        <MaterialIcons
          name={isDark ? 'brightness-3' : 'brightness-7'}
          size={48}
          color={colors.primary}
        />
        <Text style={{ color: colors.text.primary, marginTop: spacing.md }}>
          Currently in {isDark ? 'Dark' : 'Light'} mode
        </Text>
      </View>

      {/* Conditional shadow (shadows often look different in dark mode) */}
      <View
        style={{
          margin: spacing.md,
          padding: spacing.lg,
          backgroundColor: colors.surface,
          borderRadius: 12,
          ...(isDark
            ? { borderWidth: 1, borderColor: colors.border.light }
            : {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }),
        }}
      >
        <Text style={{ color: colors.text.primary }}>
          This card has conditional styling
        </Text>
      </View>
    </View>
  );
}

/**
 * Example 4: Theme Toggle Button
 */
export function ThemeToggleExample() {
  const { colors, spacing, themeMode, setThemeMode, isDark } = useTheme();

  const handleToggle = async () => {
    const newMode = isDark ? 'light' : 'dark';
    await setThemeMode(newMode);
  };

  return (
    <View style={{ padding: spacing.md }}>
      <TouchableOpacity
        onPress={handleToggle}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.primary,
          padding: spacing.md,
          borderRadius: 12,
          justifyContent: 'center',
        }}
      >
        <MaterialIcons
          name={isDark ? 'brightness-7' : 'brightness-3'}
          size={24}
          color="#FFFFFF"
        />
        <Text
          style={{
            color: '#FFFFFF',
            fontSize: 16,
            fontWeight: '600',
            marginLeft: spacing.sm,
          }}
        >
          Switch to {isDark ? 'Light' : 'Dark'} Mode
        </Text>
      </TouchableOpacity>
      <Text
        style={{
          color: colors.text.secondary,
          fontSize: 14,
          textAlign: 'center',
          marginTop: spacing.sm,
        }}
      >
        Current mode: {themeMode}
      </Text>
    </View>
  );
}

/**
 * Example 5: Full Screen with All Theme Features
 */
export function CompleteThemeExample() {
  const { colors, spacing, typography, borderRadius, isDark } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background.primary,
        },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: spacing.md,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border.light,
        },
        headerTitle: {
          fontSize: typography.fontSize.xl,
          fontWeight: '700',
          color: colors.text.primary,
        },
        content: {
          padding: spacing.md,
        },
        section: {
          marginBottom: spacing.lg,
        },
        sectionTitle: {
          fontSize: typography.fontSize.lg,
          fontWeight: '600',
          color: colors.text.primary,
          marginBottom: spacing.sm,
        },
        card: {
          backgroundColor: colors.surface,
          padding: spacing.lg,
          borderRadius: borderRadius.lg,
          borderWidth: 1,
          borderColor: colors.border.light,
          marginBottom: spacing.md,
        },
        cardText: {
          fontSize: typography.fontSize.md,
          color: colors.text.secondary,
          lineHeight: 22,
        },
        button: {
          backgroundColor: colors.primary,
          paddingVertical: spacing.md,
          paddingHorizontal: spacing.lg,
          borderRadius: borderRadius.lg,
          alignItems: 'center',
          marginTop: spacing.sm,
        },
        buttonText: {
          color: '#FFFFFF',
          fontSize: typography.fontSize.md,
          fontWeight: '600',
        },
      }),
    [colors, spacing, typography, borderRadius]
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Complete Example</Text>
        <MaterialIcons
          name={isDark ? 'brightness-3' : 'brightness-7'}
          size={24}
          color={colors.primary}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Section 1 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About This Screen</Text>
          <View style={styles.card}>
            <Text style={styles.cardText}>
              This example demonstrates all theme features: dynamic colors,
              proper styling, performance optimization with useMemo, and
              conditional dark/light rendering.
            </Text>
          </View>
        </View>

        {/* Section 2 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Indicators</Text>
          {['success', 'warning', 'error', 'info'].map((status) => (
            <View
              key={status}
              style={[
                styles.card,
                {
                  borderLeftWidth: 4,
                  borderLeftColor:
                    colors.status[status as keyof typeof colors.status],
                },
              ]}
            >
              <Text style={styles.cardText}>
                {status.charAt(0).toUpperCase() + status.slice(1)} message
              </Text>
            </View>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>Take Action</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}





