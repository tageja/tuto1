# HANDOVER X — New Interactive Step Types: Quick Response + Odd One Out + Sentence Builder + Spot the Mistake

> **Scope expansion (confirmed by Tarun on brainstorm review):** Original scope was 2 new step types (`quick_response`, `odd_one_out`). Tarun additionally approved brainstorm picks **#1 Sentence Builder** and **#4 Spot the Mistake**. Brainstorm pick **#6 Vocab Sprint** went to Agent W as a `mode` flag on `flash_card` (NOT in your scope — do not touch flashcards). You now ship **4 new step types** in this single sprint.

## Agent Role & Identity

You are a **Senior Full-Stack Engineer** with expertise in:

- React 19 + Next.js 16 App Router (`apps/med/`)
- TypeScript, Tailwind CSS via CSS variables
- Supabase Postgres — schema migrations, CHECK constraints, RLS
- `framer-motion` v11 — celebratory and corrective microinteractions
- End-to-end feature delivery: schema → API contract → admin editor → learner UI → preview modal → translations

Your working directory is **`apps/med/`** plus **`supabase/migrations/`**. Do NOT touch `src/` (mobile), `functions/` (Firebase), or `apps/dashboard/`.

You are the second of two agents (W and X) working on the interactive-exercise overhaul. **Agent W ships first** — they polish 5 existing step types and produce a brainstorm doc. You start AFTER Agent W is done. You will reuse Agent W's design language so the new exercises feel like part of the same family, not bolt-ons.

Your job is to add **four brand-new step types** end-to-end: `quick_response`, `odd_one_out`, `sentence_builder`, and `spot_the_mistake`. All four must be authorable from the admin lesson builder and renderable in the learner lesson player and the admin preview modal.

---

## Feature Overview

### Step type 1 — `quick_response`

A short clinical scenario where the patient says something and the learner picks the best nurse response from 3–4 options.

**Reference (screenshot 6 in the spec):**

```
A patient says: "I feel dizzy."
What would you say next?

[ ] Let me know if it gets worse.
[●] Please stay seated. I'll help you.   ★ Best choice
[ ] You should drink more water.

✓ Best choice — you ensure safety and offer help.
```

**Behaviour:**
- Patient prompt at the top in a chat-bubble style (with avatar / icon).
- Single-select list of 3–4 nurse responses.
- One option is flagged as "best". Others may be flagged as "acceptable" or "incorrect".
- Optional EN + VI text per option.
- After the learner selects, reveal the correctness state on each option (best = green star, acceptable = amber, incorrect = grey or red), plus a short explanation banner.
- Learner can change answer until they hit "Confirm" — then it locks.

### Step type 2 — `odd_one_out`

A vocabulary discrimination exercise. The learner sees 4 words/phrases (drawn from the actual lesson vocabulary, never random "banana"). Three belong to one category, one is the odd one. Learner taps the odd one; an explanation reveals why.

**Tarun's example:** `breathe / relax / short of breath / stomachache` → odd one is `stomachache` because the other three are respiratory / calming-related and `stomachache` is digestive.

**Behaviour:**
- Top: short prompt ("Which word doesn't belong?").
- 2×2 grid of word cards (text only — no images required for v1).
- Tap a card → outline highlights.
- "Confirm" button reveals correct/incorrect with the explanation.
- Each step holds **multiple questions** (admin can add more rounds inside one step), played in sequence with a small "{n} of {total}" indicator.
- A short progress strip and final score banner ("3 of 3 correct — Great vocabulary discrimination!").

### Step type 3 — `sentence_builder` (brainstorm pick #1)

Learner sees a target sentence's English translation (or VI prompt) and must drag chunks into the right order to reconstruct the EN sentence. Reuses the polished DragOrder DnD slot/pool pattern Agent W just shipped — same drag handle, same correct/wrong feedback shape — but with a sentence prompt at top and chunks (multi-word phrases, not single words) instead of generic items.

**Tarun's example:** Prompt: `"Tôi cần kiểm tra huyết áp của bạn ngay bây giờ."` → chunks: `[ "I need to" | "check" | "your blood pressure" | "right now" ]` → correct order: `0, 1, 2, 3`.

**Behaviour:**
- Top: prompt card (the VI sentence the learner is translating, plus an optional EN audio play button if `audio_url` is supplied).
- Pool of shuffled chunks below.
- Empty slot row with positional underlines.
- Drag chunks into slots (or tap to send into the next empty slot — mirror DragOrderStep keyboard/tap fallback).
- "Check" button → reveals which slots are correct (green check) vs wrong (amber, NOT red — this is a translation, mistakes are fine), shows the canonical EN sentence below the slots, and offers a `↻ Try again` button alongside `Next`.
- Each step holds **one sentence**, but the editor allows the admin to create batches by adding multiple sentence_builder steps (one per sentence). This keeps the per-step UX focused.

### Step type 4 — `spot_the_mistake` (brainstorm pick #4)

Learner sees a short clinical phrase or sentence with one **deliberately wrong word/phrase** and must tap on the wrong word. On reveal, the correct alternative slides in.

**Tarun's example:** `"Please take this medication twice in a day."` → tap `in a` → reveal: correct phrase is `a day` (or `twice a day`).

**Behaviour:**
- Sentence rendered as tap-able tokens (each word/phrase chunk is a separate clickable span).
- Optional VI translation shown beneath if `useLang() === 'vi'` (helps learners who'd otherwise be stuck on vocabulary).
- Learner taps a token → it highlights with a primary-color underline.
- "Check" button → reveals: if right token, the wrong span flashes amber + animated strike-through, then the correct replacement slides in beside it (small `framer-motion` x-translate). If wrong, the chosen token shakes and the actual wrong token gets a hint outline ("Look closer here").
- Short bilingual explanation banner below ("`twice in a day` → `twice a day` — we don't use 'in' with this expression").
- Each step holds **multiple questions** (1+, played in sequence with progress dots, like Odd One Out).

### Authoring (admin) for all four

Per Tarun's instructions, the admin must be able to create these from `/admin/courses/[courseId]/lessons/[lessonId]`:

- Each step type appears in the "Add step" dropdown.
- A custom editor lets the admin enter the content.
- For `odd_one_out`, `sentence_builder`, and `spot_the_mistake`, the editor pulls the lesson script(s) into a **read-only reference panel** at the top (collapsible) so the admin can pick vocabulary / sentences from the actual lesson content. The admin still types/configures the answer manually — the panel is for inspiration + copy-paste convenience.
- `odd_one_out` and `spot_the_mistake` editors support adding multiple questions per step. `sentence_builder` is one sentence per step (admin adds more steps for more sentences).

---

## Current State — What Already Exists

### Existing scaffolding you will extend

| File | Role | What you do |
|---|---|---|
| `supabase/migrations/043_nursed_step_types_and_schema_fixes.sql` | Defines the `type` CHECK constraint (currently 14 types) | DO NOT edit. You add migration `053_*.sql` that drops + recreates with **18 types** (14 existing + 4 new). |
| `apps/med/lib/supabase.ts` | Exports `StepType` union and `NursedLessonStep` interface | Add `'quick_response' \| 'odd_one_out' \| 'sentence_builder' \| 'spot_the_mistake'` to the `StepType` union. Add helper interfaces for all four configs. |
| `apps/med/components/learn/renderLessonStep.tsx` | Maps `step.type` → component | Add **four** `case` arms for the new types. |
| `apps/med/components/admin/StepEditor.tsx` | Admin editor switch | Add **four** `case` arms in the switch + create `QuickResponseEditor`, `OddOneOutEditor`, `SentenceBuilderEditor`, `SpotTheMistakeEditor` functions in the same file (matches existing convention). |
| `apps/med/components/admin/StepPreviewModal.tsx` | Preview modal that reuses `renderLessonStep` | Add **four** entries to its `typeLabel` map. The render path already works via `renderLessonStep`. |
| `apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` | Lesson builder | Add **four** entries to `STEP_TYPES`, `TYPE_BADGE`, `TYPE_LABEL`. |
| `apps/med/lib/i18n/translations.ts` | EN + VI string bag | Add ~50 new keys (listed below). |

### Files Agent W just polished — read for design language reference

| File | Why |
|---|---|
| `apps/med/components/learn/steps/MatchingStep.tsx` | Reuse the success/error motion patterns. |
| `apps/med/components/learn/steps/DragOrderStep.tsx` | Reuse the per-item check/cross icon pattern + score banner. |
| `apps/med/components/learn/steps/FlashCardStep.tsx` | Reuse the multi-question progression pattern (progress dots, current/total). |
| `apps/med/docs/dev-agent-reviews/W_BRAINSTORM_EXERCISE_IDEAS.md` | Read Agent W's "design language proposal" section. Match it. |

### Existing patterns to copy

- **Multi-question stepper inside one step:** `QuizStep` already loops through multiple questions. Read it.
- **Pull-from-script pattern:** `MatchingEditor` (in `StepEditor.tsx`) and `ClozeEditor` (same file) both use a `siblingSteps` prop and walk through their `config.script` / `config.transcript` fields. Copy the `collectLines` and `pullScriptFromSiblings` helper shapes.
- **API translate endpoint:** `POST /api/translate/phrases` exists already. You will NOT need it for these two step types (admins type the words manually) but reference its calling style if you ever add auto-translate.
- **Step CRUD:** uses `POST /api/steps`, `PATCH /api/steps/:id`, `DELETE /api/steps/:id`, `PUT /api/steps` (reorder). You do NOT need to touch any API route — the existing routes already accept any `type` value the CHECK constraint allows.

---

## Out of Scope — What You Must NOT Do

- ❌ Touch any of the 5 components Agent W polished (`DragOrderStep`, `MatchingStep`, `ClozeStep`, `AudioShadowStep`, `FlashCardStep`). If you need a shared utility, lift it into `components/learn/steps/_shared/` rather than editing those files.
- ❌ Build any other ideas from Agent W's brainstorm doc beyond the four approved types (`quick_response`, `odd_one_out`, `sentence_builder`, `spot_the_mistake`). Brainstorm pick #6 Vocab Sprint is owned by Agent W as a `mode` flag on `flash_card` — do NOT add a `vocab_sprint` step type. If Tarun greenlights more later, that's a future agent.
- ❌ Add new npm packages without Tarun's explicit yes. The toolbox is fixed: `@dnd-kit`, `framer-motion`, `lucide-react`. You do NOT need DnD for either of these step types.
- ❌ Modify any existing API route under `apps/med/app/api/`. Reuse existing endpoints.
- ❌ Modify the Quiz step type, Quiz editor, or QuizStep component. The user explicitly said quiz stays separate.
- ❌ Use `console.log("coming soon")` or any "TODO" placeholders in production code paths.
- ❌ Hardcode any English string in JSX. Every visible string goes through `t.someKey` via `useLang()`.
- ❌ Create README, summary, or changelog files. Only modify the existing orchestrator handover (one row + a possible lessons-learned bullet) when done.

---

## Database Changes — Migration `053_nursed_step_types_interactive_v2.sql`

Create this exact file under `supabase/migrations/053_nursed_step_types_interactive_v2.sql`:

```sql
-- ============================================================
-- NurseEd: Add 4 new interactive step types
-- Migration 053
-- ============================================================
-- Adds quick_response, odd_one_out, sentence_builder,
-- spot_the_mistake step types and extends the
-- nursed_lesson_steps.type CHECK constraint to accept them.
-- No data migration needed — existing rows are unaffected.
-- ============================================================

ALTER TABLE nursed_lesson_steps
  DROP CONSTRAINT IF EXISTS nursed_lesson_steps_type_check;

ALTER TABLE nursed_lesson_steps
  ADD CONSTRAINT nursed_lesson_steps_type_check CHECK (type IN (
    'video',
    'audio_shadow',
    'script_read',
    'cloze',
    'no_script',
    'recording_submit',
    'quiz',
    'mission',
    'scenario_intro',
    'self_reflection',
    'conversation_animation',
    'matching',
    'drag_order',
    'flash_card',
    'quick_response',
    'odd_one_out',
    'sentence_builder',
    'spot_the_mistake'
  ));
```

**You must apply this migration** via the Supabase SQL editor or the project's MCP tool **before** writing any code that inserts these step types (per orchestrator lesson #4 — "Migrations written but not applied cause silent failures"). Verify the constraint accepts the new values by inserting a throwaway test row for each of the four types, then deleting them.

There are **no new tables and no new columns**. All step content lives in `nursed_lesson_steps.config jsonb` per the existing pattern.

---

## `step.config` Contracts (canonical, used by both editor and renderer)

### `quick_response`

```ts
interface QuickResponseConfig {
  prompt_en: string                    // "I feel dizzy."
  prompt_vi: string                    // "Tôi cảm thấy chóng mặt."
  speaker_label_en?: string            // default "Patient"
  speaker_label_vi?: string            // default "Bệnh nhân"
  question_en?: string                 // default "What would you say next?"
  question_vi?: string                 // default "Bạn sẽ nói gì tiếp theo?"
  options: QuickResponseOption[]       // 3–4 options
  feedback_best_en?: string            // default "Best choice — you ensure safety and offer help."
  feedback_best_vi?: string
}

interface QuickResponseOption {
  id: string                           // 'a' | 'b' | 'c' | 'd' (admin-controlled)
  text_en: string
  text_vi: string
  rating: 'best' | 'acceptable' | 'incorrect'
  explanation_en?: string              // shown on the chip when revealed
  explanation_vi?: string
}
```

### `odd_one_out`

```ts
interface OddOneOutConfig {
  questions: OddOneOutQuestion[]       // 1+ rounds within one step
}

interface OddOneOutQuestion {
  id: string                           // crypto.randomUUID()
  prompt_en?: string                   // default "Which word doesn't belong?"
  prompt_vi?: string
  words: OddOneOutWord[]               // exactly 4
  category_explanation_en: string      // "These three are respiratory; stomachache is digestive."
  category_explanation_vi: string
}

interface OddOneOutWord {
  text_en: string                      // e.g. "breathe"
  text_vi?: string                     // optional VI translation
  is_odd: boolean                      // exactly one per question
}
```

### `sentence_builder`

```ts
interface SentenceBuilderConfig {
  prompt_en?: string                   // optional EN context line above the prompt
  prompt_vi: string                    // the VI sentence the learner is translating
  audio_url?: string                   // optional EN audio reference (reuse existing assets/upload)
  chunks: string[]                     // shuffled-display chunks; e.g. ["I need to","check","your blood pressure","right now"]
  correct_order: number[]              // index map into chunks; e.g. [0,1,2,3]
  hint_en?: string                     // optional one-line hint (shown on first wrong attempt)
  hint_vi?: string
}
```

Validation invariants the editor enforces:
- `chunks.length >= 2 && chunks.length <= 8`
- `correct_order.length === chunks.length`
- `correct_order` is a valid permutation of `[0..chunks.length-1]`

### `spot_the_mistake`

```ts
interface SpotTheMistakeConfig {
  questions: SpotTheMistakeQuestion[]  // 1+ rounds within one step
}

interface SpotTheMistakeQuestion {
  id: string                           // crypto.randomUUID()
  sentence_en: string                  // the full sentence WITH the mistake
  sentence_vi?: string                 // optional VI translation shown in VI UI mode
  tokens: SpotTheMistakeToken[]        // tokenised view of sentence_en
  correction_en: string                // what should replace the wrong token's text (e.g. "twice a day")
  correction_vi?: string
  explanation_en: string               // short rule-of-thumb (e.g. "We don't use 'in' with this expression")
  explanation_vi?: string
}

interface SpotTheMistakeToken {
  text: string                         // the displayed text (single word OR multi-word phrase)
  is_wrong: boolean                    // exactly one token per question is the mistake
}
```

Tokenisation is admin-driven: the editor splits the sentence by whitespace by default, but the admin can merge adjacent tokens into multi-word phrases (so `"in a day"` can become a single tappable token). This is critical because the mistake is often a phrase, not a word.

All four contracts must be exported from `apps/med/lib/supabase.ts` so both the editor and the renderer (and the preview modal type label) reference the same source of truth.

---

## API Routes — None to Add

The existing `POST /api/steps`, `PATCH /api/steps/:id`, `DELETE /api/steps/:id`, `PUT /api/steps` routes accept any `type` value that the CHECK constraint allows. After you apply migration 053, they will accept `'quick_response'` and `'odd_one_out'` automatically.

You do NOT need to add any new API endpoint. Submission tracking (if/when needed) goes through the existing `POST /api/submissions` flow — but for v1, both new step types simply call `onComplete()` once the learner has finished. **Confirm with Tarun** whether each completion should also write a row to `nursed_submissions` (consistency with quiz) or skip that for now.

---

## UI Components

### 1. `apps/med/components/learn/steps/QuickResponseStep.tsx` — NEW

**Props:**
```ts
interface Props {
  step: NursedLessonStep
  onComplete: () => void
}
```

**Layout:**
```
┌──────────────────────────────────────────┐
│ 💬 Quick Response                       │
│ A patient says: "I feel dizzy."         │
│ What would you say next?                │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ ○  Let me know if it gets worse.    │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ ●  Please stay seated. I'll help.   │ │
│ └──────────────────────────────────────┘ │
│ ┌──────────────────────────────────────┐ │
│ │ ○  You should drink more water.     │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ [ Confirm ]                              │
└──────────────────────────────────────────┘
```

**States:**
- `'idle'` — no selection, Confirm disabled.
- `'selected'` — option chosen, Confirm enabled, revealable.
- `'revealed'` — Confirm pressed; each option now shows its rating chip (★ Best / ✓ Acceptable / × Try another), the chosen option pulses, the feedback banner appears, "Next" replaces "Confirm".
- `'reduced motion'` — respects `useReducedMotion()`.

**Visual notes:**
- Patient prompt: small chat-bubble look — speech bubble with `bg-primary-light`, rounded with a tail, small avatar circle.
- Option cards match Agent W's polished `MatchingStep` card style (rounded-2xl, soft border, hover lift).
- "Best" reveal: green tint + star icon (`Star` from `lucide-react`) + scale-pulse motion.
- "Acceptable" reveal: amber tint + checkmark.
- "Incorrect" reveal: muted tint + small `X` icon, NOT red error styling unless explicitly wrong.
- Feedback banner: green-tinted card with the `feedback_best_*` text + a smaller line of the chosen option's `explanation_*` if present.
- Next button: only after reveal.

**Defaults / fallbacks:**
- If `step.config.options` is empty, render a friendly empty state ("This step has no responses yet — open the admin editor to add some.")
- If multiple options have `rating: 'best'`, accept all of them as best (rare authoring case).

### 2. `apps/med/components/learn/steps/OddOneOutStep.tsx` — NEW

**Props:** same as QuickResponse.

**Layout (per question):**
```
┌──────────────────────────────────────────┐
│ 🧠  Odd One Out         Question 2 of 3 │
│ Which word doesn't belong?              │
│                                          │
│ ┌────────────┐  ┌────────────┐           │
│ │  breathe   │  │   relax    │           │
│ └────────────┘  └────────────┘           │
│ ┌────────────┐  ┌────────────┐           │
│ │ short of   │  │ stomachache│  ●        │
│ │ breath     │  │            │           │
│ └────────────┘  └────────────┘           │
│                                          │
│ [ Confirm ]                              │
└──────────────────────────────────────────┘
```

**States:**
- Per-question: idle / selected / revealed.
- Per-step: tracks score (`{n correct}/{total}`).
- Final summary screen after the last question with a celebratory banner (or encouraging banner if not all correct), Retry button, Next button — match the pattern used at the end of `FlashCardStep`'s `showSummary`.

**Visual notes:**
- 2×2 grid of square-ish cards (`aspect-square` won't work for long Vietnamese — let height grow but keep min-height consistent).
- Selected card: primary border + small filled radio dot top-right.
- Reveal:
  - The odd one (correct answer) → green tint + check.
  - The chosen wrong card → red tint + X.
  - Other two cards → fade slightly, gain a faint check (they were the "in-category" group).
- Explanation banner appears beneath the grid: full bilingual `category_explanation_en` (and `_vi` if `useLang()` is VI).
- Per-step progress strip at top showing question dots (filled for completed, primary for current).

**Defaults:**
- If a question has fewer or more than 4 words, render the cards in a grid that adapts (3 → 1×3, 5 → 2×3 with one empty slot grayed). Log a console warning in dev. Production lesson content is admin-validated to always be 4.

### 2c. `apps/med/components/learn/steps/SentenceBuilderStep.tsx` — NEW

**Props:** same as the others (`step`, `onComplete`).

**Layout:**
```
┌──────────────────────────────────────────────┐
│ 🧩 Sentence Builder                          │
│                                              │
│ Translate this sentence:                     │
│ ┌──────────────────────────────────────────┐ │
│ │ Tôi cần kiểm tra huyết áp của bạn ngay   │ │
│ │ bây giờ.                            [▶]  │ │ (audio if present)
│ └──────────────────────────────────────────┘ │
│                                              │
│ Slots:                                       │
│ ┌────────┬─────────┬───────────────┬──────┐  │
│ │  ___   │   ___   │      ___      │ ___  │  │
│ └────────┴─────────┴───────────────┴──────┘  │
│                                              │
│ Pool:                                        │
│ [ check ] [ I need to ] [ right now ]        │
│ [ your blood pressure ]                      │
│                                              │
│ [ Check ]                                    │
└──────────────────────────────────────────────┘
```

**Behaviour:**
- Shuffle `chunks` once on mount (use `step.id` as seed via `seedrandom`-style deterministic shuffle so re-mounts after fast-refresh don't reshuffle mid-attempt — or just `useMemo` the shuffle).
- DnD via `@dnd-kit/core` slot/pool pattern — copy directly from the polished `DragOrderStep.tsx` (Agent W's component). Slots are positional; pool is a wrap-flex container.
- Tap-to-place fallback: tapping a pool chunk fills the next empty slot.
- "Check" button enabled when all slots are filled.
- Reveal:
  - Each slot turns green (correct position) or amber (wrong position — NOT red, this is a translation skill).
  - Below the slots, render the canonical EN sentence: chunks in `correct_order`, joined with spaces (with smart spacing — no double space before punctuation chunks like `"."`).
  - Two buttons: `↻ Try again` (resets slots, leaves pool full, clears reveal state) and `Next` (calls `onComplete`).
  - On first wrong attempt, if `hint_en` is set, show it as a one-line yellow toast above the slots (dismissible).
- Reduced motion: skip the slide-in reveal animation, just snap the colours.

**Accessibility:**
- Each slot has `aria-label="Slot {n} of {total}"`.
- Each pool chunk is keyboard-focusable; Enter places it in the next empty slot (mirror DragOrder's keyboard pattern).

### 2d. `apps/med/components/learn/steps/SpotTheMistakeStep.tsx` — NEW

**Props:** same as the others.

**Layout (per question):**
```
┌──────────────────────────────────────────────┐
│ 🔍 Spot the Mistake          Question 1 of 3 │
│                                              │
│ Tap the word or phrase that's wrong:         │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ Please  take  this  medication  twice    │ │
│ │ [ in a ]  day .                          │ │ (each word/phrase is a chip)
│ └──────────────────────────────────────────┘ │
│                                              │
│ (VI mode only:)                              │
│   ↳ Vui lòng uống thuốc này hai lần mỗi ngày │
│                                              │
│ [ Check ]                                    │
└──────────────────────────────────────────────┘
```

**States:**
- Per-question: idle / token-selected / revealed.
- Per-step: tracks score (`{n correct}/{total}`) like Odd One Out.
- Final summary screen with Retry + Next, identical pattern to OddOneOutStep.

**Visual notes:**
- Each token rendered as a `<button>` with `inline-block`, soft rounded corners, padding `px-2 py-1`, hairline border on hover.
- Selected token: primary-coloured underline (NOT a fill — keeps the sentence readable).
- Reveal — correct guess:
  - Wrong token (which the learner correctly identified): amber background + `framer-motion` strike-through animation (`scaleX 0 → 1` on a `<line>`).
  - The `correction_en` text slides in to the right of the wrong token (small x-translate, fades in). Use `useReducedMotion()` to skip the slide.
  - Explanation banner below: amber-tinted card with `explanation_en` (and `_vi` if VI mode).
- Reveal — wrong guess:
  - Chosen token shakes (`framer-motion` `keyframes x: [0, -4, 4, -4, 0]`).
  - Wrong token gets a faint dashed outline + small "look closer" hint chip (use `oddOneOutEditorMarkAsOdd` style adapted as `spotMistakeHintChip`).
  - Allow the learner to try again (keep state in `'idle'`, just show the shake).
- VI translation shown beneath the sentence ONLY when `useLang() === 'vi'`. Reduces the cognitive load of vocabulary-blocking on grammar-focused exercises.

**Defaults:**
- If a question has zero `is_wrong: true` tokens, render an empty-state card ("This question has no mistake configured — open the admin editor to fix.") and disable Check.
- If multiple tokens have `is_wrong: true`, accept any of them as correct (rare authoring case; admin validation prevents this normally).

### 3. Step type display — add badges and labels

In `apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx`:

```ts
const TYPE_BADGE: Record<StepType, string> = {
  // ...existing
  quick_response: 'badge-blue',
  odd_one_out: 'badge-yellow',
  sentence_builder: 'badge-purple',
  spot_the_mistake: 'badge-amber',
}
```

(If the matching badge variant doesn't exist in the existing CSS classes, fall back to the closest existing variant — do NOT invent new badge colour classes without checking.)

In the same file, update `STEP_TYPES` (the dropdown picker):

```ts
const STEP_TYPES: { value: StepType; label: string }[] = [
  // ...existing in current order
  { value: 'quick_response', label: t.stepTypeQuickResponse },
  { value: 'odd_one_out', label: t.stepTypeOddOneOut },
  { value: 'sentence_builder', label: t.stepTypeSentenceBuilder },
  { value: 'spot_the_mistake', label: t.stepTypeSpotTheMistake },
]
```

And `TYPE_LABEL`:

```ts
const TYPE_LABEL: Record<StepType, string> = {
  // ...existing
  quick_response: t.stepTypeQuickResponse,
  odd_one_out: t.stepTypeOddOneOut,
  sentence_builder: t.stepTypeSentenceBuilder,
  spot_the_mistake: t.stepTypeSpotTheMistake,
}
```

Then in `apps/med/components/admin/StepPreviewModal.tsx`, add:

```ts
quick_response: t.stepTypeQuickResponse,
odd_one_out: t.stepTypeOddOneOut,
sentence_builder: t.stepTypeSentenceBuilder,
spot_the_mistake: t.stepTypeSpotTheMistake,
```

to its `typeLabel` map.

### 4. `apps/med/components/learn/renderLessonStep.tsx`

Add to the imports and the switch:

```ts
import QuickResponseStep from './steps/QuickResponseStep'
import OddOneOutStep from './steps/OddOneOutStep'
import SentenceBuilderStep from './steps/SentenceBuilderStep'
import SpotTheMistakeStep from './steps/SpotTheMistakeStep'

// ... in the switch
case 'quick_response':
  return <QuickResponseStep step={step} onComplete={onComplete} />
case 'odd_one_out':
  return <OddOneOutStep step={step} onComplete={onComplete} />
case 'sentence_builder':
  return <SentenceBuilderStep step={step} onComplete={onComplete} />
case 'spot_the_mistake':
  return <SpotTheMistakeStep step={step} onComplete={onComplete} />
```

### 5. Admin editors — `apps/med/components/admin/StepEditor.tsx`

Add the two new cases to the switch and define the editor functions in the same file (the file already follows the one-file-many-editors convention — keep that).

#### 5a. `QuickResponseEditor`

**Form:**

```
[ Speaker label EN ] [ Speaker label VI ]
[ Patient prompt EN ......................................... ]
[ Patient prompt VI ......................................... ]
[ Question EN (default: "What would you say next?") ........ ]
[ Question VI (default: "Bạn sẽ nói gì tiếp theo?") ....... ]

Options:
┌────────────────────────────────────────────────────────────┐
│ Option A                          [ Rating ▾ ]   [ 🗑 ]    │
│ EN: [ ............................................. ]      │
│ VI: [ ............................................. ]      │
│ Why (EN, optional): [ ............................. ]      │
│ Why (VI, optional): [ ............................. ]      │
└────────────────────────────────────────────────────────────┘
[ + Add option ]   ← max 4

[ Best-choice feedback EN ......... ]
[ Best-choice feedback VI ......... ]

[ Cancel ]  [ Save step ]
```

**Behaviour:**
- Default 3 options on first open.
- "Add option" disabled at 4. "Remove" disabled at 2.
- Rating dropdown: `Best | Acceptable | Try another`.
- Validation on Save: at least one option marked `best`, all options have non-empty EN text, prompt EN non-empty.
- Reuse the existing `EditorActions` helper at the bottom.

#### 5b. `OddOneOutEditor`

**Form:**

```
🪞 Lesson script reference  (read-only)
┌────────────────────────────────────────────────────────────┐
│ Pulled from sibling steps:                                  │
│   "Good morning, how can I help you?"                       │
│   "I have shortness of breath and chest pain."              │
│   "Let me check your blood pressure now."                   │
│   ...                                                        │
│                                                              │
│ [ ⚡ Pull script from lesson ]                               │
└────────────────────────────────────────────────────────────┘

Questions:
╔════════════════════════════════════════════════════════════╗
║ Question 1                                       [ 🗑 ]    ║
║                                                            ║
║ Prompt EN (default: "Which word doesn't belong?"):         ║
║ [ ............................................. ]          ║
║ Prompt VI: [ ............................................. ]║
║                                                            ║
║ Words (exactly 4):                                         ║
║   ┌──────────────────────────┐                              ║
║   │ Word 1 EN: [ breathe ]   │ [ Mark as odd ○ ]            ║
║   │ Word 1 VI: [ thở ]       │                               ║
║   └──────────────────────────┘                              ║
║   ┌──────────────────────────┐                              ║
║   │ Word 2 EN: [ relax ]     │ [ Mark as odd ○ ]            ║
║   │ ...                      │                               ║
║   └──────────────────────────┘                              ║
║   ...3 more...                                              ║
║                                                            ║
║ Explanation EN: [ Three are respiratory; stomachache is...] ║
║ Explanation VI: [ Ba từ liên quan đến hô hấp;... ]          ║
╚════════════════════════════════════════════════════════════╝

[ + Add another question ]
[ Cancel ]  [ Save step ]
```

**Behaviour:**

- **Pull script from lesson** button: copy the `collectLines()` pattern from `MatchingEditor` (same file, just above where you'll add `OddOneOutEditor`). Walk `siblingSteps`, pull `config.script` and `config.transcript` strings, extract dialogue lines via the existing `extractEnglishLines` helper. Show as a read-only scrollable code block. Each line should be click-to-copy (use `navigator.clipboard.writeText(line)` and a small toast "Copied — paste into a word slot").
- The reference panel is collapsible (`<details>`/`<summary>` is fine).
- Each question: exactly 4 word slots, one and only one can be marked "odd" (radio-style — selecting one unselects others).
- "Add another question" appends a fresh question with empty fields and a new `crypto.randomUUID()` id.
- Validation on Save:
  - At least 1 question.
  - Each question has exactly 4 non-empty EN words.
  - Each question has exactly one `is_odd: true` word.
  - Each question has a non-empty `category_explanation_en`.
- VI fields are optional (admin can leave empty; renderer falls back to EN).

#### 5c. `SentenceBuilderEditor`

**Form:**

```
🪞 Lesson script reference  (read-only, collapsible)
   [ ⚡ Pull script from lesson ]
   ┌───────────────────────────────────────────────┐
   │ "I need to check your blood pressure now."    │
   │ "Please take this medication twice a day."    │
   │ ...                                           │
   └───────────────────────────────────────────────┘
   (click any line to copy to clipboard)

VI prompt (the sentence the learner is translating FROM):
[ Tôi cần kiểm tra huyết áp của bạn ngay bây giờ.       ]

EN context (optional, shown as a small hint above the prompt):
[ ........................................... ]

EN audio (optional):
[ Upload audio file ]   ← reuses /api/assets/upload

Build the sentence (chunks):
┌─────────────────────────────────────────────────────────┐
│ Mode:  ( ) Auto-split by " | "      (•) Manual chunks   │
│                                                          │
│ Type the EN sentence with " | " separators between      │
│ chunks (e.g. "I need to | check | your blood pressure   │
│ | right now"):                                           │
│ [ I need to | check | your blood pressure | right now ] │
│                                                          │
│ [ Parse chunks ]                                         │
│                                                          │
│ Parsed chunks (drag to reorder = correct order):         │
│   [≡] 1. "I need to"                                     │
│   [≡] 2. "check"                                         │
│   [≡] 3. "your blood pressure"                           │
│   [≡] 4. "right now"                                     │
│                                                          │
│ Preview learner pool (shuffled):                         │
│   [your blood pressure] [I need to] [right now] [check]  │
└─────────────────────────────────────────────────────────┘

Hint EN (optional, shown on first wrong attempt):
[ ........................................... ]
Hint VI: [ ........................................... ]

[ Cancel ]  [ Save step ]
```

**Behaviour:**

- **Pull script from lesson:** identical pattern to `OddOneOutEditor` — call `collectLines()` from sibling steps, render as a click-to-copy reference panel. Admin can copy a sentence into the EN sentence field.
- **Chunk editing:** the admin types one EN sentence with `|` separators. On "Parse chunks", split, trim, drop empties, populate the ordered list. The admin then drags to reorder if needed (use `@dnd-kit/sortable` — already in the toolbox). The displayed order IS the `correct_order` (saved as `[0,1,2,3,...n]` once normalised — re-index after reorder).
- **Preview learner pool:** show a deterministic shuffled view (just for admin sanity-check; the learner shuffle happens at runtime).
- **Audio upload:** reuse the existing `<AudioUploader>` or whatever component `AudioShadowEditor` uses. Same `/api/assets/upload` endpoint.
- Validation on Save:
  - `chunks.length >= 2 && chunks.length <= 8`.
  - `prompt_vi` non-empty.
  - `correct_order` is a valid permutation.

#### 5d. `SpotTheMistakeEditor`

**Form:**

```
🪞 Lesson script reference  (read-only, collapsible)
   [ ⚡ Pull script from lesson ]
   ...

Questions:
╔════════════════════════════════════════════════════════════╗
║ Question 1                                       [ 🗑 ]    ║
║                                                            ║
║ Sentence EN (with the deliberate mistake):                 ║
║ [ Please take this medication twice in a day.          ]   ║
║ [ Tokenise → ]                                              ║
║                                                            ║
║ Tokens (click to mark which one is wrong, ⬌ to merge):    ║
║   [ Please ]  [ take ]  [ this ]  [ medication ]           ║
║   [ twice ]   [ in ]    [ a ]     [ day ]    [ . ]         ║
║                                                            ║
║   Selected as wrong: ⬛ "in"  (click another token to       ║
║   change selection; shift-click adjacent tokens to merge   ║
║   them into a phrase like "in a")                          ║
║                                                            ║
║ Correction EN: [ a day ]   (or [ twice a day ])            ║
║ Correction VI: [ một ngày ]                                ║
║                                                            ║
║ Sentence VI (optional, shown to VI learners):              ║
║ [ Vui lòng uống thuốc này hai lần mỗi ngày.            ]   ║
║                                                            ║
║ Explanation EN: [ We don't use 'in' with this expression. ]║
║ Explanation VI: [ Chúng tôi không dùng 'in' ở đây.       ]║
╚════════════════════════════════════════════════════════════╝

[ + Add another question ]
[ Cancel ]  [ Save step ]
```

**Behaviour:**

- **Tokenise** button: split `sentence_en` on whitespace, populate the tokens list. Each token starts with `is_wrong: false`.
- **Merge tokens:** the admin shift-clicks two adjacent tokens to merge them into one (text becomes `"a b"`). Useful when the mistake is a multi-word phrase like `"in a"`. Provide a small `[ ⤺ Split ]` button next to merged tokens to undo.
- **Mark as wrong:** clicking a token toggles `is_wrong` (radio-style — only one token can be wrong; selecting another deselects the previous).
- **Pull script from lesson:** same pattern — click a script line to copy to clipboard, paste into the sentence field.
- Validation on Save:
  - At least 1 question.
  - Each question has `tokens.length >= 2` and exactly one `is_wrong: true`.
  - Each question has non-empty `correction_en` and `explanation_en`.
- VI fields are optional (renderer falls back to EN).

---

## Translation Keys to Add

Add EN + VI to `apps/med/lib/i18n/translations.ts` (verify naming doesn't clash with existing keys):

```
stepTypeQuickResponse
stepTypeOddOneOut
stepTypeSentenceBuilder
stepTypeSpotTheMistake

quickResponseTitleFallback
quickResponseDefaultSpeakerEn / quickResponseDefaultSpeakerVi    // "Patient" / "Bệnh nhân"
quickResponseDefaultQuestionEn / quickResponseDefaultQuestionVi  // "What would you say next?" / "Bạn sẽ nói gì tiếp theo?"
quickResponseConfirmBtn                                          // "Confirm" / "Xác nhận"
quickResponseRatingBest                                          // "★ Best choice" / "★ Lựa chọn tốt nhất"
quickResponseRatingAcceptable                                    // "✓ Acceptable" / "✓ Có thể chấp nhận"
quickResponseRatingIncorrect                                     // "Try another" / "Thử lại"
quickResponseDefaultBestFeedback                                 // "Best choice — you ensure safety and offer help."

oddOneOutTitleFallback
oddOneOutDefaultPromptEn / oddOneOutDefaultPromptVi              // "Which word doesn't belong?" / "Từ nào không thuộc nhóm?"
oddOneOutQuestionLabel                                           // "Question {n} of {total}"
oddOneOutCorrectBanner                                           // "Correct! {explanation}"
oddOneOutWrongBanner                                             // "Not quite — {explanation}"
oddOneOutScoreBanner                                             // "{correct} of {total} correct"

// Admin editor
quickResponseEditorAddOption                                     // "+ Add option"
quickResponseEditorRatingBest / Acceptable / Incorrect           // dropdown labels
quickResponseEditorBestFeedbackLabel
quickResponseEditorMaxOptionsHint                                // "Max 4 options"

oddOneOutEditorPullScriptBtn                                     // "⚡ Pull script from lesson"
oddOneOutEditorReferencePanelTitle                               // "Lesson script reference"
oddOneOutEditorAddQuestionBtn                                    // "+ Add another question"
oddOneOutEditorMarkAsOdd                                         // "Mark as odd"
oddOneOutEditorWordEnLabel / VI                                  // "Word {n} EN" / "Word {n} VI"
oddOneOutEditorExplanationEnLabel / VI
oddOneOutEditorCopiedToast                                       // "Copied — paste into a word slot"
oddOneOutEditorValidationNeedFour                                // "Each question needs exactly 4 words"
oddOneOutEditorValidationNeedOdd                                 // "Mark exactly one word as odd"
oddOneOutEditorValidationNeedExplanation                         // "Add an explanation for the category"
quickResponseEditorValidationNeedBest                            // "Mark exactly one option as Best"

// Sentence Builder — learner
sentenceBuilderTitleFallback
sentenceBuilderInstructionEn / sentenceBuilderInstructionVi      // "Translate this sentence:" / "Hãy dịch câu này:"
sentenceBuilderCheckBtn                                          // "Check" / "Kiểm tra"
sentenceBuilderTryAgainBtn                                       // "↻ Try again" / "↻ Thử lại"
sentenceBuilderCorrectAnswerLabel                                // "Correct answer:" / "Đáp án đúng:"
sentenceBuilderHintToast                                         // "{hint}" — pass-through for hint_en/_vi

// Sentence Builder — admin
sentenceBuilderEditorPromptViLabel                               // "VI prompt"
sentenceBuilderEditorContextEnLabel                              // "EN context (optional)"
sentenceBuilderEditorChunksLabel                                 // "Build the sentence (chunks)"
sentenceBuilderEditorParseBtn                                    // "Parse chunks"
sentenceBuilderEditorAutoSplitMode                               // "Auto-split by '|'"
sentenceBuilderEditorManualMode                                  // "Manual chunks"
sentenceBuilderEditorPreviewPoolLabel                            // "Preview learner pool (shuffled)"
sentenceBuilderEditorHintEnLabel / sentenceBuilderEditorHintViLabel
sentenceBuilderEditorValidationNeedTwoChunks                     // "Need at least 2 chunks"
sentenceBuilderEditorValidationNeedPromptVi                      // "VI prompt is required"

// Spot the Mistake — learner
spotTheMistakeTitleFallback
spotTheMistakeInstructionEn / spotTheMistakeInstructionVi        // "Tap the word or phrase that's wrong:" / "Hãy bấm vào từ hoặc cụm từ sai:"
spotTheMistakeCheckBtn                                           // "Check"
spotTheMistakeCorrectionLabel                                    // "Correct: {correction}" / "Đúng: {correction}"
spotTheMistakeExplanationLabel                                   // "{explanation}" — pass-through
spotTheMistakeLookCloserHint                                     // "Look closer here" / "Hãy nhìn kỹ hơn"
spotTheMistakeQuestionLabel                                      // "Question {n} of {total}"
spotTheMistakeScoreBanner                                        // "{correct} of {total} correct"

// Spot the Mistake — admin
spotTheMistakeEditorSentenceEnLabel                              // "Sentence EN (with the deliberate mistake)"
spotTheMistakeEditorTokeniseBtn                                  // "Tokenise →"
spotTheMistakeEditorTokensLabel                                  // "Tokens (click to mark wrong, shift-click to merge)"
spotTheMistakeEditorMergeHint                                    // "Shift-click an adjacent token to merge into a phrase"
spotTheMistakeEditorSplitBtn                                     // "⤺ Split"
spotTheMistakeEditorCorrectionEnLabel / spotTheMistakeEditorCorrectionViLabel
spotTheMistakeEditorSentenceViLabel
spotTheMistakeEditorExplanationEnLabel / spotTheMistakeEditorExplanationViLabel
spotTheMistakeEditorAddQuestionBtn                               // "+ Add another question"
spotTheMistakeEditorValidationNeedWrong                          // "Mark exactly one token as wrong"
spotTheMistakeEditorValidationNeedCorrection                     // "Add the correction"
spotTheMistakeEditorValidationNeedExplanation                    // "Add an explanation"
```

Use the same camelCase + domain-prefix convention as the rest of the file. Vietnamese translations should sound natural and clinical — if unsure, leave a `// REVIEW VI` comment for Tarun.

---

## Wiring & Integration

The order of operations matters. Do these in sequence:

1. **Apply migration 053** via Supabase SQL editor or MCP. Verify with:
   ```sql
   SELECT conname, pg_get_constraintdef(oid)
   FROM pg_constraint
   WHERE conname = 'nursed_lesson_steps_type_check';
   ```
   Confirm `quick_response`, `odd_one_out`, `sentence_builder`, `spot_the_mistake` are all in the list.
2. **Update types** in `apps/med/lib/supabase.ts`:
   - Extend `StepType` union with all 4 new values.
   - Export `QuickResponseConfig`, `QuickResponseOption`, `OddOneOutConfig`, `OddOneOutQuestion`, `OddOneOutWord`, `SentenceBuilderConfig`, `SpotTheMistakeConfig`, `SpotTheMistakeQuestion`, `SpotTheMistakeToken` interfaces.
3. **Add translations** to `apps/med/lib/i18n/translations.ts` — both EN and VI for all ~50 new keys.
4. **Build the four learner components** (`QuickResponseStep.tsx`, `OddOneOutStep.tsx`, `SentenceBuilderStep.tsx`, `SpotTheMistakeStep.tsx`).
5. **Wire renderer** (`renderLessonStep.tsx`) — 4 new case arms — and **preview modal** label map (4 new entries).
6. **Build the four admin editors** (in `StepEditor.tsx`).
7. **Wire the lesson builder** (`page.tsx`): 4 entries each in `STEP_TYPES`, `TYPE_BADGE`, `TYPE_LABEL`.
8. **Manually create** one of each step type in a test lesson and walk the full flow: admin → save → preview modal → learner page → completion → next step.
9. **Run** `npx tsc --noEmit` and `npm run build` from `apps/med/`. Both must be clean.

---

## Testing Checklist

Manually verify on `http://localhost:3001` with `test@test.com / password`:

**Migration:**
- [ ] Migration 053 applied; `nursed_lesson_steps_type_check` lists **18** types (14 existing + 4 new).
- [ ] Insert a fake row with each of `type='quick_response' | 'odd_one_out' | 'sentence_builder' | 'spot_the_mistake'` succeeds. `type='garbage'` is rejected.

**Admin → Quick Response:**
- [ ] In `/admin/courses/[courseId]/lessons/[lessonId]`, click "Add step" — see "Quick Response" in the dropdown.
- [ ] Add it. Editor appears with 3 default options.
- [ ] Fill in patient prompt, mark option B as Best, save. No console errors.
- [ ] Click the eye icon → preview modal renders the step. Pick an option, hit Confirm, see the reveal animation and feedback banner.
- [ ] Add a 4th option, then try to remove it. Try to remove down to 1 — disabled at 2.
- [ ] Save without a Best option → validation message blocks save.

**Admin → Odd One Out:**
- [ ] Add an "Odd One Out" step inside a lesson that already has a `script_read` or `audio_shadow` step.
- [ ] Open the editor → see the script reference panel populated.
- [ ] Click "Pull script from lesson" → reference panel content appears (or stays present if already shown).
- [ ] Click a script line → toast appears + clipboard contains the line.
- [ ] Type 4 words into question 1, mark word 4 as odd, fill explanation, save.
- [ ] Add a second question, fill it, save.
- [ ] Preview modal: 2-question flow plays through with summary at the end.
- [ ] Try saving with 3 words → blocked. With 0 marked-as-odd → blocked. With no explanation → blocked.

**Admin → Sentence Builder:**
- [ ] Add a "Sentence Builder" step. Open editor.
- [ ] Pull script from sibling lesson, click a script line → it copies to clipboard, paste into the EN chunks field.
- [ ] Type `I need to | check | your blood pressure | right now` → click "Parse chunks" → see 4 ordered items.
- [ ] Drag to reorder; saved correct order reflects the new arrangement.
- [ ] Save → preview modal renders the chunks in shuffled order with empty slots above.
- [ ] DnD a chunk into a slot, then drag it out → slot returns to empty state.
- [ ] Fill all slots correctly → Check → all green.
- [ ] Fill all slots incorrectly → Check → amber, canonical EN sentence shown below, Try again resets cleanly.
- [ ] Save with 1 chunk only → blocked.

**Admin → Spot the Mistake:**
- [ ] Add a "Spot the Mistake" step. Open editor.
- [ ] Type `Please take this medication twice in a day.` → Tokenise → see 9 tokens.
- [ ] Shift-click `in` then `a` → they merge into `in a`.
- [ ] Click `in a` to mark as wrong; click `medication` → `medication` becomes wrong, `in a` clears.
- [ ] Mark `in a` as wrong, fill correction `a day` and explanation, save.
- [ ] Add a 2nd question, save.
- [ ] Preview modal: 2-question flow, tap correct token → reveal animation, explanation, Next progresses.
- [ ] Tap wrong token → shake animation, hint chip on actual wrong token, can re-attempt.
- [ ] Save with 0 wrong-marked tokens → blocked. With no correction → blocked.

**Learner flow:**
- [ ] In a real lesson, all four step types render correctly inside `LessonPlayer`.
- [ ] `onComplete` fires correctly — the lesson advances to the next step.
- [ ] Lesson completion still credits the "Lesson Complete" star reward (do not break the existing `nursed_user_rewards` flow).
- [ ] Bilingual: switch UI to Vietnamese — every visible string for all four new step types renders in VI.

**Edge cases:**
- [ ] Quick Response with all options marked "incorrect" except one "best" — works.
- [ ] Quick Response where the learner picks an "incorrect" option then changes to the "best" before confirming — last selection wins, reveal is consistent.
- [ ] Odd One Out with 1 question (minimum) — summary screen appears immediately after the one question.
- [ ] Odd One Out with 5 questions — progress dots wrap or scale gracefully.
- [ ] Odd One Out where admin enters 4 words but no VI — learner with VI UI sees EN words (no crash).
- [ ] Sentence Builder with 8 chunks — pool wraps to multiple rows on 360px viewport without overflow.
- [ ] Sentence Builder with `audio_url` set — speaker button plays; without it — no button rendered.
- [ ] Spot the Mistake with a multi-word merged token (`in a`) — tap target hits the whole phrase, not individual words.
- [ ] Spot the Mistake question with `sentence_vi` set — VI UI shows the translation underneath; EN UI does not.
- [ ] Switch user to `super_admin` and confirm the new step types render in their lesson player too (super-admin bypass for sequential locking is in `lesson page`, `CourseOverviewClient.tsx`, `ModuleDetailClient.tsx` — should already work; just verify nothing crashes).

**Build:**
- [ ] `npx tsc --noEmit` — zero errors.
- [ ] `npm run build` from `apps/med/` — clean.
- [ ] No new lint warnings.

---

## Guardrails (Read Twice)

- **Wait for Agent W to finish** before starting your visual work. Read W's brainstorm doc + the polished components + the optional `lessons-learned` note W appends to the orchestrator handover. Match their design language exactly — chip styles, success motion, score banners.
- **Apply the migration FIRST.** Per orchestrator lesson #4, code that runs against an unapplied schema causes silent failures. Verify the constraint is updated before writing component code.
- **Reuse before you build.** Multi-question stepper logic is in `QuizStep.tsx` and `FlashCardStep.tsx` — borrow shape, don't reinvent.
- **No new packages.** `framer-motion`, `lucide-react`, `@dnd-kit` (DnD not needed for these two but available) cover everything.
- **i18n discipline.** Every visible string through `useLang()`. EN + VI for every new key.
- **Do not touch Quiz.** Tarun explicitly carved Quiz out of this scope.
- **Do not touch any of W's polished components.** If you need shared utilities, lift them to `apps/med/components/learn/steps/_shared/` rather than editing W's files.
- **Mobile first.** Test 360×640 before declaring done. Both new exercises must be usable one-handed on a phone.
- **Reduced motion.** Use `useReducedMotion()` from `framer-motion`.
- **No "TODO" placeholders, no `console.log` in production.**
- **Use the test account** `test@test.com / password`.

---

## Definition of Done

You are done when:

1. Migration `053_nursed_step_types_interactive_v2.sql` is committed AND applied AND verified in the live DB.
2. `StepType` union, all 9 config interfaces (across 4 types), all translation keys, the renderer switch, the preview modal label map, the admin step picker, and the four admin editors are all in place.
3. All four new components render correctly in: learner lesson page, admin preview modal, on mobile (360px), in EN and VI.
4. All testing checklist items pass.
5. `npm run build` and `npx tsc --noEmit` both pass clean.
6. Append one row to the agents-built table in `HANDOVER_ORCHESTRATOR_AGENT.md` marking Agent X as ✅ Done with a one-line description of what was shipped (4 step types + the migration number used). Do NOT create a separate completion document.

That's it. Schema first, types second, learner UI third, admin editor last, validate end-to-end before declaring done.
