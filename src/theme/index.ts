// Light Theme Colors
export const lightColors = {
  primary: '#0B5FFF',
  secondary: '#FFFFFF',
  accent: '#F9FAFC',
  surface: '#F9FAFC',
  onSurface: '#333333',
  disabled: '#888888',
  white: '#FFFFFF',
  text: {
    primary: '#1A1A1A',
    secondary: '#666666',
    light: '#999999',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFC',
    tertiary: '#F5F5F5',
  },
  border: {
    light: '#E5E5E5',
    medium: '#CCCCCC',
    dark: '#999999',
  },
  status: {
    success: '#4CAF50',
    successBackground: '#E8F5E9',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },
  // convenience aliases for status colors at top-level
  warning: '#FF9800',
  error: '#F44336',
  rating: {
    filled: '#FFD700',
    empty: '#E0E0E0',
  },
  overlay: 'rgba(0, 0, 0, 0.5)',
  shadows: {
    dark: '#000000',
  },
};

// Dark Theme Colors
export const darkColors = {
  primary: '#3B82F6',
  secondary: '#1E1E1E',
  accent: '#2A2A2A',
  surface: '#2A2A2A',
  onSurface: '#E5E5E5',
  disabled: '#666666',
  white: '#FFFFFF',
  text: {
    primary: '#F5F5F5',
    secondary: '#B3B3B3',
    light: '#808080',
  },
  background: {
    primary: '#121212',
    secondary: '#1E1E1E',
    tertiary: '#2A2A2A',
  },
  border: {
    light: '#333333',
    medium: '#444444',
    dark: '#666666',
  },
  status: {
    success: '#66BB6A',
    successBackground: '#1B5E20',
    warning: '#FFA726',
    error: '#EF5350',
    info: '#42A5F5',
  },
  // convenience aliases for status colors at top-level
  warning: '#FFA726',
  error: '#EF5350',
  rating: {
    filled: '#FFD700',
    empty: '#444444',
  },
  overlay: 'rgba(0, 0, 0, 0.7)',
  shadows: {
    dark: '#000000',
  },
};

// Default export for backward compatibility (light theme)
export const colors = lightColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const typography = {
  fontFamily: {
    regular: 'Inter-Regular',
    medium: 'Inter-Medium',
    semiBold: 'Inter-SemiBold',
    bold: 'Inter-Bold',
    italic: 'Inter-Italic',
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
  },
};

export const shadows = {
  sm: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  dark: '#000000',
};

export const theme = {
  colors,
  spacing,
  borderRadius,
  typography,
  shadows,
};