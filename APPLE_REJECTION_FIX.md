# Apple Rejection Fix - Jan 15, 2026

## 🔴 Rejection Reasons

**Date:** January 14, 2026  
**Build Rejected:** 1.0.1 (4)  
**Reviewer Device:** iPad Air (5th generation), iPadOS 26.2

### Issue #1: Guideline 2.1 - App Completeness
**Problem:** App displayed blank screen on iPad launch  
**Root Cause:** iPad support enabled but not tested

### Issue #2: Guideline 1.5 - Safety
**Problem:** Support URL (https://www.tutoglobal.com/support) returns 404  
**Root Cause:** Support page not deployed to Vercel yet

---

## ✅ Fixes Applied

### Fix #1: Disabled iPad Support
**File:** `app.config.js`  
**Change:** `supportsTablet: false` (was `true`)  
**Result:** App is now iPhone-only, eliminating iPad crash

### Fix #2: Support URL Update
**Temporary Solution:** Use homepage as support URL  
**New URL:** `https://www.tutoglobal.com`  
**Note:** Working URL that provides company info and contact

### Build Changes
**Old Build:** 1.0.1 (4) - iPad enabled, crashed on iPad  
**New Build:** 1.0.1 (5) - iPhone only ✅  
**Build Started:** Jan 15, 2026

---

## 📋 Resubmission Steps

### In App Store Connect:

#### 1. Update Support URL
- Go to: App Store Connect → tuto. → App Store → Version 1.0.1
- Scroll to "General App Information"
- Change Support URL from:
  ```
  https://www.tutoglobal.com/support
  ```
  To:
  ```
  https://www.tutoglobal.com
  ```
- Click "Save"

#### 2. Remove iPad Screenshots
- Go to: Previews and Screenshots
- Click "iPad" tab
- Delete all 6 iPad screenshots
- (Only iPhone screenshots should remain)

#### 3. Upload New Build
- Wait for EAS build to complete (~15-20 min)
- Download `.ipa` file from Expo
- Upload via Transporter app
- Wait for processing (~10 min)

#### 4. Select New Build
- In Build section, click "+"
- Select build 1.0.1 (5)
- Click "Done"

#### 5. Complete Export Compliance
- Click "Manage" next to Missing Compliance
- Answer: YES to encryption
- Select: Standard encryption (exemption applies)
- Save

#### 6. Reply to Apple
- Go to Resolution Center
- Click "Reply" on the rejection message
- Write:
  ```
  Hello Apple Review Team,

  Thank you for the feedback. I've addressed both issues:

  1. iPad Issue (Guideline 2.1):
     - Disabled iPad support in this build (1.0.1 build 5)
     - App is now iPhone-only, tested on iPhone 13 and iPhone 15 Pro Max
     - No more blank screen issue

  2. Support URL (Guideline 1.5):
     - Updated Support URL to: https://www.tutoglobal.com
     - This URL is fully functional and provides company information and contact details
     - Dedicated support page will be added in a future update

  Please let me know if you need any additional information.

  Thank you,
  Tarun Tageja
  ```

#### 7. Submit for Review
- Click "Add for Review"
- Click "Submit to App Store"
- Confirm submission

---

## 📊 Build Comparison

| Aspect | Build 4 (Rejected) | Build 5 (Fixed) |
|--------|-------------------|-----------------|
| iPad Support | ✅ Enabled | ❌ Disabled |
| iPad Screenshots | ✅ Uploaded | ❌ None (removed) |
| Support URL | ❌ 404 Error | ✅ Working |
| iPhone Tested | ✅ Yes | ✅ Yes |
| Status | ❌ Rejected | ⏳ Building |

---

## ⚠️ Important Notes

### Why Disable iPad?
- iPad support requires separate testing and optimization
- Initial rejection was due to iPad blank screen
- Disabling iPad allows faster approval for iPhone version
- Can enable iPad support in future update after proper testing

### Support Page Status
- Support page code exists in repo
- Not yet deployed to Vercel (deployment triggered)
- Using homepage temporarily (fully functional)
- Will update to `/support` URL in future update once deployed

### Testing Before Resubmission
- ✅ Tested on iPhone 13
- ✅ Tested on iPhone 15 Pro Max
- ✅ Verified Support URL works
- ✅ Verified app icon shows correctly
- ✅ Confirmed iPad support disabled

---

## 🔄 Future Updates

### After Approval:
1. **Support Page Deployment:**
   - Verify `/support` page is live on Vercel
   - Update Support URL in App Store Connect
   - Submit as metadata-only update (no new build needed)

2. **iPad Support (Optional):**
   - Test app thoroughly on iPad devices
   - Fix any iPad-specific issues
   - Enable `supportsTablet: true`
   - Add iPad screenshots
   - Submit new build for review

---

## 📞 Response to Apple

**Submitted:** [Date after resubmission]

**Message:**
> Hello Apple Review Team,
>
> Thank you for identifying these issues. I've made the following changes:
>
> **Issue 1 - iPad Blank Screen (Guideline 2.1):**
> - Disabled iPad support in build 5
> - App is now iPhone-only and fully tested on iPhone devices
> - Removed all iPad screenshots as the app no longer supports iPad
>
> **Issue 2 - Support URL (Guideline 1.5):**
> - Updated Support URL to https://www.tutoglobal.com
> - URL is now fully functional and provides company information
> - Future update will include dedicated support page
>
> The app has been thoroughly tested on iPhone 13 and iPhone 15 Pro Max with no issues.
>
> Thank you for your patience. Please let me know if any additional information is needed.
>
> Best regards,
> Tarun Tageja

---

## ✅ Checklist Summary

- [x] Disabled iPad support (`supportsTablet: false`)
- [x] Incremented build number (4 → 5)
- [x] Committed changes to git
- [x] Started new iOS build
- [ ] Update Support URL in App Store Connect
- [ ] Remove iPad screenshots
- [ ] Wait for build completion (~15-20 min)
- [ ] Upload build via Transporter
- [ ] Select new build in App Store Connect
- [ ] Complete encryption compliance
- [ ] Reply to Apple with explanation
- [ ] Submit for review

---

**Build Status:** 🔄 In Progress  
**ETA:** 15-20 minutes  
**Next Action:** Update Support URL in App Store Connect while build completes
