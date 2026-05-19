# Module 9 — Exploration findings (Simulation & Emergency Review) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 9 **Mô phỏng và Ôn tập Cấp cứu**  
**Module slug:** `simulation-and-emergency-review` (`order_index` 9)  
**Lesson 1 slug:** `team-debrief-after-resuscitation`  
**URL:** https://pro.tuto.asia · **Account:** test-m9@test.com / password (M1–M8 complete, 64 lessons)

## Curriculum snapshot (Supabase)

| # | Lesson slug | Steps | Notes |
|---|-------------|-------|-------|
| 1 | team-debrief-after-resuscitation | 7 | **IN-PROGRESS** — video-first; no `audio_shadow` |
| 2 | discussing-a-near-miss-with-a-supervisor | 7 | **IN-PROGRESS** — no `audio_shadow`; `script_read` before quiz |
| 3 | presenting-a-case-to-the-ward-team | 7 | Same pattern as L2 |
| 4 | asking-a-senior-colleague-for-feedback | 7 | **IN-PROGRESS** — no `quiz`; only M9 lesson with `audio_shadow` (pos. 3) |
| 5 | reflecting-on-a-difficult-handover | 8 | recording_submit pair practice |
| 6 | pair-practice-nurse-to-supervisor-debrief | 8 | recording_submit |
| 7 | pair-practice-nurse-to-nurse-case-presentation | 9 | **script_read before video** — see verdict below |
| 8 | module-assessment-debrief-self-reflection | 7 | L8 covered by bug-013 / bug-065 |

## Pedagogy assessment (L1–L4 video-first)

**Verdict: intentional for a simulation/debrief module, not a DB defect.**

Clinical simulation modules often show the **video model first** (or after a short vocab deck) before learners read the full dialogue script. L1–L3 omit `audio_shadow` because listening practice is deferred to L4 (feedback conversation) where `audio_shadow` appears at an unusual position 3 — still valid for “hear the model, then match phrases.”

Encoded as-is in `bug-097`; do **not** file as content bugs.

## L7 — script_read before video

**Verdict: intentional read-then-watch pair-practice pedagogy.**

Order on prod: `flash_card → script_read → video → flash_card → cloze → no_script → recording_submit → mission → matching`.

Learners read the case-presentation script **before** watching the exemplar video — mirrors “prepare your talking points, then watch an expert debrief.” This is consistent with simulation review goals and is **not** a mis-ordered migration.

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #096 | L7 empty `missionEn`/`missionVi` | `fix-m9-l7-mission-copy.mjs` |
| #103 | L4 `audio_shadow` transcript used `Senior Nurse:` (multi-word role → bubble alignment) | `fix-m9-l4-single-word-nurse-roles.mjs` (`Senior Nurse:` → `Mentor:`) |

## M9 regression specs (096–105)

Standard DB hygiene: mission, blueprint (all 8 lessons), flash_card, recording_submit, auth, cloze, quiz (excl. L4), nurse roles, audio_shadow (L4 only), matching.

## L1 happy-path (prod)

Flow: scenario_intro → flash_card deck (`Hoàn thành`) → video (`Đã xem xong`) → script_read subtitle.  
Helper: `emergency-m9-l1-flow.ts` — does **not** wait for `audio_shadow` UI.

## Course-wide guards (unchanged)

- bug-013 `spot_the_mistake` (L8)
- bug-065 `drag_order` lines (L8)

## Deferred

- [ ] Headed walk **test-m9@test.com** through L7 read-then-watch pair practice and L5–L6 recording flows.
- [ ] Revisit L1–L3 when Tarun adds standard `audio_shadow` warm-up steps.
