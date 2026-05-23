# AI Course Creator — Agent Handover & Full Feature Spec
**Document owner:** Orchestrator Agent  
**Date:** 2026-05-22  
**Workspace:** `C:\Users\ASUS\tuto-nursemed-practice-pilot` (apps/med — Next.js 16, Vercel, Supabase)  
**Git branch:** `agent-x-integration` (single working branch — never commit to main)

---

## 1. WHAT YOU ARE BUILDING

An AI-powered course creation studio at `pro.tuto.asia`. Any user can apply to become a course creator. Once approved, they describe a course (profession, topic, industry, etc.), and the AI generates the **content** to fill a pre-defined course template — it does NOT invent the course structure from scratch.

### CORE ARCHITECTURE DECISION: Template-First Generation

**The skeleton is fixed. AI only fills in the content.**

Think of it like a Word document template — the boxes, step types, and lesson sequence are already drawn. AI fills in what goes in each box. This means:

- Generation takes ~30 seconds instead of minutes
- Every course has consistent pedagogical structure (same lesson stage pattern, same step types in the same order)
- Quality is predictable — only the domain knowledge changes, not the teaching approach
- AI never decides "what type of step should this be" — that is already decided by the template

**What the template defines (fixed):**
- Number of modules (9–12)
- Always 8 lessons per module
- Exact step types per lesson in exact order
- Which lessons get video (max 2), which get audio (max 2)
- Assessment structure (always the same 7-step pattern in L8)

**What AI generates (content only):**
- Course title and description
- Module titles and rationale
- Lesson titles and objectives
- Key phrases list per lesson
- The text content inside each step (question text, scenario descriptions, dialogue lines, vocabulary cards, quiz options, etc.)
- Video scripts (40–60 seconds)
- Audio scripts for shadowing

---

## 2. CURRENT PROJECT — WHAT ALREADY EXISTS

### 2.1 Tech Stack
- **Framework:** Next.js 16 App Router (`apps/med/`)
- **Database:** Supabase (project id: `fkjeggdxqifqqwhuqpgm`)
- **Auth:** Supabase Auth + custom `nursed_profiles` table with `role` field (`learner`, `hospital_admin`, `super_admin`)
- **Styling:** Tailwind CSS with custom design tokens (see `config/theme.ts`)
- **Dev server:** `npm run dev` from `apps/med/` → `http://localhost:3001`
- **Deployment:** Vercel, production at `pro.tuto.asia`
- **State management:** React Context (AuthContext, LanguageContext)
- **i18n:** `useLang()` hook → `lib/i18n/translations.ts` (EN + VI keys)

### 2.2 Existing Database Schema (relevant tables)

```sql
-- Courses
nursed_courses (id, title, title_vi, description, level, published, slug, hospital_id, created_at)

-- Modules  
nursed_modules (id, course_id, title, title_vi, order_index, created_at)

-- Lessons
nursed_lessons (
  id, module_id, title, title_vi, description, objective,
  order_index, stage, est_minutes, published, slug, created_at
)
-- stage values: 'heads_up' | 'heads_down' | 'heads_together' | 'assessment'

-- Steps (the atomic learning units inside each lesson)
nursed_lesson_steps (
  id, lesson_id, type, title, title_vi, order_index, config JSONB, created_at
)
```

### 2.3 Step Types — Full List + Config Shapes

The `type` field on `nursed_lesson_steps` accepts these values. The `config` JSONB field structure depends on the type:

| Type | Purpose | Key config fields |
|------|---------|-------------------|
| `scenario_intro` | Sets scene at lesson start | `title_en`, `title_vi`, `body_en`, `body_vi`, `imageUrl` |
| `flash_card` | Vocabulary/phrase flashcard | `cards: [{front_en, front_vi, back_en, back_vi}]` |
| `video` | HeyGen-generated or uploaded video | `videoUrl`, `audioUrl`, `subtitleUrl`, `subtitle_vtt_vi`, `key_phrases`, `line_*_en`, `line_*_vi` |
| `audio_shadow` | Listen-and-repeat audio drill | `audioUrl`, `transcript_en`, `transcript_vi`, `transcriptSegments[]` |
| `script_read` | Read-along script with lines | `lines: [{speaker, text_en, text_vi}]` |
| `quick_response` | Situational judgement MCQ | `prompt_en`, `prompt_vi`, `options: [{rating, text_en, text_vi, feedback_en, feedback_vi}]` (ratings: best/acceptable/poor/incorrect) |
| `quiz` | Multiple choice questions | `questions: [{id, type:'mcq', answer, options:[{id,text,text_vi}], prompt_en, prompt_vi, explanation_en, explanation_vi}]` |
| `spot_the_mistake` | Tap the wrong word | `questions: [{id, tokens:[{text, is_wrong}], sentence_en, sentence_vi, correction_en, correction_vi, explanation_en, explanation_vi}]` |
| `cloze` | Fill in the blanks | `clozeText` (with `[answer]` brackets), `decoyPool[]`, `instructions_en`, `instructions_vi` |
| `drag_order` | Reorder dialogue lines | `items: [{id, text}]`, `lines[]`, `correct_order[]`, `instructions_en`, `instructions_vi` |
| `matching` | Match EN phrases to VI | `pairs: [{en, vi}]` |
| `recording_submit` | Learner records voice response | `_instructions` (scenario text), `rubric: {clear, polite, complete, keywords}` |
| `self_reflection` | Post-module reflection sliders | `prompts: [{key, type:'slider'|'text', label_en, label_vi}]` |
| `no_script` | Open speaking — cue only | `cues[]`, `context_en`, `context_vi`, `reference_script` |
| `mission` | Real-world challenge | `missionEn`, `missionVi`, `mission_en`, `mission_vi` |
| `sentence_builder` | Construct a sentence from words | `words[]`, `correct_sentence` |
| `conversation_animation` | Animated dialogue | `turns: [{speaker, text_en, text_vi}]` |
| `odd_one_out` | Pick the word that does not belong | `groups: [{words[], odd_one_out}]` |

### 2.4 Existing Lesson Stage Pattern (MUST FOLLOW)

Every module has exactly **8 lessons** following this stage pattern:

| Lesson # | Stage | Purpose | Typical step types |
|----------|-------|---------|-------------------|
| 1 | `heads_up` | Introduction — first exposure | scenario_intro, flash_card, audio_shadow, video, quick_response, quiz, matching |
| 2 | `heads_up` | Key phrases in action | flash_card, audio_shadow, video, spot_the_mistake, quiz, script_read, drag_order, cloze |
| 3 | `heads_down` | Deeper understanding | flash_card, audio_shadow, cloze, script_read, quiz, spot_the_mistake |
| 4 | `heads_down` | Second scenario / new context | flash_card, video, cloze, script_read, drag_order |
| 5 | `heads_down` | Learner speaks / produces language | flash_card, cloze, script_read, no_script, recording_submit |
| 6 | `heads_together` | Pair practice round 1 | flash_card, video, script_read, no_script, recording_submit, cloze, matching |
| 7 | `heads_together` | Pair practice open scenario | flash_card, video, script_read, no_script, recording_submit, mission, matching |
| 8 | `assessment` | Module test + reflection | quiz (4–6 MCQs), spot_the_mistake, cloze, drag_order, matching (8 pairs), recording_submit, self_reflection |

**Video rule:** Max 2 video steps per lesson (typically in Lessons 1, 2 or 4, 6).  
**Audio rule:** Max 2 audio_shadow steps per lesson.  
**Assessment always ends with self_reflection** (4 sliders + 1 open text prompt).

### 2.5 Existing Admin Dashboard Structure

```
apps/med/
  app/
    admin/
      layout.tsx          ← AdminLayout (sidebar + auth gate for hospital_admin + super_admin)
      page.tsx            ← Admin home dashboard
      courses/
        page.tsx          ← Course list + create modal
        [courseId]/
          page.tsx        ← Course detail (modules list)
          lessons/
            [lessonId]/
              page.tsx    ← Lesson builder (step CRUD + drag reorder)
      audio/page.tsx      ← Batch audio generation
      analytics/page.tsx  ← Usage analytics
      students/page.tsx   ← Student management
  components/
    admin/
      AdminSidebar.tsx    ← Sidebar nav
      StepEditor.tsx      ← Step config editor (all step types)
      StepPreviewModal.tsx← Preview a step before saving
  app/
    api/
      courses/route.ts        ← GET all, POST create
      courses/[courseId]/route.ts ← PATCH, DELETE
```

### 2.6 Existing API Routes Pattern

All API routes use Supabase server client from `lib/supabase-server.ts`. Pattern:
```ts
import { createServerSupabaseClient } from '@/lib/supabase-server'
const supabase = await createServerSupabaseClient()
const { data, error } = await supabase.from('nursed_courses').select('*')
```

### 2.7 Auth Roles
- `learner` — default after signup
- `hospital_admin` — can access `/admin`
- `super_admin` — full access
- **New role to add:** `course_creator` — access to `/studio`

---

## 3. FEATURE SPECIFICATION — AI COURSE CREATOR STUDIO

### 3.1 User Journey Overview

```
Public landing (/become-creator)
  └── Creator application form (name, profession, org, why creating, topic area)
      └── On submit → creates row in creator_applications table
          └── Super admin approves → user's nursed_profiles.role = 'course_creator'

Creator logs in → sees "My Studio" in nav
  └── /studio — creator home (list of their courses + "Create New Course" button)
      └── /studio/new — Course intake form (Step 1)
          └── AI brainstorming + synopsis screen (Step 2)
              └── Refinement chat (Step 3)
                  └── Generation + media production (Step 4)
                      └── /studio/[courseId] — Course management
```

### 3.2 Step 1: Course Intake Form (`/studio/new`)

Fields the creator fills in:

```ts
interface CourseIntakeForm {
  profession: string          // e.g. "Registered Nurse", "Factory Safety Officer"
  industry: string            // e.g. "Healthcare", "Manufacturing", "Hospitality"
  topic: string               // e.g. "Emergency Communication in English"
  subtopic?: string           // e.g. "Triage language", "Consent communication"
  targetAgeGroup: string      // e.g. "22–35 year old working professionals"
  learnerLevel: 'beginner' | 'intermediate' | 'advanced'
  language: 'en' | 'vi' | 'bilingual'   // bilingual = EN taught with VI support
  numModules: 9 | 10 | 11 | 12
  estimatedMinutesPerLesson: number  // 10–20
  additionalContext?: string  // free text — anything extra the creator wants AI to know
}
```

UI: Clean multi-step form with progress indicator. Each field has a helpful placeholder describing what good input looks like.

### 3.3 Step 2: AI Synopsis Generation (titles + content outline only)

**API Route:** `POST /api/studio/brainstorm`  
**Model:** Gemini 1.5 Pro via `@ai-sdk/google` (Vercel AI SDK)  
**Response:** Streamed JSON — arrives fast because AI is only generating titles and phrases, NOT step configs

The AI receives the intake form and produces a lightweight synopsis — module/lesson titles, key phrases, and video scripts. It does NOT generate step configs here. That comes later from the template.

```ts
interface CourseSynopsis {
  courseTitle: string
  courseTitleVi: string
  courseDescription: string
  level: 'A1' | 'A2' | 'B1' | 'B2'
  templateId: string              // which course template to use (see Section 3A)
  totalModules: number
  estimatedHours: number
  modules: ModuleSynopsis[]
}

interface ModuleSynopsis {
  orderIndex: number
  title: string                   // e.g. "First Contact in an Emergency"
  titleVi: string
  rationale: string               // one sentence: why this module is here
  lessons: LessonSynopsis[]
}

interface LessonSynopsis {
  orderIndex: number
  title: string
  stage: 'heads_up' | 'heads_down' | 'heads_together' | 'assessment'
  objective: string               // what can the learner DO after this lesson
  keyPhrases: string[]            // exactly 5 phrases/sentences taught in this lesson
  videoScript?: string            // 40–60 second script — only for L1, L4, L6 (never others)
  audioScript?: string            // shadowing script — only for L1, L3 (never others)
  scenarioContext: string         // one sentence setting the scene (used for scenario_intro step)
}
```

**System prompt for brainstorm:**
```
You are an expert instructional designer for professional English language training.
You are creating a course synopsis (titles and key phrases only — NOT step content).

Course details:
- Profession: {profession}
- Industry: {industry}  
- Topic: {topic}
- Sub-topic: {subtopic}
- Learner age group: {targetAgeGroup}
- Level: {learnerLevel}
- Language: {language}
- Number of modules: {numModules}

Rules:
- Every module has exactly 8 lessons
- Lesson stages: L1–L2 = heads_up, L3–L5 = heads_down, L6–L7 = heads_together, L8 = assessment
- Each module builds on the last — sequence from basic to complex, high-stakes scenarios
- Key phrases must be directly usable in the learner's real job, not textbook examples
- Video scripts: write only for L1, L4, L6. Exactly 100–130 words (40–60 seconds spoken).
- Audio scripts: write only for L1, L3. Short dialogue 4–6 lines between nurse/professional and patient/colleague.
- Choose templateId from: 'professional_communication', 'safety_procedures', 'technical_skills', 'customer_service'
- Output valid JSON matching the CourseSynopsis schema. Stream one module at a time.
```

**Synopsis UI:**
- Left panel: module accordion list (click to expand → shows lesson titles + key phrases)
- Right panel: selected lesson detail (objective, key phrases, video/audio script preview)
- Bottom sticky bar: "Looks good — generate course" button + "Refine with AI" chat button
- While streaming: skeleton shimmer on each module card as it arrives (~3–5 seconds total)

---

### 3A. COURSE TEMPLATES (THE SKELETON — FIXED, NEVER CHANGED BY AI)

Templates live as JSON files in `apps/med/lib/studio/templates/`. Each defines the exact step types per lesson. AI fills the content fields inside each step — it never changes the step types or order.

#### Template 1: `professional_communication`
*For: healthcare workers, hospitality, customer service, anyone speaking English on the job*

```json
{
  "id": "professional_communication",
  "name": "Professional Communication",
  "lessons": {
    "1": { "stage": "heads_up", "steps": [
      { "type": "scenario_intro", "fillFields": ["title_en","title_vi","body_en","body_vi"] },
      { "type": "flash_card", "fillFields": ["cards[5]"] },
      { "type": "audio_shadow", "fillFields": ["transcript_en","transcript_vi","transcriptSegments"] },
      { "type": "video", "fillFields": ["key_phrases","line_1_en thru line_8_en","line_1_vi thru line_8_vi"], "hasVideoScript": true },
      { "type": "quick_response", "fillFields": ["prompt_en","prompt_vi","options[4]"] },
      { "type": "quiz", "fillFields": ["questions[3]"] },
      { "type": "matching", "fillFields": ["pairs[6]"] }
    ]},
    "2": { "stage": "heads_up", "steps": [
      { "type": "flash_card", "fillFields": ["cards[5]"] },
      { "type": "audio_shadow", "fillFields": ["transcript_en","transcript_vi","transcriptSegments"], "hasAudioScript": true },
      { "type": "spot_the_mistake", "fillFields": ["questions[2]"] },
      { "type": "quiz", "fillFields": ["questions[3]"] },
      { "type": "script_read", "fillFields": ["lines[6]"] },
      { "type": "drag_order", "fillFields": ["items[5]","correct_order"] },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] }
    ]},
    "3": { "stage": "heads_down", "steps": [
      { "type": "flash_card", "fillFields": ["cards[5]"] },
      { "type": "audio_shadow", "fillFields": ["transcript_en","transcript_vi","transcriptSegments"] },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] },
      { "type": "script_read", "fillFields": ["lines[6]"] },
      { "type": "quick_response", "fillFields": ["prompt_en","prompt_vi","options[4]"] },
      { "type": "quiz", "fillFields": ["questions[3]"] },
      { "type": "spot_the_mistake", "fillFields": ["questions[2]"] }
    ]},
    "4": { "stage": "heads_down", "steps": [
      { "type": "flash_card", "fillFields": ["cards[5]"] },
      { "type": "video", "fillFields": ["key_phrases","line_1_en thru line_8_en","line_1_vi thru line_8_vi"], "hasVideoScript": true },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] },
      { "type": "script_read", "fillFields": ["lines[6]"] },
      { "type": "drag_order", "fillFields": ["items[5]","correct_order"] },
      { "type": "matching", "fillFields": ["pairs[6]"] }
    ]},
    "5": { "stage": "heads_down", "steps": [
      { "type": "flash_card", "fillFields": ["cards[5]"] },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] },
      { "type": "script_read", "fillFields": ["lines[6]"] },
      { "type": "no_script", "fillFields": ["cues[3]","context_en","context_vi"] },
      { "type": "recording_submit", "fillFields": ["_instructions","rubric"] },
      { "type": "matching", "fillFields": ["pairs[6]"] }
    ]},
    "6": { "stage": "heads_together", "steps": [
      { "type": "flash_card", "fillFields": ["cards[4]"] },
      { "type": "video", "fillFields": ["key_phrases","line_1_en thru line_8_en","line_1_vi thru line_8_vi"], "hasVideoScript": true },
      { "type": "script_read", "fillFields": ["lines[6]"] },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] },
      { "type": "no_script", "fillFields": ["cues[3]","context_en","context_vi"] },
      { "type": "recording_submit", "fillFields": ["_instructions","rubric"] },
      { "type": "matching", "fillFields": ["pairs[6]"] }
    ]},
    "7": { "stage": "heads_together", "steps": [
      { "type": "flash_card", "fillFields": ["cards[4]"] },
      { "type": "script_read", "fillFields": ["lines[6]"] },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] },
      { "type": "no_script", "fillFields": ["cues[3]","context_en","context_vi"] },
      { "type": "recording_submit", "fillFields": ["_instructions","rubric"] },
      { "type": "mission", "fillFields": ["missionEn","missionVi"] },
      { "type": "matching", "fillFields": ["pairs[8]"] }
    ]},
    "8": { "stage": "assessment", "steps": [
      { "type": "quiz", "fillFields": ["questions[5]"] },
      { "type": "spot_the_mistake", "fillFields": ["questions[3]"] },
      { "type": "cloze", "fillFields": ["clozeText","decoyPool[10]"] },
      { "type": "drag_order", "fillFields": ["items[5]","correct_order"] },
      { "type": "matching", "fillFields": ["pairs[8]"] },
      { "type": "recording_submit", "fillFields": ["_instructions","rubric"] },
      { "type": "self_reflection", "fillFields": ["prompts[4_sliders+1_text]"] }
    ]}
  }
}
```

#### Template 2: `safety_procedures`
*For: factory workers, construction, lab technicians, safety officers*
Same skeleton as Template 1 except:
- L3, L5 replace `audio_shadow` with `drag_order` (ordering safety steps correctly is critical)
- L8 assessment has 2 `spot_the_mistake` blocks (identifying unsafe actions is the core competency)

#### Template 3: `technical_skills`
*For: engineers, IT, accounting, documentation-heavy roles*
Same skeleton except:
- L1–L2 reduce speaking steps — replace `recording_submit` with extra `quiz`
- L5–L7 add `sentence_builder` step (constructing technical sentences precisely)
- Assessment has 6 MCQs instead of 5

#### Template 4: `customer_service`
*For: retail, hospitality, sales, front-of-house staff*
Same skeleton except:
- All `no_script` steps replaced with `quick_response` (situational judgement is more relevant)
- L7 adds `odd_one_out` vocabulary step
- L8 assessment has 3 `spot_the_mistake` questions (bad service phrases to identify)

---

### 3.4 Step 3: Refinement Chat (`/studio/new?step=refine`)

**API Route:** `POST /api/studio/chat` (streaming, multi-turn)  
**Model:** Gemini 1.5 Pro with full `CourseSynopsis` JSON in context

UI:
- Top: synopsis panel (live updates as AI responds)
- Bottom: chat input + send button
- Use `useChat()` hook from Vercel AI SDK

The creator can only change the **content outline** (titles, key phrases, module order) — NOT the step structure. The chat UI should make this clear: "You can ask me to change module topics, rename lessons, reorder modules, or update key phrases. The lesson structure is fixed for consistency."

**Example valid requests:**
- "Move the cultural sensitivity module to Module 2"
- "Change the key phrases in Module 4 Lesson 1 to focus more on SBAR"
- "Rename Module 7 to 'Managing Distressed Relatives'"
- "Make the video scripts in Module 1 simpler — learners are beginners"

**System prompt for chat:**
```
You are helping a course creator refine their course synopsis.
The course structure (step types, lesson count, stage sequence) is FIXED and cannot be changed.
You can only update: module titles, lesson titles, key phrases, objectives, video scripts, audio scripts, scenario contexts.

Current synopsis:
{currentSynopsisJSON}

When the user requests a change, output:
1. The complete updated CourseSynopsis JSON (full replacement, not a diff)
2. A plain-text explanation (1–2 sentences) of what you changed
```

---

### 3.5 Step 4: Course Generation (template-fill approach)

**API Route:** `POST /api/studio/generate`
**Duration:** ~30 seconds for a full 12-module course (vs. minutes for from-scratch generation)

This route does NOT call Gemini once per lesson from scratch. Instead:

1. Load the template JSON for `synopsis.templateId`
2. Insert `nursed_courses` → get `courseId`
3. For each module in synopsis: insert `nursed_modules` → get `moduleId`
4. For each lesson: insert `nursed_lessons` → get `lessonId`
5. For each lesson, call Gemini **once** with a compact fill-in prompt (see below)
6. Gemini returns ONLY the content fields — the system merges them into the template skeleton
7. Insert all step records into `nursed_lesson_steps`
8. Queue video/audio steps in `media_queue`

**Gemini fill-in prompt (one call per lesson):**

```
Fill in content for this lesson. Return ONLY a JSON object with the keys listed below — nothing else.

Lesson context:
- Module: "{moduleTitle}" (Module {n} of {total})
- Lesson: "{lessonTitle}" ({stage} stage)
- Objective: {objective}
- Key phrases the learner will practice: {keyPhrases}
- Scenario context: {scenarioContext}
- Profession: {profession}, Industry: {industry}, Level: {level}

Fill in these content fields:
{templateFillFields for this lesson from the template JSON}

Rules:
- All text must be practical and directly usable in the learner's real job
- For quiz questions: 4 options each, one clearly correct, distractors plausible but wrong
- For spot_the_mistake: tokenize the sentence word-by-word in the tokens array, mark is_wrong: true only on the genuinely unsafe/incorrect word(s)
- For cloze: use [answer] bracket format, include answer words in decoyPool plus 3–4 wrong distractors
- For matching pairs: use key phrases from this lesson only
- For recording_submit _instructions: describe a realistic scenario the learner responds to
- For self_reflection (L8 only): 4 sliders + 1 open text prompt
- Output valid JSON only. No markdown. No prose.
```

**System merges the response into the template:**
```ts
function buildStepConfig(templateStep, aiContent, lessonContext) {
  // templateStep defines the type and structure
  // aiContent provides the text values
  // returns a valid config object ready for DB insert
}
```

**Progress UI:**
- Module-level progress bar (out of total modules)
- Per-lesson spinner → green checkmark when done
- "Generating Module 3 of 10 — Lesson 4 of 8" status text
- Estimated time shown (~30 seconds total)

### 3.6 Media Production (Step 4 continued)

After all steps are created, the creator reaches the media production screen:

**Video steps:**
- Shows a list of all video steps with their 40–60 second scripts
- Two options per video:
  1. **Auto-generate** → calls `POST /api/studio/media/heygen` with the script → creates HeyGen avatar video → stores URL back to `nursed_lesson_steps.config.videoUrl`
  2. **Upload manually** → file upload UI (same as existing admin pattern)

**Audio steps:**
- Shows all audio_shadow steps with their scripts
- Two options:
  1. **Auto-generate** → calls `POST /api/studio/media/fish-audio` with the script → creates audio → stores URL to `nursed_lesson_steps.config.audioUrl`
  2. **Record manually** → existing admin audio recording flow

---

## 4. NEW DB TABLES NEEDED

```sql
-- Creator access applications
CREATE TABLE creator_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users,
  full_name text NOT NULL,
  profession text NOT NULL,
  organisation text,
  topic_area text NOT NULL,
  why_create text NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_at timestamptz,
  reviewed_by uuid,
  created_at timestamptz DEFAULT now()
);

-- Course drafts (synopsis before generation)
CREATE TABLE course_drafts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id uuid REFERENCES auth.users NOT NULL,
  intake_form jsonb NOT NULL,           -- CourseIntakeForm
  synopsis jsonb,                        -- CourseSynopsis (updated during chat)
  chat_history jsonb DEFAULT '[]',       -- [{role, content}] array
  status text DEFAULT 'brainstorming' 
    CHECK (status IN ('brainstorming', 'refining', 'approved', 'generating', 'complete', 'failed')),
  course_id uuid REFERENCES nursed_courses,  -- set after generation
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Media generation queue
CREATE TABLE media_queue (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id uuid REFERENCES nursed_lesson_steps NOT NULL,
  media_type text CHECK (media_type IN ('video', 'audio')),
  script text NOT NULL,
  provider text CHECK (provider IN ('heygen', 'fish_audio', 'manual')),
  status text DEFAULT 'pending' 
    CHECK (status IN ('pending', 'generating', 'complete', 'failed')),
  provider_job_id text,
  output_url text,
  error text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
```

---

## 5. NEW ROUTES & FILES TO CREATE

```
apps/med/
  app/
    become-creator/
      page.tsx              ← Public application form
    studio/
      layout.tsx            ← Studio layout (auth gate for course_creator role)
      page.tsx              ← Creator home — list of their course drafts + published courses
      new/
        page.tsx            ← Multi-step wizard: intake → synopsis → refine → generate
    api/
      studio/
        brainstorm/route.ts ← POST — Gemini streaming brainstorm
        chat/route.ts       ← POST — Gemini streaming chat (multi-turn refinement)
        generate/route.ts   ← POST — full course DB generation (long-running)
        media/
          heygen/route.ts   ← POST — HeyGen video generation
          fish-audio/route.ts ← POST — Fish.audio generation
      creator-applications/
        route.ts            ← POST — submit application
  components/
    studio/
      IntakeForm.tsx        ← Step 1 form
      SynopsisPanel.tsx     ← Module/lesson accordion display
      RefinementChat.tsx    ← Chat UI (useChat hook)
      GenerationProgress.tsx← Progress tracker during DB writes
      MediaProductionList.tsx← Video/audio generation list
```

---

## 6. API INTEGRATIONS

### 6.1 Gemini (Vercel AI SDK)
```bash
npm install @ai-sdk/google ai
```
```ts
// In API routes:
import { google } from '@ai-sdk/google'
import { streamObject, streamText } from 'ai'

const model = google('gemini-1.5-pro')

// For brainstorm (structured output):
const result = await streamObject({
  model,
  schema: courseSynopsisSchema,  // use zod schema matching CourseSynopsis interface
  prompt: buildBrainstormPrompt(intakeForm),
})

// For chat (free text + JSON updates):
const result = await streamText({
  model,
  messages: chatHistory,
  system: buildChatSystemPrompt(currentSynopsis),
})
```
**API key:** Store as `GEMINI_API_KEY` in Vercel environment variables (never in code).

### 6.2 HeyGen API
```ts
// POST /api/studio/media/heygen
// Docs: https://docs.heygen.com/reference/create-an-avatar-video-v2
const response = await fetch('https://api.heygen.com/v2/video/generate', {
  method: 'POST',
  headers: {
    'X-Api-Key': process.env.HEYGEN_API_KEY!,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    video_inputs: [{
      character: { type: 'avatar', avatar_id: process.env.HEYGEN_AVATAR_ID },
      voice: { type: 'text', input_text: script, voice_id: process.env.HEYGEN_VOICE_ID },
    }],
    dimension: { width: 1280, height: 720 },
  }),
})
// Returns video_id → poll /v1/video_status.get?video_id= until complete → get video_url
```
**Env vars needed:** `HEYGEN_API_KEY`, `HEYGEN_AVATAR_ID`, `HEYGEN_VOICE_ID`

### 6.3 Fish.audio API
```ts
// POST /api/studio/media/fish-audio
// Docs: https://docs.fish.audio/api-reference/tts
const response = await fetch('https://api.fish.audio/v1/tts', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${process.env.FISH_AUDIO_API_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    text: script,
    reference_id: process.env.FISH_AUDIO_VOICE_ID,  // pre-configured nurse voice
    format: 'mp3',
    mp3_bitrate: 128,
  }),
})
// Returns audio buffer → upload to Supabase storage → return public URL
```
**Env vars needed:** `FISH_AUDIO_API_KEY`, `FISH_AUDIO_VOICE_ID`

### 6.4 Supabase Storage (for media uploads)
```ts
import { createServerSupabaseClient } from '@/lib/supabase-server'
const supabase = await createServerSupabaseClient()
const { data } = await supabase.storage
  .from('course-media')
  .upload(`${courseId}/${lessonId}/${stepId}.mp3`, audioBuffer)
const { publicUrl } = supabase.storage.from('course-media').getPublicUrl(data.path)
```

---

## 7. ARCHITECTURE DECISION: WHY VERCEL AI SDK + GEMINI

- **Streaming:** `useChat()` hook gives real-time token streaming in the refinement chat — creator sees AI typing responses rather than waiting
- **Structured output:** `streamObject()` with Zod schema validation ensures the synopsis JSON is always valid before it touches the DB
- **Multi-turn conversation:** SDK handles message history automatically — no manual array management
- **Server-side keys:** All Gemini calls happen in Next.js API routes, never client-side
- **Vercel-native:** `ai` package is built by Vercel and optimised for edge/serverless deployment on this exact stack
- **Long-running generation:** Use `maxDuration = 300` on the generate route for Vercel fluid compute (up to 5 minutes)

---

## 8. IMPORTANT CONVENTIONS TO FOLLOW

1. **Never commit to `main`** — all work on `agent-x-integration` branch
2. **No `vercel promote`** without explicit user approval
3. **DB credentials** — use existing `createServerSupabaseClient()` from `@/lib/supabase-server`, never raw connection strings
4. **i18n** — all new UI strings must be added to `lib/i18n/translations.ts` under both `en` and `vi` keys. Never hardcode English strings in JSX.
5. **Styling** — use existing Tailwind utility classes and design tokens from the codebase (`btn-primary`, `card`, `input`, `label`, `badge-*`). Check existing admin pages for reference.
6. **Auth gate for `/studio`** — check `role === 'course_creator' || role === 'super_admin'` in studio layout, same pattern as `app/admin/layout.tsx`
7. **Never write to `C:\Users\admin\...` or `D:\Work\...`** — use only `C:\Users\ASUS\tuto-nursemed-practice-pilot`
8. **FOLDER_CHANGE.md** — append a session log row at the end of every work session
9. **Step ordering** — always use `order_index` starting from 1, not 0, and keep gaps of 1 between steps

---

## 9. RECOMMENDED IMPLEMENTATION SEQUENCE

Build in this order to stay shippable at every step:

### Phase 1 — Foundation (ship this first, no AI needed yet)
1. Add `course_creator` to the role type in `nursed_profiles`
2. Create `creator_applications` DB table via Supabase migration
3. Build `/become-creator` public page (form → POST to `/api/creator-applications`)
4. Add "Become a Creator" link to `LandingFooter.tsx` and the main nav

### Phase 2 — Studio Shell + Templates
5. Create `course_drafts` and `media_queue` tables
6. Write the 4 template JSON files to `apps/med/lib/studio/templates/`
7. Build `/studio` layout with role auth gate (`course_creator` or `super_admin`)
8. Build `/studio` home page (list of drafts + published courses, "Create New Course" CTA)
9. Build the intake form at `/studio/new` (Step 1 — saves to `course_drafts`, no AI yet)

### Phase 3 — AI Synopsis (the fast part)
10. `npm install @ai-sdk/google ai zod` in `apps/med/`
11. Build `POST /api/studio/brainstorm` — Gemini streaming with Zod schema validation
12. Build `SynopsisPanel` component (module accordion, lesson detail, key phrases list)
13. Wire: intake form submit → brainstorm API call → streaming synopsis display

### Phase 4 — Refinement Chat
14. Build `POST /api/studio/chat` using Vercel AI SDK `streamText`
15. Build `RefinementChat` component using `useChat()` hook
16. Wire: chat message → AI updates synopsis JSON → `SynopsisPanel` re-renders live

### Phase 5 — Template-Fill Generation (the core)
17. Build `buildStepConfig(templateStep, aiContent, lessonContext)` utility function
18. Build `POST /api/studio/generate`:
    - Load template by `synopsis.templateId`
    - Insert course → modules → lessons (no AI needed here)
    - For each lesson: single Gemini call with fill-in prompt → merge into template → insert steps
19. Build `GenerationProgress` component (module bar + per-lesson spinner)
20. Wire: "Generate Course" → progress screen → redirect to `/studio/[courseId]`

### Phase 6 — Media Production
21. Create Supabase `course-media` storage bucket (public read)
22. Build `POST /api/studio/media/fish-audio` → call Fish.audio → upload to storage → update step config
23. Build `POST /api/studio/media/heygen` → submit job → poll status → update step config
24. Build `MediaProductionList` component (list all pending video/audio items with generate/upload buttons)

### Phase 7 — Creator Course Management
25. Build `/studio/[courseId]` overview page (module list, completion status, media status)
26. Link lesson editing to existing `/admin/courses/[courseId]/lessons/[lessonId]` (reuse, don't rebuild)
27. Add "Submit for Review" / "Publish" action (sets `nursed_courses.published = true` after super_admin approval)

---

## 10. WHY THIS IS FAST AND CONSISTENT

| Concern | Template-first answer |
|---------|----------------------|
| How long does generation take? | ~30 seconds — Gemini only fills text fields, not structure |
| What if Gemini makes a structural mistake? | Impossible — structure is a fixed JSON file in the codebase |
| Why are courses consistent across creators? | Every course uses the same pedagogy (stage pattern, step sequence) |
| How do we add a new step type later? | Update the template JSON + `buildStepConfig()` — no AI prompt changes needed |
| Can a creator customise the structure? | No — this is by design. Pedagogy is not up for discussion. Content is. |
| What if a topic doesn't fit a template? | Creator picks the closest template. The 4 templates cover ~90% of workplace learning use cases. |

---

## 11. QUESTIONS TO RESOLVE BEFORE STARTING

These need answers from the product owner (Tarun) before the relevant phase:

1. **HeyGen avatar:** Which avatar ID and voice ID should be used for auto-generated videos? (check existing HeyGen account)
2. **Fish.audio voice:** Which voice reference ID should be used for auto-generated audio?
3. **Creator approval flow:** Is approval manual (super_admin reviews each application in `/admin`) or automatic?
4. **Course ownership:** Can a creator see and edit another creator's course? Or strict per-creator isolation?
5. **Monetisation/publishing:** When a creator publishes, does it go live on the public platform immediately, or does it need super_admin review?
6. **Gemini API key:** Needs to be added to Vercel env vars before Phase 3 can run

---

## 12. SESSION LOG

| Date | Agent | Action |
|------|-------|--------|
| 2026-05-22 | Orchestrator | Created this handover document from full codebase audit + user requirements interview |
