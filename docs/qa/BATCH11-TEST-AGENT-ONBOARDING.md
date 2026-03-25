# BATCH 11 — TEST AGENT ONBOARDING & CONTEXT

---

## Your Role: Mobile QA Test Agent

You are running automated & manual tests on a React Native mobile app called **tuto.social** — a social learning platform for educators and students in Vietnam.

**Your job:**
- Execute 28 mobile test cases sequentially
- Report results in a CSV file
- Log any bugs found
- Provide screenshots when tests fail or are unclear

**You are NOT:**
- Writing code or fixing bugs
- Designing tests (tests are pre-written for you)
- Making architectural decisions

---

## Platform & Architecture

### What You're Testing

**tuto.social** is a social feed app built with:
- **Frontend:** React Native (Expo) — runs on iOS/Android simulators
- **Backend:** Firebase Functions + Supabase (PostgreSQL database)
- **Features being tested:**
  - Notifications (bell icon, notification centre, realtime delivery)
  - Gamification (XP, levels, achievements, streaks)
  - Leaderboard (teacher rankings by shields)
  - User engagement metrics (view counts, likes, comments)

### Two Test Environments (Know the difference!)

| Aspect | Web | Mobile |
|--------|-----|--------|
| **Platform** | Next.js; localhost:3001 | React Native/Expo; iOS simulator |
| **Focus** | BATCH 13 & 14 (feed, profiles, messages, settings) | BATCH 11 & 12 (notifications, gamification, dashboards) |
| **Test Method** | Browser automation (MCP) | Manual interaction on simulator |
| **Your Role** | Not applicable | **YOU ARE HERE** |

---

## Simulator Setup & Launch

### Prerequisite Check

**Before running ANY test:**

```bash
# Terminal 1: Start Metro bundler
cd /Users/pc/tutoAll/tuto1
npx expo start --clear

# Terminal 2 (or separate): Build on each simulator
# (Pre-built for you; just verify in Simulator apps)
```

**Verify:**
- ✅ Metro terminal shows "Metro waiting on exp://..." (or similar)
- ✅ All 3 iPhone simulators have tuto_social app installed
- ✅ Can tap app icon and see login screen or feed

### Quick Simulator Commands

```bash
# If app crashes or is not installed
npx expo run:ios --device "iPhone 17 Pro"

# List available simulators
xcrun simctl list devices

# Open simulator if closed
xcrun simctl boot "iPhone 17 Pro"
```

---

## Test Data & Pre-Seeded Accounts

### Accounts (All Pre-Seeded in Supabase)

| Username | Email | Role | Device | Password |
|----------|-------|------|--------|----------|
| `tarun_apollo` | tarun.tageja@apollo.edu.vn | teacher | iPhone 17 Pro | (existing) |
| `we_are_banana_republic_ul87` | tarun.tageja@gmail.com | parent | iPhone 17 Pro Max | (existing) |
| `tarun_tageja` | tarun@tutoglobal.com | parent | iPhone 16e | (existing) |

### Pre-Seeded Data

**For tarun_apollo (teacher):**
- 1 existing post (to test likes, comments, notifications)
- 0 followers initially (will receive first follower in tests)
- 12+ shield count (from previous posts with subject tags)

**For we_are_banana_republic_ul87 (parent):**
- Ability to like, comment, follow tarun_apollo
- No special role restrictions

---

## BATCH 11 Structure

### 5 Testing Phases

**Phase 1: Notification System (TC-093–101)**
- Bell icon + unread badge
- Notification centre (full list)
- Notification types (like, comment, follow)
- Settings to disable notification types
- Empty state handling

**Phase 2: Realtime Notifications (TC-102–105)**
- Like notification delivery (with two devices)
- Comment notification delivery
- Follow notification delivery
- XP updates in real-time

**Phase 3: Achievements (TC-106–114)**
- Unlock on first post
- Unlock on first like received
- Unlock on first follow received
- Streak counter logic
- Achievement auto-posts (simulation)

**Phase 4: Teacher Leaderboard (TC-109–114)**
- Leaderboard page loads + ranking by shields
- Shield awards (educational post +5, comment +1, share +1)
- Pagination (top 10 then load more)

**Phase 5: Creator Dashboard & Gamification (TC-115–120)**
- XP progress bar + level display
- Streak flame badge
- Notification badge clear on open
- Settings persistence across app restart

---

## Pre-Conditions by Phase

### Before Phase 1 (TC-093–105)
- [ ] Both simulators logged in
- [ ] tarun_apollo has ≥ 1 post in feed
- [ ] we_are_banana_republic can reach tarun_apollo's profile
- [ ] Notifications enabled on both devices

### Before Phase 3 (TC-106–114)
- [ ] Metro terminal visible (to see [DBG] logs for achievements)
- [ ] tarun_apollo NOT already at maximum XP (for XP increment tests)
- [ ] No prior achievements earned (or prepare for incremental unlocks)

### Before Phase 4 (TC-109–114)
- [ ] ≥ 2 teachers in DB with different shield counts (pre-seeded)
- [ ] tarun_apollo's profile synced with correct shield count

---

## Key Concepts

### Gamification System

**XP (Experience Points):**
- +50 for creating a post
- +3 for receiving a like
- +5 for receiving a comment
- +10 for receiving a follow
- Cumulative → unlocks level thresholds

**Levels:**
- Level 1: 0–100 XP
- Level 2: 100–200 XP
- Level 3: 200–500 XP
- (Scale depends on implementation)

**Achievements:**
- "Người mới bắt đầu" (First Post) — unlock when create first post
- "Được yêu thích" (First Like) — unlock when receive first like
- "Có người theo dõi" (First Follower) — unlock when receive first follow
- (More may exist; verify in UI)

**Streaks:**
- Increments by 1 for each day a post is created
- Resets to 0 if a day is skipped
- Flame icon visible when streak ≥ 3

**Teacher Shields (🛡️):**
- +5 shields for educational post (post with subject tags)
- +1 shield per comment received
- +1 shield per share received
- Ranking: Beginner < Bronze (50+) < Silver (100+) < Gold (200+)

### Realtime Notifications (Firebase/Supabase)

Two devices in same app:
- **Device A** sends an action (like, comment, follow)
- **Device B** receives notification in ≤ 2–3 seconds WITHOUT manual refresh
- Uses Supabase Realtime (websockets on social_notifications table)

---

## Common Test Patterns

### Pattern 1: Two-Device Notification Test

```
Device A (iPhone 17 Pro - tarun_apollo):
  1. Open NotificationsScreen
  2. Note current notification count

Device B (iPhone 17 Pro Max - parent):
  1. Like a post by tarun_apollo
  2. Return to Device A (NO REFRESH)
  3. Wait 2–3 seconds
  4. Check if notification appeared

Result: PASS if notification visible within 3s
```

### Pattern 2: Achievement Unlock Test

```
Device A (iPhone 17 Pro - tarun_apollo):
  1. Note current XP and level on Profile

Device A (continue):
  1. Create a new post with subject tags
  2. Watch for achievement unlock animation/modal
  3. Check Profile → Achievements for new earned badge

Result: PASS if modal appeared + XP increased + badge earned
```

### Pattern 3: Settings Persistence Test

```
Device A:
  1. Open Settings → Notifications
  2. Toggle OFF a setting (e.g. comments)
  3. Force-close app
  4. Reopen app
  5. Navigate back to Settings
  6. Check if toggle still OFF

Result: PASS if setting persisted (not reset)
```

---

## How to Report

### For EACH Test Case:

**Update CSV file:** `docs/qa/test-cases.csv`

| Column | Value | Example |
|--------|-------|---------|
| Batch | BATCH 11 | BATCH 11 |
| Test ID | TC-093, TC-094, ... | TC-093 |
| Status | PASS / FAIL / BLOCKED / SKIPPED | PASS |
| Tester Notes | 1–2 lines, specific | "Badge shows count=1; clears after bell tap" |
| Bug ID Linked | (if FAIL) BUG-050, BUG-051, ... | BUG-050 |
| Re-test Notes | (leave blank for first run) | — |

### Screenshots

Take screenshots for:
- ✅ FAIL cases (for root cause analysis)
- ✅ Unusual behavior (for clarification)
- ❌ NOT for PASS cases (unless you want to document)

**Save to:** `/Users/pc/tutoAll/tuto1/docs/qa/screenshots/` (create folder if needed)  
**Name format:** `TC-093-bell-badge.png`, `TC-099-push-notification.png`

### Bug Reporting

If you find a new bug (FAIL test):

1. **Create new BUG ID** (next available: BUG-050, BUG-051, etc.)
2. **Add to bug-register.csv:**

```csv
BUG-050,Notification badge not clearing on open,High,Open,TC-093,March 24 2026,Bell icon badge stays red after opening NotificationsScreen; badge should clear to 0,Badge clearing logic broken in NotificationsScreen component,
```

3. **Link in test-cases.csv:** Set "Bug ID Linked" to BUG-050
4. **Escalate if Critical:** Message QA Manager immediately

---

## Helpful Commands & Troubleshooting

### Metro Terminal Issues

**If Metro crashes or hangs:**
```bash
pkill -9 node expo xcodebuild
cd /Users/pc/tutoAll/tuto1
npx expo start --clear
```

**To force-reload app from Metro terminal:**
- Press `r` in Metro terminal (reloads JavaScript)
- Or shake simulator → tap "Reload"

### Simulator Issues

**If app crashes on simulator:**
```bash
xcrun simctl uninstall "iPhone 17 Pro" com.tutoglobal.tuto_social
npx expo run:ios --device "iPhone 17 Pro"
```

**If simulator is slow:**
```bash
xcrun simctl erase all   # WARNING: erases all data
xcrun simctl boot "iPhone 17 Pro"  # reboot
```

### DB Verification (if needed)

If you need to verify test data in Supabase:
- Check social_notifications table for new rows
- Check social_profiles for XP/level updates
- Check social_achievements for earned badges
- (Access via Supabase dashboard or SQL queries)

---

## Expected Outcomes

### Success Criteria

✅ **≥ 90% PASS** (≥ 25/28 cases)

- If 25+ PASS: ready for BATCH 12 (dashboards + parental controls)
- If 20–24 PASS: log bugs, wait for fixes, re-test
- If < 20 PASS: escalate to QA Manager + Dev team

### Timeline

| Phase | Est. Time |
|-------|-----------|
| Phase 1 (TC-093–101) | 45–60 min |
| Phase 2 (TC-102–105) | 30–45 min |
| Phase 3 (TC-106–114) | 60–75 min |
| Phase 4 & 5 (TC-115–120) | 45–60 min |
| **Total** | **3–4 hours** |

---

## Communication

**If you get stuck:**
1. Check this brief + full BATCH11-TEST-PROMPTS.md
2. Screenshot the issue
3. Message QA Manager (us!) with:
   - Test ID
   - Error message / screenshot
   - What you expected vs. what happened

**Good luck! You've got this.** 🚀

