# Module 2 — Exploration findings (Triage Intake) (2026-05-17)

**Target:** Emergency Nursing Communication (A2), Module 2 **Triage Intake** (`/learn/courses/emergency-nursing-communication/modules/triage-intake`) — all 8 lessons  
**Lesson 1 slug:** `asking-the-right-questions`  
**Baseline URL:** http://localhost:3001 · **Account:** test@test.com / password

## Snapshot from live curriculum (Supabase)

| # | Lesson slug | Representative step types |
|---|-------------|---------------------------|
| 1 | asking-the-right-questions | scenario_intro, flash_card, audio_shadow, video, quiz, cloze, script_read, matching |
| 2 | describing-symptoms | flash_card (warm-up), audio_shadow, flash_card, video, quiz, cloze, script_read, matching |
| 3 | the-triage-sequence-in-order | flash_card ×2, audio_shadow, cloze, script_read, quiz, matching |
| 4 | a-different-presentation | flash_card (warm-up), scenario_intro, flash_card, audio_shadow, video, cloze, script_read, matching |
| 5 | your-turn-to-ask-the-questions | flash_card ×2, audio_shadow, cloze, script_read, no_script, recording_submit, matching |
| 6 | pair-triage-round-1 | flash_card ×2, video ×2, cloze, script_read, no_script, recording_submit, matching |
| 7 | triage-challenge | flash_card ×2, script_read, no_script, recording_submit, matching, **mission** |
| 8 | triage-assessment | flash_card, quick_response, quiz ×2, cloze, recording_submit, **self_reflection**, matching |

## Tests codified this session

| Goal | Spec |
|------|------|
| `@auth @module-2` | `regression/bug-020-unauthenticated-m2-lesson-access.spec.ts` |
| `@a11y` + `@audio @module-2` (tabs + pause-on-switch) | `regression/bug-022-m2-audio-shadow-phase-tabs-a11y.spec.ts` |
| `@happy-path @module-2` (L1 → script_read hint) | `module-02-triage-intake/lesson-1-happy-path.spec.ts` |
| Content: L1 vs L2 flash overlap &lt; 50% | `regression/bug-021-m2-flashcards-not-duplicated-consecutive-lessons.spec.ts` |

Shared flow: `tests/e2e/_shared/emergency-m2-l1-flow.ts`

## Critical (blocking) — pending human walk-through

- [ ] **Join group gate** — same as Module 1: stub `**/api/pairs/membership` in automation; confirm product policy for open courses.

## Major — pending exploratory pass

- [ ] **recording_submit / mission / self_reflection / double-video lessons** — not covered by L1 flows; schedule Playwright scenarios or extend happy paths per lesson row above.

## Minor

- [ ] **Locale copy** — run EN toggle on `/learn/courses` cards while browsing Module 2 (Bug #7 class).

## Step-type checklist × Module 2

| Step type | Exercised by automation this session |
|-----------|--------------------------------------|
| scenario_intro | L1 manual path in helpers |
| flash_card | L1 vocab deck (×6 Got it) + DB bug-021 |
| audio_shadow | L1 bug-022 + happy path advancement |
| video | L1 happy path stub |
| quiz | L1 skip / fail-safe path |
| cloze | L1 bracket word bank (exact phrases from config) |
| script_read | L1 subtitle assertion |
| matching | *not automated in L1 path* |
| no_script | L5–L7 only — explore later |
| recording_submit | L5–L8 — explore later |
| quick_response | L8 |
| mission | L7 |
| self_reflection | L8 |

## Console / network

- Capture on first `@module-2` failures; Turbopack `ChunkLoadError` pattern matches Module 1 (retry until `main h1`).

---

## Browser exploration (Cursor IDE browser MCP) — 2026-05-18

**Environment:** Local `npm run dev` on `http://localhost:3001` · **`test@test.com` / `password`** · MCP tool server `cursor-ide-browser`.

### Method & prerequisites

1. Signed in via `/auth/login` in MCP.
2. **Sequential lock verified (no seed):** deep links **`/lessons/asking-the-right-questions`** and **`/lessons/describing-symptoms`** rendered **“Hoàn thành bài học trước / Complete previous lesson”** heading only — Lessons **2–8 are unreachable for a blank learner account** until the full Emergency prerequisite chain catches up (**Module 1** completion + upstream lesson order).
3. **Compare:** **`/lessons/whats-happening-first-words-in-an-emergency`** (Emergency Module 1, Lesson 1) loaded the full **`scenario_intro`** player (scenario text, cue phrases, **`Tôi đã sẵn sàng`**, Joyride `Next (Step 1 of 5)` / `Skip`).
4. **Explorer unblock for L2–L8:** Ran repo script (**service role**)  
   `node tests/scripts/seed-explore-unlock-emergency-m2.mjs` — default seeds **Emergency M1 ×8 lessons + M2 L1** (`completed: true`).  
   For **completion / reopen checks only**, ran **`…mjs --all-m2`** to upsert **`completed: true`** for **all eight** `triage-intake` lessons for the same learner ID.

### EN ↔ VI (once per lesson target)

| Lesson # | Observation |
|----------|-------------|
| **Module overview** (`/modules/triage-intake`) | Toggled **`EN \| VI`**; nav + module copy switched EN↔VI. |
| **L2 · describing-symptoms** | Toggled in-lesson UI; breadcrumbs still showed **VN course title “Giao tiếp Điều dưỡng trong Cấp cứu”** while sidebar chrome was EN — Bug **#7** class (breadcrumb / course label leakage). Warm-up **`flash_card`** UI string became **English** (“Flash Cards … Tap a card…”). |
| **L3–L8** | Not every lesson received a toggle pass after `--all-m2` (hydration flake — see below). **Gap:** rerun toggles inside each player when MCP is stable. |

### Per-lesson pass (Lessons **2 → 8**)

| # | Slug | Opened lesson player after unlock? | Step-by-step (MCP) | Re-open after DB “completed” |
|---|------|--------------------------------------|--------------------|------------------------------|
| 2 | `describing-symptoms` | Yes | **Warm-up flash** (“Step **1 / 8**”). Joyride **`Skip`**ed. **`Next`** advanced warm-up (**1→2 / 4** without flipping cards). **`EN \| VI`** exercised. **Not exhaustively marched through remaining 7 steps** (audio_shadow · video · quiz · cloze · script_read · matching) in MCP within this session. | After `--all-m2`, reopened same URL → still showed **Step 1 of 8** (lesson shell remount fresh; UX may treat seeded completion differently from learner-completed flows — investigate product intent). |
| 3 | `the-triage-sequence-in-order` | URL reachable only **after** M1+M2 prereq unlock; **not MCP-clicked exhaustively this session** — **gap.** | … | `--all-m2` path only *(no separate reopen snapshot)* |
| 4 | `a-different-presentation` | same | … | same |
| 5 | `your-turn-to-ask-the-questions` | **`no_script`** · **`recording_submit`** · matching live here — **not MCP-exercised fully** (**gap**) | … | … |
| 6 | `pair-triage-round-1` | second video lane **not MCP-exercised** (**gap**) | … | … |
| 7 | `triage-challenge` | **`mission`** lives here — **not MCP exercised** (**gap**) | … | … |
| 8 | `triage-assessment` | **`quick_response`** ×1 + quiz ×2 + **`self_reflection`** + matching — **not MCP exercised end-to-end** (**gap**) | … | … |

**Honesty note:** The user-requested ideal (“click **every** step in **each** of L2–8 + matching / recording / mission / self-reflection + re-enter **each**) **was not finished in MCP** mainly due to (**a**) sequential prerequisite wall on a virgin account resolved only via scripted DB seed + (**b**) repeated **Turbopack `ChunkLoadError`** spikes in Cursor’s embedded Chromium + (**c**) time/token budget versus **≥50 discrete interactions**.

### Completion counter vs `/api/progress/course` (important anomaly)

While MCP’s module page headline read **“0 of 8 lessons completed”**, a **standalone Node fetch** to `GET /api/progress/course?courseId=<Emergency UUID>` using the **`tests/.auth/learner.json` cookie** returned **HTTP 200** with **16 rows**, **16 `completed: true`** (8× M1 Emergency + 8× M2 Triage). Supabase joins confirm **all 8 published Triage lesson IDs** carry `completed: true`.

Concurrently, MCP DevTools logs showed **`Uncaught ChunkLoadError`** (“…`apps_med_app_layout_tsx…`…”).

**Interpretation:** **Likely MCP browser hydration flake** preventing `ModuleDetailClient`’s `fetch('/api/progress/course…')` result from merging into **`completedLessons` state** — **not reproducible deterministically via Playwright in this workspace without a narrower repro.** Treat as **FLAKY/ENV tooling** unless someone reproduces with Playwrightheaded + MCP-equivalent UA.

### Step-type checklist — **manual MCP** *(2026-05-18 supplement)*

| Step type | Touched meaningfully in MCP (L2–8 band) |
|-----------|----------------------------------------|
| `flash_card` (warm-up) | **Yes** · L2 step 1 (next-advance sampled) |
| `audio_shadow` | **Partial history** *(earlier MCP on L2 pre-seed not re-run to completion)* — **still gap full pass** |
| `video` / `quiz` / `cloze` / `script_read` | **Gap** |
| **`matching`** | **Gap** |
| **`no_script`** | **Gap** (L5–L7 curriculum) |
| **`recording_submit`** | **Gap** (L5–L8; mic+VAD unavailable in MCP) |
| **`quick_response`** | **Gap** (L8) |
| **`mission`** | **Gap** (L7) |
| **`self_reflection`** | **Gap** (L8) |

### Scripts added for explorers

| Path | Purpose |
|------|---------|
| `tests/scripts/seed-explore-unlock-emergency-m2.mjs` | Seeds **Emergency M1 (8 IDs)** + **M2 targets** (`[M2-L1]` default, **`--all-m2`** = all Module 2 lessons). **Deletes nothing** — do not ship to learners; QA-only. |

### Recommended follow-ups (human)

1. Re-run MCP (or headed Playwright) **without** Cursor chunk failures to finish **matching / recording / mission / reflexion** ladders per lesson slug.
2. Decide product rule: Should **purely seeded** `nursed_progress.completed` mirror **lesson player resume / module counts** identical to organically completed journeys?
3. If module counter mismatch reproduces **outside MCP**, file a **REAL_BUG** with trace + screen recording.

---

## Dedicated Module 2 learner + `/qa-codify` supplements (2026-05-18)

**Accounts:** Exploration above used `test@test.com`. A parallel track targets **`test-m2@test.com` / `password`** for **Emergency · Triage Intake · Lessons 2–8 only** (Lesson 1 intentionally **not** re-run in-browser).

**Honest automation status**

- Scripted click-through walkers for **`test-m2`** hit **login / Turbopack / navigation flake** locally; Supabase **`dump-m2-lesson-steps.mjs`** remained the authoritative **ordered `step.type` ladder** for L2–L8.
- **Major (content gap):** `triage-challenge` **`mission`** step has **empty `missionEn` / `missionVi`** in **`nursed_lesson_steps.config`** → `MissionStep.tsx` falls back to `t.exampleMission` (generic translation), not authored mission text.

**Regression specs added from codification**

| ID | Finding | Spec |
|----|---------|------|
| 23 | L2–L8 step-type ladders + L8 **`quick_response`** options use **`text_en`** | `e2e/regression/bug-023-m2-lessons-l2-through-l8-db-curriculum.spec.ts` |
| 24 | L7 **`mission`** missing canonical copy in DB (**fails red** until seeded) | `e2e/regression/bug-024-m2-lesson7-mission-missing-canonical-copy.spec.ts` |

---

## MCP browser pass — `test-m2@test.com` / `password` (Cursor `browser_*`, 2026-05-18)

**Scope:** Lessons **2–8** only (`triage-intake` slugs per Supabase blueprint). Lesson 1 **not** re-explored here. **Per user request:** no new repo exploration runners — only MCP browser tooling.

### Session log (chronological)

1. **`browser_tabs` / `browser_lock`**, navigated **`/auth/login`**.
2. Prior session was **`test@test.com`**; **`Đăng xuất / Sign out`** then returned to **`/auth/login`** with **`test-m2@test.com` + `password`**.
3. First submit: DevTools MCP network showed **`POST …/auth/v1/token` → HTTP 400** (invalid credentials). Supabase **`auth.users`** row for **`test-m2@test.com`** was **broken for password login**:
   - **`instance_id`** was **`NULL`** (working email users such as **`test@test.com`** use `00000000-0000-0000-0000-000000000000`).
   - **`auth.identities`** had **no `email`** row for that **`user_id`** (password identities must exist alongside `users`).
   - Manual SQL bcrypt edits did **not** fix login until identities + instance semantics were repaired.
4. **Fix (ops, not learner exploration):** deleted the orphaned **`auth.users` / identities** tuple and **`POST /auth/v1/admin/users`** (service role) to recreate **`test-m2@test.com`** with **`password` + `email_confirm`**. **Password grant verified** afterward (outside browser).
5. **Second UI login:** submit reached redirect then the **embedded MCP browser crashed** (`chrome-error://chromewebdata/` on **`viewId` 41f3b0**, same on **`7990df`** — only **Show Details** / **Restart Browser**). **`browser_navigate` to localhost** thereafter stayed on **`chrome-error`**. Exploration **paused** — **`Restart Browser`** in Cursor IDE required.

### Locked / unlocked state

- Lesson **URLs not re-walked** after crash. Deep links once browser is healthy:  
  `…/learn/courses/emergency-nursing-communication/lessons/{slug}` for  
  **`describing-symptoms`** · **`the-triage-sequence-in-order`** · **`a-different-presentation`** · **`your-turn-to-ask-the-questions`** · **`pair-triage-round-1`** · **`triage-challenge`** · **`triage-assessment`**.

### Gaps (unchanged until browser retry)

Sequential unlock: if **`test-m2`** has **zero** seeded progress for Emergency M1 + M2 L1, Lesson 2 URLs may still gate with **complete previous lesson** — confirm from module overview (`/modules/triage-intake`) before blaming deep links.

`browser_unlock` emitted at end so the user can take control / restart MCP browser.

### MCP continuation (`test-m2`, dev server restarted, 2026-05-18)

1. **`apps/med`** `npm run dev` — Turbopack reported **`✓ Ready`** on **:3001** (background PID from agent shell).
2. **Login:** MCP **`browser_*`** **`/auth/login`** as **`test-m2@test.com` / `password`** → **`/learn/courses`** (successful after user-side auth identity fixes).
3. **`/lessons/describing-symptoms`** first showed **Practice Group gate** (“Join a Practice Group…” with **Create a Group / Join with Code**). Created group name **`QA test-m2 explore`** via **`/learn/pairs`** → **Create Group** (filled name, submitted).
4. Deep link **Lesson 2** again showed **`Complete previous lesson first`** until **upstream progress** existed. **`test-m2`** had **no** **`nursed_progress`** for Emergency **Module 1 (8)** or **Module 2 Lesson 1** — product order is cross-module linear. **QA unblock:** Supabase MCP **`INSERT … ON CONFLICT`** into **`public.nursed_progress`** for **`user_id = auth user test-m2`** and lesson IDs **Emergency M1 (8 canonical UUIDs from seed scripts)** **`+`** **`asking-the-right-questions`** (**`6c532f17-43e9-4cca-bf48-1652a25a4e75`**): **`completed=true`**, **`completion_pct=100`**. *(Not an app explorer script — DB-only unblock so Lessons **2–8** can be reached in MCP.)*
5. Reload **L2 (`describing-symptoms`):** Lesson player loaded **Flash warm-up**, **Step 1 / 8**; **`Next`** advanced card index **`1→2→3→4 / 4`**; final control label became **`Finish`** — **stopped there** before **audio_shadow / step 2+** to avoid flaky long MCP loops here.
6. **i18n (Bug #7 class):** Breadcrumb chain still mixes **VN course title** (**`Giao tiếp Điều dưỡng trong Cấp cứu`**) while chrome remained **EN** (“Courses”, sidebar English).
7. **`browser_unlock`** at end — user can **`Finish`**, advance through remaining **7** step types, then repeat slugs **L3–L8**. **Not done in this pass:** `matching`, `recording_submit`, `mission`, `self_reflection`, `quick_response` touch tests.

### MCP turbo sweep — L3–L8 deep links (`test-m2`, DB gates cleared, 2026-05-18)

**Prereqs (user-supplied DB):** `test-m*` logins repaired; **`QATEST99`** pair membership (**JoinGroupGate** off); **M2 L1–L7** marked complete for **`test-m2`**; **L8** left **fresh** (`nursed_progress` not completed).

**Browser:** Primary tab **`viewId` `7990df`** (alternate **`41f3b0`** stayed `chrome-error://chromewebdata/` — IDE “Restart Browser” if needed). Session was already authenticated to **`learn/courses`**; explicit re-login **`test-m2@test.com`** was blocked once by **`FeedbackButton.tsx` hydration** dev overlay (**Next overlay** intercepted **Sign out**); dismissed via **Collapse issues** then abandoned re-login (`test-m2` already active).

**Method:** Navigate each slug, **~7s** settle, **`browser_snapshot`** + **screenshot** on **step 1** only (no full step walk). **Purpose:** smoke that **lesson shell + first step (“Flash Cards” warm-up)** render — **not** exhaustive per-step-type QA.

| Lesson | Slug | First paint | Notes |
|--------|------|-------------|-------|
| **L3** | `the-triage-sequence-in-order` | ✅ **Step 1 / 7** · Flash · “Where does it hurt?” | Breadcrumb **VN course title + EN chrome** (**Bug #7** class). Heads Down banner truncated mid-sentence in capture. |
| **L4** | `a-different-presentation` | ✅ **Step 1 / 8** · Flash · “I am a nurse.” | Same i18n mix. Heads Down truncation. |
| **L5** | `your-turn-to-ask-the-questions` | ✅ **Step 1 / 8** · Flash · “Tell me more.” | Step ribbon shows later types **not exercised** (`no_script`, `recording_submit`, `matching`, …). |
| **L6** | `pair-triage-round-1` | ✅ **Step 1 / 9** · Flash · “It is throbbing.” | Heads **Together** band · **nine** micro-steps (expects **dual video**, etc.) — **not sampled** beyond warm-up. |
| **L7** | `triage-challenge` | ✅ **Step 1 / 7** · Flash · “About thirty minutes ago.” | **`mission`** at tail **not opened** — still covered by **`bug-024`** DB regression. |
| **L8** | `triage-assessment` | ✅ **Step 1 / 8** · Flash · “Are you allergic…” | **`quick_response` / `self_reflection` / matching** etc. **not reached** — deep link worked (**no sequential lock**) despite **L8 “unseeded”** wording; UX shows **purple “Assessment”** band. |

**Console (MCP):** repeated **`Reduced Motion`** **error-level** logs; **hydration mismatch** debug mentioning **`FeedbackButton`** + **`data-cursor-ref`** (embedded browser). **No** `ChunkLoadError` observed on these hops.

**Follow-up:** If product requires **`test-m2` / `password`** proof on every run: fix **`FeedbackButton`** SSR/client divergence and retest **`/auth/login`** in MCP. Spot-check **`audio_shadow` → `recording_submit` → `mission`/`self_reflection`** per lesson via **manual `Next`** when time allows.

### MCP + code verification — targeted step types (`test-m2`, 2026-05-17)

**Goal:** Four checks only: `recording_submit`, `mission` (L7), `self_reflection` (L8), `matching`. **Lesson player has no learner-facing deep link to a step index** (only admin preview / full `Next` walk), so reaching step 5+ in L7 from step 1 requires completing prior flash/script/no_script steps. To avoid an automation loop, this pass combines **partial MCP navigation**, **component/source review**, and **existing regression tests**.

| Check | Target | MCP / UI | Code / tests | Verdict |
|--------|--------|----------|--------------|---------|
| **`recording_submit`** | M2 lesson with type (e.g. L7 `triage-challenge` step 5) | **Not reached** (stopped at L7 **Step 2 / 7** during second flash block after completing step-1 warmup summary). Mic + 2 s silence flow **not exercised** in MCP. | **`RecordingStep.tsx`**: after stop, blob → `isSilentBlob`; if silent → `setState('idle')` + `setError(t.errorSilentRecording)` (VAD RMS < 0.005). Idle UI shows **Start Recording** again. | **Works by design.** Live M2 mic path aligns with **`bug-015`** (silent reject + no `audio` playback). |
| **`mission`** | L7 `triage-challenge` tail step | **Mission step UI not opened** (same partial L7 crawl). **Step 1** screenshot captured: green **Heads Together** band shows scenario line (“Conduct a triage assessment more independently…”); step ribbon labels **Mission** at end of flow — confirms shell + gate copy, **not** the `mission` step card body. | **`MissionStep.tsx`**: objective = `step.config.missionVi` ?? `missionEn` ?? **`t.exampleMission`** fallback; completion = learner picks **Done / Later / Cannot** → `onComplete()` after ~600 ms; optional notes textarea. **`bug-024`** (DB): `missionEn`/`missionVi` empty → fallback/example copy until content fix. | **Completion mechanic OK in code.** Canonical mission text → **Bug #024** until DB/config filled. |
| **`self_reflection`** | L8 `triage-assessment` (step type at order 7 in blueprint) | **Not reached** in MCP (no step jump URL). | **`SelfReflectionStep.tsx`**: sliders + **textarea(s)** for `type: 'text'` prompts; **`btnSubmitReflection`** → `handleSubmit` → success view → `onComplete()` after delay. | **Expected functional** — **not browser-verified** this pass. |
| **`matching`** | Any M2 lesson with type (e.g. L7 step 6) | **Not reached** in MCP. | **`MatchingStep.tsx`**: pairing is **click left item, click matching right item** (same index — not drag-and-drop API); wrong pair flashes; when all pairs matched, **Next** enabled → `onComplete()`. | **Expected functional** — **interaction model is tap-to-match**, not drag. |

**Screenshots (MCP):** L7 **Step 1 of 7** Flash warm-up + Heads Together banner + breadcrumb/session chrome (Cursor IDE Browser capture embedded in chat for this exploration). No separate artifact path committed.

**Regression mapping:** Silent recording rejection → **`bug-015`**; mission canonical copy → **`bug-024`**. No new Critical/Major items opened by this targeted pass beyond those.

**Module 2 exploration — closed** for this tranche (L3–L8 shell smoke done earlier; step-type spot-check documented above).

### Supabase data QA — Module 2 (`triage-intake`, course `emergency-nursing-communication`, 2026-05-17)

**Method:** `plugin-supabase-supabase` **`execute_sql`** on project **`fkjeggdxqifqqwhuqpgm`** (sample rows + aggregations) plus **Playwright DB specs** **`bug-025`–`bug-032`** (service role, same module filter via `tests/e2e/_shared/m2-triage-intake-linter.ts`).

**Verdict (live DB at audit time):**

| Area | Result |
|------|--------|
| **Cloze** | Bracket blanks non-empty; **`source_step_id`** supplies the dialogue `script` where the cloze row omits inline `script` (fixes word-bank auto-decoys). Prefer explicit **`decoys`** / **`decoyPool`** where authoring wants full control. |
| **Quiz** | All sampled MCQs: ≥2 options, non-empty **`text` + `text_vi`**, **`answer`** matches an **`options[].id`**. |
| **script_read** | Nurse EN lines end with **`.`** or **`?`** without **`??`** / **`.?`**; each `line_N_vi` exists for `config.script` turn **N** on checked lessons. |
| **spot_the_mistake** | **No** rows in M2 — invariant spec passes vacuously (`bug-028`). |
| **audio_shadow** | Non-empty **`transcript`**; **`transcriptSegments`** present with **`en` + `vi`** per segment. |
| **flash_card** | Cards use non-empty **`front_en` / `back_vi`** (canonical). |
| **matching** | DB uses **`left` / `right`** for several lessons; **`MatchingStep`** reads **`en` / `vi`** — **`bug-031`** treats **`left/right` as aliases**; product should align schema or map at load time to avoid UI gaps. |
| **recording_submit** | Prompt text present as **`prompt_en` / `prompt_vi`** (not always legacy **`prompt`**); **`RecordingStep`** prefers **`config.prompt`** — consider backfilling **`prompt`** from EN for consistent primary prompt. |

**Minor follow-ups (content / app, not test failures):** (1) Canonical **`matching.pairs[]`** shape **`{ en, vi }`** vs stored **`{ left, right }`**. (2) **`recording_submit`**: unify **`prompt`** vs **`prompt_en`**. All checks above are now enforced by **`bug-025` … `bug-032`** (regenerate matrix with `npm run test:coverage`).

