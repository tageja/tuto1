# HANDOVER N — User Profile Page

---

## Agent Role & Identity

You are a **Senior Full-Stack Product Engineer & Creative UX Designer** for NurseEd — a Vietnamese nursing English upskilling platform at **med.tuto.asia**.

Your skills: TypeScript, Next.js 16 App Router, Supabase (Postgres + RLS + SSR), Tailwind CSS with CSS variables, `framer-motion`, `lucide-react`, Server Components, Client Components, API route handlers, Supabase Storage for file uploads, i18n with `useLang()`.

Your working directory: `apps/med/` (monorepo root is `tuto/`).
Migration folder: `supabase/migrations/` — next file must be `051_nursed_profile_extended.sql`.

You think like a product designer AND an engineer. You do not just implement a list of requirements — you ask "what does this page need to feel like a real, personal space for the learner?" and then you build that.

---

## Your 7-Step Workflow (Follow This Exactly)

**Step 1 — Brainstorm:** Read the product owner's ideas below. Then think creatively beyond the list. Sketch the UX mentally: What sections? What visual hierarchy? What would delight a Vietnamese nurse seeing her own profile for the first time? Write your brainstorm plan in a brief comment block at the top of `app/learn/profile/page.tsx` before coding.

**Step 2 — Plan:** Map each UI section to the existing backend. Identify what's missing. Confirm your plan in the same comment block.

**Step 3 — Implement:** Build all files described in this document. No placeholders, no `console.log('coming soon')`.

**Step 4 — Write test cases:** Create `apps/med/test-cases.csv` with detailed test cases covering happy path + edge cases for every profile section. Format: `id,section,action,expected_result,status` (status starts as `PENDING`).

**Step 5 — Run tests:** Start the local dev server (`npm run dev` in `apps/med/`). Use the browser tool to navigate to `http://localhost:3001`. Log in with the test account (`test@test.com` / `password`). Navigate to `/learn/profile`. Execute each test case.

**Step 6 — Fix:** Fix all failing test cases. Do not skip any.

**Step 7 — Report:** Update `test-cases.csv` with final status (`PASS` / `FAIL`) and add a `## Test Results` section at the bottom of this handover document with a summary.

---

## Product Owner's Ideas (Tarun's Requirements)

The profile page should display:
- User information: name, age/DOB, hospital name, position/job title
- Avatar (user-uploadable)
- Badges/achievements the learner has earned
- Rewards (star balance)
- Redeemed coupon history
- Current course(s) in progress
- Completed courses
- Endorsements from peers
- Learning preferences (intensity, preferred days)
- Practice groups joined

**Your job**: take this list and make it into a cohesive, delightful, well-structured page — not a dump of data fields.

---

## Current State — What Already Exists

### Database (nursed_profiles columns that exist today)
```
id, full_name, hospital_id, role, avatar_url, created_at,
learning_intensity ('mini'|'deep'|null),
preferred_days ('everyday'|'weekdays'|'weekends'|null),
onboarding_done (boolean),
schedule_set_at (timestamptz)
```
**Missing**: `position`, `date_of_birth`, `bio` — you will add these in migration 051.

### TypeScript type — `lib/supabase.ts` (line 56–68)
`NursedProfile` type is defined here. After the migration, add `position`, `date_of_birth`, `bio` fields to this type.

### Existing API routes (do NOT duplicate these — call them from the profile API):
- `GET /api/rewards/balance` — returns `{ balance, streak, todayCount, recentEarned, allDefinitions, earnedRewardIds, activityDates, preferredDays }`
- `GET /api/coupons/my-redemptions` — returns user's redemption history with coupon details
- `GET /api/coupons` — returns active coupons

### Existing DB helpers (call these from `lib/db/profile.ts`):
- `lib/db/rewards.ts`: `getUserStarBalance`, `getEarnedRewards`, `getAllRewardDefinitions`, `getUserRedemptions`
- `lib/db/progress.ts`: `getUserProgressSummary`

### Existing tables you will query:
- `nursed_profiles` — user data (join with `nursed_hospitals` to get hospital name)
- `nursed_user_rewards` → join `nursed_rewards` — badges earned
- `nursed_coupon_redemptions` → join `nursed_coupons` — redemption history
- `nursed_progress` → join `nursed_lessons` → `nursed_modules` → `nursed_courses` — course progress
- `nursed_pair_groups` — practice groups (learner is a member via `member_ids` or similar — inspect actual schema)
- `nursed_endorsements` — new table (you create this in migration 051)

### Existing components to reference for style:
- `components/learn/LearnerSidebar.tsx` — sidebar nav style, streak display
- `components/learn/LearningCalendar.tsx` — card layout with headers
- `components/learn/OnboardingModal.tsx` — modal style and step layout
- `components/ui/cn.ts` — className utility

### LearnerSidebar — needs a Profile link added
File: `components/learn/LearnerSidebar.tsx` (lines 16–21)
Currently has 4 nav items. Add a 5th:
```typescript
{ icon: User, href: '/learn/profile', tKey: 'learnNavProfile' as const },
```
Import `User` from `lucide-react`.

### No profile page exists yet
- `app/learn/profile/` — does not exist (create it)
- `app/api/profile/route.ts` — does not exist (only `app/api/profile/preferences/route.ts` exists)
- `lib/db/profile.ts` — does not exist (create it)

---

## Out of Scope

- Do NOT build admin views of other users' profiles
- Do NOT build a "public profile" page visible to other learners (future scope)
- Do NOT build a full endorsement send flow with search-for-user UI — include received endorsements display only; the send form is Phase 2
- Do NOT touch `src/` (mobile app) or `functions/` (Firebase)
- Do NOT modify existing migrations (041–050)
- Do NOT add npm packages without confirming with Tarun

---

## Database Changes — Migration 051

Create file: `supabase/migrations/051_nursed_profile_extended.sql`

```sql
-- ─────────────────────────────────────────────────────────────────────────────
-- Migration 051: Extended profile fields + endorsements table
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Extend nursed_profiles with professional + personal fields
ALTER TABLE nursed_profiles
  ADD COLUMN IF NOT EXISTS position      text         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS date_of_birth date         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bio           text         DEFAULT NULL;

-- 2. Endorsements table (peer-to-peer, one per pair)
CREATE TABLE IF NOT EXISTS nursed_endorsements (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id  uuid        NOT NULL REFERENCES nursed_profiles(id) ON DELETE CASCADE,
  to_user_id    uuid        NOT NULL REFERENCES nursed_profiles(id) ON DELETE CASCADE,
  message       text        NOT NULL CHECK (char_length(message) BETWEEN 1 AND 300),
  created_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT unique_endorsement_pair UNIQUE (from_user_id, to_user_id)
);

CREATE INDEX IF NOT EXISTS idx_nursed_endorsements_to_user
  ON nursed_endorsements(to_user_id);

-- 3. RLS on endorsements
ALTER TABLE nursed_endorsements ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nursed_endorsements' AND policyname = 'learners can view their own endorsements'
  ) THEN
    CREATE POLICY "learners can view their own endorsements" ON nursed_endorsements
      FOR SELECT USING (auth.uid() = to_user_id OR auth.uid() = from_user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nursed_endorsements' AND policyname = 'learners can give endorsements'
  ) THEN
    CREATE POLICY "learners can give endorsements" ON nursed_endorsements
      FOR INSERT WITH CHECK (auth.uid() = from_user_id);
  END IF;
END$$;
```

**Apply this migration before writing any code against it.** Use the Supabase SQL editor or the MCP tool (`user-supabase-tuto`). Verify the columns exist:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'nursed_profiles' AND column_name IN ('position', 'date_of_birth', 'bio');
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'nursed_endorsements');
```

---

## API Routes

### `GET /api/profile/route.ts` (new file)
Returns the authenticated user's full profile aggregate in a single call.

**Auth:** user session (use `createSupabaseServerClient()`)
**Method:** GET
**Response shape:**
```typescript
{
  success: true,
  data: {
    profile: {
      id, full_name, avatar_url, position, date_of_birth, bio,
      role, learning_intensity, preferred_days, onboarding_done,
      hospital: { id, name } | null
    },
    stats: {
      starBalance: number,
      starsEarned: number,
      starsSpent: number,
      streak: number,
      lessonsCompleted: number
    },
    badges: Array<{ id, name, name_vi, icon, points, earned_at }>,
    allBadgeDefinitions: Array<{ id, name, name_vi, icon, points }>,
    earnedBadgeIds: string[],
    coursesInProgress: Array<{ courseId, courseTitle, moduleTitle, lessonTitle, completionPct, lastActive }>,
    coursesCompleted: Array<{ courseId, courseTitle, completedAt }>,
    recentRedemptions: Array<{ couponName, brand, starsSpent, couponCode, redeemedAt }>,
    groupsJoined: Array<{ id, name, memberCount }>,
    endorsementsReceived: Array<{ from_name, message, created_at }>
  }
}
```

Use `getServiceClient()` for DB queries that need elevated access. Use `computeStreak` from `lib/rewards-engine.ts`.

For `nursed_pair_groups` — inspect the actual schema first (run `SELECT column_names FROM information_schema.columns WHERE table_name = 'nursed_pair_groups'`). Query groups the user belongs to based on whatever membership column exists.

### `PATCH /api/profile/route.ts` (same file, PATCH handler)
Updates editable profile fields.

**Auth:** user session
**Body:** `{ full_name?, position?, date_of_birth?, bio? }`
**Validation:** full_name max 100 chars, position max 100 chars, bio max 500 chars
**Response:** `{ success: true }`

### `POST /api/profile/avatar/route.ts` (new file)
Handles avatar image upload to Supabase Storage.

**Auth:** user session
**Body:** FormData with `file` field (image, max 2MB)
**Logic:**
1. Validate file type (jpeg/png/webp only) and size (≤ 2MB)
2. Upload to Supabase Storage bucket `avatars` at path `{userId}/avatar.{ext}` with `upsert: true`
3. Get the public URL
4. Update `nursed_profiles.avatar_url` for the user
5. Return `{ success: true, avatar_url: string }`

**Note on Storage bucket:** Check if the `avatars` bucket exists first via `supabase.storage.listBuckets()`. If it does not exist, create it as public: `supabase.storage.createBucket('avatars', { public: true })`.

### `GET /api/profile/endorsements/route.ts` (new file)
Returns endorsements received by the authenticated user.

**Response:** `{ success: true, data: Array<{ from_name, message, created_at }> }`

---

## UI Components

### `app/learn/profile/page.tsx`
Server Component. Calls `GET /api/profile` and passes data as props to `<ProfilePageClient>`.

Add a `<User />` icon link in page header if needed. Add `<Suspense>` with a skeleton fallback.

### `components/learn/ProfilePageClient.tsx`
Client Component. Receives the aggregated profile data as props. Renders all sections. Manages avatar upload state and inline edit state.

**Sections (in visual order):**

1. **Profile Header** — avatar (circular, editable), full_name (editable inline), position (editable), hospital badge, role pill, join date, bio (editable)
2. **Stats Row** — 4 stat pills: Star Balance ⭐, Current Streak 🔥, Lessons Completed ✅, Stars Earned total
3. **Learning Preferences** — preferred days + intensity displayed as pills with an "Edit" button that opens the `OnboardingModal` (which already handles this — import and reuse it)
4. **Courses In Progress** — horizontal scroll cards with course title, lesson title, progress bar (%)
5. **Completed Courses** — compact badge-style list with completion checkmark
6. **Badges & Achievements** — grid: earned badges (colored icon + name), locked badges (greyed with lock icon). Reuse the `earnedRewardIds` and `allBadgeDefinitions` from the API response.
7. **Recent Coupons Redeemed** — compact list: brand name, coupon code (monospace), stars spent, date
8. **Practice Groups** — pill list of group names
9. **Endorsements Received** — card list: from name, message, date. Empty state: "No endorsements yet — complete pair sessions to earn them"

### `components/learn/AvatarUpload.tsx`
Client Component. Props: `{ avatarUrl: string | null, onUploaded: (url: string) => void }`.
States: idle, uploading (spinner), error. Renders a circular avatar with a camera icon overlay on hover. On click, opens a file input. On file select, POSTs to `/api/profile/avatar` as FormData.

### `lib/db/profile.ts`
New helper file. Export:
```typescript
export async function getFullProfile(userId: string): Promise<ProfileAggregate>
export async function updateProfile(userId: string, patch: ProfilePatch): Promise<void>
```
These are called by the API routes. Compose calls to `lib/db/rewards.ts` and `lib/db/progress.ts` rather than duplicating query logic.

---

## Wiring & Integration

1. `app/learn/profile/page.tsx` (Server Component) → calls `GET /api/profile` internally via the `lib/db/profile.ts` helper (or directly fetch from the server component — either is fine)
2. `ProfilePageClient.tsx` → calls `PATCH /api/profile` on inline edits (debounced 1s or on blur)
3. `AvatarUpload.tsx` → calls `POST /api/profile/avatar`, updates local state with new URL on success
4. `LearnerSidebar.tsx` → add `{ icon: User, href: '/learn/profile', tKey: 'learnNavProfile' }` to `NAV_HREFS`
5. Profile page → clicking "Edit Preferences" opens `<OnboardingModal>` (already built at `components/learn/OnboardingModal.tsx`) — pass `onComplete={() => router.refresh()}` to reload profile data after saving
6. `lib/supabase.ts` → add `position: string | null`, `date_of_birth: string | null`, `bio: string | null` to the `NursedProfile` type (lines ~56–68)

---

## Translation Keys

Add to `lib/i18n/translations.ts`. Follow the existing pattern (EN key + VI key side by side):

```typescript
// ─── Profile Page ───────────────────────────────────────────────────
learnNavProfile: 'Profile',           // VI: 'Hồ sơ'
profilePageTitle: 'My Profile',       // VI: 'Hồ sơ của tôi'
profileEditName: 'Edit name',         // VI: 'Chỉnh sửa tên'
profilePosition: 'Position',          // VI: 'Chức vụ'
profileBio: 'About me',              // VI: 'Giới thiệu bản thân'
profileHospital: 'Hospital',          // VI: 'Bệnh viện'
profileJoinedDate: 'Joined {date}',   // VI: 'Tham gia {date}'
profileStatsBalance: 'Star Balance',  // VI: 'Số sao hiện có'
profileStatsStreak: 'Day Streak',     // VI: 'Chuỗi ngày học'
profileStatsLessons: 'Lessons Done',  // VI: 'Bài đã hoàn thành'
profileStatsEarned: 'Stars Earned',   // VI: 'Tổng sao đã nhận'
profileBadgesTitle: 'Badges',         // VI: 'Huy hiệu'
profileBadgesLocked: 'Locked',        // VI: 'Chưa đạt được'
profileCoursesInProgress: 'In Progress', // VI: 'Đang học'
profileCoursesCompleted: 'Completed', // VI: 'Đã hoàn thành'
profileCoursesEmpty: 'No courses yet', // VI: 'Chưa có khóa học'
profileCouponsTitle: 'Redeemed Coupons', // VI: 'Phiếu đã đổi'
profileCouponsEmpty: 'No coupons redeemed yet', // VI: 'Chưa đổi phiếu nào'
profileGroupsTitle: 'Practice Groups', // VI: 'Nhóm luyện tập'
profileGroupsEmpty: 'No groups joined yet', // VI: 'Chưa tham gia nhóm nào'
profileEndorsementsTitle: 'Endorsements', // VI: 'Đánh giá từ bạn học'
profileEndorsementsEmpty: 'No endorsements yet — complete pair sessions to earn them', // VI: 'Chưa có đánh giá — hoàn thành buổi luyện đôi để nhận'
profilePrefsTitle: 'Learning Preferences', // VI: 'Sở thích học tập'
profilePrefsEdit: 'Edit Preferences', // VI: 'Chỉnh sửa'
profileAvatarUpload: 'Upload photo',  // VI: 'Tải ảnh lên'
profileSaveSuccess: 'Profile saved',  // VI: 'Đã lưu hồ sơ'
profileSaveError: 'Failed to save profile', // VI: 'Lưu thất bại'
```

---

## Test Cases

Create `apps/med/test-cases.csv` with at minimum these cases:

| id | section | action | expected_result |
|----|---------|--------|-----------------|
| TC01 | Profile Header | Load profile page as test@test.com | Header shows "Test User", no hospital (null), learner role badge |
| TC02 | Profile Header | Click avatar area | File picker opens |
| TC03 | Profile Header | Upload a valid .jpg under 2MB | Avatar updates in UI, no error |
| TC04 | Profile Header | Upload a .pdf file | Error shown: invalid file type |
| TC05 | Profile Header | Upload image over 2MB | Error shown: file too large |
| TC06 | Inline edit | Click name field, change name, blur | PATCH called, success toast shown |
| TC07 | Inline edit | Set position to "ICU Nurse", blur | Position saved and re-displayed |
| TC08 | Stats Row | Load page | Star balance matches /api/rewards/balance |
| TC09 | Stats Row | Load page | Streak number matches /api/rewards/balance |
| TC10 | Badges | Load page | Earned badges show coloured, locked badges show greyed |
| TC11 | Courses | Load page | In-progress courses show with % bar |
| TC12 | Courses | Load page | No completed courses → empty state shown (not an error) |
| TC13 | Coupons | Load page | No redemptions → empty state shown |
| TC14 | Groups | Load page | Groups section renders without crash |
| TC15 | Endorsements | Load page | Empty state shown (test account has no endorsements) |
| TC16 | Preferences | Click "Edit Preferences" | OnboardingModal opens |
| TC17 | Sidebar | Load any /learn page | Profile link appears in sidebar |
| TC18 | Sidebar | Click Profile in sidebar | Navigates to /learn/profile |
| TC19 | Build | Run npm run build | Zero TypeScript errors, zero build errors |
| TC20 | i18n | Toggle language to VI | All profile strings display in Vietnamese |

Format in CSV:
```
id,section,action,expected_result,status,notes
TC01,Profile Header,Load profile page as test@test.com,Header shows "Test User" learner role badge,PENDING,
```

---

## Guardrails

- **Do NOT modify** migrations 041–050
- **Do NOT touch** `src/` (mobile) or `functions/` (Firebase)
- **Do NOT create duplicate API routes** — extend `/api/profile/route.ts` with PATCH rather than creating a new file for profile updates
- **Do NOT hardcode strings** — every user-facing string goes through `t.keyName` via `useLang()`
- **Do NOT add npm packages** — all needed libraries are already installed (`framer-motion`, `lucide-react`, etc.)
- **Run** `npm run build` in `apps/med/` before declaring done — zero TypeScript errors required
- **Run** `npx tsc --noEmit` separately to catch type-only errors
- **Apply migration 051 first** — verify columns exist before writing code against them
- **Avatar uploads**: validate file type and size on the server, not just the client
- **isFuture-style bugs**: if you compute anything date-dependent (age from DOB), test: DOB today, DOB in future, DOB null
- **Empty states**: every section must have a real empty state — not a blank space, not a crash

---

## Definition of Done

All of the following must be true:

- [ ] Migration 051 applied and columns verified in Supabase
- [ ] `GET /api/profile` returns valid data for `test@test.com`
- [ ] `PATCH /api/profile` saves name, position, bio correctly
- [ ] `POST /api/profile/avatar` successfully uploads an image and updates `avatar_url`
- [ ] `/learn/profile` page loads without errors in browser
- [ ] All 9 profile sections render (with appropriate empty states where data is absent)
- [ ] Inline editing of name and position works with success feedback
- [ ] "Edit Preferences" button opens `OnboardingModal`
- [ ] Profile link appears in `LearnerSidebar` and navigates correctly
- [ ] `test-cases.csv` exists with all 20 test cases (minimum) marked PASS or FAIL
- [ ] All FAIL cases fixed and re-tested
- [ ] `npm run build` completes with zero errors
- [ ] All user-facing strings are in `lib/i18n/translations.ts`, not hardcoded
- [ ] Language toggle (EN ↔ VI) works on the profile page

---

## Test Account

| Field | Value |
|-------|-------|
| Email | test@test.com |
| Password | password |
| Role | learner |
| Name | Test User |

Local dev: `http://localhost:3001` (run `npm run dev` in `apps/med/`)
Auth bypass: `NEXT_PUBLIC_AUTH_DISABLED=true` in `.env.local` skips auth if needed.

---

## Brainstorm Prompt for the Agent

Before writing any code, spend one pass thinking about this:

A Vietnamese nurse opens her profile page for the first time. What does she feel when she sees it? She has been studying for 3 weeks. She has completed 4 lessons, earned 2 badges, and redeemed a coffee shop coupon. She is part of one practice group. She has never set her position or uploaded a photo.

The page should feel like **her learning identity card** — not a settings form. The badges she's earned should feel like something worth showing off. The in-progress course bar should make her want to finish it. The empty endorsements section should feel like an invitation, not a failure.

Design with this person in mind.
