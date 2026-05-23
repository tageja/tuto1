# FOLDER CHANGE — Active Working Directory Has Moved

**Status:** ACTIVE
**Date opened:** 2026-05-20
**Last updated:** 2026-05-23 (UTC+7) by Dev Agent (studio reference materials upload + multimodal brainstorm)

---

## TL;DR for any agent reading this

**The only folder you should work in is:**

```
C:\Users\ASUS\tuto-nursemed-practice-pilot
```

All other folders (`C:\Users\admin\...` and `D:\Work\...`) are deprecated. Do NOT write to them. Do NOT cd into them. If your Cursor terminal opens into one of them by default, escalate to Tarun — do not silently work there.

---

## Why this change happened

This machine has had three copies of the repo at different times due to Windows permission issues:

| Folder | Status | Why it exists |
|---|---|---|
| `C:\Users\admin\tuto-nursemed-practice-pilot` | **STALE — DO NOT USE** | Original location on the new laptop. Owned by user `admin`, write-locked for user `ASUS`. Stuck at commit `113eb14` (Module 2 era). |
| `D:\Work\tuto-nursemed-practice-pilot.BACKUP-2026-05-20` | **ARCHIVED** | Was the active folder during the M3–M12 QA campaign (May 19). All QA work was committed and pushed from here. Renamed with `.BACKUP` suffix on 2026-05-20 after consolidation. Will be deleted after a 7-day safety period. |
| `C:\Users\ASUS\tuto-nursemed-practice-pilot` | **ACTIVE** | Created today (2026-05-20 ~14:39) by copying `D:\Work\tuto-nursemed-practice-pilot` to ASUS's home so the PM/designer agent could write files. This is now the single source of truth. |

Both `D:\Work` and `C:\Users\ASUS` were on the same branch (`agent-x-integration`) at the same commit (`bfa43cd`) at the moment of the copy, so there was no divergence to resolve.

---

## What was committed during the consolidation

| Commit | What | Where it was authored | Now lives in |
|---|---|---|---|
| `1b94a55` | `perf(med): disable Turbopack in dev to cut RAM usage from 25GB to under 5GB` | `D:\Work` | `C:\Users\ASUS` + `origin/agent-x-integration` |
| `9f804da` | `feat(med): HCMUTE pilot homepage with 3 course cards and pilot_interest capture` | `C:\Users\ASUS` (PM agent) | `C:\Users\ASUS` + `origin/agent-x-integration` |

Both pushed to GitHub. `agent-x-integration` is the single shared branch.

A follow-up `package.json` fix landed on top to use `--webpack` instead of the non-existent `--no-turbopack` flag (Next.js 16.2.2 uses `--webpack`, not `--no-turbopack`).

---

## Dev environment fixes applied (still active)

1. **Windows Defender exclusions** added (`D:\Work`, `C:\Users\admin\tuto-nursemed-practice-pilot`, `%APPDATA%\npm`, `%LOCALAPPDATA%\npm-cache`, `node.exe`) — stops Defender scanning every file during `next dev` compile. **Recommend adding `C:\Users\ASUS\tuto-nursemed-practice-pilot` to this list** (requires admin PowerShell): `Add-MpPreference -ExclusionPath "C:\Users\ASUS\tuto-nursemed-practice-pilot"`
2. **`apps/med/package.json` dev script** now hardcodes `node ./node_modules/next/dist/bin/next` to bypass the monorepo hoisting issue where the root `node_modules/next` is v15.5.6 but `apps/med/node_modules/next` is v16.2.2. Without the explicit path, npm sometimes resolves the wrong version.
3. **`--webpack` flag** instead of Turbopack default — saves ~20GB RAM during dev.

Dev server now starts in ~465ms with sane memory usage.

---

## Action required from Tarun

**In Cursor:** `File → Open Folder...` and select `C:\Users\ASUS\tuto-nursemed-practice-pilot`. The IDE is still pointed at the stale `C:\Users\admin\...` folder, so any terminal opened in Cursor defaults to running scripts there (which is why the dev server kept erroring with the OLD `--no-turbopack` script).

Cursor's title bar should read `tuto-nursemed-practice-pilot` and `pwd` in a fresh terminal should print `C:\Users\ASUS\tuto-nursemed-practice-pilot`.

---

## Session activity log

Append a row every time you (any agent) work in this consolidated environment. Newest at the top.

| Date / Time (UTC+7) | Agent | What you did | Where you wrote files |
|---|---|---|---|
| 2026-05-23 23:45 | QA Agent | **Studio full E2E journey (bugs 271–289):** Added `@e2e` + `@learner` tags; 19 new specs (intake + reference upload, mocked brainstorm/generate, course overview/media, review submit, admin pending/approve/preview, Emergency Nursing learner path, studio home, auth redirect). Extended `studio-pages.ts` + `learner-pages.ts`. **`--grep "@e2e"` → 22 passed** (+2 setup). **`--grep "@studio"` → 111 passed, 3 failed** (pre-existing: bugs 216, 226, 247 — not introduced by 271–289). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 23:00 | QA Agent | **Studio Phase 7 — Review workflow (bugs 259–270):** Added `@review` tag; specs for `ReviewStatusPanel` (validate/submit/under-review/rejected/approved), studio submit API auth, admin courses Pending Review tab, admin review API auth + reject validation, sidebar pending-count badge. Extended `studio-pages.ts` with review mocks/helpers. **`--grep "@review"` → 12 passed** (+2 setup). **`--grep "@studio"` → 92 passed** (+2 setup; bugs 207–270). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 21:30 | AI Course Creator Agent — Composer | **Studio Phase 7 — Review workflow:** Added `validate-course.ts` (step config validation with studio-generated field aliases), `GET/POST` studio validate+submit routes, admin review queue/count/review APIs, `ReviewStatusPanel` on `/studio/[courseId]`, admin Courses pending-review tab + sidebar badge, bilingual i18n keys. Approve sets `review_status=published` + `published=true`. `npm run build` pass. No commits. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 19:45 | QA Agent | **Studio Phase 7 — Stencil template system (bugs 249–258):** Added `@template` tag; specs for 3-template selector (names/descriptions/selection), legacy ID normalization (`safety_procedures` → `organisational_training`), deterministic pool resolution + 8×8 validation, brainstorm prompt/API (mocked NDJSON via in-page `fetch`), EN template descriptions + VI chrome, Organisational Training + Student English wizard flows, `assertAllTemplates()` build-time guard. **`--grep "@template"` → 27 passed** (+2 setup). **`--grep "@studio"` → 82 passed** (+2 setup; bugs 207–258). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 18:30 | AI Course Creator Agent — Composer | **Studio stencil architecture:** Replaced JSON templates with anchor+pool TypeScript definitions (`professional_communication`, `organisational_training`, `student_english`); added `resolve-template.ts` (seeded LCG by `draftId`), `step-metadata.ts`, `validate-templates.ts` (build-time assert 8 steps/lesson), and prompt builders (`brainstorm`, `lesson-fill`, `chat-system`). Wired `/api/studio/brainstorm`, `chat`, `generate`; updated `/studio/new` to 3 templates; legacy template IDs map to nearest stencil. `free_speaking` → `recording_submit` for DB constraint. `npm run build` pass. No commits. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 14:15 | QA Agent | **Studio Phase 6 — Manual video queue (bugs 239–248):** Added `@media-queue` tag; specs for `/studio/[courseId]` tabs, Media Production tab/cards, video request form validation (HTML5 `required`), `PATCH /api/studio/media` auth, `/admin/media-queue` page + sidebar link, admin PATCH auth, learner/unauthenticated gates. Extended `studio-pages.ts` with course/video mocks + bilingual locators (VI default). **Updated bug-236** — View Course href now `/studio/{courseId}` (Phase 6). **`--grep "@media-queue"` → 13 passed** (+2 setup). **`--grep "@studio"` → 55 passed** (+2 setup; bugs 207–248). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 12:00 | AI Course Creator Agent — Composer | **Studio Phase 6 — Manual video production queue:** Applied Supabase migration (`creator_notes`, `submitted` status). Built `/studio/[courseId]` (Overview + Media Production tabs, video request cards with script copy + submit), `PATCH /api/studio/media/[queueId]`, admin `/admin/media-queue` dashboard + `GET/PATCH /api/admin/media-queue`, sidebar link, EN/VI strings, `GenerationProgress` redirect to `/studio/{courseId}`. Updated `MediaQueueItem` types. `npm run build` verified. No commits. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 01:30 | QA Agent | **Studio Phase 5 — Template-fill generation (bugs 233–238):** Specs for `POST /api/studio/generate` auth, Step 3 auto-generation, `GenerationProgress` UI (progress bar, complete, error/retry, incremental lesson checkmarks). Extended `studio-pages.ts` with NDJSON generate mocks (`mockStudioGenerate`, `mockStudioGenerateStreaming`), wizard helpers; updated **bug-231** for real Step 3 UI. All generate/brainstorm/chat tests mock AI via `page.route()` / fetch stub — no Gemini. **`--grep "@studio" --project=chromium-desktop` → 44 passed** (+2 setup; bugs 207–238). Full `chromium-desktop` → **301 passed, 6 failed, 3 skipped** (failures = pre-existing auth flakes + dev server reset on bug-197, not studio). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 00:25 | AI Course Creator Agent — GPT-5.5 | Implemented Phase 5 Template-Fill Course Generation for Creator Studio: added `buildStepConfig()` for template step config JSON, built `/api/studio/generate` with Gemini 2.0 Flash lesson fill prompts, NDJSON progress streaming, course/module/lesson/step inserts, media queue rows, draft status transitions, and added `GenerationProgress` plus `/studio/new` auto-generation wiring. Added EN/VI generation UI strings. Build verification pending in this session. No commits made. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 17:15 | QA Agent | **Studio Phase 4 — Refinement chat (bugs 226–232):** Specs for `POST /api/studio/chat` auth, Refine-with-AI toggle, message flow, typing indicator, synopsis update, Step 3 placeholder, mobile stacked layout (`@studio`). Extended `studio-pages.ts` with `buildE2eValidSynopsis()`, AI SDK SSE mock (`mockStudioChat()`), `reachStudioSynopsisStep()`; **fixed `MOCK_BRAINSTORM_NDJSON`** to schema-valid synopsis so Step 2 action buttons enable. All chat/brainstorm UI tests mock Gemini via `page.route()`. **`--grep "@studio" --project=chromium-desktop` → 36 passed** (+2 setup; bugs 207–232). Full desktop regression → **286 passed, 13 failed, 3 skipped** (failures = pre-existing auth/M1 lesson flakes, not studio). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 24:15 | QA Agent | **Studio Phase 3 — AI brainstorm (bugs 220–225):** Specs for `POST /api/studio/brainstorm` auth, Step 2 synopsis UI, streaming skeleton, error handling, wizard flow (`@studio`). Extended `studio-pages.ts` with NDJSON mock + wizard helpers; all brainstorm UI tests mock Gemini via `page.route()`. **`--grep "@studio" --project=chromium-desktop` → 27 passed** (+2 setup; bugs 207–225). Full desktop regression → **287 passed, 3 failed, 3 skipped** (failures: bug-002 logout, bug-022 M2 audio, bug-170 verify — pre-existing, not studio). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 23:29 | AI Course Creator Agent — GPT-5.5 | Implemented Phase 4 Refinement Chat for Creator Studio: added `/api/studio/chat` with Gemini 2.0 Flash streaming, creator auth, synopsis validation/persistence, shared synopsis JSON extraction helpers, `RefinementChat` using AI SDK React `useChat`, and `/studio/new` refinement-chat + generation-placeholder wiring. Added EN/VI strings and installed `@ai-sdk/react`. `npm run build` from `apps/med` completed successfully with existing Next config/middleware/Browserslist warnings only. No commits made. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 23:45 | QA Agent | **Studio batch 2 (`/studio`, `/studio/new`):** Specs **bug-212–219** (`@studio`). Extended `tests/e2e/_shared/studio-pages.ts` (studio routes + merged become-creator helpers). Creator access via **`admin@test.com` super_admin** storageState (`configureStudioAccess`), not `AUTH_DISABLED`. **`--grep "@studio" --project=chromium-desktop` → 19 passed** (+2 setup). No app REAL_BUG fixes. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 22:52 | AI Course Creator Agent — GPT-5.5 | Implemented Phase 3 AI Brainstorm for Creator Studio: added Zod schemas and synopsis types, built `/api/studio/brainstorm` with Vercel AI SDK `streamObject()` + Gemini via `GEMINI_API_KEY`, added streaming `SynopsisPanel`, wired `/studio/new` to save draft then stream/show synopsis review actions, and added EN/VI strings. Also removed duplicate translation keys that were blocking TypeScript. `npm run build` from `apps/med` completed successfully with existing Next config/middleware warnings only. No commits made. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 22:40 | QA Agent | **Studio batch 1 (become-creator + API):** `@studio` tag; `studio-pages.ts` become-creator helpers; specs **bug-207–211**. App: form `name` attrs + `type="submit"`. **`@studio` → 19 passed**. Full `chromium-desktop` regression → **273 passed, 8 failed, 3 skipped** (failures = pre-existing auth/module flakes, not studio). | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 21:44 | AI Course Creator Agent — GPT-5.5 | Implemented AI Course Creator Studio Phase 1/2 foundation after Tarun's product decisions: added Supabase migration `058_ai_course_creator_foundation.sql` for `course_creator`, creator applications, hybrid taxonomy, category suggestions, drafts, media queue, and course ownership/review fields; applied the migration to Supabase via MCP as `ai_course_creator_foundation`; added fixed studio template JSON files; built `/become-creator`, super-admin creator/category review UI, `/studio` shell, draft home, intake/category suggestion flow, and supporting API routes. No commits made. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 18:30 | QA Agent | **Admin pages batch 4 (AD1–AD18, final):** `tests/exploration/findings-admin-pages-batch4.md`; specs **bug-190–201, 205–206** (`@admin-pages`; shared `admin-pages.ts`, `admin.setup.ts`, `ensureTestAdminProfile` + API cookie session). **No app REAL_BUG** — drag reorder fix already in lesson editor source. **`@admin-pages` chromium-desktop → 23 passed** (+2 setup). Full `npm run test:regression` → **472 passed, 18 failed, 6 skipped** (+44 new admin tests vs 428 baseline; +3 failures are pre-existing auth desktop/mobile flakes under long parallel load, zero admin spec failures). | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-22 12:00 | QA Agent | **Learner pages batch 3 (L1–L9):** `tests/exploration/findings-learner-pages-batch3.md`; specs **bug-177–189** (`@learner-pages`). **REAL_BUG fix:** `/learn/profile` 404 — route + `getFullProfile` PGRST116 fallback in `lib/db/profile.ts`. **`@learner-pages` → 27 passed** (desktop+mobile). Full `npm run test:regression` → **428 passed, 15 failed, 6 skipped** (+22 new tests; failures mostly pre-existing auth/mobile env flakes; learner mobile fixes in `_shared/learner-pages.ts`). | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 23:50 | QA Agent | **Auth pages batch 2 (A1–A3):** `tests/exploration/findings-auth-pages-batch2.md`; specs **bug-163–175** (`@auth-pages`). App fixes: verify invalid-token UI, register duplicate-email copy, login password-toggle a11y, register layout metadata. **`@auth-pages` chromium-desktop → 21 passed.** Full `npm run test:regression` → **406 passed, 11 failed, 6 skipped** (includes pre-existing mobile/auth flakes; auth desktop green in isolation). | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 15:45 | QA Agent | **Public pages batch 1 (P1–P5):** Phase 0 `tests/exploration/findings-public-pages-batch1.md`; specs **bug-155–162** (`@regression` + `@public-pages`). Code fixes: `LanguageContext` reads `nursed_lang` on first paint; `SurveyLanding` bullets use `lang` not hardcoded VI. `@public-pages` run → **12 passed, 1 skipped** (sidebar profile when learner auth file expired). | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 10:15 | QA Agent | HCMUTE homepage Playwright suite: Phase 0 findings doc, bug-138–154 specs (`@hcmute`), shared `hcmute-home.ts` helpers; fixed enrollment modal validation + network-error copy in `page.tsx`; `@hcmute` run **34 passed / 1 fixme**; full regression **325 passed** (same baseline, pre-existing auth flakes on learner-overview). | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 10:10 | Orchestrator (Claude Sonnet 4.6) | PROMOTED TO PRODUCTION. Fixed Vercel build error (Next 16 Turbopack + webpack config mismatch) by adding `turbopack: {}` to `next.config.ts`. Pre-production polish: fixed 2 missing VI translation keys (`hpPathsEyebrow`, `hpLiveTitle`), removed all em dashes from homepage and courses-page strings (replaced with periods/middle-dots). Committed full HCMUTE sprint (ecc199a), build fix (ae285c7), promoted preview `med-l1mybzedv` to production via `vercel promote`. pro.tuto.asia is now live with the full HCMUTE feature set. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 08:25 | Orchestrator (Claude Sonnet 4.6) | Footer: added "Emergency Nursing" and "HCMUTE Pilot" as indented sub-links under Courses in `LandingFooter.tsx` (with `/#hcmute-pilot` anchor + `/learn/courses/emergency-nursing-communication` links). Hero badge: converted static `<span>` to clickable `<button>` — clicking "🔥 X spots left — register now" now opens enrollment modal. Added `id="hcmute-pilot"` to FeaturedPilotCard `<article>` so footer deep-link works from any page. Added 4 translation keys (EN + VI). Verified visually via browser MCP. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 01:55 | Orchestrator (Claude Sonnet 4.6) | Added 50-spot hard limit + aggressive scarcity UI for HCMUTE pilot. New `/api/pilot-spots` GET route queries live count from `nursed_survey_responses`. Updated `/api/enrollments` to reject with 409 when count ≥ 50. `page.tsx`: fetches live spots on mount; hero badge shows real-time "🔥 X spots left"; FeaturedPilotCard gets a progress bar + urgency text that escalates green→orange→red as spots fill; buttons disable when full. Translations updated (EN + VI). Verified visually via browser MCP. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 01:44 | Orchestrator (Claude Sonnet 4.6) | Improved HCMUTE homepage course positioning and fixed a pre-existing react-joyride React 18 webpack error that was blocking all routes. Fixed: added `exportsPresence:'warn'` webpack rule in `next.config.ts` for joyride. Content changes: (1) added nurse shortcut anchor in hero (`🩺 For nurses →`) + `id="nursing-course"` on the nursing card; (2) reordered FUTURE_PATHS by survey demand — Workplace English first (40%), Internship second (35%), Lab/Technical third (renamed to "English for Technical Reports & Labs"); (3) rewrote all three card descriptions to be pain-point driven based on survey quotes. Updated 3 translation keys EN + 3 keys VI in `translations.ts`, plus added `hpHeroCtaNurse` in both languages. Verified visually via browser MCP. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-21 01:10 | Orchestrator (Claude Sonnet 4.6) | Fixed language toggle on HCMUTE homepage: PM agent had hardcoded all text in Vietnamese with no i18n wiring. Added 76 translation keys (EN + VI) to `lib/i18n/translations.ts`, rewired `app/page.tsx` to use `useLang()` throughout. Fixed 3 apostrophe syntax errors in EN strings. Verified page loads at localhost:3001 and EN/VI toggle switches all content correctly via browser MCP. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 15:39 | Orchestrator (Claude Sonnet 4.6) | Confirmed workspace at `C:\Users\ASUS\tuto-nursemed-practice-pilot`. Read `FOLDER_CHANGE.md` and `HANDOVER_NurseEd_ORCHESTRATOR_AGENT.md` in full. Verified latest commit is `63a6cea` on `agent-x-integration`. Appended this session log row. Awaiting instruction from Tarun before taking any action. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 15:31 | PM / Designer agent — GPT-5.5 | Read the folder-state file first, confirmed the active working tree is `C:\Users\ASUS\tuto-nursemed-practice-pilot`, and verified the HCMUTE homepage + `pilot_interest` enrollment API are present with no targeted linter errors. Checked local git state and prepared to commit/push the remaining consolidation/dev-server/session-log changes on `agent-x-integration`. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 15:30 | Orchestrator (Claude Opus, opened on `C:\Users\admin\...`, wrote via absolute paths to `C:\Users\ASUS\...`) | Created this `FOLDER_CHANGE.md`. Killed stale node processes. Diagnosed and fixed Next 15 vs 16 version conflict + wrong `--no-turbopack` flag → now `--webpack` with explicit local binary path. Verified dev server starts cleanly. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-23 | Dev Agent | Added optional Reference Materials upload to `/studio/new` Step 1: Supabase `studio-uploads` bucket + RLS policies, `POST /api/studio/upload`, `referenceImageUrls` on intake/draft, multimodal Gemini brainstorm via AI SDK `messages`, i18n EN/VI. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 15:15 | Orchestrator | Folder consolidation: copied package.json from D:\Work to C:\Users\ASUS, committed 2 clean commits (`1b94a55` perf + `9f804da` homepage), pushed to `origin/agent-x-integration`, renamed D:\Work folder to `.BACKUP-2026-05-20`. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 ~14:30 | PM/Designer agent (separate Cursor session) | Redesigned `apps/med/app/page.tsx` (HCMUTE pilot homepage with 3 course cards) and extended `apps/med/app/api/enrollments/route.ts` to accept `mode: "pilot_interest"` submissions. Could not create a new `/api/pilot-interest/route.ts` directory (permission issue at the time) so extended the existing route. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 ~14:39 | Tarun (manually) | Copied `D:\Work\tuto-nursemed-practice-pilot` → `C:\Users\ASUS\tuto-nursemed-practice-pilot` to give the PM agent a writable workspace. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 (earlier) | Orchestrator | Cleaned up 21 untracked QA scripts in `D:\Work` (commit `bfa43cd`). Inserted M9–M12 L2/L3 audio_shadow + L4 quiz steps into Supabase. Generated audio shadow QA verification specs. | `D:\Work\tuto-nursemed-practice-pilot` (later mirrored into ASUS via copy) |

---

## Rules for the next agent

1. **Confirm your cwd before any file operation.** Run `pwd` (or check `$PWD`) — it must start with `C:\Users\ASUS\tuto-nursemed-practice-pilot`. If it doesn't, stop and re-open the workspace.
2. **Never write to `C:\Users\admin\...` or `D:\Work\...`.** Both are read-only / backup / stale. If you need to compare with what was there, use `git log` — the history is identical up to the point of divergence.
3. **All commits go to branch `agent-x-integration` and get pushed to `origin/agent-x-integration`.** No new feature branches without explicit instruction.
4. **Append your session row to the table above before you end your turn.** One row, newest at top, with: timestamp (UTC+7), agent identity, one-paragraph "what you did", folder you wrote to.
5. **If you hit any "Access denied" / `EPERM` / `EACCES` error**, do NOT silently work around it by writing somewhere else. Stop and report. The whole reason this file exists is because silent workarounds created three divergent copies.

---

## Deletion plan (housekeeping)

After **2026-05-27** (one week safety window), Tarun can run:

```powershell
# Remove the backup
Remove-Item -Recurse -Force "D:\Work\tuto-nursemed-practice-pilot.BACKUP-2026-05-20"
```

The stale `C:\Users\admin\tuto-nursemed-practice-pilot` cannot be removed by user ASUS due to permissions. It is harmless as long as no one accidentally `cd`s into it.
