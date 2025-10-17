# Tuto Web Dashboard - Setup Instructions

**Project**: Tuto Web Dashboard  
**Firebase Project**: `tuto1-73fc4`  
**Status**: Infrastructure ready, needs Firebase credentials

---

## ✅ What's Already Done

1. ✅ Firebase configuration module created
2. ✅ Backend API client ready  
3. ✅ Authentication system implemented
4. ✅ TypeScript types defined
5. ✅ Testing page created
6. ✅ Documentation complete

**Your backend is already configured and working!** The mobile app uses Firebase project `tuto1-73fc4` with Functions deployed to `asia-southeast1`.

---

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Firebase Web Credentials

1. Go to [Firebase Console](https://console.firebase.google.com/project/tuto1-73fc4/settings/general)
2. Scroll down to "Your apps" section
3. Look for a **Web app** icon `</>`
   - If you see one, click on it to view config
   - If not, click "Add app" → Select Web → Register app

4. You'll see a `firebaseConfig` object like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "tuto1-73fc4.firebaseapp.com",
  projectId: "tuto1-73fc4",
  storageBucket: "tuto1-73fc4.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:...",
  measurementId: "G-..."
};
```

---

### Step 2: Create `.env.local` File

Create a new file: `apps/dashboard/.env.local` with the following values (pre-filled from your provided config):

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAcQgVGfjnMaPeUKGzyQ8WJwjkH_qDIkCg
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tuto1-73fc4.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuto1-73fc4
# Important: use bucket name (appspot.com), not the HTTPS storage domain
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tuto1-73fc4.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=462440753838
NEXT_PUBLIC_FIREBASE_APP_ID=1:462440753838:web:6e472d0bf2ced0636a9b3f
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-WWYQC8Y7YV

# Firebase Functions Configuration (Already deployed)
NEXT_PUBLIC_FUNCTIONS_REGION=asia-southeast1

# Environment
NEXT_PUBLIC_APP_ENVIRONMENT=development

# App Info
NEXT_PUBLIC_APP_NAME=Tuto Dashboard
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Note**: Don't worry about Airtable credentials - they're stored securely in Firebase Functions (server-side only).

---

### Step 3: Test Connection

```bash
# Install dependencies
cd apps/dashboard
npm install

# Test backend connectivity (optional - verify Functions are working)
node scripts/test-connection.js

# Start development server
npm run dev

# Open in browser
# Go to: http://localhost:3000/setup
# Click "Run All Tests"
```

---

## 🧪 Testing Backend (No Credentials Needed Yet)

Want to verify your backend is working before setting up the dashboard? Run this:

```bash
cd apps/dashboard
node scripts/test-connection.js
```

This tests:
- ✅ Firebase Functions API (asia-southeast1)
- ✅ Airtable connection via Functions
- ✅ Firebase Auth service

**Expected Output**:
```
✅ Backend API is reachable!
✅ Airtable connection successful!
✅ Firebase Auth service is reachable!

Tests Passed: 3/3
🎉 Your backend is configured and working!
```

---

## 📋 Verification Checklist

After setup, verify everything works:

### Backend Tests (No auth needed)
```bash
cd apps/dashboard
node scripts/test-connection.js
```
Expected: ✅ All 3 tests pass

### Dashboard Tests (Requires .env.local)
```bash
cd apps/dashboard
npm run dev
```

Then open: http://localhost:3000/setup

Click "Run All Tests" - all should be ✅ green

---

## 🔑 Known Credentials

**Airtable** (stored in Functions config - server-side):
- Base ID: `app34330Do0nm4qvM`
- API Key: Securely stored in Firebase Functions

**Firebase**:
- Project ID: `tuto1-73fc4`
- Region: `asia-southeast1`
- Web credentials: Get from console (see Step 1)

---

## 🎯 Architecture

```
Dashboard (Browser)
  ↓ [Firebase Auth Token]
  ↓
Firebase Functions (asia-southeast1)
  ↓ [Airtable PAT - server-side]
  ↓
Airtable (app34330Do0nm4qvM)
```

**Security**: Client never has Airtable credentials - always proxied through Functions!

---

## ❓ Troubleshooting

### "Firebase initialization failed"
- Check `.env.local` has all NEXT_PUBLIC_FIREBASE_* variables
- Verify values match Firebase Console exactly
- Restart dev server after editing .env.local

### "Backend API unreachable"
- Check internet connection
- Verify Functions are deployed: `firebase deploy --only functions`
- Check project ID in URL matches: `tuto1-73fc4`

### "Airtable connection failed"
- Functions need Airtable config: `firebase functions:config:set airtable.pat="..." airtable.base="..."`
- Or set environment variables in Firebase Console
- Mobile app should already have this configured

### "Tests running but no auth"
- Expected! Auth setup comes after connectivity tests
- You can test backend without authentication
- Authentication needed for protected routes

---

## 📝 Next Steps After Setup

Once all tests pass:

1. **Create Login Page**
   - Build UI with email/password form
   - Connect to AuthContext
   - Test sign in flow

2. **Create Dashboard Layout**
   - Add navigation sidebar
   - Create header with user menu
   - Set up routing

3. **Start Building Features**
   - Teachers management
   - Students management  
   - Bookings pipeline
   - Per PRD requirements

---

## 📚 Additional Resources

- **Progress Tracker**: `WEB_DASHBOARD_PROGRESS.md`
- **Session Notes**: `WEB_DASHBOARD_CHAT_SUMMARY.md`
- **Features Checklist**: `WEB_DASHBOARD_FEATURES_CHECKLIST.md`
- **Firebase Console**: https://console.firebase.google.com/project/tuto1-73fc4
- **Functions**: https://console.firebase.google.com/project/tuto1-73fc4/functions

---

## 🆘 Need Help?

1. **Check test output** - errors are descriptive
2. **Review setup steps** - make sure all steps completed
3. **Check Firebase Console** - verify web app is registered
4. **Check Functions logs** - `firebase functions:log`

---

**Ready to start?** Get your Firebase web credentials (Step 1) and let's test the connection!

