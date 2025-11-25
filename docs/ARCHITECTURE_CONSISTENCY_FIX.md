# Architecture Consistency Fix

**Issue**: API routes were inconsistently calling Airtable directly instead of Firebase Functions  
**Status**: ✅ FIXED - Proper architecture restored

---

## ✅ Correct Architecture (Restored)

```
Client (Web Dashboard)
  ↓
Next.js API Routes (apps/dashboard/app/api/)
  ↓
Firebase Functions (functions/src/v1/)
  ↓
Airtable Service Layer (functions/src/v1/airtable.ts)
  ↓
Airtable Database
```

**Why This Matters**:
- ✅ Single source of truth (mobile + web use same logic)
- ✅ Consistent business logic
- ✅ Secure (credentials only in Functions)
- ✅ Easier to maintain
- ✅ Can add caching, validation, auth in one place

---

## What Was Fixed

### 1. Functions Export (functions/src/index.ts)
✅ Added exports for v2 school functions:
```typescript
export {
  getSchoolTeachers,
  getSchoolTeacherById,
  createSchoolTeacher,
  updateSchoolTeacher,
  getSchoolTeacherAttendance,
  getSchoolTeacherFeedback,
  getSchoolTeacherTeachingHours,
  getSchoolTeacherKPIs,
} from './v1/school-teachers';
```

### 2. API Routes Updated (apps/dashboard/app/api/school/teachers/)
✅ All routes now call Firebase Functions:
- `route.ts` - GET/POST → calls `getSchoolTeachers`, `createSchoolTeacher`
- `kpis/route.ts` - GET → calls `getSchoolTeacherKPIs`
- `[teacherId]/route.ts` - GET/PATCH → calls `getSchoolTeacherById`, `updateSchoolTeacher`
- `[teacherId]/attendance/route.ts` - Placeholder (table doesn't exist yet)
- `[teacherId]/feedback/route.ts` - Placeholder (table doesn't exist yet)
- `[teacherId]/teaching-hours/route.ts` - Placeholder (table doesn't exist yet)

---

## Firebase Functions Deployment

### Check if Functions are Deployed

```bash
firebase functions:list
```

Should show:
- ✅ getSchoolTeachers
- ✅ createSchoolTeacher
- ✅ updateSchoolTeacher
- ✅ getSchoolTeacherById
- ✅ getSchoolTeacherKPIs
- etc.

### Deploy Functions (if not deployed)

```bash
cd functions
npm run build
firebase deploy --only functions
```

This will deploy all teacher functions to Firebase.

---

## URL Pattern

Firebase Functions v2 are deployed as individual HTTPS functions:

```
https://<region>-<project-id>.cloudfunctions.net/<functionName>
```

Example:
```
https://asia-southeast1-tuto-project.cloudfunctions.net/getSchoolTeachers?schoolId=...
```

**Not** as Express routes like `/api/...`

---

## Testing the Functions

### Local Emulator (Development)
```bash
cd functions
firebase emulators:start
```

Then Next.js API routes will call:
```
http://localhost:5001/<project>/<region>/getSchoolTeachers
```

### Production
Next.js API routes call:
```
https://<region>-<project>.cloudfunctions.net/getSchoolTeachers
```

---

## Next Steps

1. **Deploy Firebase Functions**:
   ```bash
   cd functions
   firebase deploy --only functions
   ```

2. **Verify deployment**:
   ```bash
   firebase functions:list
   ```

3. **Test in browser**:
   - API routes will now call deployed Functions
   - Functions call Airtable
   - Data flows correctly

---

**Architecture is now consistent!** Web dashboard follows same pattern as mobile app. 🎯













