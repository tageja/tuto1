# HANDOVER W — Interactive Exercises: Brainstorm + Visual Polish

## Agent Role & Identity

You are a **Senior Frontend & Interaction Designer** with deep expertise in:

- React 19 + Next.js 16 App Router (`apps/med/`)
- TypeScript, NativeWind / Tailwind CSS with CSS variable themes
- `framer-motion` v11 — staggered reveals, layout animations, gesture-driven motion
- `@dnd-kit/core` + `@dnd-kit/sortable` — drag-and-drop UX for both pointer and touch
- Microcopy, motion choreography, and gamified learning UI patterns (Duolingo, Quizlet, Memrise as reference)
- Accessibility — keyboard navigation, focus rings, prefers-reduced-motion

Your working directory is **`apps/med/`** only. Do NOT touch `src/` (mobile), `functions/` (Firebase), or `apps/dashboard/`. Do NOT add new step types (that is Agent X's scope). Do NOT change the database schema, the admin step picker, or the `nursed_lesson_steps.type` CHECK constraint.

Your job is to take five existing exercise step types from "functional but stale" to a **cohesive, playful, mobile-first design language** that the next agent (Agent X) can match.

---

## Feature Overview

Tarun shared six reference screenshots from a competitor product. They are NOT pixel-perfect targets — they are **mood references** for visual hierarchy, gamification, and micro-interaction richness. The shared traits across the references:

- Numbered or badged step indicator at the top-left of each card
- Soft surface + border, subtle shadow, generous padding (more breathable than current)
- Inline progress strip near the bottom (e.g. `2/3` matched)
- Clear success state with green tinted card + check icon + encouraging microcopy ("Great! Keep going!", "All matched!", "Best choice!")
- Tactile chip/pill components for draggable words and selectable options
- Motion that confirms correctness (gentle scale + green wash) and signals errors (shake + red wash)

You will:

1. **Phase 1 — Brainstorm (mandatory, ~half a day):** Produce a short markdown brainstorm doc with **8–12 candidate exercise patterns** beyond the existing set, each with a one-paragraph description, sketch (ASCII or markdown table), and reuse-of-existing-content note. Tarun picks which (if any) Agent X should later build.
2. **Phase 2 — Polish 4 existing components:** `DragOrderStep`, `MatchingStep`, `ClozeStep`, `AudioShadowStep`. No schema or content changes — same `step.config` contract, prettier UI.
3. **Phase 3 — Flashcard polish + admin pull-from-script:** Upgrade `FlashCardStep` visually AND add a "Pull key vocabulary from lesson" button to `FlashCardEditor` mirroring the pattern already in `MatchingEditor`.

---

## Current State

### Step component files (your scope — polish these)

| File | What it does today |
|---|---|
| `apps/med/components/learn/steps/DragOrderStep.tsx` | Vertical sortable list with drag handles. Works but feels like a settings list, not a game. |
| `apps/med/components/learn/steps/MatchingStep.tsx` | Two-column tap-to-select matching. Functional, but no visual link between matched pairs. |
| `apps/med/components/learn/steps/ClozeStep.tsx` | Word-bank DnD (already rewritten by previous agent — do not regress this). Polish only the chip + slot styling and success states. |
| `apps/med/components/learn/steps/AudioShadowStep.tsx` | Audio player + transcript + 3 phase buttons. Stale layout. **Recording is already wired in `RecordingStep.tsx` for group practice — do NOT add a new recorder here.** Add a **visual** waveform aesthetic only; if a real shadow-recording mode is needed, link to / reuse the existing recording flow. |
| `apps/med/components/learn/steps/FlashCardStep.tsx` | 3D flip card EN→VI with self-rating chips. Works but visually flat. |

### Files you may read for context but must NOT modify

| File | Why |
|---|---|
| `apps/med/components/admin/StepEditor.tsx` | Admin editor switch — Agent X handles new editors. You may only modify `FlashCardEditor` inside this file (last function in the file) to add the pull-from-script button. |
| `apps/med/components/admin/StepPreviewModal.tsx` | Renders steps inside the admin preview. Verify your polished components still render here. |
| `apps/med/app/admin/courses/[courseId]/lessons/[lessonId]/page.tsx` | The admin lesson builder. Do not touch. |
| `apps/med/components/learn/renderLessonStep.tsx` | The router that maps `step.type` → component. Do not touch. |
| `apps/med/components/learn/steps/RecordingStep.tsx` | The existing real recorder. Read for reference — `MediaRecorder` flow, `/api/assets/upload`, `/api/submissions`. |
| `supabase/migrations/043_nursed_step_types_and_schema_fixes.sql` | The CHECK constraint. Do not extend it. |

### Design tokens (already defined in `tailwind.config.js` + global CSS)

```
--primary           #0B5FFF
--primary-light     primary tinted background
--primary-dark      hover state
--surface           #F9FAFC
--bg                #FFFFFF
--border            light grey card border
--text              #333333
--text-muted        #888888
--success / green-50 / border-success
--warning / orange-50 / border-warning
--error   / red-50   / border-error
```

Existing utility classes already available: `card`, `btn-primary`, `btn-secondary`, `btn-ghost`, `badge`, `badge-blue`, `badge-green`, `badge-yellow`, `badge-red`, `badge-gray`, `input`, `label`.

### i18n system

- All user-facing strings live in `apps/med/lib/i18n/translations.ts` keyed by `t.someKey` accessed via `useLang()` from `apps/med/contexts/LanguageContext.tsx`.
- Both EN and VI must be added when introducing a new key. **Never** hardcode English in JSX.
- Keys you will likely need to add: `phasePolishComplete`, `dragOrderProgressLabel`, `matchingPairsRemaining`, `flashCardPullVocab`, `flashCardVocabPulled`, `audioShadowVisualLabel`, etc. Confirm names with the existing convention (camelCase, prefixed by step domain).

---

## Out of Scope — What You Must NOT Do

- ❌ Add new step types (Quick Response, Odd One Out, etc.) — that is Agent X's scope.
- ❌ Touch the `nursed_lesson_steps.type` CHECK constraint or write any migration.
- ❌ Add new npm packages without first flagging it to Tarun and getting a yes. The current toolbox (`@dnd-kit`, `framer-motion`, `lucide-react`) covers everything described here. If you propose `wavesurfer.js`, `canvas-confetti`, or any waveform/audio lib, **stop and ask first**.
- ❌ Change `step.config` shape on any existing step type. Existing lessons must render byte-identically in terms of data flow.
- ❌ Build a real recording UX inside `AudioShadowStep`. Recording is owned by `RecordingStep` and the existing peer-practice flow.
- ❌ Touch the admin step picker, the lesson page, or any admin editor except `FlashCardEditor`.
- ❌ Add admin-side or learner-side analytics events (separate scope).
- ❌ Create summary/changelog/README files. The brainstorm doc is the only new markdown artefact you should produce.

---

## Phase 1 — Brainstorm Document (DO THIS FIRST, BEFORE ANY CODE)

**Deliverable:** `apps/med/docs/dev-agent-reviews/W_BRAINSTORM_EXERCISE_IDEAS.md`

**Length:** ~150–250 lines. Concise, decision-ready.

**Required structure:**

```
# Agent W — Exercise Brainstorm

## Design language proposal
- 1 paragraph on the visual mood (e.g. "calm clinical + warm gamification, soft shadows, restrained colour, 200ms motion")
- Reference: list which of the 6 screenshots most influences each existing exercise

## Polish plan for the 5 existing exercises
- One bullet per exercise: what changes visually + what motion is added + what stays the same

## 8–12 NEW exercise pattern proposals
For each:
| Field | Value |
|---|---|
| Name | e.g. "Sentence Builder" |
| One-line description | What the learner does |
| Why it fits NurseEd | Specific to medical English, not generic |
| Content source | What `step.config` shape, where the content comes from (admin types? auto-pull from script? reuses Matching content?) |
| Sketch | ASCII or markdown table layout |
| Effort estimate | S / M / L |
| Risk / unknowns | One sentence |

## Tarun's pick (leave blank — Tarun fills this in)
- [ ] Idea 1
- [ ] Idea 2
...
```

**Idea seeds you may include (NOT exhaustive — propose your own):**

- **Sentence Builder** — scrambled chunks (not single words) like `[I'm going to] [check your] [blood pressure]` arrange into a full sentence
- **Listening Dictation** — audio plays, learner types what they hear, blanks vs. full
- **Pronunciation Minimal Pairs** — `breath` vs. `breathe`, `vein` vs. `vain`, learner taps which they hear
- **Label the Body Part / Equipment** — image hotspots (stethoscope, IV drip, BP cuff)
- **Sequence the Procedure** — drag steps of a clinical procedure into order (similar to DragOrder but with images + text + a narrative outcome)
- **Conversation Tree / Branching Dialogue** — mini choose-your-own-adventure where wrong answers branch to a corrective subtree
- **Spot the Mistake** — show 4 nurse phrases, one is grammatically/clinically wrong, learner taps it (different from Odd One Out — this is grammar/safety focused)
- **Phrase Finisher** — first half of a phrase shown, learner picks the correct ending from 4 options
- **Audio + Caption Sync** — learner taps the matching caption as the audio plays each segment
- **Vocab Sprint** — 30-second timed flashcard run with "knew it / didn't"
- **Role Reversal Roleplay** — learner reads patient lines aloud (inverts the usual nurse-perspective recording)
- **Pictogram Memory Match** — concentration-game grid pairing icon ↔ phrase

**Critical constraint for every proposal:** specify whether it requires NEW admin editor work or whether existing admin patterns suffice. Tarun will weigh effort.

**STOP after Phase 1 and ping Tarun in the chat. Do not proceed to Phase 2 until Tarun signs off the brainstorm doc.** This is the most important guardrail of the whole engagement.

---

## Phase 2 — Polish the Four Existing Exercises

After Tarun approves the brainstorm, implement these polishes. Same `step.config` shape — purely visual.

### 2a. `DragOrderStep.tsx` — Numbered Slots + Word Pool

**Current:** vertical sortable list with grip handles.

**Target inspired by screenshot 1 ("Drag & Drop"):**

- Top: a row of **numbered slot cards** (1, 2, 3, …) with the placed word inside each, dashed border when empty, solid filled card when occupied.
- Bottom: the **word pool** as draggable chips that move into the slots (and back).
- Real-time green checkmark per slot when correct (after Check), red X when wrong.
- Animated scale + green pulse on each correct word; subtle shake on wrong.
- Keep keyboard sortable accessibility from `@dnd-kit/sortable`.

**Migration of behaviour:**
- Today: items live in one sortable list and the user reorders.
- New: split into two regions — `slots` (top) and `pool` (bottom), with `useDraggable` + `useDroppable` instead of `useSortable`. The "correct order" is still derived by comparing `placed[i] === correctLines[i]`.

**Do not break:**
- `step.config.lines: string[]` — same input format.
- Reset, Check, Next button behaviour.
- The score banner.

### 2b. `MatchingStep.tsx` — Animated Connector Lines

**Current:** tap-left → tap-right matching with coloured backgrounds on matched pairs.

**Target inspired by screenshot 2 ("Match the Phrases"):**

- Two columns of cards (no change to data model).
- An **SVG overlay** sitting between/over the columns drawing curved lines (`<path d="M ... C ..."/>`) from the centre-right of each left card to the centre-left of its matched right card.
- Lines animate in (`framer-motion`'s SVG `pathLength` from 0 to 1 over 250ms) when a pair is matched.
- Selected-but-unmatched left card shows a small **dashed indicator line** extending toward the right column to communicate "now tap a right card".
- Matched cards remain green-tinted as today.
- "All matched!" success banner with a brief confetti-free celebratory motion (scale + green glow).

**Implementation hints:**
- Compute card centre coordinates with `useRef` + `getBoundingClientRect()` after layout. Recompute on window resize.
- Wrap the entire matching grid in a `position: relative` container; the SVG is `position: absolute; inset: 0; pointer-events: none`.
- Curves: control points roughly halfway between source and target X, with vertical offset = 0 for a clean horizontal bow.

**Do not break:**
- `step.config.pairs: { en, vi }[]` — same input format.
- Tap-to-select interaction (must still work without DnD).
- Wrong-pair shake animation.

### 2c. `ClozeStep.tsx` — Tactile Chip + Slot Polish

**Current:** word-bank DnD (rewritten correctly by previous agent — DO NOT regress to inline dropdowns or any other variant).

**Target inspired by screenshot 3 ("Guided Fill in the Blanks") — borrow the polish, keep the DnD model:**

- Chip styling: rounded-2xl, slightly larger touch target (min 44×44), subtle drop shadow when idle, lift effect (`translateY(-2px) + shadow-md`) on hover/drag.
- Slot styling: when filled, the chip sits inside a softly-tinted container with a small green tick **after** Check; when empty, a clearer dashed outline with a faint "drop here" hint visible only when a chip is being dragged (use `DragOverlay` + `useDroppable.isOver`).
- Word bank container: subtle bg gradient (`bg-gradient-to-b from-surface to-bg`), rounded, with a small label "Word bank" in muted text.
- Score banner: bigger, more celebratory; use `framer-motion`'s `animate={{ scale: [1, 1.05, 1] }}` on success.
- Keep both `[word]` and `___` parsing formats working.

**Do not break:**
- The two parser functions (`parseBracketFormat`, `parseUnderscoreFormat`).
- Pull-from-bank and return-to-bank tap interactions for mobile.
- Decoy chip generation logic.

### 2d. `AudioShadowStep.tsx` — Visual Waveform + Phase Choreography

**Current:** standard `<audio>` element + range slider + 3 phase buttons (Listen / Read / Speak).

**Target inspired by screenshot 4 ("Shadowing"):**

- Replace the plain progress slider with a **fake waveform visual** built with pure CSS / SVG bars (NO new audio-analysis library). Generate ~40 bars with deterministic heights from a hash of the audio URL so each lesson has a consistent unique "waveform". Active bars (left of progress) are `bg-primary`, inactive are `bg-border`.
- Play / Pause button: larger, circular, with a subtle pulsing ring when playing.
- "Tap to record and shadow" button: visually present, but it should **link to or trigger the existing `recording_submit` flow** rather than build a new recorder. Two acceptable patterns:
  - (a) The button is disabled with a tooltip "Practice this in the next step" if the lesson contains a follow-up `recording_submit` step.
  - (b) The button is hidden when no recording step follows.
  - Confirm with Tarun which pattern he prefers in the brainstorm doc.
- Pronunciation score chip: **omit it for now** — do NOT show a fake score. The previous orchestrator's lessons learned explicitly call out "never show hardcoded values that look real". Add a comment `// TODO Agent R: pronunciation scoring lands here` at the integration point.
- Phase buttons (Listen / Read / Speak): keep, but turn them into a sleeker stepper at the top of the card with a thin progress bar underneath.

**Do not break:**
- `step.config.audioUrl`, `step.config.transcript`, `step.config.transcriptSegments` reads.
- The `<TranslatableTranscript>` integration and the EN↔VI toggle.
- The `hasPlayed` gate that disables Next until the audio is at least started once.

---

## Phase 3 — Flashcard Polish + Admin Pull-from-Script

### 3a. `FlashCardStep.tsx` — Visual Polish

**Keep:** the 3D `rotateY` flip, the EN ↔ VI faces, the self-rating chips, the progress dots, the summary screen.

**Add / improve:**

- Larger card surface (min 280px tall), softer rounded corners (`rounded-3xl`), gradient back face (`bg-gradient-to-br from-primary-light to-primary/5`).
- A small **speaker icon** in the top-right of the front face that, when tapped, plays the EN audio if `card.audio_url` exists (reuse `<SpeakerButton>` from `apps/med/components/learn/SpeakerButton.tsx`).
- Card stack visual: show a faint preview of the next card peeking behind the current one (translate + scale + opacity) for tactile depth.
- Swipe gesture support: `framer-motion` `drag="x"` with `onDragEnd` triggering `handleNext` if `info.offset.x < -80` and `handlePrev` if `> 80`. Click-to-flip still works.
- Subtle haptic-style scale-pulse when a self-rating is selected.

### 3b. Vocab Sprint Mode (Approved by Tarun — pick #6 from brainstorm)

Vocab Sprint is a 30-second timed flashcard run. Tarun chose to ship it as a **mode flag on the existing `flash_card` step type** rather than as a new step type. This keeps it in your scope (no migration, no new admin editor).

**Schema (additive only, backwards compatible):**

```ts
interface FlashCardConfig {
  cards: FlashCard[]                       // existing
  mode?: 'study' | 'sprint'                // NEW — default 'study' if absent
  sprint_seconds?: number                  // NEW — default 30 when mode='sprint'
}
```

Existing lessons have no `mode` field → fall back to `'study'` → render exactly as today. Zero data migration.

**Sprint mode behaviour in `FlashCardStep.tsx`:**

- Top of card: countdown timer (large, tabular-nums) replaces the normal progress dots strip. When `mode === 'sprint'`, render a circular SVG countdown ring filling from 0 → 360° as time elapses. Color shifts from primary → warning at 10s left → error at 5s left.
- No flip animation — the back face (VI) is shown immediately alongside the front (EN) in a single side-by-side card layout (EN left, VI right, divider in middle).
- Two large buttons replace the self-rating chips: `✓ Knew it` (green) and `✗ Didn't` (warning). Tap either → instantly advance to next card. No "Confirm", no "Next" button.
- Card index advances automatically; if learner runs out of cards before the timer hits 0, show a "🎉 You finished early — {n}s left!" celebration screen.
- When timer hits 0, show a summary screen: `{got_it}/{seen}` with the speed shown (`{seen} cards in {sprint_seconds}s`). Add a "Try again" button that resets the timer + ratings (does NOT call `onComplete`).
- "Continue" button calls `onComplete` to advance the lesson.

**Don't break study mode.** All existing flashcard lessons must continue rendering with the flip + self-rating chips + summary flow exactly as today. The mode branch should be near the top of the component — `if (mode === 'sprint') return <SprintFlashCard ... />` — so the two flows are visually separate and the study flow is untouched.

**Admin editor change (also in `StepEditor.tsx`'s `FlashCardEditor`):**

Add a single checkbox + number input below the cards textarea:

```
[ ] Sprint mode (timed flashcard run)
    Duration (seconds): [ 30  ]   ← only enabled when checkbox is on
```

Save:

```ts
const config: FlashCardConfig = {
  cards: parsedCards,
  ...(sprintMode ? { mode: 'sprint', sprint_seconds: duration } : {}),
}
```

If the admin unchecks sprint mode, omit the `mode` and `sprint_seconds` fields entirely (don't save `mode: 'study'` explicitly — keep configs lean).

**Translation keys to add (in addition to those listed below):**

```
flashCardModeSprintLabel          EN: "Sprint mode (timed)"          VI: "Chế độ tốc độ (có giờ)"
flashCardSprintDurationLabel      EN: "Duration (seconds)"            VI: "Thời gian (giây)"
flashCardSprintTimerLabel         EN: "{n}s left"                    VI: "Còn {n} giây"
flashCardSprintKnewIt             EN: "✓ Knew it"                    VI: "✓ Đã biết"
flashCardSprintDidnt              EN: "✗ Didn't"                     VI: "✗ Chưa biết"
flashCardSprintEarlyFinish        EN: "🎉 Finished early — {n}s left!"  VI: "🎉 Hoàn thành sớm — còn {n} giây!"
flashCardSprintSummary            EN: "{got}/{seen} known — {seen} cards in {sec}s"
flashCardSprintTryAgain           EN: "Try again"                    VI: "Thử lại"
flashCardSprintContinue           EN: "Continue"                      VI: "Tiếp tục"
```

**Testing:**

- Existing flashcard lesson with no `mode` field → renders study mode exactly as before.
- Admin checks Sprint mode + sets 30s + saves → Preview modal renders sprint UI with a 30s countdown.
- Sprint: rapid-tap through 5 cards before timer hits 0 → see "Finished early" screen.
- Sprint: don't rate any cards → timer expires → see summary with `0/{seen}`.
- Sprint: tap "Try again" → timer resets, ratings cleared, NOT advancing to next step.
- Sprint: tap "Continue" → `onComplete` fires, lesson advances.

---

### 3c. `FlashCardEditor` (in `apps/med/components/admin/StepEditor.tsx`) — Pull Key Vocabulary

This is the ONLY admin file you may modify (along with adding the Sprint mode checkbox from 3b above). Mirror the pattern from `MatchingEditor` (same file, just above `FlashCardEditor`).

**Behaviour:**

- Add a banner at the top of the editor: "{N} dialogue lines found in this lesson's scripts". Read sibling steps the same way `MatchingEditor.collectLines()` does.
- Add a "⚡ Pull & translate" button that:
  - Calls the existing endpoint `POST /api/translate/phrases` with the extracted unique English phrases.
  - On success, populates the `raw` textarea with `EN | VI` lines (the editor's existing format).
  - On failure, falls back to inserting EN-only lines and shows a "Translation failed — fill Vietnamese manually" message.
- The button shows a spinner while translating, then a `✓ Done` state (same UX as `MatchingEditor`).
- Allow appending to existing cards (don't overwrite if `raw` is non-empty — append with a leading newline).

**Do not** invent a new key-phrase-extraction endpoint. Reuse `POST /api/translate/phrases`. The vocabulary curation step is just "extract dialogue lines and translate them" — same as Matching. Tarun has said this is the right level of automation for now.

---

## Translation Keys (add to `apps/med/lib/i18n/translations.ts`)

Add EN and VI for every new key. Suggested names (confirm with Tarun if any clash with existing keys before adding):

```
flashCardPullVocab        EN: "⚡ Pull key vocabulary"           VI: "⚡ Lấy từ vựng chính"
flashCardVocabPulled      EN: "✓ Pulled & translated"            VI: "✓ Đã dịch"
flashCardVocabBannerLabel EN: "{n} dialogue line(s) found"       VI: "Tìm thấy {n} câu thoại"
matchingConnectingLine    EN: "Tap a phrase on the right"        VI: "Chạm vào một cụm từ bên phải"
dragOrderSlotEmpty        EN: "Drop a word here"                  VI: "Thả từ vào đây"
dragOrderPoolLabel        EN: "Word pool"                         VI: "Kho từ"
clozeWordBankLabel        EN: "Word bank"                         VI: "Kho từ"
audioShadowWaveformLabel  EN: "Audio waveform"                    VI: "Sóng âm thanh"
audioShadowRecordHint     EN: "Practice recording in the next step"  VI: "Luyện ghi âm ở bước tiếp theo"
phaseListen / phaseRead / phaseSpeak — already exist, do not duplicate
```

Do not hardcode any English. If you introduce a string in JSX without a `t.` key, that is a bug — fix it before declaring done.

---

## Testing Checklist

Before declaring Phase 2 or Phase 3 done, manually verify on `http://localhost:3001` with the test account `test@test.com / password`:

**Brainstorm doc (Phase 1):**
- [ ] File exists at `apps/med/docs/dev-agent-reviews/W_BRAINSTORM_EXERCISE_IDEAS.md`
- [ ] Contains 8–12 ideas with all required fields per the structure above
- [ ] Tarun has reviewed and ticked his picks before any Phase 2 work begins

**Polish (Phase 2 + 3):**
- [ ] Find or create a lesson that contains all 5 step types (DragOrder, Matching, Cloze, AudioShadow, FlashCard) — one of the existing emergency-course lessons should already have most.
- [ ] Each polished exercise renders without console errors at the learner URL `/learn/lessons/[slug]`.
- [ ] Each polished exercise renders inside the admin Preview modal on `/admin/courses/[courseId]/lessons/[lessonId]`.
- [ ] DragOrder: drag a word into a slot, check, see green/red, retry resets.
- [ ] Matching: tap a left card, then a right card. SVG line draws. Mismatch → shake + line does NOT draw. Wait for "all matched" celebration.
- [ ] Cloze: drag chip to slot, drag back to bank, tap chip on mobile, hit Check, see per-slot results.
- [ ] AudioShadow: load a real audio URL, play, pause, scrub via waveform, see active bars fill.
- [ ] FlashCard: tap to flip, swipe left/right to navigate, tap speaker icon (if `audio_url` set) hears audio.
- [ ] FlashCardEditor: open in admin, see the dialogue-lines banner, click "Pull & translate", see textarea populate with EN | VI lines.
- [ ] Run `npx tsc --noEmit` — zero errors.
- [ ] Run `npm run build` from `apps/med/` — clean build.
- [ ] Test on a 360px-wide viewport — all five exercises usable on mobile.
- [ ] Toggle UI language to Vietnamese in the sidebar — every new string renders in VI, not EN fallback.
- [ ] No console.log statements left in production code paths.

**Edge cases:**
- [ ] DragOrder with 2 lines (minimum) and with 8 lines (max realistic) — both layouts work.
- [ ] Matching with 4 pairs (typical) and 7 pairs (max) — connector lines don't visually clash.
- [ ] Cloze with `___` (legacy) format and `[word]` (new) format — both render identically polished.
- [ ] AudioShadow with no `audioUrl` — falls back to the existing "audio coming soon" state (do not regress).
- [ ] FlashCard with 1 card and with 12 cards.

---

## Guardrails (Read Twice)

- **Phase 1 first, always.** Do not write a single line of component code until Tarun has signed off the brainstorm doc.
- **No new step types.** That is Agent X's scope.
- **No new migrations.** That is Agent X's scope.
- **No new npm packages without Tarun's explicit yes.** Flag in chat, wait for answer.
- **Reuse before you build.** Before adding any utility, check `components/learn/`, `components/ui/`, and `lib/` for an existing one. The previous orchestrator flagged "Agents creating duplicate components" as the most-repeated mistake.
- **Test the calendar lesson** — `Lesson Complete` reward credits stars after a lesson is completed. Verify your polish does not break the `onComplete` callback flow that triggers reward crediting via `nursed_user_rewards`.
- **i18n discipline.** Every visible string through `useLang()`. Vietnamese first-class.
- **Mobile first.** Test 360×640 before declaring done. Touch targets ≥44×44.
- **Reduced motion.** Wrap any non-essential motion in `prefers-reduced-motion: reduce` checks. `framer-motion` exposes `useReducedMotion()`.
- **No "TODO" placeholders in production code paths.** The only exception is the explicit `// TODO Agent R: pronunciation scoring` comment in `AudioShadowStep`.
- **Never write hardcoded data values that look real** (per orchestrator handover lesson #2). The pronunciation score chip is the prime example — omit it, don't fake it.
- **Never `console.log("coming soon")`** in onClick handlers (orchestrator lesson #1).
- **Use the test account** `test@test.com / password` for all manual testing.

---

## Definition of Done

You are done when:

1. **Phase 1 brainstorm doc** is committed at `apps/med/docs/dev-agent-reviews/W_BRAINSTORM_EXERCISE_IDEAS.md`, contains 8–12 ideas with full fields, and Tarun has explicitly ticked at least one (or written "none — proceed to polish only") in the doc.
2. **Five components polished** as specified — `DragOrderStep`, `MatchingStep`, `ClozeStep`, `AudioShadowStep`, `FlashCardStep` — with no schema changes, no broken contracts, and no new packages installed without approval.
3. **Vocab Sprint mode** (Phase 3b) — `FlashCardStep` accepts `mode: 'sprint'` config and renders the timed flow; existing flashcard lessons (no `mode` field) render exactly as before.
4. **`FlashCardEditor`** has the "Pull & translate" banner working end-to-end against `POST /api/translate/phrases` AND the Sprint-mode checkbox + duration input.
5. **All testing checklist boxes are ticked.**
6. **`npm run build` passes** with zero TypeScript errors and zero new lint warnings.
7. **A short note appended to `HANDOVER_ORCHESTRATOR_AGENT.md`** under the agents-built table marking Agent W as ✅ Done with a one-line description of what was actually shipped (so Agent X can read this and match the design language). Do NOT create a separate completion document — just append one row + maybe a sentence in the lessons-learned section if you discovered something worth telling Agent X.

That's it. Stay focused, brainstorm hard, polish carefully, ask before you install.
