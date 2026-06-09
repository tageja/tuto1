# CSV UPDATE INSTRUCTIONS — BATCH 13 & 14 Re-test Results

**Date:** March 24, 2026  
**Test Agent Report:** Environment inconsistencies between local and shared Supabase

---

## Test-Cases CSV Updates

### CRITICAL FAILURES (Needs Investigation)

**TC-165** (BUG-047 — Post detail crash)
- **Old Status:** BLOCKED
- **New Status:** FAIL
- **Tester Notes:** "From /dashboard, top post opened /post/eeee0003-0000-4000-e000-000000000003 → Application error, digest 4097666128"
- **Bug ID Linked:** BUG-047
- **Root Cause:** Post detail still crashes; username or author data may be null for this specific post

**TC-152–154** (School profile 404)
- **Old Status:** BLOCKED
- **New Status:** FAIL
- **Tester Notes:** "After TC-151 navigation, /school/[id] showed Next.js 404 ('This page could not be found')"
- **Root Cause:** School page RLS or data issue (local environment)

**TC-159–161** (Leaderboard empty)
- **Old Status:** BLOCKED
- **New Status:** FAIL
- **Tester Notes:** "/leaderboard: 'Chưa có giáo viên nào...' — no teacher data locally"
- **Root Cause:** Data seeding may not have replicated locally

---

### FIXES VERIFIED ✅

**TC-151** (BUG-046 — School chip navigation)
- **Old Status:** BLOCKED
- **New Status:** PASS
- **Tester Notes:** "School chip focused on first click; Enter navigated to /school/[id] (not /profile/...)"
- **Fix Verified:** School chip now navigates to `/school/[id]`, not profile

**TC-169** (BUG-048 — Messages layout)
- **Old Status:** BLOCKED (Part 2)
- **New Status:** PASS
- **Tester Notes:** "Viewport 390×844, /messages: one heading 'Tin nhắn' (level 2); no duplicate message layout"
- **Fix Verified:** Single conversation list; no duplicate DOM

**TC-172** (BUG-049 — Messages search)
- **Old Status:** BLOCKED (Part 2)
- **New Status:** PASS
- **Tester Notes:** "Search 'Apollo': only Tarun (Apollo) remained; Tarun Tageja row disappeared — single filtered list"
- **Fix Verified:** Search filters correctly single list

**TC-155** (Notifications populated)
- **Old Status:** BLOCKED
- **New Status:** PASS
- **Tester Notes:** "/notifications: multiple rows (level-up, follow, comment, like) — not empty"
- **Fix Verified:** Data present locally

**TC-163** (Creator Dashboard stats)
- **Old Status:** BLOCKED
- **New Status:** PASS
- **Tester Notes:** "/dashboard: Cấp 3, 10 XP, 5 Posts, 0 Reels, 198 Views, 25 Likes. Streak not visible in accessibility snapshot"
- **Fix Verified:** Dashboard displaying stats correctly

---

## Bug Register CSV Updates

### BUG-046 — VERIFIED FIXED ✅
- **Status:** Verified Fixed
- **Verified By:** Test Agent 2026-03-24
- **Re-test Notes:** School chip URL correct; navigates to /school/[id], not /profile/[username]

### BUG-047 — STILL FAILING ❌
- **Status:** Open (Re-test Failed)
- **Re-test Notes:** Post detail still crashes with digest 4097666128 for post eeee0003-...
- **Action Needed:** Server logs + investigate post data

### BUG-048 — VERIFIED FIXED ✅
- **Status:** Verified Fixed
- **Verified By:** Test Agent 2026-03-24
- **Re-test Notes:** Single message layout confirmed; no duplicate in a11y tree

### BUG-049 — VERIFIED FIXED ✅
- **Status:** Verified Fixed
- **Verified By:** Test Agent 2026-03-24
- **Re-test Notes:** Search filters single list correctly; non-matching conversations hidden

---

## Recommendations for QA Manager

### Immediate Actions:

1. **Report TC-165 / BUG-047 to Dev Agent 1**
   - Post detail still crashes (digest 4097666128)
   - Requires server logs + post data investigation
   - Likely username/author field issue (same as TC-047 root cause, but persisting)

2. **Data Seeding Investigation**
   - TC-152–154 (school page 404): Check if school RLS policies or data differ locally
   - TC-159–161 (leaderboard empty): Confirm teacher shields seeded on shared environment where test agent ran

3. **Environment Verification**
   - Recommend re-running BATCH 13 & 14 on **shared staging environment** where PM seeded data
   - Local environment may have diverged from shared DB

### Next Test Batch:

After addressing TC-165 and clarifying environment data issues, proceed to:
- **BATCH 11** (Mobile notifications, achievements, gamification) — requires simulators
- **BATCH 12** (Mobile dashboard, reports, parental controls) — requires simulators

---

## Summary Table

| TC ID | Feature | Result | Issue | Action |
|-------|---------|--------|-------|--------|
| TC-151 | School chip navigation | ✅ PASS | — | Mark BUG-046 Verified Fixed |
| TC-152–154 | School profile 404 | ❌ FAIL | RLS/data locally | Investigate school data |
| TC-155 | Notifications | ✅ PASS | — | No action |
| TC-159–161 | Leaderboard | ❌ FAIL | Data not seeded | Verify seeding on shared env |
| TC-163 | Creator Dashboard | ✅ PASS | — | No action |
| TC-165 | Post detail crash | ❌ FAIL | digest 4097666128 | **Escalate to Dev Agent 1** |
| TC-169 | Messages layout | ✅ PASS | — | Mark BUG-048 Verified Fixed |
| TC-172 | Messages search | ✅ PASS | — | Mark BUG-049 Verified Fixed |

