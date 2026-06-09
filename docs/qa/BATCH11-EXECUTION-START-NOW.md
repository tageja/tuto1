# BATCH 11 EXECUTION BRIEF — Simulator Control Ready

**Status:** ✅ Metro + simulators can be prepared from the repo; **manual taps** (or Maestro / XCTest) still required to record PASS/FAIL  
**Ready to Start:** YES (once devices are logged in)  
**Platform:** Mobile (iOS simulators)  

---

## 🎯 What You Need to Do

You have **28 test cases (TC-093 to TC-120)** to execute on 3 iPhone simulators over the next **3–4 hours**.

### Three Documents to Reference

1. **`BATCH11-TEST-AGENT-BRIEF.md`** — Quick reference (5 min read)
   - Use during testing as needed

2. **`BATCH11-TEST-PROMPTS.md`** — Detailed test cases (your main guide)
   - Has exact steps for each TC
   - Expected results
   - How to report

3. **`BATCH11-TEST-AGENT-ONBOARDING.md`** — Deep context (if confused)
   - Architecture, gamification system, troubleshooting

---

## ⚙️ Pre-Execution Setup (Do This First)

### Verify Simulators

Before starting any test:

```bash
# Terminal 1: Ensure Metro is running
cd /Users/pc/tutoAll/tuto1
npx expo start --clear

# (Should show "Metro waiting on exp://..." within 30 seconds)

# Terminal 2: Verify simulators
xcrun simctl list devices | grep iPhone

# You should see:
# - iPhone 17 Pro
# - iPhone 17 Pro Max
# - iPhone 16e (or similar)
```

### Login Check

- [ ] **iPhone 17 Pro:** Launch app → should show feed (logged in as tarun_apollo)
- [ ] **iPhone 17 Pro Max:** Launch app → should show feed (logged in as we_are_banana_republic_ul87)
- [ ] **iPhone 16e (optional):** Launch app → logged in as tarun_tageja

**If any shows login screen:** Tap the app icon to resume or login with credentials from BATCH11-TEST-AGENT-ONBOARDING.md

### Notifications Enabled

On each simulator:
1. Settings → Notifications (not Privacy)
2. Tap tuto_social
3. Ensure "Allow Notifications" is ON
4. "Badges" (badge on app icon) should be ON

---

## 🏃 How to Execute Tests

### Step 1: Start with TC-093

Open **`BATCH11-TEST-PROMPTS.md`** and navigate to **TC-093**.

### Step 2: Follow the Template

Each test case has this structure:

```
TC-093: In-app notification bell — unread badge
Severity: High
Pre-conditions: tarun_apollo logged in; parent has liked a post
Setup: [1. On iPhone Max, like a post] [2. Switch to iPhone 17 Pro]
Steps: [1. Tap bell icon] [2. Check for badge]
Expected Result: [Badge shows unread count]
Report Back: [PASS/FAIL + screenshot + notes]
```

### Step 3: Execute on Simulators

For **single-device tests** (most cases):
- Use just iPhone 17 Pro (tarun_apollo)
- Follow steps exactly as written
- Screenshot if needed

For **two-device tests** (some notifications):
- Device A: iPhone 17 Pro Max (parent) — performs action
- Device B: iPhone 17 Pro (teacher) — observes result
- Wait 2–3 seconds between action and observation
- Do NOT refresh on Device B

### Step 4: Report Result

After each test, update **`docs/qa/test-cases.csv`**:

| Column | Fill With |
|--------|-----------|
| **Batch** | BATCH 11 |
| **Test ID** | TC-093 (from prompt) |
| **Status** | PASS / FAIL / BLOCKED / SKIPPED |
| **Tester Notes** | 1–2 lines describing what you observed |
| **Bug ID Linked** | If FAIL → create BUG-050, BUG-051, etc. |

**Example:**
```
BATCH 11,TC-093,In-app notification bell,PASS,"Bell icon shows red badge count=1; badge clears after opening NotificationsScreen"
```

### Step 5: On FAIL

Take a screenshot:
1. Tap screenshot button on simulator (or Cmd+S)
2. Save to `docs/qa/screenshots/TC-093-failure.png`
3. In Tester Notes, describe what went wrong
4. Create new bug in `bug-register.csv` with:
   - Bug ID (BUG-050, etc.)
   - Description (1 line)
   - Severity
   - Screenshot link

---

## 📋 Test Sequence (Recommended Order)

Start with this order to avoid pre-condition dependencies:

| Phase | Test Cases | What | Time | Notes |
|-------|-----------|------|------|-------|
| Phase 1 | TC-093–101 | Notification system | 60 min | Single device (iPhone 17 Pro) |
| Phase 2 | TC-102–105 | Realtime delivery | 40 min | Two devices (sync test) |
| Phase 3 | TC-106–114 | Achievements + streaks | 70 min | Single device + DB check |
| Phase 4 | TC-115–120 | Dashboard + settings | 50 min | Mixed single/two-device |

---

## 🔄 Two-Device Testing Pattern (Important!)

Some tests require **synchronized action** between two simulators.

### Example: TC-095 (Notification Types)

**Setup (both simulators ready):**
- iPhone 17 Pro: NotificationsScreen open
- iPhone 17 Pro Max: Feed open

**Test:**

| Device | Action |
|--------|--------|
| **iPhone 17 Pro Max** | 1. Find post by tarun_apollo |
| | 2. Tap heart → Like |
| | 3. Wait 1 second (back to Device A) |
| **iPhone 17 Pro** | 4. Check NotificationsScreen (do NOT refresh) |
| | 5. Look for ❤️ like notification |

**Result:** PASS if notification appears within 2–3 seconds on Device A without refresh

---

## ✅ Critical Tests (Don't Miss These)

These MUST pass or BATCH 11 fails:

- **TC-093:** Bell icon + unread badge
- **TC-095:** Notification types display (like, comment, follow)
- **TC-099:** Push notification received when backgrounded
- **TC-101:** Achievement unlock on first post
- **TC-109:** Leaderboard loads with teacher ranking

---

## ⚠️ Common Issues & Fixes

### Issue: "Notification doesn't appear"
**Fix:**
- Check device Settings → Notifications is ON
- Check app is in foreground (not backgrounded)
- Wait full 3 seconds before concluding failure
- Try refreshing app (swipe up or shake device → Reload)

### Issue: "Achievement doesn't unlock"
**Fix:**
- Watch Metro terminal for `[DBG-...]` log lines
- Verify post submitted successfully (should redirect to feed)
- Check Profile → Achievements tab for the badge
- If badge exists but modal didn't show → still counts as PASS

### Issue: "App crashes mid-test"
**Fix:**
- Note which TC crashed
- Take screenshot of error
- Restart app: kill all processes + `npx expo start --clear`
- Retry that TC

### Issue: "Simulator is slow or frozen"
**Fix:**
- Reboot simulator: `xcrun simctl boot "iPhone 17 Pro"`
- Or kill and restart: `pkill -9 node expo; npx expo start --clear`

---

## 📸 Screenshot Guidelines

**Take screenshots for:**
- ✅ Any FAIL case
- ✅ Unusual/unclear behavior
- ✅ Achievement unlock modal (if visible)
- ✅ Notification list (first time you see it)

**Don't bother with:**
- ❌ PASS cases where everything looks normal
- ❌ Expected screens (unless something odd)

**Save location:** `docs/qa/screenshots/` (create folder if needed)  
**Naming:** `TC-093-bell-badge.png`, `BUG-050-crash-error.png`

---

## 📊 Expected Outcome

**Target:** ≥ 90% PASS (≥ 25/28 cases)

- 25–28 PASS → Ready for BATCH 12
- 21–24 PASS → Log bugs, wait for fixes, re-test
- < 21 PASS → Escalate (architectural issue likely)

---

## 🎬 Start Now!

### Checklist Before Starting

- [ ] Metro running in terminal (`npx expo start --clear`)
- [ ] All 3 simulators launched + logged in
- [ ] Notifications enabled on all devices
- [ ] `docs/qa/test-cases.csv` open (rows TC-093–120 exist)
- [ ] `BATCH11-TEST-PROMPTS.md` open for reference

### Execute

1. Start with **TC-093** (bell icon)
2. Follow steps exactly
3. Update CSV after each test
4. Move to TC-094, TC-095, etc.

### Timeline

- Phase 1: ~60 min
- Phase 2: ~40 min
- Phase 3: ~70 min
- Phase 4: ~50 min
- **Total: 3–4 hours**

---

## 💬 Need Help?

If something is unclear:
1. Check the **Tester Notes** column in your CSV (previous tests may have context)
2. Read **BATCH11-TEST-AGENT-ONBOARDING.md** section "Troubleshooting"
3. Take a screenshot of the issue
4. Message QA Manager with:
   - Test ID
   - Screenshot
   - What you expected vs. what happened

---

**You're ready! Start with TC-093 now.** 🚀

