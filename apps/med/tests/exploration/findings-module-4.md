# Module 4 — Exploration findings (Common Emergency Scenarios) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 4 **Common Emergency Scenarios** (`/learn/courses/emergency-nursing-communication/modules/common-emergency-scenarios`) — all 8 lessons  
**Module slug:** `common-emergency-scenarios` (`order_index` 4)  
**Lesson 1 slug:** `chest-pain-and-breathing-emergencies`  
**Baseline URL:** https://pro.tuto.asia · **Account:** test-m4@test.com / password (M1+M2+M3 pre-seeded, 24 lessons — do not mutate progress) · **DB specs:** Supabase service role via `.env.local`

## Snapshot from live curriculum (Supabase)

| # | Lesson slug | Representative step types |
|---|-------------|---------------------------|
| 1 | chest-pain-and-breathing-emergencies | scenario_intro, flash_card, audio_shadow, video, quiz, cloze, script_read, matching |
| 2 | bleeding-and-trauma | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 3 | fainting-fever-and-severe-pain | flash_card, audio_shadow, flash_card, cloze, script_read, quiz, matching |
| 4 | a-complex-scenario-two-problems-at-once | flash_card, scenario_intro, flash_card, audio_shadow, video, cloze, script_read, matching |
| 5 | respond-to-the-scenario | flash_card, audio_shadow, flash_card, cloze, script_read, no_script, recording_submit, matching |
| 6 | pair-scenario-practice-round-1 | flash_card, video, flash_card, cloze, script_read, no_script, recording_submit, matching |
| 7 | mixed-emergency-challenge | flash_card ×2, script_read, no_script, recording_submit, matching, **mission** |
| 8 | common-scenarios-assessment | flash_card, quick_response, quiz ×2, cloze, recording_submit, self_reflection, matching |

## Tests codified this session

| Goal | Spec |
|------|------|
| `@auth @module-4` | `regression/bug-047-m4-unauthenticated-m4-lesson-access.spec.ts` |
| `@happy-path @module-4` (L1 → script_read) | `module-04-common-emergency-scenarios/lesson-1-happy-path.spec.ts` |
| DB curriculum L2–L8 | `regression/bug-044-m4-lessons-l2-through-l8-db-curriculum.spec.ts` |
| L7 mission canonical copy | `regression/bug-043-m4-lesson7-mission-missing-canonical-copy.spec.ts` |

Shared flow: `tests/e2e/_shared/emergency-m4-l1-flow.ts`  
Shared linter: `tests/e2e/_shared/m4-common-emergency-scenarios-linter.ts`

## Critical / Major — content (REAL_BUG)

- [x] **L7 `mixed-emergency-challenge` mission step** — empty `missionEn` / `missionVi` before fix (same class as M2 #024, M3 #033). **Fix:** `tests/scripts/fix-m4-l7-mission-copy.mjs`. Regression: **bug-043**.

## Minor / deferred

- [ ] Headed walk L2–L8 with **test-m4@test.com** (recording_submit, mission UI, self_reflection, quick_response).
- [ ] Prod L1 happy path fixme until FlashCard + auth stable on pro.tuto.asia.

## Regression specs (bug-043–052)

| ID | Finding | Spec |
|----|---------|------|
| 43 | L7 mission canonical copy | `bug-043-m4-lesson7-mission-missing-canonical-copy.spec.ts` |
| 44 | L2–L8 step ladders + L8 quick_response `text_en` | `bug-044-m4-lessons-l2-through-l8-db-curriculum.spec.ts` |
| 45 | flash_card `front_en` / `back_vi` | `bug-045-m4-flash-card-canonical-fields.spec.ts` |
| 46 | recording_submit prompts | `bug-046-m4-recording-submit-prompt.spec.ts` |
| 47 | Unauthenticated deep link | `bug-047-m4-unauthenticated-m4-lesson-access.spec.ts` |
| 48 | cloze word bank | `bug-048-m4-cloze-word-bank-coherent.spec.ts` |
| 49 | quiz MCQ | `bug-049-m4-quiz-options-and-answers.spec.ts` |
| 50 | script_read nurse lines | `bug-050-m4-script-read-nurse-lines.spec.ts` |
| 51 | audio_shadow transcripts | `bug-051-m4-audio-shadow-transcripts.spec.ts` |
| 52 | matching pairs | `bug-052-m4-matching-pairs-nonempty.spec.ts` |

## Scripts

| Path | Purpose |
|------|---------|
| `tests/scripts/fix-m4-l7-mission-copy.mjs` | Populate L7 mission EN/VI (step `92aabcc2-fbf8-4efd-9062-58d62ceaa0ae`) |

## L1 cloze bracket answers (happy-path)

`you hear me`, `having chest pain`, `did this start`, `arm or jaw`
