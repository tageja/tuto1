# CRITICAL: Test Agent Directive — Actual Browser Testing Required

**To: Test Agent**  
**From: QA Manager**  
**Date:** March 24, 2026  
**Priority:** CRITICAL

---

## Your Previous Approach was CODE REVIEW ONLY

You reviewed source code to verify logic exists. That's useful but **NOT sufficient**.

We need **ACTUAL BROWSER TESTING** — you must:
- ✅ Interact with the UI
- ✅ Click buttons, fill forms, navigate pages
- ✅ See what actually happens (not what the code says should happen)
- ✅ Report real observations, not theoretical ones

---

## BATCH 13 + 14: Complete Browser Testing Required

### What Changed:
- **Servers are now running** ✅
  - Dashboard: `http://localhost:3000`
  - Social App: `http://localhost:3001`
- **You can now log in and test** ✅
- **All test environments are ready** ✅

### What You Must Do:

**Execute BOTH batches in your browser:**

1. **BATCH 13:** TC-151 to TC-167 (17 tests — Web school profiles, notifications, leaderboard, dashboard)
2. **BATCH 14:** TC-168 to TC-190 (23 tests — Web messaging & settings)

**Total: 40 test cases to execute in browser**

---

## How to Execute (Step-by-Step)

### Setup (5 min):
1. Open `http://localhost:3000` in browser
2. Log in with `marketing@tutoglobal.com`
3. Click "Community" link (or navigate to `http://localhost:3001`)
4. You're now authenticated on the social app

### For Each Test Case:

1. **Read the test prompt** from:
   - `/docs/qa/BATCH13-TEST-PROMPTS.md` (TC-151–TC-167)
   - `/docs/qa/BATCH14-TEST-PROMPTS.md` (TC-168–TC-190)

2. **Follow the exact steps** listed in the prompt

3. **Observe what actually happens** in the browser:
   - Does the page load?
   - Are elements visible?
   - Do buttons work?
   - Do forms submit?
   - Do errors appear?
   - Is the layout correct?

4. **Compare to Expected Result** in the prompt

5. **Report:**
   ```
   TC-XXX: [PASS / FAIL / BLOCKED]
   Observation: [What you SAW in the browser, not what the code says]
   [If FAIL: describe the error, include screenshot if possible]
   ```

---

## Examples: Code Review vs Browser Testing

### ❌ CODE REVIEW (What You Did Before):
```
TC-151: BLOCKED
Observation: Code verified in FeedPost.tsx + schoolId links to /school/....
```
**Problem:** We don't know if the link actually works, if it navigates correctly, if the page loads, if there are styling issues, etc.

### ✅ BROWSER TESTING (What We Need):
```
TC-151: PASS
Observation: Clicked school badge on feed → navigated to /school/123 → page loaded with school name, logo, and 3 tabs (Thông báo / Giáo viên / Thành tích)
```
**Better:** We know it works end-to-end, visually correct, no errors.

---

## Test Execution Order

### BATCH 13 (TC-151–TC-167): ~60 minutes
1. TC-151: School profile navigation
2. TC-152: School announcements tab
3. TC-153: School staff/teachers tab
... etc (all 17 cases)

### BATCH 14 (TC-168–TC-190): ~90 minutes
1. TC-168: Messages auth guard
2. TC-169: Messages mobile layout
... etc (all 23 cases)

**Total Time: ~2.5–3 hours**

---

## What to Report

**For each test, send:**

```
TC-151: PASS — School profile loads, 3 tabs visible, navigation works
TC-152: FAIL — Announcements tab shows 500 error
TC-153: BLOCKED — Can't test, needs teacher data
...
[All 40 tests]

Any additional notes:
[Optional observations about the app state, bugs, patterns]
```

---

## Important: Update Your Previous Comments

Your previous submission had observations like:
> "Code verified in FeedPost.tsx"

**Replace these with browser observations:**
> "Clicked school badge → navigated to /school/[id] → page loaded successfully with school info"

---

## Success Criteria

✅ All 40 tests executed in actual browser  
✅ PASS/FAIL/BLOCKED for each (not "code verified")  
✅ Real observations from UI interaction  
✅ Screenshots of failures  
✅ Bugs reported with detailed descriptions  

---

## Access & Credentials

| Item | Value |
|------|-------|
| **Dashboard** | http://localhost:3000 |
| **Social App** | http://localhost:3001 |
| **Login Email** | marketing@tutoglobal.com |
| **Role** | Parent |
| **Secondary Accounts** | qa.parent@tuto.test, qa.teacher@tuto.test (if needed) |

---

## Key Differences: BATCH 13 vs BATCH 14

| Batch | Focus | Key Tests |
|-------|-------|-----------|
| **BATCH 13** | Web features (read-only mostly) | School profiles, leaderboard, dashboard, notifications |
| **BATCH 14** | Web messaging & interaction | Message sending, conversation management, settings |

---

## Start Now

1. ✅ Servers are running
2. ✅ You can access the app
3. ✅ Test prompts are ready
4. ✅ Start executing BATCH 13 first (TC-151)

**Execute one test at a time. Report results after completion of each batch.**

---

## Questions?

- If a test seems unclear: refer to the full prompt in the .md files
- If the app breaks: take a screenshot and report the error
- If you need clarification on a step: ask before proceeding

---

**Status: AWAITING BROWSER TEST RESULTS FOR BATCH 13 & 14**

Execute all 40 tests in the browser and report back with PASS/FAIL + observations.

