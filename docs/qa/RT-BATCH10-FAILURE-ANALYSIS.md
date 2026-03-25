# 🚨 Re-test Failures — BUG-040, BUG-042, BUG-043

**Date:** March 20, 2026  
**Re-test Results:** 1 PASS / 3 FAIL

---

## Summary

| Bug | Status | Result |
|-----|--------|--------|
| BUG-040 (Base64) | ❌ FAILED | Error persists after fix |
| BUG-041 (Timestamp) | ✅ PASSED | Conversation preview fixed! |
| BUG-042 (Nav bars 16e) | ❌ FAILED | Dual nav bars still visible |
| BUG-043 (Profile icon) | ❌ FAILED | Icon still hidden/inaccessible |

---

## Detailed Failure Analysis

### ❌ BUG-040: Reel Creation Base64 Error

**Status:** FAILED — Error persists

**Observation from screenshot:**
```
Error
Cannot read property 'Base64' of undefined
```

**What was supposed to fix it:**
- ReelItem.tsx: Replace `FileSystem.EncodingType.Base64` with string literal `'base64'`

**Why it failed:**
The error message is identical to before — **the fix either:**
1. Didn't get deployed/reloaded
2. Wasn't applied to the right file/location
3. Base64 error happens elsewhere in the code (not just ReelItem)

**Next steps:**
- Verify `ReelItem.tsx` actually contains `'base64'` (not `FileSystem.EncodingType.Base64`)
- Search for ALL references to Base64 encoding in reel creation code
- Check if fix was in the compiled bundle (clear cache and rebuild)

---

### ✅ BUG-041: Conversation Preview Timestamp

**Status:** PASSED ✅

**Observation from screenshot:**
- Tarun Tageja conversation shows "Vừa xong" (just now / 1:49)
- Previous conversations show correct relative times: "4h", "6h", "18h", "20h"

**Verification:** The trigger migration 072 is working correctly. New messages now update conversation.last_message_at in real-time.

---

### ❌ BUG-042: Dual Navigation Bars on iPhone 16e

**Status:** FAILED — Dual nav bars still visible

**Observation from screenshot (Messages tab):**
- **Bottom nav bar visible:** Yes (Community Feed, Reels, Search, Messages, Profile)
- **Bottom nav bar visible:** Yes (Dashboard, Classes, Attendance, Students, Photos, Community, Profile)
- **Count:** TWO tab bars visible at bottom

**What was supposed to fix it:**
- SocialStackNavigator: `useFocusEffect` + imperatively call `navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } })`

**Why it failed:**
The imperative call to hide parent tab bar likely failed because:
1. `navigation.getParent()` might be returning null/undefined
2. `useFocusEffect` not triggering correctly on this device model
3. The parent navigator structure might be different on 16e

**Next steps:**
- Verify `navigation.getParent()` is not null (add console logging)
- Check if tab bar hiding works on 17 Pro/Max (for comparison)
- Consider alternative: use a Context provider to control all parent tab bar visibility globally

---

### ❌ BUG-043: Profile Icon Hidden Behind Status Bar

**Status:** FAILED — Icon not visible/tappable

**Observation from screenshot (Community Feed):**
- Top of screen shows "< Tuto" header
- Story circle shows "1:50 W"
- Profile icon area: **NOT clearly visible**
- Tab bar at bottom visible

**What was supposed to fix it:**
- ProfileHeader: Refactor to extend cover image full-bleed behind status bar
- Add `insetTop` prop to properly position content

**Why it failed:**
The screenshot shows the Community Feed view (not the Profile tab directly), but the profile icon is still not properly positioned. This suggests:
1. The fix was applied only to one specific ProfileHeader component
2. Other profile-related headers (e.g., on Community feed) weren't updated
3. Safe area insets not being calculated correctly on 16e

**Next steps:**
- Verify which ProfileHeader components exist in the codebase
- Check if Story/Profile sections on feed also use ProfileHeader
- Ensure insetTop is being passed and used correctly

---

## Root Causes (Hypothesis)

### For All 3 Failures:

1. **Build Cache Issue:** Old compiled code still running; `.next` or `.expo` cache not cleared before rebuild
2. **Partial Deployment:** Fixes applied to code but not all files recompiled
3. **Device-Specific Rendering (16e):** iPhone 16e iOS version or React Native version may have different behavior
4. **Navigation Structure Mismatch:** Parent/child navigator relationships different than expected

---

## Recommended Actions

**IMMEDIATE:**
1. Clear all build caches:
   - `rm -rf .expo/`
   - `rm -rf ios/Pods/`
   - `npm clean-install`
2. Rebuild app on all 3 simulators
3. Re-run RT-040, RT-042, RT-043 (RT-041 already passing)

**IF FAILURES PERSIST:**
1. BUG-040: Search codebase for ALL Base64 references; add console logs to identify exact failure point
2. BUG-042: Add console logging to verify `navigation.getParent()` and `setOptions()` calls
3. BUG-043: Test ProfileHeader directly on Profile tab (not just Community feed) to isolate component

---

## CSV Update Status

✅ `bug-register.csv` updated with re-test failure notes
- BUG-040: Status = Open, Re-test failed
- BUG-041: Status = Verified Fixed (PASSED)
- BUG-042: Status = Open, Re-test failed
- BUG-043: Status = Open, Re-test failed

---

## Next Steps

**For PM/Dev:**
1. Rebuild with cleared caches (full clean)
2. Verify fixes are in compiled code
3. Re-test if builds confirm all fixes present
4. If still failing, add logging to diagnose root cause

**For QA:**
- Await rebuilt app
- Re-run all 4 re-tests with fresh build
- Report final status

**Estimated time to resolution:** 15–30 min (if cache clear fixes it) or 1–2 hours (if deeper investigation needed)
