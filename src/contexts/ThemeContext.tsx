/**
 * ThemeContext
 * Manages app theme (light/dark/system) with AsyncStorage persistence
 * and system appearance detection
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, spacing, borderRadius, typography, shadows } from '../theme';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ColorScheme = 'light' | 'dark';

interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  surface: string;
  onSurface: string;
  disabled: string;
  white: string;
  text: {
    primary: string;
    secondary: string;
    light: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
  };
  border: {
    light: string;
    medium: string;
    dark: string;
  };
  status: {
    success: string;
    successBackground: string;
    warning: string;
    error: string;
    info: string;
  };
  warning: string;
  error: string;
  rating: {
    filled: string;
    empty: string;
  };
  overlay: string;
  shadows: {
    dark: string;
  };
}

interface ThemeContextType {
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  typography: typeof typography;
  shadows: typeof shadows;
  isDark: boolean;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@tuto_theme_mode';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [systemColorScheme, setSystemColorScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  // Determine the actual color scheme based on themeMode
  const colorScheme: ColorScheme = 
    themeMode === 'system' 
      ? (systemColorScheme === 'dark' ? 'dark' : 'light')
      : themeMode;

  const isDark = colorScheme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  // Load theme from AsyncStorage on mount
  useEffect(() => {
    loadThemeFromStorage();
  }, []);

  // Listen to system appearance changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: newColorScheme }) => {
      console.log('📱 System appearance changed:', newColorScheme);
      setSystemColorScheme(newColorScheme);
    });

    return () => subscription.remove();
  }, []);

  const loadThemeFromStorage = async () => {
    try {
      const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (storedTheme && ['system', 'light', 'dark'].includes(storedTheme)) {
        console.log('🎨 Theme loaded from storage:', storedTheme);
        setThemeModeState(storedTheme as ThemeMode);
      }
    } catch (error) {
      console.error('Error loading theme from storage:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      console.log('🎨 Setting theme mode:', mode);
      setThemeModeState(mode);
      await AsyncStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      console.error('Error saving theme to storage:', error);
      throw error;
    }
  };

  const value: ThemeContextType = {
    themeMode,
    colorScheme,
    colors,
    spacing,
    borderRadius,
    typography,
    shadows,
    isDark,
    setThemeMode,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

