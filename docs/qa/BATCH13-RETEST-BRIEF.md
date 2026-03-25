# BATCH 13 Re-test Brief — TC-157, TC-158, TC-159

**Status:** Quick re-test of 3 previously failing tests  
**Duration:** ~10-15 minutes  
**Expectation:** All 3 should now PASS

---

## What Changed?

### BUG-044 FIXED ✅
**Issue was:** Notification unread dot stayed stale after leaving `/notifications`  
**Fix:** Header now listens to Realtime events for notifications  
**Now:** Dot clears automatically + responds to live updates

### BUG-045 FIXED ✅
**Issue was:** Leaderboard redirected to login even though it should be public  
**Fix:** `/leaderboard` whitelisted in middleware as public route  
**Now:** Leaderboard accessible without login

### TC-159 CLARIFIED ✅
**Question was:** What should leaderboard rank display look like?  
**PM Decision:** Show BOTH rank pill (badge) AND shield count (number)  
**Now:** Mark PASS if both visible

---

## Quick Re-test

**Three simple tests:**

1. **TC-157** (2 min)
   - Log in → see red dot on "Thông báo" → click it → go back to /feed → **dot should be gone (no refresh)**

2. **TC-158** (2 min)
   - Open **incognito tab** → go to `http://localhost:3001/leaderboard` → **should load, no login redirect**

3. **TC-159** (3 min)
   - On leaderboard → check top 3 teachers → **both rank pill AND shield count visible?**

**Report back:**
```
TC-157: [PASS/FAIL]
TC-158: [PASS/FAIL]
TC-159: [PASS/FAIL]
```

---

## Reference Document

Full prompts: `/docs/qa/BATCH13-RETEST-PROMPTS.md`

---

**After re-tests complete:** QA Manager will log results and generate BATCH 14 prompts.

