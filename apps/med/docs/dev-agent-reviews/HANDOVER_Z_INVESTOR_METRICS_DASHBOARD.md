# HANDOVER Z — Investor-Grade Metrics Dashboard (`/admin/metrics`)

## Agent Role & Identity

You are a **Senior Full-Stack Data Engineer** with deep experience in Next.js 16 App Router, Supabase Postgres aggregation queries, and presentation-grade data visualisation with **recharts**. You think like a product analyst who codes — every chart tells a story, every number is sourced, every metric earns its place by answering a question an investor will actually ask.

**Working directory:** `apps/med/`. **Migrations folder:** `supabase/migrations/` (used only if you decide to add SQL views for query performance — see §Database Changes).

**Test account:** `test@test.com` / `password` (role: `learner`). For super-admin testing, use the existing super-admin account in the production Supabase (Tarun has it; ask if needed). Locally, you can flip `NEXT_PUBLIC_AUTH_DISABLED=true` to bypass auth.

---

## Feature Overview

A **new admin page at `/admin/metrics`**, restricted to `super_admin` role, that surfaces **platform-wide** metrics designed for two audiences:

1. **Tarun** — to monitor the health of the platform on a daily basis
2. **Investors** — to see real, live numbers in pitch meetings (the page is presentation-quality and screenshot-ready)

The page has **three hero metrics** (large, single-number-with-context cards at the top) and a **secondary "fast facts" row** (smaller stats for completeness). The hero metrics, in order of importance:

1. **Active Learners** — Weekly Active Users (WAU) and Monthly Active Users (MAU), with a 12-week sparkline showing growth trend
2. **Average Rating** — composite NPS-style number from `nursed_lesson_feedback` (5 questions, 1-5 scale) and `nursed_peer_reviews` (1-5 audio rating). Single hero number, plus a small breakdown by question
3. **Engagement Time & Streaks** — total minutes learned across all users (proxied from progress activity), plus % of learners with an active 3+ day streak (sticky-behaviour signal)

**Not in scope for this page:** hospital-scoped breakdowns (those live at `/admin/analytics`), per-learner deep dives (those will live at `/admin/learners` — Agent P's future work), course-by-course content-quality drilldowns.

**Visual goal:** when Tarun screenshots this page in a pitch deck, the numbers should be the hero. Use generous spacing, large font sizes for the headline values (`text-5xl` to `text-6xl`), subtle but informative growth indicators (▲ +12% vs. last week), and recharts sparklines that read clearly at thumbnail size.

---

## Current State

### What already exists (do NOT recreate)

| File / Resource | Purpose | Status |
|---|---|---|
| `app/admin/analytics/page.tsx` | Hospital-scoped KPI dashboard (6 KPI cards, requires picking a hospital) | ✅ Live — leave untouched |
| `app/api/hospitals?analytics=true&hospitalId=...` | Existing hospital-scoped analytics endpoint | ✅ Live — do not modify |
| `supabase/migrations/044_nursed_lesson_feedback.sql` | Table with q1_animation, q2_variety, q3_usefulness, q4_confidence, q5_continue (all 1-5) | ✅ Live |
| `supabase/migrations/045_nursed_peer_reviews.sql` | Table with single `rating` column (1-5) per peer review | ✅ Live |
| `supabase/migrations/050_nursed_learning_preferences.sql` | Adds `streak_current`, `streak_longest`, `last_streak_date` columns to `nursed_profiles` | ✅ Live |
| `supabase/migrations/041_nursed_schema.sql` | `nursed_progress` table with `last_active`, `completion_pct`, `completed` columns | ✅ Live |
| `lib/supabase-server.ts` | Exports `createSupabaseServerClient`, `getServiceClient`, and `ADMIN_ROLES` constant (`['super_admin', 'hospital_admin']`) | ✅ Live |
| `recharts@^2.13.3` | Already installed in `apps/med/package.json` line 34 | ✅ Available |

### What is missing (this agent's job)

1. **No platform-wide metrics page exists.** `/admin/analytics` is hospital-scoped and shows nothing until you pick one.
2. **Rating data is not surfaced anywhere.** No admin or learner can see aggregate `nursed_lesson_feedback` or `nursed_peer_reviews` data. There's no API endpoint for either.
3. **No time-series / WAU-trend computation exists.** There's no API or query that returns weekly active counts over the last N weeks.
4. **No engagement-time aggregation.** Total minutes learned is not computed anywhere; nor is "% of learners with active streak".

### Data model summary (memorise before designing queries)

```sql
-- Active learners signal: nursed_progress.last_active
-- Aggregate: COUNT(DISTINCT user_id) WHERE last_active >= NOW() - INTERVAL '7 days'

-- Lesson-survey rating: nursed_lesson_feedback (5 columns, 1-5 each)
-- Composite: AVG((q1_animation + q2_variety + q3_usefulness + q4_confidence + q5_continue) / 5.0)

-- Peer audio rating: nursed_peer_reviews.rating
-- Aggregate: AVG(rating)

-- Streak data: nursed_profiles.streak_current
-- Engaged %: COUNT(*) WHERE streak_current >= 3 / COUNT(*) total

-- Total enrolled: COUNT(*) FROM nursed_profiles WHERE role = 'learner'

-- Recordings: nursed_submissions WHERE step_type = 'recording_submit' (or similar — verify in lib/db)
```

### Auth + role guard

The existing pattern (visible in `app/api/feedback/route.ts`) is:

```ts
const supabase = await createSupabaseServerClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const { data: profile } = await supabase.from('nursed_profiles').select('role').eq('id', user.id).single()
const isSuperAdmin = profile?.role === 'super_admin'
if (!isSuperAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
```

Use **only `super_admin`** for this page (NOT `hospital_admin` — they get `/admin/analytics`). The `ADMIN_ROLES` array is too broad here; check the role explicitly.

---

## Out of Scope

- ❌ **Don't touch `app/admin/analytics/page.tsx`** — it's the hospital-admin's tool. Different audience.
- ❌ **Don't add per-learner data** — no learner names, no individual progress rows on this page. Aggregate-only.
- ❌ **Don't create a CSV/PDF export feature** for MVP. Tarun screenshots are sufficient. Defer export to a future agent.
- ❌ **Don't build authentication-gating logic** beyond the standard `super_admin` check. No "share-link with token" feature.
- ❌ **Don't model future / projected metrics** ("at this growth we'd reach X learners by Y"). Real numbers only — investors smell synthetic projections.
- ❌ **Don't add new npm packages.** `recharts` is already installed for charts. No `dayjs`, `date-fns-tz`, etc. — use native `Date` and the existing `Intl.DateTimeFormat`.
- ❌ **Don't surface PII.** No emails, names, or hospital identifiers visible on the page beyond aggregate counts.

---

## Database Changes

**Optional but recommended:** create a SQL view to keep the WAU/MAU computation cheap as the table grows. If you skip the view, query directly with the SQL below — it's fine for <10K learners.

If you create a view, name the migration **`054_nursed_platform_metrics_views.sql`** (the next available number per the orchestrator handover):

```sql
-- ============================================================
-- NurseEd: Platform-level metrics views for /admin/metrics
-- Migration 054
-- ============================================================

-- 12-week active-user series (one row per ISO week, last 12 weeks including current)
CREATE OR REPLACE VIEW nursed_platform_active_weekly AS
SELECT
  date_trunc('week', last_active)::date AS week_start,
  COUNT(DISTINCT user_id)               AS active_learners
FROM nursed_progress
WHERE last_active >= NOW() - INTERVAL '12 weeks'
GROUP BY 1
ORDER BY 1;

-- Composite rating snapshot
CREATE OR REPLACE VIEW nursed_platform_rating_snapshot AS
SELECT
  -- Lesson survey: per-question averages and overall composite
  ROUND(AVG(q1_animation)::numeric, 2)  AS avg_q1_animation,
  ROUND(AVG(q2_variety)::numeric, 2)    AS avg_q2_variety,
  ROUND(AVG(q3_usefulness)::numeric, 2) AS avg_q3_usefulness,
  ROUND(AVG(q4_confidence)::numeric, 2) AS avg_q4_confidence,
  ROUND(AVG(q5_continue)::numeric, 2)   AS avg_q5_continue,
  ROUND(AVG((q1_animation + q2_variety + q3_usefulness + q4_confidence + q5_continue) / 5.0)::numeric, 2)
                                        AS avg_lesson_composite,
  COUNT(*)                              AS total_lesson_feedback_rows
FROM nursed_lesson_feedback;

-- These views inherit RLS from underlying tables; service-role queries see everything.
-- Grant SELECT to authenticated role for completeness (no PII exposed):
GRANT SELECT ON nursed_platform_active_weekly TO authenticated;
GRANT SELECT ON nursed_platform_rating_snapshot TO authenticated;
```

**Apply via Supabase SQL editor in the production project** (`fkjeggdxqifqqwhuqpgm`) and verify with `SELECT * FROM nursed_platform_active_weekly LIMIT 3;` — you should see 12 or fewer rows.

If you skip the migration, that's fine for MVP — query directly inside the API route. Just leave a TODO comment so a future agent knows where the optimisation opportunity is.

---

## API Routes

### NEW: `GET /api/metrics/platform`

**File:** `app/api/metrics/platform/route.ts`

**Auth:** `super_admin` only (see §Auth pattern above).

**Implementation:** use `getServiceClient()` for the actual data queries (so RLS doesn't filter aggregate counts), but check the caller's role using the **session** client first.

**Response shape:**

```ts
type PlatformMetrics = {
  // Hero 1: Active learners
  activeLearners: {
    wau: number          // distinct users with last_active in last 7 days
    mau: number          // distinct users with last_active in last 30 days
    growthWau: number    // % change vs. previous 7-day window (e.g. 12.5 means +12.5%)
    weeklyTrend: Array<{ weekStart: string; activeLearners: number }> // 12 rows, ISO week_start in YYYY-MM-DD
  }

  // Hero 2: Average rating
  rating: {
    composite: number    // 1.00 - 5.00, rounded to 2 dp; mean of lesson + peer
    lessonAverage: number    // mean of nursed_lesson_feedback's 5-question composite
    peerAverage: number      // mean of nursed_peer_reviews.rating
    breakdown: {
      q1_animation: number
      q2_variety: number
      q3_usefulness: number
      q4_confidence: number
      q5_continue: number
    }
    totalLessonFeedbackRows: number
    totalPeerReviewRows: number
  }

  // Hero 3: Engagement
  engagement: {
    activeStreakPct: number    // % of learners with streak_current >= 3
    longestStreakRecord: number // single learner's longest streak (proof of stickiness)
    avgSessionsPerUser: number  // mean (across learners with any activity) of distinct active days in last 30 days
  }

  // Fast facts (secondary row)
  fastFacts: {
    totalLearners: number       // COUNT FROM nursed_profiles WHERE role='learner'
    totalRecordings: number     // COUNT FROM nursed_submissions WHERE step_type='recording_submit'
    totalLessonsCompleted: number // COUNT FROM nursed_progress WHERE completed=true
    totalCoursesPublished: number // COUNT FROM nursed_courses WHERE published=true
  }
}
```

**SQL queries** (run in parallel via `Promise.all()` for sub-200ms response):

```sql
-- 1) WAU (last 7 days)
SELECT COUNT(DISTINCT user_id)::int AS wau
FROM nursed_progress
WHERE last_active >= NOW() - INTERVAL '7 days';

-- 2) MAU (last 30 days)
SELECT COUNT(DISTINCT user_id)::int AS mau
FROM nursed_progress
WHERE last_active >= NOW() - INTERVAL '30 days';

-- 3) Previous-week WAU for growth %
SELECT COUNT(DISTINCT user_id)::int AS prev_wau
FROM nursed_progress
WHERE last_active >= NOW() - INTERVAL '14 days'
  AND last_active <  NOW() - INTERVAL '7 days';
-- growthWau = (wau - prev_wau) / prev_wau * 100, with prev_wau=0 edge case → 0

-- 4) 12-week trend (use the view OR inline the query)
SELECT week_start, active_learners FROM nursed_platform_active_weekly;

-- 5) Lesson rating snapshot (use the view OR inline)
SELECT * FROM nursed_platform_rating_snapshot;

-- 6) Peer rating
SELECT
  ROUND(AVG(rating)::numeric, 2)::float AS peer_avg,
  COUNT(*)::int                          AS peer_count
FROM nursed_peer_reviews;

-- 7) Streak engagement
SELECT
  COUNT(*) FILTER (WHERE streak_current >= 3)::float / NULLIF(COUNT(*), 0) * 100 AS active_streak_pct,
  MAX(streak_longest)::int AS longest_streak_record
FROM nursed_profiles
WHERE role = 'learner';

-- 8) Avg sessions per user (last 30 days)
SELECT AVG(distinct_days)::float AS avg_sessions
FROM (
  SELECT user_id, COUNT(DISTINCT DATE(last_active)) AS distinct_days
  FROM nursed_progress
  WHERE last_active >= NOW() - INTERVAL '30 days'
  GROUP BY user_id
) AS daily_activity;

-- 9-12) Fast facts (4 simple counts)
```

**Composite calculation** (in TypeScript, after queries return):

```ts
const composite = (lessonAverage + peerAverage) / 2
// Edge cases:
// - If both rows are 0, composite = null → UI shows "Not enough data yet"
// - If only lesson rows exist, composite = lessonAverage (don't divide by 2)
// - If only peer rows exist, composite = peerAverage
```

**Caching:** wrap in 60-second `unstable_cache` from `next/cache` to avoid hammering the DB on every refresh during a meeting. Tag the cache so it can be invalidated by other features later.

```ts
import { unstable_cache } from 'next/cache'
const fetchMetrics = unstable_cache(
  async () => { /* all the queries */ },
  ['platform-metrics'],
  { revalidate: 60, tags: ['platform-metrics'] }
)
```

---

## UI Components

### `app/admin/metrics/page.tsx` (NEW)

**Style note:** match the existing admin UI's card style (look at `app/admin/feedback/page.tsx` and `app/admin/analytics/page.tsx` — the `card` class and `kpi-card` class are already defined in `globals.css`). Do NOT introduce a new card style.

**Layout (top → bottom):**

1. **Page header** — `<h1>` with `t.metricsTitle` ("Platform Metrics" / "Số liệu nền tảng"), small subtitle `t.metricsSubtitle` ("Live data, refreshed every 60 seconds")

2. **"As of" timestamp** — small grey text top-right of the page header showing when the metrics were last refreshed (use `data.fetchedAt` if you include it in the API response, or just `new Date().toLocaleString()` on render)

3. **Hero row** — 3 large cards in a horizontal grid (stack to 1-column on mobile):

   **Hero card 1: Active Learners**
   - Big number: `data.activeLearners.wau` with subtitle "Active this week"
   - Below: `data.activeLearners.mau` smaller, "Active this month"
   - Growth badge: `▲ +12.5% vs. last week` (green if positive, red if negative, grey if zero)
   - Sparkline at the bottom: 12 weekly bars rendered with recharts `<BarChart>` or `<LineChart>` from `data.activeLearners.weeklyTrend`. No axes, no legend — just the shape of growth

   **Hero card 2: Average Rating**
   - Big number: `data.rating.composite` rendered as e.g. `4.6` (2 dp)
   - Underline-style: `out of 5` in small text
   - Below: small breakdown bar — 5 horizontal mini-bars labeled by question (`Animation`, `Variety`, `Usefulness`, `Confidence`, `Will continue`), each filled to its avg/5 ratio
   - Footer line: `from {totalLessonFeedbackRows} lesson surveys + {totalPeerReviewRows} peer reviews`

   **Hero card 3: Engagement**
   - Big number: `data.engagement.activeStreakPct.toFixed(0)%` with subtitle "Learners on a 3+ day streak"
   - Below: `Avg. {data.engagement.avgSessionsPerUser.toFixed(1)} active days/learner this month`
   - Tag: `🏆 Longest streak: {longestStreakRecord} days` (use a non-emoji icon; lucide `Award`)

4. **Fast facts row** — 4 smaller stat cards in a horizontal grid: Total Learners, Total Recordings Submitted, Total Lessons Completed, Total Courses Published. Each shows just the number + label, no chart, no growth indicator.

5. **Footer note** — small grey text: `t.metricsFooterNote` ("Data refreshed every 60 seconds. All metrics aggregate across all hospitals and exclude test accounts.")

   **Note on test-account exclusion:** by default, do NOT exclude test accounts from MVP — Tarun has very few learners and excluding them might produce empty data. Document this as a TODO for when there are 100+ real learners: filter out `WHERE email NOT LIKE '%@test.com'` or use a dedicated `is_test_account` column.

**Loading state:** skeleton cards while fetching (mirror the pattern in `app/admin/feedback/page.tsx`'s loading state).

**Empty state:** if `composite` is `null` (no rating rows yet), render the rating card with `t.metricsRatingEmpty` ("Not enough rating data yet — first ratings appear here as learners complete lessons"). Same for engagement card if `activeStreakPct` is null.

**Responsive:** test at 360×640 (mobile), 768 (tablet), 1280+ (desktop). The hero cards stack on mobile; the sparkline must remain readable at narrow widths (use recharts' `ResponsiveContainer`).

---

## Wiring & Integration

### Translation Keys (NEW — add to `lib/i18n/translations.ts`)

| Key | EN | VI |
|---|---|---|
| `metricsTitle` | `Platform Metrics` | `Số liệu nền tảng` |
| `metricsSubtitle` | `Live data, refreshed every 60 seconds` | `Dữ liệu trực tiếp, làm mới mỗi 60 giây` |
| `metricsHeroActiveTitle` | `Active Learners` | `Người học đang hoạt động` |
| `metricsHeroActiveWeek` | `Active this week` | `Hoạt động tuần này` |
| `metricsHeroActiveMonth` | `Active this month` | `Hoạt động tháng này` |
| `metricsHeroActiveTrend` | `12-week trend` | `Xu hướng 12 tuần` |
| `metricsHeroRatingTitle` | `Average Rating` | `Đánh giá trung bình` |
| `metricsHeroRatingOutOf` | `out of 5` | `trên 5` |
| `metricsHeroRatingFootnote` | `from {lesson} lesson surveys + {peer} peer reviews` | `từ {lesson} khảo sát bài học + {peer} đánh giá nhóm` |
| `metricsHeroRatingQ1` | `Animation` | `Hình ảnh động` |
| `metricsHeroRatingQ2` | `Variety` | `Đa dạng` |
| `metricsHeroRatingQ3` | `Usefulness` | `Hữu ích` |
| `metricsHeroRatingQ4` | `Confidence` | `Tự tin` |
| `metricsHeroRatingQ5` | `Will continue` | `Sẽ tiếp tục` |
| `metricsHeroEngagementTitle` | `Engagement` | `Mức độ tham gia` |
| `metricsHeroEngagementStreak` | `Learners on a 3+ day streak` | `Người học có chuỗi 3+ ngày` |
| `metricsHeroEngagementSessions` | `Avg. {n} active days/learner this month` | `Trung bình {n} ngày hoạt động/người tháng này` |
| `metricsHeroEngagementLongest` | `Longest streak: {n} days` | `Chuỗi dài nhất: {n} ngày` |
| `metricsFastFactsTitle` | `Fast facts` | `Số liệu nhanh` |
| `metricsFastTotalLearners` | `Total learners` | `Tổng người học` |
| `metricsFastTotalRecordings` | `Recordings submitted` | `Ghi âm đã nộp` |
| `metricsFastTotalLessons` | `Lessons completed` | `Bài học hoàn thành` |
| `metricsFastTotalCourses` | `Courses published` | `Khóa học đã xuất bản` |
| `metricsFooterNote` | `Data refreshed every 60 seconds. All metrics aggregate across all hospitals.` | `Dữ liệu làm mới mỗi 60 giây. Tất cả số liệu tổng hợp trên các bệnh viện.` |
| `metricsRatingEmpty` | `Not enough rating data yet — first ratings appear here as learners complete lessons.` | `Chưa đủ dữ liệu đánh giá — đánh giá đầu tiên sẽ xuất hiện khi người học hoàn thành bài học.` |
| `metricsLoadError` | `Couldn't load metrics. Please refresh the page.` | `Không thể tải số liệu. Vui lòng làm mới trang.` |
| `metricsAccessDenied` | `This page is for super-admins only.` | `Trang này chỉ dành cho quản trị viên cấp cao.` |

### Sidebar entry (super-admin only)

The admin sidebar (`components/admin/AdminSidebar.tsx` — find and inspect) probably has links to `/admin`, `/admin/courses`, `/admin/feedback`, etc. Add a new entry **`Metrics`** with a `BarChart3` icon from lucide-react, gated to super_admin role only. Place it near the top, between `Dashboard` and `Analytics` if those exist, since it's the "platform-level" view.

If `AdminSidebar` already has role-based filtering, follow that pattern. If not, add the simplest gate: read the user's role on the server in the layout, pass it to the sidebar as a prop.

---

## Testing Checklist

Run all of these manually before declaring done.

1. **Auth gate (negative):** Sign in as `test@test.com` (learner role). Visit `/admin/metrics`. Should redirect or show a 403 page (not crash, not 200 with empty data). Verify the API returns 403 for the same user.
2. **Auth gate (hospital admin):** Sign in as a hospital_admin (use Supabase Auth → Users → temporarily change a test user's role to `hospital_admin` via `nursed_profiles` table). Visit `/admin/metrics`. Should be 403. Restore the role afterwards.
3. **Auth gate (super_admin):** Sign in as super_admin. Page loads with all 3 hero cards visible.
4. **Data correctness:** Cross-check the WAU number against a manual SQL query in the Supabase SQL editor. They must match exactly.
5. **Empty state:** Locally, in a fresh DB with no `nursed_lesson_feedback` rows yet, the rating card shows the empty-state message gracefully (doesn't show `NaN/5`).
6. **Growth indicator:** Manually insert progress rows for "previous week" via SQL such that `prev_wau = 10` and `wau = 12`. Reload the page. Should see `▲ +20%` in green.
7. **Sparkline rendering:** The 12-week sparkline must render at all viewport widths (test at 360, 768, 1280). recharts `<ResponsiveContainer>` is your friend.
8. **i18n:** Toggle to VI in the topbar. All hero titles, subtitles, and labels switch to Vietnamese. Numbers stay numeric (no localized formatting needed for MVP).
9. **Cache behaviour:** Reload the page twice in <60s. The second reload should be sub-100ms (cache hit). Wait 60s+, reload — should re-query.
10. **Build:** `npm run build` exits clean. `npx tsc --noEmit` shows no new errors vs. baseline (line-shift trick — Lesson 13).
11. **Performance budget:** API response under 500ms cold; under 50ms warm (cached). Verify in browser DevTools Network tab.
12. **Screenshot test:** Open the page on a 1440×900 viewport, take a full-page screenshot. The 3 hero numbers must read clearly without zooming. This is the investor-meeting use case.

---

## Guardrails

- **Don't touch `app/admin/analytics/page.tsx` or `app/api/hospitals*`** — they're for hospital admins. Different page, different audience, different role gate.
- **Don't expose any PII** — no user emails, no learner names, no hospital identifiers on `/admin/metrics`. Only aggregate counts, percentages, and averages.
- **Don't add new npm packages.** `recharts` is already installed and is the right choice for the sparkline. Native `Date` for time math. No `dayjs`, no `date-fns-tz`, no chart-library swap.
- **Don't compute metrics in the React component.** All aggregation happens in the API route (with optional SQL view for performance). The component just renders whatever the API returns.
- **Don't ship "fake" numbers or hardcoded fallbacks.** If a metric can't be computed (e.g. no data yet), show the empty-state copy. NEVER `streak = 3` or `composite = 4.5` as a placeholder. Investors will catch this immediately and lose trust.
- **Don't expose the API endpoint to non-admins.** The route MUST 403 for `learner` and `hospital_admin` roles. Test this explicitly.
- **Don't auto-deploy.** Commit to `agent-x-integration`, push, then ping Tarun to promote (per Lesson 16). The shipping pattern is `vercel promote <id> --scope tarun-tagejas-projects --yes`.
- **Run `npm run build` and `npx tsc --noEmit` before declaring done.** Verify no new errors vs. the pre-edit baseline.

---

## Definition of Done

The task is complete when ALL of the following are true:

1. `/admin/metrics` page renders without errors when accessed as super_admin
2. `/admin/metrics` returns 403 (or redirects) when accessed as `learner` or `hospital_admin`
3. The 3 hero cards display the WAU/MAU+sparkline, average rating + breakdown, and engagement+streak — each with real numbers from production data (or correct empty-state copy if no data exists yet)
4. The fast-facts row shows 4 secondary numbers (total learners, recordings, lessons, courses)
5. The page loads in <500ms cold, <100ms warm (cached for 60s)
6. The 12-week sparkline renders responsively at 360, 768, and 1280 viewport widths
7. The i18n toggle correctly swaps EN ↔ VI for every label on the page
8. The growth-vs-last-week badge is correct (verified by manual SQL)
9. A new sidebar entry `Metrics` is visible to super_admins only and links to the page
10. The new SQL views (if you chose to create them) are applied via migration `054_nursed_platform_metrics_views.sql` AND the file is committed to git (do NOT just paste into the SQL editor — capture as migration per Lesson 4)
11. All new strings are in `lib/i18n/translations.ts` for both `en` and `vi`
12. `npm run build` exits clean; `npx tsc --noEmit` shows no new errors
13. The page is screenshot-ready: open at 1440×900, capture full page, verify hero numbers are legible at thumbnail size
14. A single commit on `agent-x-integration` with message `feat(nursed): platform metrics dashboard at /admin/metrics (Agent Z)` — push and notify Tarun to promote.

**Estimated effort:** 5-8 hours for a focused full-stack agent. The DB shape is well-known; the new code is one API route, one page, optionally one SQL migration, and i18n keys. Most of the time goes into recharts polish and getting the hero cards visually presentation-grade.
