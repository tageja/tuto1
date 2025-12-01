# Current Errors & Issues - November 7, 2025

**Last Updated**: November 7, 2025, 3:00 PM  
**Overall Health**: 🟡 Good (1 blocking issue for Google login)

---

## 🔴 Critical Issues (1)

### 1. Google OAuth Redirect URI Not Configured

**Status**: BLOCKING  
**Component**: Mobile App - Google Sign-In  
**Impact**: Google sign-in fails with Error 400  
**User Impact**: Cannot sign in with Google on mobile (email/password works fine)

**Error Message**:
```
Access blocked: Authorization Error
Error 400: invalid_request
You can't sign in to this app because it doesn't comply with Google's OAuth 2.0 policy
```

**Root Cause**:
Google Cloud Console OAuth 2.0 client ID is missing authorized redirect URI for Expo's auth proxy.

**Location**: Google Cloud Console > APIs & Services > Credentials

**OAuth Client ID**: `462440753838-j62a8l9lqja66us62ghoirf3c9ii41qo.apps.googleusercontent.com`

**Required Fix**:
Add these to the OAuth client configuration:

**Authorized JavaScript origins:**
```
https://auth.expo.io
```

**Authorized redirect URIs:**
```
https://auth.expo.io/@anonymous/tuto
```

**How to Fix**:
1. Go to: https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4
2. Click on OAuth 2.0 Client ID: `462440753838-j62a8l9lqja66us62ghoirf3c9ii41qo`
3. Scroll to "Authorized JavaScript origins" section
4. Click "+ ADD URI", enter: `https://auth.expo.io`
5. Scroll to "Authorized redirect URIs" section
6. Click "+ ADD URI", enter: `https://auth.expo.io/@anonymous/tuto` (no trailing slash!)
7. Click "SAVE" button at bottom
8. Wait 1-2 minutes for changes to propagate
9. Restart mobile app: `npx expo start --clear`
10. Test Google sign-in

**Owner**: User (requires Google Cloud Console access)  
**ETA**: 5 minutes after configuration  
**Priority**: High (but not critical - email/password works)

---

## 🟡 Warnings (3)

### 1. nightlyBackup Function Deployment Failed

**Status**: Non-critical  
**Component**: Firebase Functions - Scheduled Backups  
**Error**: Google Cloud Run internal error

**Error Message**:
```
Request to cloudfunctions.googleapis.com had HTTP Error: 500
Could not create Cloud Run service nightlybackup
The service has encountered an internal error
```

**Impact**: Automated nightly backups not running  
**Workaround**: Can trigger backups manually if needed  
**Cause**: Google Cloud infrastructure issue (not our code)

**Fix**:
```bash
cd functions
firebase deploy --only functions:nightlyBackup
```

**Owner**: Can retry anytime  
**Priority**: Low (backups not critical for development)

---

### 2. expo-firebase-analytics Module Not Found

**Status**: Warning only  
**Component**: Mobile App - Analytics

**Warning Messages**:
```
No native ExpoFirebaseCore module found
No native ExpoFirebaseAnalytics module found
```

**Impact**: None (analytics optional, app works fine)  
**Cause**: expo-firebase-analytics not properly linked or needs rebuild

**Potential Fixes**:
```bash
# Option 1: Remove if not needed
npm uninstall expo-firebase-analytics

# Option 2: Rebuild with expo prebuild (production only)
npx expo prebuild
```

**Owner**: Optional cleanup  
**Priority**: Very Low

---

### 3. npm Audit Vulnerabilities

**Status**: Warning  
**Component**: Dependencies

**Details**:
```
18 vulnerabilities (12 moderate, 5 high, 1 critical)
```

**Impact**: Development only (likely in dev dependencies)  
**Cause**: Outdated transitive dependencies

**Fix**:
```bash
npm audit fix --legacy-peer-deps
# Or for breaking changes:
npm audit fix --force --legacy-peer-deps
```

**Owner**: Can address anytime  
**Priority**: Low (review before production)

---

## 🟢 Recently Resolved (6)

### 1. ✅ TypeScript Compilation Errors in Firebase Functions

**Was**: 6 errors blocking deployment  
**Fixed**: All errors resolved  
**Files**: payments.ts, bookings.ts, backups.ts, webhooks/payments.ts, airtable.ts, index.ts  
**Status**: RESOLVED

---

### 2. ✅ Airtable Initialization Error During Deployment

**Was**: "An API key is required to connect to Airtable"  
**Fixed**: Implemented lazy initialization with getAirtable()  
**File**: functions/src/v1/airtable.ts  
**Status**: RESOLVED

---

### 3. ✅ Firebase Admin Duplicate Initialization

**Was**: "The default Firebase app already exists"  
**Fixed**: Added check before initialization  
**File**: functions/src/index.ts  
**Status**: RESOLVED

---

### 4. ✅ React Version Mismatch in Mobile App

**Was**: "Incompatible React versions: 19.0.0 vs 19.1.0"  
**Fixed**: Updated all React packages to 19.1.0  
**Files**: package.json (root + workspaces)  
**Status**: RESOLVED

---

### 5. ✅ Mobile Login Translation Keys Showing

**Was**: UI showed "auth.createAccount" instead of "Create Account"  
**Fixed**: Added 40+ missing translation keys  
**File**: src/translations/index.ts  
**Status**: RESOLVED

---

### 6. ✅ Expo Environment Variables Not Loading

**Was**: Firebase config empty, Google client ID undefined  
**Fixed**: Created app.config.js with dotenv loading  
**File**: app.config.js  
**Status**: RESOLVED

---

## 📊 Error Breakdown by Component

### Firebase Functions: 🟢 HEALTHY
- Deployment: ✅ Success (39/40 functions)
- TypeScript: ✅ No errors
- Runtime: ✅ Working
- Issues: 1 function failed (nightlyBackup - Google Cloud issue)

### Mobile App: 🟡 MOSTLY HEALTHY
- UI: ✅ Working perfectly
- Email/Password Auth: ✅ Working
- Google Auth: ⏳ Needs OAuth config
- Translations: ✅ Complete
- Navigation: ✅ Working
- Issues: 1 OAuth configuration needed

### Web Dashboard: 🟢 HEALTHY
- All features: ✅ Working
- Firebase Functions: ✅ Deployed
- Google Auth: ✅ Working
- Issues: None

### Dependencies: 🟡 ACCEPTABLE
- React versions: ✅ Resolved
- Peer dependencies: ✅ Resolved
- Security: ⚠️ 18 vulnerabilities (low priority)

---

## 🔍 Debugging Commands

### Check Firebase Functions Status:
```bash
firebase functions:list
```

### Check Mobile App Logs:
```bash
npx expo start
# Then check terminal for errors
```

### Check Expo Account:
```bash
npx expo whoami
```

### Check Environment Variables:
```bash
# In mobile app, add to AuthUnifiedScreen:
console.log('Config:', Constants.expoConfig?.extra);
```

### Test Firebase Auth:
```bash
# In Firebase Console:
Authentication > Users
# Check if users are being created
```

---

## 📞 Support Resources

### Firebase Functions:
- Console: https://console.firebase.google.com/project/tuto1-73fc4/functions
- Logs: https://console.firebase.google.com/project/tuto1-73fc4/logs

### Google OAuth:
- Credentials: https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4
- Documentation: https://docs.expo.dev/guides/google-authentication/

### Expo:
- Project: https://expo.dev/@your-username/tuto
- Documentation: https://docs.expo.dev/

---

## 🎯 Quick Status Check

Run these to verify everything:

```bash
# 1. Check Firebase Functions are live
curl https://getschoolteachers-rop3t3qejq-as.a.run.app

# 2. Check Expo is running
npx expo start

# 3. Check environment variables loaded
# Open app, check logs for: "🔍 Checking Google config"
```

---

*This file tracks all active errors and their resolution status.*  
*Update this file as issues are resolved or new ones discovered.*











