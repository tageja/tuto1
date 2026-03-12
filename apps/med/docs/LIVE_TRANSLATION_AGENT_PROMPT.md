# Agent Prompt: Live Phrase Translation — Expand to All Modules

Use this prompt to brief the next agent working on the live phrase translation feature.

---

## Your Role(s)

You are a **Senior Full-Stack Developer** and **Content Localization Specialist** for the NurseMed learning platform. Your responsibilities:

1. **Content Engineer**: Add `transcriptSegments` (EN→VI phrase mappings) to all audio_shadow steps across modules 2–12.
2. **Integration Specialist**: Ensure the existing TranslatableTranscript component and toggle work for every transcript that has segments.
3. **Quality Assurance**: Verify translations are accurate for medical/nursing terminology and that the UI behaves correctly.

---

## What Is Already Implemented

### 1. TranslatableTranscript Component
- **Path**: `apps/med/components/learn/TranslatableTranscript.tsx`
- **Behavior**: Renders transcript text; when `segments` and `enabled` are set, phrases become hoverable/tappable and show Vietnamese in a tooltip.
- **Props**: `text`, `segments?: { en: string; vi: string }[]`, `enabled?: boolean`
- **Logic**: Matches segment `en` against text (longer matches first), wraps matches in spans, shows `vi` on hover/click.
- **Exports**: `getPhraseTranslationDefault()`, `setPhraseTranslationEnabled()` — read/write `localStorage` key `nursed_phrase_translation_enabled`.

### 2. AudioShadowStep Integration
- **Path**: `apps/med/components/learn/steps/AudioShadowStep.tsx`
- **Behavior**: Uses `TranslatableTranscript` for transcript; shows a toggle button when `step.config.transcriptSegments` exists.
- **Toggle**: "Translations on" / "Translations off" (or "Bật dịch" / "Tắt dịch"). Persists in localStorage.
- **i18n keys**: `phraseTranslationOn`, `phraseTranslationOff`, `phraseTranslationToggle` in `apps/med/lib/i18n/translations.ts`.

### 3. Data Structure
Step config (Supabase `nursed_lesson_steps.config` JSONB) can include:

```ts
{
  transcript: "Nurse: Hello, I am here to help you. What happened? ...",
  transcriptSegments: [
    { en: "Hello", vi: "Xin chào" },
    { en: "I am here to help you", vi: "Tôi ở đây để giúp bạn" },
    // ... more phrases in order of appearance (optional; matching is by text)
  ]
}
```

### 4. Patch API
- **Endpoint**: `POST /api/seed/patch-transcript-segments`
- **Body**: `{ courseId?: string }`
- **Logic**:
  - If `courseId` provided: patches **module 1, lesson 1, step 2** (pilot dialogue).
  - Else: finds all `audio_shadow` steps whose transcript contains ≥2 of: "I am here to help", "My chest", "it hurts", "get help immediately", and adds `PILOT_SEGMENTS`.
- **Path**: `apps/med/lib/db/patch-transcript-segments.ts`

### 5. Where Content Lives
- **Module 5**: `apps/med/lib/db/module-5-content.ts` — has `transcriptSegments` on first audio_shadow step.
- **Module 6**: `apps/med/lib/db/module-6-content.ts` — multiple audio_shadow steps with `transcript`, no segments yet.
- **Module 7**: `apps/med/lib/db/module-7-content.ts` — same.
- **Modules 1–4**: Content in Supabase (Airtable or other seed). Use patch API or direct DB update.
- **Modules 8–12**: May have placeholder or no content yet.

---

## Your Task: Expand to All Modules

1. **Add `transcriptSegments`** to every `audio_shadow` step that has a `transcript`:
   - In `module-5-content.ts`, `module-6-content.ts`, `module-7-content.ts`: add segments inline, then re-seed.
   - For modules 1–4: extend the patch script or add a new patch that targets specific steps by module/lesson/step index.
   - For modules 8–12: when content exists, add segments the same way.

2. **Segment format**:
   - Each `{ en, vi }` maps an English phrase to its Vietnamese translation.
   - Prefer meaningful phrases (e.g. "I understand you are frightened" over single words where it helps).
   - Sort by length descending is handled in code; order in the array does not matter for matching.

3. **Medical accuracy**: Use correct Vietnamese for nursing/clinical terms. Reference existing translations in `apps/med/lib/i18n/translations.ts` and `patch-transcript-segments.ts` for style.

4. **Re-seed after changes**:
   - Module 5: `POST /api/seed/module-5` with `{"courseId":"9113d5cb-cedb-4bea-9678-7321020230e8"}`
   - Module 6: `POST /api/seed/module-6` with `{"moduleId":"<module-6-id>"}`
   - Module 7: `POST /api/seed/module-7` with `{"moduleId":"<module-7-id>"}`

5. **Do not change**:
   - TranslatableTranscript logic (unless fixing a bug).
   - Toggle behavior or localStorage key.
   - AudioShadowStep integration pattern.

---

## Key Files

| File | Purpose |
|------|---------|
| `apps/med/components/learn/TranslatableTranscript.tsx` | Core component; do not modify unless necessary |
| `apps/med/components/learn/steps/AudioShadowStep.tsx` | Renders transcript + toggle |
| `apps/med/lib/db/patch-transcript-segments.ts` | Patch logic; extend for more modules if needed |
| `apps/med/lib/db/module-5-content.ts` | Module 5 content + segments |
| `apps/med/lib/db/module-6-content.ts` | Module 6 content |
| `apps/med/lib/db/module-7-content.ts` | Module 7 content |
| `apps/med/lib/i18n/translations.ts` | UI strings (en/vi) |

---

## Course / Module IDs (Reference)

- Course ID: `9113d5cb-cedb-4bea-9678-7321020230e8`
- Module IDs can be fetched from the API or Supabase.

---

## Example: Adding Segments to a Step

```ts
// In module-6-content.ts (or similar)
{
  type: 'audio_shadow',
  title: 'Listen: ...',
  config: {
    transcript: "Nurse: Mr. Davies, I am Nurse Lan. I understand you are frightened. ...",
    transcriptSegments: [
      { en: 'Nurse:', vi: 'Điều dưỡng:' },
      { en: 'I understand you are frightened', vi: 'Tôi hiểu bạn đang sợ hãi' },
      { en: 'We are doing everything we can to help you', vi: 'Chúng tôi đang làm mọi thứ có thể để giúp bạn' },
      // ... add all key phrases
    ],
  },
},
```

---

## Checklist for Each Module

- [ ] List all `audio_shadow` steps with `transcript`
- [ ] Create `transcriptSegments` array for each
- [ ] Add to content file or patch script
- [ ] Re-seed and verify in UI
- [ ] Confirm toggle appears and works
- [ ] Spot-check Vietnamese translations for accuracy
