# Module 1 — Exploration findings (2026-05-17)

**Target:** Emergency Nursing Communication (A2), Module 1 — all 8 lessons  
**URL:** http://localhost:3001  
**Account:** test@test.com / password (auth enabled)

## Session notes (QA loop)

- Baseline **smoke suite** (`npm run test:smoke`) green on `chromium-desktop` + `chromium-mobile` before changes.
- **`JoinGroupGate`:** regression tests stub `GET /api/pairs/membership` → `{ inGroup: true }` so the lesson player loads; without a pair group the player is blocked — product question for Tarun (already noted in prior exploration).
- **`AudioShadowStep`** updated with `role="tablist"` / `role="tab"` / `role="tabpanel"` for phase controls; covered by **`bug-019`**.
- **`bug-018`** covers unauthenticated **deep link** to Lesson 1 → `/auth/login` with `next` return path (fills **@auth @module-1** gap).
- **`lesson-1-happy-path.spec.ts`** drives L1 through `audio_shadow` into **`script_read`** subtitle (fills **@happy-path @module-1** gap).

## Step type checklist — Module 1 (Emergency) — coverage status

| Step type | Where exercised | Notes |
|-----------|-----------------|--------|
| scenario_intro | L1+ | "I'm Ready" CTA; tours may overlay (skip in tests). |
| flash_card | L1 | Sprint + index `data-testid`; **bug-010**. |
| video | L1 | Seek stub in E2E for "Done watching". |
| quick_response | L1 | Options + Confirm + Next. |
| audio_shadow | L1 | Tabs + play; overlap **bug-011**; a11y **bug-019**. |
| script_read | L1 | Happy path asserts EN/VI subtitle. |
| cloze | Present in M1 lessons | Not all in L1 only — use `/qa-explore` deeper pass for each lesson if needed. |
| no_script | M1 | Exercises in later L1 lessons per blueprint. |
| recording_submit | M1 | **bug-015** VAD; heavy step — mock/route if extending happy path to full completion. |
| quiz | M1 | Covered in several lessons. |
| matching | Typically end of lesson | Per Y blueprint. |
| drag_order | If present | Tap/drag in UI. |
| flash_card | Multiple lessons | **bug-012** data overlap. |
| quick_response / odd_one_out / sentence_builder / spot_the_mistake | Mixed | **bug-013**, **bug-014** (content). |
| conversation_animation / mission / self_reflection | L7–L8 styles | Confirm per lesson in a future pass. |
| video | VI subtitles | Toggle where `subtitle_vtt_vi` populated. |
| peer_rating | ScriptRead speak phase | Optional peer UI. |

## Critical (blocks lesson completion)

- [ ] **Join group gate** — `/api/pairs/membership` false hides entire lesson (`JoinGroupGate`). Workaround: join a group or stub in tests; policy decision for open courses.

## Major

- [ ] **Bug #7 — EN course card descriptions** — some copy still VI on `/learn/courses` in EN mode (**bug-007** spec).

## Minor

- [ ] **Bug #6 — Joyride Next** — **`test.fixme`** until tour + `JoinGroupGate` ordering fixed.

## Console / network

- No new hard errors noted in this documentation pass; rely on Playwright traces for failing runs.

## Translation gaps

- Course card `description_vi` vs EN toggle — see Bug #7.
