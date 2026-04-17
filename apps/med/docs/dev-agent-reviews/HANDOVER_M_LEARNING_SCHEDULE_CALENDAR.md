# HANDOVER M — Learning Schedule, Onboarding Preferences & Calendar Tracker

## Agent Role & Identity

You are **Agent M**, a senior full-stack Next.js developer embedded in the **NurseEd** product team. NurseEd is a Vietnamese nursing English upskilling platform built with:

- **Framework**: Next.js 15 App Router (`apps/med/`)
- **Database & Auth**: Supabase (Postgres + RLS + `@supabase/ssr`)
- **Styling**: Tailwind CSS with CSS variables (`--primary`, `--surface`, etc.)
- **Animations**: `framer-motion` (already installed)
- **Icons**: `lucide-react`
- **i18n**: Vietnamese/English via `lib/i18n/translations.ts` + `LanguageContext`

Your working directory is `apps/med/`. All code changes must stay within that directory and `supabase/migrations/`.

---

## Feature Overview

Build three connected things:

1. **First-visit onboarding modal** — A friendly 2-question quiz shown exactly once when a learner opens the portal for the first time (or has no preferences saved). Stores their learning preferences.
2. **Monthly calendar view** — A persistent UI widget on `/learn` (the homepage) that shows: (a) the **recommended** learning days derived from preferences (soft dots/highlights), and (b) the **actual** days they completed lessons (filled activity marks). Replaces the current bare streak counter.
3. **Preference-to-streak bridge** — The calendar is already connected to the existing `nursed_progress.last_active` data. The onboarding preferences power the "schedule" overlay on the same calendar.

Admin visibility (who's been learning regularly) is **explicitly out of scope for this task** — design the data structure for it but do not build the admin UI. Leave a clear comment where that hook should go.

---

## Current State — What Already Exists

### Homepage (`app/learn/page.tsx`)

The learner dashboard already has:
- Hero section with `🔥 streak`, `✓ lessonsCompleted`, `📚 courses` stat pills
- `StatPill` component
- `/api/rewards/balance` endpoint that returns `{ streak, todayCount, balance, ... }`
- A `<StreakCard>` inline component (the orange `🔥 N days` box at bottom-right)

The **streak is real and computed** from `nursed_progress.last_active` via `computeStreak()` in `lib/rewards-engine.ts`. It queries completed lessons and counts consecutive calendar days (Vietnam UTC+7).

### Database Tables (key ones)

```sql
-- Already exists — used for activity data
nursed_progress (
  user_id, lesson_id, completed boolean,
  last_active timestamptz,   -- ← this is what drives the calendar
  completion_pct, current_step_index, streak_days, created_at
)

-- Already exists — add preference columns here
nursed_profiles (
  id uuid (= auth.users.id),
  role text,          -- 'learner' | 'hospital_admin' | 'super_admin'
  full_name text,
  hospital_id uuid,
  created_at timestamptz
)
-- NOTE: no learning_preference columns yet → you will add them via migration
```

### Rewards Engine (`lib/rewards-engine.ts`)

- `computeStreak(userId)` — already correct, reads `nursed_progress`
- `getTodayLessonsCompleted(userId)` — already correct
- Streak awards already fire on `lesson_complete` action

### Translations (`lib/i18n/translations.ts`)

Add all new UI strings there with both `en` and `vi` keys. Do not hardcode Vietnamese in JSX.

---

## Database Migration — `050_nursed_learning_preferences.sql`

Create this file at `supabase/migrations/050_nursed_learning_preferences.sql`.

### Changes needed

```sql
-- 1. Add preference columns to nursed_profiles
ALTER TABLE nursed_profiles
  ADD COLUMN IF NOT EXISTS learning_intensity  text CHECK (learning_intensity IN ('mini', 'deep')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS preferred_days      text CHECK (preferred_days IN ('everyday', 'weekdays', 'weekends')) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS schedule_set_at     timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS onboarding_done     boolean NOT NULL DEFAULT false;

-- 2. Index for admin queries (hospital_admin can filter by learners who haven't onboarded)
CREATE INDEX IF NOT EXISTS idx_nursed_profiles_onboarding
  ON nursed_profiles(hospital_id, onboarding_done);

-- 3. Helper view for admin use (agent M: do NOT build admin UI, just expose the view)
CREATE OR REPLACE VIEW nursed_learner_activity_summary AS
SELECT
  np.id                                      AS user_id,
  np.full_name,
  np.hospital_id,
  np.onboarding_done,
  np.preferred_days,
  np.learning_intensity,
  COUNT(DISTINCT DATE(pr.last_active AT TIME ZONE 'Asia/Ho_Chi_Minh'))
    FILTER (WHERE pr.completed AND pr.last_active >= now() - interval '30 days')
                                             AS active_days_last_30,
  MAX(pr.last_active)                        AS last_seen_at
FROM nursed_profiles np
LEFT JOIN nursed_progress pr ON pr.user_id = np.id
GROUP BY np.id, np.full_name, np.hospital_id, np.onboarding_done,
         np.preferred_days, np.learning_intensity;

COMMENT ON VIEW nursed_learner_activity_summary IS
  'Admin hook: hospital_admin can query WHERE hospital_id = $1 to see learner regularity.';

-- RLS: learners can update their own preferences; service role bypasses
CREATE POLICY "learner update own preferences" ON nursed_profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

---

## Feature 1 — Onboarding Modal

### When to show it

Show the onboarding modal when `profile.onboarding_done === false` (or `null`) after the user's profile is loaded by `AuthContext`. It should appear over the `/learn` dashboard as a full-screen overlay, not block navigation.

### Questions (2 total, simple, positive tone)

**Question 1 — Intensity**

> "How do you prefer to learn?"
> (VI: "Bạn muốn học như thế nào?")

Options:
- 🌱 **Mini sessions** (10–15 min/day) — "Học ít mỗi ngày" → `intensity: 'mini'`
- 🔥 **Deep dive** (30–45 min, fewer days) — "Học sâu, ít buổi hơn" → `intensity: 'deep'`

**Question 2 — Preferred days**

> "When do you want to learn?"
> (VI: "Bạn muốn học vào lúc nào?")

Options:
- 📅 **Every day** — "Mỗi ngày" → `preferred_days: 'everyday'`
- 🗓️ **Weekdays only** (Mon–Fri) — "Ngày trong tuần" → `preferred_days: 'weekdays'`
- 🌅 **Weekends** (Sat–Sun) — "Cuối tuần" → `preferred_days: 'weekends'`

### UI / UX

- Full-screen overlay with blurred backdrop (`backdrop-blur-sm bg-black/40`)
- Card centered, max-width 420px, `framer-motion` slide-up entrance
- One question per step (step 1 → step 2 → done animation)
- Each option is a large tap-friendly card (not a radio button), ~60px tall
- Selected card gets a blue ring + checkmark icon
- "Continue" button only enabled when an option is selected
- Step 2 → clicking "Finish" saves preferences and dismisses with a confetti burst (use `framer-motion` particles, keep it subtle)
- Cannot be dismissed without answering (no X button) — but a small "Skip for now" ghost link at the bottom is OK; if skipped, `onboarding_done` stays `false` so it re-appears next visit

### API for saving preferences

```
POST /api/profile/preferences
Body: { intensity: 'mini' | 'deep', preferred_days: 'everyday' | 'weekdays' | 'weekends' }
Response: { success: true }
```

This route must:
1. Get the authenticated user from Supabase session
2. `UPDATE nursed_profiles SET learning_intensity = $1, preferred_days = $2, onboarding_done = true, schedule_set_at = now() WHERE id = $user_id`
3. Return 200 on success

Create the file at `app/api/profile/preferences/route.ts`.

---

## Feature 2 — Monthly Calendar View

### Design

Replace the current standalone streak card on the homepage with a **Calendar + Streak widget** that occupies the full bottom card area (currently `sm:col-span-2` + `sm:col-span-1`).

The calendar widget spans the full row (all 3 columns).

#### Layout inside the widget

```
[ Month header: "April 2026"  ← → ]
[ Sun Mon Tue Wed Thu Fri Sat  ]
[  .   5   6   7   8   9  10  ]   ← dots = scheduled days (preference-derived)
[ 11  12  ●  14  15  16  17  ]   ← ● = completed activity (from nursed_progress)
[ 18  19  20  21  22  23  24  ]
[ 25  26  27  28  29  30   -  ]

🔥 5-day streak  |  ✓ 12 lessons this month
```

#### Visual legend

| Mark | Meaning |
|------|---------|
| Soft blue ring around date number | **Scheduled day** (derived from `preferred_days` preference — every Mon/Tue/.../Fri for weekdays, etc.) |
| Filled blue dot below date | **Completed a lesson** on this day (from `nursed_progress.last_active`) |
| Both ring + dot | Scheduled AND completed (the goal!) |
| Orange border | Today |
| Gray text | Future dates |

### Data needed

The homepage already calls `/api/rewards/balance`. Extend this endpoint to also return:

```json
{
  "data": {
    "streak": 5,
    "todayCount": 1,
    "balance": 120,
    "preferredDays": "weekdays",          // ← new
    "activityDates": ["2026-04-07", "2026-04-09", "2026-04-14"]  // ← new, YYYY-MM-DD in VN timezone
  }
}
```

To get `activityDates` for the current month:

```sql
SELECT DISTINCT
  TO_CHAR(last_active AT TIME ZONE 'Asia/Ho_Chi_Minh', 'YYYY-MM-DD') AS activity_date
FROM nursed_progress
WHERE user_id = $userId
  AND completed = true
  AND last_active >= date_trunc('month', now() AT TIME ZONE 'Asia/Ho_Chi_Minh')
  AND last_active <  date_trunc('month', now() AT TIME ZONE 'Asia/Ho_Chi_Minh') + interval '1 month';
```

Also fetch `preferred_days` from `nursed_profiles` in the same API call.

### Calendar Component

Create `components/learn/LearningCalendar.tsx`:

```typescript
interface LearningCalendarProps {
  preferredDays: 'everyday' | 'weekdays' | 'weekends' | null
  activityDates: string[]   // YYYY-MM-DD strings
  streak: number
  lessonsThisMonth: number
}
```

**Preferred-days → scheduled weekday numbers mapping**:
- `'everyday'` → `[0,1,2,3,4,5,6]`
- `'weekdays'` → `[1,2,3,4,5]`  (Monday=1, Sunday=0)
- `'weekends'` → `[0,6]`

Use `new Date(year, month, day).getDay()` to check if a calendar date is a scheduled day.

The calendar only shows the **current month** (no navigation needed for MVP). Month navigation (← →) can be a placeholder that logs "coming soon" — do not scope-creep.

### `framer-motion` usage

- Staggered entrance: each week row fades in with 50ms delay
- Activity dot: scales from 0 → 1 with a spring when the calendar first loads
- Keep animations subtle — this is a medical professional audience

---

## Feature 3 — Preference-to-Streak Bridge (already mostly done)

The streak is already correctly computed. The only new thing is:

1. Surface the `preferredDays` on the calendar so the visual "target vs actual" makes sense
2. On the homepage, if today is a **scheduled day** and the user has not completed a lesson yet, show a gentle nudge banner:

> 🎯 "Today is a learning day! Keep your streak going."
> (VI: "Hôm nay là ngày học của bạn! Hãy duy trì chuỗi học.")

This banner only shows if `todayCount === 0` AND today's weekday is in the learner's `preferredDays` schedule.

---

## Component File Map — What to Create / Modify

| File | Action | Notes |
|------|--------|-------|
| `supabase/migrations/050_nursed_learning_preferences.sql` | **CREATE** | DB migration |
| `app/api/profile/preferences/route.ts` | **CREATE** | Save onboarding answers |
| `app/api/rewards/balance/route.ts` | **MODIFY** | Add `activityDates`, `preferredDays` to response |
| `lib/db/rewards.ts` | **MODIFY** | Add `getMonthActivityDates(userId)` function |
| `components/learn/OnboardingModal.tsx` | **CREATE** | 2-step preference quiz modal |
| `components/learn/LearningCalendar.tsx` | **CREATE** | Monthly calendar widget |
| `app/learn/page.tsx` | **MODIFY** | Wire `OnboardingModal` + replace streak card with `LearningCalendar` |
| `lib/i18n/translations.ts` | **MODIFY** | Add all new strings in both `en` and `vi` |

---

## Wiring in `app/learn/page.tsx`

```tsx
// 1. Import
import { OnboardingModal } from '@/components/learn/OnboardingModal'
import { LearningCalendar } from '@/components/learn/LearningCalendar'

// 2. New state
const [showOnboarding, setShowOnboarding] = useState(false)
const [preferredDays, setPreferredDays] = useState<string | null>(null)
const [activityDates, setActivityDates] = useState<string[]>([])

// 3. In the rewards/balance effect — extend to read new fields
.then((j) => {
  if (j.success) {
    setStreak(j.data.streak ?? 0)
    setLessonsCompleted(j.data.todayCount ?? 0)
    setPreferredDays(j.data.preferredDays ?? null)
    setActivityDates(j.data.activityDates ?? [])
  }
})

// 4. Show onboarding after profile loads
const { profile } = useAuth()
useEffect(() => {
  if (profile && !profile.onboarding_done) setShowOnboarding(true)
}, [profile])

// 5. Replace the current 3-column grid (daily goal + streak) with the calendar widget
<LearningCalendar
  preferredDays={preferredDays as any}
  activityDates={activityDates}
  streak={streak}
  lessonsThisMonth={activityDates.length}
/>

// 6. Render modal at root level
{showOnboarding && (
  <OnboardingModal
    onComplete={(prefs) => {
      setPreferredDays(prefs.preferred_days)
      setShowOnboarding(false)
    }}
  />
)}
```

---

## AuthContext — Expose `onboarding_done`

The `AuthContext` (`contexts/AuthContext.tsx`) already fetches `nursed_profiles` for the current user. The `NursedProfile` type in `lib/supabase.ts` needs the new columns:

```typescript
export type NursedProfile = {
  id: string
  role: UserRole
  full_name: string | null
  hospital_id: string | null
  created_at: string
  // New columns (add these):
  learning_intensity: 'mini' | 'deep' | null
  preferred_days: 'everyday' | 'weekdays' | 'weekends' | null
  onboarding_done: boolean
  schedule_set_at: string | null
}
```

---

## Translation Keys to Add

```typescript
// In lib/i18n/translations.ts — add under both 'en' and 'vi':

// Onboarding modal
onboardingTitle: 'Set your learning schedule' / 'Thiết lập lịch học của bạn',
onboardingSubtitle: 'Just 2 quick questions to personalise your experience' / 'Chỉ 2 câu hỏi nhanh để cá nhân hóa trải nghiệm',
onboardingQ1: 'How do you prefer to learn?' / 'Bạn muốn học như thế nào?',
onboardingOptMini: 'Mini sessions (10–15 min/day)' / 'Học ít mỗi ngày (10–15 phút)',
onboardingOptDeep: 'Deep dive (30–45 min, fewer days)' / 'Học sâu, ít buổi hơn (30–45 phút)',
onboardingQ2: 'When do you want to learn?' / 'Bạn muốn học vào lúc nào?',
onboardingOptEveryday: 'Every day' / 'Mỗi ngày',
onboardingOptWeekdays: 'Weekdays (Mon–Fri)' / 'Ngày trong tuần',
onboardingOptWeekends: 'Weekends (Sat–Sun)' / 'Cuối tuần',
onboardingBtnNext: 'Continue' / 'Tiếp tục',
onboardingBtnFinish: 'Get started!' / 'Bắt đầu học!',
onboardingBtnSkip: 'Skip for now' / 'Bỏ qua lần này',

// Calendar widget
calendarTitle: 'Your learning calendar' / 'Lịch học của bạn',
calendarLegendScheduled: 'Scheduled day' / 'Ngày học dự kiến',
calendarLegendCompleted: 'Completed' / 'Đã hoàn thành',
calendarMonthlyLessons: '{n} lessons this month' / '{n} bài học tháng này',

// Nudge banner
nudgeBannerToday: "Today is a learning day! Keep your streak going." / "Hôm nay là ngày học của bạn! Hãy duy trì chuỗi học.",
```

---

## RLS Policies Checklist

| Table | Operation | Policy |
|-------|-----------|--------|
| `nursed_profiles` | `UPDATE` | Only the user themselves can update their own row |
| `nursed_profiles` | `SELECT` | User selects own row; hospital_admin selects rows where `hospital_id` matches |
| `nursed_progress` | `SELECT` | User selects own rows (for calendar activity dates) |

Check that the `UPDATE` policy for `nursed_profiles` is not missing — it was added in migration 050 above.

---

## What NOT to Build

- ❌ Admin calendar view or per-learner calendar for admins (next phase)
- ❌ Push notifications or email reminders based on schedule
- ❌ Multi-month calendar navigation (current month only for MVP)
- ❌ Schedule editing UI after onboarding (user can only redo onboarding by clearing preferences — not needed yet)
- ❌ Any new courses/lessons/steps

---

## Implementation Order

1. **Run migration 050** — add columns to `nursed_profiles`, create the view, add RLS UPDATE policy
2. **Update `NursedProfile` type** in `lib/supabase.ts`
3. **Create `POST /api/profile/preferences`** route
4. **Extend `GET /api/rewards/balance`** to return `activityDates` + `preferredDays`
5. **Add `getMonthActivityDates(userId)`** to `lib/db/rewards.ts`
6. **Build `OnboardingModal` component** (2 steps, framer-motion)
7. **Build `LearningCalendar` component** (calendar grid, dots, streak footer)
8. **Wire both into `app/learn/page.tsx`**
9. **Add translation keys** to `lib/i18n/translations.ts`
10. **Test locally** with `NEXT_PUBLIC_AUTH_DISABLED=true` against the Supabase dev DB

---

## Guardrails

- **Do not** touch `functions/src/` — this app calls Supabase directly, not Firebase Functions
- **Do not** create documentation files unless the user asks
- **Do not** modify the Supabase auth flow, middleware, or `AuthContext` beyond adding the new type fields
- **Do not** expose `SUPABASE_SERVICE_ROLE_KEY` to the client; use it only in server-side API routes
- Keep every component under ~200 lines; split into sub-components if needed
- All user-facing strings must go through the translation system — no hardcoded Vietnamese or English in JSX
- The onboarding modal must be tested in both Vietnamese and English language modes

---

## Testing Checklist

- [ ] New user (no profile row) sees onboarding modal on first visit
- [ ] Completing onboarding saves `learning_intensity`, `preferred_days`, `onboarding_done=true` in DB
- [ ] Skipping onboarding: modal disappears but re-appears next visit
- [ ] Calendar shows correct scheduled days (e.g. weekdays → Mon–Fri have soft ring)
- [ ] Calendar shows correct activity dots from `nursed_progress` (complete a lesson → dot appears)
- [ ] Streak count in calendar footer matches the streak shown in the hero stat pill
- [ ] Nudge banner appears on a scheduled day when `todayCount === 0`
- [ ] Nudge banner does NOT appear on a non-scheduled day
- [ ] Hospital admin can query `nursed_learner_activity_summary` view (test via Supabase SQL editor)
- [ ] All strings render correctly in Vietnamese (switch language in top bar)
