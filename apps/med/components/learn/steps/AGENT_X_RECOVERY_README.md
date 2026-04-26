# Agent X recovery — pending integration

This branch (`agent-x-recovery`) preserves four learner-side step components
that were produced by Agent X during the April 2026 interactive-exercise
sprint but **never committed** before the workspace state was lost.

## What's here

- `OddOneOutStep.tsx`
- `QuickResponseStep.tsx`
- `SentenceBuilderStep.tsx`
- `SpotTheMistakeStep.tsx`

These components import types and i18n keys that **do not yet exist** on
`nursemed`. They will not type-check or build as-is.

## What is missing (must be re-derived before merge to `nursemed`)

Agent X's report claimed the following edits to existing tracked files; none
of them survived:

- `apps/med/lib/supabase.ts` — extend `StepType` union; export 9 config
  interfaces (`QuickResponseConfig`, `QuickResponseOption`,
  `OddOneOutConfig`, `OddOneOutQuestion`, `SentenceBuilderConfig`,
  `SentenceBuilderQuestion`, `SpotTheMistakeConfig`,
  `SpotTheMistakeQuestion`, plus shared option types).
- `apps/med/lib/i18n/translations.ts` — ~80 EN+VI keys consumed by the four
  components (search the `.tsx` files for `t.quickResponse…`,
  `t.oddOneOut…`, `t.sentenceBuilder…`, `t.spotTheMistake…`).
- `apps/med/components/learn/renderLessonStep.tsx` — four new `case` arms
  routing the new step types to these components.
- `apps/med/components/admin/StepEditor.tsx` — four editor switch cases plus
  `QuickResponseEditor`, `OddOneEditor`, `SentenceBuilderEditor`,
  `SpotTheMistakeEditor` (with shared `ScriptRefPanel`).
- `apps/med/components/admin/StepPreviewModal.tsx` — four `typeLabel`
  entries.
- `apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` —
  four entries in `STEP_TYPES`, `TYPE_BADGE`, `TYPE_LABEL`.
- `apps/med/app/globals.css` — `badge-purple` and `badge-amber` utility
  classes.

The DB-side migration that allows the four new `type` values
(`053_nursed_step_types_interactive_v2.sql`) **is** committed on `nursemed`
and is already applied to the live Supabase project.

## How to use this branch

1. Read the components in this folder to inventory exactly which types and
   i18n keys they need.
2. On a fresh branch off `nursemed` (e.g. `agent-x-integration`), add the
   missing types, translations, render-arm routing, admin editors,
   preview-modal labels, lesson-builder entries, and CSS classes.
3. Once the integration code compiles in isolation, cherry-pick the four
   `.tsx` files from this branch:

   ```sh
   git checkout agent-x-recovery -- \
     apps/med/components/learn/steps/OddOneOutStep.tsx \
     apps/med/components/learn/steps/QuickResponseStep.tsx \
     apps/med/components/learn/steps/SentenceBuilderStep.tsx \
     apps/med/components/learn/steps/SpotTheMistakeStep.tsx
   ```

4. Run `npm run build` from `apps/med`. Fix any drift between the
   recovered components and the freshly written types/keys.
5. Open a PR into `nursemed`. Delete this `AGENT_X_RECOVERY_README.md`
   before merging.
6. After merge, this branch (`agent-x-recovery`) can be deleted.

## Why a separate branch?

Committing the four components directly on `nursemed` would break the build
because of the missing imports. Keeping them on a side branch preserves the
work in git history without polluting `nursemed`'s deployable state.

— Orchestrator, 2026-04-26
