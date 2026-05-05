# HANDOVER U — ScriptRead: Per-Nurse-Turn Mic Recording in Dialogue View

## Agent Role & Identity

You are a **Senior Full-Stack Next.js Developer** specialising in conversational UI and audio recording UX. You understand MediaRecorder, inline audio upload flows, and how to add gateable interactivity to a dialogue display.

Working directory: `apps/med/` within the monorepo at the repo root.
Test account: `test@test.com` / `password` (role: learner). Auth disabled locally via `NEXT_PUBLIC_AUTH_DISABLED=true`.
Dev server: `npm run dev` in `apps/med/` → `http://localhost:3001`.

---

## Feature Overview

The `script_read` step displays a multi-turn dialogue between nurse/patient/doctor. Currently the learner is **fully passive** — they read and tap audio buttons, nothing more.

This feature adds **mandatory nurse-line recordings**: every nurse turn in the dialogue gets a mic button. The learner must record their voice for **every nurse line** before the "Done" button becomes active. Patient, doctor, and family lines are **read-only** — no mic button.

**User experience:**
1. Learner reads the full dialogue (existing layout unchanged)
2. Next to each nurse chat bubble, a mic icon appears (on the right side of the bubble, or below it)
3. Tapping the mic → starts recording for that line
4. Tapping again → stops and shows a mini playback
5. A small green tick appears when a line has been recorded
6. The "Done" / "Complete" button is **disabled** until all nurse lines have at least one recording each
7. On "Done", all recordings upload to Supabase Storage and save to `nursed_submissions`, then `onComplete()` is called

---

## Current State

### ScriptReadStep
**File:** `apps/med/components/learn/steps/ScriptReadStep.tsx`

- Renders `lines: ScriptLine[]` where each line has `{ role, text, text_vi? }`
- Uses `isLeftSide(role)` to determine bubble alignment:
  - Left side (nurse, doctor, supervisor) → nurse-side
  - Right side (patient, family) → non-nurse
- `ConversationBubble` (`apps/med/components/learn/ConversationBubble.tsx`) renders the individual bubble — read this file to understand what props it accepts before modifying
- The "Done Reading" button is at the bottom (single `btn-primary`)
- The nurse-specific check is `isLeftSide(role)` — BUT note that doctor/supervisor are also `isLeftSide`. For mic placement, **only add mic to `role === 'nurse'`**, not doctor or supervisor.

### Recording infrastructure
Read `apps/med/components/learn/steps/RecordingStep.tsx` before writing any MediaRecorder code. The core pattern is already there — extract and reuse it.

Key pattern:
```typescript
const mediaRecorderRef = useRef<MediaRecorder | null>(null)
const chunksRef = useRef<Blob[]>([])

async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  const recorder = new MediaRecorder(stream)
  recorder.ondataavailable = (e) => chunksRef.current.push(e.data)
  recorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
    // store blob
  }
  recorder.start()
  mediaRecorderRef.current = recorder
}
function stopRecording() {
  mediaRecorderRef.current?.stop()
}
```

### Supabase Storage
Bucket: `nursed-assets` (already exists).
Upload path for this feature: `nursed-assets/audio/{stepId}/nurse_line_{userId}_{lineIdx}.webm`

Use `createClient()` (anon client, from `@/lib/supabase`) for the upload — the RLS on storage should allow authenticated users to upload to their own path. Check the bucket's RLS; if uploads fail, use the service client from an API route instead.

---

## Out of Scope

- Do NOT build the "Listen → Read Along → Speak Together" three-phase flow — that is Agent T's job (Handover T).
- Do NOT add peer review — that is also Agent T's job.
- This handover is specifically for: **mic button per nurse line in the existing dialogue layout**, with the Done button gated on all nurse lines being recorded.
- Do NOT touch any other step component.
- Do NOT add new npm packages.

---

## Database Changes

None. Use existing `nursed_submissions` table:
```
type: 'recording'
lesson_id: step.lesson_id
step_id: step.id
user_id: (from session)
recording_url: <Supabase Storage public URL>
```

One submission record per **step** (not per line) — store an array of line recording URLs in `meta` field if available, or just the last one. Check `nursed_submissions` schema in `supabase/migrations/041_nursed_schema.sql` first.

---

## UI Components

### `apps/med/components/learn/steps/ScriptReadStep.tsx` — primary change

**State to add:**
```typescript
// Map from line index to recorded blob/URL
const [lineRecordings, setLineRecordings] = useState<Record<number, Blob | null>>({})
const [activeRecordingIdx, setActiveRecordingIdx] = useState<number | null>(null)
const [isUploading, setIsUploading] = useState(false)

// Nurse line indices (only role === 'nurse')
const nurseLineIndices = useMemo(
  () => lines.map((l, i) => ({ l, i })).filter(({ l }) => l.role.toLowerCase() === 'nurse').map(({ i }) => i),
  [lines]
)
const allNurseLinesRecorded = nurseLineIndices.every((i) => !!lineRecordings[i])
```

**Per nurse line — add a mic button row below each nurse bubble:**

The mic button should be placed **below the nurse bubble** (not inside `ConversationBubble` — avoid modifying that shared component):

```tsx
{lines.map((line, idx) => {
  const isNurse = line.role.toLowerCase() === 'nurse'
  const hasRecording = !!lineRecordings[idx]
  const isActiveRecording = activeRecordingIdx === idx

  return (
    <div key={idx}>
      {/* existing bubble row */}
      <div className={`flex items-end gap-2 ${isLeft ? 'flex-row' : 'flex-row-reverse'}`}>
        <ConversationAvatar role={avatarRole} size={36} />
        <ConversationBubble ... />
      </div>

      {/* Mic button row — only for nurse lines */}
      {isNurse && (
        <div className="ml-11 mt-1 flex items-center gap-2">
          <button
            onClick={() => isActiveRecording ? stopLineRecording(idx) : startLineRecording(idx)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
              isActiveRecording
                ? 'bg-red-500 text-white border-red-500 animate-pulse'
                : hasRecording
                ? 'bg-green-50 text-success border-success'
                : 'bg-surface text-text-muted border-border hover:border-primary hover:text-primary'
            }`}
          >
            <Mic size={13} />
            {isActiveRecording ? 'Stop' : hasRecording ? '✓ Re-record' : 'Record'}
          </button>
          {hasRecording && (
            <audio
              src={URL.createObjectURL(lineRecordings[idx]!)}
              controls
              className="h-7 max-w-[160px]"
            />
          )}
        </div>
      )}
    </div>
  )
})}
```

**Done button — gated:**
```tsx
<button
  onClick={handleDone}
  disabled={!allNurseLinesRecorded || isUploading}
  className="btn-primary w-full justify-center disabled:opacity-40"
>
  {isUploading ? t.scriptReadUploading : t.btnDoneReading}
  <ChevronRight size={16} />
</button>
```

**handleDone:**
1. `setIsUploading(true)`
2. For each `idx` in `nurseLineIndices`, upload `lineRecordings[idx]` blob to Supabase Storage
3. Collect all public URLs
4. `POST /api/submissions` with `{ lesson_id, step_id, type: 'recording', recording_url: urls[0], meta: { line_urls: urls } }`
5. `setIsUploading(false)`
6. `onComplete()`

---

## API Routes

No new API routes needed. The existing `POST /api/submissions` handles recording submission. Verify it accepts `recording_url` and optionally `meta`.

---

## Translation Keys

Add to `apps/med/lib/i18n/translations.ts` (both `en` and `vi`):

```typescript
// EN:
scriptReadRecordNurseLine: 'Record your voice for this line',
scriptReadAllRecordedNotice: 'All nurse lines recorded — tap Done to continue.',
scriptReadUploading: 'Saving recordings...',

// VI:
scriptReadRecordNurseLine: 'Ghi âm giọng đọc cho câu này',
scriptReadAllRecordedNotice: 'Đã ghi xong tất cả câu điều dưỡng — nhấn Hoàn thành.',
scriptReadUploading: 'Đang lưu bản ghi...',
```

---

## Testing Checklist

1. Open a lesson with a `script_read` step that has at least 2 nurse lines and 1 patient line.
2. Confirm mic buttons appear **only under nurse lines** — not under patient/doctor lines.
3. Tap a mic button → browser requests microphone permission.
4. While recording: button shows "Stop" with red pulsing style.
5. After stopping: `<audio>` playback element appears. Green tick/checkmark shows on the button.
6. Try tapping "Done" before all nurse lines recorded → button is disabled (greyed out).
7. Record all nurse lines → "Done" button becomes active.
8. Tap Done → recordings upload → `onComplete()` fires (lesson advances to next step).
9. Check Supabase Storage in dashboard → `nursed-assets/audio/{stepId}/nurse_line_{userId}_N.webm` files exist.
10. Language toggle set to VI: mic buttons and their labels still appear correctly (labels use `t.` keys).
11. Run `npm run build` and `npx tsc --noEmit` — zero new errors.

---

## Guardrails

- Only add mic buttons to lines where `line.role.toLowerCase() === 'nurse'`. Doctor/supervisor/patient/family must not get mic buttons.
- Do NOT modify `ConversationBubble.tsx` — add the mic button as a sibling element in `ScriptReadStep`, not inside the bubble component.
- Do NOT touch `RecordingStep.tsx` — read it, don't change it.
- Do NOT add new npm packages — use lucide-react `Mic` icon (already installed).
- All strings go through `useLang()` — no hardcoded text in JSX.
- Run `npm run build` before declaring done.

---

## Definition of Done

- [ ] Mic button appears under each nurse line in the dialogue
- [ ] Patient/doctor/family lines have no mic button
- [ ] Recording starts/stops correctly using MediaRecorder
- [ ] After recording, playback widget appears inline
- [ ] Done button is disabled until all nurse lines have recordings
- [ ] On Done, blobs upload to Supabase Storage and a `nursed_submissions` record is created
- [ ] `npm run build` passes with zero new TypeScript errors
