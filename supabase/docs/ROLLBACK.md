# Rollback Procedure

**Purpose**: Revert to Airtable if Supabase migration fails  
**Time**: 5 minutes  
**Data Loss**: Minimal (changes during cutover only)

---

## 🚨 When to Rollback

Rollback immediately if:
- Critical auth failures (users can't login)
- Data integrity issues (missing/corrupted data)
- Performance degradation (>5 second load times)
- RLS policy errors blocking legitimate access
- Multiple user complaints within first hour

---

## ⚡ Quick Rollback Steps

### Step 1: Revert Environment Variables (2 minutes)

**Mobile App (root `.env`)**:
```bash
# Comment out Supabase
# EXPO_PUBLIC_SUPABASE_URL=...
# EXPO_PUBLIC_SUPABASE_ANON_KEY=...

# Ensure Firebase is active
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyAcQgVGfjnMaPeUKGzyQ8WJwjkH_qDIkCg
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tuto1-73fc4
# ... other Firebase vars
```

**Web Dashboard (`apps/dashboard/.env.local`)**:
```bash
# Comment out Supabase
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Ensure Firebase is active
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyAcQgVGfjnMaPeUKGzyQ8WJwjkH_qDIkCg
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tuto1-73fc4
# ... other Firebase vars
```

---

### Step 2: Revert Code Changes (1 minute)

If you've updated auth code, revert to using Firebase:

**Mobile**:
```typescript
// src/screens/AuthUnifiedScreen.tsx
// Use getAuthSafe() from src/config/firebase.ts instead of supabase.auth
```

**Web**:
```typescript
// apps/dashboard/contexts/AuthContext.tsx
// Use Firebase auth instead of Supabase auth
```

**Or use Git**:
```bash
git status
git restore <files-to-revert>
```

---

### Step 3: Restart Applications (2 minutes)

**Mobile**:
```bash
npx expo start --clear
```

**Web**:
```bash
cd apps/dashboard
npm run dev
```

---

### Step 4: Verify Rollback (5 minutes)

**Test**:
- [ ] Login works (email/password)
- [ ] Login works (Google)
- [ ] Data loads
- [ ] CRUD operations work

**You're back to pre-migration state** ✅

---

## 🔍 Partial Rollback Options

### Option 1: Rollback Auth Only

Keep Supabase for data, but revert auth to Firebase:

```typescript
// Use Firebase for auth, Supabase for data
import { getAuthSafe } from '../config/firebase'; // Auth
import { supabase } from '../config/supabase'; // Data

// Sign in with Firebase
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// Fetch user data from Supabase
const { data } = await supabase.from('users').select().eq('email', email).single();
```

---

### Option 2: Rollback Data Only

Keep Supabase Auth, but revert data to Airtable:

```typescript
// Use Supabase for auth, Airtable for data
import { supabase } from '../config/supabase'; // Auth
import { AirtableService } from '../services/airtable'; // Data

// Sign in with Supabase
const { data } = await supabase.auth.signInWithPassword({ email, password });

// Fetch data from Airtable
const teachers = await AirtableService.getAll('TutoTeachers');
```

---

## 📝 Post-Rollback Actions

After rolling back:

1. **Document the Issue**:
   - What failed?
   - Error messages?
   - Which feature/screen?

2. **Analyze Root Cause**:
   - Check Supabase logs
   - Review RLS policies
   - Test queries manually

3. **Fix and Retry**:
   - Fix the issue
   - Test in development
   - Schedule new cutover

---

## 🛡️ Data Safety

- **Airtable data remains untouched** during migration
- Supabase import is additive (doesn't delete Airtable)
- Both systems can run in parallel
- No risk of data loss

---

## 🎯 Preventive Measures

To avoid needing rollback:

1. **Test thoroughly** in development before cutover
2. **Use feature flags** to enable Supabase gradually
3. **Monitor actively** during first 24 hours
4. **Have team standing by** during cutover
5. **Schedule during low-traffic** period

---

## 📊 Rollback Decision Matrix

| Issue | Severity | Action |
|-------|----------|--------|
| Auth failures | Critical | **Immediate rollback** |
| Data missing | Critical | **Immediate rollback** |
| Slow performance | High | Monitor, may need rollback |
| Single feature broken | Medium | Fix forward, no rollback |
| UI issue | Low | Fix forward |

---

**Remember**: Rollback is always available. Better to rollback and fix than to persist with issues.









