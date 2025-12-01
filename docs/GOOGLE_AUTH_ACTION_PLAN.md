# Google Authentication - Action Plan

**Date**: November 10, 2025  
**Issue**: Google Sign-In failing with Error 400  
**Time to Fix**: 5-10 minutes  
**Status**: Ready to fix - follow steps below

---

## 🎯 What Was Done

I've analyzed the Google authentication issue and implemented:

1. ✅ **Enhanced debugging** - Added detailed logs to AuthUnifiedScreen
2. ✅ **Better error messages** - User-friendly messages explaining the issue
3. ✅ **Diagnostic scripts** - Two scripts to help identify problems
4. ✅ **Comprehensive guides** - Three documentation files with solutions
5. ✅ **Expo account detection** - App now checks if you're using @anonymous

---

## 🚀 What You Need to Do Now

### Option 1: Quick Fix (5 minutes) - RECOMMENDED

Follow this guide step by step:
```
docs/GOOGLE_AUTH_QUICK_FIX.md
```

**Summary**:
1. Login to Expo (if not already)
2. Get your Expo username
3. Add redirect URI to Google Cloud Console
4. Restart app and test

This is the fastest way to get Google Sign-In working.

---

### Option 2: Diagnostic Approach (10 minutes)

If you want to understand what's wrong first:

**Step 1**: Run diagnostic
```bash
npm run diagnose:google-auth
```

**Step 2**: Run verification
```bash
npm run verify:google-oauth
```

**Step 3**: Follow the output instructions

**Step 4**: Read the comprehensive guide
```
docs/GOOGLE_AUTH_FIX_GUIDE.md
```

---

## 🔍 Understanding the Problem

### Root Cause

Google OAuth requires a "redirect URI" - a URL where Google sends users after they sign in. For Expo apps, this URL format is:

```
https://auth.expo.io/@YOUR_EXPO_USERNAME/YOUR_APP_SLUG
```

**For your app**:
- Your Expo username: `?` (you need to find this)
- App slug: `tuto` (from app.json)
- Expected URI: `https://auth.expo.io/@YOUR_USERNAME/tuto`

**The problem**: This URI is not configured in your Google Cloud Console OAuth client, so Google blocks the sign-in with Error 400.

### Why expo-auth-session?

The previous session used `expo-auth-session` which is good for development but requires:
- A real Expo account (not @anonymous)
- Proper Google Cloud Console configuration

For production apps, a native Google Sign-In SDK would be better (see Solution 2 in the fix guide).

---

## 📋 Files Created/Modified

### New Documentation:
1. `docs/GOOGLE_AUTH_QUICK_FIX.md` - Quick 5-minute fix guide
2. `docs/GOOGLE_AUTH_FIX_GUIDE.md` - Comprehensive guide with 3 solutions
3. `docs/GOOGLE_AUTH_ACTION_PLAN.md` - This file

### New Scripts:
1. `scripts/diagnose-google-auth.js` - Diagnose configuration issues
2. `scripts/verify-google-oauth.js` - Verify all settings are correct

### Modified Files:
1. `src/screens/AuthUnifiedScreen.tsx` - Added debugging and better errors
2. `package.json` - Added diagnostic scripts

---

## 🎯 Next Steps (Choose One)

### If you want it working NOW:
→ Follow `docs/GOOGLE_AUTH_QUICK_FIX.md`

### If you want to understand the issue first:
→ Run `npm run verify:google-oauth`
→ Then follow `docs/GOOGLE_AUTH_FIX_GUIDE.md`

### If you want a production-ready solution:
→ Read `docs/GOOGLE_AUTH_FIX_GUIDE.md` - Solution 2 (Native SDK)

---

## 🔧 Testing After Fix

Once you've configured Google Cloud Console:

1. **Restart Expo**:
   ```bash
   npx expo start --clear
   ```

2. **Open the app** and check terminal logs for:
   ```
   🔍 Google Auth Configuration:
   ═══════════════════════════════════════════
   Expo Owner: @your-username  ← Should be your real username
   Expected Redirect URI: https://auth.expo.io/@your-username/tuto
   ```

3. **Click "Continue with Google"**

4. **Expected flow**:
   - Browser window opens
   - Google sign-in page appears
   - Sign in with Google account
   - Browser redirects back to app
   - Success alert appears
   - Navigate to RoleSelection screen

---

## ❓ Common Questions

### Q: Why not use a simpler approach?

**A**: Google OAuth has strict security requirements. The expo-auth-session approach is actually the simplest for Expo apps. The alternative (native SDK) requires building a standalone app and more complex configuration.

### Q: Will this work in production?

**A**: For development with Expo Go, yes. For production apps, you should:
1. Build a standalone app
2. Use the native Google Sign-In SDK
3. Create separate iOS and Android OAuth clients

See Solution 2 in the fix guide for details.

### Q: Can I skip Google Sign-In?

**A**: Yes! Email/password authentication is already working perfectly. Google Sign-In is optional - it just provides a better user experience.

### Q: What if I don't have an Expo account?

**A**: Create one:
```bash
npx expo register
```

It's free and takes 2 minutes.

---

## 📞 Support

If you get stuck:

1. **Check the logs** - The terminal shows helpful debugging info
2. **Run diagnostics** - `npm run verify:google-oauth`
3. **Read the guides** - Start with `GOOGLE_AUTH_QUICK_FIX.md`
4. **Use email/password** - Already working, no configuration needed

---

## ✅ Success Indicators

You'll know it's fixed when:

1. ✅ `npx expo whoami` shows a real username (not @anonymous)
2. ✅ Google Cloud Console has the correct redirect URI
3. ✅ Terminal logs show your Expo username (not @anonymous)
4. ✅ Clicking "Continue with Google" opens a browser
5. ✅ After signing in, you're redirected back to the app
6. ✅ Success alert appears and you navigate to RoleSelection

---

## 🎯 Recommended Path

**For development (now)**:
1. Follow `docs/GOOGLE_AUTH_QUICK_FIX.md`
2. Get Google Sign-In working with expo-auth-session
3. Continue development

**For production (later)**:
1. Build standalone app
2. Implement native Google Sign-In SDK
3. Better UX and reliability

---

**Time Estimate**:
- Quick fix: 5 minutes
- Full understanding: 15 minutes
- Production setup: 1-2 hours

**Current Status**: All tools and documentation ready. You just need to configure Google Cloud Console redirect URI.

**Blocking**: User action required (Google Cloud Console configuration)










