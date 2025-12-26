# Dark Theme Implementation Guide

## ✅ What's Implemented

The Tuto mobile app now has a **fully functional dark theme system** with:

1. **ThemeContext** - Global theme state management
2. **System Detection** - Automatically detects device's dark/light mode
3. **AsyncStorage Persistence** - Theme preference persists across app restarts
4. **Backend Sync** - Theme preference saved to user profile
5. **Three Modes**: System (auto), Light, Dark

## 📁 Files Added/Modified

### New Files:
- `src/contexts/ThemeContext.tsx` - Theme provider and hook

### Modified Files:
- `src/theme/index.ts` - Added `lightColors` and `darkColors` palettes
- `src/screens/settings/AppPreferencesSettingsScreen.tsx` - Uses `useTheme()` hook
- `App.tsx` - Wrapped with `ThemeProvider`

## 🎨 Color Palettes

### Light Theme (Default)
```typescript
{
  primary: '#0B5FFF',
  background: { primary: '#FFFFFF', secondary: '#F9FAFC' },
  text: { primary: '#1A1A1A', secondary: '#666666' },
  border: { light: '#E5E5E5', medium: '#CCCCCC' },
  // ... etc
}
```

### Dark Theme
```typescript
{
  primary: '#3B82F6',
  background: { primary: '#121212', secondary: '#1E1E1E' },
  text: { primary: '#F5F5F5', secondary: '#B3B3B3' },
  border: { light: '#333333', medium: '#444444' },
  // ... etc
}
```

## 🔧 How to Use in Components

### Before (Old Way - Static Colors):
```tsx
import { colors, spacing } from '../../theme';

function MyComponent() {
  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
}
```

### After (New Way - Dynamic Colors):
```tsx
import { useTheme } from '../../contexts/ThemeContext';

function MyComponent() {
  const { colors, spacing, isDark } = useTheme();
  
  return (
    <View style={{ backgroundColor: colors.background.primary }}>
      <Text style={{ color: colors.text.primary }}>Hello</Text>
    </View>
  );
}
```

## 📝 Migration Steps for Existing Screens

### Step 1: Replace Import
```diff
- import { colors, spacing, typography, borderRadius } from '../../theme';
+ import { useTheme } from '../../contexts/ThemeContext';
```

### Step 2: Use Hook at Top of Component
```tsx
export default function MyScreen() {
+ const { colors, spacing, typography, borderRadius, isDark } = useTheme();
  
  // ... rest of component
}
```

### Step 3: Remove Static Imports
No changes needed to your StyleSheet! Colors are now dynamic.

### Step 4: (Optional) Add Dark-Specific Logic
```tsx
const { isDark } = useTheme();

// Example: Different icons for dark/light
<MaterialIcons 
  name={isDark ? "brightness-3" : "brightness-7"} 
  color={colors.text.primary} 
/>
```

## 🚀 Quick Migration Example

### Before:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../theme';

export default function ExampleScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    padding: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    color: colors.text.primary,
  },
});
```

### After:
```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

export default function ExampleScreen() {
  const { colors, spacing, typography } = useTheme();
  
  // Move styles inside component to access dynamic colors
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.primary,
      padding: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.xxl,
      color: colors.text.primary,
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome</Text>
    </View>
  );
}
```

## ⚠️ Important Notes

### 1. StyleSheet Location
**Move StyleSheet.create() INSIDE your component** to access dynamic colors:

```tsx
// ❌ WRONG - Colors won't update
const styles = StyleSheet.create({...});

function MyComponent() {
  const { colors } = useTheme();
  return <View style={styles.container} />;
}

// ✅ CORRECT - Colors are dynamic
function MyComponent() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
    container: { backgroundColor: colors.background.primary }
  });
  
  return <View style={styles.container} />;
}
```

### 2. Performance Optimization
For complex screens, use `useMemo` to prevent recreating styles on every render:

```tsx
import { useMemo } from 'react';
import { useTheme } from '../../contexts/ThemeContext';

function MyScreen() {
  const { colors, spacing } = useTheme();
  
  const styles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor: colors.background.primary,
      padding: spacing.md,
    },
  }), [colors, spacing]);
  
  return <View style={styles.container} />;
}
```

### 3. Backward Compatibility
The old static import still works (defaults to light theme):
```tsx
import { colors } from '../../theme'; // Still works, but always light
```

## 🧪 Testing Theme Switch

1. Open the app
2. Navigate to Settings → App Preferences
3. Tap different theme options:
   - **System**: Follows device setting (Settings → Display → Dark mode)
   - **Light**: Always light theme
   - **Dark**: Always dark theme
4. Theme should apply **immediately**
5. Restart app - theme should persist

## 🎯 Priority Migration List

Migrate screens in this order for best user experience:

### High Priority (User-facing):
1. ✅ `AppPreferencesSettingsScreen.tsx` (Already done)
2. `HomeScreen.tsx`
3. `FeedScreen.tsx`
4. `ProfileScreen.tsx`
5. `SettingsScreen.tsx`

### Medium Priority (School features):
6. School dashboard screens
7. Teacher/Student detail screens
8. Attendance screens

### Low Priority (Admin/Occasional use):
9. Admin screens
10. Moderation screens
11. Analytics screens

## 🐛 Common Issues & Solutions

### Issue: Colors not updating when theme changes
**Solution**: Ensure StyleSheet is inside component, not at module level

### Issue: Performance lag when theme switches
**Solution**: Use `useMemo` for styles in complex components

### Issue: Some colors look wrong in dark mode
**Solution**: Check if you're using hardcoded hex values. Replace with theme colors.

### Issue: Status bar not matching theme
**Solution**: Add to each screen:
```tsx
import { StatusBar } from 'react-native';

function MyScreen() {
  const { isDark } = useTheme();
  
  return (
    <>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      {/* ... rest of screen */}
    </>
  );
}
```

## 📊 Migration Progress Tracker

| Screen | Status | Notes |
|--------|--------|-------|
| AppPreferencesSettingsScreen | ✅ Done | Theme switching works |
| HomeScreen | ⏳ Pending | High priority |
| FeedScreen | ⏳ Pending | High priority |
| ProfileScreen | ⏳ Pending | High priority |
| ... | ⏳ Pending | See priority list above |

## 🔗 Related Files

- **Theme Definition**: `src/theme/index.ts`
- **Theme Context**: `src/contexts/ThemeContext.tsx`
- **Theme Hook**: Import `useTheme` from `ThemeContext.tsx`
- **Type Definitions**: `src/types/settings.ts`

## 📚 Additional Resources

- [React Native Appearance API](https://reactnative.dev/docs/appearance)
- [AsyncStorage Documentation](https://react-native-async-storage.github.io/async-storage/)
- [Material Design Dark Theme](https://material.io/design/color/dark-theme.html)

---

**Last Updated**: December 17, 2025
**Status**: ✅ Core implementation complete, screen migration in progress





