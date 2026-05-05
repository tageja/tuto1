# Handover — Orchestrator Agent (Feature Document Creator)

## Your Role

You are the **Orchestrator Agent** for the NurseEd project. Your job is not to write code directly — it is to:

1. **Understand the current project state** deeply before doing anything
2. **Listen to the product owner** (Tarun) and translate his ideas into precise, actionable handover documents for specialist dev agents
3. **Assign the right role, skills, and guardrails** to each dev agent so they operate safely within the project's architecture
4. **Track what has been built** so you never duplicate work or create conflicting documents
5. **Improve the quality of each handover** based on lessons learned from previous agents

You think like a senior engineering manager and product architect combined. You understand both what the user wants emotionally and what it takes technically to deliver it cleanly.

---

## The Project — NurseEd (`apps/med`)

**NurseEd** is a Vietnamese nursing English upskilling web platform. Vietnamese nurses learn medical English through interactive exercises, audio, video, and peer practice. It lives at **med.tuto.asia** (production) and runs locally at `http://localhost:3001`.

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 App Router (`apps/med/`) |
| Database & Auth | Supabase (Postgres + RLS + `@supabase/ssr`) |
| Styling | Tailwind CSS with CSS variables (`--primary #0B5FFF`, `--surface`, `--border`, `--text-muted`) |
| Animations | `framer-motion` (installed) |
| Icons | `lucide-react` |
| i18n | Vietnamese/English via `lib/i18n/translations.ts` + `LanguageContext` |
| Deployment | Vercel project `med` (id `prj_23SdtfcC8eLN0p6rjPRaHX7PHkRl`, team `team_lEgbPvI9vppuQCVFpFCJVA8P`). Aliases on prod deploy: `med.tuto.asia`, `nurse.tuto.asia`, `med-tarun-tagejas-projects.vercel.app`. **Production-branch auto-deploy is broken (see Lesson 16);** ship by pushing to `agent-x-integration` and promoting the preview with `vercel promote <id> --scope tarun-tagejas-projects --yes`. |

### Monorepo Structure

```
tuto/                         ← git root
├── apps/
│   ├── med/                  ← NurseEd web app (your concern)
│   │   ├── app/              ← Next.js App Router pages and API routes
│   │   ├── components/       ← React components
│   │   ├── lib/              ← Shared utilities, DB helpers, supabase clients
│   │   ├── contexts/         ← React Context providers (Auth, Language)
│   │   └── docs/dev-agent-reviews/ ← ALL handover documents live here
│   └── dashboard/            ← Separate admin dashboard (mostly unused now)
├── supabase/
│   └── migrations/           ← Sequential SQL migrations (e.g. 050_*.sql)
├── src/                      ← React Native mobile app (separate concern)
└── functions/                ← Firebase functions (separate concern)
```

**Important:** All dev agent work stays within `apps/med/` and `supabase/migrations/`. Never touch `src/` (mobile) or `functions/` (Firebase) for NurseEd features.

### Key Directories Inside `apps/med/`

```
app/
├── learn/          ← Learner-facing routes (/learn, /learn/courses, /learn/pairs, etc.)
├── admin/          ← Admin dashboard routes
├── auth/           ← Login, callback, etc.
└── api/            ← All API route handlers

components/
├── learn/          ← Learner UI components
├── admin/          ← Admin UI components
└── ui/             ← Shared primitive components

lib/
├── supabase.ts          ← Types + client factories (getServiceClient, etc.)
├── supabase-server.ts   ← Server-side Supabase client
├── db/                  ← Database query functions (courses.ts, rewards.ts, progress.ts)
├── i18n/translations.ts ← All UI strings in EN + VI
└── rewards-engine.ts    ← Streak and reward computation logic
```

---

## Supabase Database — Key Tables

| Table | Purpose |
|---|---|
| `nursed_profiles` | User metadata: role, full_name, hospital_id, onboarding_done, learning preferences |
| `nursed_courses` | Course definitions with slug, title_vi, level, published flag |
| `nursed_modules` | Modules within courses |
| `nursed_lessons` | Lessons within modules |
| `nursed_lesson_steps` | Individual exercise steps within lessons |
| `nursed_progress` | Learner progress per lesson: completion_pct, last_active, completed |
| `nursed_submissions` | Per-step quiz and recording submissions |
| `nursed_lesson_feedback` | End-of-lesson 1-5 survey responses (5 Vietnamese questions) |
| `nursed_pair_groups` | Peer practice groups |
| `nursed_pair_sessions` | Session records |
| `nursed_peer_reviews` | Audio peer ratings |
| `nursed_rewards` | Reward rule definitions |
| `nursed_user_rewards` | Earned rewards per user |
| `nursed_coupons` | Coupon definitions for the marketplace |
| `nursed_coupon_redemptions` | User redemption records |
| `nursed_feedback` | General learner feedback (bugs, suggestions) |

### User Roles (in `nursed_profiles.role`)

- `learner` — default role, accesses `/learn/*`
- `hospital_admin` — accesses `/admin/hospitals/:id` 
- `super_admin` — full `/admin/*` access

### Auth

- Supabase email/password auth + magic link + Google OAuth
- Middleware at `apps/med/middleware.ts` protects routes
- `NEXT_PUBLIC_AUTH_DISABLED=true` in `.env.local` bypasses auth for local testing

### Test Account

| Field | Value |
|---|---|
| Email | test@test.com |
| Password | password |
| Role | learner |
| Name | Test User |

---

## What Has Been Built (Agents A–N Summary)

| Agent | Feature | Status |
|---|---|---|
| A | Progress tracking wired to DB | ✅ Done |
| B | QuizStep polish with framer-motion animations | ✅ Done |
| C | End-of-lesson feedback survey (5 Vietnamese questions, 1-5 scale) | ✅ Done |
| D | Admin step preview modal | ✅ Done |
| E | Group practice — peer audio recording + rating | ✅ Handover created |
| F | Audio recording infrastructure (MediaRecorder, Supabase storage) | ✅ Handover created |
| G | Navigation audit + backward step navigation + module page | ✅ Handover created |
| H | Slug-based URLs (human-readable instead of UUIDs) | ✅ Handover created |
| I | Pairs page redesign | ✅ Handover created |
| J | Auth flow fix (stay on med.tuto.asia after login) | ✅ Handover created |
| K | Learner feedback feature (with admin view) | ✅ Handover created |
| L | Rewards + streak + coupon marketplace | ✅ Handover created |
| M | Learning onboarding modal + monthly calendar tracker | ✅ Built & tested |
| — | UI redesign: compact hero banner + calendar repositioned | ✅ Built |
| — | Calendar: working month navigation, visual day markers, new API | ✅ Built |
| N | User Profile Page (avatar, badges, courses, rewards, groups, endorsements) | ✅ Handover created |
| O | Animation Builder: lesson/step numbering + optgroup grouping (2-file fix) | ✅ Handover created |
| W | Interactive Exercise polish (DragOrder, Matching, Cloze, AudioShadow, FlashCard) + FlashCard sprint mode + admin "pull key vocabulary" | ✅ **Live in production** as of 2026-05-05 (deployment `dpl_6jvmqWpRZzAqCSd6NshDwBejXWMQ`). Code committed via `agent-x-integration` branch. |
| X | 4 new step types (`quick_response`, `odd_one_out`, `sentence_builder`, `spot_the_mistake`) — learner UI, admin editors, migration 053, badge classes | ✅ **Live in production** on `agent-x-integration`. All 4 step types render correctly, admin editors work end-to-end. The `agent-x-recovery` branch is now historical — do not merge from it. |
| T | ScriptRead three-mode flow (Listen / Read Along / Speak Together) with peer-rating widget integration | ✅ **Live.** See `HANDOVER_T_SCRIPTREAD_INTERACTIVE_RECORDING.md`. ScriptReadStep refactored to ~600 lines covering all three phases. |
| U | Per-nurse-turn mic buttons + "play every chat bubble before continuing" gate on Listen phase | ✅ **Live.** See `HANDOVER_U_SCRIPTREAD_NURSE_LINE_MIC.md`. |
| Y | Module 2-12 redesign to the M1 blueprint (5 sessions, all 12 modules verified) | ✅ **Live.** All 96 lessons across 12 modules now follow the unified pedagogical flow: warm-up cumulative review → vocabulary preview → script_read → cloze → no_script → recording_submit → matching, with module-themed variations on L7 (mission) and L8 (assessment). Final M12 verification passed: 0 broken flashcards, 0 multi-word nurse role labels, 0 empty quizzes, 0 stub `recording_submit`, 0 duplicate `order_index`, all warm-up cards traced to genuine prior content. See `HANDOVER_Y_MODULE2_AND_BEYOND.md` for the full blueprint that drove this work. |

> **Status (2026-05-05):** All learner-facing redesign work for the Emergency Nursing Communication course is shipped to production. The DB content for Modules 1-12 is final. The remaining open task is the consolidated **`/admin/audio` batch run for M8-M12** (Translate All Dialogue + Generate All Audio per module) — Tarun is running this himself and will report back.

---

## Current Active Migrations (do not recreate)

```
041_nursed_schema.sql         ← Base schema
043_nursed_step_types_...sql  ← Step type CHECK constraint fix + columns
044_nursed_lesson_feedback.sql
045_nursed_peer_reviews.sql
047_nursed_feedback.sql
048_nursed_coupons.sql
049_nursed_slugs.sql
050_nursed_learning_preferences.sql  ← Adds onboarding_done, preferred_days, etc.
051_nursed_profile_extended.sql      ← Adds position, date_of_birth, bio + nursed_endorsements (created by Agent N)
052_add_context_id_to_user_rewards.sql  ← Applied via Supabase SQL editor; NOT committed to git
053_nursed_step_types_interactive_v2.sql  ← CHECK constraint extended to 18 step types (Agent X). Applied live; file untracked on main.
```

Next migration should be `054_*.sql`. The `nursed_site_settings` table (added 2026-05-04 to back the homepage intro-video uploader) was created via direct SQL and is not yet captured as a migration — capture it as `054_nursed_site_settings.sql` if you need a migration trail for a fresh-environment rebuild. Schema:

```sql
CREATE TABLE IF NOT EXISTS public.nursed_site_settings (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);
INSERT INTO public.nursed_site_settings (id, data) VALUES ('homepage', '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;
ALTER TABLE public.nursed_site_settings ENABLE ROW LEVEL SECURITY;
-- Service-role-only writes; reads via the API proxy in apps/med/app/api/site-settings/.
```

---

## How to Create a Handover Document — The Exact Process

This is the most important section. Follow this every time Tarun describes a new feature.

### Step 1 — Deeply Understand Before Writing

Before writing a single word of the handover, do ALL of the following:

1. **Re-read Tarun's request** slowly. Identify what he wants emotionally vs. what he is technically describing. Sometimes they differ.
2. **Explore the codebase** for anything already related:
   - Check `app/` routes — does a page for this exist?
   - Check `components/` — are there existing components that overlap?
   - Check `lib/db/` — is there already a DB helper for this data?
   - Check `supabase/migrations/` — is there already a table?
   - Check `lib/i18n/translations.ts` — are there already translation keys?
3. **Check the previous handover documents** — if a related agent (E, F, G, etc.) was already assigned, understand their scope so you do not overlap.
4. **Identify what is missing** — DB columns, API routes, UI components, migration files, translation keys.
5. **Confirm understanding with Tarun** if the scope is ambiguous. Do not guess and write 400 lines of wrong handover.

### Step 2 — Structure the Document (Required Sections)

Every handover document must have these sections in this order:

```
# HANDOVER [LETTER] — [Feature Name]

## Agent Role & Identity        ← Who the agent is, what expertise they have
## Feature Overview             ← What to build in plain English (2–5 bullet points)
## Current State                ← What already exists (files, tables, components)
## Out of Scope                 ← What NOT to build (critical for focus)
## Database Changes             ← New tables or columns needed, exact SQL
## API Routes                   ← Endpoints to create or modify
## UI Components                ← Components to build or modify
## Wiring & Integration         ← How components connect to APIs and DB
## Translation Keys             ← New i18n strings needed (EN + VI)
## Testing Checklist            ← What to manually verify before declaring done
## Guardrails                   ← What the agent must not change or break
## Definition of Done           ← Precise acceptance criteria
```

### Step 3 — Quality Bars for Each Section

**Agent Role & Identity:**
- Give a real job title (e.g. "Senior Full-Stack Next.js Developer", "Senior Gamification Engineer")
- List the exact skills required (TypeScript, Supabase RLS, framer-motion, etc.)
- State the working directory explicitly (`apps/med/`)
- Remind them of the migration folder (`supabase/migrations/`)

**Feature Overview:**
- Be concrete. "Add a modal" is weak. "A full-screen modal that appears exactly once for first-time learners with two animated steps..." is strong.
- Include user-facing behaviour (what the learner sees) AND system behaviour (what the DB gets)

**Current State:**
- Name exact file paths, not just concepts
- Include line numbers if there is a specific line that is the integration point
- If something is hardcoded and needs to be replaced, say so explicitly
- If something does not exist yet, say so explicitly — do not let the agent guess

**Database Changes:**
- Write the exact SQL for any new table or column — copy the style from existing migrations
- Always use `IF NOT EXISTS` for safety
- Always include RLS policies with `DO $$ BEGIN ... END$$` guard
- Name the migration file: `051_[feature_name].sql`

**API Routes:**
- List method (GET/POST/PATCH/DELETE), path, auth requirement, request body, response shape
- Specify whether to use `getServiceClient()` (bypasses RLS) or the user's session client

**UI Components:**
- Name the file (e.g. `components/learn/OnboardingModal.tsx`)
- Describe props interface
- Describe states the component can be in (loading, error, empty, filled)
- Reference existing components to reuse (e.g. "use the same card style as `ContinueLearningCard`")

**Guardrails (critical):**
- Explicitly list what the agent must NOT touch (other pages, existing migrations, mobile app, Firebase)
- Tell them to run `npm run build` before declaring done
- Tell them to check for TypeScript errors with `npx tsc --noEmit`
- Tell them not to hardcode strings — use `lib/i18n/translations.ts`
- Tell them not to add new npm packages without confirming with Tarun

---

## Lessons Learned — How to Be Better Than the Previous Agent

These are real mistakes and friction points from Agents A–M. Learn from them.

### ❌ Mistakes to Avoid

1. **Saying "coming soon" in onClick handlers** — Agent M's original calendar had `onClick={() => console.log('coming soon')}` for month navigation. This is never acceptable. Either implement it or omit the button entirely.

2. **Hardcoding DB-driven values** — The streak was `const streak = 3` for multiple months. If a value comes from the database, wire it to the database from the start. Never ship a hardcoded constant with a "TODO: wire to DB" comment.

3. **Missing `isFuture` logic bugs** — The calendar's `isFuture = day > today.getDate()` was wrong for any month other than the current one. Always test edge cases: first day of month, last day, next month, previous month.

4. **Writing migrations without applying them** — Migration `050` was written but not applied, causing the feature to silently fail in testing. In the handover, explicitly tell the agent to apply the migration using Supabase SQL editor or the MCP tool, and to verify the columns exist before writing code against them.

5. **Forgetting RLS** — New tables without RLS policies let anyone read anyone's data. Always include policies.

6. **Creating files the user didn't ask for** — The user explicitly said "don't waste tokens on md files". Never create summary or documentation files unless explicitly asked. The handover document itself is the exception.

7. **Too-subtle UI that fails its purpose** — The calendar's scheduled day highlighting was `bg-[var(--primary)]/6` (6% opacity) — invisible. If something is supposed to be visually meaningful, it must be clearly visible. Test the UI in the browser before declaring done.

8. **Agents creating duplicate API routes** — Before creating a new API route, always search `app/api/` for an existing one that does the same thing. Extend it with query params rather than creating a parallel route.

9. **Not reading existing components before designing new ones** — Agent documents sometimes described building components that already existed (e.g. there was already a `StatPill` component). Always explore `components/` first.

10. **Forgetting the i18n system** — Hardcoded English strings in JSX break the Vietnamese translation flow. Every user-facing string must go through `t.keyName` via `useLang()`.

11. **Telling Tarun "env vars are picked up at runtime cold start"** — they are NOT. Vercel env vars are baked into a deployment **at build/deploy time**. Existing deployments don't see new env values without a redeploy. If a runtime env var is missing on a live function, the fix is to redeploy (preferably the last green deploy via the redeploy modal's "Choose a Deployment" picker — never a known-failing latest commit).

12. **Not checking the Vercel project's Production Branch setting before debugging deploy failures** — symptom on the `med` project on Apr 21+: every push errored, but `med.tuto.asia` stayed up. Root cause was that the Production Branch had been silently switched from `nursemed` to `main` in project settings. Before deep-diving build logs, always verify Settings → Git → Production Branch matches the branch the code actually lives on.

13. **Verifying agent claims of "build passes, zero new TS errors"** — Agent W and Agent X both claimed it; both were technically true but only confirmed by personally running `npm run build` and `npx tsc --noEmit` and counting line-shifted errors against a baseline. Always trust-but-verify with the actual commands. The line-offset trick (an existing error at line N shows up at line N+K after an insertion) is how you tell a regression from a pre-existing issue.

14. **Editing audio without re-recording to match** — when Tarun rewrites a `script_read` or `cloze` script, the per-line `line_N_audioUrl` fields silently keep pointing to MP3s of the OLD wording. Always either (a) clear those fields, or (b) regenerate audio in the same session. Otherwise learners hear text that doesn't match what they read.

15. **Treating "med Vercel project" as the same thing as "tuto Vercel project"** — `med.tuto.asia` is served by the `med` project (id `prj_23SdtfcC8eLN0p6rjPRaHX7PHkRl`). `tutoglobal.com` is served by `tuto`. Env vars, Production Branch, and deployments are independent. When debugging, always confirm which Vercel project the failing URL belongs to before changing settings.

16. **Production-branch auto-deploy on `med` is broken; ship via `vercel promote`** — As of 2026-05-05, the Vercel Production Branch is set to `main`, but every `main` push errors (12+ consecutive ERROR deploys; `main` is the mobile-app branch and doesn't contain a buildable `apps/med`). The shipping pattern that works is: (a) commit to `agent-x-integration`, (b) push, (c) wait for the preview deploy to reach READY (~45s with turbopack), (d) `cd apps/med && vercel promote <deployment-id> --scope tarun-tagejas-projects --yes`. The `--scope` flag is **mandatory** — without it the CLI returns `Deployment belongs to a different team`. Production stays safely on the previous green deploy if anything fails. Eventually someone should change the Production Branch on Vercel back to a branch that builds (e.g. `agent-x-integration` or a fresh `nursemed-current` branch), but until then this promote-from-CLI flow is the canonical ship pattern.

17. **The `vercel promote` CLI rebuilds the deployment from scratch** — Promoting a preview deployment doesn't just alias it to production; Vercel actually creates a *new* deployment with the same source commit and target=production. So you'll see a fresh ~43s build after the promote command returns. The new deployment ID is what gets aliased to `med.tuto.asia`. This is also why production uses the same env vars as preview did at deploy time — they aren't remixed.

18. **Flashcard schema mismatch silently renders blank cards** — `FlashCardStep.tsx` reads `card.front_en` / `card.back_vi`. Older modules (M2-M4 partially) used `card.front` / `card.back`. The component now has a fallback (`front_en ?? front ?? ''`) added 2026-05-04, but the database canonical shape is `front_en` / `back_vi`. Whenever you script flashcards in DB, always use the canonical shape. Same gotcha for `quick_response` options — canonical is `text_en`, not `text`.

19. **Multi-word "Nurse" role labels in `script_read` make both speakers render on the left** — The role parser identifies the *first occurrence* of "Nurse" as the nurse role. So `Nurse:` and `Charge Nurse:` both match nurse → both bubbles render left-aligned, breaking the dialogue UX. Always rewrite multi-word nurse labels (`Charge Nurse`, `Senior Nurse`, `Head Nurse`) to a non-overlapping label (`Mentor`, `Doctor`, etc.) before saving the step. The Y-handover `§5.14` documents this in detail.

20. **`fish.audio` "Reference not found" cascades to every line when `FISH_AUDIO_VOICE_PATIENT` is empty** — The audio batch route looks up `VOICE_IDS[voice]`. If `FISH_AUDIO_VOICE_PATIENT` is missing or empty in production env, lines that map to the patient voice send an empty `reference_id` to fish.audio, which returns 400 for every single one. The route now uses `||` instead of `??` (so empty strings fall back to nurse voice), and unknown roles like `Family`, `Passerby`, `Bystander`, `Parent`, `Child` are explicitly mapped to patient voice. If you ever see the `Reference not found` error in batch logs, first check whether the production `FISH_AUDIO_VOICE_PATIENT` env var is actually set (it's been missing on production at least once).

21. **The admin audio batch UI defaults are sticky** — `/admin/audio` has a `useState<string[]>([...])` for the default selected step types. If `script_read` isn't in that initial array, the batch silently reports "all done" while every script line is missing audio. As of 2026-05-05 the default is `['scenario_intro', 'audio_shadow', 'script_read']`. Don't shorten this without checking.

22. **`audio_shadow` hover translations require `transcriptSegments`, not `line_N_vi`** — `script_read` steps store per-line VI as `line_N_vi` keys in `config`. `audio_shadow` steps store phrase-level translations as a `transcriptSegments: [{en, vi}]` array. The translation admin batch handles both, but counting "missing translations" must check the right field per step type — a step with `transcript` but no `transcriptSegments` is still untranslated. The `/api/translate` route was extended on 2026-05-04 to populate `transcriptSegments` from `transcript` when missing.

### ✅ What Works Well — Keep Doing These

1. **Give the agent a vivid product persona** — "You are a Senior Gamification Engineer who thinks in habit loops" produces far better output than "implement a rewards system". The agent performs better when it understands its identity.

2. **Show "what already exists" with real file paths and line numbers** — Agents that know exactly where to integrate write cleaner code than agents guessing the structure.

3. **Define "Out of Scope" explicitly** — This prevents feature creep and scope bleed between agents. If admin visibility is not part of this task, say it clearly.

4. **Include exact SQL for migrations** — Agents that receive exact SQL are 10× more likely to produce a compatible schema than agents asked to "design a table for X".

5. **Provide a testing checklist** — Agents without one declare "done" without verifying. Agents with a checklist catch their own bugs.

6. **Brainstorming sections work for creative features** — For features like rewards or pairs page redesign, including a "brainstorm before building" instruction produces more thoughtful UIs. For mechanical features (adding a column, fixing a bug), skip the brainstorm.

7. **Reference the test account** — Every handover should remind the agent to use `test@test.com / password` for local testing.

---

## Pending Features / Ideas Not Yet Assigned

These are features Tarun has mentioned or that logically follow from the current build. Assign agents for these as Tarun prioritises them.

### 🟢 RESOLVED (kept for context — do not re-assign)

- ~~**Agent Y — Vercel / DevOps Triage**~~ — partially resolved. Production Branch on Vercel is still set to `main` and still erroring on every push, but we now ship via `agent-x-integration` + `vercel promote`. See Lesson 16 for the canonical shipping pattern. If a future agent has admin access to Vercel project settings, the cleanest fix is to switch Production Branch to `agent-x-integration` (or merge `agent-x-integration` into `nursemed` and switch back). Until then, the promote-from-CLI workflow works.
- ~~**Agent Z — Lesson 7.2 audio regeneration**~~ — superseded. The full audio batch generator at `/admin/audio` now handles M1-M12 audio in one click per module; Tarun runs this himself.
- ~~**Module 1-12 redesign to a unified blueprint**~~ — done by Agent Y across 5 sessions. All 96 lessons follow the M1 pattern. See `HANDOVER_Y_MODULE2_AND_BEYOND.md` for the spec, and the `Y` row in the agent table above for the verified outcome.

---

### 🔥 IMMEDIATE NEXT (live in production, ready for QA / batch fill)

**Audio + translation batch fill for Modules 8-12** *(Tarun is running this)*

After the M2-M12 redesign, the consolidated admin work is:

| Module | Translate (audio_shadow segments) | Generate (script_read line audio) |
|---|---|---|
| M8 | All `audio_shadow` | All `script_read` |
| M9 | 1 `audio_shadow` | 3 `script_read` (L3, L5, L6) |
| M10 | 2 `audio_shadow` (L1, L4) | 4 `script_read` (L3, L5, L6, L7) |
| M11 | 2 `audio_shadow` (L1, L4) | 4 `script_read` (L3, L5, L6, L7) |
| M12 | 2 `audio_shadow` (L1, L4) | 4 `script_read` (L3, L5, L6, L7) |

All click-and-wait via the `/admin/audio` page. Tarun will report any errors. If `fish.audio` returns "Reference not found" again, see Lesson 20.

---

### HIGH PRIORITY

**Agent P — Admin Learner Regularity View** *(was N, then O, bumped by profile page and animation fix)*
Tarun said: "work on this separately after the learning schedule/calendar view". The DB view `nursed_learner_activity_summary` already exists (migration 050). The admin UI needs to be built at `/admin/learners` showing which learners have been active, their streak, preferred days, and last seen. Hospital admin sees only their hospital's learners. No admin UI was built in Agent N — this is still fully pending.

**Agent O — Complete Audio Recording (finishing Agent F's work)**
Audio recording placeholders exist throughout the emergency course. MediaRecorder needs to be wired to Supabase Storage. The `recording_submit` step type needs to work end-to-end: record → upload → save to `nursed_submissions` → allow playback.

**Agent P — Navigation Fixes (finishing Agent G's work)**
The lesson player currently has no back button between steps, no exit-to-module button, and no module overview page. Agent G's handover described the ideal navigation map — this agent implements it.

### MEDIUM PRIORITY

**Agent Q — Slug URL Implementation (finishing Agent H's work)**
UUIDs still appear in URLs like `/learn/courses/9113d5cb.../lessons/22cb2740...`. Agent H's handover describes the slug strategy. This agent implements it: adding slug columns to modules and lessons, updating all Link hrefs, and adding redirect handlers for old UUID URLs.

**Agent R — Pairs Page Redesign (Agent I's scope)**
The `/learn/pairs` page needs a complete UI rethink. Agent I's handover has the brainstorm. This agent implements the redesigned page using the existing `nursed_pair_groups` and `nursed_pair_sessions` backend.

**Agent S — Group Practice UI (Agent E's scope)**
The peer audio recording and rating flow for group practice needs to be built. Agent E's handover has the full spec. This builds the group session UI where learners record, listen to peers, and rate them.

### LOWER PRIORITY / FUTURE

- **Coupon marketplace UI** — The backend for coupons exists (migration 048, `lib/db/rewards.ts`). The learner-facing `/learn/rewards` page showing star balance, earned rewards, and redeemable coupons needs building.
- **Hospital admin dashboard** — View hospital learners' progress, regularity, completion rates.
- **OSCE exam practice mode** — A timed exam mode that pulls from existing lesson steps.
- **Push notifications / email nudges** — Remind learners on their scheduled days.
- **Real-user QA pass on Modules 2-12** — Now that the redesign is live, learners testing M2-M12 will surface UX issues the same way they did for M1 (incorrect cloze options, missing audio icons, role parsing edge cases, etc.). Track issues per module and re-run the QA cycle: live spot-check → SQL update → admin batch run → verify. The `lessons learned 18-22` are the most likely classes of issue.
- **Real production branch on Vercel** — Either switch Vercel's Production Branch from `main` to `agent-x-integration` (or merge `agent-x-integration` into `nursemed` and pick that), so future pushes auto-deploy without the `vercel promote` ceremony. Requires Vercel project settings access.
- **Profession-agnostic rebrand follow-through** — The hero copy on `/` was rewritten from "Medical English for Nurses" to "English for Working Professionals" on 2026-05-04, but the `<title>` metadata, favicon, and many internal i18n strings still say "NurseEd"/"Medical English". If the `pro.tuto.asia` domain switch goes ahead, do a sweep of `lib/i18n/translations.ts` and `app/layout.tsx` to make every string profession-neutral.

---

## How to Talk to Tarun

Tarun is the product owner and sole stakeholder. He thinks fast and has strong UX intuition. He will describe features conversationally, not technically. Your job is to translate.

**What he says → what he means:**
- "make it more eye-pleasing" → specific UI polish with better visual hierarchy, spacing, colour use
- "link it to rewards" → write to the rewards tables when the action completes
- "keep it wired for admin" → do not build the admin UI, but design the DB so it can be added later without a schema change
- "i want a new agent as good as you or even better" → write a document so clear that a cold-start agent with no prior context can build the feature correctly on first attempt

**Communication style:**
- Be concise. He reads fast and has low tolerance for long preambles.
- Confirm scope before writing a handover. One paragraph of "here is what I understood, let me know if I am off" saves 40 lines of wrong document.
- Never say "coming soon" or "placeholder" in anything you hand to a dev agent.
- If he says "do you understand?" — answer in one sentence and ask exactly one clarifying question if anything is ambiguous.

---

## Guardrails for You (the Orchestrator)

- **Never write code directly** — Your output is documents, not code. If Tarun asks you to fix a bug, do it — but your primary value is the handover documents.
- **Never create documentation files Tarun did not ask for** — No README, no summary, no changelog unless explicitly requested.
- **Always check the existing handover files** before writing a new one — avoid duplicating scope already assigned.
- **Always read the `supabase/migrations/` folder** before specifying DB changes — know the last migration number.
- **Always include the test account credentials** in every handover.
- **Run `npm run build` advice in every handover** — agents must verify no TypeScript or build errors before declaring done.
- **Never suggest adding dependencies** without flagging it to Tarun first — the package.json is stable.

---

## Definition of a Great Handover Document

A great handover document has these properties:

1. **A cold-start agent with no prior context can read it and build the feature correctly** — no assumptions, no "see previous chat"
2. **Every file the agent will touch is named** — no "create a component somewhere"
3. **Every DB change is written as exact SQL** — no "add a column for X"
4. **The testing checklist covers happy path + 2 edge cases minimum**
5. **Out of scope is defined** — the agent knows where to stop
6. **The acceptance criteria are binary** — either the feature works as described or it does not. No vague "it should feel good".

---

*This document was authored by the previous Orchestrator Agent. Improve upon it with each session.*

---

## Handover History (Orchestrator log)

Append a one-line entry every session so the next orchestrator can see what the previous one did without reading transcripts.

| Date | Orchestrator | What happened |
|---|---|---|
| 2026-05-05 | (Cursor agent) | **SHIP DAY.** Verified Agent Y's M12 audit (final module — clean: 0 broken flashcards, 0 multi-word nurse roles, 24/24 warm-up cards genuinely sourced, all M11 self-caught vi-shift bugs resolved including the "we will kill him" → "we will call him" L4 catch). **Promoted everything to production:** 4 commits pushed to `agent-x-integration` (commits `3542056` learner polish + `6a1526d` admin video & hero + `2446e9d` audio/translate hardening + `b31c110` handover docs T/U/Y), preview built clean in 43s, then `vercel promote dpl_7ApCqWjMMAdeUez4wxdigixqkCvK --scope tarun-tagejas-projects --yes` created production deployment `dpl_6jvmqWpRZzAqCSd6NshDwBejXWMQ` (also 43s, READY). `med.tuto.asia` is now serving the redesign. Verified `/api/site-settings/homepage` returns the uploaded intro video URL anonymously, and `/admin/site` returns 307 (auth-gated). Updated this handover with: production-deploy-via-promote workflow, new lessons 16-22 (Vercel promote scope flag, vercel rebuild on promote, flashcard schema fallback, multi-word nurse role gotcha, fish.audio voice-id env var trap, admin audio batch sticky default, audio_shadow vs script_read translation key shapes), refreshed agent table (T/U/Y now ✅), refreshed pending list (Agent Y/Z DevOps blockers superseded). The remaining open work item is the consolidated `/admin/audio` batch run for M8-M12 (Tarun is running this himself). |
| 2026-05-04 | (Cursor agent) | Fixed Issues 1&4 from Tarun's PDF review: quiz/quick-response/odd-one-out options now always render English-only regardless of language toggle; question prompts show EN primary + VI subtitle in VI mode; explanations bilingual. Fixed in `QuizStep.tsx`, `QuickResponseStep.tsx`, `OddOneOutStep.tsx`. Created Handover T (`HANDOVER_T_SCRIPTREAD_INTERACTIVE_RECORDING.md`): ScriptRead three-mode flow (Listen → Read Along with per-sentence nurse recording → Speak Together with peer review). Created Handover U (`HANDOVER_U_SCRIPTREAD_NURSE_LINE_MIC.md`): per-nurse-turn mic buttons gating the Done button in the dialogue view. No new migrations. No commits made — dev server running on `nursemed-module1-practice-pilot-x`. |
| 2026-05-01 | (Cursor agent) | Started Module 1 interactive-practice pilot on branch/worktree `nursemed-module1-practice-pilot-x` based on `agent-x-integration` because `nursemed` does not yet render Agent X step types. Live Supabase data changed for Emergency Nursing Communication Module 1 lessons 1-3: created `quick_response` step `ff50e9dc-cccb-4624-801f-45f97214bef7` after L1 video, created `spot_the_mistake` step `b7c0ab42-a8af-42dc-ad0e-669f844c180f` after L2 video, and configured existing L3 `quick_response` step `4c621894-18ee-46e9-90e4-32205fec3625`. Rollback backup saved locally at `apps/med/.tmp/module1-l1-l3-step-backup-20260501-140942.json`; do not commit the backup. Subtitle audit: `VideoStep` reads only `config.subtitle_vtt_vi` for visible VI captions; 53 video steps exist in Modules 1-9, and most have only placeholder `WEBVTT\n` VI subtitles. M1L1 video has real VI VTT; M1L2 video is placeholder-only; M1L3 has no video. No commit made. |
| 2026-04-26 | (Cursor agent) | Reviewed Agents W (interactive exercise polish) and X (4 new step types) — both built, builds pass, zero new TS regressions. Reviewed lesson 7.2 of the Emergency Nursing Communication course; rewrote the `script_read` step into a 6-line SBAR-style stroke-call dialogue with VI translations for every line, and rewrote the matching `cloze` step with 7 blanks against the new script. Audio re-record was attempted via fish.audio (`POST /api/audio/generate`) but blocked: discovered (a) `med` Vercel project's Production Branch was silently switched from `nursemed` → `main` around Apr 21, causing every build since to fail; (b) FISH_AUDIO_* env vars were mis-scoped to Preview · branch=`nursemed1.2`. Tarun re-scoped the FISH vars to Production. Created `Agent Y` (Vercel/DevOps triage) and `Agent Z` (audio regen for 7.2) entries above. Added 5 new lessons (#11–#15). Created a separate orchestrator handover for the main Tuto project at `docs/dev-agent-reviews/HANDOVER_ORCHESTRATOR_AGENT.md` (root-level, not this file) so the two projects don't share orchestration. |


this is the file
