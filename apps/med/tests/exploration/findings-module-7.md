# Module 7 — Exploration findings (Red Flags & Emergency Reporting) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 7 **Red Flags & Escalation**  
**Module slug:** `red-flags-escalation` (`order_index` 7)  
**Lesson 1 slug:** `calling-a-code-blue`  
**URL:** https://pro.tuto.asia · **Account:** test-m7@test.com / password (M1–M6 seeded, 48 lessons)

## Curriculum snapshot (Supabase)

| # | Lesson slug | Step types |
|---|-------------|------------|
| 1 | calling-a-code-blue | scenario_intro, flash_card, audio_shadow, video, quiz, cloze, script_read, matching |
| 2 | recognising-stroke-symptoms-fast | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 3 | anaphylaxis-after-medication | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 4 | sepsis-screening-communication | flash_card, scenario_intro, audio_shadow, flash_card, video, cloze, script_read, matching |
| 5 | chest-pain-possible-mi | flash_card, audio_shadow, flash_card, video, cloze, no_script, **recording_submit**, **script_read**, matching |
| 6 | pair-practice-unresponsive-patient | flash_card, **video**, flash_card, script_read, **video**, cloze, no_script, recording_submit, matching |
| 7 | pair-practice-paediatric-emergency-escalation | flash_card, video, flash_card, script_read, cloze, no_script, recording_submit, mission, matching |
| 8 | module-assessment-red-flags-self-reflection | quiz, spot_the_mistake, cloze, drag_order, recording_submit, matching, self_reflection |

## Anomaly resolution

### L5 — `recording_submit` before `script_read`

**Verdict: intentional pedagogy, not a DB bug.**

Flow: vocab → listen → video → cloze → speak without script → **record escalation** → **read full model script** → matching. Learners attempt the call first, then compare to the expert dialogue (debrief). Encoded as-is in `bug-077` blueprint.

### L6 — two `video` steps

**Verdict: intentional pair-practice rounds, not duplicate content.**

| Position | Title | Role |
|----------|-------|------|
| 2 | Full Script — Nurse Calls Rapid Response | Watch full dialogue |
| 5 | Round 2 — Partial Script | Watch scaffolded second round |

Both have distinct non-empty `videoUrl` values on prod. `bug-077` asserts ≥2 videos with distinct URLs.

## REAL_BUG fixed this session

| Bug | Issue | Fix |
|-----|-------|-----|
| #076 | L7 empty `missionEn`/`missionVi` | `fix-m7-l7-mission-copy.mjs` |

## M7 regression specs (076–085)

Standard DB hygiene: mission, blueprint (+ L6 video URL check), flash_card, recording_submit (`promptEn`), auth, cloze, quiz, nurse roles, audio_shadow, matching.

## L1 cloze (happy-path)

`calling`, `Cardiac`, `response`, `unresponsive`, `pulse`, `doing`, `immediately`

## Course-wide guards (unchanged)

- bug-013 `spot_the_mistake` (L8)
- bug-065 `drag_order` lines (L8)

## Deferred

- [ ] Headed walk **test-m7@test.com** through L5 recording→script_read and L6 dual-video pair practice.
- [ ] L1 happy-path on prod (fixme until FlashCard UI aligned).
