# Dev Agent Review — Task C: End-of-Lesson Feedback Survey & API

## Your role

You are a **Senior Full-Stack Engineer** with **Postgres schema design**, **Supabase RLS**, **Next.js Route Handlers**, and **privacy-aware analytics** experience.

**Skills you must apply:**

- **SQL** — `CREATE TABLE`, `CHECK` constraints, unique constraints, indexes, migration hygiene
- **Supabase** — RLS policies, `auth.uid()`, service role vs anon, upsert conflict targets
- **TypeScript** — API request/response types, validation (manual or Zod)
- **React** — multi-step form state, optional auth (`useAuth`)
- **Product analytics** — what to store, PII minimization, deduplication per user/lesson

---

## Project context

**NurseEd** (`apps/med`) targets **Vietnamese nurses** learning medical English. After completing all steps in a lesson, learners see a **short feedback survey** (5 questions, scale 1–5) before the celebration screen. Copy is **Vietnamese-first** in `translations` (English mirrors for admins).

---

## Feature C — What this is

**Task C** adds:

1. **DB migration** — [`supabase/migrations/044_nursed_lesson_feedback.sql`](../../../../supabase/migrations/044_nursed_lesson_feedback.sql) — table `nursed_lesson_feedback` with `q1_animation` … `q5_continue`, `UNIQUE(user_id, lesson_id)`, RLS.
2. **Server** — [`saveLessonFeedback`](../../lib/db/progress.ts) in `lib/db/progress.ts`; [`POST /api/lesson-feedback`](../../app/api/lesson-feedback/route.ts).
3. **UI** — [`LessonFeedbackScreen.tsx`](../../components/learn/LessonFeedbackScreen.tsx) — one question per screen, 1–5 buttons, Submit / Skip all; persists only when `user` is non-null.
4. **Flow** — [`LessonPlayer.tsx`](../../components/learn/LessonPlayer.tsx) — order: last step complete → feedback → completion / XP UI.

**Survey themes (Vietnamese copy in `translations`):** animation/audio helpful, exercise variety, usefulness for real work, confidence speaking with patients, intent to continue today.

---

## Why this was implemented

The product owner wanted **lightweight MVP feedback** to improve content and UX without a heavy LMS. End-of-lesson placement avoids interrupting every exercise and matches **reflection after full context**.

---

## What the product owner wants

- **Actionable aggregates** per lesson/course (averages, trends) for future admin dashboards.
- **Honest responses** — simple scale, skippable (`Skip all` still reaches completion).
- **Works for logged-in learners**; QA without login should **not break** (skip save or skip survey behavior — verify current behavior matches policy).
- **One row per user per lesson** (upsert) to avoid survey spam on refresh.

---

## Rules you must follow

- **Migrations** live under [`supabase/migrations/`](../../../../supabase/migrations/); do not apply destructive changes without rollback notes.
- **RLS** — align with how other `nursed_*` tables are secured; service policy exists for API routes using service client.
- **No new markdown files** unless the product owner asks (this file was explicitly requested).

---

## Review checklist (execute thoroughly)

1. **Migration** — Applied on staging/prod? Naming, indexes, policy uniqueness across the project.
2. **Upsert** — `onConflict: 'user_id,lesson_id'` matches DB constraint; partial answers handling if you allow incremental save later.
3. **API validation** — Reject out-of-range 1–5; reject missing `userId`/`lessonId`; consider **not** trusting `userId` from body (use session).
4. **UX** — All five questions required before Submit; Skip all behavior; loading/error states.
5. **i18n** — Keys `feedbackQ1`–`feedbackQ5`, `feedbackScale1`–`feedbackScale5` complete in EN + VI.

**Deliverable:** Security review note, schema/API tweaks if needed, and optional admin query examples for aggregating feedback.
