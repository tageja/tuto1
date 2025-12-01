# Supabase Migration - Quick Reference

**One-page reference for the complete migration.**

---

## ⚡ Execute Migration (Copy-Paste Commands)

```bash
# 1. Install dependencies
npm install --legacy-peer-deps

# 2. Apply migrations (in Supabase SQL Editor manually - see START_HERE.md)
# - Copy supabase/migrations/002_rls_policies.sql → Paste → Run
# - Copy supabase/migrations/003_functions_triggers.sql → Paste → Run

# 3. Export Airtable
npm run supabase:export-airtable

# 4. Import to Supabase
npm run supabase:import-data:dry  # Validate first
npm run supabase:import-data      # Actual import

# 5. Verify
npm run supabase:verify-import

# 6. Test
# Update app code to use Supabase clients, then test
```

---

## 🔑 Environment Variables

**Add to root `.env`**:
```env
EXPO_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
```

**Create `apps/dashboard/.env.local`**:
```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Mzg0NiwiZXhwIjoyMDc4MzI5ODQ2fQ.FDJ8X28wmvBtgQnmwtRW6y3lc-Enm_QTykmU1HGEX-w
```

---

## 🔄 Code Migration Pattern

### Before (Airtable/Firebase)
```typescript
// Auth
import { getAuthSafe } from '../config/firebase';
await signInWithEmailAndPassword(auth, email, password);

// Data
import { useAirtable } from '../hooks/useAirtable';
const teachers = await AirtableService.getAll('TutoTeachers');
```

### After (Supabase)
```typescript
// Auth
import { supabase } from '../config/supabase';
await supabase.auth.signInWithPassword({ email, password });

// Data
const { data: teachers } = await supabase
  .from('teachers')
  .select('*')
  .eq('status', 'active');
```

---

## 📍 Key URLs

**Supabase Dashboard**: https://fkjeggdxqifqqwhuqpgm.supabase.co  
**SQL Editor**: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/sql  
**Auth Settings**: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/auth/providers  
**Table Editor**: https://fkjeggdxqifqqwhuqpgm.supabase.co/project/fkjeggdxqifqqwhuqpgm/editor

---

## 🆘 Quick Fixes

**Migrations fail**: Check connection string is correct  
**Export fails**: Verify AIRTABLE_PAT is set  
**Import fails**: Run dry mode first, check logs  
**Auth doesn't work**: Enable Google provider in Supabase  
**RLS blocks access**: Review policies in 002_rls_policies.sql  
**Need rollback**: See `docs/ROLLBACK.md`

---

## ✅ Verification Checklist

After migration:

- [ ] All tables exist (35+)
- [ ] RLS enabled on all tables
- [ ] Data counts match Airtable
- [ ] Auth works (email + Google)
- [ ] Mobile app works
- [ ] Web dashboard works
- [ ] Security policies tested

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `START_HERE.md` | Step-by-step execution guide |
| `README.md` | Complete migration documentation |
| `MIGRATION_SUMMARY.md` | What was created |
| `QUICK_REFERENCE.md` | This file - quick commands |
| `docs/CUTOVER.md` | Go-live procedure |
| `docs/ROLLBACK.md` | Emergency rollback |
| `docs/SECURITY_CHECKLIST.md` | Security verification |

---

**👉 Start Here**: `supabase/START_HERE.md`










