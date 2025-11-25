# Google Auth Quick Fix - Step by Step

**Problem**: Google Sign-In failing with "Error 400: invalid_request"

**Time to Fix**: ~5 minutes

---

## 🚀 Quick Fix (3 Steps)

### Step 1: Find Your Expo Username (2 minutes)

Open terminal/command prompt and run:

```bash
npx expo whoami
```

**If you see**:
- `Not logged in` → Continue to Step 1a
- `@anonymous` → Continue to Step 1a
- `@your-username` → **Success!** Go to Step 2

#### Step 1a: Login to Expo

If you have an account:
```bash
npx expo login
```
Enter your username and password.

If you DON'T have an account:
```bash
npx expo register
```
Choose a username (remember this!) and create your account.

**After logging in**, run again:
```bash
npx expo whoami
```

You should see: `@your-username`

**✅ Write down your username**: `@______________`

---

### Step 2: Configure Google Cloud Console (2 minutes)

1. **Open Google Cloud Console**:
   - Click this link: https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4
   - You should see "APIs & Services > Credentials"

2. **Find your OAuth Client**:
   - Look for "OAuth 2.0 Client IDs" section
   - Find the one starting with: `462440753838-j62a8l9...`
   - Click the **pencil icon** (✏️) to edit

3. **Add JavaScript Origin**:
   - Scroll to "Authorized JavaScript origins"
   - Click "+ ADD URI"
   - Type: `https://auth.expo.io`
   - Click outside the box to confirm

4. **Add Redirect URI** (IMPORTANT!):
   - Scroll to "Authorized redirect URIs"
   - Click "+ ADD URI"
   - Type: `https://auth.expo.io/@YOUR_USERNAME/tuto`
     - Replace `YOUR_USERNAME` with your actual Expo username from Step 1
     - Example: If your username is `johnsmith`, use:
       ```
       https://auth.expo.io/@johnsmith/tuto
       ```
     - **NO trailing slash!**
   - Click outside the box to confirm

5. **Save Changes**:
   - Scroll to the bottom
   - Click the blue "SAVE" button
   - Wait for the success message

**Example Configuration**:
```
Authorized JavaScript origins:
✅ https://auth.expo.io

Authorized redirect URIs:
✅ https://auth.expo.io/@johnsmith/tuto  (your username here!)
```

---

### Step 3: Restart App and Test (1 minute)

1. **Stop the Expo server** (Ctrl+C in terminal)

2. **Clear cache and restart**:
   ```bash
   npx expo start --clear
   ```

3. **Test Google Sign-In**:
   - Open the app on your phone
   - Click "Continue with Google"
   - You should see a browser window open
   - Sign in with your Google account
   - Browser should redirect back to the app
   - **You're signed in!** 🎉

---

## ✅ Success Checklist

Before testing, verify:

- [ ] I ran `npx expo whoami` and got a real username (not @anonymous)
- [ ] I added `https://auth.expo.io` to JavaScript origins
- [ ] I added `https://auth.expo.io/@MY_USERNAME/tuto` to redirect URIs
- [ ] I replaced `MY_USERNAME` with my actual Expo username
- [ ] I saved changes in Google Cloud Console
- [ ] I restarted Expo with `--clear` flag

---

## 🐛 Still Not Working?

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI doesn't match

**Fix**: Double-check you entered the EXACT redirect URI:
```
https://auth.expo.io/@YOUR_EXPO_USERNAME/tuto
```

Common mistakes:
- ❌ `https://auth.expo.io/tuto` (missing username)
- ❌ `https://auth.expo.io/@anonymous/tuto` (using @anonymous)
- ❌ `https://auth.expo.io/@username/tuto/` (extra slash)
- ✅ `https://auth.expo.io/@johnsmith/tuto` (correct!)

### Error: "Not logged in"

**Problem**: Not logged into Expo

**Fix**:
```bash
npx expo login
# Enter your credentials
npx expo whoami
# Should show @your-username
```

### Error: Still getting 400

**Problem**: Changes haven't propagated

**Fix**:
1. Wait 2-3 minutes after saving in Google Cloud Console
2. Clear Expo cache: `npx expo start --clear`
3. Close and reopen the app completely

### Check Logs

When you click "Continue with Google", check the terminal logs:

**Good logs (working)**:
```
🔍 Google Auth Configuration:
═══════════════════════════════════════════
Expo Owner: @johnsmith
Expected Redirect URI: https://auth.expo.io/@johnsmith/tuto
```

**Bad logs (problem)**:
```
🔍 Google Auth Configuration:
═══════════════════════════════════════════
Expo Owner: @anonymous  ← PROBLEM!
```

---

## 📞 Need Help?

1. **Run diagnostic**:
   ```bash
   node scripts/diagnose-google-auth.js
   ```

2. **Check configuration**:
   - Open app and check terminal logs
   - Look for "Google Auth Configuration" section
   - Verify your Expo username shows correctly

3. **Read detailed guide**:
   - See `docs/GOOGLE_AUTH_FIX_GUIDE.md` for alternative solutions

---

## 🎯 What You're Fixing

The problem is that Google OAuth needs to know where to redirect users after they sign in. When using Expo, the redirect URL format is:

```
https://auth.expo.io/@YOUR_USERNAME/YOUR_APP_SLUG
```

For our app:
- `YOUR_USERNAME` = Your Expo account username
- `YOUR_APP_SLUG` = `tuto` (from app.json)

Google Cloud Console must have this EXACT URL configured, otherwise it blocks the sign-in with Error 400.

---

**Time to complete**: 5 minutes  
**Difficulty**: Easy  
**Cost**: Free  
**Result**: Google Sign-In working! 🚀









