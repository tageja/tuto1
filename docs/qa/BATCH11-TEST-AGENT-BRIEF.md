# BATCH 11 — TEST AGENT BRIEF

**Platform:** Mobile (iOS simulators)  
**Test Cases:** TC-093 to TC-120 (28 cases)  
**Duration:** 3–4 hours  
**Focus:** Notifications, achievements, XP, streaks, leaderboard, teacher shields

---

## Quick Start

### Simulators & Accounts

| Device | Account | Role | Use |
|--------|---------|------|-----|
| iPhone 17 Pro | tarun_apollo | teacher | Notification recipient + achievement unlock |
| iPhone 17 Pro Max | we_are_banana_republic_ul87 | parent | Action trigger (like, comment, follow) |
| iPhone 16e | tarun_tageja | parent | (Optional) Realtime cross-device |

### Key Setup

1. Both apps logged in before starting
2. Keep Metro terminal visible (observe [DBG] logs for achievement triggers)
3. Ensure notifications enabled on both devices
4. Use two devices for Realtime tests (wait 2–3s between action and observation)

---

## Test Structure

| Phase | Cases | What | Method |
|-------|-------|------|--------|
| **Phase 1** | TC-093–101 | Bell icon, notification list, types, preferences | Single device (tarun_apollo) |
| **Phase 2** | TC-102–105 | Like/comment/follow notifications + realtime | Two devices (trigger on one, observe on other) |
| **Phase 3** | TC-106–108 | Achievement unlocks (first post, first like, first follow) | Single device, trigger actions |
| **Phase 4** | TC-109–114 | Streaks, leaderboard, teacher shields | Single device (tarun_apollo) + verify DB |
| **Phase 5** | TC-115–120 | Badge clear, empty state, comment/follow notifs, settings persist | Single + realtime mix |

---

## Critical Tests (Must PASS)

- **TC-093:** Bell icon + unread badge
- **TC-095:** Notification types display (like, comment, follow)
- **TC-099:** Push notification received when backgrounded
- **TC-101:** Achievement unlock on first post
- **TC-109:** Leaderboard teacher ranking

---

## Common Issues & Fixes

**Issue:** "Notification doesn't appear"  
→ Check Settings → Privacy → Notifications → tuto_social enabled  
→ Ensure app has badge permission  

**Issue:** "Achievement doesn't unlock"  
→ Check Metro terminal for [DBG-*] log lines  
→ Verify post submitted successfully (redirect to feed or success toast)  

**Issue:** "Realtime data not syncing between devices"  
→ Wait 2–3 seconds after action before checking  
→ Do NOT refresh or navigate away from receiving device  

**Issue:** "Shield count doesn't increase"  
→ Verify subject tag was added to post (for +5 shields)  
→ Refresh Profile tab to see updated count  

---

## Reporting

For **each test case:**
1. Mark **Status** (PASS / FAIL / BLOCKED / SKIPPED)
2. Write **Tester Notes** (1–2 lines, specific observation)
3. Screenshot on FAIL or if unclear
4. If FAIL → create new BUG and link

**CSV file:** `docs/qa/test-cases.csv` (rows already exist for TC-093–120)

---

## Expected Outcome

✅ **≥ 90% PASS** (≥ 25/28 cases passing)

**After completion:**
1. Send CSV with all results
2. List any new bugs found + severity
3. QA Manager will decide if BATCH 12 ready or fixes needed

---

**Full detailed test prompts:** See `BATCH11-TEST-PROMPTS.md` for complete steps, expected results, and pre-conditions for each case.

**Start with TC-093 and work through sequentially!** 👍

