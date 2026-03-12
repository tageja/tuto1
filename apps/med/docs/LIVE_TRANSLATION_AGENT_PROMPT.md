# Live Phrase Translation — Full Agent Brief (Zero Context)

**Use this document to brief an agent that has no prior knowledge of this project.** Copy the entire content below as the prompt, or reference this file and instruct the agent to read it first.

---

## 1. Project Overview

**NurseMed** is a web-based learning platform for Vietnamese nurses to practice English communication in emergency and clinical settings. It is part of a monorepo at `tuto1`.

- **Tech stack**: Next.js 15, React, TypeScript, Supabase (PostgreSQL)
- **App location**: `apps/med/` — runs on port 3001 (e.g. `npm run dev` in `apps/med`)
- **Bilingual**: English and Vietnamese (UI language via `useLang()` from `contexts/LanguageContext`)

**Content structure**:
- **Course** → **Modules** (e.g. Module 1: First emergency contact, Module 5: Escalation) → **Lessons** → **Steps**
- Each step has a `type` (e.g. `audio_shadow`, `script_read`, `quiz`) and a `config` (JSON object)

---

## 2. The Feature: Live Phrase Translation

**What it does**: When a learner views a dialogue transcript in an "audio_shadow" step, they can hover over (or tap on) English words/phrases to see the Vietnamese translation in a tooltip. A toggle button lets them turn this on or off.

**Where it appears**: The transcript is shown in a card labeled "Nội dung" (Content) or "Content" inside the `AudioShadowStep` component. It is the dialogue text (e.g. "Nurse: Hello, I am here to help you. What happened? Patient: My chest... it hurts so much...").

**Current state**: Implemented for **Module 1, Lesson 1, Step 2** (pilot dialogue) and **Module 5, Lesson 1, Step 2** (escalation dialogue). All other steps with transcripts do not yet have translations.

---

## 3. Your Role and Task

**Roles**:
- **Content Engineer**: Add Vietnamese translations for every transcript that has dialogue content.
- **Integration Specialist**: Ensure the existing UI and logic work for all modules.
- **Quality Assurance**: Verify translations are accurate for medical/nursing terminology.

**Task**: Add `transcriptSegments` (EN→VI phrase mappings) to **every** `audio_shadow` step that has a `transcript` across **all modules** (1–12). Do not change the core TranslatableTranscript component, the toggle logic, or the localStorage key unless fixing a bug.

---

## 4. Technical Architecture (Full Detail)

### 4.1 Data Flow

```
Supabase (nursed_lesson_steps)
  → config (JSONB): { transcript, transcriptSegments?, ... }
       ↓
LessonPlayer → AudioShadowStep (step.config)
       ↓
TranslatableTranscript(text, segments, enabled)
       ↓
Renders: plain text OR hoverable spans with tooltip
```

### 4.2 Database Schema

- **Table**: `nursed_lesson_steps`
- **Columns**: `id`, `lesson_id`, `type`, `title`, `title_vi`, `order_index`, `config`, `created_at`
- **config** is JSONB. For `audio_shadow` steps it typically contains:
  - `transcript` or `transcriptEn`: string (the dialogue text)
  - `audioUrl` or `audio_url`: string (optional)
  - `transcriptSegments`: optional array of `{ en: string, vi: string }`

### 4.3 Key Files and Their Purpose

| File | Purpose |
|------|---------|
| `apps/med/components/learn/TranslatableTranscript.tsx` | Core component. Renders plain text or hoverable segments. Exports `getPhraseTranslationDefault()`, `setPhraseTranslationEnabled()`. **Do not modify unless fixing a bug.** |
| `apps/med/components/learn/steps/AudioShadowStep.tsx` | Renders the transcript card, toggle button, and audio player. Passes `text`, `segments`, `enabled` to TranslatableTranscript. |
| `apps/med/components/learn/LessonPlayer.tsx` | Renders the current step. Dispatches to `AudioShadowStep` when `step.type === 'audio_shadow'`. |
| `apps/med/components/learn/steps/AudioShadowStep.tsx` | Uses `step.config?.transcript` and `step.config?.transcriptSegments`. Shows toggle only when `hasTranscriptSegments` is true. |
| `apps/med/lib/db/patch-transcript-segments.ts` | Patch logic. Adds `transcriptSegments` to steps. Can target module 1 L1 S2 by `courseId`, or find steps by transcript content. |
| `apps/med/app/api/seed/patch-transcript-segments/route.ts` | API route: `POST /api/seed/patch-transcript-segments` with body `{ courseId?: string }`. |
| `apps/med/lib/db/module-5-content.ts` | Module 5 content. Contains lesson/step definitions. First audio_shadow already has `transcriptSegments`. |
| `apps/med/lib/db/module-6-content.ts` | Module 6 content. Multiple audio_shadow steps with `transcript`, no segments yet. |
| `apps/med/lib/db/module-7-content.ts` | Module 7 content. Same as above. |
| `apps/med/lib/i18n/translations.ts` | UI strings. `phraseTranslationOn`, `phraseTranslationOff`, `phraseTranslationToggle` (en + vi). |

### 4.4 TranslatableTranscript Component (Exact Behavior)

- **Props**: `text: string`, `segments?: { en: string; vi: string }[]`, `enabled?: boolean` (default `true`)
- **When `enabled` is false or `segments` is empty**: Renders plain `<p>{text}</p>`.
- **When `enabled` is true and `segments` has items**: Parses text, finds matches for each `en` string, wraps matches in `<span>` with `onMouseEnter`, `onMouseLeave`, `onClick`. Shows Vietnamese (`vi`) in a fixed-position tooltip above the span.
- **Matching**: Longer phrases are preferred over shorter ones (e.g. "I am here to help you" over "Hello"). Overlapping matches are resolved by keeping the longer match.
- **localStorage**: Key `nursed_phrase_translation_enabled`. Values `"true"` or `"false"`. Default `true`.

### 4.5 AudioShadowStep Toggle

- **Condition**: Toggle is shown only when `step.config.transcriptSegments` exists and has length > 0.
- **Button**: Labels "Translations on" / "Translations off" (or "Bật dịch" / "Tắt dịch"). Persists choice in localStorage.
- **State**: `translationEnabled` from `getPhraseTranslationDefault()` on mount. Passed to `TranslatableTranscript` as `enabled`.

### 4.6 Content Sources

- **Modules 5, 6, 7**: Content in `apps/med/lib/db/module-*-content.ts`. Seeded via API routes. Re-seeding replaces lessons/steps.
- **Modules 1–4**: Content in Supabase (Airtable or other seed). Not in repo. Use patch API or extend `patch-transcript-segments.ts` to target specific steps.
- **Modules 8–12**: May have placeholder or no content. Add segments when content exists.

---

## 5. Data Structure: transcriptSegments

**Format**:
```ts
transcriptSegments: [
  { en: "Hello", vi: "Xin chào" },
  { en: "I am here to help you", vi: "Tôi ở đây để giúp bạn" },
  { en: "What happened?", vi: "Chuyện gì đã xảy ra?" },
  // ... more phrases. Order does not matter; matching is by text.
]
```

**Rules**:
- `en` must match the substring in the transcript exactly (case-sensitive).
- Prefer meaningful phrases over single words where possible (e.g. "I understand you are frightened" over just "understand").
- Include speaker labels if needed: `{ en: "Nurse:", vi: "Điều dưỡng:" }`.
- Use correct Vietnamese for medical/nursing terms. Reference existing translations in `patch-transcript-segments.ts` for style.

---

## 6. How to Add transcriptSegments

### 6.1 For modules 5, 6, 7 (content in repo)

1. Open `apps/med/lib/db/module-5-content.ts` (or 6, 7).
2. Find each step with `type: 'audio_shadow'` and `config.transcript`.
3. Add `transcriptSegments` to `config`:

```ts
config: {
  transcript: "Nurse: Mr. Davies, I am Nurse Lan. I understand you are frightened. ...",
  transcriptSegments: [
    { en: 'Nurse:', vi: 'Điều dưỡng:' },
    { en: 'I understand you are frightened', vi: 'Tôi hiểu bạn đang sợ hãi' },
    // ... all key phrases from the transcript
  ],
  // ... other fields (audio_url, etc.)
},
```

4. Re-seed the module (see Section 8).

### 6.2 For modules 1–4 (content in Supabase)

- Extend `apps/med/lib/db/patch-transcript-segments.ts` to target specific steps by `course_id` + `module order_index` + `lesson order_index` + `step order_index`.
- Or add a new patch that accepts `stepId` and adds segments.
- Call the patch API after updating the script.

### 6.3 For modules 8–12

- When content exists, add segments the same way as 5–7 (or via patch if content is in Supabase).

---

## 7. Patch API

**Endpoint**: `POST /api/seed/patch-transcript-segments`

**Body**: `{ "courseId": "9113d5cb-cedb-4bea-9678-7321020230e8" }` (optional)

**Behavior**:
- **With courseId**: Patches **module 1, lesson 1, step 2** with `PILOT_SEGMENTS` (the chest-pain dialogue).
- **Without courseId**: Finds all `audio_shadow` steps whose transcript contains ≥2 of: "I am here to help", "My chest", "it hurts", "get help immediately", and adds `PILOT_SEGMENTS`.
- **Idempotent**: Skips steps that already have `transcriptSegments`.

**Example**:
```bash
curl -X POST http://localhost:3001/api/seed/patch-transcript-segments \
  -H "Content-Type: application/json" \
  -d '{"courseId":"9113d5cb-cedb-4bea-9678-7321020230e8"}'
```

---

## 8. Re-seeding Modules

After editing `module-5-content.ts`, `module-6-content.ts`, or `module-7-content.ts`:

```bash
# Ensure dev server is running: cd apps/med && npm run dev

# Module 5
curl -X POST http://localhost:3001/api/seed/module-5 \
  -H "Content-Type: application/json" \
  -d '{"courseId":"9113d5cb-cedb-4bea-9678-7321020230e8"}'

# Module 6 (replace <module-6-id> with actual ID from Supabase or API)
curl -X POST http://localhost:3001/api/seed/module-6 \
  -H "Content-Type: application/json" \
  -d '{"moduleId":"<module-6-id>"}'

# Module 7 (replace <module-7-id> with actual ID)
curl -X POST http://localhost:3001/api/seed/module-7 \
  -H "Content-Type: application/json" \
  -d '{"moduleId":"<module-7-id>"}'
```

**Note**: Module IDs can be fetched from the courses API or Supabase `nursed_modules` table.

---

## 9. Reference IDs

- **Course ID**: `9113d5cb-cedb-4bea-9678-7321020230e8`
- **Module IDs**: Query `nursed_modules` table or `GET /api/courses/<courseId>` to get module IDs.

---

## 10. Example: Full Pilot Segments (from patch-transcript-segments.ts)

```ts
const PILOT_SEGMENTS = [
  { en: 'Hello', vi: 'Xin chào' },
  { en: 'I am here to help you', vi: 'Tôi ở đây để giúp bạn' },
  { en: 'What happened?', vi: 'Chuyện gì đã xảy ra?' },
  { en: 'Patient:', vi: 'Bệnh nhân:' },
  { en: 'My chest', vi: 'Ngực tôi' },
  { en: 'it hurts so much', vi: 'đau rất nhiều' },
  { en: 'Nurse:', vi: 'Điều dưỡng:' },
  { en: 'I understand', vi: 'Tôi hiểu' },
  { en: 'Can you tell me where exactly it hurts?', vi: 'Bạn có thể nói cho tôi biết chính xác chỗ nào đau không?' },
  { en: 'Here?', vi: 'Ở đây?' },
  { en: 'Yes, here', vi: 'Vâng, ở đây' },
  { en: 'And my left arm', vi: 'Và cánh tay trái của tôi' },
  { en: 'Okay', vi: 'Được rồi' },
  { en: 'Please sit down right here', vi: 'Xin mời ngồi ngay đây' },
  { en: 'I will get help immediately', vi: 'Tôi sẽ gọi trợ giúp ngay lập tức' },
  { en: 'What are your symptoms?', vi: 'Triệu chứng của bạn là gì?' },
]
```

---

## 11. Step-by-Step Task Checklist

1. **Audit**: List all `audio_shadow` steps with `transcript` in modules 5, 6, 7 (grep for `type: 'audio_shadow'` and `transcript` in the content files).
2. **Module 5**: Add `transcriptSegments` to any remaining audio_shadow steps that don’t have them yet.
3. **Module 6**: Add `transcriptSegments` to every audio_shadow step.
4. **Module 7**: Add `transcriptSegments` to every audio_shadow step.
5. **Modules 1–4**: Extend the patch script or add a new patch to target specific steps. Run the patch.
6. **Modules 8–12**: When content exists, add segments (same pattern as 5–7).
7. **Re-seed**: Run the seed APIs for modules 5, 6, 7 after editing content files.
8. **Verify**: Open each lesson in the browser, go to an audio_shadow step, confirm the toggle appears and hover shows Vietnamese.
9. **QA**: Spot-check Vietnamese translations for medical accuracy.

---

## 12. What NOT to Do

- Do **not** change the `TranslatableTranscript` component logic (parseTextWithSegments, matching, tooltip) unless fixing a bug.
- Do **not** change the `localStorage` key `nursed_phrase_translation_enabled`.
- Do **not** change the toggle behavior or where it appears in `AudioShadowStep`.
- Do **not** add `transcriptSegments` to step types other than `audio_shadow` (e.g. `script_read` is out of scope for this task).

---

## 13. Troubleshooting

- **Toggle not showing**: Ensure `step.config.transcriptSegments` exists and has length > 0. Re-seed if you edited content files.
- **No tooltip on hover**: Check that `en` in segments exactly matches the transcript text (including punctuation).
- **Build error**: Run `rm -rf apps/med/.next && npm run build` in `apps/med`.
- **Port in use**: Kill process on 3001: `lsof -ti:3001 | xargs kill -9`.

---

## 14. Prompt to Copy (Short Version)

If you prefer a short instruction for the agent:

> Read `apps/med/docs/LIVE_TRANSLATION_AGENT_PROMPT.md` in full. Your task: add `transcriptSegments` (EN→VI phrase mappings) to every `audio_shadow` step that has a `transcript` across all modules (1–12). Do not modify TranslatableTranscript, the toggle, or the localStorage key. Re-seed modules 5–7 after editing content files. Verify in the browser.
