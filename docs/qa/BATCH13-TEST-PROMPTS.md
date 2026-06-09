# BATCH 13 Web Test Prompts — School Profiles, Notifications, Leaderboard, Creator Dashboard

**Batch:** BATCH 13  
**Platform:** Web only (`http://localhost:3001`)  
**Test Account:** `marketing@tutoglobal.com` (password: check credentials)  
**Total Cases:** 17 (TC-151 to TC-167)  
**Estimated Duration:** 45-60 minutes

---

## ✅ Pre-Test Checklist

- [ ] Web social app running at `http://localhost:3001`
- [ ] Logged in as `marketing@tutoglobal.com`
- [ ] Can access `/feed` without 404

---

## Test Prompts (Copy-Paste for Testers)

---

### TC-151: Web — School profile page loads from feed post

**Feature:** School profile navigation  
**Severity:** High

**Setup:**
- Navigate to `http://localhost:3001/feed`
- Logged in as `marketing@tutoglobal.com`

**Steps:**
1. Look for a post with a **school badge** (e.g., "Trường học" or school name in orange badge)
2. Click on the **school badge** or **school name link**
3. Wait for page to load

**Expected Result:**
- Browser navigates to `/school/[schoolId]`
- Page displays: school name, avatar/logo, bio
- Three tabs visible: **Thông báo** (Announcements) / **Giáo viên** (Teachers) / **Thành tích** (Achievements)
- No crash, no 500 error

**Report Back:**
- Did school profile page load? (YES / NO)
- Can you see all 3 tabs? (YES / NO)
- Any errors in console? (YES / NO — describe)

---

### TC-152: Web — School profile — Announcements tab loads posts

**Feature:** School announcements tab  
**Severity:** High

**Setup:**
- On `/school/[schoolId]` page from TC-151
- Logged in as `marketing@tutoglobal.com`

**Steps:**
1. Ensure **Thông báo** (Announcements) tab is active (should be default)
2. Wait 3-5 seconds for content to load
3. Look for post cards OR empty state message

**Expected Result:**
- At least any recent announcements displayed as post cards, OR
- Empty state message: "Chưa có thông báo nào" (No announcements yet)
- No 500 error, no blank page

**Report Back:**
- Content loaded? (POSTS / EMPTY STATE / ERROR)
- If posts shown, how many? ___
- Any errors? (YES / NO)

---

### TC-153: Web — School profile — Staff tab shows teachers

**Feature:** School teachers list  
**Severity:** Medium

**Setup:**
- On `/school/[schoolId]` page
- Logged in as `marketing@tutoglobal.com`
- School should have ≥ 1 teacher

**Steps:**
1. Click **Giáo viên** (Teachers) tab
2. Wait for content to load
3. Inspect teacher cards

**Expected Result:**
- Teacher cards appear with:
  - Avatar image
  - Display name
  - Username
- Teachers ordered by **shield_count descending** (top teachers first)
- Clicking avatar navigates to `/profile/[username]`
- No crash

**Report Back:**
- Teachers showing? (YES / NO)
- How many teachers listed? ___
- Correct order (most shields first)? (YES / NO / UNSURE)

---

### TC-154: Web — School profile — Achievements tab shows posts

**Feature:** School achievements tab  
**Severity:** Medium

**Setup:**
- On `/school/[schoolId]` page
- School has ≥ 1 achievement post

**Steps:**
1. Click **Thành tích** (Achievements) tab
2. Wait for content

**Expected Result:**
- Achievement post cards appear, OR
- Empty state message displayed
- No crash, no 500 error

**Report Back:**
- Posts loaded? (YES / NO)
- How many posts? ___ (or "empty state")
- Any errors? (YES / NO)

---

### TC-155: Web — Notifications page loads when authenticated

**Feature:** Notifications page access  
**Severity:** High

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- User should have ≥ 1 notification in DB

**Steps:**
1. Navigate to `http://localhost:3001/notifications`
2. Wait for page to load

**Expected Result:**
- Notifications page loads
- Notification rows visible with:
  - Avatar
  - Notification text
  - Relative timestamp (e.g., "2 minutes ago")
- No crash, no 500 error

**Report Back:**
- Page loaded successfully? (YES / NO)
- Notifications visible? (YES / NO)
- How many notifications? ___

---

### TC-156: Web — Notifications page redirects when unauthenticated

**Feature:** Notifications page auth guard  
**Severity:** Critical

**Setup:**
- Open **NEW incognito/private window** (not logged in)

**Steps:**
1. Navigate to `http://localhost:3001/notifications`
2. Wait 2 seconds

**Expected Result:**
- Redirected to `/login`
- Notifications page content NOT shown
- URL shows `/login`

**Report Back:**
- Redirect to login? (YES / NO)
- URL after redirect? ___

---

### TC-157: Web — Notifications — unread bell dot clears after visiting page

**Feature:** Notifications unread indicator  
**Severity:** High

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- User has ≥ 1 **unread** notification (red dot visible in header)

**Steps:**
1. Look at header — check for **red dot** on "Thông báo" link
2. Click the "Thông báo" link OR navigate to `/notifications`
3. Wait for page to load
4. Navigate back to `/feed` (or another page)
5. Re-check header for red dot

**Expected Result:**
- Red dot was visible before visiting notifications
- Red dot is **gone** after visiting notifications page
- Notifications marked as read in DB

**Report Back:**
- Red dot visible initially? (YES / NO)
- Red dot gone after visit? (YES / NO)
- Unread count decreased? (YES / NO)

---

### TC-158: Web — Leaderboard page accessible without login

**Feature:** Leaderboard public access  
**Severity:** High

**Setup:**
- Open **NEW incognito/private window** (not logged in)

**Steps:**
1. Navigate to `http://localhost:3001/leaderboard`
2. Wait for page to load

**Expected Result:**
- Leaderboard page renders WITHOUT login redirect
- Teacher list visible
- Top 3 podium visible (gold/silver/bronze positions)
- Page title includes "Bảng xếp hạng" (Leaderboard)

**Report Back:**
- Page accessible without login? (YES / NO)
- Podium visible? (YES / NO)
- Teachers listed? (YES / NO)

---

### TC-159: Web — Leaderboard — top 3 podium displays correctly

**Feature:** Leaderboard podium display  
**Severity:** High

**Setup:**
- ≥ 3 teachers exist with `shield_count > 0`
- Navigate to `http://localhost:3001/leaderboard`

**Steps:**
1. Inspect top 3 section (podium)
2. Look for positions #1, #2, #3

**Expected Result:**
- #1 teacher shown in **centre/top** position
- #2 on **left**
- #3 on **right**
- Each shows:
  - Avatar image
  - Display name
  - Shield count
  - Rank pill (1/2/3)
- Correct colors: gold (#1), silver (#2), bronze (#3) backgrounds

**Report Back:**
- Podium layout correct? (YES / NO)
- Top 3 teachers visible? (YES / NO)
- Shields and names showing? (YES / NO)

---

### TC-160: Web — Leaderboard — ranks 4+ listed below podium

**Feature:** Leaderboard extended list  
**Severity:** Medium

**Setup:**
- ≥ 4 teachers with `shield_count > 0`
- On `/leaderboard` page

**Steps:**
1. Scroll below the top 3 podium
2. Inspect numbered list

**Expected Result:**
- Teachers ranked 4+ shown in ordered list
- Each row displays:
  - Position number (4, 5, 6, etc.)
  - Avatar
  - Display name
  - Shield count
- **Correct descending order** by shield count

**Report Back:**
- List below podium visible? (YES / NO)
- Correct numbering (4, 5, 6...)? (YES / NO)
- Correct order (shields descending)? (YES / NO)

---

### TC-161: Web — Leaderboard — Follow button visible when logged in

**Feature:** Follow from leaderboard  
**Severity:** Medium

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- On `/leaderboard` page
- `qa_teacher_tuto` (qa.teacher@tuto.test) should appear as a teacher on leaderboard

**Steps:**
1. Find a teacher on the leaderboard that is NOT the current user
2. Look for **Follow** button on their card
3. Click the button
4. Observe state change

**Expected Result:**
- **Follow** button visible on other teachers' cards
- **NOT** visible on own profile card
- Clicking Follow changes button to "Following" (state updates)

**Report Back:**
- Follow buttons visible? (YES / NO)
- Can click and follow? (YES / NO)
- Button state changes? (YES / NO)

---

### TC-162: Web — Creator Dashboard redirects unauthenticated user to login

**Feature:** Dashboard auth guard  
**Severity:** Critical

**Setup:**
- Open **NEW incognito/private window** (not logged in)

**Steps:**
1. Navigate to `http://localhost:3001/dashboard`
2. Wait 2 seconds

**Expected Result:**
- Redirected to `/login`
- Dashboard content NOT shown
- URL shows `/login`

**Report Back:**
- Redirect to login? (YES / NO)
- URL after redirect? ___

---

### TC-163: Web — Creator Dashboard loads with XP bar and stats

**Feature:** Creator dashboard main view  
**Severity:** High

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- User has ≥ 1 post in DB

**Steps:**
1. Navigate to `http://localhost:3001/dashboard`
2. Wait for page to load
3. Inspect the XP bar and stats section

**Expected Result:**
- XP bar visible with level badge
- Stats row shows:
  - Posts / Reels / Views / Likes
  - All with numeric values ≥ 0
- Streak count visible
- No crash

**Report Back:**
- Dashboard loaded? (YES / NO)
- XP bar visible? (YES / NO)
- Stats showing? (YES / NO)
- Numeric values present? (YES / NO)

---

### TC-164: Web — Creator Dashboard — teacher shield section visible for teacher role

**Feature:** Dashboard teacher shields  
**Severity:** Medium

**Setup:**
- Logged in as `qa.teacher@tuto.test` (username: `qa_teacher_tuto`, role: teacher)
- Navigate to `http://localhost:3001/dashboard`

**Steps:**
1. Wait for dashboard to load
2. Scroll to find shield section
3. Look for shield count and rank information

**Expected Result:**
- **Shield section visible** for teacher accounts
- Shows:
  - Shield count
  - Current rank pill
  - Next rank info
- **NOT shown** for non-teacher accounts

**Report Back:**
- Shield section visible? (YES / NO)
- Shield count showing? (YES / NO)
- Rank pill present? (YES / NO)

---

### TC-165: Web — Creator Dashboard — top posts tab shows posts with links

**Feature:** Dashboard top posts tab  
**Severity:** High

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- User has ≥ 2 posts

**Steps:**
1. Navigate to `/dashboard`
2. Find "Top Posts" section (should be default tab)
3. Inspect post cards
4. Click on one post card

**Expected Result:**
- Up to 5 post cards displayed with:
  - Content snippet/preview
  - View count
  - Like count
- Each card is **clickable** and navigates to `/post/[id]`
- No crash

**Report Back:**
- Posts showing? (YES / NO)
- How many posts? ___
- View/like counts visible? (YES / NO)
- Can click and navigate to post? (YES / NO)

---

### TC-166: Web — Creator Dashboard — top reels tab

**Feature:** Dashboard top reels tab  
**Severity:** Medium

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- User has ≥ 1 reel

**Steps:**
1. Navigate to `/dashboard`
2. Click **Reels** tab in top content section
3. Wait for content

**Expected Result:**
- Reel cards appear with view count + like count, OR
- Empty state if user has no reels
- No crash, no 500 error

**Report Back:**
- Reels tab loads? (YES / NO)
- Reels showing or empty state? (REELS / EMPTY)
- View/like counts visible? (YES / NO / N/A)

---

### TC-167: Web — Header nav has Bảng xếp hạng and Tin nhắn links

**Feature:** Header navigation links  
**Severity:** High

**Setup:**
- Logged in as `marketing@tutoglobal.com`
- On any page with the header visible

**Steps:**
1. Inspect main header navigation bar
2. Look for "Bảng xếp hạng" link
3. Look for "Tin nhắn" link
4. Click each link to verify navigation

**Expected Result:**
- **"Bảng xếp hạng"** link visible in header → navigates to `/leaderboard`
- **"Tin nhắn"** link visible in header → navigates to `/messages`
- Both links work correctly

**Report Back:**
- "Bảng xếp hạng" link visible? (YES / NO)
- "Tin nhắn" link visible? (YES / NO)
- Both navigate correctly? (YES / NO)

---

## Submission Instructions

**For each test case, report:**

1. **Test ID** (e.g., TC-151)
2. **Result** (PASS / FAIL / BLOCKED)
3. **Tester Notes** (1 line observation)
4. **Any errors** (if FAIL, describe what went wrong)
5. **Screenshots** (if FAIL, include screenshot of error)

**Format:**
```
TC-151: PASS — School profile loaded successfully
TC-152: FAIL — Announcements tab shows 500 error | Screenshot: [describe]
...
```

---

**Total: 17 test cases. Expected completion: ~60 minutes.**

When finished, provide results and I will log them into the CSV and flag any bugs.

