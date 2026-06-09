# Test Agent: BATCH 13 & 14 Re-test — All Fixes Ready

**Status:** 4 bugs fixed + test data seeded. Quick re-test needed.

**Duration:** ~60 minutes (13 tests)

---

## What Changed

✅ **BUG-046 Fixed** — School chip now navigates to `/school/[id]` (was broken link)  
✅ **BUG-047 Fixed** — Post detail page no longer crashes (was server error)  
✅ **BUG-048 Fixed** — Messages mobile layout now single list (was duplicate regions)  
✅ **BUG-049 Fixed** — Messages search now works correctly (was split state)  

✅ **Data Seeded:**
- 7 teachers on leaderboard (with shields)
- 3 unread notifications for marketing@
- Posts, XP, streak data for marketing@
- Conversation messages ready for messaging tests

---

## Quick Test Checklist

**Part 1: Verify Fixes (4 tests)**
- [ ] TC-151: School chip → /school/[id] (not profile)
- [ ] TC-165: Post detail loads (no error)
- [ ] TC-169: Mobile messages → single layout
- [ ] TC-172: Messages search → single filtered list

**Part 2: Verify Data Unblocked (9 tests)**
- [ ] TC-151–154: School profile tabs work
- [ ] TC-155: Notifications show unread
- [ ] TC-159–160: Leaderboard podium + ranks
- [ ] TC-161: Follow button works
- [ ] TC-163: Dashboard stats visible
- [ ] TC-164: Teacher shields visible (log in as qa.teacher@tuto.test)
- [ ] TC-169, TC-172: Messaging with conversation data

---

## Accounts

| Email | Password | For |
|-------|----------|-----|
| marketing@tutoglobal.com | (session) | Main tests |
| qa.teacher@tuto.test | TutoQA2026! | TC-164 only |

---

## Reference

Full prompts: `/docs/qa/BATCH13-14-RETEST-PROMPTS-FINAL.md`

---

## Report Format

```
TC-151: PASS — School chip navigates correctly
TC-165: PASS — Post detail loads
TC-169: PASS — Single mobile layout
TC-172: PASS — Search filters correctly
TC-151–154: PASS — School profile working
[... continue for all 13 tests ...]
```

---

**Expected:** All 13 tests should PASS ✅

Start now!

