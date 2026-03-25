# BATCH 10 — Phase 2 Mobile Testing Report
**From:** QA Manager  
**Date:** March 20, 2026  
**Status:** ⚠️ BLOCKED — BUG-028, BUG-033, BUG-034, BUG-038 must be fixed before full BATCH 10

---

## Executive Summary

Phase 2 mobile testing revealed **4 critical bugs blocking core features** + **5 layout/UX polish issues**. Group chat creation has a design constraint issue. Two simulators rebuilding with fresh app builds.

---

## Critical Blockers (Must Fix Before Proceeding)

### BUG-028 / BUG-033 — Reel Upload Fails
**Error:** "Cannot read property Base64 of undefined" → "Property 'blob' doesn't exist"  
**Impact:** **TC-070 FAIL** — Reels creation completely blocked  
**Severity:** High  
**Required for:** Part A gate, Parts B-E testing  

**Root Cause:** Video file blob property not being read correctly; possible file type mismatch or missing blob conversion in upload handler.

---

### BUG-034 — No Back Button from Community Tab
**Issue:** User stuck in Community tab; no way to exit back to dashboard  
**Impact:** **TC-077 FAIL** (partial) — Feature works but UX trap  
**Severity:** Medium  
**Required for:** Production deployment (critical UX)  

**Root Cause:** Navigation context not preserved; no back handler on Community root screen.

---

### BUG-038 — Group Creation Requires 3+ Participants
**Error:** "Group chat requires at least 3 participants"  
**Impact:** **TC-091 BLOCKED** — Group creation UI only lets user select 2, then fails  
**Severity:** High  
**Scope:** Design constraint vs. UX issue  

**Question for PM:** Is 3-participant minimum intentional? If so, UI should prevent selection of only 2 members (show greyed-out button or guidance). If not, backend should allow 2+ members.

---

## Secondary Issues (Layout & Polish)

| Bug | Issue | Severity | Impact |
|-----|-------|----------|--------|
| BUG-035 | Profile icon behind system clock | Med | Profile tab UX |
| BUG-036 | Search bar behind status bar | Med | Search tab UX |
| BUG-037 | Profile header misaligned | Low | Profile visual polish |

---

## Test Coverage Status

### Part A (Bug Re-tests) — 2/5 Passing
| TC | Bug | Status | Notes |
|----|-----|--------|-------|
| TC-077 | BUG-019 | ✅ PASS* | Single nav bar works; new issue: no exit button (BUG-034) |
| TC-070 | BUG-028/033 | ❌ FAIL | Blob error on upload |
| TC-071 | BUG-029 | ✅ PASS* | Icon clickable; blocked on group test |
| TC-072 | BUG-031 | ✅ PASS | Pause/resume works |
| TC-075 | BUG-030 | ⏸️ PENDING | Awaiting group chat working |

**Required:** 5/5 must pass. Currently 2/5 (need 3 more fixes).

---

### Part B (1:1 Messaging) — Ready to Test
**Status:** ✅ Ready (waiting on TC-070 fix)  
**Test Cases:** TC-080 through TC-085 (6 cases)  
**Test Accounts:** Pre-seeded conversations ready  
**Prerequisite:** Part A BUG-028 and BUG-030 fixed  

---

### Part C (Group Chat) — Ready to Test
**Status:** ⚠️ Partially Ready (TC-091 blocked by BUG-038)  
**Test Cases:** TC-086 through TC-090 (5 cases)  
**Pre-seeded Group:** "Tuto Social — Nhóm Test" (3 members, 17 messages)  
**Blocker:** TC-091 (create new group) requires BUG-038 fix  

---

### Part D & E — Ready to Test
**Status:** ✅ Ready (Part D blocked by BUG-038)  
**TC-091:** Create new group (BLOCKED by BUG-038)  
**TC-092:** Message from profile (Ready)  

---

## Updated Test Case File

✅ **New test cases added to `test-cases.csv`:**
- TC-070 through TC-092 (22 cases total for BATCH 10)
- Status: PENDING RE-VERIFICATION (awaiting bug fixes)

✅ **New bug added to `bug-register.csv`:**
- BUG-038: Group creation 3+ participant constraint

---

## Simulator Status

| Simulator | Status | App Build | Notes |
|-----------|--------|-----------|-------|
| iPhone 16e | 🔄 Rebuilding | Fresh build in progress | Old build was stale |
| iPhone 17 Pro | ✅ Ready | Current build | Dual-device testing ready |
| iPhone 17 Pro Max | ✅ Ready | Current build | Group/multi-user testing ready |

---

## Immediate Actions for PM

### 1. Bug Fixes Required (Priority Order)
```
P1 — BUG-028/033 (Reel upload blob error)
     → Blocks TC-070 gate and all Parts B-E
     → Estimated impact: HIGH

P2 — BUG-034 (No exit from Community tab)
     → Blocks TC-077 full pass
     → Required for production

P2 — BUG-038 (Group creation 3+ participant constraint)
     → Blocks TC-091 and affects UX
     → Decision needed: intentional or bug?

P3 — BUG-035/036/037 (Layout/polish)
     → Non-critical; can be Phase 2.1 polish pass
```

### 2. BUG-038 Decision Needed
**Question:** Is the 3-participant minimum:
- **A) Intentional design** → Need to fix UI to prevent selecting only 2 (greyed button)
- **B) Bug** → Backend should allow 2+ members

**Answer determines:** Whether TC-091 is blocked or needs UI redesign

### 3. Rebuild Status
Waiting on:
- iPhone 16e rebuild completion (~5-10 min)
- Confirmation both simulators have current app

---

## Pass Criteria (Once Fixes Deployed)

| Section | Min Pass Rate | Status |
|---------|---------------|--------|
| **Part A** (Bug re-tests) | 5/5 must pass | Currently 2/5 ⚠️ |
| **Part B** (1:1 Messaging) | 5/6 minimum | Ready to test |
| **Part C** (Group Chat) | 4/5 minimum | Mostly ready (TC-091 blocked) |
| **Part D & E** (Create + Profile) | Both should pass | Ready to test |

**Full BATCH 10 Complete when:** Part A reaches 5/5 + Parts B-E tested

---

## Next Steps

**Hold Point:** Awaiting PM guidance on:
1. ✅ BUG-028/033 fix status
2. ✅ BUG-034 fix status  
3. ❓ BUG-038 decision (intentional or bug?)

Once fixes deployed:
- iPhone 16e rebuild completes
- Run Part A gates again (TC-070, TC-071, TC-072, TC-075, TC-077)
- If all 5/5 PASS → proceed to Parts B-E full suite

---

**Ready to resume full BATCH 10 testing upon PM confirmation of fixes deployed.** 🚀
