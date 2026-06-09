# PHASE 2 QA FINDINGS — PM CLARIFICATION NEEDED
**From:** QA Manager  
**Date:** March 19, 2026  
**Status:** ⚠️ ARCHITECTURE DECISION NEEDED

---

## Executive Summary

Phase 2 testing revealed a critical architecture decision that needs PM clarification:

**Web platform (localhost:3001) does NOT have Reels or Messaging features in Phase 2.**  
**These features are MOBILE-ONLY (React Native).**

This is a significant deviation from the test plan (BATCH 10 assumed web would have these). We need to confirm whether this is:
1. **Intentional** — Reels + Messaging are mobile-first, web will follow in Phase 2.5/3
2. **Unintended** — Features should exist on web but aren't deployed

---

## Evidence

### Web Test Agent Finding

Running BATCH 10 on `http://localhost:3001`:

```
Web Navigation (actual):
  - Bảng tin (Feed)
  - Khám phá (Discover)
  - Thông báo (Notifications)
  ❌ NO Reels tab
  ❌ NO Messages tab

Expected (from test plan):
  - ... (same as above) ...
  ✅ Reels tab (create/view reels)
  ✅ Messages tab (group chat, 1:1 messaging)
```

**Result:** TC-070 through TC-077 all **BLOCKED** — features don't exist on web.

### Mobile Test Results

Mobile app (React Native) HAS these features:
- ✅ Reels tab (creation, playback)
- ✅ Messages tab (conversations, group chat)

But mobile has new bugs (see below).

---

## Critical Issues Found

### Mobile-Only Bugs (Need Fixes)

| Bug ID | Issue | Severity | Blocks |
|--------|-------|----------|--------|
| **BUG-028** | Reel creation fails: "Cannot read property Base64" | High | Reels feature |
| **BUG-029** | Pencil icon behind system clock (not clickable) | High | Group chat |
| **BUG-030** | Conversation preview shows old message, not latest | High | Messaging UX |
| **BUG-031** | Reel doesn't pause when tapped during playback | Medium | Reels UX |

### Existing Bugs Still Open

| Bug ID | Issue | Severity | Impact |
|--------|-------|----------|--------|
| **BUG-019** | Dual nav bars still stacked | Med | Reels UX (partially functional) |
| **BUG-021** | Profile message button (web) | Med | *Fixed on mobile; web not deployed* |

---

## Navigation Bar Issue (BUG-019) — Visual Description

**Current State (Mobile):**
```
┌──────────────────────────────┐
│ 🔔 ... 📶 🔋              │  ← iOS System Status Bar
├──────────────────────────────┤
│ Reels          (Tuto Home)   │  ← Dashboard nav bar (STACKED)
├──────────────────────────────┤
│ Reels     (Tuto Social)      │  ← Social app nav bar (STACKED)
├──────────────────────────────┤
│  [Reel Video Content Here]   │
│  (Mostly visible, nav 160px) │
├──────────────────────────────┤
│ ♥️ 1   💬 0   📤 0           │  ← Action buttons
│ @tarun_tuto                  │
│ Test reel content            │
└──────────────────────────────┘
```

**Issue:**
- Two navigation bars visible simultaneously (Dashboard + Social)
- Bottom safe area shows both tab bars
- Content is pushed down by ~160px
- Partially fixable but not ideal UX

**Expected State:**
```
┌──────────────────────────────┐
│ 🔔 ... 📶 🔋              │  ← iOS System Status Bar
├──────────────────────────────┤
│  [Reel Video Content Here]   │  ← Full screen video
│  (Takes up most space)       │
│                              │
│  @tarun_tuto                 │
│  Test reel content           │
│  ♥️ 1   💬 0   📤 0           │  ← Action buttons
├──────────────────────────────┤
│ Reels (Tuto Social Only)     │  ← Single nav bar
└──────────────────────────────┘
```

---

## Questions for PM

### 1. Phase 2 Architecture — Web vs Mobile Priority?

**Option A: Mobile-First (Current State)**
- ✅ Reels + Messaging deployed on mobile
- ❌ Not on web yet
- Timeline: Web features in Phase 2.5 or Phase 3

**Option B: Parity (Expected)**
- ✅ Reels + Messaging on BOTH web and mobile
- ⏱️ Requires immediate web deployment

**Which is correct?**

### 2. Should BATCH 10 Be Retargeted?

Current BATCH 10 test plan assumes web platform has Phase 2 features.

**Options:**
- A) Keep BATCH 10 as-is, mark as "Blocked — Web features not deployed"
- B) Rename BATCH 10 → "Mobile Phase 2 Testing" (mobile-only focus)
- C) Split: BATCH 10 → Mobile | BATCH 10.5 → Web (after deployment)

**Recommendation:** Option B or C

### 3. Timeline for Web Feature Parity?

If Option B is correct (mobile-first), when should web catch up?

---

## Immediate Actions Needed

**Before continuing Phase 2 QA:**

1. ✅ **Confirm architecture decision** — Mobile-first or parity?
2. ✅ **Prioritize mobile bugs** — BUG-028, BUG-029 are blocking core features
3. ✅ **Clarify web deployment** — When (if) Reels/Messaging come to web

---

## Current Phase 2 Status

| Platform | Feature | Status | Notes |
|----------|---------|--------|-------|
| **Mobile** | Reels | Deployed ✅ | 4 bugs blocking full functionality |
| **Mobile** | Messaging | Deployed ✅ | 2 bugs (compose icon, preview stale) |
| **Web** | Reels | ❌ Not deployed | Not in navbar |
| **Web** | Messaging | ❌ Not deployed | Not in navbar |
| **Web** | Zero counts | ✅ Working | BUG-020 now visible (passing) |
| **Web** | Profile msg btn | ❌ Disabled | Marked "coming soon" |

---

## Recommendation

**Do NOT continue Phase 2 testing until:**
1. PM clarifies web vs mobile architecture
2. Mobile bugs (BUG-028, BUG-029, BUG-030) are fixed
3. BATCH 10 scope is updated (web tests need rescheduling)

**Estimated delay:** 24–48 hours for clarification + bug fixes

---

## Next Steps

Once PM clarifies:
- If **Mobile-first**: Resume mobile re-testing (BUG fixes)
- If **Parity**: Pause QA, request web deployment, then resume with updated BATCH 10

**Standing by for PM guidance.** 🚀
