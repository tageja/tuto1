# Module 10 — Exploration findings (Emergency Procedures Communication) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 10 **Giao tiếp Thủ thuật Cấp cứu**  
**Module slug:** `emergency-procedures-communication` (`order_index` 10)  
**Lesson 1 slug:** `explaining-iv-line-insertion`  
**URL:** https://pro.tuto.asia · **Account:** test-m10@test.com / password (M1–M9 complete, 72 lessons)

## Pre-flight (M9 regression flakes)

Re-ran `bug-036` + `bug-011` on `chromium-mobile` — **both passed** (confirmed non-data flakes from prior full sweep).

## Curriculum snapshot (Supabase)

| # | Lesson slug | Steps | Notes |
|---|-------------|-------|-------|
| 1 | explaining-iv-line-insertion | 7 | **video-first** — no `scenario_intro`; has `audio_shadow` |
| 2 | explaining-oxygen-mask-vs-nasal-cannula | 7 | **IN-PROGRESS** — no `audio_shadow` |
| 3 | explaining-defibrillator-pads-to-a-conscious-patient | 7 | Same as L2 |
| 4 | gaining-rapid-consent-for-ng-tube | 7 | **IN-PROGRESS** — no `quiz`; `audio_shadow` at pos. 3 |
| 5 | explaining-catheter-insertion | 8 | `cloze` **after** `recording_submit` |
| 6 | pair-practice-nurse-to-patient-iv-explanation | 8 | Same cloze-after-recording pattern |
| 7 | pair-practice-gaining-rapid-consent | 9 | `mission` then `cloze` — see verdict |
| 8 | module-assessment-procedures-self-reflection | 7 | Reordered L8 assessment |

## L1 video-first (no scenario_intro)

**Verdict: intentional for procedures communication.**

Learners watch the procedure model first, then vocabulary, listening practice, and scripted explanation. Encoded in `bug-107`; happy-path uses `emergency-m10-l1-flow.ts` (video → flash → audio_shadow → script_read).

## L5/L6 — cloze after recording_submit

**Verdict: intentional record-then-consolidate pedagogy.**

Learners record their procedure explanation first, then complete gap-fill using phrases they just used. Not a migration error.

## L7 — mission before cloze

**Verdict: intentional post-mission consolidation.**

Order: `… → recording_submit → mission → cloze → matching`. The mission assigns partner role-play + reflection; the following cloze step reinforces key consent/explanation phrases from that practice. This differs from “mission just before matching” but is coherent for procedures + consent content.

## L8 — reordered assessment

**Actual:** `quiz → cloze → recording_submit → spot_the_mistake → drag_order → matching → self_reflection`  
**Standard M6–M9:** `quiz → spot_the_mistake → cloze → drag_order → recording_submit → …`

**Verdict: intentional variant** — earlier written consolidation (cloze) and oral check (recording) before visual error-spotting. `spot_the_mistake` and `drag_order` still present; covered by course-wide **bug-013** / **bug-065**.

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #106 | L7 empty `missionEn`/`missionVi` | `fix-m10-l7-mission-copy.mjs` |

## M10 regression specs (106–115)

Standard DB hygiene: mission, blueprint, flash_card, recording_submit, auth, cloze, quiz (excl. L4), nurse roles, audio_shadow (L1 + L4), matching.

## L1 happy-path (prod)

Flow: **video** (`Đã xem xong`) → flash deck (`Hoàn thành`) → **audio_shadow** (Listen tab) → script_read subtitle.

## Course-wide guards (unchanged)

- bug-013 `spot_the_mistake` (L8)
- bug-065 `drag_order` (L8)

## Deferred

- [ ] Headed walk **test-m10@test.com** through L5–L7 recording + post-mission cloze.
- [ ] Revisit L2/L3 when Tarun adds standard `audio_shadow` warm-up steps.
