# Module 8 — Exploration findings (Documentation & Rapid Reporting) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 8 **Ghi chép và Báo cáo Nhanh**  
**Module slug:** `documentation-and-rapid-reporting` (`order_index` 8)  
**Lesson 1 slug:** `end-of-shift-handover-to-incoming-nurse`  
**URL:** https://pro.tuto.asia · **Account:** test-m8@test.com / password (M1–M7 complete, 56 lessons)

## Curriculum snapshot (Supabase)

| # | Lesson slug | Steps | Notes |
|---|-------------|-------|-------|
| 1 | end-of-shift-handover-to-incoming-nurse | 7 | **IN-PROGRESS** — no `video`; `script_read` before quiz/cloze |
| 2 | on-call-doctor-night-report | 8 | Standard warm-up pattern |
| 3 | rapid-verbal-update-at-bedside | 8 | Standard warm-up pattern |
| 4 | handing-over-a-deteriorating-patient-mid-treatment | 7 | **IN-PROGRESS** — no `audio_shadow`, no `quiz` |
| 5 | isbar-handover-for-a-stable-patient | 9 | cloze → script_read → no_script → recording_submit |
| 6 | pair-practice-nurse-to-nurse-shift-handover | 8 | Pair practice (video + recording) |
| 7 | pair-practice-nurse-to-doctor-verbal-report | 9 | Includes `mission` |
| 8 | module-assessment-documentation-self-reflection | 7 | L8 covered by course-wide specs |

## Content gaps (not bugs)

### L1 — shorter blueprint while authoring

Standard Module L1 elsewhere: 8 steps with `video` at position 4 and `script_read` near the end.  
**Current prod:** `scenario_intro → flash_card → audio_shadow → script_read → quiz → cloze → matching`.  
Encoded as-is in `bug-087`; happy-path uses `emergency-m8-l1-flow.ts` (no video automation).

### L4 — missing audio_shadow and quiz

Standard L4 elsewhere includes `audio_shadow` and `quiz`.  
**Current prod:** `flash_card → scenario_intro → flash_card → video → script_read → cloze → matching`.  
Encoded as-is in `bug-087`. Quiz linter skips L4 (`M8_LESSON_SLUG_NO_QUIZ`).

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #086 | L7 empty `missionEn`/`missionVi` | `fix-m8-l7-mission-copy.mjs` |

## M8 regression specs (086–095)

Standard DB hygiene: mission, blueprint (L1–L8 incl. in-progress sequences), flash_card, recording_submit, auth, cloze, quiz (excl. L4), nurse roles, audio_shadow (excl. L4), matching.

## Course-wide guards (unchanged)

- bug-013 `spot_the_mistake` (L8)
- bug-065 `drag_order` lines (L8)

## Deferred

- [ ] Headed walk **test-m8@test.com** through L5 ISBAR recording flow and L6–L7 pair practice.
- [ ] Revisit L1/L4 blueprints after Tarun adds missing steps (video / audio_shadow / quiz).
