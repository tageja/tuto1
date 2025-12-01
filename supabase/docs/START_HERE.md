# 🚀 START HERE - Supabase Migration

**All infrastructure is ready!** Follow these steps to complete the migration.

---

## ⚡ Quick Start (Step-by-Step)

### 1️⃣  Install Dependencies (2-3 minutes)

**IMPORTANT**: Do this first before running any migration scripts!

```bash
npm install --legacy-peer-deps
```

This installs:
- @supabase/supabase-js (Supabase client)
- pg (Postgres client for scripts)
- uuid (for ID generation)
- Other required packages

**Verify installation**:
```bash
node -e "console.log('✅ Node.js working')"
```

If you see "✅ Node.js working", you're ready to continue!

---

### 2️⃣  Apply Database Migrations (5 minutes)

Migration 001 is already applied ✅. Apply the remaining two:

**Go to Supabase SQL Editor**:  
https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/sql

**Run Migration 002** (RLS Policies):
1. Open `supabase/migrations/002_rls_policies.sql` in your code editor
2. Copy ALL content (Ctrl+A, Ctrl+C)
3. Paste into Supabase SQL Editor
4. Click "Run" button
5. Wait for "Success" message

**Run Migration 003** (Functions & Triggers):
1. Open `supabase/migrations/003_functions_triggers.sql`
2. Copy ALL content
3. Paste into Supabase SQL Editor
4. Click "Run"
5. Wait for "Success"

**Verify migrations applied**:
```sql
-- Copy and run this in SQL Editor
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';
-- Should return 35+

SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- Should show: schools, teachers, students, classes, etc.
```

---

### 3️⃣  Export Data from Airtable (10-15 minutes)

**Before running, ensure**:
- Your `AIRTABLE_PAT` is in root `.env` file
- Or add it now: Open `.env` and add:
  ```
  EXPO_PUBLIC_AIRTABLE_API_KEY=YOUR_AIRTABLE_PAT
  ```

**Run export**:
```bash
npm run supabase:export-airtable
```

**What to expect**:
- Script will export all 35+ tables
- Files saved to `supabase/data/airtable-export/`
- Summary saved to `EXPORT_SUMMARY.json`
- Takes 10-15 minutes depending on data volume

**Verify export**:
- Check `supabase/data/airtable-export/` folder exists
- Check it has files like `TutoTeachers.json`, `TutoSchools.json`, etc.
- Open `EXPORT_SUMMARY.json` to see stats

---

### 4️⃣  Import Data to Supabase (15-20 minutes)

**Dry run first** (validates without writing):
```bash
npm run supabase:import-data:dry
```

**If dry run succeeds, run actual import**:
```bash
npm run supabase:import-data
```

**What to expect**:
- Script transforms Airtable data to Postgres format
- Inserts all records with foreign key relationships
- Progress shown for each table
- Any errors logged to `supabase/logs/import-errors.jsonl`

**Verify import**:
```bash
npm run supabase:verify-import
```

Or check manually in Supabase SQL Editor:
```sql
SELECT 'schools' as table, COUNT(*) FROM public.schools
UNION ALL
SELECT 'teachers', COUNT(*) FROM public.teachers
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'school_classes', COUNT(*) FROM public.school_classes;
```

---

### 5️⃣  Configure Environment Variables (5 minutes)

**Add to root `.env`** (create if doesn't exist):
```env
# Supabase - Mobile App
EXPO_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
```

**Create `apps/dashboard/.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Mzg0NiwiZXhwIjoyMDc4MzI5ODQ2fQ.FDJ8X28wmvBtgQnmwtRW6y3lc-Enm_QTykmU1HGEX-w
```

**Update `app.config.js`** - Add to `extra` section:
```javascript
extra: {
  // Existing Firebase config...
  
  // Add Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}
```

---

### 6️⃣  Enable Google OAuth in Supabase (5 minutes)

1. Go to: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/auth/providers
2. Find "Google" in the list
3. Click to expand
4. Toggle "Enable Sign in with Google"
5. You'll need:
   - **Client ID**: Get from Firebase Console or Google Cloud Console
   - **Client Secret**: Get from same place
6. Add Authorized Redirect URLs:
   - `https://fkjeggdxqifqqwhuqpgm.supabase.co/auth/v1/callback`
7. Save

**Where to get Client ID/Secret**:
- Firebase Console: https://console.firebase.google.com/project/tuto1-73fc4/authentication/providers
- Or Google Cloud: https://console.cloud.google.com/apis/credentials?project=tuto1-73fc4

---

### 7️⃣  Update Application Code

**You now have Supabase clients ready to use**:
- Mobile: `src/config/supabase.ts`
- Web: `apps/dashboard/lib/supabase.ts`

**Update your code to use them**. Examples:

#### Mobile App - Auth Example

```typescript
// src/screens/AuthUnifiedScreen.tsx

// OLD
import { getAuthSafe } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const auth = getAuthSafe();
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// NEW
import { supabase, signInWithEmail } from '../config/supabase';

const { user, session } = await signInWithEmail(email, password);
```

#### Mobile App - Data Example

```typescript
// Any screen using Airtable

// OLD
import { useAirtable } from '../hooks/useAirtable';
const { getTeachers } = useAirtable();
const teachers = await getTeachers();

// NEW
import { supabase } from '../config/supabase';
const { data: teachers } = await supabase
  .from('teachers')
  .select('*')
  .eq('status', 'active');
```

#### Web Dashboard - Auth Example

```typescript
// apps/dashboard/contexts/AuthContext.tsx

// OLD
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

await signInWithEmailAndPassword(auth, email, password);

// NEW
import { supabase } from '@/lib/supabase';

await supabase.auth.signInWithPassword({ email, password });
```

#### Web Dashboard - Data Example

```typescript
// apps/dashboard/app/api/school/teachers/route.ts

// OLD
const response = await fetch(`https://api.airtable.com/v0/${BASE_ID}/TutoSchoolTeachers`, {
  headers: { Authorization: `Bearer ${AIRTABLE_PAT}` }
});

// NEW
import { createServerSupabaseClient } from '@/lib/supabase';

const supabase = createServerSupabaseClient();
const { data: teachers } = await supabase
  .from('school_teachers')
  .select('*')
  .eq('school_id', schoolId);
```

---

### 8️⃣  Test Everything (20 minutes)

**Mobile App**:
```bash
npx expo start --clear
```

Test:
- [ ] Login with email/password
- [ ] Login with Google (after OAuth configured)
- [ ] Teachers list loads
- [ ] Can create booking
- [ ] Profile shows

**Web Dashboard**:
```bash
cd apps/dashboard && npm run dev
```

Test:
- [ ] Login works
- [ ] School selection works
- [ ] Teachers page loads
- [ ] Students page loads
- [ ] Classes page loads

---

### 9️⃣  Go Live

When testing passes, follow `supabase/docs/CUTOVER.md`

---

### 🔟 Monitor & Maintain

- Monitor Supabase logs for first 24 hours
- Keep Airtable as backup for 30 days
- Address any issues that arise

---

## 🆘 If Something Goes Wrong

**Rollback immediately**: See `supabase/docs/ROLLBACK.md`

Quick rollback (5 minutes):
1. Comment out Supabase env vars
2. Uncomment Firebase env vars
3. Restart apps
4. You're back to Airtable

---

## 📚 Documentation

- `supabase/README.md` - Complete guide
- `supabase/MIGRATION_SUMMARY.md` - What was done
- `supabase/docs/CUTOVER.md` - Go-live procedure
- `supabase/docs/ROLLBACK.md` - If things go wrong
- `supabase/docs/SECURITY_CHECKLIST.md` - Security verification

---

## ✅ Migration Infrastructure Complete!

**Created**:
- 15+ files
- 2000+ lines of SQL and TypeScript
- 35+ database tables
- Complete security (RLS on everything)
- Comprehensive documentation

**Next**: Execute steps 1-9 above to complete the migration.

**Time to complete**: 2-3 hours  
**Benefit**: Unified auth, better performance, resolved auth issues

---

**👉 Start with Step 1: Install Dependencies**

```bash
npm install --legacy-peer-deps
```

Then continue with Step 2...

