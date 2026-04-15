# NurseEd Test Agent Instructions

**App:** med.tuto.asia · **Branch:** nursemed1.3 · **Port:** 3001  
**CSV:** `apps/med/tests/test-cases.csv`

---

## Your Job

1. Start the dev server
2. Read `test-cases.csv` row by row (skip rows with empty `test_id`)
3. Execute each test case in a browser
4. Write `PASS`, `FAIL`, `SKIP`, or `ERROR` into the `status` column
5. Write what actually happened into `actual_result`
6. Write any useful detail into `notes`
7. Save the CSV when done
8. Fill in the SUMMARY rows at the bottom

---

## Step 1 — Start the Dev Server

```bash
cd C:/Users/Admin/tuto/apps/med
npm run dev
```

Wait for `Ready in Xms` — server is on **http://localhost:3001**.

---

## Step 2 — One-Time Setup

### Required: create `apps/med/.env.local`

Create (or update) the file `apps/med/.env.local` with these values:

```env
# Supabase — get these from the Vercel dashboard or Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>

# Optional — only needed for write operations (create/update/delete in admin)
# Without this key, all READ API routes still work via the anon key fallback
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# ── AUTH REDIRECT URL ───────────────────────────────────────────────────────
# Ensures magic link / OAuth redirects go to the correct domain.
# The shared Supabase project's Site URL points to tutoglobal.com, so this
# env var tells the auth helpers to always use this origin instead.
# Local dev: http://localhost:3001   Production: https://med.tuto.asia
NEXT_PUBLIC_SITE_URL=http://localhost:3001

# App URL — used by Next.js metadataBase in layout.tsx
NEXT_PUBLIC_APP_URL=http://localhost:3001

# ── TESTING BYPASS ──────────────────────────────────────────────────────────
# Set this to 'true' to skip all authentication checks.
# /learn/** and /admin/** are accessible without login.
# Remove or set to 'false' before deploying to production.
NEXT_PUBLIC_AUTH_DISABLED=true
```

With `NEXT_PUBLIC_AUTH_DISABLED=true`:
- All `/learn/**` and `/admin/**` pages load without needing a session
- Auth pages (`/auth/login`, `/auth/register`, `/auth/verify`) still work for testing auth features
- Admin role guard is bypassed — admin pages render directly

### Optional: create a test learner account (for auth feature tests T009–T025)
1. Set `NEXT_PUBLIC_AUTH_DISABLED=false` (or remove it) temporarily
2. Navigate to http://localhost:3001/auth/register
3. Register with: **Full name:** Test Nurse | **Email:** any valid email | **Password:** testpass123
4. Verify via the email link from Supabase
5. Re-enable `NEXT_PUBLIC_AUTH_DISABLED=true` for the rest of testing

### Optional: promote to super_admin (for role guard tests T026–T031 only)
```sql
UPDATE nursed_profiles 
SET role = 'super_admin' 
WHERE id = '<your-user-id>';
```

### Create test step data for interactive exercise tests
For tests T062–T091 you need steps of type `matching`, `drag_order`, `flash_card`, and a `cloze` step with `wordBank: true` in its config. Create these via:
1. http://localhost:3001/admin/courses → pick any course
2. Open any lesson → Add Step → select the type
3. Edit the step to add config (see format below)

**Matching step config:**
```json
{
  "pairs": [
    { "en": "Blood pressure", "vi": "Huyết áp" },
    { "en": "Heart rate", "vi": "Nhịp tim" },
    { "en": "Temperature", "vi": "Nhiệt độ" }
  ]
}
```

**Drag order step config:**
```json
{
  "lines": [
    "Good morning, what is your name?",
    "My name is Nguyen Van An.",
    "How are you feeling today?",
    "I have a headache and fever."
  ]
}
```

**Flash card step config:**
```json
{
  "cards": [
    { "front_en": "Patient is short of breath", "back_vi": "Bệnh nhân khó thở" },
    { "front_en": "Take your medication", "back_vi": "Uống thuốc của bạn" },
    { "front_en": "I will check your vitals", "back_vi": "Tôi sẽ kiểm tra sinh hiệu của bạn" }
  ]
}
```

**Cloze word-bank step config:**
```json
{
  "clozeText": "The patient has a [fever] and [headache]. Their blood pressure is [high].",
  "wordBank": true,
  "decoys": ["low", "normal"]
}
```

---

## Step 3 — Running Tests

### Status values
| Status | Meaning |
|--------|---------|
| `PASS` | Behaviour exactly matches Expected Result |
| `FAIL` | Behaviour does NOT match Expected Result |
| `SKIP` | Could not test (missing data / not applicable) |
| `ERROR` | Page crashed / JS error / 500 error |

### For API tests (T111–T119)
You can use the browser address bar, or run in a terminal:
```bash
curl http://localhost:3001/api/courses | python -m json.tool
```

### For DB schema tests (T120–T122)
Open Supabase dashboard → Table Editor → check `nursed_profiles` table.

---

## Step 4 — Update the CSV

After each test, update the row in `test-cases.csv`:
- `status` → PASS / FAIL / SKIP / ERROR
- `actual_result` → what you observed
- `notes` → anything useful (error messages, screenshot filenames, etc.)

At the end, fill in the SUMMARY section at the bottom of the CSV.

---

## Known Pre-Existing Issues (not failures)

These TypeScript errors existed before nursemed1.3 — do NOT mark as FAIL:
- `StepEditor.tsx:160` — `'family'` comparison warning
- `translations.ts` — duplicate property keys (lines ~109, 339, 688, 691, 843, 1073, 1422, 1425)
- `next.config.ts:7` — `eslint` property unknown

## Known Limitations (mark as SKIP if untestable)

- **T018** (Magic link): Requires real email inbox access to click the link
- **T023** (Register success): Requires throwaway email that can receive Supabase confirmation
- **T048** (VI subtitles): Requires a step with `subtitle_vtt_vi` config already set
- **T083/T084/T085** (FlashCard summary/restart): Requires completing all cards first

---

## Supabase SQL Setup — REQUIRED before re-running step tests

**Migration 043** fixes the root cause of all step creation failures (`POST /api/steps → 500`).
Apply it in the Supabase dashboard → SQL Editor:

```sql
-- File: supabase/migrations/043_nursed_step_types_and_schema_fixes.sql
-- Run each block in order.

-- 1. Fix the type CHECK constraint on nursed_lesson_steps
--    (original migration only allowed 8 types; 6 new types cause 500 errors)
ALTER TABLE nursed_lesson_steps
  DROP CONSTRAINT IF EXISTS nursed_lesson_steps_type_check;

ALTER TABLE nursed_lesson_steps
  ADD CONSTRAINT nursed_lesson_steps_type_check CHECK (type IN (
    'video', 'audio_shadow', 'script_read', 'cloze', 'no_script',
    'recording_submit', 'quiz', 'mission',
    'scenario_intro', 'self_reflection', 'conversation_animation',
    'matching', 'drag_order', 'flash_card'
  ));

-- 2. Add missing columns
ALTER TABLE nursed_lesson_steps ADD COLUMN IF NOT EXISTS title_vi text;
ALTER TABLE nursed_lessons ADD COLUMN IF NOT EXISTS stage text
  CHECK (stage IN ('heads_up', 'heads_down', 'heads_together', 'assessment'));
ALTER TABLE nursed_lessons ADD COLUMN IF NOT EXISTS objective text;

-- 3. Create nursed_profiles (auth user metadata)
CREATE TABLE IF NOT EXISTS nursed_profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  hospital_id uuid REFERENCES nursed_hospitals(id) ON DELETE SET NULL,
  role        text NOT NULL DEFAULT 'learner'
                CHECK (role IN ('learner', 'teacher', 'hospital_admin', 'super_admin')),
  avatar_url  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE nursed_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "nursed_profiles_self_read"   ON nursed_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "nursed_profiles_self_update" ON nursed_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "nursed_profiles_service_all" ON nursed_profiles FOR ALL   USING (true);
```

**After running this SQL**, re-run all SKIP tests for:
- T062–T091 (step creation + interactive exercises)
- T095–T100 (lesson player with real steps)
- T114 (lesson step saves persist)

Also in Supabase dashboard → Authentication → URL Configuration → Redirect URLs, add:
- `http://localhost:3001/auth/callback`
- `https://med.tuto.asia/auth/callback`

---

## T039 — "Coming Soon" is Expected Behaviour

**T039 is NOT a bug.** The course detail page (`/learn/courses/[courseId]`) intentionally shows a
"Coming Soon" state (Bell notification button, no module accordion) when `course.published = false`.
The full module list only renders when `course.published = true`.

To verify the accordion works, either:
- Publish a course in admin (toggle the Published badge) and reload the learner page, OR
- Check `nursed_courses` in Supabase and confirm the test course has `published = false`

Mark T039 as **SKIP** (requires published course data) or **PASS** if you publish a course and confirm the accordion appears.
