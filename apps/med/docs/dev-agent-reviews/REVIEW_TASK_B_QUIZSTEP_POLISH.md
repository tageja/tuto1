# Dev Agent Review — Task B: QuizStep Polish & Quiz Editor IDs

## Your role

You are a **Senior Frontend Engineer** specializing in **React**, **TypeScript**, **Framer Motion**, and **accessible, performant** learning UIs.

**Skills you must apply:**

- **TypeScript** — component props, narrowing unions, aligning admin `QuizQuestion` shape with learner `NursedQuizQuestion`
- **React 18+** — `useMemo`, keys, avoiding unnecessary re-renders
- **Framer Motion** — `motion` / `AnimatePresence`, stagger variants, spring tuning, reduced-motion considerations
- **CSS / Tailwind** — layout, focus states, contrast for correct/incorrect feedback
- **UX for assessments** — clarity of feedback, retry flow, screen readers (basic `aria` where missing)

---

## Project context

**NurseEd** (`apps/med`) delivers interactive lesson steps in a **LessonPlayer**. The **Quiz** step shows bilingual MCQs, check answers, score banner, retry/skip. Admins author quiz content in **StepEditor** → **QuizEditor** and save `config.questions` via `PATCH /api/steps/:id`.

---

## Feature B — What this is

**Task B** delivers:

1. **Stable question IDs** in the admin **QuizEditor** (`crypto.randomUUID()` + normalization for loaded config) so React state and keys in **QuizStep** are reliable.
2. **Visual polish** in **QuizStep**:
   - Staggered entrance for options (`framer-motion` variants).
   - Pulse on correct option, shake on wrong selected after check.
   - Fold-style reveal for explanation text (`scaleY` + `AnimatePresence`).

**Primary files:**

- [`apps/med/components/learn/steps/QuizStep.tsx`](../../components/learn/steps/QuizStep.tsx)
- [`apps/med/components/admin/StepEditor.tsx`](../../components/admin/StepEditor.tsx) — `QuizEditor`, `QuizQuestion` type, `normalizeQuizQuestions`

---

## Why this was implemented

The product roadmap (“Option 3: Hybrid”) called for **Framer Motion** polish on quizzes to match the quality of newer steps (matching, flash cards). Separately, **missing `id` on questions** from the editor caused fragile keys and selection state in the learner **QuizStep**.

---

## What the product owner wants

- Quizzes that feel **modern and clear**, not flat HTML forms.
- **No broken keys** or duplicate behavior when editing/saving questions in admin.
- **Bilingual content** remains first-class (`prompt_vi` / `prompt_en`, explanations).
- Optional: admins can add **explanation** fields per question in the editor if not fully exposed (verify against `NursedQuizQuestion`).

---

## Rules you must follow

- **[`.cursor/rules/fundamental-project-rules.mdc`](../../../../.cursor/rules/fundamental-project-rules.mdc)** — reuse components, keep files maintainable, no unnecessary new dependencies.
- **i18n** — user-facing strings belong in [`apps/med/lib/i18n/translations.ts`](../../lib/i18n/translations.ts); fix any hardcoded strings you add.
- **Accessibility** — respect `prefers-reduced-motion` if you change animation intensity.

---

## Review checklist (execute thoroughly)

1. **Animation** — Stagger re-runs appropriately; no layout thrash; mobile tap targets remain ≥44px where applicable.
2. **Explanation panel** — Works when only `explanation_en` is set; typography readable.
3. **Editor ↔ learner contract** — Saved JSON matches what `QuizStep` expects (`answer` as string id, four options).
4. **Performance** — Avoid animating large lists unnecessarily.
5. **Regression** — Default/example questions in `QuizStep` still work when `config.questions` is empty.

**Deliverable:** Rating (1–5) on UX + engineering quality, concrete improvements (motion, a11y, types), and patches if you implement them.
