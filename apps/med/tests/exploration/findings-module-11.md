# Module 11 — Exploration findings (Trauma & Acute Injuries) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 11 **Chấn thương & Tổn thương Cấp tính**  
**Module slug:** `trauma-acute-injuries` (`order_index` 11)  
**Lesson 1 slug:** `road-traffic-accident-victim-in-ae`  
**URL:** https://pro.tuto.asia · **Account:** test-m11@test.com / password (M1–M10 complete, 80 lessons)

## Curriculum snapshot (Supabase)

| # | Lesson slug | Steps | Notes |
|---|-------------|-------|-------|
| 1 | road-traffic-accident-victim-in-ae | 7 | **video-first** — no `scenario_intro`; has `audio_shadow` |
| 2 | patient-with-fall-and-suspected-hip-fracture | 7 | **IN-PROGRESS** — no `audio_shadow` |
| 3 | burns-victim-initial-assessment | 7 | Same as L2 |
| 4 | head-injury-gcs-assessment | 7 | **IN-PROGRESS** — no `quiz`; `audio_shadow` at pos. 3 |
| 5 | trauma-team-handover-at-hospital-doors | 8 | `cloze` after `recording_submit` |
| 6 | pair-practice-nurse-to-doctor-trauma-handover | 8 | Same as L5 |
| 7 | pair-practice-nurse-to-nurse-trauma-assessment | 9 | **cloze then mission** (reversed vs M10 L7) |
| 8 | module-assessment-trauma-self-reflection | 7 | L8 assessment order — see below |

## L1 video-first

**Verdict: intentional** — same trauma/procedures pedagogy as M10 L1. Helper: `emergency-m11-l1-flow.ts`.

## L7 — cloze before mission

**Verdict: intentional consolidation-then-mission.**

Prod order: `… → recording_submit → cloze → mission → matching`. Learners lock in trauma/SBAR phrases in cloze, then receive the partner role-play mission. Differs from M10 (mission → cloze) but is coherent.

## L8 assessment order

**Actual (prod):** `quiz → cloze → spot_the_mistake → drag_order → recording_submit → matching → self_reflection`  
**M10 L8 was:** `quiz → cloze → recording_submit → spot_the_mistake → drag_order → …`

**Verdict: intentional variant** — oral recording after visual error tasks. `spot_the_mistake` + `drag_order` covered by **bug-013** / **bug-065**.

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #116 | L7 empty `missionEn`/`missionVi` | `fix-m11-l7-mission-copy.mjs` |

## M11 regression specs (116–125)

Standard DB hygiene suite; `bug-117` encodes all structural differences.

## Course-wide guards

- bug-013 `spot_the_mistake` (L8)
- bug-065 `drag_order` (L8)
