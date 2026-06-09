# BATCH 13 Re-test Prompts — BUG-044, BUG-045, TC-159

**Status:** Bugs fixed by dev team  
**Re-test Cases:** TC-157, TC-158, TC-159  
**Expected Outcome:** All 3 should now PASS

---

## TC-157 Re-test: Notification Unread Dot Clears (BUG-044 Fixed)

**Feature:** Notification unread indicator  
**Severity:** High  
**Bug Fixed:** BUG-044 — Dot now clears automatically; responds to Realtime events

**Setup:**
- Open fresh browser (or clear cookies if needed)
- Navigate to `http://localhost:3001`
- Log in as `marketing@tutoglobal.com`

**Steps:**
1. **Verify red dot is visible** — Look at header "Thông báo" link
   - Should see a **red dot** indicating unread notifications
   - If no red dot, check DB: user should have ≥1 unread notification (read_at IS NULL)

2. **Click "Thông báo"** link in header (or navigate to `/notifications`)
   - Notifications page loads
   - Confirm you can see notification rows

3. **Navigate back to /feed**
   - Click "Tuto" logo or use browser back button
   - Go back to `/feed` page
   - **DO NOT refresh the page** (F5)

4. **Check header for red dot**
   - Look at "Thông báo" link in header
   - The red dot should be **GONE** without requiring a page refresh

**Expected Result:**
- ✅ Red dot visible before visiting /notifications
- ✅ Red dot **gone after navigating back** (no refresh needed)
- ✅ Smooth, automatic state update

**Report:**
```
TC-157: [PASS / FAIL]
Observation: [What happened - did dot clear automatically?]
[If FAIL: describe what went wrong]
```

---

## TC-158 Re-test: Leaderboard Public Access (BUG-045 Fixed)

**Feature:** Leaderboard public access  
**Severity:** High  
**Bug Fixed:** BUG-045 — `/leaderboard` now whitelisted as public route

**Setup:**
- Open **NEW incognito/private window** (completely separate, not logged in)
- No cookies, no session

**Steps:**
1. **In the incognito window**, navigate to:
   ```
   http://localhost:3001/leaderboard
   ```

2. **Wait 2-3 seconds** for page to load

3. **Check the result:**
   - Does the leaderboard page load?
   - Or are you redirected to `/login`?

**Expected Result:**
- ✅ Leaderboard page **loads directly** without redirect
- ✅ Teacher list visible
- ✅ Podium (top 3) visible
- ✅ Page title shows "Bảng xếp hạng"
- ✅ No login prompt

**Report:**
```
TC-158: [PASS / FAIL]
Observation: [Page loaded or redirected?]
[If FAIL: describe what happened]
```

---

## TC-159 Re-test: Leaderboard Podium Design (PM Clarification)

**Feature:** Leaderboard top 3 podium display  
**Severity:** High  
**Clarification:** PASS if BOTH elements visible:
- ✅ Rank pill (Beginner / Bronze / Silver / Gold / Elite)
- ✅ Shield count (numeric number)

**Setup:**
- Log in as `marketing@tutoglobal.com`
- Navigate to `http://localhost:3001/leaderboard`

**Steps:**
1. **Inspect the top 3 podium section** (highest ranked teachers)

2. **For each teacher in top 3, verify:**
   - ✅ Avatar image visible
   - ✅ Teacher name visible
   - ✅ **Rank pill visible** (badge showing Beginner / Bronze / Silver / Gold / Elite)
   - ✅ **Shield count visible** (numeric number, e.g., "42")
   - ✅ Correct positions: #2 left, #1 center, #3 right

3. **Report what you see:**

**Expected Result (PM Decision):**
- ✅ **PASS** if BOTH rank pill AND shield count are shown on each teacher card
- ❌ **FAIL** if only ONE is shown (missing rank pill OR missing shield count)

**Report:**
```
TC-159: [PASS / FAIL]
Observation: [Both rank pill and shield count visible? or only one?]
[If FAIL: describe which element is missing]
```

---

## Submission Format

**For all 3 re-tests, provide:**

```
TC-157: [PASS/FAIL] — [Brief observation about dot behavior]
TC-158: [PASS/FAIL] — [Leaderboard loaded or redirected?]
TC-159: [PASS/FAIL] — [Both rank pill and shield count visible?]

Any additional notes:
[Optional: anything else you noticed]
```

---

## Success Criteria

| Test | Pass Condition |
|------|---|
| **TC-157** | Red dot clears automatically after leaving /notifications (no refresh) |
| **TC-158** | Leaderboard loads without login in incognito tab |
| **TC-159** | Both rank pill badge AND shield count number visible on each teacher |

---

**Once re-tests complete and all 3 PASS:**

1. QA Manager updates test-cases.csv with results
2. Mark BUG-044 and BUG-045 as "Verified Fixed" in bug-register.csv
3. Generate BATCH 14 prompts (Web Messaging Tests — TC-168 to TC-190)

