# Dev Agent Handover — Feature E: Group Practice (Peer Audio Review)

## Your role

You are a **Senior Full-Stack Engineer** designing and implementing a peer-based audio review system for the NurseEd learning platform.

**Skills you must apply:**

- **TypeScript** (strict typing, generics, API contracts)
- **Next.js App Router** (server components, client components, route handlers, middleware)
- **React** (hooks, state machines, context, real-time polling or subscriptions)
- **Supabase / Postgres** (schema design, RLS policies, foreign keys, storage buckets, real-time subscriptions)
- **REST API design** (resource-oriented routes, pagination, validation, error handling)
- **UX for learning products** (motivation loops, progress gates, clear feedback, accessibility)
- **Audio playback** (HTML5 `<audio>`, progress bars, waveform optional)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. It uses **Supabase** (Auth + Postgres + Storage) for data and file storage. Learners complete **courses → modules → lessons → steps**. Each module follows a pedagogical framework:

| Lessons | Stage | Focus |
|---------|-------|-------|
| 1–2 | `heads_up` | Language exposure |
| 3–5 | `heads_down` | Controlled practice (includes `recording_submit` steps) |
| 6–7 | `heads_together` | Pair/group practice |
| 8 | `assessment` | Mixed exam + self-reflection |

The monorepo also contains mobile (`src/`), dashboard (`apps/dashboard/`), and Firebase Functions. **This task is scoped to `apps/med` only.**

---

## Feature E — What you are building

A **group practice system** where learners:

1. **Record audio** during `recording_submit` steps (already partially working — see "Existing Infrastructure" below)
2. **Listen to audio recordings** uploaded by other learners in their group
3. **Rate each peer's recording** on a 1–5 scale (mandatory)
4. **Must complete both** (record + review at least 1 peer) before progressing to the next module

### Business rules

- **Mandatory peer review**: A learner cannot advance to the next module until they have:
  - Submitted their own audio recording for every `recording_submit` step in the current module
  - Reviewed **at least one** peer recording per `recording_submit` step
- **Rating scale**: 1–5 (simple star/number rating, no written feedback for MVP)
- **Module-level gate**: Some modules require peer review for every lesson; others only for specific lessons. The system should support per-lesson configuration of whether group practice is required.
- **Privacy**: Learners see recordings from their group members only (enforced by RLS)
- **Vietnamese UI**: All user-facing text must go through `lib/i18n/translations.ts` (EN + VI)

---

## Existing infrastructure you MUST reuse

### Database tables (already exist in `supabase/migrations/041_nursed_schema.sql`)

```sql
-- Groups
nursed_pair_groups (id, hospital_id, join_code, name, max_size, active, created_at)
nursed_pair_members (id, pair_group_id, user_id, joined_at)
nursed_pair_sessions (id, pair_group_id, lesson_id, status, recording_path, notes, created_by, created_at)

-- Submissions (has pair_session_id column)
nursed_submissions (id, user_id, lesson_id, step_id, type, storage_path, transcript,
                    keyword_score, quiz_score, rubric, pair_session_id, created_at)
```

### TypeScript types (`apps/med/lib/supabase.ts`)

```typescript
NursedPairGroup   // { id, hospital_id, join_code, name, max_size, active, created_at }
NursedPairSession // { id, pair_group_id, lesson_id, status, recording_path, notes, created_by, created_at }
NursedSubmission  // { ..., pair_session_id, storage_path, ... }
```

### API routes (already exist)

| Route | Method | What it does |
|-------|--------|-------------|
| `app/api/pairs/route.ts` | GET | List groups (optional `hospitalId` filter) |
| `app/api/pairs/route.ts` | POST | Create group or join with `{ action: 'join', joinCode, userId }` |
| `app/api/assets/upload/route.ts` | POST | Upload file to Supabase Storage bucket `nursed-assets` |
| `app/api/submissions/route.ts` | POST | Save a submission row (recording, quiz, mission) |
| `app/api/progress/route.ts` | GET/POST | Read/upsert learner progress |

### DB helpers (`apps/med/lib/db/hospitals.ts`)

- `getPairGroups(hospitalId?)` — with joined members
- `createPairGroup({ name, hospital_id, max_size })` — generates join code
- `joinPairGroup(joinCode, userId)` — validates capacity

### Learner UI (partially exists)

- **`apps/med/app/learn/pairs/page.tsx`** — Create/join group + file upload (upload is NOT wired to `nursed_pair_sessions`)
- **`apps/med/components/learn/steps/RecordingStep.tsx`** — Full browser recording via `MediaRecorder` (webm), 30s cap, playback, rubric self-eval, upload to `/api/assets/upload`, then POST `/api/submissions`

### Storage (`apps/med/lib/storage.ts`)

- Bucket: `nursed-assets` (must exist in Supabase — created manually via dashboard)
- `uploadAsset(file, path, contentType)` → returns `publicUrl`
- `buildAssetPath(type, filename)` → `audios/{timestamp}_{filename}`
- `saveAssetRecord(payload)` → inserts into `nursed_content_assets`

---

## What you need to design and build

### 1. Schema additions (new migration)

You will likely need a **peer reviews** table. Suggested shape:

```sql
nursed_peer_reviews (
  id            uuid PRIMARY KEY,
  reviewer_id   uuid REFERENCES auth.users(id),
  submission_id uuid REFERENCES nursed_submissions(id),
  rating        int CHECK (rating BETWEEN 1 AND 5),
  created_at    timestamptz DEFAULT now(),
  UNIQUE(reviewer_id, submission_id)  -- one review per peer per submission
)
```

Also consider:
- Whether `nursed_pair_sessions` needs to be extended or if the existing `nursed_submissions.pair_session_id` is sufficient
- A module-level progress gate check (could be a computed query, not a new table)

### 2. API routes to create

| Route | Method | Purpose |
|-------|--------|---------|
| `app/api/peer-recordings/route.ts` | GET | List recordings from group members for a given lesson/step |
| `app/api/peer-reviews/route.ts` | POST | Submit a 1–5 rating for a peer's recording |
| `app/api/peer-reviews/route.ts` | GET | Get reviews given/received for progress gate check |
| `app/api/module-progress/route.ts` | GET | Check if all recording + review requirements are met for a module |

### 3. UI components to create

| Component | Purpose |
|-----------|---------|
| `PeerRecordingsPanel` | List group members' recordings for a step, with play button and rate UI |
| `PeerRatingWidget` | 1–5 star/number selector with submit |
| `ModuleGateBanner` | Shows "Complete peer review to unlock next module" when gate is not met |
| `GroupPracticeStatus` | Dashboard widget showing recording/review completion per lesson in a module |

### 4. Integration points

- **After `RecordingStep` submission**: Show `PeerRecordingsPanel` (or link to it)
- **Module transition in learner flow**: Check gate before allowing navigation to next module
- **Lesson/module list view**: Show completion indicators (recorded + reviewed)

---

## Critical constraints and guardrails

### DO

- Reuse existing `nursed_pair_groups` / `nursed_pair_members` / `nursed_submissions` tables
- Reuse `RecordingStep.tsx` for audio capture (it already works with `MediaRecorder`)
- Reuse `uploadAsset` / `saveAssetRecord` for storage
- Add all new UI text to `lib/i18n/translations.ts` in both EN and VI
- Use Supabase RLS to enforce group-level privacy (learners only see their group's recordings)
- Use Supabase Auth (`useAuth` context) for user identification — never trust client-sent `userId`
- Follow existing API patterns in `app/api/` routes (try/catch, NextResponse.json, status codes)
- Follow existing DB helper patterns in `lib/db/*.ts`
- Write the migration file in `supabase/migrations/` with sequential numbering (check existing highest number first)

### DO NOT

- Do NOT create a separate audio recording mechanism — use the existing `RecordingStep` + `MediaRecorder` flow
- Do NOT install new audio libraries unless absolutely necessary (the browser API is sufficient)
- Do NOT modify Firebase Functions or mobile app code
- Do NOT bypass RLS for client-facing queries
- Do NOT hardcode strings in JSX — use the translation system
- Do NOT break existing step completion flow — the gate check should be a separate concern from individual step completion
- Do NOT over-engineer: this is MVP. Simple polling (not WebSocket) is fine for checking if peers have uploaded recordings
- Do NOT create documentation files unless asked

### Security

- All API routes must validate Supabase auth session (use `createClient` from `@supabase/ssr` with cookies)
- `SUPABASE_SERVICE_ROLE_KEY` is server-only; never expose to client
- Peer reviews must be validated: reviewer cannot review their own submission, submission must belong to their group
- Storage paths should include user ID to prevent overwrites: `recordings/{userId}/{stepId}/{timestamp}.webm`

---

## Recommended implementation order

1. **Schema**: Write migration for `nursed_peer_reviews` + RLS policies
2. **DB helpers**: `lib/db/peer-reviews.ts` — CRUD for reviews, query for group recordings
3. **API routes**: `/api/peer-recordings`, `/api/peer-reviews`, `/api/module-progress`
4. **UI — PeerRecordingsPanel**: List + play + rate
5. **UI — ModuleGateBanner**: Progress gate check
6. **Integration**: Wire into lesson flow and module transitions
7. **Translations**: All strings in EN + VI

---

## Files you should read first

| File | Why |
|------|-----|
| `apps/med/components/learn/steps/RecordingStep.tsx` | Existing recording flow — your recordings feed into the peer review system |
| `apps/med/app/learn/pairs/page.tsx` | Existing group UI — extend or replace |
| `apps/med/lib/db/hospitals.ts` | Existing pair group CRUD |
| `apps/med/app/api/pairs/route.ts` | Existing pair API |
| `apps/med/app/api/submissions/route.ts` | How submissions are saved |
| `apps/med/lib/storage.ts` | Storage upload/download helpers |
| `apps/med/lib/supabase.ts` | All TypeScript types |
| `apps/med/components/learn/LessonPlayer.tsx` | How steps advance and progress is tracked |
| `apps/med/docs/COURSE_ARCHITECTURE.md` | Module structure and which lessons have `recording_submit` |
| `supabase/migrations/041_nursed_schema.sql` | Full schema including pair tables |
| `apps/med/lib/i18n/translations.ts` | Translation system (add EN + VI strings here) |
| `apps/med/contexts/AuthContext.tsx` | Auth context for getting current user |

---

## Example user flow (for your reference)

1. Learner opens Module 1, Lesson 5 ("Your turn to speak")
2. Reaches `recording_submit` step → records audio → uploads → submission saved
3. After submission, sees "Peer Recordings" section: other group members' recordings for this step
4. Plays a peer's recording → rates it 1–5 → rating saved
5. Continues through remaining lessons in the module
6. At module boundary, system checks: "Has this learner recorded all required steps AND reviewed at least 1 peer per required step?"
7. If yes → proceed to Module 2. If no → shows gate banner with what's missing.

---

## Deliverable

A working end-to-end group practice system with:
- Database migration
- API routes
- Learner-facing UI (recording list, playback, rating)
- Module progress gate
- All text in EN + VI translations
- RLS policies for group privacy
