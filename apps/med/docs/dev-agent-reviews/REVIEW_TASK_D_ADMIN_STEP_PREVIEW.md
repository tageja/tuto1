# Dev Agent Review — Task D: Admin Step Preview Modal

## Your role

You are a **Senior React / TypeScript Engineer** with experience in **modal UX**, **z-index / stacking**, **scroll locking**, and **component composition** (reusing learner steps inside admin tools).

**Skills you must apply:**

- **TypeScript** — strict props (`NursedLessonStep | null`), exhaustiveness in `switch` on `StepType`
- **React** — `useEffect` cleanup (body overflow), conditional portals if needed later
- **Next.js** — client components (`'use client'`), dynamic imports only if bundle size requires
- **Accessibility** — focus trap, `aria-modal`, Esc to close (if missing), focus restore on close
- **Design systems** — Tailwind classes consistent with `btn-*`, `card`, existing admin lesson page

---

## Project context

**NurseEd** admins author lessons at  
[`apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx`](../../app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx).  
They add steps (quiz, matching, etc.), edit `config`, and need to **see the learner experience** without leaving the admin area.

---

## Feature D — What this is

**Task D** adds:

1. **[`StepPreviewModal.tsx`](../../components/admin/StepPreviewModal.tsx)** — Full-screen overlay; phone-width (`max-w-[420px]`) content; renders the **same step components** as [`LessonPlayer`](../../components/learn/LessonPlayer.tsx) with `onComplete` mapped to a **preview completion banner** (not lesson navigation).
2. **Lesson builder** — Eye button per step row opens the modal; `title` uses `btnPreviewStep` translation.

**Imports:** All step components under `components/learn/steps/*` mirrored from `LessonPlayer`’s `renderStep` switch.

---

## Why this was implemented

Content authors need **WYSIWYG confidence**: interactive steps (matching, drag-order, flash cards, quiz animations) behave differently than static forms. Preview reduces publish errors and speeds iteration.

---

## What the product owner wants

- **One-click preview** for **any** step type supported in the lesson builder.
- **Close to learner UI** — same components, not a separate mock.
- **Safe preview** — completing a step does not advance a real lesson or write progress (preview uses a no-op that only shows inline confirmation).
- **Polish** — readable on desktop; optional future: device frame, dark mode.

---

## Rules you must follow

- **DRY** — If `LessonPlayer` and `StepPreviewModal` diverge, extract a shared `renderLessonStep(step, handlers)` helper in a small module (only if you can do it without huge refactors).
- **Do not duplicate business logic** for step types; reuse components.
- Follow **[`.cursor/rules/fundamental-project-rules.mdc`](../../../../.cursor/rules/fundamental-project-rules.mdc)** for file size and naming.

---

## Review checklist (execute thoroughly)

1. **Parity** — Every `StepType` in the admin add-step list has a working preview branch; default/unsupported message matches product.
2. **Side effects** — Preview does not call `/api/progress` or `/api/submissions` unless step components do so internally on mount (flag or mock if needed).
3. **Modal UX** — Scroll lock released on unmount; close on backdrop click if desired; keyboard Esc.
4. **Bundle** — Importing all steps in one modal is acceptable for admin; consider `dynamic()` if bundle regression.
5. **Recording / mic steps** — `RecordingStep` in preview: acceptable UX or needs disclaimer?

**Deliverable:** UX rating, a11y gaps, and targeted code changes (focus trap, shared renderer, lazy loading) as appropriate.
