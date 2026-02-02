/**
 * ThemeContext
 * App is light-only; dark/system removed. API kept for compatibility.
 */

import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, spacing, borderRadius, typography, shadows } from '../theme';

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
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');

  const colorScheme: ColorScheme = 'light';
  const isDark = false;
  const colors = lightColors;

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem(THEME_STORAGE_KEY, 'light');
      } catch (e) {}
    })();
  }, []);

  const setThemeMode = async (_mode: ThemeMode) => {
    try {
      setThemeModeState('light');
      await AsyncStorage.setItem(THEME_STORAGE_KEY, 'light');
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
