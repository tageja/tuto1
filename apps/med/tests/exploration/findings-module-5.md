# Module 5 — Exploration findings (Deterioration & Escalation) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 5 **Communicating Patient Deterioration & Escalation Protocols**  
**Module slug:** `communicating-patient-deterioration-escalation-protocols` (`order_index` 5)  
**Module ID:** `f6499b7e-961b-46c7-8c90-ce7c5ead7115`  
**Lesson 1 slug:** `vital-signs-in-crisis-what-the-numbers-mean`  
**URL:** https://pro.tuto.asia · **Account:** test-m5@test.com / password (M1–M4 seeded, 32 lessons — do not mutate progress)

## Curriculum snapshot (Supabase live DB)

| # | Lesson slug | Step types |
|---|-------------|------------|
| 1 | vital-signs-in-crisis-what-the-numbers-mean | scenario_intro, flash_card, audio_shadow, video, quiz, cloze, script_read, matching |
| 2 | key-phrases-in-action-red-flags-urgency | flash_card, audio_shadow, flash_card, script_read, quiz, matching *(no video/cloze — authoring)* |
| 3 | understanding-the-situation-sbar-in-practice | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 4 | a-second-scenario-respiratory-deterioration | flash_card, scenario_intro, flash_card, audio_shadow, video, cloze, script_read, matching |
| 5 | your-turn-to-speak-open-deterioration-scenario | flash_card, audio_shadow, flash_card, video, script_read, no_script, quick_response, matching |
| 6 | pair-practice-round-1-structured-sbar-handover | flash_card, video, flash_card, cloze, script_read, no_script, spot_the_mistake, matching *(no recording_submit — authoring)* |
| 7 | pair-practice-round-2-responding-to-family-anxiety | flash_card ×2, script_read, no_script, sentence_builder, matching, mission |
| 8 | module-assessment-mixed-input-self-reflection | flash_card, quick_response, quiz, cloze, recording_submit, self_reflection, matching *(one quiz — authoring)* |

## Critical / Major — content (REAL_BUG, fixed this session)

- [x] **L7 mission** — empty `missionEn`/`missionVi` in DB (seed used `mission_en` only). **Fix:** `tests/scripts/fix-m5-l7-mission-copy.mjs`. Regression: **bug-053**.
- [x] **L1 script_read + audio_shadow** — speaker lines used `Charge Nurse:` (multi-word role → both bubbles left). **Fix:** `tests/scripts/fix-m5-l1-single-word-nurse-roles.mjs` (`Charge Nurse:` → `Lead:`). Regression: **bug-060**.

## In-progress authoring (NOT bugs)

- L2 missing video + cloze
- L6 missing recording_submit
- L8 single quiz (not two)

## Regression specs (bug-053–062)

| ID | Area | Spec |
|----|------|------|
| 53 | L7 mission copy | `bug-053-m5-lesson7-mission-missing-canonical-copy.spec.ts` |
| 54 | L2–L8 blueprint + L8 quick_response `text_en` | `bug-054-m5-lessons-l2-through-l8-db-curriculum.spec.ts` |
| 55 | flash_card `front_en`/`back_vi` | `bug-055-m5-flash-card-canonical-fields.spec.ts` |
| 56 | recording_submit prompts (L8) | `bug-056-m5-recording-submit-prompt.spec.ts` |
| 57 | Auth deep link | `bug-057-m5-unauthenticated-m5-lesson-access.spec.ts` |
| 58 | cloze word bank | `bug-058-m5-cloze-word-bank-coherent.spec.ts` |
| 59 | quiz MCQ | `bug-059-m5-quiz-options-and-answers.spec.ts` |
| 60 | single-word nurse roles | `bug-060-m5-script-read-single-word-nurse-roles.spec.ts` |
| 61 | audio_shadow transcripts | `bug-061-m5-audio-shadow-transcripts.spec.ts` |
| 62 | matching `left_en`/`right_vi` | `bug-062-m5-matching-pairs-nonempty.spec.ts` |

## L1 cloze bracket answers (happy-path)

`report`, `concern`, `dropped`, `115`, `conscious`, `unwell`

## Deferred

- [ ] Headed walk **test-m5@test.com** through L2–L8 (quick_response, sentence_builder, spot_the_mistake, self_reflection).
- [ ] L1 happy-path on prod (fixme until FlashCard UI aligned).
