# ✅ BATCH 11 TEST PACKAGE — READY FOR AGENT

**Date:** March 24, 2026  
**Status:** Complete & Ready for Execution  
**Platform:** Mobile (iOS simulators)  
**Test Cases:** 28 (TC-093 to TC-120)  

---

## 📦 Package Contents

### 1. **BATCH11-TEST-AGENT-BRIEF.md** ⭐ START HERE
Quick reference: setup, test structure, critical tests, common issues, reporting format.
- **Read time:** 5 minutes
- **Audience:** Quick onboarding for experienced QA

### 2. **BATCH11-TEST-PROMPTS.md** 📋 DETAILED TEST CASES
Complete test cases with:
- Pre-conditions for each case
- Step-by-step instructions
- Expected results
- Reporting format
- Failure handling
- **Read time:** Use as reference; ~3–5 min per test case during execution

### 3. **BATCH11-TEST-AGENT-ONBOARDING.md** 🎓 DEEP CONTEXT
Background, architecture, test data, common patterns, troubleshooting:
- What is tuto.social? (platform context)
- Simulator setup & launch
- Pre-seeded accounts & data
- Gamification system explained
- Realtime notification patterns
- Detailed bug reporting
- **Read time:** 20–30 minutes (thorough onboarding)

---

## 🚀 Quick Start for Agent

### For Experienced QA (Skip Deep Context)
1. Read **BATCH11-TEST-AGENT-BRIEF.md** (5 min)
2. Check simulators are running (see brief section "Quick Start")
3. Start with TC-093 in **BATCH11-TEST-PROMPTS.md**
4. Report to CSV as you go

### For New QA or First Mobile Test
1. Read **BATCH11-TEST-AGENT-ONBOARDING.md** (20 min) — understand the platform
2. Read **BATCH11-TEST-AGENT-BRIEF.md** (5 min) — structure overview
3. Follow test cases in **BATCH11-TEST-PROMPTS.md** (detailed guidance)
4. Use onboarding as reference for troubleshooting

---

## 📊 Test Scope at a Glance

| Phase | Cases | Focus | Duration |
|-------|-------|-------|----------|
| **1. Notifications** | TC-093–101 | Bell, notification centre, types, settings | ~60 min |
| **2. Realtime Delivery** | TC-102–105 | Two-device notification sync | ~40 min |
| **3. Achievements** | TC-106–114 | Unlock mechanics, XP, streaks | ~70 min |
| **4. Leaderboard** | TC-109–114 | Teacher ranking, shields | ~50 min |
| **5. Dashboard** | TC-115–120 | Badge clear, empty state, persistence | ~50 min |
| | | **Total → 270 min (3–4 hours)** | |

---

## ✅ Pre-Flight Checklist

Before starting, verify:

- [ ] **3 simulators ready**
  - iPhone 17 Pro (tarun_apollo)
  - iPhone 17 Pro Max (we_are_banana_republic_ul87)
  - iPhone 16e (optional, tarun_tageja)
- [ ] **All apps logged in** (not at login screen)
- [ ] **Metro bundler running** (`npx expo start --clear` in terminal)
- [ ] **Notifications enabled** on both devices (Settings → Privacy → Notifications)
- [ ] **CSV file ready** — `docs/qa/test-cases.csv` (rows TC-093–120 already exist)
- [ ] **Screenshots folder exists** — `docs/qa/screenshots/` (create if missing)

---

## 📥 What Test Agent Receives

The agent gets:
1. **This summary** (you're reading it)
2. **Three markdown files** (linked below) with full test details
3. **Pre-existing CSV rows** for TC-093–120 (in test-cases.csv)
4. **Pre-seeded test accounts** (in Supabase)
5. **Metro bundler running** (with 3 simulators)

---

## 📤 What We Expect Back

After BATCH 11 completion:

1. **CSV File Updated** — docs/qa/test-cases.csv
   - TC-093–120 rows filled with Status / Tester Notes
   - Bug IDs linked (if any FAIL)

2. **Bug Report** (if new bugs found)
   - Added to docs/qa/bug-register.csv
   - Screenshot evidence for Critical/High bugs

3. **Summary Report** — message to QA Manager
   - Pass/Fail count (target: ≥25/28 PASS)
   - Any critical blockers
   - Recommendation for BATCH 12

---

## 🎯 Success Criteria

✅ **≥ 90% PASS (≥ 25/28 cases)**
→ Ready to move to BATCH 12 (dashboards, reports, parental controls)

⚠️ **80–90% PASS (21–24 cases)**
→ Log bugs, wait for dev fixes, re-test

❌ **< 80% PASS (< 21 cases)**
→ Escalate to PM; may indicate architectural issue

---

## 🔗 File References (Use as Link)

- **Brief Overview:** `docs/qa/BATCH11-TEST-AGENT-BRIEF.md`
- **Detailed Test Cases:** `docs/qa/BATCH11-TEST-PROMPTS.md`
- **Deep Context & Onboarding:** `docs/qa/BATCH11-TEST-AGENT-ONBOARDING.md`
- **CSV to Update:** `docs/qa/test-cases.csv`
- **Bug Registry:** `docs/qa/bug-register.csv`

---

## 💬 Support

**If agent gets stuck:**
- Check **BATCH11-TEST-AGENT-ONBOARDING.md** section "Troubleshooting"
- Message QA Manager with:
  - Test ID
  - Error screenshot
  - What you tried

---

## 🏁 Ready?

Agent: Start with **BATCH11-TEST-AGENT-BRIEF.md** → Run tests → Report to CSV!

QA Manager: Share all three markdown files + this summary with the test agent. They have everything needed.

**Execution starts now!** 🚀

