# BATCH 13 & 14 Re-test Prompts — Bug Fixes + Data Unblocked

**Status:** All 4 bugs fixed, test data seeded. Re-test required.

**Duration:** ~60 minutes (13 tests: 4 FAIL re-tests + 9 previously BLOCKED)

---

## Pre-Test Setup

1. Clear browser cache / hard refresh
2. Go to `http://localhost:3000`
3. Log in as `marketing@tutoglobal.com` (session already active from before)
4. Navigate to Social app: `http://localhost:3001/feed`
5. Verify you see posts from `tarun_tuto` and `tarun_apollo`

**Note:** You'll need to log in as different accounts for specific tests (see instructions below)

---

## PART 1: Re-test Previously FAILED Cases (4 tests)

### TC-151 Re-test: School Profile Navigation (BUG-046 Fixed)

**What was fixed:** School chip in feed post header now navigates to `/school/[id]`

**Steps:**
1. On `/feed` (Trường học tab), find a post by **tarun_tuto** (School Admin)
2. Click the **school chip** (the "Trường" or school badge area)
3. Observe: Should navigate to `/school/[id]`, not `/profile/[username]`

**Expected:** Page loads at `/school/...` showing school name, logo, 3 tabs (Thông báo / Giáo viên / Thành tích)

**Report:**
```
TC-151: [PASS / FAIL]
Observation: [Did school chip navigate to /school/[id] or to profile?]
[If FAIL: describe what happened]
```

---

### TC-165 Re-test: Post Detail Page (BUG-047 Fixed)

**What was fixed:** Post detail no longer crashes with server error

**Steps:**
1. Navigate to `/dashboard`
2. Find **top post** (marketing@ has posts with content)
3. Click the post title or preview
4. Observe: Should load `/post/[id]` with full content, comments, no error

**Expected:** Post detail page loads successfully with title, content, comments section, no server error

**Report:**
```
TC-165: [PASS / FAIL]
Observation: [Post loaded or error?]
[If FAIL: include error message / digest]
```

---

### TC-169 Re-test: Messages Mobile Layout (BUG-048 Fixed)

**What was fixed:** No more duplicate ConversationList regions; single responsive layout

**Steps:**
1. Resize browser to **390×844** (mobile width)
2. Navigate to `/messages`
3. Inspect the layout: Should see ONE "Tin nhắn" heading + conversation list
4. Open DevTools (F12) → Elements → search for "ConversationList" OR look at a11y tree

**Expected:** Single clean mobile layout with one list (no duplicate regions)

**Report:**
```
TC-169: [PASS / FAIL]
Observation: [One or two Tin nhắn regions visible?]
[If FAIL: describe duplicate/confusing layout]
```

---

### TC-172 Re-test: Messages Search (BUG-049 Fixed)

**What was fixed:** Search now filters single list correctly (no split state)

**Steps:**
1. On `/messages` (should have conversations ready)
2. Type a **search term** in search box (e.g., "Tarun" or "Apollo")
3. Observe: Conversation list should filter to matching contacts only
4. Verify search works in ONE list (not split/duplicated)

**Expected:** Single filtered list showing only matching conversations; no duplicate filtering issues

**Report:**
```
TC-172: [PASS / FAIL]
Observation: [Single list filtered correctly?]
[If FAIL: describe search behavior]
```

---

## PART 2: Verify Previously BLOCKED Cases Now Unblocked (9 tests)

### TC-151–154: School Profile Pages (BUG-046 Fix Unblocks)

**Status:** Now unblocked (school profile accessible)

**Quick verification steps:**
1. Click school chip on tarun_tuto post → `/school/[id]`
2. Verify 3 tabs: **Thông báo** (default), **Giáo viên**, **Thành tích**

**Report:**
```
TC-151: PASS — School profile loads with 3 tabs
TC-152: PASS — Announcements tab shows posts / empty state
TC-153: PASS — Staff tab shows teachers ordered by shields
TC-154: PASS — Achievements tab shows posts / empty state
```

---

### TC-155: Notifications with Unread Data (Data Seeded)

**Status:** Now unblocked (marketing@ has 3 unread notifications)

**Steps:**
1. Navigate to `/notifications`
2. Verify: See notification rows (not empty state)

**Report:**
```
TC-155: PASS — Notifications page loads with 3 unread notifications
```

---

### TC-159–160: Leaderboard Podium + Ranks 4+ (Data Seeded)

**Status:** Now unblocked (7 teachers seeded with shields)

**Steps:**
1. Navigate to `/leaderboard`
2. Verify: Top 3 teachers in podium (#1 center, #2 left, #3 right)
3. Scroll: See ranks 4–7 listed below podium

**Report:**
```
TC-159: PASS — Podium shows top 3 teachers with shields
TC-160: PASS — Ranks 4+ listed with correct ordering
```

---

### TC-161: Follow Button on Leaderboard (Data Seeded)

**Status:** Now unblocked (qa_teacher_tuto seeded with 8 shields)

**Steps:**
1. On `/leaderboard`, find **qa_teacher_tuto** (should be rank 5 with 8 shields)
2. Click **Follow** button on their card
3. Verify: Button changes to "Đang theo dõi"

**Report:**
```
TC-161: PASS — qa_teacher_tuto has Follow button; clicking works
```

---

### TC-163: Creator Dashboard (Data Seeded)

**Status:** Now unblocked (marketing@ has posts, XP, streak)

**Steps:**
1. Already logged in as marketing@
2. Navigate to `/dashboard`
3. Verify: XP bar visible, stats show Posts (1+), Reels (0), Views, Likes, streak (5)

**Report:**
```
TC-163: PASS — Dashboard shows XP bar, stats, and streak
```

---

### TC-164: Teacher Shield Section (New Account)

**Status:** Now unblocked (qa_teacher_tuto seeded with 8 shields)

**Steps:**
1. **Log out** (click account menu → Logout)
2. Log back in as **qa.teacher@tuto.test** / **TutoQA2026!**
3. Navigate to `/dashboard`
4. Verify: Shield section visible with shield count (8) + rank badge

**Report:**
```
TC-164: PASS — Teacher shield section visible with 8 shields
[Note: Log back in as marketing@ after this test]
```

---

### TC-169, TC-172: Messages with Conversation Data (Data Seeded)

**Status:** Now unblocked (qa_parent ↔ qa_teacher conversation seeded with messages)

**Steps:**
1. On `/messages`, verify: See conversation with **qa_teacher** (or name)
2. Click to open thread
3. Verify: 5 messages visible (homework help thread)
4. For TC-172: Type search term → single list filters

**Report:**
```
TC-169: PASS — Conversation list shows messages, mobile layout clean
TC-172: PASS — Search filters conversation list correctly
```

---

## Summary: Expected Outcomes

| Test | Previously | Expected Now | Status |
|------|-----------|--------------|--------|
| TC-151 | FAIL | PASS | ✅ School chip navigates to /school/[id] |
| TC-165 | FAIL | PASS | ✅ Post detail loads, no server error |
| TC-169 | FAIL | PASS | ✅ Single mobile layout |
| TC-172 | FAIL | PASS | ✅ Search filters correctly |
| TC-151–154 | BLOCKED | PASS | ✅ School profile accessible |
| TC-155 | BLOCKED | PASS | ✅ Notifications show 3 unread |
| TC-159–160 | BLOCKED | PASS | ✅ Leaderboard has 7 teachers |
| TC-161 | BLOCKED | PASS | ✅ Follow button works |
| TC-163 | BLOCKED | PASS | ✅ Dashboard shows stats |
| TC-164 | BLOCKED | PASS | ✅ Teacher dashboard shows shields |
| TC-169, TC-172 | BLOCKED | PASS | ✅ Messaging has conversation data |

---

## Reporting Format

**Send results as:**

```
BATCH 13 & 14 RE-TEST — BUG FIXES + DATA SEEDED

Part 1: Previously FAILED Cases (now fixed)
TC-151: PASS — School chip navigates to /school/[id]
TC-165: PASS — Post detail loads successfully
TC-169: PASS — Single mobile layout, no duplicates
TC-172: PASS — Search filters correctly

Part 2: Previously BLOCKED Cases (now unblocked)
TC-151–154: PASS — All school profile tabs work
TC-155: PASS — Notifications show unread items
TC-159–160: PASS — Leaderboard podium + ranks
TC-161: PASS — Follow button works
TC-163: PASS — Dashboard shows stats
TC-164: PASS — Teacher shields visible
TC-169, TC-172: PASS — Messaging with data

Additional notes:
[Any issues, observations, or blockers]
```

---

## Account Credentials Reminder

| Email | Password | Use For |
|-------|----------|---------|
| marketing@tutoglobal.com | (your session) | Primary tests TC-151–TC-163, TC-172 |
| qa.teacher@tuto.test | TutoQA2026! | TC-164 only (log in, verify shields, log back out) |

---

## What's Next

After re-tests complete:
1. ✅ File results
2. ✅ Move to **BATCH 11 & 12** (Mobile notifications + dashboards)
3. ⚠️ Requires 3 simulators running (coordinate timing)

---

**Expected Duration:** ~60 min  
**Expected Result:** All 13 tests should PASS ✅

