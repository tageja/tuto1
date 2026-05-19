# Module 12 — Exploration findings (Family Communication in Emergencies) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 12 **Giao tiếp Gia đình trong Cấp cứu** (final module)  
**Module slug:** `family-communication-in-emergencies` (`order_index` 12)  
**Lesson 1 slug:** `explaining-a-cardiac-arrest-to-the-family`  
**URL:** https://pro.tuto.asia · **Account:** test-m12@test.com / password (M1–M11 complete, 88 lessons)

## Curriculum snapshot (Supabase)

Structurally **identical to M11** — no new anomalies.

| # | Lesson slug | Steps | Notes |
|---|-------------|-------|-------|
| 1 | explaining-a-cardiac-arrest-to-the-family | 7 | video-first; `audio_shadow` |
| 2 | informing-family-that-condition-has-worsened | 7 | no `audio_shadow` (in-progress) |
| 3 | answering-will-they-survive-professionally | 7 | same as L2 |
| 4 | discussing-cpr-and-resuscitation-decisions | 7 | no `quiz`; `audio_shadow` pos. 3 |
| 5 | supporting-grieving-families | 8 | cloze after `recording_submit` |
| 6 | pair-practice-nurse-to-family-breaking-bad-news | 8 | same as L5 |
| 7 | pair-practice-managing-information-requests-during-treatment | 9 | cloze → mission (same as M11 L7) |
| 8 | module-assessment-family-communication-self-reflection | 7 | M11-style L8 assessment order |

## Pedagogy verdict

All step-order patterns match M10/M11 late-module template (documented in prior findings). **No new content bugs filed** for structural ordering.

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #126 | L7 empty `missionEn`/`missionVi` | `fix-m12-l7-mission-copy.mjs` |

## M12 regression specs (126–135)

Standard DB hygiene suite; `bug-127` encodes full blueprint.

## L1 happy-path

`emergency-m12-l1-flow.ts` — video → flash → audio_shadow → script_read.

## Course-wide guards

- bug-013 `spot_the_mistake` (L8)
- bug-065 `drag_order` (L8)
