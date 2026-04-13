# NurseEd Agent Handover — nursemed1.3
**Date:** April 13 2026  
**Branch:** `nursemed1.3` (based on `nursemed1.2`)  
**Repo:** `github.com/tageja/tuto1` (monorepo — nursemed lives in `apps/med/`)  
**App:** `med.tuto.asia`  
**Status:** COMPLETE — Interactive exercise scaffold + full Phase 2 implementation shipped

---

## What This Agent Did (and Why)

### Context: The Problem with the Old Exercises

Before this work, the app had two exercise types:

- **ClozeStep** — text inputs inside a paragraph. Users typed answers into `<input>` boxes. Functional but not interactive or mobile-friendly.
- **QuizStep** — multiple choice. Users tapped a radio-style button. Fine for comprehension, but no engagement mechanic.

The owner wanted richer, more interactive exercises for Vietnamese nurses learning medical English — something closer to Duolingo-style interactions: dragging, matching, flipping cards.

### The Decision: Option 3 — Hybrid/Framer Native (Why Not H5P or Full dnd-kit Custom)

Three options were evaluated:

| Option | Approach | Rejected Because |
|---|---|---|
| 1 | Full custom React with @dnd-kit from scratch | Same result as Option 3 but slower to ship |
| 2 | H5P standalone (iframe embed) | Iframe breaks EN/VI language context toggle; can't apply Tailwind design system; score data hard to pipe to Supabase |
| 3 (chosen) | Enhance existing components + `@dnd-kit` where needed + `framer-motion` (already installed) | Best fit — zero iframe, full design system control, mobile-first, integrates with LanguageContext and future progress tracking |

The key insight: `framer-motion` was **already installed** in `apps/med/package.json`. `@dnd-kit` was the only new dependency needed. Everything else was additive on top of the existing step architecture.

---

## What Was Built — Full Detail

### Phase 1 (Scaffold) — Branch Base

**Goal:** Wire up the type system and admin tooling so new step types could be created and stored, before any exercise logic was written.

#### Files Modified

**`apps/med/lib/supabase.ts`**  
Added 3 new values to the `StepType` union:
```typescript
| 'matching'    // tap-to-match pairs
| 'drag_order'  // drag to sort dialogue lines  
| 'flash_card'  // flip card EN → VI
```
Also exported two config type helpers:
```typescript
export type MatchingPair = { en: string; vi: string }
export type FlashCard = { front_en: string; back_vi: string; audio_url?: string }
```

**`apps/med/package.json`**  
Added:
```json
"@dnd-kit/core": "^6.3.1",
"@dnd-kit/sortable": "^8.0.0"
```
`framer-motion ^11` was already present — no change needed.

**`apps/med/components/learn/LessonPlayer.tsx`**  
- Imported `MatchingStep`, `DragOrderStep`, `FlashCardStep`
- Added 3 `case` entries to the `renderStep()` switch
- Added labels in `STEP_TYPE_LABELS`

**`apps/med/components/admin/StepEditor.tsx`**  
Added 3 admin editor sub-components:
- `MatchingEditor` — pipe-delimited textarea: `English phrase | Vietnamese meaning` (one per line)
- `DragOrderEditor` — one dialogue line per row in correct order
- `FlashCardEditor` — pipe-delimited textarea: `English front | Vietnamese back`

**`apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx`**  
Added the 3 new types to:
- `TYPE_BADGE` record (badge colour per type)
- `TYPE_LABEL` record (display name in admin)
- `STEP_TYPES` dropdown array (so admin can create new steps of these types)

**`apps/med/lib/i18n/translations.ts`**  
Added all EN + VI keys for new step titles, subtitles, editor hints, coming-soon banners, and shared navigation buttons (`btnNext`, `btnPrev`, `btnFinish`, `btnSkipExercise`).

**New stub files created:**  
- `apps/med/components/learn/steps/MatchingStep.tsx`
- `apps/med/components/learn/steps/DragOrderStep.tsx`
- `apps/med/components/learn/steps/FlashCardStep.tsx`

Stubs showed the config data in a static list + a "Skip exercise" button wired to `onComplete`, so learner flow was never blocked while exercises were being built.

---

### Phase 2 (Full Implementation) — Same Branch

**Goal:** Replace all stubs with fully interactive exercises. Five files modified.

#### 1. `MatchingStep.tsx` — Tap-to-Match

**How it works:**
- On mount, both columns (EN left, VI right) are independently shuffled using Fisher-Yates
- State tracks: `selectedLeft` (original pair index), `matched` (Set of matched original indices), `wrongPair` (flash timer)
- Tap EN card → set `selectedLeft`
- Tap VI card while EN is selected → compare original indices (same index = same pair = correct match)
- Correct: add to `matched` set, clear selection, framer-motion scale pulse on both cards
- Wrong: `wrongPair` state fires, both cards shake (`x: [-4,4,-4,4,0]`), auto-clear after 800ms via `useEffect`
- Progress bar fills as `matched.size` grows
- `onComplete` button is disabled until `matched.size === pairs.length`

**Config shape used:** `config.pairs: [{ en: string, vi: string }]`

**Why tap-to-match instead of drag-to-match:** Drag-to-match is unreliable on mobile touchscreens, especially for longer text phrases. Tap-select is faster, works reliably on all screen sizes, and suits the nursing context (users on phones in wards).

---

#### 2. `DragOrderStep.tsx` — Drag-to-Sort

**How it works:**
- `correctLines` comes from `config.lines` (stored in correct order)
- On mount, lines are shuffled via Fisher-Yates into `items` state (each item has a stable `id` for dnd-kit)
- `DndContext` wraps the list with `closestCenter` collision detection
- Three sensors active: `PointerSensor` (mouse/trackpad), `TouchSensor` (mobile), `KeyboardSensor` (accessibility)
- `SortableContext` + `useSortable` per item gives each line a drag handle (`GripVertical` icon)
- `onDragEnd` calls `arrayMove` to reorder `items` in state
- "Check Order" button: compare `items[i].text === correctLines[i]` for each position → `results: boolean[]`
- Per-line green/red border highlight after check
- Score banner shows `{correct}/{total}` in place
- Retry shuffles items again; Next calls `onComplete`

**Config shape used:** `config.lines: string[]` (stored in correct order, shuffled at render time)

**Why @dnd-kit over alternatives:** `react-beautiful-dnd` is deprecated (archived by Atlassian). `@dnd-kit` is the community standard in 2026, works with React 19, has built-in touch sensor support, and is only 6KB. The `useSortable` hook is 15 lines of setup.

---

#### 3. `FlashCardStep.tsx` — 3D Flip Cards

**How it works:**
- A `perspective: 1000px` wrapper gives the 3D depth illusion
- `motion.div` with `animate={{ rotateY: flipped ? 180 : 0 }}` drives the flip
- `transformStyle: 'preserve-3d'` on the container allows child faces to exist in 3D space
- Front face: `backfaceVisibility: 'hidden'`, shown at `rotateY: 0`
- Back face: `backfaceVisibility: 'hidden'`, `transform: 'rotateY(180deg)'` (pre-rotated so it appears readable after the container flips)
- Self-rating chips appear via `AnimatePresence` after card is flipped: "Got it" (green) / "Still learning" (amber)
- Ratings stored in `Record<number, Rating>` (local state, not persisted to DB — see Open Issues)
- Progress dots show rating colour per card
- After last card's Next: summary screen shows `{got}/{total} cards mastered`
- Restart resets all state; Finish calls `onComplete`

**Config shape used:** `config.cards: [{ front_en: string, back_vi: string, audio_url?: string }]`

**Note on `audio_url`:** The field exists in the type and is stored in config, but audio playback is not yet wired. Placeholder for a future pass.

---

#### 4. `ClozeStep.tsx` — Word-Bank Chip Mode

**How it works:**
The existing text-input mode is fully preserved. A single flag routes to the new mode:

```typescript
const wordBank = step.config?.wordBank === true
return wordBank ? <WordBankCloze /> : <TextInputCloze />
```

`WordBankCloze`:
- Extracts all `[answer]` tokens from the cloze text using the existing `parseClozeText()` function
- Optionally adds decoy words from `config.decoys?: string[]`
- Shuffles the full chip pool on mount via `useMemo` (stable — doesn't re-shuffle on re-render)
- `placed: (string | null)[]` — one slot per blank, null = empty
- `bank: string[]` — chips not yet placed
- Tap chip from bank → fills the next empty slot (in order)
- Tap a placed chip in a slot → returns it to bank
- `framer-motion layout` prop on chips → smooth reposition animation when chips move
- "Check" button: compare `placed[i].toLowerCase() === blanks[i].answer.toLowerCase()`
- Same green/red feedback and score banner as original

**Config shape used:** `config.clozeText` (existing), `config.wordBank: boolean`, `config.decoys?: string[]`

**Why additive instead of replacing:** Existing lessons already use `config.wordBank` not set (i.e. undefined/false), so they continue to render the text-input mode unchanged. No data migration needed.

---

#### 5. `apps/med/lib/i18n/translations.ts`

Added Phase 2 keys (EN + VI) for:
- `matchingHint` — tap instruction shown before first match
- `matchingAllMatched`, `matchingScore`
- `dragOrderCheckBtn`, `dragOrderScore`
- `flashCardGotIt`, `flashCardStillLearning`, `flashCardSummary`
- `clozeWordBankLabel`, `clozeWordBankSubtitle`, `clozeWordBankEmpty`

---

## What the Next Agent Must Verify

Start by reading this file, then `docs/nursed/AGENT_HANDOVER.md` (original handover from previous agent), then run:

```bash
cd C:/Users/Admin/tuto
git checkout nursemed1.3
git log --oneline -5
npx tsc --noEmit -p apps/med/tsconfig.json
```

Expected typecheck result: only the **pre-existing** errors from `nursemed1.2` remain:
- `StepEditor.tsx:160` — `'family'` comparison (pre-existing)
- `translations.ts` — duplicate property keys on lines 87, 317, etc. (pre-existing, not caused by this work)
- `next.config.ts:7` — eslint property (pre-existing)

Zero errors introduced by this work.

### Files to Review

| File | What to Check |
|---|---|
| `apps/med/components/learn/steps/MatchingStep.tsx` | Tap-to-match flow, shuffle stability, wrong-flash 800ms timer |
| `apps/med/components/learn/steps/DragOrderStep.tsx` | @dnd-kit sortable, touch sensor, check logic |
| `apps/med/components/learn/steps/FlashCardStep.tsx` | 3D flip CSS, rating chips, summary screen |
| `apps/med/components/learn/steps/ClozeStep.tsx` | Word-bank mode vs text-input mode routing, chip tap/return logic |
| `apps/med/lib/supabase.ts` | StepType union has 14 values including `matching`, `drag_order`, `flash_card` |
| `apps/med/lib/i18n/translations.ts` | All new keys present in both `en` and `vi` objects |
| `apps/med/components/admin/StepEditor.tsx` | 3 new editor panels and switch cases |
| `apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` | TYPE_BADGE, TYPE_LABEL, STEP_TYPES all include new types |

---

## Open Issues (Blocking)

None for the exercise feature itself.

## Open Issues (Non-Blocking)

| Issue | Detail |
|---|---|
| Flash card audio playback | `FlashCard.audio_url` field exists in type + config. Wire `<audio>` player on back face when `card.audio_url` is present. Low effort. |
| Word-bank decoys | `config.decoys` is supported in code but not yet exposed in `ClozeEditor` in `StepEditor.tsx`. Admin cannot add decoys via UI yet. |
| Self-rating persistence | Flash card ratings are local state only. Should write to `nursed_completions` or a `nursed_ratings` table once auth is in place. |
| Pre-existing TS errors | `translations.ts` has duplicate keys (lines 87, 317, 647, 650, etc.) from before this work. Should be fixed in a dedicated cleanup pass. |
| `@dnd-kit` packages hoisted | Packages are in root `node_modules/` (npm workspace hoisting). This is expected and does not affect other apps. |

---

## Recommended Next Steps (Priority Order from Original Handover)

1. **Auth** — Supabase Auth, middleware, login/register pages, roles (highest priority — nothing else makes sense without real users)
2. **Progress persistence** — write `nursed_completions` on `onComplete` so step/lesson progress is saved
3. **Recording upload pipeline** — `RecordingStep` has mic UI but audio blob is not uploaded to Supabase Storage
4. **Group / pair practice** — real-time pair sessions, group schema
5. **Rewards** — XP, streaks, badges, leaderboard
6. **Onboarding flow** — hospital selection, skill self-assessment, learning path screen
7. **Mobile responsiveness audit** — 375px viewport audit on LessonPlayer and all steps

---

## Branch and Deployment Info

| Item | Value |
|---|---|
| Working branch | `nursemed1.3` |
| Based on | `nursemed1.2` |
| Production branch | `nursemed` (promote via Vercel dashboard after QA) |
| Vercel project | `med` — root directory: `apps/med` |
| Dev command | `cd apps/med && npm run dev` (port 3001) |
| Supabase project | See `NEXT_PUBLIC_SUPABASE_URL` in Vercel env |

---

## Exact Next Agent Instruction

You are the next NurseEd engineering agent. Your task is to:

1. Read `docs/nursed/AGENT_HANDOVER.md` (original context) and this file
2. Verify the implementation by running `npx tsc --noEmit -p apps/med/tsconfig.json` — confirm only pre-existing errors remain
3. Open `apps/med` in the browser (`npm run dev` from `apps/med/`) and manually test all four exercise types in a lesson
4. Then proceed with **Auth** as the next priority (see original handover for full spec)

Do NOT touch: `apps/dashboard/`, any `packages/*`, the root Expo mobile app, or any branch other than `nursemed1.3`.

Success criteria for verification: all 4 exercise components render in `LessonPlayer`, the 3 new step types appear in the admin "Add Step" dropdown, and typecheck produces no new errors.
