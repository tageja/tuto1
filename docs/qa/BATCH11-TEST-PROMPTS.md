# BATCH 11: Mobile Notifications, Achievements & Gamification

**Platform:** Mobile (iOS/Android simulators)  
**Total Test Cases:** 28 (TC-093 through TC-120)  
**Focus Areas:** In-app notifications, push notifications, achievements, XP, streaks, leaderboard, teacher shields  
**Estimated Duration:** 3–4 hours  
**Date:** March 2026  

---

## ⚙️ SETUP INSTRUCTIONS

### Prerequisites

**Simulators Required:** 3 devices (or 2 if you can manually trigger actions on 1)
- **iPhone 17 Pro:** tarun_apollo (teacher account) — primary for notifications
- **iPhone 17 Pro Max:** we_are_banana_republic_ul87 (parent account) — secondary user for interaction
- **iPhone 16e:** (optional) — for cross-device real-time testing

**Accounts Pre-Seeded:**

| Device | Email | Username | Role | Password | Use |
|--------|-------|----------|------|----------|-----|
| iPhone 17 Pro | tarun.tageja@apollo.edu.vn | tarun_apollo | teacher | (existing) | Notification recipient; achievement unlocks |
| iPhone 17 Pro Max | tarun.tageja@gmail.com | we_are_banana_republic_ul87 | parent | (existing) | Action trigger (like, comment, follow) |
| iPhone 16e | tarun@tutoglobal.com | tarun_tageja | parent | (existing) | (optional) Realtime cross-device |

**Metro Terminal:** Keep visible during entire test to observe `[DBG]` log lines for achievement triggers.

**Notification Setup:**
1. Ensure all three simulators have notifications enabled (Settings → Privacy → Notifications → tuto_social: ON)
2. Ensure tuto_social app is set to "Foreground + Banner + Badge"
3. First launch: allow push notification permissions when prompted

---

## 📋 TEST METHODOLOGY

### For Each Test Case:

1. **Read the case** (steps & expected result)
2. **Set up pre-conditions** (if needed: create post, trigger action, etc.)
3. **Perform steps exactly** (tap, type, wait — match the numbering)
4. **Observe & verify**
   - Screenshot if UI changes or assertion fails
   - Check console / logs
   - Verify DB state when applicable (e.g. XP change)
5. **Report result**
   - PASS / FAIL / BLOCKED in test-cases.csv
   - Tester Notes: 1–2 lines describing observation
   - Screenshot: Only on FAIL or special observation
   - Bug ID: If failure, link to existing or new bug

### Real-Time Notifications Test Pattern:

For Realtime tests (TC-095, TC-118, TC-119), use **two simulators**:

```
Simulator A (notification recipient) ← observes
Simulator B (action trigger) ← performs action
```

After Sim B completes action → wait 2–3 seconds → check Sim A without refresh.

---

## 🏃 TEST FLOW

### Phase 1: Foundation (TC-093 to TC-101)
Setup notification system; verify bell icon + notification centre + notification types.

### Phase 2: Realtime Interactions (TC-102 to TC-105)
Test like/comment/follow notifications with real-time delivery between two simulators.

### Phase 3: Achievements (TC-106 to TC-116)
Unlock achievements; verify XP and level updates; test achievement notifications.

### Phase 4: Streaks (TC-107 to TC-108)
Verify streak counter logic (day increment, break conditions).

### Phase 5: Leaderboard & Shields (TC-109 to TC-114)
Verify teacher leaderboard ranking; shield awards for educational content.

### Phase 6: Creator Dashboard Gamification (TC-115 to TC-120)
Verify XP bar, level badge, streak flame, and top content sections on Creator Dashboard.

---

## 🎯 BATCH 11 TEST CASES

---

### TC-093: In-app notification bell — unread badge
**Severity:** High  
**Pre-conditions:** tarun_apollo logged in; we_are_banana_republic (parent) has posted or can like a post by tarun_apollo  
**Setup:** 
1. On iPhone 17 Pro Max (parent account), like a post by tarun_apollo  
2. Switch to iPhone 17 Pro (tarun_apollo)

**Steps:**
1. From iPhone 17 Pro (tarun_apollo account), tap the bell icon in SocialFeedScreen header
2. Observe the bell icon area before tapping
3. Check if a red unread badge with count ≥ 1 is visible
4. After tapping, does the badge count decrement or disappear?

**Expected Result:**  
Bell icon shows a red unread badge with count ≥ 1 before tap. After tapping bell, badge either clears or decrements.

**Report Back:**
- PASS / FAIL
- Screenshot: bell icon with badge (if visible)
- Tester Notes: e.g. "Badge shows count=1; clears after tap"

---

### TC-094: Notification centre — full list opens
**Severity:** High  
**Pre-conditions:** TC-093 passed (bell icon visible with unread badge)  

**Steps:**
1. From iPhone 17 Pro (tarun_apollo), tap the bell icon to open NotificationsScreen
2. Wait for NotificationsScreen to fully load (up to 5 seconds)
3. Inspect the list of notification rows

**Expected Result:**  
NotificationsScreen opens without crash. List shows notification rows with:
- Avatar (sender's profile picture)
- Action text (e.g. "Tarun đã thích bài viết của bạn")
- Relative timestamp (e.g. "2 phút trước")
- Unread rows have highlighted/different background

**Report Back:**
- PASS / FAIL
- Screenshot: NotificationsScreen full list
- Tester Notes: e.g. "List loaded with 3 rows; unread rows highlighted"

---

### TC-095: Notification types display correctly
**Severity:** High  
**Pre-conditions:** Multiple notification types must exist in social_notifications for tarun_apollo  
**Trigger actions from we_are_banana_republic (iPhone 17 Pro Max):**
1. Like a post by tarun_apollo (❤️ like)
2. Comment on a post by tarun_apollo (💬 comment)
3. Follow tarun_apollo (👤 follow)

**Setup Steps (on iPhone 17 Pro Max - parent account):**
1. Open Feed tab
2. Find a post by tarun_apollo
3. Tap the heart/Thích button to like
4. Tap the comment bubble to add comment "Great post!" and submit
5. Navigate to tarun_apollo's profile
6. Tap Follow button

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Open NotificationsScreen (tap bell icon)
2. Inspect each notification row for correct icons and text
3. Verify you see at least:
   - A ❤️ like notification: "(name) đã thích bài viết của bạn"
   - A 💬 comment notification: "(name) đã bình luận"
   - A 👤 follow notification: "(name) đã theo dõi bạn"

**Expected Result:**  
Each notification displays:
- Correct icon (heart for like, comment bubble for comment, person for follow)
- Action text in Vietnamese
- Sender name
- Relative timestamp (accurate)

**Report Back:**
- PASS / FAIL
- Screenshot: NotificationsScreen showing all 3 types
- Tester Notes: e.g. "Like ❤️ / Comment 💬 / Follow 👤 all display correctly with text"

---

### TC-096: Tap notification navigates to correct screen
**Severity:** High  
**Pre-conditions:** TC-094 passed (NotificationsScreen loaded with ≥ 2 notification types)  

**Steps:**
1. From NotificationsScreen on iPhone 17 Pro (tarun_apollo), tap the like notification row
2. Wait for navigation (~2 seconds)
3. Verify which screen you land on (post detail or profile?)
4. Go back to NotificationsScreen
5. Tap the follow notification row
6. Verify navigation destination

**Expected Result:**  
- Like/comment notification → navigates to the specific post detail screen (/post/[id])
- Follow notification → navigates to the follower's profile page (/profile/[username])
- No crash on navigation

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Like notif → /post/[id] ✓ | Follow notif → /profile/[username] ✓"

---

### TC-097: Mark all notifications as read
**Severity:** Medium  
**Pre-conditions:** NotificationsScreen open with ≥ 3 unread notifications  

**Steps:**
1. From NotificationsScreen on iPhone 17 Pro, look for a "Đánh dấu tất cả là đã đọc" (Mark all as read) button or option
2. Tap it
3. Observe all notification rows — do they change appearance?
4. Tap the bell icon to close NotificationsScreen
5. Reopen NotificationsScreen
6. Check if all rows remain in read state

**Expected Result:**  
- All notification rows switch from highlighted (unread) to normal background
- Badge on bell icon clears to 0
- After reopening NotificationsScreen, all rows remain read
- No crash

**Report Back:**
- PASS / FAIL / NOT FOUND (if button doesn't exist)
- Tester Notes: e.g. "Mark all button found; all rows de-highlighted after tap; badge clears"

---

### TC-098: Notification preference — disable likes
**Severity:** Medium  
**Pre-conditions:** tarun_apollo logged in on iPhone 17 Pro  

**Steps:**
1. Navigate to Profile tab
2. Tap Settings or Cài đặt option
3. Look for Thông báo (Notifications) settings
4. Find the toggle for "Lượt thích" (Likes) and toggle it OFF
5. Go back to iPhone 17 Pro Max (parent account)
6. Like another post by tarun_apollo
7. Switch back to iPhone 17 Pro
8. Open NotificationsScreen
9. Check if any new like notification appears
10. Verify other notification types (comments, follows) still arrive

**Expected Result:**  
- After disabling like notifications, no new like notifications appear in the list
- Other notification types (comments, follows) still work
- Preference persists (can be re-enabled by toggling ON)

**Report Back:**
- PASS / FAIL / BLOCKED (if settings screen not found)
- Tester Notes: e.g. "Like toggle disabled; liked post does not trigger notification"

---

### TC-099: Push notification received when app is backgrounded
**Severity:** High  
**Pre-conditions:** Push token registered; tarun_apollo's app in foreground initially  

**Steps:**
1. On iPhone 17 Pro (tarun_apollo), open tuto_social app (foreground)
2. Press Home button or send app to background (do NOT close)
3. On iPhone 17 Pro Max (parent account), like a post by tarun_apollo
4. Wait up to 5 seconds
5. Observe tarun_apollo's device screen — do you see a push notification banner?
6. If banner appears, note the text and icon

**Expected Result:**  
A push notification banner appears on the device lock screen or notification tray with text such as:
- "Tarun đã thích bài viết của bạn"
- Or similar action text from the parent

**Report Back:**
- PASS / FAIL
- Screenshot: Push notification banner (if visible)
- Tester Notes: e.g. "Push banner appeared with text '(Name) đã thích bài viết'"

---

### TC-100: Push notification deep links to correct screen
**Severity:** High  
**Pre-conditions:** TC-099 passed (push notification received and still visible)  

**Steps:**
1. With the push notification banner visible, tap it
2. App foregrounds (or launches if backgrounded)
3. Observe which screen the app opens to

**Expected Result:**  
App navigates to the relevant detail screen:
- Like notification → opens the specific post detail screen (not just home)
- Follow notification → opens the follower's profile screen

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Tapped push banner → app opened to /post/[id] (correct post detail)"

---

### TC-101: Achievement unlock — first post
**Severity:** High  
**Pre-conditions:** tarun_apollo has NEVER posted before (or achievement not yet earned)  

**Setup (on iPhone 17 Pro - tarun_apollo):**
1. Navigate to Feed or Create tab
2. Create a new text post (e.g. "First post achievement test 🎉")
3. Select audience (Công khai or Trường học)
4. Add subject tags (optional)
5. Tap Đăng (Post)

**Main Test:**
1. After successful post submission, watch for an achievement unlock modal or toast notification
2. Dismiss the modal or wait for toast to disappear
3. Navigate to Profile → Achievements tab (if it exists)
4. Look for "Người mới bắt đầu" (First Post) achievement as earned
5. Check if XP balance increased

**Expected Result:**  
- Achievement unlock animation or modal appears after post submission
- AchievementsScreen (or Achievements tab) shows "Người mới bắt đầu" badge as earned with date
- XP balance increases by the defined reward amount

**Report Back:**
- PASS / FAIL
- Screenshot: Achievement unlock modal (if appeared)
- Tester Notes: e.g. "Post submitted → achievement modal appeared → XP +50"

---

### TC-102: Achievement unlock — first like received
**Severity:** High  
**Pre-conditions:** tarun_apollo has a post; has NOT yet received a like; "Được yêu thích" achievement not earned  

**Setup (on iPhone 17 Pro Max - parent account):**
1. Find a post by tarun_apollo
2. Like it (tap Thích button)

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Check NotificationsScreen for the like notification
2. Also check if an achievement unlock notification appears
3. Open Profile → Achievements tab
4. Verify "Được yêu thích" (First Like) badge is now earned

**Expected Result:**  
- Notification row appears in NotificationsScreen: "(Name) đã thích bài viết của bạn"
- Achievement unlock fires and shows "Được yêu thích" as unlocked
- XP increases by achievement reward

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Like received → notification appeared → 'Được yêu thích' achievement unlocked"

---

### TC-103: Achievement unlock — first follow received
**Severity:** Medium  
**Pre-conditions:** tarun_apollo has zero followers; "Có người theo dõi" achievement not earned  

**Setup (on iPhone 17 Pro Max - parent account):**
1. Navigate to tarun_apollo's profile
2. Tap Follow button

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Check NotificationsScreen for follow notification
2. Open Achievements tab
3. Verify "Có người theo dõi" (First Follower) badge is earned

**Expected Result:**  
- Follow notification visible: "(Name) đã theo dõi bạn"
- "Có người theo dõi" achievement unlocked
- XP increases

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Follow received → 'Có người theo dõi' achievement earned"

---

### TC-104: XP progress bar updates after earning
**Severity:** High  
**Pre-conditions:** tarun_apollo has some XP (from posting, likes received, etc.)  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Note current XP value and level shown on Profile tab
2. Have we_are_banana_republic (parent) perform an action that awards XP:
   - Like a post by tarun_apollo (tarun_apollo +3 XP)
   - Comment on a post by tarun_apollo (tarun_apollo +5 XP)
   - OR receive a comment (tarun_apollo +1 XP)
3. Wait 2–3 seconds
4. Return to Profile tab (or refresh if needed)
5. Check XP value — did it increase?

**Expected Result:**  
- XP value increases by the defined amount for the action
- If threshold crossed, level increments (e.g. Level 1 → Level 2) and animation/toast shown
- XP progress bar animates to new value

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Like received → XP +3 (was 47, now 50) ✓"

---

### TC-105: Level display on profile
**Severity:** Medium  
**Pre-conditions:** tarun_apollo is at least Level 1 (has ≥ some XP threshold)  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Open Profile tab
2. Inspect the header area below the avatar

**Expected Result:**  
- Level badge visible (e.g. "Cấp 1" or star icon)
- XP progress bar visible showing current XP / XP needed for next level
- No crash on profile load

**Report Back:**
- PASS / FAIL
- Screenshot: Profile header with level badge visible
- Tester Notes: e.g. "Level 1 badge + XP bar (50/100) visible"

---

### TC-106: Streak counter — daily streak starts
**Severity:** Medium  
**Pre-conditions:** tarun_apollo has NOT posted today (streak = 0 or is day 1)  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Navigate to Creator Dashboard (Profile → Tổng quan sáng tạo or similar)
2. OR inspect StreakCounter component on Profile tab
3. Create a new post

**Expected Result:**  
- After posting, streak shows "1 ngày liên tiếp" (1 day streak)
- Flame/streak icon visible
- No double-count if already posted today

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Post created → streak shows '1 ngày liên tiếp' with flame icon"

---

### TC-107: Streak counter — consecutive day increases streak
**Severity:** Medium  
**Pre-conditions:** tarun_apollo has streak = 1 (posted yesterday; simulated via DB if needed: `UPDATE social_profiles SET last_post_date = CURRENT_DATE - INTERVAL '1 day'`)  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Create a post on the second consecutive day (or manually set last_post_date to yesterday via DB)
2. Check streak counter on Profile or Creator Dashboard

**Expected Result:**  
- Streak increments to 2
- Visual indicator updates
- If milestone streak (e.g. 7 days), achievement unlock fires

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Second day post → streak incremented to 2"

---

### TC-108: Streak breaks when a day is missed
**Severity:** Low  
**Pre-conditions:** tarun_apollo has streak ≥ 2  

**Setup (via DB or manual wait):**
1. Set `last_post_date` to 2 days ago (simulating missed day): `UPDATE social_profiles SET last_post_date = CURRENT_DATE - INTERVAL '2 days' WHERE username = 'tarun_apollo'`

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Open Profile or Creator Dashboard
2. Inspect streak counter

**Expected Result:**  
- Streak resets to 0 OR shows "Chuỗi bị gián đoạn" (streak broken) indicator
- No false streak maintained

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Last post 2 days ago → streak reset to 0"

---

### TC-109: Leaderboard — teacher shield ranking
**Severity:** High  
**Pre-conditions:** ≥ 2 teacher accounts exist with different shield_count in social_profiles  

**Steps (on iPhone 17 Pro - tarun_apollo [teacher account]):**
1. Navigate to Leaderboard tab (should be in main nav or tab bar)
2. Wait for content to load
3. Inspect the list of teachers

**Expected Result:**  
- Leaderboard visible showing teachers sorted by shield_count descending
- Each row shows:
  - Avatar
  - Display name
  - Subject (if available)
  - Shield count with icon (🛡️ N)
- Rank numbers visible (1st, 2nd, 3rd...)
- No crash or 500 error

**Report Back:**
- PASS / FAIL / NOT FOUND (if Leaderboard tab doesn't exist)
- Screenshot: Leaderboard list
- Tester Notes: e.g. "3 teachers ranked by shields: Nguyễn (45🛡️) / Phạm (28🛡️) / Trần (18🛡️)"

---

### TC-110: Leaderboard — top 10 only loads first
**Severity:** Medium  
**Pre-conditions:** ≥ 15 teachers in DB with shield_count > 0  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Open Leaderboard
2. Count visible rows (should be ≤ 10)
3. Scroll to bottom of list
4. Check if more teachers load (pagination)

**Expected Result:**  
- First 10 teachers visible on initial load
- Scroll to bottom triggers load of next batch (pagination)
- No crash on scroll

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "10 teachers loaded; scrolling loaded next 10 (total 20 visible)"

---

### TC-111: Teacher shield awarded for educational post
**Severity:** High  
**Pre-conditions:** tarun_apollo logged in (teacher account); note current shield_count  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Note current shield count on Profile or Creator Dashboard
2. Create a new post
3. Add ≥ 1 subject tag (e.g. "Toán", "Tiếng Anh")
4. Submit post
5. Check Profile or Creator Dashboard — did shield_count increase?

**Expected Result:**  
- shield_count increases by exactly 5 (reward for educational content with subject tag)
- Shield display on profile header updates immediately
- Rank may change if threshold crossed (e.g. 45 → 50 triggers bronze rank)

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Post with subject 'Toán' → shields 12 → 17 (+5) ✓"

---

### TC-112: Teacher shield awarded for share of their content
**Severity:** Medium  
**Pre-conditions:** tarun_apollo (teacher) has existing post; we_are_banana_republic (parent) ready to share  

**Setup (on iPhone 17 Pro Max - parent account):**
1. Find a post by tarun_apollo
2. Tap share button
3. Complete share action

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Check shield count on Profile or Leaderboard
2. Did it increase by 1?

**Expected Result:**  
- Teacher's shield_count increases by 1 per share
- Multiple shares from different users each increment independently
- Leaderboard ranking may change

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Post shared → shields 17 → 18 (+1) ✓"

---

### TC-113: Teacher shield awarded for comment received
**Severity:** Medium  
**Pre-conditions:** tarun_apollo (teacher) has post; we_are_banana_republic (parent) ready to comment  

**Setup (on iPhone 17 Pro Max - parent account):**
1. Find a post by tarun_apollo
2. Tap comment
3. Type comment (e.g. "Great teaching!")
4. Submit

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Check for comment notification
2. Check shield count on Profile or Leaderboard
3. Did it increase by 1?

**Expected Result:**  
- shield_count increments by 1 per comment received
- Multiple comments increase count cumulatively across all posts
- Notification sent to teacher for the comment

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Comment received → shields 18 → 19 (+1) ✓"

---

### TC-114: Achievement auto-post — student milestone (simulation)
**Severity:** Medium  
**Pre-conditions:** Achievement auto-post DB function configured  

**Setup (Manual DB trigger or via backend):**
1. Simulate a student completing a milestone
2. Or trigger the achievement auto-post DB function for tarun_apollo manually

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Refresh Feed tab
2. Check for a new achievement post card

**Expected Result:**  
- Achievement post card appears in feed for all users
- Card shows: student name + achievement name + date
- Post type is "achievement"
- Visual is distinct from regular posts (celebration emoji, different styling)

**Report Back:**
- PASS / FAIL / SKIPPED (if DB trigger not available)
- Screenshot: Achievement post card
- Tester Notes: e.g. "Achievement post 'Hoàn thành Module 1' appears in feed"

---

### TC-115: Notification bell badge — clears on open
**Severity:** Medium  
**Pre-conditions:** NotificationsScreen has unread notifications (red badge visible on bell)  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Note badge count on bell icon
2. Tap bell to open NotificationsScreen
3. Keep NotificationsScreen open for 2 seconds
4. Check if badge clears to 0
5. Exit NotificationsScreen (go back to Feed)

**Expected Result:**  
- Badge count clears to 0 after opening NotificationsScreen
- Badge does NOT reappear unless new notifications arrive

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Badge count=3; cleared after opening NotificationsScreen"

---

### TC-116: Empty notifications state
**Severity:** Low  
**Pre-conditions:** User has no notifications (new account or all cleared)  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. If there are existing notifications, mark all as read or clear them
2. Open NotificationsScreen

**Expected Result:**  
- Empty state shown: illustration + text "Chưa có thông báo nào" (No notifications yet)
- No blank white screen or crash

**Report Back:**
- PASS / FAIL
- Screenshot: Empty notifications state
- Tester Notes: e.g. "Empty state rendered with illustration and text"

---

### TC-117: Achievements tab on profile — all badges visible
**Severity:** Medium  
**Pre-conditions:** User has unlocked ≥ 2 achievements  

**Steps (on iPhone 17 Pro - tarun_apollo):**
1. Open Profile tab
2. Tap Achievements tab (if separate) or scroll to achievements section
3. Inspect visible badges

**Expected Result:**  
- Achievements screen/tab shows grid of available achievements
- Earned badges: highlighted/coloured with earn date
- Unearned badges: greyed out with lock icon
- Earned date shown on earned badges

**Report Back:**
- PASS / FAIL
- Screenshot: Achievements tab with multiple badges
- Tester Notes: e.g. "3 earned badges shown (coloured) + 5 unearned (grey with lock)"

---

### TC-118: Notification for comment on own post
**Severity:** High  
**Pre-conditions:** tarun_apollo has a post; we_are_banana_republic hasn't commented yet  

**Setup (on iPhone 17 Pro Max - parent account):**
1. Find a post by tarun_apollo
2. Tap comment bubble
3. Type comment: "Great post!"
4. Submit

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Open NotificationsScreen
2. Check for comment notification row

**Expected Result:**  
- Notification row appears: "Tarun đã bình luận về bài viết của bạn: Great post!"
- Avatar of commenter shown
- Tapping navigates to the post with comment highlighted

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Comment notification: 'Tarun đã bình luận' with preview text"

---

### TC-119: Notification for new follower
**Severity:** Medium  
**Pre-conditions:** tarun_apollo not previously followed by we_are_banana_republic  

**Setup (on iPhone 17 Pro Max - parent account):**
1. Navigate to tarun_apollo's profile
2. Tap Follow button

**Main Test (on iPhone 17 Pro - tarun_apollo):**
1. Check NotificationsScreen
2. Look for follow notification row

**Expected Result:**  
- Notification row: "(Name) đã theo dõi bạn"
- Tapping opens the follower's profile

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Follow notification: 'Tarun đã theo dõi bạn'"

---

### TC-120: Notification settings persist across sessions
**Severity:** Medium  
**Pre-conditions:** tarun_apollo logged in on iPhone 17 Pro  

**Steps:**
1. Navigate to Settings → Thông báo (Notifications)
2. Toggle off "Bình luận" (Comments) notifications
3. Note the toggle state (OFF)
4. Force-close the app (swipe up or kill process)
5. Reopen tuto_social app
6. Re-authenticate if needed
7. Navigate back to Settings → Thông báo
8. Check if toggle is still OFF

**Expected Result:**  
- Comment notification toggle remains OFF after app restart
- Preference persisted in DB (social_profiles or preferences table)
- Not reset by app close/reopen

**Report Back:**
- PASS / FAIL
- Tester Notes: e.g. "Toggle OFF → force-close → reopen → toggle still OFF ✓"

---

## 📊 REPORTING TEMPLATE

After each test case, update **docs/qa/test-cases.csv**:

```csv
Batch,Test ID,Feature,Pre-conditions,Steps,Expected Result,Severity,Status,Tester Notes,Bug ID Linked,Re-test Notes
BATCH 11,TC-093,In-app notification bell — unread badge,...,PASS,"Badge count=1; clears after bell tap",,
BATCH 11,TC-094,Notification centre — full list opens,...,PASS,"List loaded with 3 rows; unread rows highlighted",,
```

**Columns to fill:**
- **Status:** PASS, FAIL, BLOCKED, SKIPPED
- **Tester Notes:** 1–2 lines describing observation (not verbatim from Expected Result)
- **Bug ID Linked:** If FAIL, link to new bug ID (e.g. BUG-050) or leave blank if code works
- **Re-test Notes:** Leave blank for first run; used if bug is fixed and re-test occurs

---

## 🐛 IF YOU ENCOUNTER A FAILURE

1. **Take a screenshot** — include app state, error message, UI layout
2. **Check console** — any error messages or logs?
3. **Note exact reproduction** — can you repeat it?
4. **Create new bug** (if not already logged):
   - **Bug ID:** BUG-050, BUG-051, etc. (next available number)
   - **Severity:** Critical / High / Medium / Low
   - **Description:** Clear one-liner + reproduction steps
   - **Root Cause Hypothesis:** Your best guess (if obvious)
5. **Link the bug** in test-cases.csv column "Bug ID Linked"
6. **Mark test as FAIL** and set Status
7. **Escalate via chat** if Critical

---

## ✅ SUCCESS CRITERIA

**BATCH 11 PASS RATE TARGET:** ≥ 90% (≥ 25/28 cases PASS)

- If ≤ 85% pass: hold for dev fixes before moving to BATCH 12
- If ≥ 85% pass: log bugs, move to BATCH 12 with known issues documented

---

## 🎯 NEXT STEPS AFTER BATCH 11

1. Update docs/qa/test-cases.csv with all results
2. Update docs/qa/bug-register.csv with any new bugs found
3. Send summary report to QA Manager with:
   - Pass/Fail count
   - Critical bugs (if any)
   - Recommendations for next batch

---

**Good luck! Message QA Manager if you encounter any blockers or need clarification on any test case.** 👍
