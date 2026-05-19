# Module 3 — Exploration findings (Immediate Instructions in Emergencies) (2026-05-19)

**Target:** Emergency Nursing Communication (A2), Module 3 **Immediate Instructions in Emergencies** (`/learn/courses/emergency-nursing-communication/modules/immediate-instructions-in-emergencies`) — all 8 lessons  
**Module ID:** `4b3b4d56-051c-4811-b277-432a1dec02d5`  
**Lesson 1 slug:** `safety-first-giving-urgent-instructions`  
**Baseline URL:** https://pro.tuto.asia (orchestrator-mandated for CI/RAM) · **Account:** test-m3@test.com / password (M1+M2 pre-seeded, 16 lessons) · **DB specs:** Supabase service role via `.env.local`

## Snapshot from live curriculum (Supabase)

| # | Lesson slug | Representative step types |
|---|-------------|---------------------------|
| 1 | safety-first-giving-urgent-instructions | scenario_intro, flash_card, audio_shadow, video, quiz, cloze, script_read, matching |
| 2 | more-critical-instructions | flash_card, audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 3 | instructions-in-sequence | flash_card, audio_shadow, flash_card, cloze, script_read, quiz, matching |
| 4 | when-the-patient-cannot-cooperate | flash_card, scenario_intro, flash_card, audio_shadow, video, cloze, script_read, matching |
| 5 | give-the-instruction | flash_card, audio_shadow, flash_card, cloze, script_read, no_script, recording_submit, matching |
| 6 | pair-instructions-round-1 | flash_card, video, flash_card, cloze, script_read, no_script, recording_submit, matching |
| 7 | emergency-instruction-challenge | flash_card ×2, script_read, no_script, recording_submit, matching, **mission** |
| 8 | instructions-assessment | flash_card, quick_response, quiz ×2, cloze, recording_submit, **self_reflection**, matching |

## Tests codified this session

| Goal | Spec |
|------|------|
| `@auth @module-3` | `regression/bug-037-m3-unauthenticated-m3-lesson-access.spec.ts` |
| `@happy-path @module-3` (L1 → script_read hint) | `module-03-immediate-instructions/lesson-1-happy-path.spec.ts` |
| DB curriculum L2–L8 | `regression/bug-034-m3-lessons-l2-through-l8-db-curriculum.spec.ts` |
| L7 mission canonical copy | `regression/bug-033-m3-lesson7-mission-missing-canonical-copy.spec.ts` |

Shared flow: `tests/e2e/_shared/emergency-m3-l1-flow.ts`  
Shared linter: `tests/e2e/_shared/m3-immediate-instructions-linter.ts`

## Critical / Major — content (REAL_BUG)

- [x] **L7 `emergency-instruction-challenge` mission step** — `nursed_lesson_steps.config` had **empty `missionEn` / `missionVi`** (same class as Module 2 **Bug #024**). `MissionStep.tsx` fell back to `t.exampleMission`. **Fix:** `tests/scripts/fix-m3-l7-mission-copy.mjs` (clinical EN+VI, 2–3 sentences each). Regression: **`bug-033`**.

## Major — pending exploratory pass

- [ ] **recording_submit / mission / self_reflection / pair-video lessons** — not covered by L1 happy path; schedule headed walks for L5–L8.
- [ ] **Join group gate** — stub `**/api/pairs/membership` in automation; confirm product policy for open courses.

## Minor

- [ ] **Locale copy** — run EN toggle on module overview and in-lesson chrome (Bug #7 class).

## Step-type checklist × Module 3

| Step type | Exercised by automation this session |
|-----------|--------------------------------------|
| scenario_intro | L1 happy path (helpers) |
| flash_card | L1 vocab deck + DB bug-035 |
| audio_shadow | L1 happy path + DB bug-041 |
| video | L1 happy path stub |
| quiz | L1 skip path + DB bug-039 |
| cloze | L1 bracket word bank + DB bug-038 |
| script_read | L1 subtitle assertion + DB bug-040 |
| matching | DB bug-042 only |
| no_script | L5–L7 — explore later |
| recording_submit | L5–L8 — DB bug-036 |
| quick_response | L8 — bug-034 |
| mission | L7 — bug-033 (+ DB fix) |
| self_reflection | L8 — explore later |

## Regression specs added from codification

| ID | Finding | Spec |
|----|---------|------|
| 33 | L7 **`mission`** missing canonical copy in DB | `e2e/regression/bug-033-m3-lesson7-mission-missing-canonical-copy.spec.ts` |
| 34 | L2–L8 step-type ladders + L8 **`quick_response`** `text_en` | `e2e/regression/bug-034-m3-lessons-l2-through-l8-db-curriculum.spec.ts` |
| 35 | **`flash_card`** `front_en` / `back_vi` | `e2e/regression/bug-035-m3-flash-card-canonical-fields.spec.ts` |
| 36 | **`recording_submit`** prompt fields | `e2e/regression/bug-036-m3-recording-submit-prompt.spec.ts` |
| 37 | Unauthenticated deep link → login | `e2e/regression/bug-037-m3-unauthenticated-m3-lesson-access.spec.ts` |
| 38 | **`cloze`** blanks + word bank | `e2e/regression/bug-038-m3-cloze-word-bank-coherent.spec.ts` |
| 39 | **`quiz`** MCQ structure | `e2e/regression/bug-039-m3-quiz-options-and-answers.spec.ts` |
| 40 | **`script_read`** nurse lines + `line_N_vi` | `e2e/regression/bug-040-m3-script-read-nurse-lines.spec.ts` |
| 41 | **`audio_shadow`** transcript + segments | `e2e/regression/bug-041-m3-audio-shadow-transcripts.spec.ts` |
| 42 | **`matching`** bilingual pairs | `e2e/regression/bug-042-m3-matching-pairs-nonempty.spec.ts` |

## Supabase data QA — Module 3 (`immediate-instructions-in-emergencies`, 2026-05-19)

**Method:** Service-role dump (`tests/scripts/_tmp-dump-m3.mjs`) + Playwright DB specs **`bug-033`–`bug-042`** via `m3-immediate-instructions-linter.ts`.

**Verdict (live DB at audit time):**

| Area | Result |
|------|--------|
| **Curriculum L2–L8** | Ordered `step.type` ladders match blueprint table above |
| **Mission (L7)** | **Empty** `missionEn`/`missionVi` before fix — **REAL_BUG #033** |
| **Cloze / quiz / script_read / audio_shadow / flash_card / matching / recording_submit** | Enforced by DB regression specs (run `npx playwright test --grep "@module-3"`) |

**Scripts**

| Path | Purpose |
|------|---------|
| `tests/scripts/fix-m3-l7-mission-copy.mjs` | One-off populate L7 mission EN/VI copy |

## Recommended follow-ups (human)

1. Headed Playwright or MCP walk **`test-m3@test.com`** through L2–L8: `matching`, `recording_submit`, `mission`, `self_reflection`, `quick_response`.
2. Confirm module progress counter matches seeded `nursed_progress` for M1+M2+M3.
3. Regenerate matrix: `npm run test:coverage` from `apps/med`.
