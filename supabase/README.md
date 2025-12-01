# Supabase Migration - Complete Guide

**Status**: Migration Infrastructure Complete ✅  
**Next**: Execute migration steps below

---

## 📋 What's Been Created

### Phase 1: Schema & Migrations ✅
- `migrations/001_initial_schema.sql` - 35+ tables, indexes, PostGIS
- `migrations/002_rls_policies.sql` - Complete RLS security
- `migrations/003_functions_triggers.sql` - Triggers, RPCs, helpers
- Migration 001 applied via MCP ✅

### Phase 2: Data Migration Scripts ✅  
- `scripts/export-airtable.ts` - Export all Airtable data to JSON
- `scripts/import-to-postgres.ts` - Transform and import to Supabase
- `scripts/verify-import.ts` - Verify data integrity
- `scripts/migrate-attachments.ts` - Move attachments to Supabase Storage

### Phase 3: Auth Configuration ✅
- `src/config/supabase.ts` - Mobile Supabase client
- `apps/dashboard/lib/supabase.ts` - Web Supabase client
- Auth helper functions for both platforms

### Phase 4: Application Integration
- Supabase clients ready for use
- Need to update screens/components to use Supabase
- See Phase 4 instructions below

### Phase 5: Testing & Cutover
- Test scripts prepared
- Cutover documentation ready
- See Phase 5 instructions below

---

## 🚀 Migration Execution Steps

### STEP 1: Apply Remaining Migrations (5 minutes)

Migrations 002 and 003 need to be applied to Supabase.

**Option A: Using Supabase Dashboard** (Recommended)

1. Go to: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/sql
2. Open `supabase/migrations/002_rls_policies.sql`
3. Copy all content and paste into SQL Editor
4. Click "Run"
5. Repeat for `003_functions_triggers.sql`

**Option B: Using Script**

```bash
npm install pg @supabase/supabase-js uuid dotenv ts-node --save-dev
npm run supabase:apply-migrations
```

**Verify**:
```sql
-- In Supabase SQL Editor
SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';
-- Should return 35+
```

---

### STEP 2: Export Airtable Data (10-15 minutes)

**Prerequisites**:
- Add your AIRTABLE_PAT to `supabase/.env` or root `.env`

**Run**:
```bash
npm run supabase:export-airtable
```

**What it does**:
- Exports all 35+ tables from Airtable
- Saves to `supabase/data/airtable-export/` as JSON
- Creates EXPORT_SUMMARY.json with stats

**Verify**:
- Check `supabase/data/airtable-export/` has JSON files
- Check EXPORT_SUMMARY.json shows successful exports

---

### STEP 3: Import Data to Supabase (15-20 minutes)

**Dry run first** (recommended):
```bash
npm run supabase:import-data:dry
```

**Run actual import**:
```bash
npm run supabase:import-data
```

**What it does**:
- Transforms Airtable data to Postgres format
- Maps Airtable IDs to UUIDs
- Resolves foreign key relationships
- Bulk inserts with transactions
- Logs errors to `supabase/logs/import-errors.jsonl`

**Verify**:
```bash
npm run supabase:verify-import
```

Or manually in Supabase SQL Editor:
```sql
SELECT 'teachers' as table, COUNT(*) as count FROM public.teachers
UNION ALL
SELECT 'students', COUNT(*) FROM public.students
UNION ALL
SELECT 'schools', COUNT(*) FROM public.schools;
```

---

### STEP 4: Update Environment Variables (2 minutes)

**Add to root `.env`**:
```env
# Supabase - Mobile App
EXPO_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
```

**Add to `apps/dashboard/.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Mzg0NiwiZXhwIjoyMDc4MzI5ODQ2fQ.FDJ8X28wmvBtgQnmwtRW6y3lc-Enm_QTykmU1HGEX-w
```

**Update `app.config.js`**:
```javascript
extra: {
  // ... existing Firebase config ...
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}
```

---

### STEP 5: Install Supabase Packages (2 minutes)

```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

---

### STEP 6: Configure Supabase Auth Providers (5 minutes)

**Enable Google OAuth in Supabase**:

1. Go to: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/auth/providers
2. Find "Google" provider
3. Enable it
4. Add your Google Client ID and Client Secret from Firebase
5. Add authorized redirect URLs:
   - `https://fkjeggdxqifqqwhuqpgm.supabase.co/auth/v1/callback`
   - `tuto://auth/callback` (for mobile)
6. Save

---

### STEP 7: Test Authentication (10 minutes)

**Test Mobile**:
```bash
npx expo start --clear
```

1. Open app
2. Try email/password login (should work with Supabase)
3. Try Google login (should work after OAuth setup)

**Test Web**:
```bash
cd apps/dashboard && npm run dev
```

1. Go to login page
2. Try email/password login
3. Try Google login

---

### STEP 8: Update Application Code (30-60 minutes)

Now that Supabase is configured and has data, update your application code to use Supabase instead of Airtable.

**Mobile App Changes**:

1. Replace Firebase auth calls with Supabase auth:
   - `src/screens/AuthUnifiedScreen.tsx` - Use `src/config/supabase.ts` functions
   - `src/contexts/UserContext.tsx` - Fetch user from Supabase

2. Replace Airtable data calls with Supabase:
   - Create `src/services/supabase-db.ts` for data access
   - Update screens to use Supabase queries instead of Airtable

**Web Dashboard Changes**:

1. Update `apps/dashboard/contexts/AuthContext.tsx`:
   - Replace Firebase with Supabase auth
   - Use `apps/dashboard/lib/supabase.ts`

2. Update API routes in `apps/dashboard/app/api/`:
   - Use Supabase client instead of Airtable
   - Server-side: use `createServerSupabaseClient()`

**Example replacements**:

```typescript
// OLD (Airtable/Firebase)
import { getAuthSafe } from '../config/firebase';
import { AirtableService } from '../services/airtable';

// NEW (Supabase)
import { supabase } from '../config/supabase';

// OLD
const user = await signInWithEmailAndPassword(auth, email, password);
const teachers = await AirtableService.getAll('TutoTeachers');

// NEW
const { data: { user } } = await supabase.auth.signInWithPassword({ email, password });
const { data: teachers } = await supabase.from('teachers').select('*');
```

---

### STEP 9: Test Everything (20 minutes)

**Checklist**:

Mobile App:
- [ ] Email/password login works
- [ ] Google OAuth works
- [ ] User profile loads
- [ ] Teachers list loads
- [ ] Bookings create/read works
- [ ] School features work

Web Dashboard:
- [ ] Login works
- [ ] School selection works
- [ ] Teachers page works
- [ ] Students page works
- [ ] Classes page works

---

### STEP 10: Cutover (When ready)

See `docs/CUTOVER.md` for detailed cutover procedure.

**Summary**:
1. Announce maintenance window
2. Make Airtable read-only
3. Run final data sync
4. Switch environment variables to Supabase
5. Deploy updated apps
6. Monitor for 1 hour
7. Keep Airtable as backup for 30 days

---

## 🔒 Security Notes

- ✅ RLS enabled on all tables
- ✅ Service role key only in server-side code
- ✅ Anon key safe for client use (RLS enforced)
- ✅ Storage bucket is private (signed URLs only)
- ⚠️  Review policies in `migrations/002_rls_policies.sql`

---

## 📊 Benefits After Migration

1. **Unified Auth**: Same auth system for mobile and web
2. **Better Performance**: PostGIS for location queries
3. **Real-time**: Can add real-time subscriptions
4. **Cost**: More predictable than Airtable
5. **Scalability**: Postgres scales better
6. **Developer Experience**: SQL > Airtable formulas

---

## 🆘 Troubleshooting

### Migration 002/003 fails
- Check for conflicts with existing policies
- Drop existing policies first if re-running

### Import fails
- Check AIRTABLE_PAT is set
- Verify SUPABASE_DB_URL is correct
- Check logs in `supabase/logs/import-errors.jsonl`

### Auth doesn't work
- Verify environment variables are set
- Check Supabase Auth providers are enabled
- Ensure Google OAuth configured correctly

### Data missing
- Run `npm run supabase:verify-import`
- Check specific tables in Supabase dashboard
- Re-run import if needed (idempotent)

---

## 📞 Support

**Supabase Dashboard**: https://fkjeggdxqifqqwhuqpgm.supabase.co  
**Supabase Docs**: https://supabase.com/docs  
**Project Docs**: See `docs/` folder

---

**Status**: Ready to execute! Follow steps 1-10 above.










