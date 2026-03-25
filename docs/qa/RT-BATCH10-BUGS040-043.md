# BATCH 10 Re-test Prompts — BUG-040, BUG-041, BUG-042, BUG-043

**Date:** March 20, 2026  
**All Fixes Deployed:** Yes ✅  
**Build Status:** Fresh app build needed with latest fixes

---

## Instructions

1. **Rebuild app on all 3 simulators** with latest code
2. **Run each re-test below** on all simulators (or focus on device that failed originally)
3. **Report:** PASS/FAIL + any notes
4. **Update CSVs** after re-test completes

---

## RT-040: Reel Creation (BUG-040)

**What was fixed:** Base64 encoding — replaced FileSystem.EncodingType.Base64 with string literal 'base64'

**Steps:**
1. Tap + on Reels tab
2. Select a video from device
3. Add description (any text)
4. Add subject tags (select 1-2)
5. Tap "Đăng Reel"

**Expected:** Success alert appears; reel visible in Reels feed

**Re-test Result:** PASS / FAIL (+ notes if FAIL)

---

## RT-041: Conversation Preview Timestamp (BUG-041)

**What was fixed:** Migration 072 — added trigger to update conversation.last_message_at and last_message_preview when messages are sent

**Steps:**
1. Go to Messages tab
2. Open an existing conversation (or create new)
3. Send a new message (any text)
4. Return to Messages list (tap back or go to Messages tab)
5. Check the preview card for this conversation
6. **Compare:** Is the timestamp NOW showing the current time (e.g., "1m", "5m", "13:34")?

**Expected:** Timestamp shows current time of your just-sent message (not old "18h ago")

**Re-test Result:** PASS / FAIL (+ timestamp observed)

---

## RT-042: Single Nav Bar on iPhone 16e (BUG-042)

**What was fixed:** SocialStackNavigator now uses useFocusEffect to imperatively hide parent tab bar on all devices

**Steps:**
1. Run on **iPhone 16e specifically** (this was device-specific issue)
2. Navigate to Community tab
3. Look at **top of screen** — is there a header/stack nav bar?
4. Look at **bottom of screen** — is there a tab bar?
5. **Count nav bars:** Should see only 1 (bottom tab bar)

**Expected:** Only ONE navigation bar visible (at bottom); NO stacked header at top

**Re-test Result:** PASS / FAIL + count of nav bars seen

**Notes:** Also test on iPhone 17 Pro / Pro Max to confirm they still show 1 bar

---

## RT-043: Profile Icon Visibility (BUG-043)

**What was fixed:** ProfileHeader refactored to extend cover image full-bleed behind status bar (Instagram-style); now properly handles insetTop

**Steps:**
1. Run on **iPhone 16e specifically** (device-specific layout issue)
2. Go to Profile tab
3. Look at **top-right corner** — where profile icon should be
4. Check: Is the profile icon **fully visible**?
5. Try to **tap the profile icon** — does it respond?

**Expected:** Profile icon visible and tappable; not hidden behind clock or status bar icons

**Re-test Result:** PASS / FAIL + position observation

**Notes:** Also verify on iPhone 17 Pro / Pro Max to ensure no regression

---

## Summary Template for Results

```
RT-040 (BUG-040): [PASS/FAIL] — [notes]
RT-041 (BUG-041): [PASS/FAIL] — timestamp observed: [time shown]
RT-042 (BUG-042): [PASS/FAIL] — 16e nav bars count: [1 or 2], 17 Pro: [count], 17 Pro Max: [count]
RT-043 (BUG-043): [PASS/FAIL] — 16e profile icon visible: [yes/no], tappable: [yes/no]
```

---

## CSV Update Instructions

After all 4 re-tests complete:

**test-cases.csv:**
- Update TC-070, TC-076, TC-077, TC-078 rows
- Set Status → PASS or FAIL
- Set Re-test Notes → date + result + observation

**bug-register.csv:**
- For PASS results: Set Verified By → "Test Agent [date]"
- For FAIL results: Keep Status as "Open" + add re-test notes in notes column

---

**When ready:** Run this re-test sequence and report results. If all PASS, BATCH 10 is complete! ✅
