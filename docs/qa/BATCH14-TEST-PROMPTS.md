# BATCH 14 Web Test Prompts — Messages, Settings, Security

**Batch:** BATCH 14  
**Platform:** Web only (`http://localhost:3001`)  
**Test Account (primary):** `marketing@tutoglobal.com` (password: per QA / `password` in dev docs)  
**Secondary accounts:** `qa.parent@tuto.test` (`qa_parent_tuto`), `qa.teacher@tuto.test` (`qa_teacher_tuto`) — passwords per [TUTO_SOCIAL_PM_HANDOVER.md](../prd-specs/TUTO_SOCIAL_PM_HANDOVER.md)  
**Total Cases:** 23 (TC-168 to TC-190)  
**Estimated Duration:** 90–120 minutes

---

## Pre-Test Checklist

- [ ] Web social app running at `http://localhost:3001`
- [ ] Can log in as `marketing@tutoglobal.com`
- [ ] For realtime tests: second browser or incognito for User B

---

## Out of Scope (do not file as failures)

- Read receipts (✓✓) on web — deferred  
- Typing indicator on web — deferred  
- Sending images/videos in chat on web — not required unless explicitly built

---

## TC-168: Web — Messages page requires login

**Severity:** Critical  
**Setup:** Incognito / no session  

**Steps:**
1. Navigate to `http://localhost:3001/messages`
2. Wait 2 seconds  

**Expected:** Redirect to `/login`; conversation list not shown  

**Report:** PASS / FAIL / BLOCKED + observation  

---

## TC-169: Web — Messages — conversation list on mobile viewport

**Severity:** High  
**Setup:** Logged in as marketing; user has ≥ 1 conversation  

**Steps:**
1. Resize browser to width &lt; 768px (or device toolbar)
2. Go to `/messages`

**Expected:** Full-width list with search + rows; no desktop two-panel sidebar  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-170: Web — Messages — two-panel layout on desktop

**Severity:** High  
**Setup:** Logged in; ≥ 1 conversation  

**Steps:**
1. Width ≥ 768px
2. Open `/messages`

**Expected:** Left sidebar (~320px) with list; right panel empty state e.g. “Chọn một cuộc trò chuyện”; both visible  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-171: Web — Conversation list — name, preview, order

**Severity:** High  
**Setup:** Logged in; conversation with ≥ 1 message  

**Steps:**
1. Open `/messages`
2. Inspect each row

**Expected:** Avatar + contact name + last message preview + relative time; newest conversation first  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-172: Web — Conversation list — search filters by name

**Severity:** High  
**Setup:** ≥ 2 conversations with different display names  

**Steps:**
1. Type substring of one contact’s name in search
2. Clear search

**Expected:** List filters live; clearing restores all; no full page reload  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-173: Web — Conversation list — unread indicator

**Severity:** Medium  
**Setup:** At least one row where `last_message_at` &gt; `last_read_at` for current user’s participant row  

**Steps:**
1. Open `/messages`
2. Locate unread thread

**Expected:** Bold name and/or blue dot on unread row; read threads without dot  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-174: Web — Open chat — chronological messages

**Severity:** High  
**Setup:** Conversation with ≥ 3 messages  

**Steps:**
1. Click a conversation
2. Wait for load

**Expected:** Oldest top, newest bottom; scroll near bottom; each bubble has time (e.g. HH:mm)  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-175: Web — Chat — alignment and styling

**Severity:** High  
**Setup:** 1:1 or group with messages from self and others  

**Steps:**
1. Open conversation
2. Compare bubble alignment and colors

**Expected:** Own: right, primary/blue; other: left, surface; group: sender name on others’ bubbles  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-176: Web — Send message — optimistic UI

**Severity:** Critical  
**Setup:** Chat open  

**Steps:**
1. Type text, press Enter or click Gửi

**Expected:** Message appears at bottom immediately; input clears; no full reload; reasonable loading/disable while sending  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-177: Web — Realtime — peer message appears without refresh

**Severity:** High  
**Setup:** User A (marketing) and User B (e.g. `qa.parent@tuto.test`) in two browsers; same `conversationId`  

**Steps:**
1. User A opens `/messages/[conversationId]`
2. User B opens same URL
3. User B sends a message

**Expected:** User A sees new message within ~2s without refresh  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-178: Web — Mobile back from chat to list

**Severity:** High  
**Setup:** Viewport &lt; 768px; chat open  

**Steps:**
1. Open `/messages/[conversationId]`
2. Tap ← back in chat chrome

**Expected:** Navigates to `/messages`; list visible; no crash  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-179: Web — Profile “Nhắn tin” — new 1:1

**Severity:** High  
**Setup:** No existing 1:1 with target user (e.g. `qa_parent_tuto`)  

**Steps:**
1. Go to `/profile/[username]`
2. Click Nhắn tin

**Expected:** Navigates to `/messages/[newId]`; correct contact; can send; DB has new conversation + two participants  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-180: Web — Profile “Nhắn tin” — existing conversation

**Severity:** High  
**Setup:** 1:1 already exists from TC-179  

**Steps:**
1. Profile of same user → Nhắn tin again

**Expected:** Same `conversationId`; no duplicate conversation row  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-181: Web — Header Tin nhắn unread dot

**Severity:** Medium  
**Setup:** Unread conversation (last message after last read)  

**Steps:**
1. Log in; stay off `/messages` initially
2. Check header “Tin nhắn” for dot
3. Open a chat and read; return to feed

**Expected:** Dot when unread; clears after read per product behavior  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-182: Web — Security — cannot open others’ conversation

**Severity:** Critical  
**Setup:** Conversation exists only between `qa.teacher@tuto.test` and `qa.parent@tuto.test`; note `conversationId`  

**Steps:**
1. Log in as `marketing@tutoglobal.com`
2. Navigate to `/messages/[thatConversationId]`

**Expected:** Redirect to `/messages` or safe empty state; no messages from that thread  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-183: Web — Settings loads when authenticated

**Severity:** High  
**Setup:** Logged in  

**Steps:**
1. Go to `/settings`

**Expected:** Page loads; tabs for blocked / muted (labels per UI); default tab blocked; no crash  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-184: Web — Settings redirects when unauthenticated

**Severity:** Critical  
**Setup:** Incognito  

**Steps:**
1. Open `/settings`

**Expected:** Redirect to `/login`  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-185: Web — Settings — blocked users list

**Severity:** High  
**Setup:** ≥ 1 row in `social_blocks` for current user as blocker  

**Steps:**
1. `/settings` → blocked tab

**Expected:** Cards with avatar, name, @username, Bỏ chặn  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-186: Web — Settings — unblock instant

**Severity:** High  
**Setup:** TC-185  

**Steps:**
1. Click Bỏ chặn

**Expected:** Row disappears without full reload; row removed in DB  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-187: Web — Settings — muted users list

**Severity:** High  
**Setup:** ≥ 1 row in `social_mutes` for current user  

**Steps:**
1. Muted tab

**Expected:** Cards + Bỏ tắt tiếng  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-188: Web — Settings — unmute instant

**Severity:** High  
**Setup:** TC-187  

**Steps:**
1. Click Bỏ tắt tiếng

**Expected:** Card disappears; DB updated  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-189: Web — Settings — empty states

**Severity:** Low  
**Setup:** No blocks and no mutes for user  

**Steps:**
1. Open both tabs

**Expected:** Friendly empty copy; no errors  

**Report:** PASS / FAIL / BLOCKED  

---

## TC-190: Web — Header dropdown — Cài đặt

**Severity:** Medium  
**Setup:** Logged in  

**Steps:**
1. Open user menu in header
2. Click Cài đặt

**Expected:** Navigates to `/settings`  

**Report:** PASS / FAIL / BLOCKED  

---

## Submission Format

```
TC-168: PASS/FAIL/BLOCKED — [one line]
...
TC-190: PASS/FAIL/BLOCKED — [one line]
```

Log failures with console errors, screenshots, and `conversationId` / user IDs when relevant.
