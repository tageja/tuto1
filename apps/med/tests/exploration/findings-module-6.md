# Module 6 — Exploration findings (Reassuring Under Pressure) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 6 **Reassuring Under Pressure**  
**Module slug:** `reassurance-under-pressure` (`order_index` 6)  
**Module ID:** `26535094-0926-4787-8c98-66afb0640051`  
**Lesson 1 slug:** `calming-a-panicking-patient-in-ae`  
**URL:** https://pro.tuto.asia · **Account:** test-m6@test.com / password (M1–M5 seeded, 40 lessons)

## Curriculum snapshot (Supabase)

| # | Lesson slug | Step types |
|---|-------------|------------|
| 1 | calming-a-panicking-patient-in-ae | scenario_intro, flash_card, audio_shadow, video, quiz, cloze, script_read, matching |
| 2 | anxious-family-at-icu-doors | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 3 | patient-refusing-treatment-during-emergency | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 4 | de-escalating-a-distressed-relative | flash_card, scenario_intro, audio_shadow, flash_card, video, cloze, script_read, matching |
| 5 | reassuring-a-childs-parent-in-paediatric-ed | flash_card, audio_shadow, flash_card, video, cloze, no_script, script_read, recording_submit, matching |
| 6 | pair-practice-calming-a-confused-elderly-patient | flash_card, video, flash_card, script_read, cloze, no_script, recording_submit, matching |
| 7 | pair-practice-managing-family-demanding-answers | flash_card, video, flash_card, no_script, recording_submit, cloze, mission, matching |
| 8 | module-assessment-reassurance-self-reflection | quiz, spot_the_mistake, cloze, drag_order, recording_submit, matching, self_reflection |

No authoring gaps (full step ladders on all lessons).

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #066 | L7 empty `missionEn`/`missionVi` | `fix-m6-l7-mission-copy.mjs` |
| Course | 7× assessment `drag_order` had `items[]` but empty `lines[]` (UI reads `lines`) | `fix-drag-order-lines-from-items.mjs` |

## Course-wide backfill specs (new)

| ID | Guard |
|----|-------|
| 63 | All `quick_response` → `options[].text_en` |
| 64 | All `sentence_builder` → `chunks` + `correct_order` (≥3 chunks) |
| 65 | All `drag_order` → ≥3 lines (`lines` or `items`+`correct_order`) |

## M6 regression specs (066–075)

Standard DB hygiene: mission, blueprint, flash_card, recording_submit, auth, cloze, quiz, nurse roles, audio_shadow, matching.

## L1 cloze (happy-path)

`understand`, `frightened`, `everything`, `calm`, `properly`, `update`, `trust`

## Deferred

- [ ] Headed walk **test-m6@test.com** through L4–L8 (`spot_the_mistake`, `drag_order`, `self_reflection`).
- [ ] L1 happy-path on prod (fixme until FlashCard UI aligned).
