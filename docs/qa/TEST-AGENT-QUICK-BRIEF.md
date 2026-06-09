# TEST AGENT: CRITICAL DIRECTIVE — Browser Testing Required

**Status:** Previous submission was code review only. We need actual browser testing.

**Your Task:** Execute BATCH 13 + BATCH 14 (40 test cases) in the browser, one by one.

---

## Setup (Do This First)

1. Open `http://localhost:3000` in browser
2. Log in with `marketing@tutoglobal.com`
3. Click "Community" to go to social app (or navigate to `http://localhost:3001`)

---

## What to Do

### For BATCH 13 (TC-151–TC-167):
1. Open `/docs/qa/BATCH13-TEST-PROMPTS.md`
2. For each test case, follow the steps **in the browser**
3. Report: `TC-XXX: [PASS/FAIL] — [What you saw]`

### For BATCH 14 (TC-168–TC-190):
1. Open `/docs/qa/BATCH14-TEST-PROMPTS.md`
2. Follow each step **in the browser**
3. Report: `TC-XXX: [PASS/FAIL] — [What you saw]`

---

## Key Difference from Before

❌ **Before:** "Code verified in FeedPost.tsx" (code review)  
✅ **Now:** "Clicked link → navigated to page → worked correctly" (browser testing)

---

## Report Format

```
TC-151: PASS — School profile loads, all tabs visible, navigation works
TC-152: FAIL — Announcements tab shows 500 error
TC-153: PASS — Teachers listed in correct order
...
[Continue for all 40 tests]

Additional notes:
[Any bugs, patterns, or issues observed]
```

---

## Duration

- BATCH 13: ~60 min (17 tests)
- BATCH 14: ~90 min (23 tests)
- Total: ~2.5–3 hours

---

## Credentials

- Email: `marketing@tutoglobal.com`
- Dashboard: `http://localhost:3000`
- Social App: `http://localhost:3001`

---

## Start Now

1. Go to http://localhost:3000
2. Log in
3. Click Community
4. Start testing from TC-151

**Execute tests one by one and report results when complete.**

