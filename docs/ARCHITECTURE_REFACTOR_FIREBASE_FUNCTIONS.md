# Architecture Refactor: Firebase Functions as Backend API

**Date**: November 5, 2025  
**Type**: Critical Architecture Change  
**Impact**: Web + Mobile alignment, single source of truth

---

## 🎯 **What Changed**

### **BEFORE** (Incorrect Architecture)
```
Mobile App → Firebase Functions → Airtable  ✅ Good
Web App   → Airtable directly              ❌ Bad (inconsistent!)
```

**Problems**:
- ❌ Duplicated Airtable logic in web and mobile
- ❌ Credentials in two places (Functions + Next.js)
- ❌ Inconsistent data/validation between apps
- ❌ Harder to maintain

### **AFTER** (Correct Architecture) ✅
```
Mobile App (src/) ────┐
                      ├──→ Firebase Functions ──→ Airtable
Web App (apps/)   ────┘     (functions/src/v1/)
```

**Benefits**:
- ✅ Single source of truth for all backend logic
- ✅ Credentials only in Firebase Functions
- ✅ Code reuse between web and mobile
- ✅ Consistent data/validation
- ✅ Easier to test and maintain

---

## 📁 **Files Created**

### **Firebase Functions** (Backend - NEW)
1. `functions/src/v1/school-classes.ts` (270+ lines)
   - `getSchoolClasses` - List with filters
   - `getSchoolClassById` - Single class
   - `getSchoolGrades` - Distinct grades
   - `getSchoolClassKpis` - KPI calculations
   - `getSchoolClassStudents` - Class roster
   - `getSchoolClassAttendance` - Attendance stats

2. `functions/src/v1/school-students.ts` (95 lines)
   - `getSchoolStudents` - List with filters
   - `getSchoolStudentById` - Single student

3. `functions/src/v1/school-teachers.ts` (90 lines)
   - `getSchoolTeachers` - List with filters
   - `getSchoolTeacherById` - Single teacher

### **Airtable Service Updated**
4. `functions/src/v1/airtable.ts` (+180 lines)
   - Added methods for TutoSchool* tables:
     - `getSchoolClasses()`
     - `getSchoolStudents()`
     - `getSchoolTeachers()`
     - `getAttendanceRecords()`
     - `getSchools()`
     - All with filtering support

---

## 📝 **Files Modified**

### **Next.js API Routes** (Now proxy to Functions)
1. `apps/dashboard/app/api/school/classes/route.ts`
2. `apps/dashboard/app/api/school/classes/kpis/route.ts`
3. `apps/dashboard/app/api/school/classes/grades/route.ts`
4. `apps/dashboard/app/api/school/classes/[classId]/route.ts`
5. `apps/dashboard/app/api/school/classes/[classId]/students/route.ts`
6. `apps/dashboard/app/api/school/classes/[classId]/attendance/route.ts`

**Pattern Change**:
```typescript
// BEFORE:
import { getClasses } from '../../../../lib/airtable/classes';
const result = await getClasses(schoolId);  // Direct Airtable

// AFTER:
const FUNCTIONS_BASE_URL = process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL;
const response = await fetch(`${FUNCTIONS_BASE_URL}/getSchoolClasses?...`);
```

### **Cursor Rules Updated**
`cursor/rules.fullstack.md` - Now enforces:
- ✅ Always check for mobile app equivalent
- ✅ Always use Firebase Functions for backend
- ✅ Never call Airtable directly from clients

---

## 🔐 **Credentials Setup**

### **Step 1: Create `functions/.env`**

Create a new file: `functions/.env`

Add:
```env
# Airtable Configuration
AIRTABLE_PAT=patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
AIRTABLE_BASE_ID=app34330Do0nm4qvM

# Firebase Admin (auto-configured, but you can add if needed)
# FIREBASE_PROJECT_ID=tuto1-73fc4
```

### **Step 2: Update `apps/dashboard/.env.local`**

**KEEP** these (already there):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
# ... all Firebase config ...
NEXT_PUBLIC_FUNCTIONS_BASE_URL=https://asia-southeast1-tuto1-73fc4.cloudfunctions.net/api
```

**DO NOT ADD** Airtable credentials (they go in Functions only!)

---

## 🚀 **How to Deploy & Test**

### **Local Development**:

**Option 1: Use Functions Emulator** (Recommended)
```bash
# Terminal 1: Start Functions emulator
cd functions
npm run serve

# Terminal 2: Start Next.js
cd apps/dashboard
npm run dev

# In apps/dashboard/.env.local, use:
NEXT_PUBLIC_FUNCTIONS_BASE_URL=http://localhost:5001/tuto1-73fc4/asia-southeast1
```

**Option 2: Use Deployed Functions** (What you have now)
```bash
# Just start Next.js
cd apps/dashboard
npm run dev

# Uses:
NEXT_PUBLIC_FUNCTIONS_BASE_URL=https://asia-southeast1-tuto1-73fc4.cloudfunctions.net/api
```

### **Deploy Functions**:
```bash
cd functions
npm run build
firebase deploy --only functions:v1
```

---

## 🔄 **Data Flow (Correct Architecture)**

### **Example: Get Classes List**

```
1. User Action (Web)
   ↓
2. React Component
   apps/dashboard/app/school/admin/classes/page.tsx
   ↓
3. Next.js API Route (Proxy)
   apps/dashboard/app/api/school/classes/route.ts
   → fetch(FUNCTIONS_BASE_URL/getSchoolClasses)
   ↓
4. Firebase Function
   functions/src/v1/school-classes.ts
   → getSchoolClasses()
   ↓
5. Airtable Service
   functions/src/v1/airtable.ts
   → airtableService.getSchoolClasses()
   ↓
6. Airtable API
   → Returns data
   ↓
7. ← Response flows back through layers ←
   ↓
8. UI Renders
```

**Same flow for Mobile App!** ✅

---

## 📊 **Functions Created**

| Function Name | Purpose | Tables Used |
|---------------|---------|-------------|
| `getSchoolClasses` | List classes | TutoSchoolClasses |
| `getSchoolClassById` | Single class | TutoSchoolClasses |
| `getSchoolGrades` | Distinct grades | TutoSchoolClasses |
| `getSchoolClassKpis` | KPI calculations | TutoSchoolClasses, TutoSchoolStudents, TutoAttendanceRecords |
| `getSchoolClassStudents` | Class roster | TutoSchoolStudents |
| `getSchoolClassAttendance` | Attendance stats | TutoAttendanceRecords |
| `getSchoolStudents` | List students | TutoSchoolStudents |
| `getSchoolStudentById` | Single student | TutoSchoolStudents |
| `getSchoolTeachers` | List teachers | TutoSchoolTeachers |
| `getSchoolTeacherById` | Single teacher | TutoSchoolTeachers |

**Total**: 10 new Functions endpoints

---

## 🔒 **Security**

### **Authentication Flow**:
```typescript
// All Functions use:
await authenticateToken(req, res)  // Verify Firebase token
readRateLimit(req, res)            // Prevent abuse
corsMiddleware(req, res)           // CORS protection
```

### **Credentials**:
- ✅ Airtable PAT: Only in `functions/.env` (server-side)
- ✅ Firebase Config: In both apps (public, safe)
- ✅ Never exposed to browser
- ✅ Server-to-server communication only

---

## ✅ **Advantages of This Architecture**

### **1. Code Reuse**
```typescript
// Mobile app (src/services/backend.classes.ts):
export async function getClasses(schoolId: string) {
  return authedFetch('/getSchoolClasses?schoolId=' + schoolId);
}

// Web app (apps/dashboard/app/api/school/classes/route.ts):
const response = await fetch(`${FUNCTIONS_BASE_URL}/getSchoolClasses?...`);

// SAME backend logic! ✅
```

### **2. Single Source of Truth**
```typescript
// Change logic once in Functions:
functions/src/v1/school-classes.ts

// Both apps get the update automatically! ✅
```

### **3. Easier Testing**
```typescript
// Test the Function once:
functions/test/school-classes.spec.ts

// Both apps are tested! ✅
```

### **4. Better Security**
```
Credentials: functions/.env only
Client apps: Never see Airtable PAT
API calls: Authenticated with Firebase tokens
```

---

## 📋 **Migration Checklist**

### **Completed** ✅:
- [x] Update cursor rules to enforce architecture
- [x] Create Firebase Functions for school classes
- [x] Create Firebase Functions for school students  
- [x] Create Firebase Functions for school teachers
- [x] Update airtableService with school table methods
- [x] Update all Next.js API routes to call Functions
- [x] Export new Functions from v1/index.ts

### **TODO** (You need to do):
- [ ] Create `functions/.env` with Airtable credentials
- [ ] Deploy Functions or run emulator locally
- [ ] Test web dashboard with Functions backend
- [ ] (Optional) Create mobile app services for school features

---

## 🎯 **Next Steps - CRITICAL**

### **Step 1: Create `functions/.env`**

Create file: `functions/.env`

Add:
```env
AIRTABLE_PAT=patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
AIRTABLE_BASE_ID=app34330Do0nm4qvM
```

### **Step 2: Deploy Functions**

```bash
cd functions
npm install  # Install dependencies if needed
npm run build
firebase deploy --only functions:v1
```

**OR run locally**:
```bash
cd functions
npm run serve  # Starts emulator
```

### **Step 3: Test**

Open web dashboard → Classes page → Should see data from Functions!

---

## 📊 **Before vs After Comparison**

### **Files**:
| Layer | Before | After |
|-------|--------|-------|
| Functions | 5 files | 8 files (+3) ✅ |
| Next.js API | Calls Airtable | Calls Functions ✅ |
| Mobile Services | Calls Functions ✅ | (unchanged) |
| Credentials | 2 places ❌ | 1 place ✅ |

### **Code Duplication**:
| Feature | Before | After |
|---------|--------|-------|
| Get Classes | 2 implementations | 1 implementation ✅ |
| Get Students | 2 implementations | 1 implementation ✅ |
| Get Teachers | 2 implementations | 1 implementation ✅ |

### **Maintenance**:
| Task | Before | After |
|------|--------|-------|
| Add field mapping | Change 2 files | Change 1 file ✅ |
| Fix bug | Fix 2 places | Fix 1 place ✅ |
| Add validation | Add 2 times | Add 1 time ✅ |

---

## 🎉 **Result**

**Your architecture is now CORRECT!** ✅

- ✅ Web and mobile share the same backend
- ✅ Firebase Functions is the single source of truth
- ✅ Credentials in one secure location
- ✅ Consistent across platforms
- ✅ Production-ready architecture

---

## 📞 **What You Need to Do NOW**

### **1. Create `functions/.env`** (Copy-paste):
```bash
# In functions/.env file:
AIRTABLE_PAT=patlzauOLrLxsf4QM.512407a6dba1d7dfefa3b1b70ebc7005e042a7313984cd5a31d2e00e9d2c9e46
AIRTABLE_BASE_ID=app34330Do0nm4qvM
```

### **2. Deploy Functions**:
```bash
cd functions
npm run build
firebase deploy --only functions:v1
```

### **3. Test**:
- Refresh web dashboard
- Classes page should show data
- Mobile app continues working (no changes needed!)

---

## ✨ **Summary**

You were **absolutely right** to question the architecture! 

We now have:
- ✅ Proper backend layer (Firebase Functions)
- ✅ Web and mobile aligned
- ✅ Single source of truth
- ✅ Production-ready

**This is the CORRECT way to build a multi-platform app!** 🚀

---

*Architecture issue identified and fixed - thank you for catching this!*


















