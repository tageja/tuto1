# Dev Agent Handover — Feature F: Audio Recording & Playback Infrastructure

## Your role

You are a **Senior Full-Stack Engineer** responsible for making the end-to-end audio pipeline work — from learner recording in the browser, through upload and storage, to playback in lesson steps and admin preview. You will also fix a critical config key mismatch that breaks audio playback for `audio_shadow` steps.

**Skills you must apply:**

- **TypeScript** (strict typing, async/await, error handling)
- **Next.js App Router** (route handlers, multipart file upload, server-side Supabase client)
- **Browser APIs** (`MediaRecorder`, `getUserMedia`, `Blob`, `Audio`)
- **Supabase Storage** (buckets, upload, public URLs, RLS for storage)
- **React** (refs, state machines for record/stop/playback flows, `useEffect` cleanup)
- **Audio UX** (waveform visualization optional; progress bar, play/pause/stop, error states)

---

## Project context

**NurseEd** (`apps/med`) is a Next.js web app for Vietnamese nurses learning medical English. It uses **Supabase** (Auth + Postgres + Storage) for data and file storage. Learners complete **courses → modules → lessons → steps**.

Audio features in the platform:

| Feature | Status | Location |
|---------|--------|----------|
| **Learner recording** (RecordingStep) | Partially working — records and uploads, but issues exist | `components/learn/steps/RecordingStep.tsx` |
| **TTS generation** (admin) | Working — fish.audio API → Supabase Storage | `app/api/audio/generate/route.ts`, `app/api/audio/batch/route.ts` |
| **Audio playback** (AudioShadowStep) | Broken due to config key mismatch | `components/learn/steps/AudioShadowStep.tsx` |
| **Speaker buttons** (ScenarioIntro, ScriptRead) | Working when audio URL exists | `components/learn/SpeakerButton.tsx` |
| **Supabase Storage bucket** | Must be manually created | Bucket name: `nursed-assets` |

---

## Known issues you must fix

### Issue 1: `audio_url` vs `audioUrl` config key mismatch (CRITICAL)

This is the highest priority bug. The admin editor and the learner component use different keys:

| Component | Key used | Where |
|-----------|----------|-------|
| **Admin** `AudioShadowEditor` | Saves `audio_url` (snake_case) | `StepEditor.tsx` line 144: `onSubmit({ audio_url: audioUrl, ... })` |
| **Learner** `AudioShadowStep` | Reads `audioUrl` (camelCase) | `AudioShadowStep.tsx` line 25: `step.config?.audioUrl` |
| **LessonPlayer** context capture | Reads `audioUrl` (camelCase) | `LessonPlayer.tsx` line 105: `finishedStep.config?.audioUrl` |
| **Batch TTS** (admin tool) | Writes `audioUrl` (camelCase) | `app/api/audio/batch/route.ts` line 97: `field: 'audioUrl'` |
| **Single TTS** `GenerateAudioButton` | Writes `audioUrl` (camelCase) | `StepEditor.tsx` line 140: `field: 'audioUrl'` |

**Result**: When admin saves via the editor form, it writes `audio_url`. When the learner component reads, it looks for `audioUrl`. The step shows "Coming soon" even though audio was uploaded.

**The TTS generator writes `audioUrl` correctly**, so steps that had audio generated via TTS work. Steps saved manually via the editor don't.

**Fix**: Normalize to one key. Recommended: change the `AudioShadowEditor` to save as `audioUrl` (matching the learner component and TTS pipeline). Or, make the learner component read both keys with a fallback.

### Issue 2: RecordingStep sends `user_id: 'guest'` (MEDIUM)

```typescript
// RecordingStep.tsx line 141
body: JSON.stringify({
  user_id: 'guest',   // ← hardcoded, server ignores this
  lesson_id: lessonId,
  step_id: step.id,
  type: 'recording',
  ...
})
```

The server-side `submissions/route.ts` correctly uses the Supabase auth session user, so this doesn't cause data corruption — but it's misleading and should use `useAuth()` like `QuizStep` does.

### Issue 3: RecordingStep doesn't send `stepId` in FormData to upload route (LOW)

```typescript
// RecordingStep.tsx lines 124-127
const formData = new FormData()
formData.append('file', audioBlob, 'recording.webm')
formData.append('type', 'audio')
formData.append('lessonId', lessonId)
// ← missing: formData.append('stepId', step.id)
```

The upload route accepts `stepId` to populate `nursed_content_assets.step_id`, but `RecordingStep` doesn't send it.

### Issue 4: Supabase Storage bucket may not exist (SETUP)

The bucket `nursed-assets` must be created manually in Supabase. The migration has it commented out:

```sql
-- supabase/migrations/041_nursed_schema.sql lines 242-245
-- Run this separately via Supabase dashboard or CLI:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('nursed-assets', 'nursed-assets', true)
-- ON CONFLICT (id) DO NOTHING;
```

If the bucket doesn't exist, all uploads will fail silently (RecordingStep catches errors and proceeds).

---

## Existing infrastructure (what already works)

### Browser recording (`RecordingStep.tsx`)

Fully functional `MediaRecorder`-based recording:
- Requests mic permission via `navigator.mediaDevices.getUserMedia({ audio: true })`
- Records `audio/webm` format
- 30-second cap with timer
- Playback via `URL.createObjectURL`
- Upload via `POST /api/assets/upload` as multipart FormData
- Self-evaluation rubric (4 checkboxes)
- Submission saved to `nursed_submissions` via `POST /api/submissions`
- Preview mode support (`useIsPreview` skips upload)

### Storage layer (`lib/storage.ts`)

```typescript
const BUCKET = 'nursed-assets'

uploadAsset(file, path, contentType)   // → publicUrl
buildAssetPath(type, filename)          // → 'audios/{timestamp}_{filename}'
saveAssetRecord(payload)                // → nursed_content_assets row
getPublicUrl(path)                      // → public URL from Supabase
deleteAsset(path)                       // → remove from bucket
```

### Upload API (`app/api/assets/upload/route.ts`)

- Accepts multipart: `file`, `type`, `lessonId`, `stepId`, `speedTag`, `accentTag`, `transcriptEn`, `transcriptVi`
- Calls `uploadAsset` + `saveAssetRecord`
- Returns `{ data: asset }` with `storage_path` and `public_url`

### TTS generation (`app/api/audio/generate/route.ts`)

- Uses **fish.audio** API (requires `FISH_AUDIO_API_KEY` env var)
- Voice IDs per role: `FISH_AUDIO_VOICE_NURSE`, `FISH_AUDIO_VOICE_PATIENT`
- Generates MP3, uploads to `audio/{stepId}/{field}.mp3`
- Persists URL back into `nursed_lesson_steps.config[field]`

### Batch TTS (`app/api/audio/batch/route.ts`)

- Takes `courseId`, scans all `scenario_intro`, `audio_shadow`, `script_read` steps
- Identifies fields with `PLACEHOLDER` audio
- Generates and uploads all in sequence
- GET endpoint for dry-run preview

### Audio playback components

| Component | File | How it works |
|-----------|------|-------------|
| `AudioShadowStep` | `components/learn/steps/AudioShadowStep.tsx` | HTML5 `<audio>` with speed control (0.75x/1x/1.25x), phases (listen/read/speak), transcript overlay |
| `SpeakerButton` | `components/learn/SpeakerButton.tsx` | Inline play button using `new Audio()`, animated waveform bars |
| `ScenarioIntroStep` | `components/learn/steps/ScenarioIntroStep.tsx` | Per-key-phrase `SpeakerButton`, scene context audio |
| `ScriptReadStep` | `components/learn/steps/ScriptReadStep.tsx` | Per-dialogue-line `SpeakerButton` |

### Admin audio UI

| Component | File | Purpose |
|-----------|------|---------|
| `AudioShadowEditor` | `StepEditor.tsx` (line 76) | Upload audio file, enter transcript, TTS generate button |
| `GenerateAudioButton` | `GenerateAudioButton.tsx` | Per-field TTS generation with status indicators |
| `ScenarioIntroEditor` | `StepEditor.tsx` (line 370) | Audio URL field (defaults to `PLACEHOLDER`) |

---

## What you need to implement / fix

### 1. Fix the `audio_url` / `audioUrl` mismatch

**Recommended approach**: Change `AudioShadowEditor.onSave()` to write `audioUrl` instead of `audio_url`. Then write a one-time data migration script (or API endpoint) to normalize any existing `audio_url` keys in `nursed_lesson_steps.config` to `audioUrl`.

Alternatively, make `AudioShadowStep` read both:
```typescript
const audioUrl = (step.config?.audioUrl ?? step.config?.audio_url) as string | undefined
```

Choose one approach, apply consistently, and document the canonical key name.

### 2. Fix RecordingStep auth and metadata

- Replace `user_id: 'guest'` with actual user from `useAuth()`
- Add `stepId` to the upload FormData
- Ensure clean error handling if no auth user (preview mode or `AUTH_DISABLED`)

### 3. Ensure Supabase Storage bucket exists

- Document in the handover instructions that `nursed-assets` must be created in Supabase
- Consider adding a health check endpoint or startup validation
- Optionally write a migration or setup script using Supabase Management API

### 4. Verify end-to-end recording flow

Test the complete flow:
1. Learner opens a `recording_submit` step
2. Browser requests mic permission → grants
3. Recording starts (webm, ≤30s)
4. Recording stops → playback works
5. Rubric filled → Submit pressed
6. File uploaded to Supabase Storage `nursed-assets` bucket
7. Asset record created in `nursed_content_assets`
8. Submission record created in `nursed_submissions` with `storage_path`
9. Step marked complete, lesson progress updated

### 5. Verify end-to-end audio playback flow

Test both paths:
- **TTS-generated audio**: Admin generates via `GenerateAudioButton` → stored at `audio/{stepId}/audioUrl.mp3` → learner plays in `AudioShadowStep`
- **Manually uploaded audio**: Admin uploads in `AudioShadowEditor` → URL saved to config → learner plays (this is broken by Issue 1)

### 6. (Optional) Audio playback enhancements

If time permits:
- Add a visual waveform or progress bar to `RecordingStep` playback
- Add error toasts instead of silent error swallowing
- Add a "downloading audio" loading state to `AudioShadowStep`
- Consider webm → mp3 conversion if needed for compatibility

---

## Critical constraints and guardrails

### DO

- Fix the `audioUrl` / `audio_url` mismatch — this is the #1 priority
- Reuse existing `MediaRecorder` implementation in `RecordingStep` (it works)
- Reuse `lib/storage.ts` for all uploads
- Reuse `SpeakerButton` for inline audio playback
- Test with both `AUTH_DISABLED=true` and real auth
- Add all new UI text to `lib/i18n/translations.ts` (EN + VI)
- Ensure cleanup: stop `MediaStream` tracks on unmount, revoke object URLs
- Handle browser compatibility: `MediaRecorder` is not available in all browsers — show a clear error message

### DO NOT

- Do NOT install new audio recording libraries (browser `MediaRecorder` is sufficient for MVP)
- Do NOT modify the TTS generation pipeline (fish.audio integration is working)
- Do NOT modify Firebase Functions or mobile app code
- Do NOT change the storage bucket name (`nursed-assets`)
- Do NOT expose `SUPABASE_SERVICE_ROLE_KEY` or `FISH_AUDIO_API_KEY` to the client
- Do NOT create documentation files unless asked
- Do NOT hardcode strings in JSX — use the translation system

### Security

- Never send API keys to the client
- Audio uploads must be associated with authenticated users (server-side session check)
- Storage paths should include user context to prevent overwrites: prefer `recordings/{userId}/{stepId}/{timestamp}.webm`
- The upload route already uses `getServiceClient()` (server-only) — keep it that way

---

## Environment variables required

| Variable | Where | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | Supabase public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | Server-side uploads (bypasses RLS) |
| `FISH_AUDIO_API_KEY` | `.env.local` | TTS generation (admin only) |
| `FISH_AUDIO_VOICE_NURSE` | `.env.local` | Voice ID for nurse role |
| `FISH_AUDIO_VOICE_PATIENT` | `.env.local` | Voice ID for patient role |

---

## Files you should read first

| File | Why | Priority |
|------|-----|----------|
| `apps/med/components/learn/steps/RecordingStep.tsx` | Core recording component — fix auth, add stepId | HIGH |
| `apps/med/components/learn/steps/AudioShadowStep.tsx` | Audio playback — affected by key mismatch | HIGH |
| `apps/med/components/admin/StepEditor.tsx` | Admin editor — source of the `audio_url` key | HIGH |
| `apps/med/lib/storage.ts` | Storage helpers — your upload pipeline | HIGH |
| `apps/med/app/api/assets/upload/route.ts` | Upload API route | HIGH |
| `apps/med/app/api/submissions/route.ts` | Submission saving | MEDIUM |
| `apps/med/app/api/audio/generate/route.ts` | TTS single generation | MEDIUM |
| `apps/med/app/api/audio/batch/route.ts` | TTS batch generation | MEDIUM |
| `apps/med/components/admin/GenerateAudioButton.tsx` | TTS trigger UI | MEDIUM |
| `apps/med/components/learn/SpeakerButton.tsx` | Inline audio player | LOW |
| `apps/med/components/learn/LessonPlayer.tsx` | Context audio capture from audio_shadow | LOW |
| `apps/med/lib/supabase.ts` | Types and Supabase client setup | LOW |
| `supabase/migrations/041_nursed_schema.sql` | Schema including storage bucket comment | LOW |

---

## Recommended implementation order

1. **Fix Issue 1** — Normalize `audio_url` → `audioUrl` in the admin editor save (and fallback read in learner)
2. **Fix Issue 2** — Replace `user_id: 'guest'` with `useAuth()` in RecordingStep
3. **Fix Issue 3** — Add `stepId` to FormData in RecordingStep upload
4. **Verify bucket** — Confirm `nursed-assets` bucket exists; document setup if not
5. **Test recording flow** — End-to-end: record → upload → submission → playback
6. **Test audio playback** — Admin-uploaded audio plays correctly in AudioShadowStep
7. **Test TTS flow** — Generate audio via admin → plays in learner view

---

## Deliverable

A fully working audio pipeline where:
- Learner recordings upload to Supabase Storage and create proper submission records
- Admin-uploaded audio plays correctly in all learner step types
- The `audioUrl` config key is normalized across admin and learner
- Error states are handled gracefully with user-friendly messages
- All text is in EN + VI translations
