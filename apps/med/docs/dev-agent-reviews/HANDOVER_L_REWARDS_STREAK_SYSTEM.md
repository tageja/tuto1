# Dev Agent Handover — Feature L: Rewards, Streak & Motivation System

## Your role

You are a **Senior Gamification & Product Engineer** designing and building a motivation system for a medical-English learning platform for Vietnamese nurses. Your job is to:

1. **Brainstorm** the reward moments, earning rules, and star economy
2. **Design** the data model, coupon marketplace, and UX flows
3. **Build** everything end-to-end: DB → API → UI (learner + admin)

You think like a product designer who understands habit loops (trigger → action → reward → investment) and like an engineer who ships clean, maintainable code.

**Skills required:** TypeScript, React, Next.js App Router, Supabase/Postgres, gamification mechanics, responsive UI, i18n (EN + VI).

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. It uses **Supabase** (Auth + Postgres).

- **Learner experience**: `/learn/*` — courses, lessons, exercises, pairs
- **Admin dashboard**: `/admin/*` — course management, hospitals, analytics

### Current streak state: FULLY HARDCODED

The streak is fake. Here's what exists today:

| What | Where | Status |
|------|-------|--------|
| `streak = 3` | `apps/med/app/learn/page.tsx` line 60 | **Hardcoded constant** |
| `lessonsCompleted = 4` | `apps/med/app/learn/page.tsx` line 61 | **Hardcoded constant** |
| Mission progress `40%` | `apps/med/app/learn/page.tsx` line 238 | **Hardcoded width** |
| Sidebar `streakLabel: '3-day streak'` | `lib/i18n/translations.ts` line 322 | **Hardcoded in copy** |
| `nursed_progress.streak_days` column | `041_nursed_schema.sql` line 141 | **Exists in DB but never written** |
| `nursed_rewards` table | `041_nursed_schema.sql` lines 194–204 | **Exists with seed data, no app code uses it** |
| `nursed_user_rewards` table | `041_nursed_schema.sql` lines 206–213 | **Exists, no app code uses it** |

The **entire dashboard streak section, mission bar, and sidebar streak badge are static decoration**. Your job is to make them real and extend them into a full rewards system.

### Existing DB tables you inherit (DO NOT recreate)

**`nursed_rewards`** — reward rule definitions:
```sql
-- Already exists in 041_nursed_schema.sql
CREATE TABLE nursed_rewards (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  name_vi      text,
  description  text,
  icon         text,
  points       integer NOT NULL DEFAULT 10,
  rule_type    text NOT NULL CHECK (rule_type IN ('lesson_complete','streak','recording','quiz_score','pair_session')),
  rule_config  jsonb NOT NULL DEFAULT '{}',
  created_at   timestamptz NOT NULL DEFAULT now()
);
-- Seed data already inserted: "First Lesson" (10pts), "3-Day Streak" (30pts), "7-Day Streak" (70pts), "First Recording" (20pts), "High Score" (25pts)
```

**`nursed_user_rewards`** — earned rewards per user:
```sql
-- Already exists in 041_nursed_schema.sql
CREATE TABLE nursed_user_rewards (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id  uuid NOT NULL REFERENCES nursed_rewards(id) ON DELETE CASCADE,
  points     integer NOT NULL DEFAULT 0,
  earned_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_id)
);
```

**`nursed_progress`** — has `streak_days` (never written) and `last_active`:
```sql
-- columns: user_id, lesson_id, current_step_index, completion_pct, completed, streak_days (default 0), last_active, created_at
```

**`nursed_submissions`** — records per-exercise completions (quiz_score, recording, etc.).

**RLS policies** already exist for all these tables (public read for rewards, service-all for admin ops).

---

## Part 1: BRAINSTORMING — Reward Moments & Star Economy

This is the most important part. Before writing code, think deeply about what moments deserve rewards and how stars flow through the system.

### Reward moments to design (brainstorm and expand this list)

Here are starter ideas — **you must refine, add to, and balance these**:

#### Completion rewards
| Moment | Suggested stars | Why it motivates |
|--------|----------------|------------------|
| Complete a lesson | 10 ⭐ | Core loop — finish a lesson, get rewarded |
| Complete a module (all lessons done) | 50 ⭐ | Milestone — bigger reward for bigger achievement |
| Complete a course | 200 ⭐ | Major milestone |
| Complete 3 lessons in a row (same session) | 20 ⭐ bonus | Encourages deep study sessions |
| Complete 2 lessons in one day | 15 ⭐ bonus | Daily engagement boost |

#### Streak rewards
| Moment | Suggested stars | Why it motivates |
|--------|----------------|------------------|
| 3-day streak | 30 ⭐ | Early habit formation |
| 7-day streak | 70 ⭐ | Week-long consistency |
| 14-day streak | 150 ⭐ | Serious commitment |
| 30-day streak | 500 ⭐ | Monthly milestone (big deal!) |

#### Quality rewards
| Moment | Suggested stars | Why it motivates |
|--------|----------------|------------------|
| Score 90%+ on a quiz | 25 ⭐ | Rewards mastery, not just completion |
| Score 100% on a quiz | 50 ⭐ | Perfect score celebration |

#### Social/community rewards
| Moment | Suggested stars | Why it motivates |
|--------|----------------|------------------|
| Record and submit an audio | 15 ⭐ | Encourages speaking practice |
| Review a group member's audio (peer review) | 10 ⭐ | Encourages community participation |
| Submit general feedback | 5 ⭐ | Motivates feedback (ties to Feature K) |

#### First-time achievements (one-time only)
| Moment | Suggested stars | Why it motivates |
|--------|----------------|------------------|
| First lesson completed | 10 ⭐ (bonus) | Onboarding reward |
| First recording submitted | 20 ⭐ (bonus) | Overcome the fear of recording |
| First peer review given | 10 ⭐ (bonus) | Start participating in community |
| First feedback submitted | 5 ⭐ (bonus) | Encourage product feedback |

### Star economy questions to answer in your design

1. **Repeatable vs one-time**: Which rewards can be earned multiple times? (Lesson completion = repeatable, first recording = one-time)
2. **Daily caps**: Should there be a daily cap on stars? (Prevents gaming)
3. **Star inflation**: How do coupon prices balance against earning rate? (A learner doing 1 lesson/day earns ~10 stars/day + streak bonuses. A Highland coffee coupon at 500 stars = ~1 month of daily practice — is that reasonable?)
4. **Visibility**: Should learners see how close they are to the next reward? (Progress bars toward next milestone)
5. **Streak recovery**: What happens if you miss a day? Streak resets to 0? Or "streak freeze" feature for later?

### Design deliverable

Before implementing, create a section in a code comment block or a constants file that documents your final reward moment decisions with star values. This becomes the source of truth.

---

## Part 2: DESIGN — What to Build

### A. Streak engine (real, computed from activity)

**How streak should work:**
1. When a learner completes a lesson, record the date in a new `nursed_daily_activity` table (or use `nursed_progress.last_active`)
2. Compute streak = count of consecutive calendar days (in Vietnam timezone UTC+7) with at least 1 lesson completed
3. Update streak on every lesson completion
4. Streak resets to 1 if a day is missed (no activity yesterday)

**Where streak is displayed (replace hardcoded values):**
- `apps/med/app/learn/page.tsx` — hero stat pill, streak card (lines 60, 136, 249–254)
- `apps/med/components/learn/LearnerSidebar.tsx` — streak badge (lines 85–94)
- `lib/i18n/translations.ts` — `streakLabel` should use a dynamic `{n}` pattern, not "3-day streak"

### B. Star balance & reward granting

**Star balance** = sum of all `nursed_user_rewards.points` for the user minus sum of all redeemed coupon costs.

**Reward granting flow:**
1. After a lesson completes → check all rules in `nursed_rewards` → if matched and not already earned (for one-time) → insert into `nursed_user_rewards`
2. After streak updates → check streak-based rewards
3. After submission → check recording/quiz score rewards
4. Return a "just earned" list to the client for celebration animations

### C. Coupon marketplace

**New DB tables needed** (migration `048_nursed_coupons.sql`):

```sql
CREATE TABLE nursed_coupons (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name            text NOT NULL,
  name_vi         text,
  description     text,
  description_vi  text,
  brand           text NOT NULL,          -- 'highland', 'kfc', 'hasaki', etc.
  image_url       text,                   -- coupon/brand image
  star_cost       integer NOT NULL,       -- how many stars to redeem
  total_quantity  integer,                -- null = unlimited
  remaining       integer,                -- decremented on redemption
  active          boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE nursed_coupon_redemptions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  coupon_id   uuid NOT NULL REFERENCES nursed_coupons(id) ON DELETE CASCADE,
  stars_spent integer NOT NULL,
  status      text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'fulfilled', 'expired')),
  coupon_code text,                     -- generated or admin-provided code
  redeemed_at timestamptz NOT NULL DEFAULT now()
);
```

### D. Learner rewards page (`/learn/rewards`)

**Add to learner sidebar** `NAV_HREFS` in `LearnerSidebar.tsx`:
```typescript
{ icon: Star, href: '/learn/rewards', tKey: 'learnNavRewards' as const },
```

**Page sections:**
1. **Star balance** — big number with star icon, total earned, total spent
2. **Current streak** — visual streak counter with flame animation
3. **Recent rewards earned** — list of recently earned rewards with animation
4. **Achievement badges** — grid of all possible rewards, earned ones highlighted, unearned ones grayed out with progress toward them
5. **Coupon marketplace** — grid of available coupons with brand images, star costs, and "Redeem" button (disabled if insufficient stars)
6. **My redeemed coupons** — list of redeemed coupons with status and codes

### E. Admin coupon management (`/admin/coupons`)

**Add to admin sidebar** `NAV_ITEMS` in `AdminSidebar.tsx`:
```typescript
{ label: t.navCoupons ?? 'Coupons', href: '/admin/coupons', icon: Gift },
```

**Admin page:**
1. **Add coupon** form: name (EN + VI), description, brand, image upload, star cost, quantity (optional)
2. **Coupon list**: all coupons with edit/deactivate/delete actions
3. **Redemption log**: view all redemptions with learner name, coupon, date, status
4. **Seed some example coupons**: Highland Coffee (500 ⭐), KFC Meal (800 ⭐), Hasaki Beauty (1000 ⭐)

### F. Dashboard streak fix (replace hardcoded values)

Replace in `apps/med/app/learn/page.tsx`:
- `const streak = 3` → fetch from API
- `const lessonsCompleted = 4` → compute from `nursed_progress` (count of completed=true for today)
- `40%` progress bar → compute from actual daily goal

Replace in `lib/i18n/translations.ts`:
- `streakLabel: '3-day streak'` → dynamic format like `streakLabel: '{n}-day streak'` or compute in component

---

## Part 3: IMPLEMENTATION PLAN

### Phase 1: Database & streak engine
1. Create migration `048_nursed_coupons.sql` — coupons + redemptions tables
2. Extend `nursed_rewards` CHECK constraint to add new `rule_type` values if needed (e.g., `'module_complete'`, `'course_complete'`, `'daily_double'`, `'feedback'`)
3. Seed additional reward rules for the new moments
4. Create `lib/db/rewards.ts` — all DB helper functions
5. Create `lib/rewards-engine.ts` — streak computation + reward matching logic

### Phase 2: API routes
6. `GET /api/rewards/balance` — user's star balance, streak, earned rewards
7. `POST /api/rewards/check` — check and grant rewards after an action (called after lesson complete, submission, etc.)
8. `GET /api/coupons` — list active coupons
9. `POST /api/coupons/redeem` — redeem a coupon (deduct stars)
10. `GET /api/coupons/my-redemptions` — user's redeemed coupons
11. Admin: `POST/PATCH/DELETE /api/admin/coupons` — CRUD for coupons

### Phase 3: Learner UI
12. Fix hardcoded streak/stats on dashboard (`learn/page.tsx`)
13. Fix sidebar streak badge (`LearnerSidebar.tsx`)
14. Build `/learn/rewards` page with all sections
15. Add nav item to sidebar
16. Add celebration toast/animation when reward is earned (after lesson completion)

### Phase 4: Admin UI
17. Build `/admin/coupons` page
18. Add nav item to admin sidebar
19. Coupon CRUD form + image upload
20. Redemption log view

### Phase 5: Wiring reward checks into existing flows
21. `LessonPlayer.tsx` — after lesson complete, call `/api/rewards/check` with action `lesson_complete`
22. After submission (quiz/recording) — call `/api/rewards/check`
23. After peer review — call `/api/rewards/check`
24. After feedback submission — call `/api/rewards/check`
25. Streak computation on each check

---

## Files you must read

| File | Why | Priority |
|------|-----|----------|
| `apps/med/app/learn/page.tsx` | **Hardcoded streak** — lines 59–61, 134–138, 225–255 | CRITICAL |
| `apps/med/components/learn/LearnerSidebar.tsx` | **Hardcoded streak badge** — lines 85–94, NAV_HREFS lines 14–18 | CRITICAL |
| `apps/med/lib/i18n/translations.ts` | **Hardcoded "3-day streak" text** — streakLabel keys | CRITICAL |
| `supabase/migrations/041_nursed_schema.sql` | **Existing tables**: nursed_rewards (lines 194–204), nursed_user_rewards (206–213), nursed_progress (132–143), nursed_submissions (146–159), seed data (297–303) | CRITICAL |
| `apps/med/lib/db/progress.ts` | Progress/submission DB helpers — pattern to follow | HIGH |
| `apps/med/components/learn/LessonPlayer.tsx` | Lesson completion flow — where to trigger reward checks | HIGH |
| `apps/med/app/api/progress/route.ts` | Progress API — doesn't write streak_days | HIGH |
| `apps/med/app/api/submissions/route.ts` | Submission API — where to add reward check hook | HIGH |
| `apps/med/lib/supabase.ts` | Types + service client | HIGH |
| `apps/med/components/admin/AdminSidebar.tsx` | Admin nav — add Coupons link | MEDIUM |
| `apps/med/app/admin/page.tsx` | Admin dashboard pattern | MEDIUM |
| `apps/med/contexts/AuthContext.tsx` | Auth context — user info | MEDIUM |

---

## Critical constraints and guardrails

### DO

- **Brainstorm first**: Document your reward moments, star values, and economy decisions in a constants file (e.g., `lib/rewards-config.ts`) before building
- Use **existing tables** (`nursed_rewards`, `nursed_user_rewards`) — extend, don't recreate
- Add new `rule_type` values via ALTER if needed
- Use Vietnam timezone (UTC+7) for streak day calculations
- Make streak computation **server-side** — never trust client
- Add all text to `lib/i18n/translations.ts` in both EN and VI
- Use `getServiceClient()` for reward operations (bypasses RLS)
- Handle edge cases: What if user completes same lesson twice? (Don't double-grant)
- Make coupon images uploadable via Supabase Storage
- Show star balance prominently in the learner sidebar and dashboard
- Add subtle celebration animations (confetti, pulse, toast) when rewards are earned
- Check the migration number — latest is `047`. Use `048` or higher.

### DO NOT

- Do NOT delete or recreate `nursed_rewards` or `nursed_user_rewards` — they exist
- Do NOT modify `nursed_lesson_feedback` or `nursed_feedback` — separate features
- Do NOT make streak computable on the client — always server-side
- Do NOT install heavy animation libraries — use `framer-motion` (already installed) + CSS
- Do NOT over-engineer the coupon fulfillment — for MVP, just generate a code or set status
- Do NOT make rewards retroactive on first deploy (i.e., don't backfill historical data unless specifically asked)
- Do NOT modify Firebase Functions or mobile app code
- Do NOT create documentation files unless asked
- Do NOT hardcode star values in components — centralize in a config file

---

## Example reward config (starter, refine this)

```typescript
// lib/rewards-config.ts
export const REWARD_MOMENTS = {
  LESSON_COMPLETE: { stars: 10, repeatable: true, ruleType: 'lesson_complete' },
  MODULE_COMPLETE: { stars: 50, repeatable: true, ruleType: 'module_complete' },
  COURSE_COMPLETE: { stars: 200, repeatable: true, ruleType: 'course_complete' },
  DAILY_DOUBLE: { stars: 15, repeatable: true, ruleType: 'daily_double', description: '2 lessons in 1 day' },
  SESSION_TRIPLE: { stars: 20, repeatable: true, ruleType: 'session_triple', description: '3 lessons in a row' },
  STREAK_3: { stars: 30, repeatable: false, ruleType: 'streak', config: { days: 3 } },
  STREAK_7: { stars: 70, repeatable: false, ruleType: 'streak', config: { days: 7 } },
  STREAK_14: { stars: 150, repeatable: false, ruleType: 'streak', config: { days: 14 } },
  STREAK_30: { stars: 500, repeatable: false, ruleType: 'streak', config: { days: 30 } },
  QUIZ_90: { stars: 25, repeatable: true, ruleType: 'quiz_score', config: { min_score: 90 } },
  QUIZ_100: { stars: 50, repeatable: true, ruleType: 'quiz_score', config: { min_score: 100 } },
  FIRST_RECORDING: { stars: 20, repeatable: false, ruleType: 'recording', config: { count: 1 } },
  RECORDING_SUBMIT: { stars: 15, repeatable: true, ruleType: 'recording' },
  PEER_REVIEW: { stars: 10, repeatable: true, ruleType: 'pair_session' },
  FEEDBACK_SUBMIT: { stars: 5, repeatable: true, ruleType: 'feedback' },
} as const
```

---

## Example coupon seeds

| Brand | Name (VI) | Star cost | Image |
|-------|-----------|-----------|-------|
| Highland Coffee | Cà phê Highland miễn phí | 500 ⭐ | highland-logo.png |
| KFC | Bữa ăn KFC combo | 800 ⭐ | kfc-logo.png |
| Hasaki Beauty | Voucher Hasaki 50k | 1000 ⭐ | hasaki-logo.png |
| Grab | Mã giảm giá GrabFood 30k | 300 ⭐ | grab-logo.png |
| Shopee | Mã giảm giá Shopee 20k | 200 ⭐ | shopee-logo.png |

(Admin can add/edit/remove these. No real partnerships yet — this is MVP/demo.)

---

## Deliverables

1. **Brainstorm document** — finalized reward moments, star values, economy rationale (as a code config file)
2. **Real streak engine** — computed from activity, replaces all hardcoded values
3. **Star balance tracking** — earned, spent, current balance
4. **Reward granting** — automatic after lesson/quiz/recording/review/feedback completion
5. **Learner rewards page** (`/learn/rewards`) — balance, streak, achievements, coupon marketplace, redeemed coupons
6. **Admin coupons page** (`/admin/coupons`) — CRUD + image upload + redemption log
7. **Celebration UX** — toast/animation when a reward is earned
8. **All text bilingual** — EN + VI in translation system
