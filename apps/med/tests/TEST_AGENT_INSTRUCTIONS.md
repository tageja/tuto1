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

## Supabase SQL Setup (run once in dashboard)

```sql
-- Create nursed_profiles table (if not yet created)
CREATE TABLE IF NOT EXISTS nursed_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  full_name text,
  hospital_id uuid REFERENCES nursed_hospitals(id),
  role text NOT NULL DEFAULT 'learner'
    CHECK (role IN ('learner', 'teacher', 'hospital_admin', 'super_admin')),
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE nursed_profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY "own profile read" ON nursed_profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile  
CREATE POLICY "own profile update" ON nursed_profiles
  FOR UPDATE USING (auth.uid() = id);
```

Also in Supabase dashboard → Authentication → URL Configuration → Redirect URLs, add:
- `http://localhost:3001/auth/callback`
- `https://med.tuto.asia/auth/callback`
