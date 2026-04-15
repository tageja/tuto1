# NurseEd Agent Handover Document
**Last updated:** April 2026  
**App:** `med.tuto.asia` (nursemed app)  
**Active branch:** `nursemed1.2`  
**Production branch:** `nursemed` (promote after QA)  
**Repo:** `github.com/tageja/tuto1` (monorepo, nursemed lives in `apps/med/`)

---

## Quick Orientation

```
apps/med/
├── app/                          Next.js App Router pages
│   ├── page.tsx                  Landing page
│   ├── learn/                    Student-facing learning UI
│   │   ├── courses/[courseId]/   Course overview
│   │   ├── courses/[courseId]/lessons/[lessonId]/  Lesson player
│   │   ├── pairs/                Group/pair practice page (skeleton)
│   │   └── page.tsx              Course list
│   ├── admin/                    Admin tools
│   │   ├── animations/           HeyGen prompt builder + video uploader
│   │   ├── audio/                Fish Audio TTS generator
│   │   ├── courses/              Course/lesson/step CRUD
│   │   ├── hospitals/            Hospital management
│   │   └── hospital/             Hospital dashboard (learners, speaking, analytics)
│   ├── api/                      API routes
│   │   ├── audio/manifest/       Fish Audio TTS → Supabase storage
│   │   ├── video/upload/         HeyGen video → Supabase + VTT generation
│   │   ├── steps/generate-practice/  Auto-create quiz+cloze from script
│   │   ├── lessons/              Lesson CRUD
│   │   ├── steps/                Step CRUD
│   │   └── pairs/                Group/pair CRUD
│   └── pitchdeck/                Investor pitch deck (PDF embed)
├── components/
│   ├── learn/
│   │   ├── LessonPlayer.tsx      Master step renderer — add new step types here
│   │   └── steps/                11 step type components (see below)
│   ├── animations/               SVG avatar system + ConversationAnimator
│   │   ├── avatars/              NurseAvatar, PatientAvatar, DoctorAvatar, FamilyAvatar
│   │   ├── ConversationAnimator.tsx  Plays animation manifests with audio sync
│   │   └── types.ts              AnimationSegment, AnimationManifest, Speaker
│   └── admin/
│       ├── HeyGenPrompt.tsx      Character-bibles + timed script → copyable prompt
│       └── VideoUploader.tsx     Drag-drop upload → Supabase + VTT + practice gen
├── lib/
│   └── supabase.ts               Types: NursedLessonStep, StepType, NursedPairGroup …
├── contexts/
│   └── LanguageContext.tsx       EN/VI toggle — useLang() everywhere
├── data/
│   └── animation-scripts.ts     Pre-written dialogue scripts library (auto-loads in admin)
└── public/
    └── pitchdeck.pdf
```

---

## What Is Built and Working

### Core Learning Engine
| Step type | Component | Status |
|-----------|-----------|--------|
| `scenario_intro` | ScenarioIntroStep | ✅ Full |
| `video` | VideoStep | ✅ Full — supports VI VTT subtitles, language toggle |
| `audio_shadow` | AudioShadowStep | ✅ Full |
| `script_read` | ScriptReadStep | ✅ Full — sentence-by-sentence playback |
| `cloze` | ClozeStep | ✅ Full — `config.clozeText` with `[answer]` syntax |
| `quiz` | QuizStep | ✅ Full — `config.questions[]` MCQ array |
| `mission` | MissionStep | ✅ Full |
| `self_reflection` | SelfReflectionStep | ✅ Full |
| `recording_submit` | RecordingStep | ⚠️ UI only — records audio locally, self-assessment rubric works, but audio is **not uploaded to Supabase** and not visible to teachers |
| `no_script` | NoScriptStep | ✅ Full |
| `conversation_animation` | ConversationAnimationStep | ✅ Full — plays SVG avatar animations from `config.animation_manifest` |

### Animation System
- **SVG cartoon avatars**: Nurse, Patient, Doctor, Family — each has idle/talking/listening mouth states
- **ConversationAnimator**: plays segments sequentially, syncs with Fish Audio TTS if `audioUrl` present
- **HeyGen integration**: admin builder generates detailed character+scene prompt → export to clipboard → upload rendered MP4
- **Vietnamese subtitles**: auto-generated WEBVTT from script segments at upload time, stored in `step.config.subtitle_vtt_vi`, rendered by `VideoStep`
- **Practice auto-gen**: after uploading a HeyGen video, one click creates phrase-matching quiz + fill-in-blank cloze steps

### Admin Tools
- `/admin/courses` — full CRUD: courses → modules → lessons → steps
- `/admin/animations` — HeyGen mode (prompt gen + upload) and custom SVG mode (audio generation)
- `/admin/audio` — Fish Audio TTS generation page
- `/admin/hospitals` — hospital CRUD
- `/admin/hospital/learners` — per-hospital learner management

### Infrastructure
- **Database**: Supabase (Postgres) — all schema in `apps/med/lib/supabase.ts`
- **Storage**: Supabase bucket `nursed-assets` — audio at `animation/{stepId}/seg_*.mp3`, video at `animation/{stepId}/heygen-video.mp4`
- **TTS**: Fish Audio API (`FISH_AUDIO_API_KEY`, `FISH_AUDIO_VOICE_NURSE`, `FISH_AUDIO_VOICE_PATIENT`)
- **Deployment**: Vercel — `apps/med` is the root directory for the `med` project, production branch = `nursemed`
- **Languages**: EN/VI toggle lives in `LanguageContext`, all UI strings in `config/translations.ts`

---

## Animation Content Status

See `docs/nursed/ANIMATION_TRACKER.csv` for the full 79-row tracker.

| Status | Count |
|--------|-------|
| Done | 2 (Batch 1 Scene Card + HeyGen video for Module 1 Lesson 1) |
| Pending | 77 |

**Owner responsibility**: Creating the 77 remaining HeyGen videos is the **content creator's task** (not engineering). The workflow is:
1. Go to `med.tuto.asia/admin/animations`
2. Select Course → Lesson → Step (script auto-loads from `data/animation-scripts.ts`)
3. Copy the HeyGen prompt → render video in HeyGen
4. Upload MP4 → Vietnamese VTT and practice steps auto-generate

Dialogue scripts exist for Module 1 Lesson 1 only. **All other module scripts need to be written** and added to `apps/med/data/animation-scripts.ts`.

---

## Pending Engineering Work

### 1. Authentication — HIGH PRIORITY (nothing works without this)
**Status:** Not started. No login/register screens. No session management.  
**What's needed:**
- Supabase Auth (`@supabase/auth-helpers-nextjs`) — email/password + OTP (for Vietnamese nurses without corporate email)
- `middleware.ts` to protect `/learn/**` and `/admin/**` routes
- `/auth/login`, `/auth/register`, `/auth/verify` pages
- User roles: `learner`, `teacher`, `hospital_admin`, `super_admin`
- Store role in `user_metadata` or a `profiles` table
- Row-level security (RLS) on Supabase tables — currently all data is open
- Session context: replace any hardcoded userId with real Supabase session

**Suggested stack:** Supabase Auth (native, already installed) + Next.js middleware

---

### 2. Learner Audio Recording — Upload + Review Pipeline
**Status:** `RecordingStep.tsx` has UI (mic button, playback, self-assessment rubric) but audio blob is **not uploaded anywhere**. Teacher cannot hear recordings.  
**What's needed:**
- Upload recorded audio blob to Supabase Storage: `recordings/{userId}/{stepId}/{timestamp}.webm`
- Save metadata in a `nursed_recordings` table: `(id, user_id, step_id, lesson_id, storage_path, duration_ms, rubric_scores, created_at)`
- Teacher review UI (could be part of hospital admin): list recordings per learner, audio player, feedback field
- Add to `/admin/hospital/speaking` page (skeleton already exists)

---

### 3. Group / Pair Practice
**Status:** `/learn/pairs` page exists with create-group / join-by-code UI and session file upload. Backend API routes in `/api/pairs/` exist. But no real-time interaction or challenge system.  
**What's needed:**
- **Groups model**: learners join a group (hospital + cohort). Group has a teacher/facilitator.
- **Pair session**: two learners in a lesson step can record themselves doing a roleplay together. Each records their own role (nurse or patient), sessions are linked.
- **Challenge system** (brainstorm needed with owner): one learner records a line → challenges another to respond → system stitches audio → teacher reviews the pair
- **Suggested schema:**
  ```sql
  nursed_groups (id, hospital_id, name, join_code, teacher_id, created_at)
  nursed_group_members (group_id, user_id, role, joined_at)
  nursed_pair_sessions (id, group_id, lesson_step_id, initiator_id, partner_id, status, created_at)
  nursed_pair_recordings (id, session_id, user_id, role, storage_path, duration_ms, created_at)
  ```
- Real-time presence (who's online in group): Supabase Realtime channels

---

### 4. Rewards / Motivation System
**Status:** Not started.  
**What's needed:**
- XP points per step completion (configurable per step type)
- Streak tracking (daily login + completion streak)
- Badges: "First Recording", "Pair Champion", "Week Warrior", "Module Complete"
- Leaderboard: within group, within hospital
- Progress bar shown in course/lesson pages (partial — lesson page has some progress UI but it's not persisted to DB)
- **Suggested schema:**
  ```sql
  nursed_user_xp (user_id, total_xp, streak_days, last_active_date)
  nursed_completions (id, user_id, lesson_step_id, completed_at, score_pct)
  nursed_badges (id, user_id, badge_key, earned_at)
  ```

---

### 5. Exercise Redesign (H5P or open-source alternatives)
**Status:** Quiz and Cloze step types exist but are basic. No drag-and-drop, no matching card games, no ordering exercises.  
**Options to evaluate:**
- **H5P** — rich content types (Drag Text, Memory Game, Dialogue Cards, Speaking cards), self-hosted via `h5p-standalone` npm package or iframe embed
- **Custom React components** — drag-and-drop using `@dnd-kit/core` (lightweight, no iframe)
- **Recommended new exercise types:**
  - `drag_order` — reorder dialogue lines into correct sequence
  - `matching` — drag English phrase to Vietnamese meaning
  - `speaking_card` — flash card: read the prompt, record your response, replay model answer
  - `listening_gap` — audio plays, learner fills the missing word they heard

**Suggested approach**: implement `drag_order` and `matching` as new StepTypes using `@dnd-kit` first (1-2 days), then evaluate H5P for richer types.

---

### 6. Progress Persistence
**Status:** Step completion triggers `onComplete()` in `LessonPlayer.tsx` which advances to next step. Nothing is saved to DB.  
**What's needed:**
- On `onComplete(stepId)`: write a row to `nursed_completions` (user_id + step_id + timestamp + score)
- Calculate lesson % complete from completions count vs total steps
- Resume from last incomplete step on page load
- Show completed lessons with a tick in the course overview

---

### 7. Onboarding Flow
**Status:** Not started. App opens directly to course list.  
**What's needed:**
- Welcome screen after first login: hospital selection, role confirmation, language preference
- Skill level self-assessment (3–5 short questions)
- "Your learning path" screen showing the recommended module to start

---

### 8. Mobile Responsiveness Audit
**Status:** App uses Tailwind and is broadly responsive, but not systematically tested on small screens.  
**What's needed:**
- Full audit of LessonPlayer and all step types on 375px viewport (iPhone SE)
- VideoStep, ConversationAnimator, ClozeStep tend to have horizontal overflow issues at small sizes
- Consider a bottom-sheet-style step navigator for mobile

---

## Key Environment Variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel env | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel env | Public anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env (server-only) | Admin DB access in API routes |
| `FISH_AUDIO_API_KEY` | Vercel env | Fish Audio TTS |
| `FISH_AUDIO_VOICE_NURSE` | Vercel env | Voice ID for nurse character |
| `FISH_AUDIO_VOICE_PATIENT` | Vercel env | Voice ID for patient character |
| `NEXT_PUBLIC_APP_URL` | Vercel env | Base URL for absolute links |

---

## Supabase Tables (core)

| Table | Purpose |
|-------|---------|
| `nursed_courses` | Top-level courses |
| `nursed_modules` | Modules within a course |
| `nursed_lessons` | Lessons within a module |
| `nursed_lesson_steps` | Steps within a lesson — `type` + `config` JSONB |
| `nursed_quiz_questions` | Quiz questions (can be linked to steps or standalone) |
| `nursed_pair_groups` | Pair practice groups |
| `nursed_pair_group_members` | Group membership |
| `nursed_pair_sessions` | Recorded pair sessions |
| `nursed_hospitals` | Hospital/school organisations |

---

## Deployment

- **Vercel project**: `med` — root directory set to `apps/med`
- **Production branch**: `nursemed`
- **Dev branch**: `nursemed1.2` — all new work goes here, then PR to `nursemed`
- **Promote to prod**: `vercel promote <deployment-url> --yes` or via Vercel dashboard → "Promote to Production"

---

## Recommended Priority Order for Next Agent

1. **Auth** — nothing else makes sense without real users (1–2 days)
2. **Progress persistence** — makes the app feel real (0.5 day once auth is done)
3. **Recording upload pipeline** — core value prop of the app (1 day)
4. **Groups / pair practice** — key differentiator (2–3 days)
5. **Rewards system** — retention driver (1 day)
6. **Exercise redesign** — UX improvement (2 days)
7. **Onboarding** — polish (1 day)
8. **Mobile audit** — polish (0.5 day)

Content creation (animations) runs in parallel and is the owner's responsibility.
