# HANDOVER T — ScriptRead: Three-Mode Interactive Flow (Listen → Read Along → Speak Together)

## Agent Role & Identity

You are a **Senior Full-Stack Next.js Developer** specialising in audio recording UX and peer-learning systems. You have deep experience with the Web MediaRecorder API, Supabase Storage uploads, and building progressive multi-step UIs with framer-motion.

Working directory: `apps/med/` within the monorepo at the repo root.
Migration folder: `supabase/migrations/` — next migration should be `054_*.sql`.
Test account: `test@test.com` / `password` (role: learner). Auth is disabled locally via `NEXT_PUBLIC_AUTH_DISABLED=true`.
Dev server: `npm run dev` in `apps/med/` → `http://localhost:3001`.

---

## Feature Overview

The `script_read` step type currently renders a dialogue (conversation bubbles) with optional audio per line, and a single "Done Reading" button. It has **no active learning** — the learner is entirely passive.

The product requires **three distinct sub-modes** within this step, presented as tabs or sequential phases:

1. **Listen** — learner listens to the full dialogue audio (already works — each line has an optional `audioUrl` per line). No change needed here except ensuring the tab/phase label exists.

2. **Read Along** — the step displays **only nurse lines** one at a time. For each nurse line:
   - Display the line text (English, large and clear)
   - Display the Vietnamese translation below in muted text (if available)
   - Show a **microphone button** → learner taps and records their voice
   - On recording completion, show a waveform/play-back preview and a "Submit & Next" button
   - After submitting the last nurse line recording, advance to the Speak Together phase
   - **Limit to the first 3 nurse lines** if the dialogue has more (configurable via `config.read_along_line_count`, default 3)
   - Skip patient/doctor/family lines — only nurse role lines appear

3. **Speak Together** — after the learner has recorded, fetch a **random peer recording** from the same pair group for the same step. Display:
   - The peer's name (or "A co-nurse") anonymously
   - A playback widget for their recording
   - A 1–5 star rating widget
   - A "Submit Rating" button → writes to `nursed_peer_reviews` and marks the step complete
   - If **no peer recording exists** (learner is first in their group, or not in a group): skip this phase and go directly to `onComplete()`

---

## Current State

### ScriptReadStep component
**File:** `apps/med/components/learn/steps/ScriptReadStep.tsx`

Currently renders:
- A dialogue of `ScriptLine[]` objects (role + text + optional text_vi)
- Per-line `ConversationBubble` components with optional audio playback
- A single `btn-primary` "Done Reading" button at the bottom
- No recording, no sub-steps, no peer review

The component knows about nurse vs non-nurse roles via `isLeftSide(role)` helper (line 61–65).

### Audio Recording Infrastructure (partially built — Agent F)
Agent F's handover (`HANDOVER_F_AUDIO_RECORDING_INFRA.md`) describes the MediaRecorder approach and Supabase Storage bucket `nursed-assets`. The `RecordingStep` component (`apps/med/components/learn/steps/RecordingStep.tsx`) already has a working MediaRecorder implementation — **read it carefully** and extract the recording logic rather than rewriting it from scratch.

### Supabase Tables
- `nursed_submissions` — per-step submissions. For recording: `{ lesson_id, step_id, user_id, type: 'recording', recording_url }`. Use `getServiceClient()` to insert.
- `nursed_peer_reviews` — `{ reviewer_id, submission_id, rating (1–5) }`. RLS: learner can read submissions from group members, can insert reviews for group members (not self).
- `nursed_pair_members` — links `user_id` to `pair_group_id`. Query this to find group peers.

### API Routes that exist
- `POST /api/submissions` — saves a submission record (check `apps/med/app/api/submissions/route.ts`)
- `POST /api/peer-reviews` — may or may not exist; check `apps/med/app/api/` before creating

### Translation keys (in `apps/med/lib/i18n/translations.ts`)
Keys you will need — add them if missing:
- `scriptReadTabListen`, `scriptReadTabReadAlong`, `scriptReadTabSpeakTogether`
- `scriptReadRecordPrompt` (e.g. "Tap to record your voice")
- `scriptReadSubmitLine` (e.g. "Submit & Next Line")
- `scriptReadNoPeerRecording` (e.g. "No peer recording available yet — you're first! Great job.")
- `scriptReadPeerRatingPrompt` (e.g. "How would you rate this recording?")
- `scriptReadPeerSubmitRating` (e.g. "Submit Rating")

---

## Out of Scope

- Do NOT touch `AudioShadowStep`, `QuizStep`, or any other step type.
- Do NOT build the admin editor for this feature — the current ScriptRead admin editor is sufficient; `config.read_along_line_count` can be set manually in the JSON editor.
- Do NOT add new npm packages. Use `MediaRecorder` (browser native), existing Supabase client, existing framer-motion.
- Do NOT modify any migration that already exists.

---

## Database Changes

No new tables needed. You will use `nursed_submissions` and `nursed_peer_reviews` which already exist.

You may need to add a `POLICY` if the current `nursed_submissions` RLS doesn't allow learners to query other users' recording submissions from their group. Check `supabase/migrations/041_nursed_schema.sql` and `045_nursed_peer_reviews.sql` for the existing policies. If a new select policy is needed for fetching a peer's recording submission, add it as migration `054_nursed_scriptread_peer_policy.sql`:

```sql
-- 054_nursed_scriptread_peer_policy.sql
-- Allow learners to read recording submissions from peers in their pair group
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'nursed_submissions'
      AND policyname = 'submissions_peer_group_read'
  ) THEN
    CREATE POLICY "submissions_peer_group_read" ON nursed_submissions
      FOR SELECT USING (
        type = 'recording'
        AND EXISTS (
          SELECT 1 FROM nursed_pair_members pm1
          JOIN nursed_pair_members pm2 ON pm2.pair_group_id = pm1.pair_group_id
          WHERE pm1.user_id = nursed_submissions.user_id
            AND pm2.user_id = auth.uid()
            AND pm1.user_id != auth.uid()
        )
      );
  END IF;
END $$;
```

Apply this via Supabase SQL editor before writing code against it.

---

## API Routes

### Existing — verify these exist before creating:
- `GET /api/submissions?stepId=X&type=recording&peer=true` — fetch a random peer recording for the same step
- `POST /api/peer-reviews` — create a peer review

### If peer submission fetch doesn't exist, create:
**File:** `apps/med/app/api/submissions/peer/route.ts`
```
GET /api/submissions/peer?stepId=<uuid>
Auth: required (session user)
Logic:
  1. Find the current user's pair group from nursed_pair_members
  2. Find one random nursed_submissions record where:
     - step_id = stepId
     - type = 'recording'
     - user_id is a group member (not self)
     - recording_url is not null
  3. Return { submission_id, recording_url, reviewer_name: 'A co-nurse' }
     (anonymise the name — do not expose user email/name in this MVP)
Response: { data: { submission_id, recording_url } | null }
```

### If peer review submit doesn't exist, create:
**File:** `apps/med/app/api/peer-reviews/route.ts`
```
POST /api/peer-reviews
Body: { submission_id: uuid, rating: 1–5 }
Auth: required
Logic: Insert into nursed_peer_reviews (reviewer_id = session user, submission_id, rating)
       Returns 409 if already reviewed (unique constraint)
Response: { success: true }
```

---

## UI Components

### Primary change: `apps/med/components/learn/steps/ScriptReadStep.tsx`

Restructure the component into three phases managed by local state:
```typescript
type Phase = 'listen' | 'read_along' | 'speak_together'
const [phase, setPhase] = useState<Phase>('listen')
```

**Phase: listen**
- Render the existing full dialogue (all lines, all avatars, per-line audio buttons)
- Replace the "Done Reading" button with: "I've listened → Start Recording" button → sets phase to `'read_along'`

**Phase: read_along**
- Extract nurse lines from `lines` array: `const nurseLines = lines.filter(l => isNurseRole(l.role))`
- Take only `config.read_along_line_count ?? 3` of them
- Track `currentNurseLineIdx` (0-indexed)
- For each nurse line, show:
  - Large card with the English text (e.g. `text-xl font-semibold`)
  - Vietnamese translation below if available (muted, italic)
  - Mic button (red circle, pulsing when recording)
  - After recording: waveform preview (use `<audio>` element), "Submit & Next" button
- On submit: upload the blob to Supabase Storage path `nursed-assets/audio/{stepId}/read_along_{userId}_{lineIdx}.webm`, save URL to `nursed_submissions`
- After all nurse lines recorded → set phase to `'speak_together'`

**Recording implementation** — extract from `RecordingStep.tsx`:
```typescript
const mediaRecorderRef = useRef<MediaRecorder | null>(null)
const chunksRef = useRef<Blob[]>([])

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream)
  recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
  recorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    setRecordedBlob(blob)
  }
  recorder.start()
  mediaRecorderRef.current = recorder
}
```

**Phase: speak_together**
- On entering this phase, call `GET /api/submissions/peer?stepId=X`
- If no peer recording → show a friendly message + "Complete" button → `onComplete()`
- If peer recording found:
  - Show `<audio controls src={peerRecording.recording_url} />` labelled "A co-nurse recorded:"
  - 5-star rating widget (1–5 clickable stars using lucide `Star` icon)
  - "Submit Rating" button → `POST /api/peer-reviews` → `onComplete()`

---

## Wiring & Integration

- `renderLessonStep.tsx` — no change needed, `script_read` already maps to `ScriptReadStep`
- `LessonPlayer.tsx` — no change needed
- Supabase uploads: use `supabase.storage.from('nursed-assets').upload(path, blob)` with the client from `lib/supabase-server.ts` or the anon client. Use `getPublicUrl()` to get the URL.
- Use `getServiceClient()` from `lib/supabase.ts` in API routes to bypass RLS for recording uploads.

---

## Translation Keys to Add

In `apps/med/lib/i18n/translations.ts`, add to both `en` and `vi` objects:

```typescript
// EN:
scriptReadTabListen: 'Listen',
scriptReadTabReadAlong: 'Read Along',
scriptReadTabSpeakTogether: 'Speak Together',
scriptReadRecordPrompt: 'Tap the mic and read the sentence aloud',
scriptReadSubmitLine: 'Submit & Next',
scriptReadAllLinesRecorded: 'All lines recorded!',
scriptReadNoPeerRecording: "You're first in your group — great job! No peer recordings yet.",
scriptReadPeerRatingPrompt: 'How clear and natural did this sound?',
scriptReadPeerSubmitRating: 'Submit Rating',
scriptReadPeerPlayback: 'A co-nurse recorded:',

// VI:
scriptReadTabListen: 'Nghe',
scriptReadTabReadAlong: 'Đọc theo',
scriptReadTabSpeakTogether: 'Cùng luyện',
scriptReadRecordPrompt: 'Nhấn mic và đọc to câu trên',
scriptReadSubmitLine: 'Nộp & Tiếp theo',
scriptReadAllLinesRecorded: 'Đã ghi xong tất cả!',
scriptReadNoPeerRecording: 'Bạn là người đầu tiên trong nhóm — tuyệt vời! Chưa có bản ghi của bạn cùng nhóm.',
scriptReadPeerRatingPrompt: 'Bản ghi này nghe rõ và tự nhiên không?',
scriptReadPeerSubmitRating: 'Gửi đánh giá',
scriptReadPeerPlayback: 'Một đồng nghiệp đã ghi:',
```

---

## Testing Checklist

1. Open any lesson with a `script_read` step. Confirm three tabs/phases appear: Listen, Read Along, Speak Together.
2. **Listen phase:** All dialogue bubbles visible. Audio plays per line. "Start Recording" button advances to Read Along.
3. **Read Along — first nurse line:** Only the nurse's first sentence shows. Mic button is visible. Tap mic → browser requests microphone permission.
4. **Recording in progress:** Mic button shows recording state (red pulse). Tap again to stop.
5. **After recording:** Playback audio element appears. "Submit & Next" button enabled. Click → recording uploads to Supabase Storage. Second nurse line appears.
6. **After all nurse lines:** Phase advances to Speak Together automatically.
7. **Speak Together — no peer:** If test account has no group peers with recordings, see the friendly "you're first" message. "Complete" button calls `onComplete()`.
8. **Speak Together — with peer:** If a peer recording exists, it plays. 5-star rating widget works. Submit → writes to `nursed_peer_reviews` → `onComplete()`.
9. Check with language toggle set to VI: nurse line shows English text (large) with VI translation below.
10. Run `npm run build` and `npx tsc --noEmit` — zero new errors.

---

## Guardrails

- Do NOT touch `AudioShadowStep.tsx`, `RecordingStep.tsx` (read it, don't modify it), or any other step component.
- Do NOT touch `LessonPlayer.tsx` or `renderLessonStep.tsx`.
- Do NOT add any new npm packages.
- Do NOT hardcode strings — all UI text goes through `useLang()` via `lib/i18n/translations.ts`.
- Do NOT create summary or documentation files beyond this handover.
- The recording upload path must be `nursed-assets/audio/{stepId}/read_along_{userId}_{lineIdx}.webm` to avoid collisions.
- Apply migration 054 via Supabase SQL editor and verify the policy exists before writing code that depends on it.
- Run `npm run build` before declaring done.

---

## Definition of Done

- [ ] ScriptReadStep has three explicit phases: Listen → Read Along → Speak Together
- [ ] Read Along records the first N nurse lines (N = `config.read_along_line_count ?? 3`)
- [ ] Each recording uploads to Supabase Storage and saves a `nursed_submissions` record
- [ ] Speak Together fetches a peer recording (or gracefully skips if none)
- [ ] Star rating submits to `nursed_peer_reviews`
- [ ] Language toggle: nurse line in Read Along shows English primary + VI subtitle
- [ ] `npm run build` passes with zero new TypeScript errors
