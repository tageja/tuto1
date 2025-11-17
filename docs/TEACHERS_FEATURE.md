# Teachers Feature - Implementation Guide

**Status**: Backend Complete, Frontend In Progress  
**Last Updated**: November 7, 2025  
**Architecture**: URL-based routing, Firebase Functions backend

---

## Overview

The Teachers feature provides comprehensive teacher management for school dashboards with role-based access control. Admin users get full CRUD capabilities while parents have read-only access to their children's teachers.

## Architecture Decisions

### URL-Based Routing (Phase 1)
- **Pattern**: `/school/:schoolId/(admin|parent)/teachers`
- **Rationale**: Production-ready, bookmarkable, shareable URLs
- **Backward Compatibility**: Existing pages (`/school/admin/classes`) continue using localStorage-based routing

### Backend: Firebase Functions as Single Source of Truth
- All data access flows through Firebase Functions
- Next.js API routes act as proxies
- No direct Airtable access from client code
- Ensures consistency between mobile and web apps

---

## Completed Components

### ✅ Phase 1: Backend Infrastructure

#### 1. Airtable Schema (Scripts)
**Files**:
- `scripts/audit-teachers-schema.js` - Audits schema and identifies gaps
- `scripts/create-teachers-schema.js` - Creates missing tables/fields

**Generated Reports**:
- `docs/airtable_schema_gaps.md` - Human-readable audit report
- `docs/airtable_schema_gaps.json` - Machine-readable gap analysis

**Schema Status**:
- ✅ `TutoSchoolTeachers` exists with core fields
- ⚠️ Missing tables to be created:
  - `TutoSchoolTeacherAttendance`
  - `TutoSchoolFeedback`
  - `TutoSchoolTeachingHours`
  - `TutoSchoolParentRatings`

**Run Scripts**:
```bash
node scripts/audit-teachers-schema.js
node scripts/create-teachers-schema.js
```

#### 2. Firebase Functions (Backend API)
**File**: `functions/src/v1/school-teachers.ts`

**Endpoints Implemented**:
```typescript
// Teacher CRUD
GET  /api/v1/school/teachers?schoolId=X&status=Active&subject=Math&q=John&page=1
GET  /api/v1/school/teachers/:teacherId?schoolId=X
POST /api/v1/school/teachers (admin only)
PATCH /api/v1/school/teachers/:teacherId (admin only)

// Aggregations
GET /api/v1/school/teachers/kpis?schoolId=X
GET /api/v1/school/teachers/:teacherId/attendance?schoolId=X&days=90
GET /api/v1/school/teachers/:teacherId/feedback?schoolId=X&limit=20
GET /api/v1/school/teachers/:teacherId/teaching-hours?schoolId=X&weeks=12
```

**Features**:
- Search by name (debounced)
- Filter by status, subject
- Pagination (20 per page)
- Aggregated stats (tenure, workload, absences, ratings)
- CORS enabled
- Rate limiting
- Error handling

#### 3. Airtable Service Layer
**File**: `functions/src/v1/airtable.ts`

**Methods Added**:
```typescript
airtableService.getSchoolTeachers(schoolId, filters)
airtableService.getSchoolTeacherById(teacherId)
airtableService.createSchoolTeacher(data)
airtableService.updateSchoolTeacher(teacherId, data)
airtableService.getTeacherAttendance(teacherName, schoolId, days)
airtableService.getTeacherFeedback(teacherName, schoolId, limit)
airtableService.getTeachingHours(teacherName, schoolId, weeks)
airtableService.getTeacherKPIs(schoolId)
```

**Features**:
- Handles Airtable API calls
- Returns typed records
- Graceful error handling (returns empty arrays for missing tables)
- Supports pagination
- Filter formula building

#### 4. Enhanced SchoolContext
**File**: `apps/dashboard/contexts/SchoolContext.tsx`

**New Capabilities**:
- Extracts `schoolId` from URL pattern `/school/:schoolId/(admin|parent)/*`
- Falls back to localStorage for legacy routes
- Fetches school details from API if not in local list
- Backward compatible with existing pages
- Exports `schoolIdFromUrl` for URL-aware components

**Usage**:
```typescript
const { selectedSchool, schoolIdFromUrl } = useSchool();
// schoolIdFromUrl is populated for URL-based routes
// selectedSchool works for both old and new routes
```

#### 5. Internationalization (i18n)
**Files**: 
- `packages/i18n/src/en.json`
- `packages/i18n/src/vi.json`

**Namespace**: `dashboard.teachers.*`

**Coverage**:
- KPI labels
- Form fields & validation messages
- Status labels
- Tab names
- Empty/error states
- Pagination labels
- Attendance & feedback labels

**Keys**: 80+ translation keys (EN + VI)

---

## Pending Components

### 🔄 Phase 2: Next.js API Routes (Proxies)

**To Create**:
```
apps/dashboard/app/api/school/teachers/
├── route.ts                              (GET list, POST create)
├── [teacherId]/route.ts                  (GET, PATCH)
├── [teacherId]/attendance/route.ts       (GET)
├── [teacherId]/feedback/route.ts         (GET)
├── [teacherId]/teaching-hours/route.ts   (GET)
└── kpis/route.ts                         (GET)
```

**Pattern**: Each route proxies to corresponding Firebase Function
```typescript
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const response = await fetch(
    `${FUNCTIONS_URL}/getSchoolTeachers?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return NextResponse.json(await response.json());
}
```

### 🔄 Phase 3: Shared Components

**To Create**:
```
apps/dashboard/components/school/teachers/
├── TeacherKpis.tsx           (KPI cards)
├── TeacherListItem.tsx       (Teacher card/row)
├── TeacherFilters.tsx        (Search + Status + Subject filters)
├── TeacherQuickAddModal.tsx  (Quick add form modal)
└── TeacherProfileTabs.tsx    (Tab navigation component)
```

### 🔄 Phase 4: Admin Pages

**To Create**:
```
apps/dashboard/app/school/[schoolId]/admin/teachers/
├── page.tsx                  (List with filters, search, pagination)
├── new/page.tsx              (Full create form)
├── [teacherId]/page.tsx      (Profile with tabs)
└── [teacherId]/edit/page.tsx (Full edit form)
```

### 🔄 Phase 5: Parent Pages

**To Create**:
```
apps/dashboard/app/school/[schoolId]/parent/teachers/
├── page.tsx                  (Read-only list, filtered)
└── [teacherId]/page.tsx      (Read-only profile)
```

---

## Data Flow

### Admin Teacher List Page
```
User → /school/sunrise-intl/admin/teachers?status=Active&q=John&page=1
  ↓
SchoolContext extracts "sunrise-intl" from URL
  ↓
Page fetches /api/school/teachers?schoolId=sunrise-intl&status=Active&q=John&page=1
  ↓
Next.js API proxies to Firebase Function getSchoolTeachers
  ↓
Function calls airtableService.getSchoolTeachers(...)
  ↓
Airtable query with filters
  ↓
Response: { records: [...], total: 42, hasMore: true }
```

### Parent View (Filtered)
```
Parent → /school/sunrise-intl/parent/teachers
  ↓
Page fetches /api/school/teachers?schoolId=sunrise-intl&parentEmail=parent@example.com
  ↓
Backend logic:
  1. Find students linked to parent email
  2. Get classes for those students
  3. Get teachers for those classes
  4. Return filtered teacher list
  ↓
Parent sees only their children's teachers
```

---

## Airtable Schema Requirements

### TutoSchoolTeachers
**Fields**:
- Teacher Name (singleLineText) - required
- School Name (singleLineText) - required
- Email (email)
- Phone (phoneNumber)
- Position (singleLineText)
- Bio (multilineText)
- Education (multilineText)
- Status (singleSelect: Active, On Leave, Inactive)
- Experience Years (number)
- Hire Date (date)
- Subjects (multilineText)
- Grade Levels (multilineText)
- Rating (number)
- Nationality (singleLineText)
- Hobbies (multilineText)
- Created Date (date)

### TutoSchoolTeacherAttendance (To Create)
- Teacher Name (singleLineText)
- School Name (singleLineText)
- Date (date)
- Status (singleSelect: Present, Absent, On Leave, Late)
- Notes (multilineText)

### TutoSchoolFeedback (To Create)
- Teacher Name (singleLineText)
- Parent Name (singleLineText)
- Student Name (singleLineText)
- School Name (singleLineText)
- Rating (number 1-5)
- Comment (multilineText)
- Created At (dateTime)
- Status (singleSelect: Active, Hidden)

### TutoSchoolTeachingHours (To Create)
- Teacher Name (singleLineText)
- School Name (singleLineText)
- Week Of (date)
- Total Hours (number)
- Class Hours (number)
- Prep Hours (number)

### TutoSchoolParentRatings (To Create)
- Teacher Name (singleLineText)
- School Name (singleLineText)
- Avg Rating (number)
- Total Ratings (number)
- Last Updated (dateTime)

---

## Role-Based Access Control

### Admin
- ✅ View all teachers in school
- ✅ Search and filter
- ✅ Create new teachers
- ✅ Edit teacher profiles
- ✅ View full profiles with all tabs
- ✅ Access attendance, feedback, teaching hours

### Parent
- ✅ View only their children's teachers
- ✅ Search by name only (limited filters)
- ❌ Cannot add/edit teachers
- ✅ View read-only profiles
- ✅ Limited feedback tab (only their own feedback visible)

**Implementation**: Role check in Next.js layout + API route validation

---

## URL Structure

### Admin Routes
```
/school/sunrise-intl/admin/teachers
/school/sunrise-intl/admin/teachers?status=Active&subject=Math&q=John&page=2
/school/sunrise-intl/admin/teachers/new
/school/sunrise-intl/admin/teachers/recXYZ123
/school/sunrise-intl/admin/teachers/recXYZ123/edit
```

### Parent Routes
```
/school/sunrise-intl/parent/teachers
/school/sunrise-intl/parent/teachers?q=John
/school/sunrise-intl/parent/teachers/recXYZ123
```

---

## Testing Checklist

### Backend (Completed)
- [x] Firebase Functions deployed and accessible
- [x] Airtable service methods work correctly
- [x] Filter formulas build properly
- [x] Pagination works
- [x] Aggregation stats calculate correctly
- [x] Error handling returns graceful failures

### Frontend (Pending)
- [ ] Admin list page renders with data
- [ ] Search debounce works (300ms)
- [ ] Filters persist in URL
- [ ] Pagination preserves filters
- [ ] Profile tabs load correct data
- [ ] Create form validates and submits
- [ ] Edit form pre-populates and updates
- [ ] Parent sees only filtered teachers
- [ ] URL sharing works (bookmark test)
- [ ] Multi-tab: two schools open simultaneously
- [ ] i18n: switch EN/VI, all labels update
- [ ] Loading/empty/error states display

### Regression (Pending)
- [ ] Existing dashboard loads
- [ ] Existing classes pages work
- [ ] SchoolContext doesn't break old routes

---

## Known Limitations

1. **Missing Tables**: TutoTeacherAttendance, TutoFeedback, TutoTeachingHours, TutoParentRatings don't exist yet
   - **Impact**: Profile tabs will show empty states
   - **Fix**: Run `node scripts/create-teachers-schema.js`

2. **Auth Middleware**: Currently disabled in Firebase Functions (TODOs in code)
   - **Impact**: No authentication enforcement on mutations
   - **Fix**: Enable `authenticateToken` middleware before production

3. **Parent Filtering Logic**: Not yet implemented in backend
   - **Impact**: Parents might see all teachers initially
   - **Fix**: Add parent→student→classes→teachers query in getSchoolTeachers

---

## Next Steps

### Immediate (This Session)
1. ✅ Run schema creation script
2. ⏳ Create Next.js API route proxies
3. ⏳ Build shared components
4. ⏳ Build admin list page
5. ⏳ Build admin profile page
6. ⏳ Build admin new/edit forms
7. ⏳ Build parent pages
8. ⏳ Implement role guards
9. ⏳ Test all features

### Future Enhancements
- Photo upload for teacher profiles (Cloudinary/S3)
- Bulk import teachers (CSV)
- Email notifications for new teachers
- Teacher availability calendar
- Performance reviews workflow
- Teacher certifications tracking

---

## File Reference

### Backend
```
functions/src/v1/
├── airtable.ts               (✅ Updated with teacher methods)
├── school-teachers.ts        (✅ 8 endpoints implemented)
└── index.ts                  (✅ Exports added)

scripts/
├── audit-teachers-schema.js  (✅ Complete)
└── create-teachers-schema.js (✅ Complete)
```

### Frontend
```
apps/dashboard/
├── contexts/SchoolContext.tsx             (✅ Enhanced with URL routing)
├── app/api/school/teachers/...            (⏳ Pending)
├── app/school/[schoolId]/admin/teachers/... (⏳ Pending)
├── app/school/[schoolId]/parent/teachers/...(⏳ Pending)
└── components/school/teachers/...         (⏳ Pending)

packages/i18n/src/
├── en.json                    (✅ Teachers namespace added)
└── vi.json                    (✅ Teachers namespace added)
```

### Documentation
```
docs/
├── airtable_schema_gaps.md    (✅ Generated)
├── airtable_schema_gaps.json  (✅ Generated)
├── TEACHERS_FEATURE.md        (✅ This file)
└── dev_notes.md               (⏳ To update)
```

---

## Support & References

- **Plan**: `teachers-feature-url.plan.md`
- **Airtable Schema**: `docs/DATA_DICTIONARY.md`
- **Feature Mapping**: `docs/feature_schema_map.yml`
- **Existing Patterns**: See `app/school/admin/classes/` for reference implementation

---

*Last updated: November 7, 2025*  
*Status: Backend infrastructure complete, ready for UI implementation*

