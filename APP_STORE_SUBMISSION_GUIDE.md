# App Store Submission Guide - Action Plan
**Target: Launch ASAP for school onboarding tomorrow**

## ✅ PRE-FLIGHT CHECKLIST (Do First)

### 1. Verify Apple Developer Account (5 mins)
- [ ] Go to https://developer.apple.com
- [ ] Confirm enrollment is ACTIVE (not pending)
- [ ] Confirm payment of $99/year processed
- [ ] Save your **Apple ID** email (you'll need it)

### 2. Install Required Tools (5 mins)
```bash
# Install EAS CLI globally
npm install -g eas-cli

# Login to Expo account
eas login

# Verify Xcode Command Line Tools
xcode-select --install
```

### 3. Configure Apple Developer Credentials
```bash
# This will prompt you to login with your Apple ID
eas credentials
```

---

## 🚀 PHASE 1: BUILD THE APP (30-60 mins)

### Step 1: Update App Configuration
Your `app.json` needs these additions for App Store:

**Required Changes to `app.config.js`:**

```javascript
ios: {
  supportsTablet: true,
  bundleIdentifier: 'com.tutoapp.mobile',
  buildNumber: '1', // Add this
  infoPlist: {
    NSPhotoLibraryUsageDescription: 'We need access to your photo library to let you attach images to posts.',
    NSCameraUsageDescription: 'We need access to your camera to let you capture photos and videos for posts.',
    NSLocationWhenInUseUsageDescription: 'We use your location to show nearby teachers and map distance.',
    PHPhotoLibraryPreventAutomaticLimitedAccessAlert: false,
  },
}
```

### Step 2: Create Production Build
```bash
# This will take 15-30 minutes
eas build --platform ios --profile production

# You'll be prompted:
# 1. "Would you like to automatically create an App Store profile?" → YES
# 2. Enter your Apple ID
# 3. App-specific password (will guide you to create one)
```

**While build is running, continue to Phase 2!**

---

## 📝 PHASE 2: APP STORE CONNECT SETUP (20 mins)

### Step 1: Create New App
1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **+ (Plus icon)** → **New App**
3. Fill in:
   - **Platform**: iOS
   - **Name**: `Tuto` (or `Tuto - Connect with Teachers`)
   - **Primary Language**: English (U.S.)
   - **Bundle ID**: Select `com.tutoapp.mobile` (auto-populated)
   - **SKU**: `tuto-ios-001`
   - **User Access**: Full Access (default)

### Step 2: App Information
Navigate to **App Information** section:

**Category**
- Primary: Education
- Secondary: Social Networking

**Content Rights**
- [ ] Does NOT contain third-party content

**Age Rating**
- Click **Edit**
- Answer questionnaire honestly (likely "4+")

### Step 3: Pricing and Availability
- **Price**: Free
- **Availability**: Vietnam (or Worldwide)

### Step 4: App Privacy (CRITICAL)
Click **App Privacy** → **Get Started**

**Data Collection:**
1. **Contact Info** → YES
   - Email Address (for account creation)
   - Used for: App functionality, Account management
   - Linked to user: YES

2. **Location** → YES
   - Precise Location
   - Used for: App functionality (finding nearby teachers)
   - Linked to user: YES

3. **User Content** → YES
   - Photos (from image picker)
   - Used for: App functionality (profile pictures, posts)
   - Linked to user: YES

4. **Privacy Policy URL**:
   - You need to host `legal/privacy-policy.md` online
   - Options:
     - Quick: Create a Notion page and publish it
     - Better: Host on your website/domain
   - Example: `https://yourwebsite.com/privacy-policy`

---

## 📱 PHASE 3: PREPARE SCREENSHOTS (30 mins)

### Required Screenshot Sizes
You need screenshots for **iPhone 6.7"** (iPhone 14 Pro Max size):
- **1290 x 2796 pixels** (3-10 screenshots)

### Quick Method Using iOS Simulator:
```bash
# Open simulator with correct size
open -a Simulator

# In Simulator menu:
# Hardware → Device → iPhone 15 Pro Max
# Then launch your app and take screenshots (Cmd+S)
```

### What to Screenshot:
1. **Onboarding/Welcome screen**
2. **Map view with nearby teachers**
3. **Teacher profile view**
4. **Student learning dashboard** (if applicable)
5. **Parent dashboard** (if applicable)

### Screenshot Guidelines:
- ✅ Show REAL UI (not mockups)
- ✅ Remove any "test" data
- ✅ Use clean, representative content
- ❌ No "Coming Soon" text
- ❌ No marketing fluff like "#1 App"

---

## 📋 PHASE 4: VERSION INFORMATION (15 mins)

In App Store Connect, go to **Version Information**:

### App Description (MAX 4000 chars)
```
Tuto connects students and parents with qualified teachers in Vietnam. 

FEATURES:
• Discover nearby teachers using interactive map
• Browse teacher profiles with qualifications and reviews
• View detailed teaching specializations and experience
• Direct messaging with teachers
• Schedule management for lessons
• Safe and secure platform for educational connections

FOR STUDENTS:
Find the perfect teacher for your learning needs, whether it's math, English, science, or any other subject.

FOR PARENTS:
Connect with trusted educators for your children. View teacher credentials, read reviews, and make informed decisions.

FOR TEACHERS:
Create your professional profile, showcase your expertise, and connect with students in your area.

100% FREE - No subscriptions, no hidden fees. Tuto is committed to making quality education accessible to everyone in Vietnam.
```

### Keywords (MAX 100 chars)
```
education,tutors,learning,students,teachers,vietnam,lessons,teaching
```

### Support URL
If you have a website: `https://yourwebsite.com/support`
If not, create a simple page or use: `https://github.com/yourusername/tuto-support`

### Marketing URL (Optional)
Leave empty for now

### Promotional Text (Optional, 170 chars)
```
Connect with qualified teachers in your area. Find the perfect tutor for any subject. 100% free for students, parents, and teachers.
```

---

## 🔍 PHASE 5: APP REVIEW INFORMATION (10 mins)

### Demo Account (if login is required)
If your app REQUIRES login to use:
- [ ] Username: `demo@tutoapp.com` (or create a test account)
- [ ] Password: `Demo123!`
- [ ] Instructions: "Login with provided credentials to explore the app"

### Notes for Reviewer
```
This is a free education platform connecting students, parents, and teachers in Vietnam.

KEY POINTS:
- 100% free to use - no payments or subscriptions
- Location services are used to show nearby teachers on a map
- Users can create accounts as Student, Parent, or Teacher
- All content is user-generated
- No external payment systems
- Early-stage app serving local Vietnamese community

TEST ACCOUNT:
[Provide demo credentials here if needed]

CONTACT:
For any questions during review, please contact: your-email@example.com
```

### Contact Information
- [ ] Your name
- [ ] Your phone number (use actual number)
- [ ] Your email

---

## 🎬 PHASE 6: UPLOAD BUILD & SUBMIT (15 mins)

### Step 1: Wait for Build to Complete
Check build status:
```bash
eas build:list
```
Or check: https://expo.dev/accounts/[your-account]/projects/tuto/builds

### Step 2: Submit Build to App Store Connect

**Option A: Automatic (Recommended)**
```bash
eas submit --platform ios --latest
```

**Option B: Manual**
1. Download `.ipa` file from Expo dashboard
2. Use **Transporter** app (pre-installed on Mac)
3. Drag and drop `.ipa` file
4. Wait for upload to complete

### Step 3: Select Build in App Store Connect
1. Go to your app in App Store Connect
2. Scroll to **Build** section
3. Click **+ (Plus icon)**
4. Select the build you just uploaded
5. Wait for processing (5-30 mins)

### Step 4: Fill in "What's New in This Version"
```
Initial release of Tuto!

Connect with qualified teachers in your area. Whether you're a student looking for help, a parent seeking tutors, or a teacher wanting to reach more students, Tuto makes educational connections simple and free.

Features:
- Interactive map to find nearby teachers
- Detailed teacher profiles
- Direct messaging
- Free for everyone
```

### Step 5: Upload Screenshots
1. In **App Store Connect** → **App Store** tab
2. Scroll to **App Preview and Screenshots**
3. Under **iPhone 6.7"**, click the **+** to add screenshots
4. Upload your 3-10 screenshots in order

### Step 6: Submit for Review
1. Click **Add for Review** (top right)
2. Review the **App Store Version** page
3. Check all information is correct
4. Click **Submit to App Review**

---

## ⏰ PHASE 7: WAIT FOR REVIEW (24-72 hours)

### What Happens Next:
1. **Waiting for Review** (usually 24-48 hours)
2. **In Review** (1-4 hours)
3. **Pending Developer Release** OR **Ready for Sale**

### Common Rejection Reasons & Fixes:

**1. Missing Privacy Policy**
- Fix: Add valid URL in App Privacy section

**2. Crashes on Launch**
- Fix: Test thoroughly before submitting
- Provide demo account if login required

**3. Missing Functionality**
- Fix: Ensure all advertised features work

**4. Misleading Description**
- Fix: Don't promise features that don't exist yet

### If Rejected:
1. Read the rejection notice carefully
2. Fix the issue
3. Click **Submit for Review** again (no new build needed usually)

---

## 🎉 PHASE 8: GO LIVE!

Once approved:
- App will automatically go live (or click **Release** if manual)
- Share App Store link: `https://apps.apple.com/app/id[YOUR-APP-ID]`
- Monitor crashes via App Store Connect

---

## 🆘 TROUBLESHOOTING

### Build Fails
```bash
# Clear cache and retry
eas build:clear-cache
eas build --platform ios --profile production --clear-cache
```

### "No suitable application records were found"
- Ensure bundle ID in `app.config.js` matches Apple Developer Portal
- Run: `eas build:configure`

### "Invalid Provisioning Profile"
```bash
# Reset credentials
eas credentials -p ios
# Select: Remove all credentials
# Then rebuild
```

### App Store Connect Upload Fails
- Use **Transporter** app instead
- Check `.ipa` file isn't corrupted
- Verify Apple ID has App Store Connect access

---

## 📞 EMERGENCY CONTACTS

**Expo Support:**
- https://expo.dev/support

**Apple Developer Support:**
- https://developer.apple.com/support/
- Phone: 1-800-633-2152 (US)

**Common Issues Forum:**
- https://forums.expo.dev

---

## ✅ FINAL CHECKLIST BEFORE SUBMISSION

- [ ] App builds successfully via EAS
- [ ] Tested on real iPhone device
- [ ] No crashes on launch
- [ ] All core features work (map, profiles, messaging)
- [ ] Screenshots uploaded (3-10 images)
- [ ] Privacy policy URL added and accessible
- [ ] App description written (no future promises)
- [ ] Demo account created (if login required)
- [ ] Contact information filled
- [ ] Build uploaded to App Store Connect
- [ ] "What's New" section filled
- [ ] All sections have green checkmarks in App Store Connect

---

## ⚡ SPEED RUN (Absolute Minimum to Launch)

If you're in a rush, do this BARE MINIMUM:

1. `eas build --platform ios --profile production` (30 mins)
2. Create app in App Store Connect (5 mins)
3. Upload 3 screenshots (10 mins)
4. Add privacy policy URL (2 mins)
5. Fill app description (5 mins)
6. `eas submit --platform ios --latest` (10 mins)
7. Select build and submit (5 mins)

**Total: ~90 minutes of actual work**

Then wait 24-72 hours for review.

---

## 📧 NEED HELP?

If you get stuck at any step, message me with:
1. Which step you're on
2. The exact error message
3. Screenshot if applicable

Good luck! 🚀
