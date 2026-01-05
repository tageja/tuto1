# 📱 Apple App Store Submission Checklist - Tuto Education Platform

**App Name:** Tuto Education Platform  
**Version:** 1.0.1  
**Bundle ID:** com.tutoapp.mobile  
**Target Date:** ASAP  
**Business Model:** Free (No Revenue)  
**Target Users:** Schools (Parents, Teachers, School Admins)

---

## ✅ CRITICAL REQUIREMENTS (Must Complete Before Submission)

### 🔴 1. Legal & Compliance Documents (REQUIRED)

#### ❌ Privacy Policy (MISSING - CRITICAL)
- **Status:** ⚠️ **URLs exist but pages are empty/placeholder**
- **Current URL:** https://tuto.edu/privacy (hardcoded in app)
- **Issue:** App links to privacy policy but content is "Content will be updated"
- **Action Required:**
  1. Create comprehensive Privacy Policy covering:
     - Data collection (photos, camera, location, student data)
     - FERPA compliance (student education records)
     - COPPA compliance (children under 13)
     - Data retention and deletion policies
     - School data isolation and security
     - Third-party services (Firebase, Airtable, Cloudinary)
     - Parental rights and controls
     - Contact information for privacy inquiries
  2. Host at accessible URL (https://tuto.edu/privacy OR https://yoursite.com/privacy)
  3. Update URLs in code:
     - `src/screens/settings/AboutAndLegalSettingsScreen.tsx:23`
     - `src/screens/settings/PrivacyDataSettingsScreen.tsx:21`

#### ❌ Terms of Service (MISSING - CRITICAL)
- **Status:** ⚠️ **URLs exist but pages are empty/placeholder**
- **Current URL:** https://tuto.edu/terms
- **Action Required:**
  1. Create Terms of Service covering:
     - User responsibilities and acceptable use
     - School account terms
     - Content ownership and licensing
     - Liability limitations
     - Dispute resolution
     - Termination conditions
     - Age requirements
  2. Host at accessible URL
  3. Update URLs in code (same files as above)

#### ❌ Data Retention Policy (OPTIONAL BUT RECOMMENDED)
- **Status:** Documentation exists but not published
- **Current URL:** https://tuto.edu/data-retention
- **Action:** Publish the existing `docs/data-retention.md` content

#### 📝 Support & Contact Information
- **Support Email:** support@tuto.edu (hardcoded in app)
- **Action Required:** Ensure this email is active and monitored
- **Alternative:** Create real support email or update to working email in:
  - `src/screens/settings/AboutAndLegalSettingsScreen.tsx:27`
  - `src/screens/settings/PrivacyDataSettingsScreen.tsx:24`

---

### 🔴 2. App Store Assets & Metadata (REQUIRED)

#### ❌ App Icon & Screenshots
- **Current Icon:** `assets/icon.png` exists ✅
- **Adaptive Icon:** `assets/adaptive-icon.png` exists ✅
- **Action Required:**
  1. ✅ App icon is ready
  2. ❌ **Create screenshots for App Store:**
     - 6.7" (iPhone 14 Pro Max): 1290 x 2796 pixels (at least 3-10 screenshots)
     - 5.5" (iPhone 8 Plus): 1242 x 2208 pixels (at least 3-10 screenshots)
     - iPad Pro (12.9"): 2048 x 2732 pixels (at least 3-10 screenshots)
  3. ❌ **Screenshot content suggestions:**
     - School dashboard with activities
     - Parent view of child's attendance
     - Announcements and messages
     - Photo albums
     - Health records and medicine tracking
     - Homework assignments
     - Events calendar

#### ❌ App Store Listing Content
**Required text content:**

1. **App Name** (30 characters max)
   - Suggestion: "Tuto Education Platform"

2. **Subtitle** (30 characters max)
   - Suggestion: "School Communication Hub"

3. **Description** (4000 characters max)
   - **Suggested content:**
```
Tuto Education Platform connects schools, teachers, and families in one seamless app. Designed for modern education, Tuto helps parents stay connected with their child's school activities, health, homework, and progress.

KEY FEATURES FOR PARENTS:
• Real-time school announcements and updates
• Daily activity feeds from your child's school
• Attendance tracking and notifications
• Homework assignments and submissions
• Photo albums of school events
• Health records and medicine tracking
• Direct messaging with teachers and staff
• Event calendar and reminders
• Multi-child support for families

FOR TEACHERS & SCHOOL ADMINS:
• Easy communication with parents
• Create and share announcements
• Post daily activities with photos
• Track student attendance
• Assign and manage homework
• Share event photos and albums
• Send individual or group messages
• Manage student health records

SECURE & PRIVATE:
• School-level data isolation
• Role-based access controls
• FERPA-compliant student data handling
• Secure invitation system
• Privacy-first design

Perfect for:
- International schools
- Bilingual education programs
- Preschools and kindergartens
- Primary and secondary schools
- After-school programs

FREE FOR SCHOOLS:
Tuto is completely free for schools, teachers, and parents. No subscriptions, no hidden fees.

SUPPORT:
We're here to help! Contact us at support@tuto.edu
```

4. **Keywords** (100 characters max, comma-separated)
   - Suggestion: "school,education,parent,teacher,student,homework,attendance,communication,class"

5. **Promotional Text** (170 characters, updateable without new version)
   - Suggestion: "Stay connected with your child's school! Real-time updates, attendance tracking, homework, and direct messaging with teachers."

6. **What's New** (for version 1.0.1)
   - Suggestion: "Welcome to Tuto! Features include school announcements, daily activities, attendance tracking, homework management, photo albums, health records, and secure messaging."

---

### 🔴 3. Age Rating & Content (REQUIRED)

#### ✅ Age Rating Questionnaire Preparation
**Your app will likely receive: 4+ (Ages 4 and up)**

**Apple's questions and recommended answers:**

1. **Cartoon or Fantasy Violence:** None
2. **Realistic Violence:** None  
3. **Sexual Content or Nudity:** None
4. **Profanity or Crude Humor:** None
5. **Alcohol, Tobacco, or Drug Use:** None
6. **Mature/Suggestive Themes:** None
7. **Simulated Gambling:** None
8. **Horror/Fear Themes:** None
9. **Medical/Treatment Information:** None (or "Infrequent/Mild" if health records shown)
10. **Unrestricted Web Access:** No
11. **User Generated Content:** Yes ⚠️
12. **Location Services:** Yes (for maps feature)

**⚠️ Important:** Because you have User Generated Content (posts, comments, photos), you must:
- Have content moderation systems ✅ (you have blocking, reporting)
- Have clear community guidelines ✅ (you have content policy)
- Ability to report inappropriate content ✅
- Ability to block users ✅

---

### 🔴 4. Permissions & Privacy (REQUIRED)

#### ✅ Purpose Strings (Already Implemented)
Your app requests:
- ✅ **Camera:** "We need access to your camera to let you capture photos and videos for posts."
- ✅ **Photo Library:** "We need access to your photo library to let you attach images to posts."
- ✅ **Location:** "We use your location to show nearby teachers and map distance."

**⚠️ Apple may reject if purpose strings are too vague. Consider updating:**

**Recommended updates:**
```javascript
// In app.json ios.infoPlist:
NSCameraUsageDescription: "Take photos to share school activities, homework, and event updates with teachers and parents."
NSPhotoLibraryUsageDescription: "Select photos to share school activities, homework assignments, and event memories."
NSLocationWhenInUseUsageDescription: "Find nearby teachers and calculate distances to help connect families with educators." // OR REMOVE if not using in school context
```

#### ❌ App Privacy Details (REQUIRED in App Store Connect)
You must fill out the **App Privacy** section detailing what data you collect:

**Data Types You Collect:**
1. **Contact Info:**
   - Name (for user profiles)
   - Email address (for authentication)
   - Linked to user: Yes
   - Used for tracking: No

2. **Photos or Videos:**
   - Photos (user-uploaded content)
   - Linked to user: Yes
   - Used for tracking: No

3. **User Content:**
   - Photos/videos, messages, posts
   - Linked to user: Yes
   - Used for tracking: No

4. **Identifiers:**
   - User ID (Firebase UID, Airtable ID)
   - Linked to user: Yes
   - Used for tracking: No

5. **Location:**
   - Approximate location (for map features)
   - Linked to user: Yes
   - Used for tracking: No
   - **⚠️ Consider removing if not essential for school use**

6. **Usage Data:**
   - Analytics (Firebase Analytics, Sentry)
   - Linked to user: No
   - Used for tracking: Yes (for analytics)

**Data Use Purposes:**
- App functionality
- Analytics
- Product personalization
- Developer communications

---

### 🔴 5. Educational Context & Child Safety (CRITICAL)

#### ⚠️ COPPA Compliance (Children Under 13)
**Issue:** Your app is used in schools with students potentially under 13.

**Action Required:**
1. ✅ You have role-based access (parents control child data) ✅
2. ✅ You have parental consent mechanisms (school admin approval) ✅
3. ❌ **Update Privacy Policy to explicitly address:**
   - How you handle data from children under 13
   - That schools/parents provide consent
   - That children cannot independently create accounts
   - COPPA compliance statement

#### ⚠️ FERPA Compliance (Student Education Records)
**Issue:** Your app handles student education records.

**Action Required:**
- ❌ **Add to Privacy Policy:**
  - How you comply with FERPA
  - That schools maintain control of education records
  - Data security measures for student records
  - How schools can export/delete student data

---

### 🔴 6. In-App Purchases & Revenue (REQUIRED Declaration)

#### ✅ Your Status: FREE APP - NO REVENUE
**Declaration for App Store Connect:**
- ❌ No in-app purchases
- ❌ No subscriptions
- ❌ No paid features
- ❌ No advertising
- ✅ Completely free for users

**⚠️ IMPORTANT:** 
- You have Stripe integration code in `functions/src/webhooks/payments.ts`
- You have payment screens in `src/screens/PaymentScreen.tsx`
- **If these are not active/used, that's fine**
- **If you plan to monetize later, you'll need to submit an update**

**Apple Requirement:**
- If payment features exist but are disabled, ensure they're not accessible in the submitted build
- Consider removing unused payment code for v1.0 to avoid reviewer confusion

---

### 🔴 7. Testing & Quality Assurance (REQUIRED)

#### ❌ Test Account (REQUIRED)
**Apple requires a working test account for review.**

**Action Required:**
1. Create a test school in your system
2. Create test accounts:
   - Test Parent account (with demo student)
   - Test Teacher account
   - Test School Admin account
3. Provide credentials in App Store Connect:
   ```
   Username: test.parent@tuto.edu
   Password: [secure password]
   
   Username: test.teacher@tuto.edu
   Password: [secure password]
   
   Additional Notes: 
   - Use school code: TEST2024
   - Parent account linked to demo student "Test Student"
   ```

#### ✅ Pre-Submission Testing Checklist

**Core Flows:**
- [ ] User can register/login with email
- [ ] User can select role (Parent/Teacher/Admin)
- [ ] Parent can join school with invitation code
- [ ] Parent can view school dashboard
- [ ] Parent can see announcements
- [ ] Parent can view daily activities
- [ ] Parent can check attendance
- [ ] Parent can view homework
- [ ] Parent can access photo albums
- [ ] Parent can view health records
- [ ] Parent can send/receive messages
- [ ] Teacher can post announcements
- [ ] Teacher can create activities
- [ ] Teacher can take attendance
- [ ] Admin can manage students
- [ ] Admin can manage teachers

**Permission Flows:**
- [ ] Camera permission request works
- [ ] Photo library permission works
- [ ] Location permission works (if used)
- [ ] App gracefully handles permission denial

**Error Handling:**
- [ ] Network offline shows appropriate message
- [ ] Invalid school code shows error
- [ ] Failed image upload handled gracefully
- [ ] Empty states show helpful messages

**Localization:**
- [ ] Vietnamese translation works
- [ ] English translation works
- [ ] Language switching works smoothly

**Performance:**
- [ ] App launches in < 3 seconds
- [ ] No crashes on typical flows
- [ ] Images load efficiently
- [ ] Scrolling is smooth

---

### 🔴 8. Technical Requirements (VERIFY)

#### ✅ Build Configuration
```json
// eas.json
{
  "build": {
    "production": {
      "channel": "production",
      "autoIncrement": true
    }
  }
}
```
✅ Looks good

#### ✅ App Configuration
```json
// app.json
{
  "version": "1.0.1",
  "ios": {
    "bundleIdentifier": "com.tutoapp.mobile",
    "supportsTablet": true
  }
}
```
✅ Version and bundle ID set

#### ❌ Code Cleanup (RECOMMENDED)
**Issue:** 655 console.log/error statements found in src/

**Action Required:**
1. Remove or disable console statements in production
2. Add to babel.config.js:
```javascript
// babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // ... existing plugins
      process.env.NODE_ENV === 'production' && ['transform-remove-console']
    ].filter(Boolean)
  };
};
```

#### ⚠️ Firebase Configuration (VERIFY)
**Action Required:**
- Ensure Firebase project is in production mode
- Verify Firebase security rules are production-ready
- Test Firebase Authentication works in production

#### ⚠️ Airtable Configuration (VERIFY)
**Action Required:**
- Ensure Airtable base is accessible
- Verify API keys are in EAS secrets (not in code)
- Test data access works with production keys

---

### 🔴 9. App Store Connect Setup (REQUIRED)

#### ❌ Apple Developer Account
- [ ] Have active Apple Developer Program membership ($99/year)
- [ ] Developer account in good standing
- [ ] Agreements, Tax, and Banking completed

#### ❌ Create App in App Store Connect
1. Go to https://appstoreconnect.apple.com
2. Click "My Apps" → "+" → "New App"
3. Fill in:
   - **Platform:** iOS
   - **Name:** Tuto Education Platform
   - **Primary Language:** English (UK) or Vietnamese
   - **Bundle ID:** com.tutoapp.mobile
   - **SKU:** tuto-education-platform-001
   - **User Access:** Full Access

#### ❌ Upload Build via EAS
```bash
# Install EAS CLI if not installed
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for iOS
eas build --platform ios --profile production

# Once build completes, submit to App Store Connect
eas submit --platform ios
```

---

## 📋 RECOMMENDED (Strongly Suggested)

### 🟡 1. Content Moderation Improvements

#### Current Status:
- ✅ Content moderation system exists
- ✅ Reporting and blocking features
- ✅ Content policy documentation

#### Recommendations:
- [ ] Add profanity filter for user-generated content
- [ ] Implement image content scanning (AWS Rekognition or similar)
- [ ] Create moderation dashboard for school admins
- [ ] Add content appeal process

---

### 🟡 2. Accessibility Improvements

#### Current Status:
- Partial accessibility support

#### Recommendations:
- [ ] Test with VoiceOver (iOS screen reader)
- [ ] Add accessibility labels to all interactive elements
- [ ] Ensure minimum touch target size (44x44 pt)
- [ ] Test with Dynamic Type (text size adjustment)
- [ ] Add high contrast mode support
- [ ] Test with color blindness simulators

---

### 🟡 3. Performance Optimization

#### Recommendations:
- [ ] Remove unused dependencies
- [ ] Optimize images (compress, use WebP)
- [ ] Implement code splitting
- [ ] Add app size monitoring
- [ ] Profile and fix memory leaks
- [ ] Optimize bundle size

---

### 🟡 4. Analytics & Monitoring

#### Current Status:
- ✅ Firebase Analytics integrated
- ✅ Sentry for crash reporting

#### Recommendations:
- [ ] Set up production Sentry project
- [ ] Configure Firebase Analytics events
- [ ] Add performance monitoring
- [ ] Set up alerting for critical errors
- [ ] Create analytics dashboard

---

### 🟡 5. Security Hardening

#### Recommendations:
- [ ] Enable certificate pinning
- [ ] Implement jailbreak detection
- [ ] Add request signing for API calls
- [ ] Rotate API keys before launch
- [ ] Set up rate limiting on backend
- [ ] Enable 2FA for admin accounts
- [ ] Conduct security audit

---

## ⚠️ IMPORTANT NOTES & WARNINGS

### 🚨 Common Rejection Reasons to Avoid

1. **Incomplete Information**
   - ❌ Missing or broken privacy policy URL
   - ❌ Missing or broken support URL
   - ❌ No demo account provided

2. **Misleading App Functionality**
   - ❌ Screenshots don't match actual app
   - ❌ Description mentions features not available
   - ❌ Payment code exists but isn't used

3. **Privacy Violations**
   - ❌ Collecting data without disclosure
   - ❌ Unclear permission purposes
   - ❌ Missing COPPA/FERPA compliance

4. **Technical Issues**
   - ❌ App crashes during review
   - ❌ Features don't work as described
   - ❌ Poor network error handling

5. **Content Issues**
   - ❌ User-generated content without moderation
   - ❌ No way to report inappropriate content
   - ❌ Offensive placeholder content

---

## 📅 SUBMISSION TIMELINE & CHECKLIST

### Week 1: Legal & Content (CRITICAL PATH)
- [ ] Day 1-2: Create Privacy Policy
- [ ] Day 2-3: Create Terms of Service
- [ ] Day 3-4: Publish legal documents to accessible URLs
- [ ] Day 4-5: Update app code with correct URLs
- [ ] Day 5: Set up support@tuto.edu email

### Week 2: Assets & Testing
- [ ] Day 1-2: Create App Store screenshots
- [ ] Day 2-3: Write App Store description and metadata
- [ ] Day 3-4: Create test accounts
- [ ] Day 4-5: Complete pre-submission testing
- [ ] Day 5: Code cleanup (remove console.logs)

### Week 3: Build & Submit
- [ ] Day 1: Set up Apple Developer account (if not done)
- [ ] Day 1-2: Create app in App Store Connect
- [ ] Day 2-3: Build production iOS app with EAS
- [ ] Day 3-4: Fill out App Privacy details
- [ ] Day 4-5: Complete App Store listing
- [ ] Day 5: Submit for review

### Week 4: Review & Launch
- [ ] Days 1-3: Apple review (typically 1-3 days)
- [ ] Days 4-5: Address any review feedback
- [ ] Day 5+: Approve for release!

---

## 🎯 PRIORITY ACTION ITEMS (DO THESE FIRST)

### 🔥 CRITICAL (Blocking Submission)
1. ✅ **Create and publish Privacy Policy** (https://tuto.edu/privacy)
2. ✅ **Create and publish Terms of Service** (https://tuto.edu/terms)
3. ✅ **Set up working support email** (support@tuto.edu)
4. ✅ **Update hardcoded URLs in app code**
5. ✅ **Create App Store screenshots** (3-10 per device size)
6. ✅ **Create test accounts for reviewers**

### 🔶 HIGH PRIORITY (Strongly Recommended)
7. ⚠️ **Write App Store description and metadata**
8. ⚠️ **Complete pre-submission testing checklist**
9. ⚠️ **Remove/disable console.log statements**
10. ⚠️ **Verify all permissions work correctly**
11. ⚠️ **Update permission purpose strings** (make them school-specific)
12. ⚠️ **Remove or hide unused payment features**

### 🔷 MEDIUM PRIORITY (Good to Have)
13. 📋 **Add COPPA/FERPA compliance to Privacy Policy**
14. 📋 **Set up Apple Developer account**
15. 📋 **Configure EAS build for production**
16. 📋 **Set up Sentry production project**

---

## 📞 SUPPORT & RESOURCES

### Apple Resources:
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **App Store Connect Help:** https://help.apple.com/app-store-connect/
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/

### Expo Resources:
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **EAS Submit:** https://docs.expo.dev/submit/introduction/
- **App Store Deployment:** https://docs.expo.dev/distribution/app-stores/

### Privacy Resources:
- **COPPA:** https://www.ftc.gov/business-guidance/resources/childrens-online-privacy-protection-rule-not-just-kids-sites
- **FERPA:** https://www2.ed.gov/policy/gen/guid/fpco/ferpa/index.html

---

## ✅ FINAL CHECKLIST BEFORE SUBMISSION

Use this as your final gate before hitting "Submit for Review":

### Legal & Compliance
- [ ] Privacy Policy is live and accessible
- [ ] Terms of Service is live and accessible
- [ ] Support email is active and monitored
- [ ] All URLs in app point to correct locations
- [ ] COPPA compliance documented
- [ ] FERPA compliance documented

### App Store Assets
- [ ] Screenshots created for all required device sizes
- [ ] App description written (under 4000 chars)
- [ ] Keywords selected (under 100 chars)
- [ ] Promotional text written
- [ ] Age rating questionnaire completed
- [ ] App category selected (Education)

### Technical
- [ ] Production build created with EAS
- [ ] App launches successfully
- [ ] No crashes in critical flows
- [ ] All permissions work correctly
- [ ] Console logs removed/disabled
- [ ] Firebase configured for production
- [ ] Airtable credentials secured

### Testing
- [ ] Test accounts created and documented
- [ ] Core user flows tested
- [ ] Permission flows tested
- [ ] Error handling tested
- [ ] Offline mode tested
- [ ] Both languages tested

### App Store Connect
- [ ] App created in App Store Connect
- [ ] Build uploaded and processed
- [ ] App Privacy details completed
- [ ] Test account info provided
- [ ] All metadata fields filled
- [ ] Primary category: Education
- [ ] Secondary category: Productivity (optional)

### Final Review
- [ ] No placeholder text in app
- [ ] No "lorem ipsum" content
- [ ] All images load correctly
- [ ] No broken links
- [ ] No TODO comments visible to users
- [ ] App version matches build (1.0.1)

---

## 🎉 POST-SUBMISSION

### What to Expect:
1. **Processing:** Apple will process your build (1-2 hours)
2. **Waiting for Review:** Queue time (usually 24-48 hours)
3. **In Review:** Active review by Apple (1-3 days)
4. **Possible Outcomes:**
   - ✅ **Approved** → You can release immediately or schedule
   - ⚠️ **Metadata Rejected** → Fix listing info, no new build needed
   - ❌ **Binary Rejected** → Fix issues, submit new build

### If Rejected:
- Don't panic! Most apps get rejected once
- Read the rejection reason carefully
- Fix the specific issues mentioned
- Respond in Resolution Center if you need clarification
- Submit updated build or metadata

### After Approval:
- [ ] Release app to App Store
- [ ] Monitor crash reports (Sentry)
- [ ] Monitor user reviews
- [ ] Prepare for user onboarding
- [ ] Create support documentation
- [ ] Plan v1.1 improvements based on feedback

---

## 📊 ESTIMATED COSTS

### Required Costs:
- **Apple Developer Program:** $99/year (required)
- **Domain for legal pages:** ~$10-15/year (optional if using subdomain)
- **SSL Certificate:** Free with Let's Encrypt

### Optional Costs:
- **Privacy Policy Generator Service:** $0-50 (one-time)
- **Screenshot Tool (Shotbot, etc):** $0-30
- **Professional Legal Review:** $500-2000 (recommended for EdTech)

---

## 🎯 SUCCESS CRITERIA

You're ready to submit when:
- ✅ All items in "CRITICAL" section are complete
- ✅ Privacy Policy and ToS are live and compliant
- ✅ Test accounts work and are documented
- ✅ App passes all core functionality tests
- ✅ No crashes or major bugs
- ✅ Screenshots and description are compelling
- ✅ All App Store Connect fields are filled

---

**Good luck with your submission! 🚀**

**Questions or Issues?**
- Review this checklist line by line
- Test on a real device before submitting
- Have someone else test the app
- When in doubt, over-communicate with Apple in review notes

**Remember:** Apple reviewers are human. Be professional, provide clear instructions, and make their job easy. A well-documented submission with test accounts and clear notes gets approved faster!

