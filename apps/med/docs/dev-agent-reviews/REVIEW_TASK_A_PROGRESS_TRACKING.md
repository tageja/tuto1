# Dev Agent Review — Task A: Progress & Submission Tracking

## Your role

You are a **Senior Software Engineer** reviewing and hardening learner progress persistence for the NurseEd web app.

**Skills you must apply:**

- **TypeScript** (strict typing, API contracts, error handling)
- **Next.js App Router** (client components, route handlers, `fetch` patterns)
- **React** (hooks: `useAuth`, `useEffect`, state coordination across lesson flow)
- **Supabase / Postgres** (`nursed_progress`, `nursed_submissions`, RLS awareness, upsert semantics)
- **REST API design** (`POST /api/progress`, `POST /api/submissions` — validate payloads, status codes)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js–based medical English learning product for Vietnamese nurses. It uses **Supabase** (Auth + Postgres) for data. Learners complete lessons built from **steps** (quiz, matching, cloze, etc.). Admin authors content in the lesson builder.

The monorepo also contains mobile (`src/`), dashboard (`apps/dashboard/`), and Firebase Functions; **this task is scoped to `apps/med` only** unless a cross-cutting security issue is found.

---

## Feature A — What this is

**Task A** wires **real persistence** so that:

1. **Each step completion** updates `nursed_progress` (current step index, completion %, `last_active`, and `completed` when the last step is finished).
2. **Quiz “Check answers”** saves a row to `nursed_submissions` with `type: 'quiz'` and `quiz_score` (percentage).

**Primary files:**

- [`apps/med/components/learn/LessonPlayer.tsx`](../../components/learn/LessonPlayer.tsx) — `POST /api/progress` in `handleStepComplete` when `user` exists; resets local state when `lesson.id` changes.
- [`apps/med/components/learn/steps/QuizStep.tsx`](../../components/learn/steps/QuizStep.tsx) — `POST /api/submissions` after scoring on check.
- [`apps/med/app/api/progress/route.ts`](../../app/api/progress/route.ts) — existing handler.
- [`apps/med/app/api/submissions/route.ts`](../../app/api/submissions/route.ts) — existing handler.
- [`apps/med/lib/db/progress.ts`](../../lib/db/progress.ts) — `getProgress`, `upsertProgress`, `saveSubmission`.

---

## Why this was implemented

Previously, the lesson player only updated **local React state**. **No rows** were written to `nursed_progress` or `nursed_submissions`, so hospital analytics, streaks, and per-learner history were **empty**. This closes the “last mile” between the UI and the database.

---

## What the product owner wants

- **Accurate per-learner, per-lesson progress** for dashboards and future features (resume lesson, recommendations).
- **Quiz attempts recorded** with a numeric score for reporting and hospital KPIs.
- **Graceful behavior without auth** (e.g. `NEXT_PUBLIC_AUTH_DISABLED=true` for QA): no crashes; silent no-op when there is no `user` is acceptable for local testing.
- **Production-ready** behavior when auth is on: no duplicate corrupt rows, sensible idempotency where applicable, and clear failure modes (logging optional but no silent data loss without justification).

---

## Rules you must follow

- Read and follow **[`.cursor/rules/rules.fullstack.mdc`](../../../../.cursor/rules/rules.fullstack.mdc)** and **[`.cursor/rules/fundamental-project-rules.mdc`](../../../../.cursor/rules/fundamental-project-rules.mdc)** where they apply (scope: this web app; do not refactor unrelated packages).
- **Minimal, focused changes** — fix issues you find in Task A’s surface area; avoid drive-by refactors.
- **Do not commit secrets**; service role keys stay server-only.
- Prefer **existing patterns** in `lib/db/*.ts` and API routes.

---

## Review checklist (execute thoroughly)

1. **Correctness** — After each step, does `current_step_index` match the step the learner is *about to see* (or just finished)? Align naming with product expectations and document if ambiguous.
2. **Idempotency / duplicates** — Multiple `POST /api/submissions` on quiz retry: acceptable or should you upsert or soft-delete old attempts?
3. **RLS & security** — Can clients spoof `userId` in body? If yes, recommend server-side session user id from cookies instead of trusting body (Supabase SSR).
4. **Performance** — Fire-and-forget `fetch` is fine for MVP; consider `await` + error toast for production UX.
5. **Types** — `NursedProgress` / `NursedSubmission` fields align with DB columns.
6. **Edge cases** — Single-step lesson, zero steps (already handled), mid-lesson navigation away.

**Deliverable:** Short written assessment (what’s solid, what to change, priority), with code references or small PR-sized patches if you implement fixes.
