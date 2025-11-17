# Google Authentication Fix Guide
**Last Updated**: November 10, 2025

## 🔍 Problem Summary

Google Sign-In on mobile app fails with:
```
Error 400: invalid_request
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
```

## 🎯 Root Cause

The current implementation uses `expo-auth-session` which requires:
1. Expo account (can't use @anonymous)
2. Proper redirect URI configured in Google Cloud Console
3. The redirect URI format: `https://auth.expo.io/@YOUR_USERNAME/tuto`

**The issue**: The redirect URI in Google Cloud Console doesn't match your Expo account username.

---

## ✅ Solution 1: Fix expo-auth-session Configuration (Quick Fix)

### Step 1: Find Your Expo Username

```bash
npx expo whoami
```

**Possible outputs**:
- `Not logged in` → You need to log in first
- `@anonymous` → You need to create an Expo account
- `@your-username` → This is your username!

### Step 2: Create/Login to Expo Account

If not logged in:
```bash
npx expo login
```

Or create account:
```bash
npx expo register
```

### Step 3: Configure Google Cloud Console

1. **Go to Google Cloud Console**:
   ```
   https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4
   ```

2. **Find your OAuth 2.0 Client ID**:
   - Look for: `462440753838-j62a8l9lqja66us62ghoirf3c9ii41qo`
   - Click the pencil icon to EDIT

3. **Add Authorized JavaScript origins**:
   - Click "+ ADD URI"
   - Enter: `https://auth.expo.io`
   - Click outside the input to confirm

4. **Add Authorized redirect URIs**:
   - Click "+ ADD URI"
   - Enter: `https://auth.expo.io/@YOUR_USERNAME/tuto`
     - Replace `YOUR_USERNAME` with your actual Expo username from Step 1
     - Example: `https://auth.expo.io/@johnsmith/tuto`
   - **IMPORTANT**: No trailing slash!

5. **Save**:
   - Scroll to bottom
   - Click "SAVE" button
   - Wait 1-2 minutes for changes to propagate

### Step 4: Update app.config.js (if needed)

If you're not using @anonymous, update `app.config.js`:

```javascript
module.exports = {
  expo: {
    // ... other config ...
    owner: 'YOUR_EXPO_USERNAME', // Add this line
    slug: 'tuto',
    // ... rest of config ...
  },
};
```

### Step 5: Clear Cache and Restart

```bash
npx expo start --clear
```

### Step 6: Test

1. Open app
2. Click "Continue with Google"
3. Should open Google sign-in
4. Sign in with your Google account
5. Should redirect back to app successfully!

---

## ✅ Solution 2: Switch to Native Google Sign-In SDK (Recommended for Production)

**Pros**:
- Better UX (native Google prompt)
- No redirect URI complexities
- Works offline
- More reliable

**Cons**:
- Requires standalone app build (not Expo Go)
- More complex initial setup
- Need Google Services files

### Implementation Steps:

#### 1. Install Package

```bash
npm install @react-native-google-signin/google-signin --legacy-peer-deps
```

#### 2. Create iOS OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4
2. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
3. Application type: **iOS**
4. Name: "Tuto iOS App"
5. Bundle ID: `com.tutoapp.mobile` (from app.json)
6. Click "CREATE"
7. **Save the Client ID** → Add to .env as `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`

#### 3. Create Android OAuth Client

1. Go to: https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4
2. Click "+ CREATE CREDENTIALS" → "OAuth 2.0 Client ID"
3. Application type: **Android**
4. Name: "Tuto Android App"
5. Package name: `com.tutoapp.mobile`
6. Get SHA-1 fingerprint:
   ```bash
   # For debug build
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
   
   # Copy the SHA-1 fingerprint
   ```
7. Paste SHA-1 fingerprint
8. Click "CREATE"
9. **Save the Client ID** → Add to .env as `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`

#### 4. Update .env

```env
# Existing
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=462440753838-j62a8l9lqja66us62ghoirf3c9ii41qo.apps.googleusercontent.com

# Add these new ones
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_IOS_CLIENT_ID.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com
```

#### 5. Update app.config.js

```javascript
module.exports = {
  expo: {
    // ... existing config ...
    plugins: [
      'expo-image-picker',
      '@react-native-google-signin/google-signin', // Add this
    ],
    // ... rest of config ...
  },
};
```

#### 6. Update AuthUnifiedScreen.tsx

Replace the current Google Sign-In implementation with:

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// In component
useEffect(() => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: true,
  });
}, []);

const handleGoogleSignIn = async () => {
  try {
    setLoading(true);
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    
    // Get ID token
    const { idToken } = await GoogleSignin.getTokens();
    
    // Sign in to Firebase
    const auth = getAuthSafe();
    const credential = GoogleAuthProvider.credential(idToken);
    const userCredential = await signInWithCredential(auth, credential);
    
    // Success!
    const userData = {
      id: userCredential.user.uid,
      name: userCredential.user.displayName || '',
      email: userCredential.user.email || '',
      type: 'parent' as const,
    };
    
    await setUserData(userData);
    navigation.navigate('RoleSelection');
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    Alert.alert('Sign-In Failed', 'Could not sign in with Google');
  } finally {
    setLoading(false);
  }
};
```

#### 7. Build Standalone App

```bash
# Build development client
npx expo prebuild
npx expo run:ios
# or
npx expo run:android
```

---

## 🚀 Solution 3: Hybrid Approach (Development + Production)

Use expo-auth-session for development (Expo Go), but native SDK for production builds.

Create a wrapper:

```typescript
// src/services/googleAuth.ts
import { Platform } from 'react-native';
import Constants from 'expo-constants';

export const isStandaloneBuild = Constants.appOwnership === 'standalone';

export const signInWithGoogle = async () => {
  if (isStandaloneBuild) {
    // Use native SDK
    return signInWithGoogleNative();
  } else {
    // Use expo-auth-session
    return signInWithGoogleExpo();
  }
};
```

---

## 🔧 Debugging Tools

### Check Current Configuration

```bash
node scripts/diagnose-google-auth.js
```

### View Expo Configuration

In AuthUnifiedScreen.tsx, add:

```typescript
useEffect(() => {
  console.log('📱 Expo Config:', {
    owner: Constants.expoConfig?.owner,
    slug: Constants.expoConfig?.slug,
    scheme: Constants.expoConfig?.scheme,
    googleClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.substring(0, 20),
  });
}, []);
```

### Test Redirect URI

The redirect URI should be:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/tuto
```

You can test if it's accessible:
```bash
curl -I https://auth.expo.io/@YOUR_USERNAME/tuto
```

---

## 📋 Checklist

### For expo-auth-session (Quick Fix):
- [ ] Expo account created and logged in
- [ ] Expo username identified (not @anonymous)
- [ ] Google Cloud Console OAuth client edited
- [ ] JavaScript origin added: `https://auth.expo.io`
- [ ] Redirect URI added: `https://auth.expo.io/@USERNAME/tuto`
- [ ] Changes saved in Google Cloud Console
- [ ] Waited 1-2 minutes for propagation
- [ ] App restarted with `--clear` flag
- [ ] Tested Google sign-in

### For Native SDK (Production):
- [ ] Package installed
- [ ] iOS OAuth client created
- [ ] Android OAuth client created
- [ ] SHA-1 fingerprint added
- [ ] Environment variables added
- [ ] app.config.js updated
- [ ] AuthUnifiedScreen.tsx updated
- [ ] Standalone app built
- [ ] Tested on real device

---

## ❓ Common Issues

### Issue: "Error 400: redirect_uri_mismatch"
**Cause**: Redirect URI in Google Cloud doesn't match  
**Fix**: Double-check the URI exactly matches `https://auth.expo.io/@username/tuto`

### Issue: "Not logged in" when running `expo whoami`
**Cause**: No Expo account  
**Fix**: Run `npx expo login` or `npx expo register`

### Issue: "Cannot use @anonymous for OAuth"
**Cause**: Need a real Expo account  
**Fix**: Create an account with `npx expo register`

### Issue: "Google Sign-In canceled"
**Cause**: User canceled the flow  
**Fix**: This is normal, no action needed

### Issue: Works in browser but not in app
**Cause**: Different redirect URIs  
**Fix**: Make sure mobile redirect URI is configured separately

---

## 📚 References

- [Expo Google Authentication](https://docs.expo.dev/guides/google-authentication/)
- [Firebase Auth with Google](https://firebase.google.com/docs/auth/web/google-signin)
- [Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [React Native Google Sign-In](https://github.com/react-native-google-signin/google-signin)

---

**Recommendation**: For immediate fix, use Solution 1 (expo-auth-session). For production app, migrate to Solution 2 (Native SDK) for better UX and reliability.





