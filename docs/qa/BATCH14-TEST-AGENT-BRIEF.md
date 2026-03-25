# BATCH 14 Test Agent Brief — Web Messaging & Settings

**Batch:** BATCH 14  
**Platform:** Web only (`http://localhost:3001`)  
**Test Cases:** 23 (TC-168 to TC-190)  
**Duration:** ~90-120 minutes  
**Status:** Ready to execute

---

## What You're Testing

**BATCH 14 focuses on:**
- ✅ **Messages Page** (Authentication, layout, conversation list)
- ✅ **Conversation Management** (Search, unread indicators, message threads)
- ✅ **Message Sending & Receiving** (Real-time sync, timestamps)
- ✅ **Settings Pages** (Blocked users, muted users, UI transitions)

---

## Test Accounts

| Email | Username | Role | Use Case |
|-------|----------|------|----------|
| `marketing@tutoglobal.com` | `test_8z6r` | Parent | Primary account for most tests |
| `qa.parent@tuto.test` | `qa_parent_tuto` | Parent | Secondary user (two-user tests) |
| `qa.teacher@tuto.test` | `qa_teacher_tuto` | Teacher | Optional (if teacher-specific tests) |

**Passwords:** See `/docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md`

---

## Test Structure

| Test ID | Feature | Type |
|---------|---------|------|
| TC-168 | Messages auth guard | Auth |
| TC-169–170 | Layout (mobile/desktop) | UI |
| TC-171–172 | Conversation list & search | UX |
| TC-173–174 | Unread indicators & message loading | State |
| TC-175–176 | Message sending & reactions | Interaction |
| TC-177–180 | Two-user real-time sync | Real-time |
| TC-181–186 | Blocked/Muted users settings | Settings |
| TC-187–190 | Settings page navigation & auth | Navigation |

---

## Key Features to Test

### Messages Page
- ✅ Redirects to login when not authenticated
- ✅ Two-panel layout on desktop (conversation list + chat)
- ✅ Single-panel on mobile (responsive)
- ✅ Conversation list shows name + preview + timestamp
- ✅ Search filters conversations by name
- ✅ Unread dot indicator on unread conversations

### Message Interactions
- ✅ Click conversation → loads message thread
- ✅ Messages displayed in chronological order
- ✅ Auto-scroll to latest message
- ✅ Typing in input field + sending messages
- ✅ Messages appear immediately (optimistic update)
- ✅ Real-time sync between two browser sessions

### Settings Pages
- ✅ Blocked users list + unblock button
- ✅ Muted users list + unmute button
- ✅ Settings accessible from profile
- ✅ No crashes or 500 errors

---

## Out of Scope (Don't Test)

❌ Read receipts (✓✓) — deferred  
❌ Typing indicator — deferred  
❌ Image/video sending — not built yet  

---

## How to Report Results

**For each test case:**
```
TC-168: [PASS / FAIL / BLOCKED]
Observation: [1-line note of what happened]
[If FAIL: describe the error]
```

**Example:**
```
TC-168: PASS
Observation: GET /messages without session redirects to /login

TC-169: FAIL
Observation: Conversation list cut off on mobile; only 3 of 5 conversations visible
```

---

## Quick Reference

📍 **Working Document:** `/docs/qa/BATCH14-TEST-PROMPTS.md` (full 23 prompts)

📍 **Context:** `/docs/prd-specs/TUTO_SOCIAL_PM_HANDOVER.md` (accounts + architecture)

---

## Pre-Test Checklist

- [ ] Web app running at `http://localhost:3001`
- [ ] Can log in as `marketing@tutoglobal.com`
- [ ] For real-time tests: prepare second browser or incognito window for "User B"
- [ ] Browser DevTools ready for debugging (F12)

---

## Success Criteria

✅ All 23 tests executed  
✅ PASS/FAIL/BLOCKED reported for each  
✅ Screenshots of failures captured  
✅ Results submitted in format above  

---

## Expected Duration

- **Setup:** 5 min
- **Testing:** 80–110 min
- **Reporting:** 5 min
- **Total:** ~90–120 minutes

---

## Next Steps After Testing

1. QA Manager logs all results
2. Any bugs found → filed in bug-register.csv
3. BATCH 15 prompts generated
4. Cycle continues

---

**Ready to start BATCH 14? You have everything you need!**

