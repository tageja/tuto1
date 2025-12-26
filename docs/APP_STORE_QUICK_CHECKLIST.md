# 📋 App Store Submission - Quick Reference Checklist

**App:** Tuto Education Platform v1.0.1  
**Status:** Track your progress below  
**Target:** Apple App Store (iOS)

---

## 🔴 CRITICAL BLOCKERS (Cannot Submit Without)

| # | Item | Status | Priority | Est. Time | Notes |
|---|------|--------|----------|-----------|-------|
| 1 | Privacy Policy Published | ❌ TODO | 🔴 CRITICAL | 4-6 hrs | Must be live at https://tuto.edu/privacy |
| 2 | Terms of Service Published | ❌ TODO | 🔴 CRITICAL | 2-4 hrs | Must be live at https://tuto.edu/terms |
| 3 | Working Support Email | ❌ TODO | 🔴 CRITICAL | 30 min | setup support@tuto.edu |
| 4 | App Store Screenshots | ❌ TODO | 🔴 CRITICAL | 2-4 hrs | 3-10 per device size |
| 5 | Test Account Created | ❌ TODO | 🔴 CRITICAL | 1-2 hrs | Parent + Teacher + credentials |
| 6 | App Description Written | ❌ TODO | 🔴 CRITICAL | 1-2 hrs | 400-4000 characters |
| 7 | Apple Developer Account | ⚠️ VERIFY | 🔴 CRITICAL | Varies | $99/year - active? |

**Progress: 0/7 Complete** 🔴

---

## ⚠️ HIGH PRIORITY (Strongly Recommended)

| # | Item | Status | Priority | Est. Time | Notes |
|---|------|--------|----------|-----------|-------|
| 8 | Update Permission Strings | ❌ TODO | ⚠️ HIGH | 15 min | Make school-specific |
| 9 | COPPA/FERPA in Privacy Policy | ❌ TODO | ⚠️ HIGH | 1 hr | Student data compliance |
| 10 | Remove Console Logs | ❌ TODO | ⚠️ HIGH | 30 min | 655 found in src/ |
| 11 | Test All Core Features | ❌ TODO | ⚠️ HIGH | 2-3 hrs | No crashes allowed |
| 12 | App Privacy Details (ASC) | ❌ TODO | ⚠️ HIGH | 30 min | In App Store Connect |
| 13 | Review Notes Written | ❌ TODO | ⚠️ HIGH | 30 min | Guide for reviewers |

**Progress: 0/6 Complete** ⚠️

---

## 📋 NICE TO HAVE (Improves Approval)

| # | Item | Status | Priority | Est. Time | Notes |
|---|------|--------|----------|-----------|-------|
| 14 | Professional Screenshots | ⬜ SKIP | 📋 MEDIUM | 2-4 hrs | Designed vs raw |
| 15 | App Preview Video | ⬜ SKIP | 📋 MEDIUM | 4-8 hrs | 15-30 sec video |
| 16 | Remove Payment Code | ⬜ SKIP | 📋 MEDIUM | 1 hr | Or hide/disable |
| 17 | Accessibility Testing | ⬜ SKIP | 📋 MEDIUM | 2-3 hrs | VoiceOver, etc |
| 18 | Beta Test with TestFlight | ⬜ SKIP | 📋 MEDIUM | 3-5 days | Pre-submission |
| 19 | Professional Legal Review | ⬜ SKIP | 📋 LOW | $500-2k | Recommended for EdTech |

**Progress: 0/6 Complete** (Optional)

---

## 🎯 DAILY PLAN (Complete in 7-9 Days)

### Day 1: Legal Foundation
- [ ] Create Privacy Policy
- [ ] Create Terms of Service  
- [ ] Get domain/hosting ready
- [ ] **Goal:** Legal documents complete

### Day 2: Publish & Verify
- [ ] Publish Privacy Policy to URL
- [ ] Publish Terms of Service to URL
- [ ] Test URLs work (incognito mode)
- [ ] Setup support@tuto.edu email
- [ ] **Goal:** All URLs active and tested

### Day 3: App Store Assets - Writing
- [ ] Write app description
- [ ] Choose keywords
- [ ] Write promotional text
- [ ] Write "What's New"
- [ ] **Goal:** All text content ready

### Day 4: App Store Assets - Visual
- [ ] Take/design screenshots (iPhone)
- [ ] Take/design screenshots (iPad if needed)
- [ ] **Goal:** All visual assets ready

### Day 5: Testing Infrastructure
- [ ] Create test school in database
- [ ] Create test parent account
- [ ] Create test teacher account
- [ ] Create permanent school code
- [ ] Document all credentials
- [ ] **Goal:** Test accounts working

### Day 6: Code Cleanup
- [ ] Update permission strings in app.json
- [ ] Remove console.logs (babel plugin)
- [ ] Update hardcoded URLs if needed
- [ ] Test on physical device
- [ ] **Goal:** Code ready for production

### Day 7: App Store Connect Setup
- [ ] Verify Apple Developer account
- [ ] Create app in App Store Connect
- [ ] Fill in all metadata
- [ ] Complete App Privacy questionnaire
- [ ] **Goal:** ASC ready for build

### Day 8: Build & Upload
- [ ] Run production build (EAS)
- [ ] Upload to App Store Connect
- [ ] Wait for processing
- [ ] Add test credentials to review notes
- [ ] **Goal:** Build uploaded

### Day 9: Final Review & Submit
- [ ] Double-check all fields
- [ ] Verify screenshots look good
- [ ] Verify test account works
- [ ] Submit for review
- [ ] **Goal:** 🚀 SUBMITTED!

---

## 📊 STATUS DASHBOARD

### Overall Readiness: 🔴 NOT READY

| Category | Complete | Total | % | Status |
|----------|----------|-------|---|--------|
| Critical Blockers | 0 | 7 | 0% | 🔴 BLOCKING |
| High Priority | 0 | 6 | 0% | ⚠️ NEEDED |
| Nice to Have | 0 | 6 | 0% | ⬜ OPTIONAL |
| **TOTAL** | **0** | **19** | **0%** | **🔴 NOT READY** |

### Readiness Levels:
- 🔴 **0-49%:** Not Ready - Critical items missing
- 🟡 **50-74%:** Almost Ready - High priority items needed
- 🟢 **75-100%:** Ready to Submit - Final checks only

---

## 🎯 MINIMUM TO SUBMIT (Core 7)

This is the absolute bare minimum. Complete these 7 items and you CAN submit:

1. ✅ Privacy Policy URL works
2. ✅ Terms of Service URL works  
3. ✅ Support email works
4. ✅ Screenshots created (minimum 3)
5. ✅ Test account works
6. ✅ App description written
7. ✅ Apple Developer account active

**Current: 0/7** → Cannot submit yet

---

## 📞 QUICK CONTACTS & RESOURCES

### Templates & Generators:
- **Privacy Policy:** https://www.termsfeed.com/privacy-policy-generator/
- **Terms of Service:** https://www.termsfeed.com/terms-conditions-generator/
- **App Description:** See `docs/APP_STORE_SUBMISSION_CHECKLIST.md`

### Apple Resources:
- **App Store Connect:** https://appstoreconnect.apple.com
- **Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Human Interface Guidelines:** https://developer.apple.com/design/human-interface-guidelines/

### Help & Support:
- **Apple Developer Support:** https://developer.apple.com/support/
- **Expo Documentation:** https://docs.expo.dev
- **EAS Build:** https://docs.expo.dev/build/introduction/

---

## ✅ PRE-SUBMISSION TEST

Before you click "Submit for Review", verify ALL of these:

### Legal ✅
- [ ] Privacy Policy URL opens (test in incognito)
- [ ] Terms of Service URL opens (test in incognito)
- [ ] Support email receives mail
- [ ] No placeholder text visible to users

### Assets ✅
- [ ] At least 3 screenshots per device size
- [ ] App description is 200+ characters
- [ ] App description mentions NO missing features
- [ ] Screenshots match actual app functionality

### Testing ✅
- [ ] Test parent account login works
- [ ] Test teacher account login works
- [ ] Test school code works
- [ ] App doesn't crash on launch
- [ ] App doesn't crash on main screens
- [ ] Credentials documented in review notes

### Technical ✅
- [ ] App version is 1.0.1 (matches build)
- [ ] Bundle ID is com.tutoapp.mobile
- [ ] Production build created with EAS
- [ ] Build processed by Apple (no errors)

### App Store Connect ✅
- [ ] All required fields filled
- [ ] App Privacy completed
- [ ] Age rating completed
- [ ] Primary category: Education
- [ ] Test account info in review notes
- [ ] Build selected for submission

**Total: 0/25 Verified**

---

## 🚨 SHOWSTOPPERS (Auto-Reject)

These will cause instant rejection. Double-check:

- ❌ Privacy Policy link is broken or shows placeholder
- ❌ Terms of Service link is broken or shows placeholder  
- ❌ Support email bounces or doesn't exist
- ❌ No test account provided or account doesn't work
- ❌ App crashes on launch
- ❌ App crashes when reviewer tests basic features
- ❌ Screenshots show different app or are misleading
- ❌ Description mentions features that don't exist
- ❌ No screenshots uploaded

---

## 📈 PROGRESS TRACKER

### Week 1: Foundation
- [ ] Day 1: Legal docs created
- [ ] Day 2: Legal docs published
- [ ] Day 3: App description written
- [ ] Day 4: Screenshots created
- [ ] Day 5: Test accounts ready

### Week 2: Build & Submit
- [ ] Day 6: Code cleanup done
- [ ] Day 7: ASC setup complete
- [ ] Day 8: Production build uploaded
- [ ] Day 9: Final review & submit

### Week 3: Review
- [ ] Submitted for review
- [ ] In review
- [ ] Decision received
- [ ] (If rejected) Issues fixed
- [ ] Approved ✅

---

## 🎉 SUBMISSION COMMAND

When you're ready (after completing checklist):

```bash
# 1. Build for iOS
eas build --platform ios --profile production

# 2. Wait for build to complete (15-30 min)

# 3. Submit to App Store
eas submit --platform ios

# 4. Follow prompts to complete submission
```

---

## 📞 EMERGENCY CONTACTS

**If App Gets Rejected:**
1. Read rejection email CAREFULLY
2. Check Resolution Center in App Store Connect
3. Fix specific issues mentioned
4. Respond if you need clarification
5. Resubmit (usually no new build needed for metadata issues)

**If You're Stuck:**
1. Review full checklist: `docs/APP_STORE_SUBMISSION_CHECKLIST.md`
2. Review critical blockers: `docs/APP_STORE_CRITICAL_BLOCKERS.md`
3. Check Apple's Review Guidelines
4. Post in Expo Forums
5. Consider hiring consultant ($50-200/hr)

---

**Remember:** First submission is always the hardest. Most apps get rejected once. Fix the issues, learn from them, and resubmit. You'll get there! 💪

**Current Status:** 🔴 NOT READY - Complete critical blockers first

**Next Action:** Start with Day 1 tasks (create legal documents)

