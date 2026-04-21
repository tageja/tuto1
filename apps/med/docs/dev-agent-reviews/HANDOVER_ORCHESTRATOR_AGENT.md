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
| Deployment | Vercel — `nursemed` branch → `med.tuto.asia` (production) |

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

## What Has Been Built (Agents A–O + Direct Fixes Summary)

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
| — | **Video upload fix**: Vercel 4.5MB body limit bypassed via signed Supabase Storage URLs. New routes: `GET /api/video/upload` (signed URL), `POST /api/video/link` (DB update). `VideoUploader.tsx` does 3-step direct upload. | ✅ Built |
| — | **Step creation fix**: Admin lesson URLs use slugs; POST `/api/steps` now resolves slug → UUID before DB insert. | ✅ Built |
| — | **Super admin lesson bypass**: `super_admin` role can access any published lesson without completing previous ones. Implemented in lesson page, `CourseOverviewClient.tsx`, `ModuleDetailClient.tsx`. Completed lessons still show as completed. | ✅ Built |
| — | **Admin drag-and-drop step reordering**: HTML5 DnD on step cards in admin lesson editor. Persists via `PUT /api/steps`. | ✅ Built |
| — | **Matching step auto-populate**: "Pull & translate" button in `MatchingEditor` extracts EN dialogue lines from sibling lesson steps, auto-translates to VI via `POST /api/translate/phrases` (MyMemory API). | ✅ Built |
| — | **Fill-in-the-blanks drag-and-drop (learner)**: `ClozeStep.tsx` fully rewritten to always use `@dnd-kit` word bank. Handles both `[word]` (new) and `___` (legacy) formats. Decoy words auto-generated. | ✅ Built |
| — | **Cloze editor fix**: Admin now saves to `config.clozeText` in `[word]` format. "Auto-generate Cloze" disabled when script is empty. "Pull script" button added. Learner reads `clozeText` first, falls back to `cloze`. | ✅ Built |
| — | **Rewards system fix (migration 052)**: Added `context_id` column to `nursed_user_rewards`; updated unique constraint to allow repeatable rewards per lesson. Stars now correctly credit after lesson completion. | ✅ Built |
| — | **Reward renaming**: "First Lesson" reward renamed to "Lesson Complete" / "Hoàn thành bài học" in `nursed_rewards`. | ✅ Built |
| — | **Lesson completion tracking UI**: Module page and course overview page now show green checkmark, "Completed" label, and green "Review ↺" button for done lessons. Module accordion headers show `N/M done` + CheckCircle badge. | ✅ Built |
| — | **Home screen progress**: `GET /api/rewards/balance` returns `totalLessonsCompleted`. Stats chip shows real total with `+N Today` badge. Continue Learning card fetches course-specific `done/total` from `GET /api/progress/course` and shows real progress bar. | ✅ Built |
| Q | Performance SSR — Server Components for course/module pages, `revalidate` cache, hover prefetching | ✅ Handover created (see `HANDOVER_Q_PERFORMANCE_SSR.md`); `usePrefetchRoute` hook + sidebar wiring already done |
| W | Interactive Exercises — DragOrderStep (pool → numbered slots, two-region DnD via useDraggable/useDroppable, per-slot ✓/✗ with framer-motion scale-pulse + shake, tap-to-fill mobile fallback), MatchingStep (SVG `motion.path` bezier connector lines with pathLength 0→1 tween + dashed stub from selected card, resize-aware coord recompute), ClozeStep (rounded-2xl chip polish, animated perfect-score scale-pulse, word-bank gradient + label, fixed 2 hardcoded EN strings), AudioShadowStep (40-bar deterministic waveform seeded from `hashStr(audioUrl)`, circular pulsing play button, tabbed phase stepper with underline indicator, `// TODO Agent R` placeholder for pronunciation scoring), FlashCardStep (rounded-3xl, SpeakerButton, card-stack peek, framer-motion swipe + sprint-mode root branch). FlashCardEditor: pull-from-script via `POST /api/translate/phrases` (mirrors MatchingEditor) + sprint checkbox + duration input. 19 new i18n keys (EN+VI). **Design language for Agent X to mirror**: soft cards (rounded-2xl/3xl), shadow-sm→shadow-md hover lift, framer-motion `scale` pulse on correct, `x` shake on wrong (NOT red), amber tint for translation/correction feedback (red reserved for hard errors only), check/X icons from lucide-react, gradient-tinted score banners, deterministic shuffle on mount, `useReducedMotion()` everywhere. | ✅ Done 2026-04-20. Verified by orchestrator: `npm run build` passes (exit 0). All TS errors flagged by `tsc --noEmit` are pre-existing (translations.ts duplicate keys at lines 46/109/1078/1141, `lesson-feedback/route.ts`, `next.config.ts`, `StepEditor speakerRoles`) — NOT W regressions. |
| X | New Interactive Step Types — adds **4 step types** end-to-end: `quick_response`, `odd_one_out`, `sentence_builder`, `spot_the_mistake` (migration 053, types, translations, learner components, admin editors with pull-from-script reference panel for the 3 vocabulary-driven types, lesson builder picker entries, preview modal label map). Sentence Builder + Spot the Mistake added per Tarun's brainstorm picks 1 & 4. | ✅ Done 2026-04-20. Migration 053 applied + verified (18 types in constraint). 4 learner components + 4 admin editors shipped. ~80 EN+VI translation keys added. `npm run build` exits 0; tsc shows only the 15 pre-existing errors (zero regressions). Design notes: SpotTheMistakeEditor uses shift-click-merges-left-neighbour model; SentenceBuilderEditor uses `@dnd-kit/sortable` (already installed, no new packages); `badge-purple` + `badge-amber` added to `globals.css`. |

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
051_nursed_profile_extended.sql      ← Adds position, date_of_birth, bio + nursed_endorsements (Agent N)
052_add_context_id_to_user_rewards.sql ← Adds context_id to nursed_user_rewards, updates unique constraint
```

Next migration should be `053_*.sql` — **reserved for Agent X** (`053_nursed_step_types_interactive_v2.sql`). It extends the `nursed_lesson_steps.type` CHECK constraint from 14 → **18** types, adding `quick_response`, `odd_one_out`, `sentence_builder`, `spot_the_mistake`. No new tables, no new columns. Any other DB work should wait or use 054+.

> Note: file `052_add_context_id_to_user_rewards.sql` was applied via the Supabase SQL editor by a previous session but the file may not be checked into the `supabase/migrations/` folder on disk. If you don't see it locally, that's why — the schema change IS live.

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

### HIGH PRIORITY

**Agent R — Complete Audio Recording (finishing Agent F's work)**
Audio recording placeholders exist throughout the emergency course. MediaRecorder needs to be wired to Supabase Storage. The `recording_submit` step type needs to work end-to-end: record → upload → save to `nursed_submissions` → allow playback.

**Agent S — Admin Learner Regularity View**
Tarun said: "work on this separately after the learning schedule/calendar view". The DB view `nursed_learner_activity_summary` already exists (migration 050). The admin UI needs to be built at `/admin/learners` showing which learners have been active, their streak, preferred days, and last seen. Hospital admin sees only their hospital's learners.

**Agent Q — Performance SSR (partially done)**
`HANDOVER_Q_PERFORMANCE_SSR.md` exists and `usePrefetchRoute` + sidebar hover prefetching is already implemented. Remaining: convert course/module pages to full Server Components and wire `revalidate` cache headers.

### MEDIUM PRIORITY

**Agent T — Slug URL Implementation (finishing Agent H's work)**
UUIDs still appear in some URLs. Agent H's handover describes the slug strategy. Modules and lessons already have slug columns (added in migration 049). This agent updates all `Link` hrefs in learner pages to use slugs and adds redirect handlers for old UUID URLs.

**Agent U — Pairs Page Redesign (Agent I's scope)**
The `/learn/pairs` page needs a complete UI rethink. Agent I's handover has the brainstorm. This agent implements the redesigned page using the existing `nursed_pair_groups` and `nursed_pair_sessions` backend.

**Agent V — Group Practice UI (Agent E's scope)**
The peer audio recording and rating flow for group practice needs to be built. Agent E's handover has the full spec. This builds the group session UI where learners record, listen to peers, and rate them.

### LOWER PRIORITY / FUTURE

- **Coupon marketplace UI** — The backend for coupons exists (migration 048, `lib/db/rewards.ts`). The learner-facing `/learn/rewards` page showing star balance, earned rewards, and redeemable coupons needs building.
- **Hospital admin dashboard** — View hospital learners' progress, regularity, completion rates.
- **OSCE exam practice mode** — A timed exam mode that pulls from existing lesson steps.
- **Push notifications / email nudges** — Remind learners on their scheduled days.
- **Navigation fixes (finishing Agent G's work)** — Lesson player back button, exit-to-module button. Agent G's handover has the spec.

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

### Additional Lessons Learned (Session covering fixes + rewards + completion tracking)

11. **Silent DB schema errors are the worst bugs** — The rewards system appeared to work (toast showed "+10 stars") because the completion screen had a hardcoded fallback. The actual DB insert was silently failing due to a missing `context_id` column. Always check Supabase logs when a feature "looks like it works" but produces no real data. Apply schema changes first, code second.

12. **Role bypass logic must check completed state BEFORE the bypass** — The super_admin bypass that skipped sequential locking was placed before the completion check, so completed lessons appeared unlocked instead of completed. Always structure status functions as: `if completed → return 'completed'` first, then check role, then check locks.

13. **Drag-and-drop in learner context requires a library, not HTML5 DnD** — HTML5 drag-and-drop is unreliable on mobile/touch. Use `@dnd-kit/core` + `@dnd-kit/sortable` for learner-facing DnD. HTML5 DnD is acceptable for admin-only interfaces (keyboard-only users don't need it in admin).

14. **Data format mismatches between admin save and learner read cause invisible bugs** — Admin was saving `config.cloze` with `___` markers; learner was reading `config.clozeText` with `[word]` markers. Define the canonical format in both places simultaneously. Name the key consistently (e.g. always `clozeText`).

15. **Regex that matches `___` but not `___?` causes partial blank rendering** — When splitting text on underscores, use `/(_{2,})/` not `/^___+$/`. The former splits inline; the latter only matches whole tokens with no surrounding text.

### Additional Lessons Learned (Session covering Agents W + X assignment)

16. **Split brainstorm-and-build agents from new-feature agents.** When a feature has both a "what should it look like" question AND a "build new schema + types + admin + learner UI" question, splitting into two sequential handovers (W = polish + brainstorm, X = new types) prevents one agent from holding too much in their head and producing incoherent output. The first agent establishes the design language; the second matches it. The dependency must be explicit in both docs.

17. **Never assume the user wants random/whimsical content in vocabulary exercises.** Tarun explicitly rejected an Odd One Out screenshot showing a banana among medical icons. Medical English learners need exercises grounded in the medical vocabulary they're actually being taught. Rule of thumb: if the exercise tests vocabulary, the content must come from (or be suggested by) the lesson's actual scripts/transcripts. Always add a "Pull from lesson script" affordance to the admin editor.

18. **Admin authorability is not optional — it's the bar for "feature complete".** A new step type that only works with manually-seeded JSON in the database does not exist as far as Tarun is concerned. Every new step type must appear in the lesson builder dropdown, have a dedicated editor in `StepEditor.tsx`, and render in `StepPreviewModal.tsx`. Bake this into the Definition of Done for any step-type-introducing handover.

19. **Reuse the `siblingSteps` prop pattern.** `MatchingEditor` and `ClozeEditor` both pull script content from sibling steps in the same lesson via the `siblingSteps` prop already passed to every editor by `StepEditor`. New editors that need lesson context (Odd One Out, Flashcard pull-vocab, future Sentence Builder) should reuse this prop and the existing `extractEnglishLines` helper rather than inventing parallel mechanisms.

20. **Brainstorm before building creative features — but constrain the brainstorm.** Telling an agent "brainstorm exercise ideas" without a structured template produces 30 ideas of varying quality. Telling them "produce 8–12 ideas with these exact fields (name / one-line / why-it-fits / content-source / sketch / effort / risk) and stop for review" produces a Tarun-decidable doc.

21. **Verify "build passes" claims yourself.** When an agent reports "zero TS errors", run `npm run build` and `npx tsc --noEmit` from the orchestrator seat before crediting them. If errors appear, distinguish pre-existing rot from regressions by spot-checking which lines were touched. **Working verification trick when an agent adds many translation keys:** record the file's pre-existing error line numbers BEFORE the agent starts. After the agent reports done, re-run `tsc`. If the same KIND of errors appear at line numbers that have shifted by N lines (where N = number of keys added × ~1 line each), confirm by: (a) total error count is unchanged, (b) new line numbers map cleanly to old ones via a constant offset. This ruled out regressions for both Agent W and Agent X without manually inspecting hundreds of new lines. **Outstanding tech debt to fix when convenient (NOT urgent — Next.js build ignores these):**
    - `lib/i18n/translations.ts` has duplicate keys in BOTH the EN block AND the VI block: `navCourses`, `btnContinue`, `btnViewAllCourses`, `statsLessonsCompleted`, `learningPathTitle`, `feedbackSubmit`. Each appears 2–3 times. Pick the canonical value, delete the rest. Risk: silent value drift — different parts of the UI may render different strings from the same key depending on TS object-literal-last-wins semantics.
    - `app/api/lesson-feedback/route.ts:61` — discriminated-union narrowing bug.
    - `next.config.ts:7` — `eslint` field not on `NextConfig` type (probably `eslint: { ignoreDuringBuilds: true }` works at runtime but the typing is stale).
    - `components/admin/StepEditor.tsx` (line shifts as the file grows) — `speakerRoles` literal-union miss (`'family'` vs `'nurse' | 'patient' | 'doctor'`). Pre-existing.
    These should be fixed in a small standalone cleanup pass — assign to a future agent or do as a 30-minute chore between feature agents.

22. **The interactive-exercise overhaul (Agents W + X) shipped successfully because the work was split along a clean dependency edge.** W owned design language (polish 5 components + Vocab Sprint flag), X inherited that language to build 4 new step types. Splitting purely by "polish vs new" instead of by "frontend vs backend" or by "step-type-A vs step-type-B" worked because: (a) X had a concrete, code-verifiable design reference (W's shipped components) instead of a vague "match the vibe" instruction; (b) W never had to predict X's needs — they just shipped the best polished version of what existed; (c) the brainstorm doc + Tarun's pick step happened BETWEEN them, so X's scope was finalised AFTER W was already coding, not before. For future creative-feature overhauls, repeat this shape: polish-agent → user-approval gate on brainstorm → new-features-agent.

*This document was last updated when Agent X shipped 4 new interactive step types (`quick_response`, `odd_one_out`, `sentence_builder`, `spot_the_mistake`) via migration 053 — completing the interactive-exercise overhaul kicked off by Agent W. Both ✅ Done 2026-04-20.*
