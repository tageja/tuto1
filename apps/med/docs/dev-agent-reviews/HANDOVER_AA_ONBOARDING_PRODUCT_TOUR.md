# HANDOVER AA — Onboarding Product Tour (`react-joyride`)

## Agent Role & Identity

You are a **Senior Front-End Engineer with strong product-UX instincts**. You've shipped onboarding flows for SaaS products before and you understand that **first-session activation** is the highest-leverage moment in any product's lifecycle. You think in habit loops and you write code that respects the user's time. Every word in a coachmark earns its place; every step has a reason.

**Critical context: this is a Vietnamese-first product.** Every user-visible string MUST be authored in Vietnamese first, English second. Vietnamese is `vi`, English is `en` — when picking copy, write VI first, then translate to EN. The Vietnamese voice should feel warm and clear, not technical-translated.

**Working directory:** `apps/med/`. **Migrations folder:** `supabase/migrations/`.

**Test account:** `test@test.com` / `password` (role: `learner`). To re-test the tour, you'll need a way to reset `tour_completed_at` and `tour_skipped_at` to null in `nursed_profiles` — document the SQL for this in your testing notes.

---

## Feature Overview

A **two-stage product tour** runs after the existing preferences-collection modal (`OnboardingModal`) when a learner logs in for the first time:

**Stage 1 — Welcome Tour (5 cards, full-screen modal-style with spotlights):**
1. Welcome card with the homepage intro video (autoplay muted, "Got it, continue" button visible from second 0 — NOT forced)
2. Spotlight on "My Courses" sidebar item — explains the lesson model
3. Spotlight on "Practice Groups" — explains peer practice
4. Spotlight on "Rewards" — explains streaks and stars
5. Spotlight on the floating feedback button — encourages reporting issues
   Final CTA: "Start your first lesson" → navigates to `/learn/courses`

**Stage 2 — Lesson Player Tour (5+ contextual coachmarks, runs inside the lesson player on first lesson entry):**
1. Step counter at top — "This lesson has X steps. Each unlocks the next."
2. Step navigation (back/next) — "Tap Next when you're done with a step"
3. When a `script_read` step appears for the first time: "Listen to every chat bubble before continuing — the Next button unlocks when you've heard all of them" (THIS IS NON-OBVIOUS — Lesson 19 in the orchestrator handover documents this rule)
4. When a recording-mic button first appears: "Tap the mic to record. We save your audio for peer review."
5. When a peer-review prompt appears (could be a separate tour): "Listen to a partner's recording, give them a 1-5 rating"
   Final: "You've got this — finish the lesson to earn your first star"

**Both tours respect a smart soft-recurrence model** (see "Trigger Logic" below) — they auto-run once, never nag, but are always re-triggerable from the profile menu.

**System behaviour:** the tour writes two timestamp columns on `nursed_profiles` (`tour_completed_at`, `tour_skipped_at`) so state survives across devices. Local state is mirrored in `localStorage` for instant resume on the same device.

---

## Current State

### What already exists (do NOT recreate or replace)

| File / Resource | Purpose | Status |
|---|---|---|
| `components/learn/OnboardingModal.tsx` | **Preferences-collection modal** (intensity: mini/deep, preferred_days). Triggers via `!profile.onboarding_done` check in `app/learn/page.tsx`. Sets `onboarding_done = true` after submission. | ✅ Live — tour runs AFTER this modal closes |
| `nursed_profiles.onboarding_done` (boolean) | "User has set their learning preferences" flag | ✅ Live — distinct from the new tour-state columns |
| `nursed_site_settings.homepage` (JSONB) | Stores the homepage intro video URL | ✅ Live — fetch via `GET /api/site-settings/homepage` |
| `app/api/site-settings/homepage/route.ts` | Returns `{ data: { intro_video_url: '...' } }` (or similar shape — verify on read). Anonymous-readable. | ✅ Live |
| `components/learn/LearnerSidebar.tsx` | Sidebar nav with NAV_HREFS array (Dashboard, Courses, Pairs, Rewards, Profile, My Feedback). Mobile sidebar is hidden behind hamburger; opens via `isOpen` prop. | ✅ Live — needs `data-tour-target` attributes added |
| `components/learn/FeedbackButton.tsx` | Floating feedback FAB at bottom-right | ✅ Live — needs `data-tour-target` attribute added |
| `framer-motion@^12.23.x` | Animation library | ✅ Already installed |
| `lib/i18n/translations.ts` | EN + VI translation map | ✅ Live — append new keys here |
| `supabase/migrations/050_nursed_learning_preferences.sql` | Adds `onboarding_done`, `preferred_days`, etc. | ✅ Live — extend this pattern for the new columns |

### What is missing (this agent's job)

1. **No product tour exists** — no spotlights, coachmarks, or guided overlay. The existing `OnboardingModal` is just a preferences form.
2. **`react-joyride` is NOT installed** — Tarun has approved adding it as a dependency for this task. **Verify with `npm ls react-joyride` before adding** in case it appears in a future session, but as of this writing it's not in `package.json`.
3. **No tour-state columns on `nursed_profiles`** — need migration 055 (or 054 if Agent Z's metrics views haven't landed yet).
4. **No `data-tour-target` attributes** on the 5 sidebar/floating elements — need to be added with stable values.
5. **No "Take the tour" replay link** in the profile menu (the tour must be re-triggerable manually).

### Type contract additions

Extend `lib/supabase.ts` `NursedProfile` type with the two new optional columns:

```ts
export interface NursedProfile {
  // ...existing fields
  tour_completed_at: string | null  // ISO timestamp; null = not completed
  tour_skipped_at: string | null    // ISO timestamp; null = not skipped
}
```

---

## Out of Scope

- ❌ **Don't replace or modify `OnboardingModal.tsx`** (the preferences modal). The tour is layered on top, not a replacement.
- ❌ **Don't gate first-time access** — never block the user from reaching `/learn` or `/learn/courses` if they skip the tour. Always-skippable, always-recoverable.
- ❌ **Don't track tour-step analytics** to a third-party service for MVP. If you want to log tour-step progression, write to a simple internal table or skip entirely. (Future: integrate with the metrics dashboard from Agent Z.)
- ❌ **Don't add a "Don't show again" checkbox** — the smart-recurrence model handles this implicitly. Adding the checkbox creates UX inconsistency.
- ❌ **Don't auto-play sound** anywhere in the tour. If the homepage video has audio, autoplay it MUTED with a visible unmute button. Browsers block unmuted autoplay anyway.
- ❌ **Don't make the tour reach into the admin UI.** Admin routes (`/admin/*`) are out of scope. This is a learner-only feature.
- ❌ **Don't rebuild what `react-joyride` provides** — use its built-in spotlight, beacon, tooltip, and step controller. The custom code is the trigger logic, the step content, and the schema integration, not the rendering primitives.

---

## Database Changes

**New migration:** `supabase/migrations/055_nursed_tour_state.sql` (or `054_*.sql` if Agent Z hasn't landed yet — check the latest migration number with `Get-ChildItem supabase/migrations` first).

```sql
-- ============================================================
-- NurseEd: Onboarding Product Tour state (Agent AA)
-- Migration 055
-- ============================================================

ALTER TABLE nursed_profiles
  ADD COLUMN IF NOT EXISTS tour_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS tour_skipped_at   timestamptz;

CREATE INDEX IF NOT EXISTS idx_nursed_profiles_tour_state
  ON nursed_profiles (tour_completed_at, tour_skipped_at)
  WHERE tour_completed_at IS NULL AND tour_skipped_at IS NULL;

-- Existing self-update RLS already covers UPDATEs to these columns via the user's own profile row.
-- No new policies needed.
```

**Apply via Supabase SQL editor in the production project (`fkjeggdxqifqqwhuqpgm`)** AND commit the migration file to git (per Lesson 4 — never write a migration without applying it).

Verify with:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'nursed_profiles' AND column_name IN ('tour_completed_at', 'tour_skipped_at');
-- expect 2 rows
```

---

## API Routes

### NEW: `PATCH /api/profile/tour`

**File:** `app/api/profile/tour/route.ts`

**Auth:** any authenticated learner (own profile only).

**Request body:**
```ts
{ action: 'complete' | 'skip' | 'reset' }
```

- `complete` → set `tour_completed_at = NOW()`, leave `tour_skipped_at` unchanged
- `skip` → set `tour_skipped_at = NOW()`, leave `tour_completed_at` unchanged
- `reset` → set both to `null` (used by the "Take the tour" replay link in the profile menu)

**Response:**
```ts
{ data: { tour_completed_at: string | null; tour_skipped_at: string | null } }
```

**Implementation pattern** (mirror existing `/api/profile/preferences/route.ts`):
- Use the session `createSupabaseServerClient()` — RLS enforces self-update
- Update returns the new values for the caller to mirror in their local state

---

## Trigger Logic (the smart soft-recurrence)

This is the most important spec in the handover. Implement it exactly as below.

```ts
// Pseudocode — runs on mount of `app/learn/layout.tsx` (or in a TourProvider)

function shouldAutoRunWelcomeTour(profile: NursedProfile, hasCompletedAnyLesson: boolean): boolean {
  // Pre-conditions: must have completed preferences modal first
  if (!profile.onboarding_done) return false

  // Already completed the tour — never auto-run
  if (profile.tour_completed_at !== null) return false

  // Already explicitly skipped — never auto-run
  if (profile.tour_skipped_at !== null) return false

  // Already learning — silently mark as skipped, don't tour them
  if (hasCompletedAnyLesson) {
    fetch('/api/profile/tour', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'skip' }),
    })
    return false
  }

  // Brand new: auto-run
  return true
}
```

**Lesson tour trigger** (separate state — implement as a localStorage key for v1, NOT a DB column, since it's per-lesson and we don't need cross-device fidelity for the lesson tour):

```ts
const LESSON_TOUR_STORAGE_KEY = 'nursed_lesson_tour_seen'

function shouldRunLessonTour(): boolean {
  if (typeof window === 'undefined') return false
  return localStorage.getItem(LESSON_TOUR_STORAGE_KEY) !== '1'
}

function markLessonTourSeen(): void {
  localStorage.setItem(LESSON_TOUR_STORAGE_KEY, '1')
}
```

**"Take the tour" replay link** (in the profile menu — find `app/learn/profile/page.tsx` or the profile dropdown component):
- On click: `PATCH /api/profile/tour` with `{ action: 'reset' }` → reload the page → tour auto-runs again
- Also clears `localStorage.removeItem(LESSON_TOUR_STORAGE_KEY)` so the lesson tour reappears too

---

## UI Components

### 1. `npm install react-joyride@^2.x` (NEW DEPENDENCY)

Tarun has approved this dependency for this task. Use the latest stable 2.x (currently `^2.9.0` as of writing — verify with `npm view react-joyride version`).

### 2. `components/learn/tour/TourProvider.tsx` (NEW)

A React Context provider that wraps the `/learn` layout. Responsibilities:
- Read profile state on mount
- Decide whether to auto-run the welcome tour (using `shouldAutoRunWelcomeTour`)
- Mount `<Joyride>` with the welcome tour steps
- Handle `STATUS.FINISHED` → call `PATCH /api/profile/tour { action: 'complete' }`
- Handle `STATUS.SKIPPED` → call `PATCH /api/profile/tour { action: 'skip' }`
- Expose `runTour: () => void` and `runLessonTour: () => void` via context for child components

```tsx
interface TourContextValue {
  runWelcomeTour: () => void
  runLessonTour: () => void
  isWelcomeTourRunning: boolean
  isLessonTourRunning: boolean
}
```

### 3. `components/learn/tour/welcomeTourSteps.ts` (NEW)

Exports the 5-step welcome tour configuration in `Step[]` format (react-joyride's type). Key points:
- All copy goes through `t.tourWelcomeStep1Title`, `t.tourWelcomeStep1Body`, etc. — NEVER hardcode strings.
- Step 1 (welcome card) uses `target: 'body'` (full-screen card, no spotlight target). Renders the homepage video inline using a fetch to `/api/site-settings/homepage` for the URL.
- Steps 2-5 use targets like `[data-tour-target="my-courses"]`, `[data-tour-target="practice-groups"]`, etc.
- Use `disableBeacon: true` for an immediate-tooltip flow (no "click the beacon to begin" pattern — it's confusing for first-time users).

### 4. `components/learn/tour/lessonTourSteps.ts` (NEW)

Exports the 5+ lesson-player tour configuration. Targets reference elements inside `app/learn/courses/[courseId]/lessons/[lessonId]/page.tsx`:
- `[data-tour-target="lesson-step-counter"]`
- `[data-tour-target="lesson-next-button"]`
- `[data-tour-target="script-read-bubbles"]` (only attached on `script_read` step type — visibility-conditional)
- `[data-tour-target="recording-mic"]` (only on `recording_submit` step type)
- `[data-tour-target="peer-review-prompt"]` (only on peer review step type)

### 5. `data-tour-target` attributes (EDIT existing components)

Add stable `data-tour-target` attributes to the 5 welcome-tour targets and the 5 lesson-tour targets. Document each in a comment:

| Target | File | Element | Comment |
|---|---|---|---|
| `my-courses` | `LearnerSidebar.tsx` | The `<Link>` for `/learn/courses` | Welcome tour step 2 |
| `practice-groups` | `LearnerSidebar.tsx` | The `<Link>` for `/learn/pairs` | Welcome tour step 3 |
| `rewards` | `LearnerSidebar.tsx` | The `<Link>` for `/learn/rewards` | Welcome tour step 4 |
| `feedback-button` | `FeedbackButton.tsx` | The `<motion.button>` | Welcome tour step 5 |
| `lesson-step-counter` | Lesson player page | The element showing "Step X of Y" | Lesson tour step 1 |
| `lesson-next-button` | Lesson player page | The "Next" CTA | Lesson tour step 2 |
| `script-read-bubbles` | `ScriptReadStep.tsx` | The chat-bubble container | Lesson tour step 3 (conditional) |
| `recording-mic` | `RecordingStep.tsx` (or wherever the mic button lives) | The mic button | Lesson tour step 4 (conditional) |
| `peer-review-prompt` | Peer review step component | The peer review prompt area | Lesson tour step 5 (conditional) |

**Lesson 7 reminder:** these attributes must be on elements that are actually visible during the tour. If a step type is conditional, the lesson tour spec must skip its tip when the step is absent. Use react-joyride's `Step.disableScrolling: false` so the tour scrolls to elements as needed.

### 6. Mobile considerations

Mobile sidebar is hidden behind a hamburger by default. **The tour MUST programmatically open the sidebar before showing sidebar coachmarks on mobile.** Implementation:
- Add a `forceSidebarOpen: () => void` prop to `LearnerSidebar` (lifted to layout state)
- Tour callback: when transitioning to step 2 (My Courses), call `forceSidebarOpen()`
- When the tour ends or user skips, close the sidebar again

Test on a 360×640 viewport to confirm.

### 7. "Take the tour" replay link (EDIT)

In `app/learn/profile/page.tsx` (or the profile menu component), add a link/button:

```tsx
<button onClick={async () => {
  await fetch('/api/profile/tour', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'reset' }),
  })
  localStorage.removeItem('nursed_lesson_tour_seen')
  window.location.href = '/learn'
}}>
  {t.tourReplayLink}
</button>
```

Place it in the user-settings area, NOT prominently in the main nav (it should be discoverable when needed, not a constant CTA).

---

## Wiring & Integration

### Mounting the TourProvider

In `app/learn/layout.tsx`, wrap the existing layout body:

```tsx
import TourProvider from '@/components/learn/tour/TourProvider'

export default function LearnLayout({ children }) {
  // ...existing state
  return (
    <TourProvider>
      <div className="flex min-h-screen bg-surface">
        {/* ...existing sidebar + main */}
      </div>
    </TourProvider>
  )
}
```

The TourProvider reads the auth context internally to access the profile, so no prop drilling needed.

### react-joyride styling — match the brand

Pass these styles to `<Joyride>`:

```ts
const joyrideStyles = {
  options: {
    primaryColor: 'var(--primary)',     // #0B5FFF — your brand color
    backgroundColor: '#FFFFFF',
    textColor: '#333333',
    overlayColor: 'rgba(0, 0, 0, 0.55)',
    arrowColor: '#FFFFFF',
    zIndex: 10000,                       // Above the floating feedback button (z-90)
    width: 360,                          // Tooltip card width on desktop
  },
  buttonNext: {
    backgroundColor: 'var(--primary)',
    borderRadius: '12px',                // Match your `rounded-xl` system
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'uppercase',          // Match your button style
  },
  buttonBack: {
    color: 'var(--text-muted)',
  },
  buttonSkip: {
    color: 'var(--text-muted)',
  },
}
```

Set `<Joyride locale={tourLocale}>` with VI labels (Skip, Next, Back, Last, Close) — react-joyride's `locale` prop overrides built-in labels.

```ts
const tourLocale = lang === 'vi'
  ? { back: 'Quay lại', close: 'Đóng', last: 'Hoàn thành', next: 'Tiếp', skip: 'Bỏ qua' }
  : { back: 'Back', close: 'Close', last: 'Finish', next: 'Next', skip: 'Skip' }
```

---

## Translation Keys (NEW — add to `lib/i18n/translations.ts`)

**Vietnamese first.** Authored copy (not machine-translated). Tarun may refine VI copy after the build — that's fine.

| Key | VI (primary) | EN (secondary) |
|---|---|---|
| `tourWelcomeStep1Title` | `Chào mừng đến với tuto. Pro!` | `Welcome to tuto. Pro!` |
| `tourWelcomeStep1Body` | `Trong 60 giây tới, hãy xem nhanh cách hoạt động. Bạn có thể bỏ qua bất kỳ lúc nào.` | `Take 60 seconds to see how it works. You can skip anytime.` |
| `tourWelcomeStep1Continue` | `Đã hiểu, tiếp tục` | `Got it, continue` |
| `tourWelcomeStep2Title` | `Khóa học của tôi` | `My Courses` |
| `tourWelcomeStep2Body` | `Đây là nơi bạn chọn khóa học và bắt đầu các bài học. Mỗi khóa có nhiều bài học ngắn dễ hoàn thành.` | `Pick a course and start your lessons. Each course has short, easy-to-complete lessons.` |
| `tourWelcomeStep3Title` | `Nhóm thực hành` | `Practice Groups` |
| `tourWelcomeStep3Body` | `Tìm bạn cùng học, ghi âm, và đánh giá lẫn nhau để cải thiện phát âm.` | `Find study partners, record audio, and rate each other to improve your pronunciation.` |
| `tourWelcomeStep4Title` | `Phần thưởng` | `Rewards` |
| `tourWelcomeStep4Body` | `Mỗi ngày bạn học, bạn xây dựng chuỗi và kiếm sao để đổi lấy phần thưởng.` | `Every day you learn, you build a streak and earn stars to redeem rewards.` |
| `tourWelcomeStep5Title` | `Phản hồi của bạn` | `Your feedback` |
| `tourWelcomeStep5Body` | `Có vấn đề hay ý tưởng? Nhấn nút này bất kỳ lúc nào để cho chúng tôi biết.` | `Have a question or idea? Tap this button anytime to tell us.` |
| `tourWelcomeFinalTitle` | `Sẵn sàng chưa?` | `Ready?` |
| `tourWelcomeFinalBody` | `Hãy bắt đầu với bài học đầu tiên của bạn.` | `Let's start with your first lesson.` |
| `tourWelcomeFinalCta` | `Bắt đầu học` | `Start learning` |
| `tourLessonStep1Title` | `Cấu trúc bài học` | `Lesson structure` |
| `tourLessonStep1Body` | `Mỗi bài có nhiều bước. Hoàn thành từng bước để mở khóa bước tiếp theo.` | `Each lesson has several steps. Complete each step to unlock the next.` |
| `tourLessonStep2Title` | `Di chuyển giữa các bước` | `Move between steps` |
| `tourLessonStep2Body` | `Nhấn Tiếp khi bạn đã hoàn thành một bước.` | `Tap Next when you've finished a step.` |
| `tourLessonStep3Title` | `Hộp thoại — nghe trước, đọc sau` | `Dialogue — listen first, then read` |
| `tourLessonStep3Body` | `Nghe tất cả các bóng thoại trước khi tiếp tục. Nút Tiếp sẽ mở khi bạn đã nghe hết.` | `Listen to every chat bubble before continuing. The Next button unlocks when you've heard them all.` |
| `tourLessonStep4Title` | `Ghi âm câu trả lời của bạn` | `Record your answer` |
| `tourLessonStep4Body` | `Nhấn vào microphone để ghi âm. Chúng tôi sẽ lưu để bạn nghe lại và bạn cùng nhóm có thể đánh giá.` | `Tap the microphone to record. We save your audio so you can listen back and your group can rate it.` |
| `tourLessonStep5Title` | `Đánh giá bạn cùng học` | `Rate your peers` |
| `tourLessonStep5Body` | `Khi bạn cùng nhóm chia sẻ ghi âm, hãy nghe và cho điểm 1-5 sao.` | `When a groupmate shares a recording, listen and give them a 1-5 star rating.` |
| `tourLessonFinalTitle` | `Bạn làm được mà!` | `You've got this!` |
| `tourLessonFinalBody` | `Hoàn thành bài học để kiếm ngôi sao đầu tiên của bạn.` | `Finish the lesson to earn your first star.` |
| `tourReplayLink` | `Xem lại hướng dẫn` | `Take the tour again` |
| `tourSkipConfirm` | `Bạn chắc chắn muốn bỏ qua hướng dẫn?` | `Are you sure you want to skip the tour?` |

Total: ~28 new keys.

---

## Testing Checklist

Run all of these manually with `test@test.com` (after resetting their tour state via SQL: `UPDATE nursed_profiles SET tour_completed_at = NULL, tour_skipped_at = NULL WHERE id = 'TEST_USER_ID';`).

1. **Fresh-user auto-run:** Sign in to a brand-new test account that has just completed the preferences modal but has no completed lessons. Welcome tour auto-runs immediately.
2. **Skip path:** During the welcome tour, click "Skip". Tour disappears. Refresh the page — tour does NOT reappear. Verify `tour_skipped_at` is set in the DB.
3. **Complete path:** Run through all 5 steps + final CTA. Tour ends, user lands on `/learn/courses`. `tour_completed_at` is set. Refresh — tour does not reappear.
4. **Implicit skip via lesson completion:** Reset both columns to null. Manually mark one lesson as completed in `nursed_progress`. Refresh `/learn`. Tour does NOT auto-run AND `tour_skipped_at` should be set silently (verify in DB).
5. **Replay link:** Reset tour state. Run welcome tour to completion. Visit profile menu, click "Take the tour again". Tour resets and auto-runs.
6. **Mobile sidebar auto-open:** On a 360×640 viewport, sign in fresh. Welcome tour starts. When step 2 (My Courses) appears, the sidebar auto-opens and the spotlight is visible. After tour ends, sidebar auto-closes.
7. **Lesson tour auto-run:** Complete the welcome tour. Click into the first lesson. Lesson tour starts. Step through all tips. Verify localStorage key `nursed_lesson_tour_seen=1` is set after completion. Open another lesson — tour does NOT reappear.
8. **Lesson tour conditional steps:** In a lesson WITHOUT a `script_read` or `recording_submit` step, the lesson tour should still complete cleanly without erroring out — the conditional tips simply skip.
9. **Video step on slow network:** Throttle to 3G. The Step 1 video card should not block the tour — it loads in the background, but the "Got it, continue" button is always interactable.
10. **Video URL missing:** If `/api/site-settings/homepage` returns no video URL, Step 1 still renders (just without the video, with a generic welcome graphic instead). No crash, no broken layout.
11. **Two-language toggle:** Mid-tour, toggle the language from VI → EN. Tour text updates without losing position. Toggle back to VI.
12. **Build:** `npm run build` exits clean (will require running `npm install` first to add `react-joyride`). `npx tsc --noEmit` shows no new errors vs. baseline.
13. **Production smoke test:** After deploy, sign in as a test account on `pro.tuto.asia`. Tour runs end-to-end without console errors.

---

## Guardrails

- **Don't replace the `OnboardingModal` preferences modal.** It's a separate concern. The tour layers on top.
- **Don't add the tour anywhere outside `/learn/*` routes.** Public pages (`/`, `/about`, `/auth/*`) and admin (`/admin/*`) are out of scope.
- **Don't hardcode strings.** Every visible word goes through `t.tourXxx`. VI is authored, EN is the secondary translation.
- **Don't autoplay video with sound.** Browser policies block this anyway, but explicitly set `<video muted autoPlay>` and offer a clear unmute control.
- **Don't block the user.** No matter how compelling the tour seems, "Skip" is always one click away. The skip button is visible from the first step.
- **Don't add new dependencies beyond `react-joyride`.** Tarun has approved that one specifically. Anything else (e.g. `intro.js`, `shepherd.js`) is out of scope.
- **Do test on mobile (360px) AND desktop (1280px).** Tours that only work on desktop are worse than no tour.
- **Do log the tour-state changes** in a single commit message that names the columns added (`tour_completed_at`, `tour_skipped_at`) so the next orchestrator session can find this work in `git log`.
- **Run `npm run build` and `npx tsc --noEmit` before declaring done.** Use the line-shift trick (Lesson 13) to verify no NEW TS errors vs. baseline (the file `lib/i18n/translations.ts` has 12 pre-existing TS1117 duplicate-key errors that must remain at the same count after your edits).
- **Don't auto-deploy.** Commit to `agent-x-integration`, push, then notify Tarun to promote with `vercel promote <id> --scope tarun-tagejas-projects --yes` (Lesson 16).

---

## Definition of Done

The task is complete when ALL of the following are true:

1. Migration `055_nursed_tour_state.sql` (or `054_*` if Z hasn't landed yet) is applied to the production Supabase project AND committed to git.
2. `react-joyride` is added to `apps/med/package.json` with a pinned 2.x version, and `package-lock.json` is updated.
3. Welcome tour auto-runs for a fresh learner who has just completed the preferences modal and has no completed lessons.
4. Welcome tour does NOT auto-run for any user with `tour_completed_at` or `tour_skipped_at` set, OR who has completed any lesson.
5. Lesson tour auto-runs the first time a learner enters any lesson (after the welcome tour or after skipping it). Stored as `localStorage.nursed_lesson_tour_seen`.
6. Both tours are skippable from the first step, and skip respects the user's choice (no re-nag).
7. The "Take the tour again" link in the profile menu resets state and re-runs both tours.
8. Mobile sidebar auto-opens during sidebar-coachmark steps, then auto-closes after the tour.
9. Conditional lesson-tour tips (script_read, recording, peer-review) skip cleanly when the corresponding step type is absent from the current lesson.
10. All visible strings come from `t.tourXxx` in `lib/i18n/translations.ts`. VI authored, EN translated.
11. `npm run build` exits clean. `npx tsc --noEmit` reports no new errors vs. baseline.
12. Mobile (360×640) and desktop (1280×720) both render the tour cleanly with no element-occlusion.
13. A single commit (or two: one for migration + schema types, one for tour components + sidebar/feedback edits) on `agent-x-integration` with message `feat(nursed): onboarding product tour with react-joyride (Agent AA)` — push and notify Tarun to promote.

**Estimated effort:** 8-12 hours for a focused front-end agent. The bulk of time is in: writing 28 i18n strings (1h), styling react-joyride to match the brand (2h), wiring the trigger logic + sidebar auto-open (3h), data-tour-target attributes (1h), testing on mobile + desktop + edge cases (2h), and polishing the video step (1h). Schema + API are straightforward (1h).

**This is the highest-leverage feature for MVP activation. Polish matters. Treat the copy like product copy, not docs.**
