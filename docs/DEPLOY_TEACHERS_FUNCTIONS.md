# Deploy Teachers Firebase Functions

**Status**: Architecture fixed - Now need to deploy Functions  
**Issue**: "Unknown error" when creating teacher  
**Cause**: Firebase Functions not deployed yet  
**Solution**: Deploy functions now

---

## ✅ Architecture is Now Correct

```
Web Dashboard → Next.js API Routes → Firebase Functions → Airtable
Mobile App → Firebase Functions → Airtable

BOTH use same backend! ✅
```

---

## 🚀 Deploy Firebase Functions

### Step 1: Navigate to Functions Directory

```bash
cd functions
```

### Step 2: Build the Functions

```bash
npm run build
```

or

```bash
npx tsc
```

### Step 3: Deploy to Firebase

```bash
firebase deploy --only functions
```

This will deploy all 8 teacher functions:
- ✅ getSchoolTeachers
- ✅ getSchoolTeacherById
- ✅ createSchoolTeacher
- ✅ updateSchoolTeacher
- ✅ getSchoolTeacherKPIs
- ✅ getSchoolTeacherAttendance
- ✅ getSchoolTeacherFeedback
- ✅ getSchoolTeacherTeachingHours

### Step 4: Verify Deployment

```bash
firebase functions:list
```

You should see all the `getSchool*` and `createSchool*` functions listed.

---

## Alternative: Use Local Emulator (Faster for Development)

If you want to test without deploying:

### 1. Start Firebase Emulator

```bash
cd functions
firebase emulators:start
```

### 2. Set Environment Variable

In `apps/dashboard/.env.local`:
```
NEXT_PUBLIC_USE_EMULATOR=true
```

### 3. Restart Next.js Dev Server

```bash
cd apps/dashboard
npm run dev
```

Now API routes will call local emulator instead of deployed functions!

---

## 🧪 After Deployment

1. **Refresh your browser**

2. **Click "+ Add Teacher"**

3. **Fill form and submit**

4. **Should work!** ✅
   - No more "Unknown error"
   - Teacher created in Airtable
   - Appears in list

---

## 📊 What Each Function Does

| Function | Purpose | Called From |
|----------|---------|-------------|
| `getSchoolTeachers` | List teachers with filters | List page |
| `getSchoolTeacherById` | Get single teacher + stats | Profile page |
| `createSchoolTeacher` | Create new teacher | Quick Add, New form |
| `updateSchoolTeacher` | Update teacher fields | Edit form |
| `getSchoolTeacherKPIs` | Calculate KPIs | Dashboard KPI cards |
| `getSchoolTeacherAttendance` | Get attendance records | Profile Attendance tab |
| `getSchoolTeacherFeedback` | Get feedback | Profile Feedback tab |
| `getSchoolTeacherTeachingHours` | Get teaching hours | Profile Overview (workload) |

---

## ✅ Checklist

- [x] Functions code written (`functions/src/v1/school-teachers.ts`)
- [x] Airtable service updated (`functions/src/v1/airtable.ts`)
- [x] Functions exported (`functions/src/index.ts`)
- [x] API routes call Functions (not Airtable directly)
- [ ] **Functions deployed** ← YOU ARE HERE
- [ ] Test creating teacher

---

**Run the deployment now and the teachers feature will work!** 🚀

```bash
cd functions
firebase deploy --only functions
```













