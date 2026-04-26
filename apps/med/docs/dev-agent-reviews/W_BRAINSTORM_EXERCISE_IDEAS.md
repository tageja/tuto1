# Agent W — Exercise Brainstorm

## Design Language Proposal

The visual mood across all five exercises should feel like **calm clinical meets warm gamification**: a white/surface-grey base with restrained use of `--primary` (#0B5FFF) as an accent, not a flood. Cards breathe with 24px padding, `rounded-2xl` or `rounded-3xl` corners, and a single `shadow-sm` that lifts to `shadow-md` on interaction. Motion is purposeful and fast — 150–200ms eases for feedback states, 250ms for structural transitions. Success is green and celebratory but not loud (scale pulse, no confetti). Error is red and recoverable (shake, immediate retry). Every interaction should feel tactile on a 360px phone screen — minimum 44×44 touch targets everywhere.

**Screenshot influence map (reference mood, not pixel targets):**
- DragOrder ← screenshot 1 ("Drag & Drop" with numbered slots + word bank at bottom)
- Matching ← screenshot 2 ("Match the Phrases" with drawn connector lines between columns)
- Cloze ← screenshot 3 ("Guided Fill in the Blanks" with lifted chip pills in sentence)
- AudioShadow ← screenshot 4 ("Shadowing" with waveform bar visual + phase stepper)
- FlashCard ← screenshots 5–6 (large card, gradient back face, swipe gesture hint)

---

## Polish Plan for the 5 Existing Exercises

- **DragOrderStep**: Replace single sortable list with two-region layout (numbered slot row at top, word pool chips at bottom). Per-slot ✓/✗ icons after Check. framer-motion scale pulse on correct, shake on wrong. Keep `step.config.lines` contract and score banner unchanged.
- **MatchingStep**: Add SVG overlay (absolute, pointer-events-none) drawing animated bezier curves between matched pairs using `pathLength` 0→1 over 250ms. Dashed stub on selected-but-unmatched left card. Existing tap interaction and shake unchanged.
- **ClozeStep**: Visual-only — chip `rounded-2xl`, min 44×44, shadow lift on drag/hover. Slots: dashed outline + `isOver` highlight when dragging, green tick after Check. Word bank: gradient container + "Word bank" label. Score banner: framer-motion scale pulse. Both parsers untouched.
- **AudioShadowStep**: Replace range slider with ~40 deterministic CSS bars (heights seeded from audioUrl hash). Circular pulsing play button. Phase buttons become horizontal stepper with underline progress bar. Record button: hidden if no follow-up `recording_submit` step in lesson. `// TODO Agent R` comment at score integration point.
- **FlashCardStep**: Min 280px card height, `rounded-3xl`, gradient back face. Speaker icon (top-right front face, reuse `SpeakerButton`). Next-card peeking behind via translate+scale+opacity. Swipe gesture via `framer-motion drag="x"`. Rating chip scale pulse.

---

## 8–12 NEW Exercise Pattern Proposals

---

### 1. Sentence Builder

| Field | Value |
|---|---|
| Name | Sentence Builder |
| One-line description | Learner arranges scrambled phrase-chunks (3–6 words each) into the correct sentence |
| Why it fits NurseEd | Medical English has fixed phrasing patterns ("I'm going to / check your / blood pressure / now"). Chunk-level drag is more clinical than single-word scrambles. |
| Content source | `config: { chunks: string[], correctOrder: number[] }` — admin types chunks; order is the answer key. Auto-pull: extract one sentence from lesson script, split on conjunctions/clause boundaries. |
| Sketch | `[ I'm going to ] [ check your ] [ blood pressure ]` → Drop zone: `[___] [___] [___]` |
| Effort estimate | M |
| Risk / unknowns | Chunk splitting heuristic may need manual correction by admin for complex sentences. Requires new `sentence_builder` editor (Agent X scope). |

---

### 2. Listening Dictation

| Field | Value |
|---|---|
| Name | Listening Dictation |
| One-line description | Audio plays once; learner types what they hear into a text field |
| Why it fits NurseEd | Nurses must understand spoken English from doctors and patients — listening-to-typing reinforces accurate comprehension under time pressure. |
| Content source | `config: { audioUrl: string, correctText: string, tolerance?: 'strict' \| 'fuzzy' }` — reuses existing audio assets. Fuzzy matching ignores punctuation and case. |
| Sketch | `🔊 Play` → `[____________ type here ____________]` → Submit → green/red diff highlight |
| Effort estimate | M |
| Risk / unknowns | Fuzzy match logic needs defining (Levenshtein threshold?). New editor needed but simpler than most. |

---

### 3. Phrase Finisher

| Field | Value |
|---|---|
| Name | Phrase Finisher |
| One-line description | Learner sees the first half of a clinical phrase and taps the correct completion from 4 options |
| Why it fits NurseEd | Common nurse openers ("Could you please…", "I'd like to check…") always end the same way — this drills the full phrase as one unit. |
| Content source | `config: { stem: string, options: string[], correct: number }` — fully admin-authored. Could auto-pull stems from script dialogue lines. Reuses QuizStep layout almost exactly (just long-form options). |
| Sketch | `"The doctor will be with you…"` → A) soon  B) yesterday  C) quickly  D) never |
| Effort estimate | S |
| Risk / unknowns | Nearly identical to existing QuizStep — confirm with Tarun whether it's worth adding as distinct type or just a config variant. |

---

### 4. Spot the Mistake

| Field | Value |
|---|---|
| Name | Spot the Mistake |
| One-line description | Four nurse phrases are shown; one contains a grammar or clinical safety error — learner taps the wrong one |
| Why it fits NurseEd | Critical thinking about clinical language safety (e.g., "Take this medicine every day" vs. "Take this medicine every other day"). Different from Odd One Out because the distractor is clinically dangerous, not just semantically odd. |
| Content source | `config: { phrases: string[], wrongIndex: number, explanation: string }` — fully admin-authored. Explanation shows after answer. |
| Sketch | `[ Phrase A ]  [ Phrase B ]  [ Phrase C ← ✗ wrong ]  [ Phrase D ]` → reveal explanation card |
| Effort estimate | S |
| Risk / unknowns | Admin must write high-quality distractors. No auto-generation possible. |

---

### 5. Audio + Caption Sync

| Field | Value |
|---|---|
| Name | Audio + Caption Sync |
| One-line description | Audio plays segment by segment; learner taps the matching caption card for each segment |
| Why it fits NurseEd | Bridges listening comprehension and reading — nurses who read transcripts must connect spoken words to written forms (especially medical terminology). |
| Content source | `config: { segments: { audioUrl: string, caption: string }[] }` — reuses `transcriptSegments` pattern already in AudioShadowStep. Admin sets segment audio URLs and captions. |
| Sketch | `▶ Playing: "The patient's BP is…"` → 4 caption cards → tap correct one → next segment |
| Effort estimate | M |
| Risk / unknowns | Needs per-segment audio clips, not one long file. Content authoring overhead is high. |

---

### 6. Vocab Sprint

| Field | Value |
|---|---|
| Name | Vocab Sprint |
| One-line description | 30-second timed run through flashcards — learner rates each "Knew it / Didn't" as fast as possible |
| Why it fits NurseEd | Spaced repetition for medical vocab (IV, BP, SpO2, etc.) at speed mimics real ward conditions where nurses must recall quickly. |
| Content source | Same `config.cards` as FlashCardStep — zero new admin editor needed. Just a timed mode wrapper. |
| Sketch | `⏱ 0:23` → `[ INTUBATE ]` → `✓ Knew it` / `✗ Didn't` → score → "Try again" |
| Effort estimate | S |
| Risk / unknowns | Needs a timer UI and a "mode" prop on FlashCardStep or a new VocabSprintStep. If new step type, Agent X scope. If mode prop, Agent W can do it. |

---

### 7. Sequence the Procedure

| Field | Value |
|---|---|
| Name | Sequence the Procedure |
| One-line description | Drag clinical procedure steps into the correct order (e.g., hand-washing, IV insertion protocol) |
| Why it fits NurseEd | Clinical procedures have strict ordering — incorrect sequence can be a patient safety issue. Higher stakes than generic sentence ordering. |
| Content source | `config: { steps: { label: string, imageUrl?: string }[], correctOrder: number[] }` — admin-authored with optional images per step. Reuses DragOrder polish pattern. |
| Sketch | `[ Gather equipment ] [ Wash hands ] [ Apply gloves ] [ Insert needle ]` → numbered drop zones |
| Effort estimate | M |
| Risk / unknowns | Image per step is optional but doubles the visual richness — must degrade gracefully with text-only. |

---

### 8. Pronunciation Minimal Pairs

| Field | Value |
|---|---|
| Name | Pronunciation Minimal Pairs |
| One-line description | Audio plays one of two similar-sounding words; learner taps which they heard |
| Why it fits NurseEd | Vietnamese nurses confuse "breath/breathe", "vein/vain", "dose/douse" — minimal pairs are a known phonics drill for this population. |
| Content source | `config: { pairs: { wordA: string, wordB: string, audioA: string, audioB: string }[], questions: number[] }` — admin sets word pairs and which audio to play per question. |
| Sketch | `🔊` → `[ breath ]` vs `[ breathe ]` → tap one → ✓ or ✗ |
| Effort estimate | M |
| Risk / unknowns | Requires audio recording of individual words — content production overhead. No auto-generate possible. |

---

### 9. Role Reversal Roleplay

| Field | Value |
|---|---|
| Name | Role Reversal Roleplay |
| One-line description | Learner reads patient dialogue lines aloud (recording), reversing the usual nurse-perspective |
| Why it fits NurseEd | Nurses need empathy for patient communication — understanding patient anxiety and phrasing from the inside improves bedside manner and listening. |
| Content source | `config: { patientLines: string[], nurseLines: string[], audioUrl?: string }` — shows patient lines as the "script to read", plays nurse reference audio. Reuses RecordingStep infrastructure. |
| Sketch | `Nurse says: "How are you feeling today?"` → `You (patient) say: "I have a sharp pain in my chest"` → `🎙 Record` |
| Effort estimate | L |
| Risk / unknowns | Substantial new editor + recording wiring. Probably Agent X + Agent R combined scope. |

---

### 10. Label the Equipment

| Field | Value |
|---|---|
| Name | Label the Equipment |
| One-line description | An image of medical equipment is shown with blank hotspots; learner drags the correct label onto each hotspot |
| Why it fits NurseEd | Vietnamese nurses who learned anatomy/equipment in Vietnamese must learn the English names in context — visual association is more durable than flashcards. |
| Content source | `config: { imageUrl: string, hotspots: { x: number, y: number, label: string }[], labels: string[] }` — admin uploads image and marks hotspot positions + correct labels. |
| Sketch | `[Image of IV drip setup]` with `[ IV bag ] [ drip chamber ] [ cannula ]` chips to drag onto circles on the image |
| Effort estimate | L |
| Risk / unknowns | Hotspot editor in admin is non-trivial (requires interactive image coordinate picker). Learner DnD over an image has touch-target complexity. High effort — worth it for anatomy/equipment lessons. |

---

### 11. Conversation Tree

| Field | Value |
|---|---|
| Name | Conversation Tree |
| One-line description | Branching dialogue: learner picks the nurse's response from 3 options; wrong choices branch to a corrective sub-dialogue |
| Why it fits NurseEd | Real patient interactions are non-linear. This trains decision-making under pressure — choosing the wrong phrase with a worried patient has consequences. |
| Content source | `config: { nodes: { id, prompt, options: { text, next, isCorrect }[] }[], startNode }` — tree data structure, fully admin-authored. |
| Sketch | `Patient: "I'm scared"` → A) "Don't worry" B) "I understand, let me explain" ✓ C) "That's normal" → branch to next node |
| Effort estimate | L |
| Risk / unknowns | Tree editor in admin is complex (graph-like UI). Learner renderer needs recursive node traversal. Highest-effort proposal — strong ROI for clinical reasoning training. |

---

### 12. Pictogram Memory Match

| Field | Value |
|---|---|
| Name | Pictogram Memory Match |
| One-line description | Concentration-style grid: flip pairs of cards matching a medical icon to its English phrase |
| Why it fits NurseEd | Icons appear on hospital equipment displays, warning signs, medication packaging — recognition drill in a game format adds replay value to otherwise dry vocabulary. |
| Content source | `config: { pairs: { iconUrl: string, phrase: string }[] }` — admin uploads icons and sets phrases. Could use lucide-react icons for common items (stethoscope, heart, etc.) without needing uploads. |
| Sketch | `[ ? ] [ ? ] [ ? ] [ ? ]` → flip `[ 🩺 ]` and `[ stethoscope ]` → match → fade green |
| Effort estimate | M |
| Risk / unknowns | Requires icon assets — using lucide-react for first batch is feasible. Needs new admin editor. |

---

## Tarun's Pick (CONFIRMED)

- [x] **1. Sentence Builder** → Agent X scope (new step type `sentence_builder`)
- [ ] 2. Listening Dictation
- [ ] 3. Phrase Finisher (skipped — too close to Quiz)
- [x] **4. Spot the Mistake** → Agent X scope (new step type `spot_the_mistake`)
- [ ] 5. Audio + Caption Sync
- [x] **6. Vocab Sprint** → **Agent W scope** (implemented as `mode: 'sprint'` config flag on existing `flash_card` type — no new step type, no migration needed)
- [ ] 7. Sequence the Procedure (deferred — overlaps with polished DragOrder)
- [ ] 8. Pronunciation Minimal Pairs (deferred — content production overhead)
- [ ] 9. Role Reversal Roleplay (deferred — blocked on Agent R recording work)
- [ ] 10. Label the Equipment (deferred — hotspot editor is its own project)
- [ ] 11. Conversation Tree (deferred — flagship feature, multi-week scope)
- [ ] 12. Pictogram Memory Match (deferred)

### What this means for the agents

**Agent W (proceed to Phase 2 + 3 polish):**
- All 5 polish tasks as originally specified
- **PLUS**: Add Vocab Sprint as a new `mode: 'sprint'` flag on `FlashCardStep` + `FlashCardEditor` (see `HANDOVER_W_INTERACTIVE_EXERCISES_POLISH.md` Phase 3c)

**Agent X (waits for W to finish):**
- Original scope: `quick_response` + `odd_one_out`
- **Added scope**: `sentence_builder` + `spot_the_mistake`
- Migration 053 now extends the CHECK constraint with **4** new types instead of 2
- See `HANDOVER_X_NEW_INTERACTIVE_STEP_TYPES.md` for full contracts and editor specs of all 4
