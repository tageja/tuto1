# Production Build Issue - 18 Jan 2026

## Problem Summary

**The app gets stuck on the native splash screen indefinitely in production/TestFlight builds, while working perfectly in the simulator.**

### Key Facts
- **Symptom:** Native splash screen (t. logo on black background) stays forever
- **Works in:** iOS Simulator (development builds)
- **Fails in:** EAS production builds installed via TestFlight
- **Root Cause:** React Native JavaScript is NOT executing at all in production builds
- **Evidence:** Device logs show app process running but zero JavaScript output
- **Builds tested:** 13, 14, 15 - all stuck on splash

---

## Git Branch Information

### Current Branch
```
Branch: 18Jan26BuildIssueTrial
Remote: origin/18Jan26BuildIssueTrial
```

### Recent Commit History
```
f65c63f WIP: Debugging production build splash screen issue  <-- CURRENT
f86b814 fix: Force iPhone-only by setting UIDeviceFamily in Info.plist
60a0718 fix: Update all email addresses across help pages
01b5f97 fix: Update contact page with correct email addresses
ff94b4d feat: Add support contact info to homepage footer
e5f4e25 fix: Add Vercel routing configuration
7fca417 fix: Force Vercel redeploy of support page
4615298 feat: Update app icon with larger, more readable logo
060763b fix: Simplify support page for immediate Vercel deployment
7d31e4b fix: Apple rejection fixes - Disable iPad support (build 5)
```

### All Branches
```
* 18Jan26BuildIssueTrial   <-- Working branch for this issue
  14Jan26AppStoreSubmission
  7Jan26
  main
```

### To Resume Work
```bash
cd /Users/pc/tutoAll/tuto1
git checkout 18Jan26BuildIssueTrial
git pull origin 18Jan26BuildIssueTrial
```

---

## Detailed Problem Analysis

### What's Happening
1. User taps app icon on iPhone (TestFlight build)
2. Native iOS splash screen appears (t. logo on black background)
3. Splash screen stays FOREVER (30+ seconds tested)
4. React Native never mounts, never renders, never executes
5. `SplashScreen.hideAsync()` is never called because React never starts

### What's NOT the Problem
- The splash screen configuration itself is correct
- The `SplashScreen.hideAsync()` call is in App.tsx
- The timeout mechanism was added but irrelevant since React never mounts
- The fonts loading is not blocking (we removed that dependency)

### What IS the Problem
**React Native's JavaScript engine is not starting in production builds.**

This could be caused by:
1. Native module crash during initialization (before React)
2. Hermes bytecode compilation failure
3. New Architecture (Fabric) incompatibility
4. Missing or corrupted JS bundle in IPA

---

## Three Most Likely Causes

### 1. New Architecture (MOST LIKELY)

**Current Setting:**
```json
// app.json
"newArchEnabled": true
```

**Why it's suspect:**
- React Native's New Architecture (Fabric renderer + TurboModules) is enabled
- Known to have compatibility issues with certain native modules
- Works in dev (bridge mode fallback) but fails in production (strict mode)
- Several dependencies may not be fully compatible

**Fix:**
```json
// app.json
"newArchEnabled": false
```

Also update Info.plist:
```bash
/usr/libexec/PlistBuddy -c "Set :RCTNewArchEnabled false" ios/Tuto/Info.plist
```

---

### 2. Sentry Native SDK

**Current Setup:**
```
Package: @sentry/react-native ~6.20.0
Location: src/services/analytics.ts
```

**Why it's suspect:**
- Sentry's native SDK initializes BEFORE React even mounts
- If native initialization crashes, the entire app freezes silently
- No error is thrown to JavaScript - it just hangs
- The `initMonitoring()` function calls `Sentry.init()`

**Fix (temporary disable):**
```typescript
// src/services/analytics.ts
export const initMonitoring = () => {
  // TEMPORARILY DISABLED FOR DEBUGGING
  // const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  // const environment = process.env.EXPO_PUBLIC_APP_ENVIRONMENT || 'development';
  // const release = process.env.EXPO_PUBLIC_APP_VERSION || '0.0.0';
  // if (dsn) {
  //   Sentry.init({ dsn, enableAutoSessionTracking: true, environment, release });
  // }
  console.log('Monitoring disabled for debugging');
};
```

---

### 3. Hermes Bytecode Compilation

**Current Setting:**
```json
// app.json
"jsEngine": "hermes"
```

**Why it's suspect:**
- Production builds compile JS to Hermes bytecode
- If compilation fails silently, the bundle won't execute
- Dev builds use Metro server, production uses embedded bytecode

**Fix (switch to JSC):**
```json
// app.json
"jsEngine": "jsc"
```

---

## Files Modified for Debugging

| File | Changes Made |
|------|--------------|
| `App.tsx` | Added immediate `SplashScreen.hideAsync()` on mount, removed font blocking |
| `app.json` | Build number 15, added expo-font plugin, assetBundlePatterns |
| `eas.json` | Removed `channel: "production"` (was requiring expo-updates) |
| `ios/Podfile` | Added `use_modular_headers!` for Firebase compatibility |
| `ios/Tuto/Info.plist` | Build number updates |
| `assets/fonts/` | Added Inter font TTF files for embedding |
| `assets/splash-logo.png` | The t. logo image for splash screen |
| `create-splash.js` | Node script to generate splash screen images |

---

## Current App.tsx State

```typescript
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import React, { useState, useCallback } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from 'react-error-boundary';
import { View, Text } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
// ... other imports

export default function App() {
  const [queryClient] = useState(() => new QueryClient());

  // CRITICAL: Hide splash screen IMMEDIATELY when React starts
  React.useEffect(() => {
    SplashScreen.hideAsync().catch(() => {});
  }, []);

  // Initialize monitoring in background
  React.useEffect(() => {
    try {
      initMonitoring();
    } catch (e) {
      console.warn('Monitoring init failed:', e);
    }
  }, []);

  // Load fonts in background - don't block app
  useFonts({...});

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <LanguageProvider>
          <UserProvider>
            <SchoolProvider>
              <QueryClientProvider client={queryClient}>
                <AppNavigator />
              </QueryClientProvider>
            </SchoolProvider>
          </UserProvider>
        </LanguageProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
```

---

## Recommended Fix Order

### Step 1: Disable New Architecture
```bash
# Edit app.json
"newArchEnabled": false

# Update Info.plist
/usr/libexec/PlistBuddy -c "Set :RCTNewArchEnabled false" ios/Tuto/Info.plist

# Rebuild native project
npx expo prebuild --platform ios

# Fix Podfile (gets reset by prebuild)
# Add after "platform :ios" line:
use_modular_headers!

# Install pods
cd ios && pod install && cd ..

# Update build number
/usr/libexec/PlistBuddy -c "Set :CFBundleVersion 16" ios/Tuto/Info.plist
# Also update app.json: "buildNumber": "16"

# Build
eas build --platform ios --profile production --non-interactive
```

### Step 2: If Still Broken - Disable Sentry
Edit `src/services/analytics.ts` and comment out `Sentry.init()`.

### Step 3: If Still Broken - Try JSC Instead of Hermes
```json
// app.json
"jsEngine": "jsc"
```

### Step 4: If Still Broken - Minimal App Test
Create a minimal App.tsx with just "Hello World" to isolate the issue.

---

## EAS Build Commands

```bash
# Check build status
eas build:list --platform ios --limit 5

# Start new production build
eas build --platform ios --profile production --non-interactive

# View specific build
eas build:view <build-id> --json
```

---

## Device Log Capture (for debugging)

```bash
# Install libimobiledevice if not present
brew install libimobiledevice

# Capture logs from connected iPhone
idevicesyslog > /tmp/device-logs.txt &
# Launch app, wait 30 seconds, then kill the process

# Search for relevant logs
grep -i "tuto\|react\|hermes\|error\|crash" /tmp/device-logs.txt
```

---

## Key Dependencies to Watch

| Package | Version | Risk |
|---------|---------|------|
| `@sentry/react-native` | ~6.20.0 | HIGH - Native init |
| `expo-firebase-analytics` | ^8.0.0 | MEDIUM - Native module |
| `react-native-gesture-handler` | (latest) | LOW - Must be first import |
| `expo-splash-screen` | ^31.0.13 | MEDIUM - Controls splash |
| `expo` | ~54.0.0 | LOW - Core SDK |
| `react-native` | 0.81.4 | LOW - Core framework |

---

## Contact / Context

- **Project:** Tuto - Bilingual Education App
- **Platform:** iOS (React Native / Expo)
- **Build System:** EAS Build
- **Distribution:** TestFlight / App Store
- **Last Working Build:** Unknown (first production attempt with these changes)

---

## Next Session Checklist

1. [ ] Switch to branch `18Jan26BuildIssueTrial`
2. [ ] Disable New Architecture in app.json
3. [ ] Update Info.plist RCTNewArchEnabled to false
4. [ ] Run `npx expo prebuild --platform ios`
5. [ ] Fix Podfile (add `use_modular_headers!`)
6. [ ] Run `pod install` in ios directory
7. [ ] Update build number to 16
8. [ ] Run EAS production build
9. [ ] Test on TestFlight
10. [ ] If still broken, try Step 2 (disable Sentry)
