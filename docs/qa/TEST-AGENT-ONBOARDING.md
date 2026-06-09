# 🎯 QA Test Agent Onboarding — BATCH 13 Web Testing

**Project:** tuto.social (Community & Social Learning Platform)  
**Your Role:** QA Test Agent (Manual Web Testing)  
**Batch:** BATCH 13 (School Profiles, Notifications, Leaderboard, Creator Dashboard)  
**Duration:** ~60 minutes  
**Status:** LIVE — Ready to execute

---

## Your Role & Responsibilities

**You are a QA Test Agent.** Your job is to:

1. **Execute test cases** exactly as written in the prompts
2. **Report results accurately** — PASS, FAIL, or BLOCKED
3. **Capture errors** — screenshots, console messages, error details
4. **Work independently** — no guessing, no assumptions
5. **Be thorough** — follow all steps, verify all expected results

**You are NOT:**
- A developer fixing bugs
- Deciding what "should" work
- Skipping steps to save time

---

## Project Context — What You're Testing

**tuto.social** is a new social education platform built inside a monorepo alongside the main Tuto dashboard.

**What was built (so far):**
- Social feed with posts, reactions (like/love/curious), comments
- User profiles with follow/unfollow
- Group messaging with read receipts
- Reels (short videos)
- Creator dashboard (XP, stats, top content)
- School profiles (announcements, teacher list, achievements)
- Public leaderboard (teacher rankings by shields)
- Notifications system

**What you're testing today:**
- School profile pages (navigation, tabs, content)
- Notifications page (authentication, unread markers)
- Public leaderboard (podium, teacher rankings, follow buttons)
- Creator dashboard (XP bar, stats, top posts/reels, teacher shields)
- Header navigation links

---

## Test Environment Setup

### Web Social App
- **URL:** `http://localhost:3001`
- **Status:** Should be running (QA Manager confirmed ✅)
- **If not running:** Contact QA Manager

### Test Account
- **Email:** `marketing@tutoglobal.com`
- **Username:** `test_8z6r`
- **Role:** Parent user
- **Status:** Active in Supabase ✅

### Browser Requirements
- **Desktop browser** (Chrome, Firefox, Safari, Edge)
- **Not mobile** — use desktop width for tests
- Can use browser DevTools for inspection if needed
- Some tests use incognito/private mode (new windows, not logged in)

---

## Important Notes Before You Start

### ⚠️ Deferred/Not in Scope
- **Read receipts (✓✓):** Feature deferred — don't test
- **Typing indicator on web:** Feature deferred — don't test
- **Image/video messaging:** Not built for web yet — don't test
- **Parental controls:** Feature not fully built yet — don't test

### ✅ Know Your Test Accounts
You have ONE account for web tests:
```
Email: marketing@tutoglobal.com
Password: [QA Manager has this]
Username: test_8z6r
Role: Parent
```

For some tests, you'll need to open **incognito/private windows** to test unauthenticated flows.

### 📍 Known Issues (Not Bugs)
- iPhone 16e simulator shows dual nav bars (BUG-042) — not your concern today (mobile only)
- Some teacher shield data may not be complete in dev environment — report as BLOCKED, not FAIL

---

## How to Report Results

### Format
For each test case, provide:

```
TC-[number]: [PASS / FAIL / BLOCKED]
Observation: [1-line note of what you found]
[If FAIL: Describe the error or unexpected behavior]
[If applicable: Screenshot URL or error details]
```

### Example
```
TC-151: PASS
Observation: School profile loaded correctly with all 3 tabs visible

TC-152: FAIL
Observation: Announcements tab shows 500 error
Error: GET /school/1234/announcements returned HTTP 500
```

### Where to Report
Send your results to the QA Manager in this format:

**Subject:** BATCH 13 Web Test Results — [Your Name]

**Body:**
```
TC-151: PASS — School profile loads with all tabs
TC-152: FAIL — Announcements tab 500 error
TC-153: PASS — Staff tab shows 4 teachers
...
[All 17 test cases]

Any additional notes:
[Optional: general observations, blockers, environmental issues]
```

---

## Test Case Reference

**You have 17 test cases to execute:**

| Test ID | Feature | Severity |
|---------|---------|----------|
| TC-151 | School profile navigation | High |
| TC-152 | School announcements tab | High |
| TC-153 | School staff/teachers tab | Medium |
| TC-154 | School achievements tab | Medium |
| TC-155 | Notifications page (logged in) | High |
| TC-156 | Notifications page (login redirect) | Critical |
| TC-157 | Notifications unread indicator | High |
| TC-158 | Leaderboard public access | High |
| TC-159 | Leaderboard podium (top 3) | High |
| TC-160 | Leaderboard ranks 4+ | Medium |
| TC-161 | Leaderboard follow button | Medium |
| TC-162 | Dashboard login redirect | Critical |
| TC-163 | Dashboard XP/stats | High |
| TC-164 | Dashboard teacher shields | Medium |
| TC-165 | Dashboard top posts | High |
| TC-166 | Dashboard top reels | Medium |
| TC-167 | Header nav links | High |

---

## Step-by-Step Testing Process

### 1️⃣ Pre-Test Setup (5 min)
- [ ] Open browser to `http://localhost:3001`
- [ ] Clear cookies / open fresh browser window
- [ ] Log in with `marketing@tutoglobal.com`
- [ ] Verify you're authenticated (see username in header)

### 2️⃣ Execute Tests (50 min)
- [ ] Open the **BATCH 13 Test Prompts** document
- [ ] For each test case (TC-151 → TC-167):
  - Read the setup
  - Follow the exact steps
  - Verify expected results
  - Note the outcome
  - Capture any errors
- [ ] Some tests require incognito/private window (TC-156, TC-158, TC-162)
- [ ] Take screenshots if tests fail

### 3️⃣ Report Results (5 min)
- [ ] Compile all results in the format above
- [ ] Double-check test IDs and outcomes
- [ ] Submit to QA Manager

---

## Key Tips

### ✅ DO
- Follow steps **exactly as written** — don't skip or reorder
- Wait for pages to load fully (3-5 seconds) before checking
- Use browser DevTools (F12) if you need to inspect elements
- Take screenshots of **any errors** (FAIL cases)
- Note unexpected behaviors even if page "works"

### ❌ DON'T
- Assume features work if they're not explicitly tested
- Skip steps to save time
- Log in with different accounts unless instructed
- Test features outside the scope (messaging, video calls, etc.)
- Make up what "should" happen — only report what actually happens

### 🔍 Debugging Tips
- If pages don't load, refresh (F5)
- If you're stuck on a login page, make sure cookies are cleared
- If content doesn't appear, wait 5 seconds and check again
- Use browser DevTools Console (F12 → Console) to check for JavaScript errors

---

## Where to Find Reference Documents

**For detailed test steps:**
- `/docs/qa/BATCH13-TEST-PROMPTS.md` — All 17 test prompts (your working document)

**For project context:**
- `/docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` — Full project overview, all accounts, architecture

**For bug reporting:**
- If you find bugs, QA Manager logs them and assigns IDs (BUG-040, BUG-041, etc.)
- You don't need to create bug entries — just report what failed

---

## Your Checklist Before Starting

Before you begin, confirm:

- [ ] You have the BATCH 13 test prompts document
- [ ] You can access `http://localhost:3001`
- [ ] You can log in with `marketing@tutoglobal.com`
- [ ] You understand the reporting format
- [ ] You know which features are deferred (not in scope)
- [ ] You have QA Manager's contact info for blockers/questions

---

## Questions?

**If you get stuck:**
1. Try refreshing the page (F5)
2. Check browser console for errors (F12)
3. Re-read the test steps carefully
4. Contact QA Manager with:
   - Which test case you're stuck on
   - What you see vs. what's expected
   - Any error messages
   - Screenshot if possible

---

## Success Criteria

You've done a great job if:
- ✅ You complete all 17 test cases
- ✅ You report PASS/FAIL/BLOCKED for each
- ✅ You capture errors for failed tests
- ✅ You follow the exact steps (no shortcuts)
- ✅ Your results are clear and actionable

---

## Timeline

- **Start:** Now
- **Expected Completion:** ~60 minutes
- **Submission:** Results due to QA Manager when finished
- **Next:** QA Manager logs results, generates BATCH 14 prompts

---

## Ready to Go?

You have everything you need. Follow the BATCH 13 prompts, report results accurately, and let QA Manager know when you're done.

**Good luck! 🚀**

---

## Contact & Escalation

**For help during testing:**
- Contact: QA Manager
- About: Environment issues, blocker tests, unclear steps

**For bugs found:**
- Don't worry about fixing — just report what failed
- QA Manager creates bug entries
- Dev team prioritizes fixes

---

**Batch 13 Testing starts now. Begin with TC-151.**

