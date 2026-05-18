# HANDOVER — QA Testing Agent (End-to-End Test Expansion)

## Agent Role & Identity

You are a **Senior QA Automation Engineer** specialising in Playwright, Next.js, and Supabase. You write deterministic, parallel-safe regression tests that catch bugs before real learners do. You never disable a failing test to make a run green — you fix the bug or leave the test as `test.fixme()` with a clear explanation.

**Working directory:** `C:\Users\Admin\tuto-nursemed-practice-pilot\apps\med`
**Branch:** `agent-x-integration`
**Production URL:** `pro.tuto.asia`
**Local dev URL:** `http://localhost:3001`
**Test account:** `test@test.com / password` (role: `learner`)

---

## Current Test System State (as of 2026-05-17)

### Infrastructure
The Playwright QA system is fully installed and operational. See `tests/TEST_AGENT_INSTRUCTIONS.md` for the setup checklist. All dependencies are installed; Chromium is downloaded.

### What's already tested — all 17 nurse-reported bugs

All 17 bugs from `TUTO PRO FEEDBACK.xlsx` have spec files. **16 are active passing tests; 1 remains `test.fixme`.**

| Bug # | File | Status | What it guards |
|---|---|---|---|
| 1 | `bug-001-register-db-error.spec.ts` | ✅ Passing | POST /auth/register does not 500 |
| 2 | `bug-002-logout-missing.spec.ts` | ✅ Passing | Logout control is reachable from /learn |
| 3 | `bug-003-vi-hints-button.spec.ts` | ✅ Passing | VI hints toggle changes visible content |
| 4 | `bug-004-logo-redirect.spec.ts` | ✅ Passing | Logo navigates to public landing (/) |
| 5 | `bug-005-course-unlock-order.spec.ts` | ✅ Passing | A1 course shows as Coming Soon (published=false in DB) |
| 6 | `bug-006-tutorial-next-button.spec.ts` | ⏳ `test.fixme` | Joyride tour Next button timing — needs localStorage + JoinGroupGate fix |
| 7 | `bug-007-language-toggle-leakage.spec.ts` | ✅ Passing | EN mode shows no VI diacritics on course cards |
| 8 | `bug-008-invite-code-paste-field.spec.ts` | ✅ Passing | /learn/pairs has join-code input (data-testid="join-code-input") |
| 9 | `bug-009-partner-sidebar-layout.spec.ts` | ✅ Passing | Partner logo renders ≥32px |
| 10 | `bug-010-flashcard-got-it-advances.spec.ts` | ✅ Passing | "Got it" button advances flashcard index |
| 11 | `bug-011-audio-overlap-tab-switch.spec.ts` | ✅ Passing | Switching AudioShadow phase tab pauses prior audio |
| 12 | `bug-012-flashcard-content-duplication.spec.ts` | ✅ Passing | Lesson 2 flashcards share <50% content with Lesson 1 |
| 13 | `bug-013-spot-the-mistake-answer.spec.ts` | ✅ Passing | Every spot_the_mistake step has ≥1 identifiable mistake |
| 14 | `bug-014-punctuation-question-vs-period.spec.ts` | ✅ Passing | No declarative sentence ends with ? in script_read steps |
| 15 | `bug-015-silent-recording-accepted.spec.ts` | ✅ Passing | Silent recordings rejected via VAD (AudioContext amplitude check) |
| 16 | `bug-016-progress-wipe-on-reentry.spec.ts` | ✅ Passing | Re-entering a completed lesson keeps completed=true |
| 17 | `bug-017-profile-cascade-from-progress.spec.ts` | ✅ Passing | Profile completed-count survives lesson re-entry |

### What's NOT tested yet (the gaps this handover targets)

From `tests/COVERAGE.md`, Module 1 is missing:
- **a11y** — keyboard navigation, ARIA labels, focus management
- **visual** — screenshot guards for lesson player states
- **auth** — unauthenticated access patterns for Module 1 lessons

And NOTHING has been written for **Modules 2–12** or **proactive happy-path exploration** of Module 1.

---

## The Five QA Commands

These `.cursor/commands/` files drive the loop. Read them before you start:

| Command | File | Purpose |
|---|---|---|
| `/qa-explore module-N` | `qa-explore.md` | Browse the module in a real browser, write findings |
| `/qa-codify module-N` | `qa-codify.md` | Turn findings into `bug-NNN-*.spec.ts` files |
| `/qa-triage` | `qa-triage.md` | Classify failures as REAL_BUG / FLAKY / ENV / OBSOLETE |
| `/qa-fix bug-N` | `qa-fix.md` | Make the minimal code change to turn one test green |
| `/qa-loop module-N` | `qa-loop.md` | Orchestrate all four steps in order |

**Always run `/qa-loop module-N`** — it handles the order, stop conditions, and orchestrator update automatically.

---

## Running Tests — Command Reference

All commands run from `apps/med/`:

```powershell
# 7-test smoke gate (~30s) — must always be green
npm run test:smoke

# Full 17-bug regression suite (~3-5 min)
npm run test:regression

# Run only one module's tests
npx playwright test --grep @module-1 --project=chromium-desktop

# Run a specific bug
npx playwright test bug-006 --project=chromium-desktop

# Run all projects (desktop + mobile)
npm run test:e2e

# Watch mode for authoring
npm run test:e2e:ui

# After adding new tests, regenerate the coverage matrix
npm run test:coverage
```

---

## Test Account Reference

Each module has a dedicated pre-seeded learner account. These accounts are permanent fixtures — **never delete or modify their `nursed_progress` rows**. They are the only reliable way to explore a module without fighting the sequential lesson gate.

| Account | Password | Prior completions seeded | Use for |
|---|---|---|---|
| `test@test.com` | `password` | None | Smoke tests, regression suite, Module 1 explore |
| `test-m2@test.com` | `password` | M1 (8 lessons) | Module 2 explore + happy-path |
| `test-m3@test.com` | `password` | M1–M2 (16 lessons) | Module 3 explore |
| `test-m4@test.com` | `password` | M1–M3 (24 lessons) | Module 4 explore |
| `test-m5@test.com` | `password` | M1–M4 (32 lessons) | Module 5 explore |
| `test-m6@test.com` | `password` | M1–M5 (40 lessons) | Module 6 explore |
| `test-m7@test.com` | `password` | M1–M6 (48 lessons) | Module 7 explore |
| `test-m8@test.com` | `password` | M1–M7 (56 lessons) | Module 8 explore |
| `test-m9@test.com` | `password` | M1–M8 (64 lessons) | Module 9 explore |
| `test-m10@test.com` | `password` | M1–M9 (72 lessons) | Module 10 explore |
| `test-m11@test.com` | `password` | M1–M10 (80 lessons) | Module 11 explore |
| `test-m12@test.com` | `password` | M1–M11 (88 lessons) | Module 12 explore |

**How to use in a `/qa-explore module-N` run:**

```typescript
// In the spec or explore session, log in as the module-specific account:
await page.goto('/auth/login');
await page.getByLabel(/email/i).fill('test-m3@test.com');
await page.getByLabel(/password/i).fill('password');
await page.getByRole('button', { name: /sign in/i }).click();
```

**If progress gets polluted** (e.g. a seed script runs with `--all-mN`), restore with:

```sql
-- Replace N with the module number, email with the affected account
DELETE FROM nursed_progress
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'test-mN@test.com')
AND lesson_id IN (
  SELECT l.id FROM nursed_lessons l
  JOIN nursed_modules m ON l.module_id = m.id
  WHERE m.order_index = N  -- only delete the target module's rows, keep prior ones
);
```

**Never** run a seed script that touches `test@test.com` for anything other than M1 — it's the clean baseline for all regression tests.

---

## `.env.local` Required Variables

The file lives at `apps/med/.env.local`. Required for all tests to run:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # needed for data-integrity tests
NEXT_PUBLIC_AUTH_DISABLED=false
NEXT_PUBLIC_SITE_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

`SUPABASE_SERVICE_ROLE_KEY` is critical — without it, the data-integrity tests (bugs 12, 13, 14, 16, 17) skip. Pull it from Vercel: `cd apps/med && vercel env pull --environment=preview` then restore the local URLs.

---

## Module 1 — Proactive Exploration Checklist

When running `/qa-explore module-1`, walk through every step type in **Emergency Nursing Communication** (the active A2 course — it has all 12 modules). The A1 course ("Foundations of Nursing English") is set to `published=false` and appears as "Coming Soon".

### For each lesson, verify:

**Navigation**
- [ ] Lesson player loads without console errors
- [ ] Step counter ("Step 2 of 7") shows correctly
- [ ] "Next" button appears/disappears at the right moments
- [ ] Back navigation works between steps
- [ ] Completing the last step marks the lesson complete
- [ ] Re-entering a completed lesson shows correct state (does not wipe progress)

**Language toggle**
- [ ] Switching EN ↔ VI mid-lesson updates labels without losing step state
- [ ] VI mode shows no English-only strings leaking through
- [ ] EN mode shows no Vietnamese diacritics leaking through

**Step type checklist (20 components — test each at least once):**

| Step Type | Component | Key assertions |
|---|---|---|
| `scenario_intro` | `ScenarioIntroStep.tsx` | "I'm Ready" button advances to next step |
| `audio_shadow` | `AudioShadowStep.tsx` | Listen / Read Along / Speak tabs work; switching tab pauses prior audio (already guarded by bug-011) |
| `script_read` | `ScriptReadStep.tsx` | All three modes: Listen, Read Along, Speak Together; each nurse line has a mic button |
| `cloze` | `ClozeStep.tsx` | Blanks accept input; submit with all blanks filled advances; partial submit shows validation |
| `no_script` | `NoScriptStep.tsx` | "Got it" or completion mechanism works |
| `recording_submit` | `RecordingStep.tsx` | Record → VAD (silent = rejected, see bug-015); real audio → shows playback + submit; submit stores to DB |
| `quiz` | `QuizStep.tsx` | Selecting correct answer advances; wrong answer shows feedback; options render EN-only regardless of language toggle |
| `matching` | `MatchingStep.tsx` | Drag or click to match pairs; all pairs matched → advances |
| `drag_order` | `DragOrderStep.tsx` | Items can be reordered; correct order advances |
| `flash_card` | `FlashCardStep.tsx` | "Got it" advances card index (guarded by bug-010); front/back flips; sprint mode if available |
| `quick_response` | `QuickResponseStep.tsx` | Options render; selecting one advances |
| `odd_one_out` | `OddOneOutStep.tsx` | Correct odd-one-out can be selected |
| `sentence_builder` | `SentenceBuilderStep.tsx` | Words can be dragged/tapped into correct order |
| `spot_the_mistake` | `SpotTheMistakeStep.tsx` | Each step has ≥1 mistake to identify (guarded by bug-013) |
| `conversation_animation` | `ConversationAnimationStep.tsx` | Animation plays; advances after completion |
| `mission` | `MissionStep.tsx` | Mission objective displayed; completion mechanic works |
| `self_reflection` | `SelfReflectionStep.tsx` | Free-text entry accepted |
| `video` | `VideoStep.tsx` | Video plays; VI subtitles toggle works |
| `peer_rating` | `PeerRatingWidget.tsx` | Ratings submit to DB |

---

## Coverage Gaps — What to Write Next

### Priority 1 — Module 1 auth tests (`@auth @module-1`)

```
Scenario: Unauthenticated user visits a lesson URL directly
  → /learn/courses/emergency-nursing-communication/lessons/<slug>
  Expected: redirect to /auth/login OR preview mode loads
  NOT expected: blank page, 500 error, or auth-gated content with no fallback
```

Write as `bug-018-unauthenticated-lesson-access.spec.ts` (if it's a bug) or a happy-path spec.

### Priority 2 — Module 1 happy path (`@happy-path @module-1`)

A learner completing a full lesson end-to-end. Mock the API calls for heavy steps (recording, peer review) to keep the test fast. Target `Lesson 1` of `Emergency Nursing Communication`:

```
tests/e2e/module-01-emergency/lesson-1-happy-path.spec.ts
```

### Priority 3 — Module 1 a11y (`@a11y @module-1`)

Focus on the lesson player (most interactive surface):
- Tab order through a `quiz` step: question → options → submit button
- ARIA roles on the `audio_shadow` phase tabs (`role="tab"`)
- Focus trap in the onboarding tour modal
- Contrast: primary button (`#0B5FFF`) against white background

### Priority 4 — Module 2–12 (run `/qa-loop module-2` onwards)

Modules 2–12 follow the same blueprint as Module 1. Run the loop per module. Each module has 8 lessons × ~7 step types. Common issues in M2-M12 to watch for (from Agent Y's learnings):
- Flashcard schema: must use `front_en`/`back_vi` not `front`/`back`
- Multi-word nurse role labels in `script_read` (e.g. "Charge Nurse:") cause both bubbles to render left — verify each module
- `quick_response` options must use `text_en` not `text`
- `recording_submit` steps should not have empty configs

---

## data-testid Reference

All stable selectors currently in the codebase:

| `data-testid` | Location | Used by |
|---|---|---|
| `course-card` | `app/learn/courses/page.tsx:170` | bug-005, bug-007 |
| `logo` | `components/learn/LearnerSidebar.tsx:55` | bug-004 |
| `flashcard-index` | `components/learn/steps/FlashCardStep.tsx:308` | bug-010 |
| `join-code-input` | `app/learn/pairs/page.tsx:575` | bug-008 |
| `profile-completed-count` | `components/learn/ProfilePageClient.tsx` (StatPill with `testId` prop) | bug-016-017-progress-and-profile-cascade |

When you need a new stable selector, add `data-testid="..."` to the component and note it in this table.

---

## Test Authoring Rules (non-negotiable)

From `.cursor/rules/playwright.mdc` — **read the full file before writing any test:**

1. **Selector priority:** `getByRole` > `getByLabel` > `getByTestId` > `getByText`. Never use CSS classes or nth-child as primary selectors.
2. **No `waitForTimeout` > 500ms.** Use `expect(...).toBeVisible({ timeout: N })` for polling.
3. **3-axis tagging mandatory:** every test needs layer + scope + concern (e.g. `TAG.regression, TAG.module1, TAG.state`).
4. **Bug naming:** regression tests must be `bug-NNN-kebab-slug.spec.ts` where NNN continues from the last existing number.
5. **Never `test.skip` or `test.fail`.** `test.fixme` is the only acceptable holding state, and it must have a comment explaining what unblocks it.
6. **Red before green:** a new `test.fixme` spec should fail (red) when its `fixme` annotation is removed — if it passes, the assertion is too lenient.
7. **Mock external calls** (`/api/pairs/membership`, `/api/lessons/...`) when the test needs to bypass upstream state. Use `page.route(...)`.
8. **Parallel-safe:** tests must not share mutable DB state. Use `getTestUserId()` + the `SUPABASE_SERVICE_ROLE_KEY` to seed/clean test-specific data.

---

## Known Flakiness and Workarounds

| Issue | Workaround |
|---|---|
| Full parallel suite (all projects) had intermittent failures under Turbopack dev | **Local default:** `workers: 1`, `fullyParallel` only when `CI` — reduces chunk/hydration flake. Module-1 lesson flow retries on `main h1` (`emergency-m1-l1-flow.ts`). |
| `getTestUserId()` returns null if `SUPABASE_SERVICE_ROLE_KEY` is missing | Ensure `.env.local` has the key. The function uses an RPC `get_auth_user_id_by_email` with a fallback to `auth.admin.listUsers`. |
| Bug-015 (VAD) must use `--use-fake-device-for-media-stream` flag + `AudioContext` mock | Already handled in the spec. Do not remove the `page.addInitScript` that patches `AudioContext` — that's what makes it parallel-safe. |
| Bug-006 (tutorial next button) is `test.fixme` | Root cause: Joyride's Next button timing vs React reconciliation + `JoinGroupGate` blocking. To fix: clear `localStorage.nursed_lesson_tour_seen` before the test, mock `/api/pairs/membership` to return `{inGroup:true}`, then wait for the tour spotlight to be fully mounted before clicking. |
| Dev server takes up to 2 minutes to start cold | `playwright.config.ts` sets `webServer.timeout: 120_000`. On first run, wait for "Ready in" log before tests begin. |

---

## VAD Implementation (RecordingStep.tsx)

Bug #15 introduced real Voice Activity Detection. **Do not change this logic without updating the test.**

- `isSilentBlob(blob: Blob): Promise<boolean>` — decodes the blob via `AudioContext.decodeAudioData`, computes RMS amplitude across `channelData[0]`
- Threshold: `SILENCE_RMS_THRESHOLD = 0.005` (0.5% amplitude)
- On silence: sets state back to `'idle'`, shows `t.errorSilentRecording`
- Translation keys: `errorSilentRecording` + `recordingChecking` (both EN + VI in `lib/i18n/translations.ts`)
- The `RecordState` type includes `'checking'` — the intermediate state while VAD runs

---

## Course / Data State (as of 2026-05-17)

| Course | Level | Published | Active Learners | Notes |
|---|---|---|---|---|
| Foundations of Nursing English | A1 | ❌ No | 0 | Intentionally unpublished; shows as "Coming Soon" |
| Emergency Nursing Communication | A2 | ✅ Yes | 5 | Main active course, 12 modules |
| Ward and Inpatient Communication | A2 | ❌ No | 0 | Sample / future |
| Clinical Handover and Team Communication | B1 | ❌ No | 0 | Future |
| International Patient Communication | B1 | ❌ No | 0 | Future |
| Career English for Nurses | B2 | ❌ No | 0 | Future |

**Test lesson for mocking:** `qa-test-lesson` under `foundations-of-nursing-english` (slug). Step ID `fa98bd09-d562-4175-8ddd-ea635aedb6e1` is a `recording_submit` step with empty config — safe to use in mocked tests.

---

## What "Module 1 Done" Looks Like

Module 1 (`@module-1`) is done when:
- [ ] All 17 bug specs pass (**15 pass + bug-006 fixme** as of 2026-05-17 qa-loop)
- [x] At least one `@auth @module-1` test exists and passes (`bug-018-unauthenticated-lesson-access`)
- [x] At least one `@a11y @module-1` test exists and passes (`bug-019-audio-shadow-phase-tabs-a11y`)
- [x] A `module-01-emergency/lesson-1-happy-path.spec.ts` exists and passes
- [x] `npm run test:coverage` shows no empty cells in the Module 1 row of `tests/COVERAGE.md`
- [x] Full suite (`npm run test:e2e`) runs with 0 failures and ≤2 skipped (only bug-006 fixme)
- [x] Orchestrator handover updated with the session outcome

---

## Guardrails

- **Never touch `src/` (mobile) or `functions/` (Firebase)** — NurseEd lives entirely in `apps/med/`
- **Never commit to `main`** — use `agent-x-integration` + `vercel promote` for production deploys (see Lesson 16 in orchestrator handover)
- **Never disable a test to make a run green** — `test.skip` and `test.fail` are banned; `test.fixme` is the only acceptable hold
- **Never add a new npm package** without confirming with Tarun first
- **Run `npm run build` and `npm run typecheck` before declaring done** — the build must be clean

---

## Supabase RPC Available for Tests

A custom function is deployed in production Supabase:

```sql
-- Looks up auth.users by email, bypassing RLS (SECURITY DEFINER)
SELECT get_auth_user_id_by_email('test@test.com');
```

Used by `_shared/supabase-admin.ts → getTestUserId()`. If you need a new RPC, add it via the Supabase MCP (`user-supabase-tuto`) and document it here.

---

## Definition of Done for This Handover

A fresh QA agent using this document should be able to:

1. Run `npm run test:smoke` → 7 green tests with no setup beyond `.env.local`
2. Run `npm run test:regression` → 24 tests, 1 skipped (bug-006), 0 failed
3. Run `/qa-loop module-1` → find the auth/a11y/happy-path gaps, codify them, fix any real bugs found, leave Module 1 with a full green row in `COVERAGE.md`
4. Continue `/qa-loop module-2` through `/qa-loop module-12` in sequence

The loop is designed to be self-documenting — each `/qa-loop` run updates the orchestrator handover, so the next agent always knows the current state.
