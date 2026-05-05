# HANDOVER Y — Module 2 Redesign (Triage Intake) + Generic Template for Modules 3–12

**Owner:** Orchestrator Agent → next agent (Agent Y has been retired after M5)
**Created:** 2026-05-04
**Last updated:** 2026-05-05 (after Agent Y completed M5 + 4 follow-up bugs were caught)
**Scope:** Apply the Module 1 (First Contact in an Emergency) blueprint to remaining modules. Module 1 ✅ done. Module 5 ✅ done by Agent Y (with 4 fixes in flight). Module 2 is next, then M3, M4, M6, M7, M8, M9, M10, M11, M12.
**Critical constraint:** All existing scripts, video URLs, audio URLs, and animations in Modules 2–12 are already production-ready. **DO NOT replace, delete, or mutate them** unless explicitly told to. We are only **adding** new steps and **fixing** broken ones (e.g., empty configs, malformed cloze, wrong field names).

---

## §0. CURRENT STATE — READ THIS FIRST

### What's already done

| Module | Title | Redesign status | Known issues (open) |
|---|---|---|---|
| M1 | First Contact in an Emergency | ✅ Complete (orchestrator session, 2026-05-04) | None |
| M2 | Triage Intake | ⏳ NOT started — full redesign needed | Mixed flashcard schema (34 cards on legacy `front`/`back`) |
| M3 | Immediate Instructions in Emergencies | 🟡 Partial — structure looks redesigned but ALL 70 flashcards use legacy `front`/`back` schema → render BLANK | Flashcards broken; verify cloze format; verify recording_submit stubs |
| M4 | Common Emergency Scenarios | 🟡 Partial — same as M3, ALL 70 flashcards broken | Same as M3 |
| M5 | Communicating Patient Deterioration | ✅ Done by Agent Y (2026-05-05) | 4 bugs being fixed in parallel by orchestrator: M5 L1 step 7 Charge Nurse role, L1 step 6 + L3 step 5 broken cloze, 4 empty recording_submit stubs |
| M6 | Reassurance Under Pressure | ⏳ NOT started | Unknown — inspect first |
| M7 | Red Flags & Escalation | ⏳ NOT started | Has 6 cards using `front_en`/`back_vi` — at least one lesson partially built |
| M8–M12 | Various | ⏳ NOT started | Unknown — inspect each |

### Cross-cutting fix: flashcard schema normalisation (REQUIRED before any module work)

The `FlashCard` TypeScript type and `FlashCardStep.tsx` component read **only** `card.front_en` / `card.back_vi`. M2/M3/M4 still contain ~174 cards using the legacy `{front, back}` keys → these cards render as blank rectangles in the UI.

Before redesigning M2 (or any module), **normalise all card schemas across the whole course** with one cross-module SQL pass. Verification query in §8.10. Fix template in §5.13. Doing this once removes a recurring trap.

---

## TABLE OF CONTENTS

0. Current State — READ THIS FIRST
1. Pedagogical Philosophy & Stage Map
2. Module 1 — Final Reference (the blueprint)
3. The Seven Reusable Patterns (with copy-paste JSON templates)
4. Hard Constraints — DO NOT TOUCH list
5. Gotchas Catalog (every bug we hit, with fixes)
6. Module 2 — Step-by-Step Plan (with current state inventory)
7. Generic Template for Modules 3–12
8. QA Checklist + Verification SQL Queries
9. Vocabulary De-duplication Strategy
10. Execution Order for the New Agent
11. When in Doubt — Ask the User
12. Lessons Learned from Agent Y's M5 Round (calibration data)

---

## §1. PEDAGOGICAL PHILOSOPHY & STAGE MAP

Each lesson follows a **receptive → productive → final receptive review** progression. Every module has 8 lessons distributed across 4 stages:

| Lesson | Stage | Focus |
|--------|-------|-------|
| L1 | `heads_up` | Receptive intro: scenario + listen + recognize |
| L2 | `heads_up` | Receptive expansion: more vocabulary + spot mistakes |
| L3 | `heads_down` | Active processing: cloze, choose calm response |
| L4 | `heads_down` | Re-application in new context (different scenario, same language) |
| L5 | `heads_down` | Productive: free speaking with cues |
| L6 | `heads_together` | Pair practice round 1 (full script roleplay) |
| L7 | `heads_together` | Pair practice round 2 (open scenario) |
| L8 | `assessment` | Mixed-format module assessment |

**Step ordering principle inside each lesson:**
1. **Warm-up review** (`flash_card`, 4 cards from prior lessons) — L2 onwards only
2. **Listen / context** (`scenario_intro`, `audio_shadow`, or `video`)
3. **Vocabulary preview** (`flash_card`, 6 cards specific to this lesson)
4. **Process the input** (`cloze`, `quiz`, `spot_the_mistake`, `quick_response`)
5. **Speak / produce** (`script_read`, `no_script`, `sentence_builder`)
6. **Final receptive review** (`matching` of the 6 lesson vocab items) — last step
7. **L7 only:** add `mission` step (real-world task)

---

## §2. MODULE 1 — FINAL REFERENCE (THE BLUEPRINT)

Module ID: `9aa44f95-...` (Course ID `9113d5cb-cedb-4bea-9678-7321020230e8`, module `order_index = 1`)

### Lesson 1 — "What's happening? First words in an emergency" (heads_up)
| s_n | type | title |
|-----|------|-------|
| 1 | scenario_intro | Scenario: Emergency Room |
| 2 | flash_card | Vocabulary preview: First words in an emergency |
| 3 | video | Watch: Real emergency encounter |
| 4 | quick_response | After the video: First safe response |
| 5 | audio_shadow | Listen: First emergency contact |
| 6 | script_read | Read the dialogue aloud |
| 7 | quiz | Recognition check |
| 8 | matching | Match: First emergency vocabulary |

### Lesson 2 — "Key phrases in action" (heads_up)
| s_n | type | title |
|-----|------|-------|
| 0 | flash_card | Warm-up review: from earlier lessons |
| 1 | audio_shadow | Listen: Breathing difficulty scenario |
| 2 | flash_card | Vocabulary preview: Key phrases for first contact |
| 3 | video | Read along: Identify the key phrases |
| 4 | spot_the_mistake | After the video: Fix the unsafe phrase |
| 5 | quiz | Meaning check: 3 questions |
| 6 | script_read | Read the dialogue aloud |
| 7 | quiz | Comprehension Check |
| 8 | drag_order | ↕️ Order |
| 9 | cloze | Fill in the Blanks |
| 10 | matching | Match: Key phrases for first contact |

### Lesson 3 — "Understanding the situation" (heads_down)
| s_n | type | title |
|-----|------|-------|
| 0 | flash_card | Warm-up review: from earlier lessons |
| 1 | audio_shadow | Listen: Family emergency scenario |
| 2 | flash_card | Vocabulary preview: Responding to a panicked family member |
| 3 | cloze | Fill in the blanks |
| 4 | script_read | Read the dialogue aloud |
| 5 | quick_response | After the audio: Choose the calm response |
| 6 | quiz | Best response: choose wisely |
| 7 | spot_the_mistake | Fix the unsafe instruction |
| 8 | matching | Match: Family emergency phrases |

### Lesson 4 — "A second scenario — new context, same language" (heads_down)
| s_n | type | title |
|-----|------|-------|
| 0 | flash_card | Warm-up review |
| 1 | scenario_intro | Scenario: Patient fainting in the entrance |
| 2 | audio_shadow | Listen: The nurse arrives |
| 3 | flash_card | Vocabulary preview: Identifying yourself & directing bystanders |
| 4 | video | Read the three-person dialogue |
| 5 | cloze | Fill in: fainting scenario |
| 6 | script_read | Read the dialogue aloud |
| 7 | matching | Match: Fainting scenario phrases |

### Lesson 5 — "Your turn to speak" (heads_down)
| s_n | type | title |
|-----|------|-------|
| 0 | flash_card | Warm-up review |
| 1 | audio_shadow | Listen: Dizziness scenario |
| 2 | flash_card | Vocabulary preview: Helping a dizzy patient |
| 3 | video | Partial script: fill in your lines |
| 4 | cloze | Fill in the Blanks |
| 5 | script_read | Read the dialogue aloud |
| 6 | no_script | Speak with prompt cues only |
| 7 | quick_response | Quick response: a dizzy patient |
| 8 | matching | Match: Helping a dizzy patient |

### Lesson 6 — "Pair practice — round 1" (heads_together)
| s_n | type | title |
|-----|------|-------|
| 0 | flash_card | Warm-up review |
| 1 | video | Round 1: Full script roleplay |
| 2 | flash_card | Vocabulary preview: Assessing an injured patient |
| 3 | script_read | Read the dialogue aloud |
| 4 | cloze | Fill in the Blanks |
| 5 | no_script | Round 3: Prompt card only - speak freely |
| 6 | sentence_builder | Build the nurse line: assessing an injury |
| 7 | matching | Match: Assessing an injured patient |

### Lesson 7 — "Pair practice — open scenario" (heads_together)
| s_n | type | title |
|-----|------|-------|
| 0 | flash_card | Warm-up review |
| 1 | script_read | Model dialogue |
| 2 | flash_card | Vocabulary preview |
| 3 | no_script | New scenario |
| 4 | recording_submit | Record your response |
| 5 | mission | Real-world task before your next shift |
| 6 | matching | Match: Lesson vocabulary |

### Lesson 8 — Module Assessment (assessment)
**No flashcards.** Mix of formats only:
| s_n | type | title |
|-----|------|-------|
| 1 | quiz | Part A + D: Audio and clinical decision questions |
| 2 | spot_the_mistake | Part B: Fix the unsafe phrases |
| 3 | cloze | Part C: Phrase control - complete the nurse lines |
| 4 | drag_order | Part D2: Order the emergency dialogue |
| 5 | matching | Part F: Match vocabulary from the module (cumulative, 8 pairs) |
| 6 | recording_submit | Part E: Voice note response |
| 7 | self_reflection | Module reflection and self-assessment |

---

## §3. THE SEVEN REUSABLE PATTERNS

### Pattern 1 — Vocabulary preview (`flash_card`)

**Position:** L1–L7, after the listening/scenario step (typically `s_n = 2` or 3).
**Cards:** Always **6** items. Mix: 1–2 single words/short nouns, 3–4 nurse phrases, 1–2 patient/family phrases.

> **🚨 SCHEMA RULE — NON-NEGOTIABLE:** Every card object MUST use `front_en` and `back_vi` keys. **Never** use `front`/`back` (the component does not read those keys — cards will render blank). This is the #1 most common bug — see §5.13.

```json
{
  "mode": "study",
  "cards": [
    { "front_en": "emergency",          "back_vi": "cấp cứu" },
    { "front_en": "chest pain",         "back_vi": "đau ngực" },
    { "front_en": "I am here to help you.", "back_vi": "Tôi ở đây để giúp bạn." },
    { "front_en": "What happened?",     "back_vi": "Chuyện gì xảy ra?" },
    { "front_en": "Where does it hurt?", "back_vi": "Đau ở đâu?" },
    { "front_en": "Please sit down.",   "back_vi": "Xin mời ngồi xuống." }
  ]
}
```

### Pattern 2 — Warm-up review (`flash_card`, L2 onwards only)

**Position:** Always `order_index = 0` (the very first step).
**Cards:** Always **4** items, drawn from prior lessons in the same module. For L2 of M2, draw from M1 + previous M2 lessons. For L2+ of M3+, draw from prior modules + earlier same-module lessons.

```json
{
  "mode": "study",
  "cards": [
    { "front_en": "Stay calm.", "back_vi": "Hãy bình tĩnh." },
    { "front_en": "...", "back_vi": "..." },
    { "front_en": "...", "back_vi": "..." },
    { "front_en": "...", "back_vi": "..." }
  ]
}
```

**Distribution rule per lesson within a module (M2+):**
- L2: 4 cards from M1 (e.g., 1 from each of M1 L1–L4, or 1 from each of L1+L2 + 2 from L1)
- L3: 2 from M1 + 2 from M2 L1–L2
- L4: 1 from M1 + 3 from M2 L1–L3
- L5: 1 from M1 + 1 from M2 L1 + 1 from L2 + 1 from L3
- L6: 0 from M1 + 1 from each of L2–L5
- L7: 0 from M1 + 1 from each of L3–L6

> **🚨 SCATTERING RULE:** "Cumulative recall" means scattered across **multiple prior modules + earlier same-module lessons**, NOT just the previous lesson. For Module N (N≥3), warm-ups must include at least 1 card from a prior MODULE (not just a prior lesson). Agent Y missed this in M5 round 1 and had to rebuild — don't repeat that mistake. This same rule applies to flashcard SCHEMA: always `front_en`/`back_vi`, never `front`/`back`.

### Pattern 3 — Final matching (`matching`)

**Position:** Always the **last step** of each lesson L1–L7.
**Pairs:** **6 EN/VI pairs that exactly mirror this lesson's `flash_card` vocabulary preview.** Identical strings.

```json
{
  "pairs": [
    { "en": "emergency",          "vi": "cấp cứu" },
    { "en": "chest pain",         "vi": "đau ngực" },
    { "en": "I am here to help you.", "vi": "Tôi ở đây để giúp bạn." },
    { "en": "What happened?",     "vi": "Chuyện gì xảy ra?" },
    { "en": "Where does it hurt?", "vi": "Đau ở đâu?" },
    { "en": "Please sit down.",   "vi": "Xin mời ngồi xuống." }
  ]
}
```

### Pattern 4 — Cumulative module-assessment matching (L8 only)

**Position:** Inside the assessment, mid-list (after cloze, before recording).
**Pairs:** **8 pairs covering vocabulary from L1–L7** of that module (one or two from each lesson). Picks the most "core" phrases.

```json
{
  "pairs": [
    { "en": "I am here to help.", "vi": "Tôi ở đây để giúp." },
    { "en": "What happened?", "vi": "Chuyện gì đã xảy ra?" },
    { "en": "Stay calm.", "vi": "Hãy bình tĩnh." },
    { "en": "Do not panic.", "vi": "Đừng hoảng sợ." },
    { "en": "Is he breathing?", "vi": "Anh ấy còn thở không?" },
    { "en": "Stay still.", "vi": "Ở yên." },
    { "en": "I am with you.", "vi": "Tôi ở bên bạn." },
    { "en": "You are safe now.", "vi": "Bạn an toàn rồi." }
  ]
}
```

### Pattern 5 — Interactive read-aloud (`script_read`)

**Position:** Mid-late in each lesson (after the cloze/quiz, before the speaking task).
**Behaviour at runtime:** 3 phases (Listen → Read Along → Speak Together). Listen requires every chat bubble to play before unlocking Read Along.
**Config schema:**

```json
{
  "script": "Nurse: Hello! I am Nurse Linh. I am here to help. What happened?\nFamily: My husband... he fell. He is not moving.\nNurse: Okay. Do not panic. Is he breathing?\nFamily: I do not know! Please come quickly!\nNurse: I am coming right now. Stay with him. Do not move him.",
  "line_0_vi": "Xin chào! Tôi là Y tá Linh. Tôi ở đây để giúp đỡ. Chuyện gì đã xảy ra?",
  "line_1_vi": "Chồng tôi... anh ấy bị ngã. Anh ấy không cử động.",
  "line_2_vi": "Được rồi. Đừng hoảng sợ. Anh ấy còn thở không?",
  "line_3_vi": "Tôi không biết! Xin hãy đến nhanh!",
  "line_4_vi": "Tôi sẽ đến ngay bây giờ. Hãy ở bên anh ấy. Đừng di chuyển anh ấy.",
  "line_0_audioUrl": "https://...nursed-assets/audio/...nurse_0.mp3",
  "line_1_audioUrl": "https://...nursed-assets/audio/...family_1.mp3",
  "line_2_audioUrl": "https://...",
  "line_3_audioUrl": "https://...",
  "line_4_audioUrl": "https://..."
}
```

**RULES:**
- Always `line_N_vi` for **every** line (N = 0, 1, 2…).
- `line_N_audioUrl` only when the audio actually exists (otherwise the component shows a "preview-only" mode with no broken speaker icons).
- Roles supported by parser: `Nurse`, `Doctor`, `Patient`, `Family`, `Passerby`, `Bystander`, `Witness`, `Parent`, `Mother`, `Father`, `Child`. Generic `Word:` prefix also recognized as a non-nurse role.
- **⚠️ MULTI-WORD ROLES THAT CONTAIN "Nurse"** (e.g., `Charge Nurse:`, `Senior Nurse:`, `Head Nurse:`, `Sister:`) are currently classified as nurse-side and render on the LEFT alongside the speaking nurse — same colour, same alignment, no visual distinction. **This is a known bug** (see §5.14). Until the parser is fixed: when the dialogue has the speaking nurse escalating to a charge nurse, prefer `Doctor:` or `Charge:` (4-letter) as the partner label, OR explicitly verify by visual smoke check that the second speaker renders on the right side.
- Keep nurse lines **short** (≤ ~15 words) for fresh learners. If existing scripts are long, you may rewrite them to be shorter, but only with explicit permission for that lesson.

### Pattern 6 — Free speaking with cues (`no_script`)

**Position:** L5 step 6 + L6 step 5 (and equivalent in other modules).
**Behaviour:** Learner sees 5 cues, speaks each line freely, and the system shows nurse-only model phrases for comparison.
**Config schema:**

```json
{
  "cues": [
    "Greet and introduce yourself",
    "Reassure and steady the patient",
    "Ask the patient to sit down",
    "Ask where it hurts",
    "Ask when it started"
  ],
  "script": "Nurse: Hello. I am Nurse Mai. I am here to help you.\\nNurse: I have you. Do not worry. You are safe.\\nNurse: Please sit here. Take a slow breath.\\nNurse: Where does it hurt? Show me.\\nNurse: When did it start? Tell me more.",
  "timer_seconds": 45,
  "timer_visible": true
}
```

**CRITICAL RULES:**
- `cues.length === script.split('\\n').length` — exactly 1:1 mapping.
- Every line in `script` must be a **nurse line** (`Nurse:` prefix). If you include patient/family lines, the cue-to-phrase matcher misaligns.
- Use `\\n` (escaped) in JSON because the SQL `INSERT` reads it as a real newline.

### Pattern 7 — Quick response (`quick_response`)

**Position:** Often L1 s4 (post-video) or L5 s7 (replacing a redundant `recording_submit`).
**Config schema (CRITICAL: use `text_en`, NOT `text`):**

```json
{
  "speaker_label_en": "Patient",
  "speaker_label_vi": "Bệnh nhân",
  "prompt_en": "I feel very dizzy... I think I am going to fall.",
  "prompt_vi": "Tôi cảm thấy rất chóng mặt... tôi nghĩ mình sắp ngã.",
  "question_en": "What is the BEST nurse response right now?",
  "question_vi": "Đâu là câu trả lời TỐT NHẤT của điều dưỡng lúc này?",
  "options": [
    { "id": "a", "text_en": "I have you. Do not worry. Please sit here.", "text_vi": "Tôi đỡ bạn rồi. Đừng lo lắng. Mời ngồi đây.",        "rating": "best" },
    { "id": "b", "text_en": "Stand up and follow me to a chair.",          "text_vi": "Đứng dậy và theo tôi đến ghế.",                    "rating": "poor" },
    { "id": "c", "text_en": "You will be fine. Just wait here.",           "text_vi": "Bạn sẽ ổn thôi. Cứ chờ ở đây.",                  "rating": "acceptable" },
    { "id": "d", "text_en": "Calm down. I am busy right now.",             "text_vi": "Bình tĩnh lại. Tôi đang bận.",                    "rating": "poor" }
  ],
  "feedback_best_en": "Calm reassurance + safe positioning. You stop a fall AND lower the panic.",
  "feedback_best_vi": "Trấn an bình tĩnh + đặt vị trí an toàn. Bạn ngăn cú ngã VÀ giảm hoảng sợ."
}
```

**Rules:**
- Exactly 4 options.
- `rating` must be one of: `"best"` (exactly 1), `"acceptable"` (0–1), `"poor"` (1–3), `"incorrect"` (rare). Never `is_best` (deprecated).
- Always include both `text_en` and `text_vi` per option.

### Bonus Pattern — `cloze` (USE BRACKET FORMAT, NOT UNDERSCORES)

The component supports two formats; the underscore parser has alignment bugs with punctuation. **Always use the `[answer]` bracket format:**

```json
{
  "clozeText": "Nurse: Hello! I am Nurse Linh. I am here to [help]. What [happened]?\nFamily: My husband... he fell. He is not [moving].\nNurse: Okay. Do not [panic]. Is he [breathing]?\nFamily: I do not know! Please come quickly!\nNurse: I am coming right [now]. Stay with him. Do not [move] him.",
  "decoyPool": ["help", "move", "stop", "wait", "yes", "no"],
  "instructions_en": "Fill in the missing words from the pool below.",
  "instructions_vi": "Điền các từ còn thiếu từ kho từ bên dưới."
}
```

**Rules:**
- Wrap every blank's correct answer in `[brackets]`.
- **EVERY BLANK MUST BE 1 WORD OR A 2-WORD PHRASE.** Never wrap an entire sentence in `[...]` — the component renders that as one giant unusable input box. Agent Y left two such broken cloze steps in M5 (L1 step 6 and L3 step 5) — see §5.15.
- **A cloze step needs 5–7 blanks.** A cloze with 1 blank is not an exercise. A cloze with 3 blanks is acceptable only if each blank is single-word and clinically meaningful.
- DO NOT include the deprecated `cloze` field (the older underscore format) — the SQL update should use `jsonb_set ... - 'cloze'` to remove it.
- Decoys (~6 extra words) make multiple-choice harder; if omitted, the component generates plausible decoys but they may be poor quality.

### Bonus Pattern — `audio_shadow` `transcriptSegments` (REQUIRED for hover translation)

For every `audio_shadow` step, populate `transcriptSegments` so VN tooltips work on hover:

```json
{
  "audioUrl": "https://...",
  "transcript": "Nurse: Hello! ...",
  "transcriptSegments": [
    { "en": "Hello!",            "vi": "Xin chào!" },
    { "en": "I am here to help.", "vi": "Tôi ở đây để giúp." },
    { "en": "What happened?",    "vi": "Chuyện gì đã xảy ra?" }
  ]
}
```

If you skip this, hovering does nothing. The new admin tool at `/admin/audio` → "Translate All Dialogue" can auto-fill these for you (as of this session).

---

## §4. HARD CONSTRAINTS — DO NOT TOUCH

When working on **any** module beyond Module 1, you must **preserve** the following without modification:

### 4.1 Existing scripts inside `video` and `audio_shadow` steps
- These scripts have **production animations and audio narration already bound to them**.
- Do NOT change the `transcript`, `script`, `videoUrl`, `audioUrl`, `transcriptSegments` (if present), or step `id`.
- You **may** read them. You **may** add `transcriptSegments` if missing. You may NOT rewrite the wording.

### 4.2 Existing `id` of any step
- Lessons reference step IDs in `nursed_submissions` and `nursed_peer_reviews`.
- When restructuring a lesson, **prefer UPDATE over DELETE+INSERT** to preserve IDs.
- If you must delete a step, only delete steps that have **no submissions** (verify with the SQL in §8).

### 4.3 Existing `script_read` step audio URLs (`line_N_audioUrl`)
- These were generated by fish.audio and stored in Supabase. Don't rewrite them.
- If you rewrite a `script` in a `script_read` step (only with explicit permission), regenerate the audio via `/admin/audio` afterwards.

### 4.4 Lesson titles, slugs, `title_vi`, `description`, `est_minutes`
- The lesson record itself is fixed. Only modify `nursed_lesson_steps` rows.

### 4.5 Module records
- Don't touch `nursed_modules`. Same titles, same order_index.

### 4.6 Any step type marked "scenario_intro"
- These have polished copy and animation triggers. Reuse if present; only insert new ones if a lesson lacks an intro.

### 4.7 `recording_submit` step type — strict rules
The user has explicitly removed standalone "record yourself reading this script" steps from L1–L7 (they're redundant with `script_read`'s built-in record phase). Going forward:
- **L1–L7:** No `recording_submit` step is allowed UNLESS it has fully populated config (`prompt_en`, `prompt_vi`, optional `referenceScript`, optional rubric). Empty stubs (no prompt, no instructions, no transcript) are forbidden.
- **L8 (assessment) only:** A populated `recording_submit` is appropriate as the summative recording. Must have a real prompt, success criteria, and ideally a reference script the learner can compare against.
- **Replacement preferred:** Where you find an empty `recording_submit` stub in L1–L7, replace it with `quick_response`, `sentence_builder`, `spot_the_mistake`, or `odd_one_out`. Don't just delete — replace with something productive.
- **Audit query:** see §8.11.

---

## §5. GOTCHAS CATALOG

Each gotcha is a real bug we hit during M1 redesign. Read carefully before writing SQL.

### 5.1 Cloze — wrong answers shown / blanks misaligned
**Symptom:** "Do no she." appears as a chosen answer; correct word missing from options.
**Cause:** Underscore-format parser miscounts blanks when punctuation (e.g., `___,`) is attached.
**Fix:** Always use `[answer]` bracket format. Strip the old `cloze` field with `jsonb_set ... - 'cloze'`.

### 5.2 `script_read` — chat bubbles missing speaker icons
**Cause:** Step lacks `line_N_audioUrl` for any line.
**Fix:** Either generate audio (run `/admin/audio` Batch for the course), OR leave it — the component now auto-detects "no audio" and shows a preview-only prompt: "Read the dialogue below to set the scene…" with the Continue button immediately enabled. No code change needed; it Just Works.

### 5.3 `script_read` — Passerby/Family lines parsed as Nurse
**Cause:** Old `KNOWN_ROLES` list missed roles like Passerby, Parent, Child.
**Fix:** Already fixed in component (`ScriptReadStep.tsx`, `NoScriptStep.tsx`, `app/api/translate/route.ts`, `app/api/audio/*/route.ts`). New roles supported: `Passerby`, `Bystander`, `Witness`, `Parent`, `Mother`, `Father`, `Child`. Generic `Word:` fallback also works. **No SQL fix needed** — just write scripts naturally and they parse.

### 5.4 `quick_response` — options invisible / blank
**Cause:** Used `text` instead of `text_en` in option objects.
**Fix:** Always `text_en` (and `text_vi`). See Pattern 7.

### 5.5 `no_script` — cues 2–5 don't match any spoken line
**Cause:** Component pulled extracted phrases from prior steps and they were not nurse-only.
**Fix:** Add explicit `script` to the `no_script` config — 5 nurse-only lines, 1:1 with the 5 cues. See Pattern 6.

### 5.6 Audio generation — `fish.audio: Reference not found`
**Cause:** `FISH_AUDIO_VOICE_PATIENT` env was empty; `??` operator passed the empty string to fish.audio.
**Fix:** Already fixed in `app/api/audio/batch/route.ts` and `app/api/audio/generate/route.ts` (use `||` not `??`, and explicit role-to-voice map). When new roles appear (Family, Passerby, Child, etc.), they map to PATIENT_VOICE with NURSE_VOICE fallback.

### 5.7 Hover translations missing on `audio_shadow` step
**Cause:** No `transcriptSegments` array in config.
**Fix:** Manually populate (see Pattern bonus), OR run admin "Translate All Dialogue" at `/admin/audio`. The route at `/api/translate/route.ts` now handles both `script_read` (line_N_vi) and `audio_shadow` (transcriptSegments).

### 5.8 SQL ERROR — `column l.subtitle does not exist`
**Cause:** `nursed_lessons` schema uses `title`, `title_vi`, `description`, `objective`, `stage` — no `subtitle`.
**Fix:** Use the right columns; verify with `SELECT column_name FROM information_schema.columns WHERE table_name = 'nursed_lessons'`.

### 5.9 Profile page crash on undefined reward
**Cause:** Orphaned `nursed_user_rewards` rows referenced deleted reward definitions.
**Fix:** Already in `lib/db/profile.ts` and `lib/db/rewards.ts` (null guards + correct alias `reward:nursed_rewards(*)`). Just be aware.

### 5.10 INSERT failing on multi-line JSON
**Cause:** Unescaped newline characters in JSON string literals inside SQL.
**Fix:** Use `\\n` (escaped) inside the JSON string literal that you pass via SQL. The Supabase MCP tool parses the SQL string before sending, so each `\n` must be `\\n`.

### 5.11 `drag_order` items misaligned with mouse pointer when dragging
**Cause:** Ancestor `transform` (animation) creates new containing block for `position: fixed` overlay.
**Fix:** Already fixed in `DragOrderStep.tsx` via `createPortal(DragOverlay, document.body)`. **No content fix needed.**

### 5.12 PowerShell `&&` not valid
**Cause:** Windows PowerShell uses `;` as command separator, not `&&`.
**Fix:** Use `;` in shell commands or run them sequentially.

### 5.13 Flashcards rendering BLANK (most common high-impact bug)
**Symptom:** All flashcards in a module show empty white rectangles. Affected M2 (34 of 70 cards), M3 (all 70), M4 (all 70) as of 2026-05-05.
**Cause:** DB cards stored as `{front, back}` but `FlashCardStep.tsx` reads only `card.front_en`/`card.back_vi` — silent failure.
**Audit query:**
```sql
SELECT mo.order_index AS m, COUNT(*) AS broken_cards
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
JOIN nursed_modules mo ON mo.id = l.module_id,
     jsonb_array_elements(COALESCE(ls.config->'cards','[]'::jsonb)) c
WHERE mo.course_id = '9113d5cb-cedb-4bea-9678-7321020230e8'
  AND ls.type = 'flash_card'
  AND c->>'front' IS NOT NULL
  AND c->>'front_en' IS NULL
GROUP BY mo.order_index ORDER BY mo.order_index;
```
**Fix (one-shot data normalization across the entire course):**
```sql
UPDATE nursed_lesson_steps ls
SET config = jsonb_set(
  config,
  '{cards}',
  (
    SELECT jsonb_agg(
      CASE
        WHEN c ? 'front_en' THEN c
        ELSE jsonb_build_object(
          'front_en', c->>'front',
          'back_vi',  c->>'back'
        ) || (CASE WHEN c ? 'audio_url' THEN jsonb_build_object('audio_url', c->>'audio_url') ELSE '{}'::jsonb END)
      END
    )
    FROM jsonb_array_elements(ls.config->'cards') c
  )
)
WHERE ls.type = 'flash_card'
  AND EXISTS (
    SELECT 1 FROM jsonb_array_elements(ls.config->'cards') c
    WHERE c->>'front' IS NOT NULL AND c->>'front_en' IS NULL
  );
```
Run the audit query again afterwards — must return 0 rows. **Do this BEFORE starting any new module redesign so you're never carrying broken legacy data forward.**

### 5.14 `script_read` — Charge Nurse / multi-word nurse roles render on wrong side
**Symptom:** All bubbles in a 2-speaker dialogue appear on the left (nurse side); no visual distinction between speakers.
**Cause:** Role parser matches on the substring "Nurse". Labels like `Charge Nurse:`, `Senior Nurse:`, `Sister:` get classified as nurse-side.
**Real example:** M5 L1 step 7 (`5d385eeb-36ab-4e59-9685-09e7d18cf881`) — both `Nurse:` and `Charge Nurse:` rendered left.
**Fix paths:**
1. **Quick content fix:** Rewrite the partner role label to `Doctor:` or another non-Nurse label that's still clinically accurate.
2. **Proper code fix:** Update `ScriptReadStep.tsx` role classifier so that **only `^Nurse:`** (the lone speaker we treat as "self") goes left; everything else (including `Charge Nurse:`, `Doctor:`, `Family:`, `Patient:`, `Passerby:`) goes right. Apply the same logic in any sibling parsers.
**Until the code fix lands:** Always do a visual smoke check on every script_read you create/edit.

### 5.15 Cloze with multi-sentence "blanks" or only 1 blank (Agent Y M5 regression)
**Symptom:** A `clozeText` like `"Doctor, [this is Nurse Lan. I am calling about Mr. Ahmed in Bed 7]?"` renders as one giant 50-char input box that nobody can fill in. OR the step has only 1 blank total — not a real exercise.
**Cause:** Author forgot the rule that brackets should wrap a single missing word/short phrase, not an entire sentence.
**Fix:** Each blank ≤ 2 words; 5–7 blanks per step. Pull blanks from the lesson's vocabulary (so flash_card → cloze → matching reinforce the same words).
**Audit query:**
```sql
SELECT l.order_index AS lesson_n, ls.id, ls.title,
       length(regexp_replace(ls.config->>'clozeText', '[^\[]', '', 'g')) AS bracket_count,
       length(ls.config->>'clozeText') AS text_len
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'cloze';
```
A healthy cloze has `bracket_count >= 5` (≥ 5 opening brackets = ≥ 5 blanks). Rewrite anything below 5 blanks.

### 5.16 Empty `recording_submit` stubs (Agent Y M5 left 4 of these)
**Symptom:** Step has type `recording_submit` but `prompt`, `instructions`, `transcript`, `script` are all NULL — just an empty record button.
**Cause:** Pattern carryover from old curriculum where each lesson had a generic "submit your recording" closer; redundant with `script_read`'s record phase and with productive `no_script` cue practice.
**Fix:** Replace with an interactive step (`quick_response`, `sentence_builder`, `spot_the_mistake`, `odd_one_out`) using the lesson's vocabulary. For L8 (assessment): keep the `recording_submit` but populate it with full content per §4.7.
**Audit query:** see §8.11.

### 5.17 `no_script` cue↔script length mismatch (recurring regression)
**Symptom:** Component shows N cues but only M model phrases (M ≠ N), so cues 2–N have no matching example.
**Cause:** Author writes 6 cues but provides a `script` with 4 nurse lines (or vice versa). Agent Y hit this 3 times in M5 round 1.
**Fix:** Hard requirement — `cues.length === script.split('\n').length`, AND every script line must start with `Nurse:`. See Pattern 6.
**Always run §8 verification after authoring a no_script step.**

### 5.18 Admin audio batch silently skips `script_read` steps (FIXED in code, document for awareness)
**Symptom:** `/admin/audio` shows "all done" but `script_read` steps still have no `line_N_audioUrl` values.
**Cause:** The batch UI's `useState<string[]>` default for `stepTypes` was `['scenario_intro', 'audio_shadow']` — `script_read` was missing from the default selection.
**Fix:** Already patched in `apps/med/app/admin/audio/page.tsx` to `['scenario_intro', 'audio_shadow', 'script_read']` as of 2026-05-05. If you're working on an older branch, check that line. After running batch, query `script_read` steps for missing `line_N_audioUrl` keys to confirm.

### 5.19 `fish.audio: Reference not found` for non-nurse voice lines (PROD ENV BUG)
**Symptom:** Audio batch generates ~65% of files successfully (all nurse lines) but ~35% fail with "Reference not found" (all patient/family/passerby lines). Hit by the user during M5 audio gen — 101 errors out of 289 attempted.
**Cause:** `FISH_AUDIO_VOICE_PATIENT` env var was missing entirely from Vercel production env. Code with old `??` fallback passed an empty string to fish.audio, which rejects it as "Reference not found".
**Fixes (apply both):**
1. **Env:** In Vercel project `med` → Settings → Environment Variables → Production, add `FISH_AUDIO_VOICE_PATIENT` with the nurse voice ID (or a valid second voice). Quick CLI: `cd apps/med && echo "<voice-id>" | vercel env add FISH_AUDIO_VOICE_PATIENT production`.
2. **Code:** Already fixed locally — `app/api/audio/{batch,generate}/route.ts` now uses `||` not `??`, and explicitly maps Family/Passerby/Bystander/Parent/Child → PATIENT_VOICE → falls back to NURSE_VOICE. Ensure these changes are merged into the `nursemed` branch before next prod deploy.
3. **Local dev workaround:** `.env.local` should set `FISH_AUDIO_VOICE_PATIENT=<nurse-voice-id>` so local audio generation works without depending on prod env.

---

## §6. MODULE 2 — STEP-BY-STEP PLAN

**Module:** "Triage Intake" (`module_id = 03129928-703a-4777-b32e-640b50fda67e`)

### 6.0 Pre-flight: snapshot the current state

Before any DELETE/UPDATE, back up M2 to a JSON file:

```sql
SELECT jsonb_agg(jsonb_build_object(
  'lesson_n', l.order_index, 'lesson', l.title,
  's_n', ls.order_index, 'id', ls.id, 'type', ls.type,
  'title', ls.title, 'config', ls.config
) ORDER BY l.order_index, ls.order_index) AS backup
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '03129928-703a-4777-b32e-640b50fda67e';
```

Save the result to `apps/med/.tmp/module2-backup-YYYYMMDD.json`.

### 6.1 Module 2 current state inventory (preserve this)

#### L1 "Asking the right questions" (lesson_id `6c532f17-43e9-4cca-bf48-1652a25a4e75`)
- `s_n=1` `scenario_intro` id=`294c405d-83cb-459a-9e35-1581c3e81086` "Scenario: Triage Desk" → **PRESERVE**
- `s_n=2` `audio_shadow` id=`9e0a854f-ed80-41ce-b649-ea86b7c71a5a` "Listen: Triage assessment" → **PRESERVE script + audio**, ADD `transcriptSegments` if missing
- `s_n=3` `video` id=`9ba3f577-48dd-428f-8310-3cf2b5e2b376` "Read the triage dialogue" → **PRESERVE** (animation bound)
- `s_n=4` `quiz` id=`93b5c21f-...` "Recognition check" → REPLACE OR REUSE
- `s_n=5` `quiz` id=`199b7da1-...` "Comprehension Check" → likely empty/duplicate, INSPECT
- `s_n=6` `cloze` id=`8ad1edad-...` "Fill in the Blanks" → Convert to `[answer]` bracket format if underscore

**Add to L1:**
- New `s_n=2` `flash_card` "Vocabulary preview: Triage opening questions" (6 cards)
- New `s_n=6` `script_read` "Read the dialogue aloud" (use the L1 audio_shadow transcript as the script)
- New `s_n=8` `matching` "Match: Triage opening vocabulary" (6 pairs)
- Re-order existing steps to fit the L1 template (see §2)

#### L2 "Describing symptoms" (lesson_id `2a4a2b3c-ed62-4052-93a5-da93f25ee231`)
**Many duplicate "Comprehension Check" + "Fill in the Blanks" steps already.** Inspect and clean up. The agent should:
- ADD `s_n=0` warm-up review (4 cards from M1 + L1)
- KEEP `audio_shadow` and primary `video`
- ADD `flash_card` vocab preview
- KEEP one `cloze` (convert format) and one `quiz`
- ADD `script_read`
- ADD `matching` as last step

#### L3 "The triage sequence in order" (lesson_id `843d9362-dbc4-4859-b248-5fe23acf0e3c`)
Currently 3 steps: `audio_shadow`, `cloze`, `quiz`. Sparse — needs full template fill.

#### L4 "A different presentation" (lesson_id `09200f06-17e7-4116-bfa8-0ca6578db90c`)
Has `scenario_intro`, `audio_shadow`, `video`, `cloze`, `quiz`, `cloze` (duplicate). Clean up duplicates and add the standard template steps.

#### L5 "Your turn to ask the questions" (lesson_id `22cb2740-3080-4723-9661-013b80e02220`)
Has `audio_shadow`, `cloze`, `no_script`, `recording_submit`. Add warm-up, flash_card, script_read, matching. Inspect `no_script` — it likely needs explicit `ownScript` per Pattern 6.

#### L6 "Pair triage — round 1" (lesson_id `fabdfb93-9718-45fb-bfa7-5ca803cb57ec`)
Has 8 steps with many duplicate "Comprehension Check" + "Fill in the Blanks". Heavy clean-up needed. Add warm-up, flash_card, script_read, matching.

#### L7 "Triage challenge" (lesson_id `df2bbf7d-9fef-473c-afee-a377b454e948`)
Currently 3 steps: `no_script`, `recording_submit`, `mission`. Needs a full L7 build per template.

#### L8 "Triage assessment" (lesson_id `91279571-3ace-4a32-865c-50b53804f6e5`)
Currently 5 steps: 2× `quiz`, `cloze`, `recording_submit`, `self_reflection`. **Add `spot_the_mistake` (Part B), `drag_order` (Part D2), `matching` (Part F, 8 cumulative pairs)**.

### 6.2 SQL execution pattern (apply to every lesson)

```sql
-- Step 1: Open transaction-style sequence (all in one MCP call)
-- Step 2: Read existing steps for this lesson
SELECT order_index, type, title, id FROM nursed_lesson_steps
WHERE lesson_id = '<lesson_id>' ORDER BY order_index;

-- Step 3: Move all existing order_index to negative space to free them
UPDATE nursed_lesson_steps SET order_index = -1 - order_index
WHERE lesson_id = '<lesson_id>';

-- Step 4: Re-assign each existing step to its new positive order_index
UPDATE nursed_lesson_steps SET order_index = 1 WHERE id = '<existing_id_for_position_1>';
UPDATE nursed_lesson_steps SET order_index = 4 WHERE id = '<existing_id_for_position_4>';
-- ...

-- Step 5: INSERT new flash_card / script_read / matching steps with the freed positions
INSERT INTO nursed_lesson_steps (lesson_id, order_index, type, title, config)
VALUES ('<lesson_id>', 0, 'flash_card', 'Warm-up review: from earlier lessons', '{...}'::jsonb);

-- Step 6: DELETE truly-empty placeholder steps (only after verifying no submissions exist)
DELETE FROM nursed_lesson_steps WHERE id = '<empty_step_id>';
```

**Why move to negative space first?** `order_index` has no unique constraint, but the UI relies on uniqueness. Doing all UPDATEs in negative space avoids "duplicate order_index" race-condition during reordering.

### 6.3 Module 2 vocabulary suggestions (DRAFT)

These avoid duplication with M1 (see §9 master list). Adapt to actual content of each L2 audio_shadow/video.

**L1 — Triage opening questions:**
- "What brings you in today?" → "Hôm nay bạn đến vì lý do gì?"
- "How long has this been happening?" → "Việc này đã xảy ra bao lâu rồi?"
- "On a scale of 0 to 10, how bad is the pain?" → "Trên thang 0 đến 10, đau đến mức nào?"
- "Have you taken any medication?" → "Bạn đã uống thuốc gì chưa?"
- "Is this the first time?" → "Đây có phải lần đầu không?"
- "Are you allergic to anything?" → "Bạn có bị dị ứng với gì không?"

**L2 — Describing symptoms:**
- "It feels sharp." / "It feels dull." / "It comes and goes."
- "I am nauseous." / "I am sweating." / "I feel weak."

**L3 — Triage sequence:**
- "First, I will…" / "Then I need to…" / "After that…"
- "Wait here, please." / "Follow me." / "Sit on the bed."

**L4 — Back injury / different presentation:**
- "Where did you fall?" / "Did you hit your head?"
- "Can you stand up?" / "Can you bend forward?"
- "Show me where it hurts."

**L5 — Your turn to ask:**
- Open phrasing variants — let the agent draft based on actual L5 audio.

**L6 — Pair triage:**
- "Let's check together." / "I will help you fill this out."
- Actually new phrases that pair partners need.

**L7 — Triage challenge:**
- "I will need more information." / "I am going to ask the doctor."

The agent should query the actual L1–L7 transcripts and choose 6 phrases per lesson that genuinely appear in or relate to the script.

---

## §7. GENERIC TEMPLATE FOR MODULES 3–12

The same blueprint applies. For each module:

### 7.1 Inputs you need
1. The module's UUID (use the lookup table below)
2. List of all 8 lessons in that module (already in §0 of this doc, derived from earlier query)
3. The current state of every step in every lesson (use the SQL in §6.0)

### 7.2 Module UUID lookup
| M# | Title | Module ID |
|----|-------|-----------|
| 2 | Triage Intake | `03129928-703a-4777-b32e-640b50fda67e` |
| 3 | Immediate Instructions in Emergencies | `4b3b4d56-051c-4811-b277-432a1dec02d5` |
| 4 | Common Emergency Scenarios | `21e4261a-1262-40b0-a127-7996fd912502` |
| 5 | Communicating Patient Deterioration & Escalation Protocols | `f6499b7e-961b-46c7-8c90-ce7c5ead7115` |
| 6 | Reassurance Under Pressure | `26535094-0926-4787-8c98-66afb0640051` |
| 7 | Red Flags & Escalation | `9ca8fd8d-10a5-4131-9f13-56144b938a8d` |
| 8 | Documentation and Rapid Reporting | `f6435350-43d2-4ee4-a749-8523744ad8a7` |
| 9 | Simulation and Emergency Review | `3c3d30a2-3c0f-4f4e-8ff0-593eedc2370c` |
| 10 | Emergency Procedures Communication | `8cf9b3c0-1596-484b-923a-aaf41629a40c` |
| 11 | Trauma & Acute Injuries | `04ba2139-65d1-450b-8721-7d6edbe56455` |
| 12 | Family Communication in Emergencies | `07174243-2f51-4d1d-bfb1-4756cb2cfff7` |

### 7.3 Per-module workflow

For each module M:
1. **Backup** current state (§6.0 SQL adapted for that module's UUID).
2. **For each lesson L (1 → 8)**:
   a. Query existing steps & their configs.
   b. Identify which steps to PRESERVE (`scenario_intro`, `audio_shadow`, `video`, `script_read` with audio).
   c. Identify which steps to UPDATE (cloze → bracket format, quiz → fix `text_en`, etc.).
   d. Identify which steps to DELETE (duplicate "Comprehension Check", empty placeholders).
   e. Identify which NEW steps to INSERT (warm-up review, vocab preview, script_read if missing, matching).
   f. Reorder via negative-space technique.
   g. Run audio batch + dialogue translation in admin to fill missing audio + transcriptSegments.
3. **Verify** with §8 QA queries.
4. **Update** the cumulative module vocabulary tracking file (`apps/med/.tmp/vocab-master.json`).

### 7.4 Cumulative warm-up rule across modules

Module N's warm-up cards (4 per lesson L2–L7) should pull:
- 1 card from a random earlier module (any of 1 through N-1)
- 3 cards from earlier lessons of the **same module** (L1–L<L-1>)

For Module 2 specifically, since it's the first to apply this rule, all warm-ups draw from M1 + earlier M2 lessons (see §3 Pattern 2 distribution).

---

## §8. QA CHECKLIST + VERIFICATION SQL

After completing each lesson, run these to confirm the work is sound.

### 8.1 Each lesson L1–L7 must have these required step types

```sql
SELECT
  l.order_index AS lesson,
  bool_or(ls.type = 'flash_card' AND ls.title LIKE 'Warm-up%') AS has_warmup,
  bool_or(ls.type = 'flash_card' AND ls.title LIKE 'Vocabulary preview%') AS has_vocab,
  bool_or(ls.type = 'script_read') AS has_script_read,
  bool_or(ls.type = 'matching')   AS has_matching,
  count(*) FILTER (WHERE ls.type = 'flash_card') AS flash_card_count,
  count(*) AS total_steps
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>'
GROUP BY l.order_index
ORDER BY l.order_index;
```

**Expected:**
- L1: `has_warmup=false` (L1 of any module never has a warm-up review), `has_vocab=true`, `has_script_read=true`, `has_matching=true`, `flash_card_count >= 1`.
- L2–L7: `has_warmup=true`, `has_vocab=true`, `has_script_read=true`, `has_matching=true`, `flash_card_count >= 2`.
- L8: assessment-only — different rules, no flashcards.

### 8.2 Every cloze uses bracket format (no leftover underscore field)

```sql
SELECT l.order_index AS lesson, ls.id, ls.title,
       (ls.config ? 'cloze') AS has_old_field,
       (ls.config ? 'clozeText') AS has_new_field
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'cloze';
```
Every row must have `has_old_field = false` and `has_new_field = true`.

### 8.3 Every quick_response uses `text_en` (not `text`)

```sql
SELECT l.order_index AS lesson, ls.id, ls.title,
       (ls.config->'options'->0 ? 'text_en') AS option_has_text_en,
       (ls.config->'options'->0 ? 'text')    AS option_has_old_text
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'quick_response';
```
Every row must have `option_has_text_en = true`, `option_has_old_text = false`.

### 8.4 Every audio_shadow has transcriptSegments

```sql
SELECT l.order_index AS lesson, ls.id, ls.title,
       jsonb_array_length(coalesce(ls.config->'transcriptSegments', '[]'::jsonb)) AS seg_count
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'audio_shadow';
```
`seg_count > 0` for every row. Otherwise run `/admin/audio` → "Translate All Dialogue".

### 8.5 Every script_read has line_N_vi for every line

```sql
SELECT l.order_index AS lesson, ls.id, ls.title,
       array_length(string_to_array(ls.config->>'script', E'\n'), 1) AS script_lines,
       (SELECT count(*) FROM jsonb_object_keys(ls.config) k WHERE k LIKE 'line_%_vi') AS vi_keys
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'script_read';
```
`vi_keys >= script_lines`. If short, run `/admin/audio` → "Translate All Dialogue".

### 8.6 No order_index duplicates within a lesson

```sql
SELECT l.id AS lesson_id, l.title, ls.order_index, count(*)
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>'
GROUP BY l.id, l.title, ls.order_index
HAVING count(*) > 1;
```
Must return **0 rows**.

### 8.7 Final flash_card vs matching must use identical phrasing

```sql
WITH vocab AS (
  SELECT l.id AS lesson_id, jsonb_array_elements(ls.config->'cards') AS card
  FROM nursed_lesson_steps ls JOIN nursed_lessons l ON l.id = ls.lesson_id
  WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'flash_card' AND ls.title LIKE 'Vocabulary preview%'
), matchpairs AS (
  SELECT l.id AS lesson_id, jsonb_array_elements(ls.config->'pairs') AS pair
  FROM nursed_lesson_steps ls JOIN nursed_lessons l ON l.id = ls.lesson_id
  WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'matching' AND ls.title NOT LIKE 'Part F%'
)
SELECT v.lesson_id,
       (v.card->>'front_en') AS card_en,
       (m.pair->>'en')       AS pair_en
FROM vocab v
LEFT JOIN matchpairs m ON m.lesson_id = v.lesson_id AND m.pair->>'en' = v.card->>'front_en'
WHERE m.pair IS NULL;
```
Must return **0 rows** (every vocab card has a matching pair with identical EN text).

### 8.8 Step submissions safety check before DELETE

```sql
SELECT step_id, count(*) FROM nursed_submissions
WHERE step_id = '<step_to_delete>'
GROUP BY step_id;
```
Must return **0 rows** before deleting any step.

### 8.9 Verify no orphan submissions after restructure

```sql
SELECT s.id, s.step_id
FROM nursed_submissions s
LEFT JOIN nursed_lesson_steps ls ON ls.id = s.step_id
WHERE ls.id IS NULL
LIMIT 10;
```
Must return **0 rows**.

### 8.10 Flashcard schema is uniformly `front_en`/`back_vi` (no legacy `front`/`back`)

```sql
SELECT mo.order_index AS m, ls.id, ls.title,
       (SELECT count(*) FROM jsonb_array_elements(ls.config->'cards') c
        WHERE c->>'front' IS NOT NULL AND c->>'front_en' IS NULL) AS broken_cards
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
JOIN nursed_modules mo ON mo.id = l.module_id
WHERE mo.id = '<MODULE_UUID>' AND ls.type = 'flash_card'
HAVING (SELECT count(*) FROM jsonb_array_elements(ls.config->'cards') c
        WHERE c->>'front' IS NOT NULL AND c->>'front_en' IS NULL) > 0;
```
Must return **0 rows**. If not, run the normalisation SQL in §5.13.

### 8.11 No empty `recording_submit` stubs in L1–L7

```sql
SELECT l.order_index AS lesson_n, ls.id, ls.title
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>'
  AND ls.type = 'recording_submit'
  AND l.order_index < 8                          -- L8 (assessment) is allowed
  AND ls.config->>'prompt' IS NULL
  AND ls.config->>'prompt_en' IS NULL
  AND ls.config->>'instructions' IS NULL
  AND ls.config->>'transcript' IS NULL
  AND ls.config->>'script' IS NULL;
```
Must return **0 rows**. Otherwise replace those stubs with interactive steps per §4.7.

### 8.12 `script_read` role labels are parser-friendly (no Charge Nurse / Senior Nurse)

```sql
SELECT l.order_index AS lesson_n, ls.id, ls.title, ls.config->>'script' AS script
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>'
  AND ls.type = 'script_read'
  AND ls.config->>'script' ~ '(Charge Nurse:|Senior Nurse:|Head Nurse:|Sister:)';
```
Must return **0 rows** (or apply the visual-smoke-check workaround in §5.14 for each row found).

### 8.13 `cloze` blanks are reasonable (5+ per step, no multi-sentence brackets)

```sql
SELECT l.order_index AS lesson_n, ls.id, ls.title,
       (length(ls.config->>'clozeText') - length(replace(ls.config->>'clozeText', '[', ''))) AS blank_count,
       (SELECT max(length(m[1]))
        FROM regexp_matches(ls.config->>'clozeText', '\[([^\]]+)\]', 'g') m) AS longest_blank_chars
FROM nursed_lesson_steps ls
JOIN nursed_lessons l ON l.id = ls.lesson_id
WHERE l.module_id = '<MODULE_UUID>' AND ls.type = 'cloze';
```
Healthy row: `blank_count >= 5` AND `longest_blank_chars <= 25` (single word or 2-word phrase). Anything outside that range is broken — rewrite per §5.15.

---

## §9. VOCABULARY DE-DUPLICATION STRATEGY

### 9.1 Module 1 master vocabulary (already used — DO NOT repeat in M2)

| EN | VI | M1 lesson |
|----|-----|----------|
| emergency | cấp cứu | L1 |
| chest pain | đau ngực | L1 |
| I am here to help you. | Tôi ở đây để giúp bạn. | L1 |
| What happened? | Chuyện gì xảy ra? | L1 |
| Where does it hurt? | Đau ở đâu? | L1 |
| Please sit down. | Xin mời ngồi xuống. | L1 |
| stay calm | bình tĩnh | L2 |
| Can you hear me? | Bạn có thể nghe tôi không? | L2 |
| When did this start? | Điều này bắt đầu từ khi nào? | L2 |
| Stay still. | Ở yên. | L2 |
| I am going to check you now. | Tôi sẽ kiểm tra bạn ngay bây giờ. | L2 |
| I cannot breathe. | Tôi không thể thở. | L2 |
| Do not panic. | Đừng hoảng sợ. | L3 |
| Is he breathing? | Anh ấy còn thở không? | L3 |
| He fell. | Anh ấy bị ngã. | L3 |
| He is not moving. | Anh ấy không cử động. | L3 |
| Stay with him. | Hãy ở bên anh ấy. | L3 |
| Do not move him. | Đừng di chuyển anh ấy. | L3 |
| I am a nurse. | Tôi là điều dưỡng. | L4 |
| She fainted. | Cô ấy bị ngất. | L4 |
| Is she conscious? | Cô ấy còn tỉnh không? | L4 |
| Call reception! | Gọi tiếp tân! | L4 |
| We need a stretcher. | Chúng tôi cần một cáng. | L4 |
| Open your eyes. | Hãy mở mắt. | L4 |
| I feel dizzy. | Tôi cảm thấy chóng mặt. | L5 |
| I have you. | Tôi đỡ bạn rồi. | L5 |
| Do not worry. | Đừng lo lắng. | L5 |
| My head hurts. | Đầu tôi đau. | L5 |
| My stomach hurts. | Bụng tôi đau. | L5 |
| Tell me more. | Hãy kể cho tôi biết thêm. | L5 |
| My shoulder hurts. | Vai tôi đau. | L6 |
| Can you move your arm? | Bạn có thể cử động cánh tay không? | L6 |
| Does it hurt to move? | Cử động có đau không? | L6 |
| Is it broken? | Nó có bị gãy không? | L6 |
| Let us check together. | Hãy cùng kiểm tra. | L6 |
| I am with you. | Tôi ở bên bạn. | L6 |
| Are you the parent? | Bạn là phụ huynh phải không? | L7 |
| What is your child name? | Con bạn tên gì? | L7 |
| Show me where it hurts. | Hãy chỉ cho tôi chỗ đau. | L7 |
| You are safe now. | Con an toàn rồi. | L7 |
| Look at me. | Hãy nhìn tôi. | L7 |
| Everything will be okay. | Mọi thứ sẽ ổn thôi. | L7 |

**Total: 42 phrases.** Module 2 must introduce **42 distinct new phrases** (not copies).

### 9.2 Tracking new vocabulary

After completing each lesson, append the 6 vocab cards to `apps/med/.tmp/vocab-master.json` (create the file if it doesn't exist). Schema:

```json
[
  { "module": 1, "lesson": 1, "front_en": "emergency", "back_vi": "cấp cứu" },
  { "module": 1, "lesson": 1, "front_en": "chest pain", "back_vi": "đau ngực" },
  { "module": 2, "lesson": 1, "front_en": "What brings you in today?", "back_vi": "Hôm nay bạn đến vì lý do gì?" }
]
```

Before designing each new lesson's vocab, query this file and confirm none of your 6 new phrases match an existing `front_en`. Acceptable: small variants ("Stay calm" vs "Stay calm,") if the underlying meaning is reinforced, but prefer genuinely new phrases.

### 9.3 Acceptable repetition

- Warm-up reviews **must** repeat earlier vocab (that's the point).
- The L8 matching step (cumulative review) should pull from the lesson's own module — re-using existing phrases is correct.

---

## §10. EXECUTION ORDER FOR THE NEW AGENT

### 10.1 Pre-flight (do once, before touching any module)

1. Read this entire document end-to-end. Pay extra attention to §0 (current state), §4 (constraints), §5 (gotchas — all 19 of them), §12 (lessons from Agent Y).
2. Read `apps/med/components/learn/steps/{ScriptReadStep,FlashCardStep,MatchingStep,ClozeStep,QuickResponseStep,NoScriptStep,DragOrderStep,SentenceBuilderStep,SpotTheMistakeStep,QuickResponseStep,OddOneOutStep,RecordingStep}.tsx` for the public schema parts only.
3. **Cross-cutting fix:** Run the flashcard schema audit from §8.10 against the whole course. If broken cards exist anywhere, run the normalisation SQL from §5.13 in one pass. Re-audit and confirm 0 broken cards before proceeding. **Don't skip this** — every module you touch will have rendering bugs otherwise.
4. **Visual sanity check:** Open `http://localhost:3001/learn/courses/emergency-nursing-communication` and click through Module 1 lesson 1 → confirm flashcards, script_read, cloze, matching all render correctly. This is your reference for "what good looks like".
5. Confirm to the user that you've read the doc, completed the cross-cutting flashcard fix, and are ready to start Module 2.

### 10.2 Per-module workflow

For each module **in order: M2 → M3 → M4 → M6 → M7 → M8 → M9 → M10 → M11 → M12** (skip M1 done, M5 done):

1. **Backup** current state to `apps/med/.tmp/moduleN-backup-YYYYMMDD.json` (SQL in §6.0).
2. **For each lesson L (1 → 8)**:
   a. Query existing steps & their configs.
   b. Identify which steps to PRESERVE (`scenario_intro`, `audio_shadow`, `video`, `script_read` with audio).
   c. Identify which steps to UPDATE (cloze → bracket format with 5+ short blanks, quiz options → `text_en`, recording_submit → either populate or replace).
   d. Identify which steps to DELETE (only those with no submissions; verify with §8.8).
   e. Identify which NEW steps to INSERT (warm-up review for L2+, vocab preview, script_read if missing, matching at end).
   f. Reorder via the negative-space technique (§6.2).
   g. Run audio batch + dialogue translation in admin to fill missing audio + transcriptSegments.
3. **Run all §8 verification queries (8.1 – 8.13).** All must pass before claiming the module done.
4. **VISUAL SMOKE CHECK** — open `http://localhost:3001/learn/courses/emergency-nursing-communication/lessons/<each-lesson-slug>` for L1, L4, L7, L8 and step through them. Take screenshots if anything looks off. This catches what SQL doesn't — bubble alignment, blank cards, cloze rendering, missing speaker icons. **§8 verification passing without visual check is NOT enough — Agent Y's M5 §8 was all GREEN but had 4 visual bugs that only QA caught.**
5. **Update** `apps/med/.tmp/vocab-master.json` with all 6 vocab cards × 7 lessons.
6. **Checkpoint with the user** after every module completes. Do NOT batch multiple modules without approval. This is what allows the user to catch regressions early.

### 10.3 Reporting format per module

When you finish a module, produce a report with this exact structure:

```
## Module N — <title> — DONE

### §8 verification results
| Check | Result |
|---|---|
| 8.1 required step types | ✅ / details |
| 8.2 cloze bracket format | ✅ |
| 8.3 quick_response text_en | ✅ |
| 8.4 audio_shadow segments | ✅ |
| 8.5 script_read line_N_vi | ✅ |
| 8.6 no duplicate order_index | ✅ |
| 8.7 vocab ↔ matching identity | ✅ |
| 8.10 flashcard schema | ✅ 0 broken cards |
| 8.11 no empty recording_submit in L1-7 | ✅ |
| 8.12 script_read role labels | ✅ |
| 8.13 cloze blanks reasonable | ✅ |

### Visual smoke check (took 5-10 min in browser)
- L1: ☐ flashcards render ☐ script_read bubbles alternate ☐ cloze blanks fillable ☐ matching connects
- L4: same checks
- L7: same checks + ☐ mission step renders
- L8: ☐ no flashcards ☐ assessment recording is populated

### What I changed
- Lessons restructured: L1, L3, L7
- Steps inserted: 14 (4 warm-ups, 7 vocab previews, 7 matching, 7 script_read where missing)
- Steps deleted: 3 (duplicate Comprehension Checks)
- Steps replaced: 2 (empty recording_submit → quick_response)
- Existing scripts/audio/video preserved: ✅

### Vocab added (count of new phrases not duplicating M1+ earlier modules)
42 phrases. Updated vocab-master.json.

### Audio status
- script_read steps with audio: X / Y
- audio_shadow steps with transcriptSegments: X / Y
- If audio missing: ran /admin/audio batch on date YYYY-MM-DD; X files generated, Y errors (list errors if any)

### Open questions / blockers
(none / list)
```

7. At the very end of M12, update `HANDOVER_NurseEd_ORCHESTRATOR_AGENT.md` with a single session log entry summarising what shipped.

---

## §11. WHEN IN DOUBT — ASK THE USER

These are the moments to stop and ask:
- A `script` or `transcript` looks very long and you want to shorten it (animation may break).
- An existing step has multiple matching submissions — deletion would orphan user data.
- The vocabulary master list has run out of "natural" emergency phrases for the lesson topic — clarify whether to repurpose, paraphrase, or expand scope.
- The user has not provided enough context about a specific lesson's clinical purpose to write good cues.

---

---

## §12. LESSONS LEARNED FROM AGENT Y'S M5 ROUND (calibration data)

Agent Y took on M2–M5 with this same handover doc. They completed M5 well structurally but introduced 4 categories of regression that this revision of the doc now guards against. Read these so you don't repeat them.

### 12.1 What Agent Y did well ✅
- Followed the M1 blueprint structure precisely (warm-up at order_index=0, vocab preview, productive practice in correct order, matching at end).
- Wrote real clinical-accurate English/Vietnamese vocabulary tied to the M5 escalation theme (sepsis, ACS, deteriorating consciousness, respiratory escalation).
- Maintained 6-card vocab previews and 6-pair matching (8 in L8).
- Ran §8.1–8.7 verifications and accurately reported them as GREEN.
- Did not touch existing scripts, audio URLs, video URLs, or animations.
- Backed up the module before changes (apps/med/.tmp/module5-backup-*.json).
- After we caught the no_script length mismatch in round 1, fixed all 3 instances cleanly in round 2 with 6-cue/6-line scripts that read as natural ISBAR escalation dialogue.

### 12.2 What Agent Y missed (caught by user QA, not by §8 queries) 🟡

| Bug | Why §8 missed it | Now guarded by |
|---|---|---|
| All M5 warm-ups initially pulled only from the immediate previous lesson, not scattered cumulatively | §8 had no scatter check | Pattern 2 SCATTERING RULE callout |
| `no_script` cue=6 / script=4 mismatch in 3 lessons (round 1) | §8 didn't compare cue_count to script_lines | §8 was extended; §5.17 emphasises always-run |
| Wrote cue cards in M5 L8 even though spec said no flashcards (acceptable deviation per user) | Spec didn't enforce; user accepted | Documented as acceptable in §1 |
| Used `front_en`/`back_vi` in M5 (correct!) but didn't notice that M3/M4 had legacy `front`/`back` and so 140 cards across two prior modules were silently broken | M5 work didn't touch M3/M4 | §0 cross-cutting fix; §8.10 audit; §5.13 normalisation SQL |
| Left 4 empty `recording_submit` stubs in M5 L5/L6/L7/L8 with no prompt/script/instructions | §8 didn't check recording_submit population | §4.7 ban; §8.11 audit |
| Wrote M5 L1 step 7 script with `Charge Nurse:` partner — both bubbles render on the left | §8 didn't check role labels | §5.14 documented; §8.12 audit; visual smoke check requirement |
| Wrote M5 L1 step 6 cloze with 3 multi-sentence "blanks" and L3 step 5 cloze with 1 blank covering the entire dialogue | §8.2 only checked format, not blank quality | §5.15 documented; §8.13 audit |
| Reported "audio batch all done" while script_read steps had no audio | The admin UI silently excluded script_read from default selection | §5.18 documented; admin UI fix already shipped |
| Reported "audio blocked because env vars missing" when actually the env vars were partially set (NURSE present, PATIENT missing) and 65% of files would generate fine | Agent Y didn't try the batch run with what was available | §5.19 documented; §10.2 step 6 requires actually running audio gen and reporting numbers |

### 12.3 Process corrections

1. **§8 SQL is necessary but not sufficient.** Always do a visual smoke check after §8 passes (added to §10.2 step 4). 5–10 min of clicking through L1/L4/L7/L8 in the dev server will catch what queries miss.

2. **Don't trust any module's existing data.** Before redesigning Module N, audit it against §8.10–8.13 and fix any cross-cutting bugs first. Otherwise you're polishing on top of broken foundations.

3. **Report numbers, not adjectives.** "All audio generated" → instead say "232 / 289 audio files generated; 57 errors all on patient lines, see attached error list". This lets the orchestrator/user diagnose.

4. **Prefer one checkpoint per module over batching multiple.** Even though "M2 → M5 in one go" feels faster, the user catches systemic bugs faster when you stop after each module. Agent Y's M5 had 4 bugs that, if applied to M2/M3/M4 first, would have meant 16 bugs to fix instead of 4.

5. **When the user gives an explicit constraint (e.g., "no flashcards in L8"), document the deviation if you choose to break it.** Agent Y added L8 warm-up cards in M5 — fine, the user accepted, but they should have flagged it in their report. Pre-flag deviations.

---

**End of HANDOVER Y.** Estimated effort: ~4 hours per module for an experienced agent following this spec carefully. After the cross-cutting flashcard fix (~30 min), the remaining 10 modules should take roughly 35–40 hours of careful work spread across multiple sessions/agents.

The user prefers one-module-at-a-time checkpoints. Don't batch ahead.
