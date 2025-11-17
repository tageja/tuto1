# Development Notes

**Last Updated**: November 7, 2025  
**Current Feature**: Teachers Management (URL-based Routing)

---

## Session Summary - Teachers Feature Implementation

### Completed ✅

#### 1. Backend Infrastructure (100% Complete)
- **Airtable Schema Scripts**
  - `scripts/audit-teachers-schema.js` - Comprehensive schema audit
  - `scripts/create-teachers-schema.js` - Idempotent table/field creation
  - Generated gap reports in `docs/airtable_schema_gaps.*`

- **Firebase Functions (8 Endpoints)**
  - `functions/src/v1/school-teachers.ts` - All CRUD + aggregation endpoints
  - `functions/src/v1/airtable.ts` - Teacher-specific service methods
  - Exported in `functions/src/v1/index.ts`
  - Features: search, filters, pagination, stats calculation

- **Enhanced SchoolContext**
  - `apps/dashboard/contexts/SchoolContext.tsx`
  - URL-based routing support: `/school/:schoolId/(admin|parent)/*`
  - Backward compatible with localStorage-based routing
  - Auto-fetches school details from URL

- **Internationalization**
  - `packages/i18n/src/en.json` - 80+ teacher keys
  - `packages/i18n/src/vi.json` - Full Vietnamese translations
  - Namespace: `dashboard.teachers.*`

- **Documentation**
  - `docs/TEACHERS_FEATURE.md` - Comprehensive implementation guide
  - `docs/airtable_schema_gaps.md` - Schema audit report
  - `docs/dev_notes.md` - This file

### In Progress ⏳

#### 2. Next.js API Routes (Proxies to Functions)
**Status**: Not started  
**Files to Create**:
```
apps/dashboard/app/api/school/teachers/
├── route.ts                              (GET list, POST create)
├── kpis/route.ts                         (GET KPIs)
├── [teacherId]/route.ts                  (GET, PATCH)
├── [teacherId]/attendance/route.ts       (GET)
├── [teacherId]/feedback/route.ts         (GET)
└── [teacherId]/teaching-hours/route.ts   (GET)
```

**Pattern**: Simple proxy to Firebase Functions with auth token forwarding

#### 3. Shared Components
**Status**: Not started  
**Files to Create**:
```
apps/dashboard/components/school/teachers/
├── TeacherKpis.tsx
├── TeacherListItem.tsx
├── TeacherFilters.tsx
├── TeacherQuickAddModal.tsx
└── TeacherProfileTabs.tsx
```

**Reference**: `apps/dashboard/components/school/classes/` for patterns

#### 4. Admin Pages (URL-based Routes)
**Status**: Not started  
**Files to Create**:
```
apps/dashboard/app/school/[schoolId]/admin/teachers/
├── page.tsx                  (List + KPIs + Search + Filters)
├── new/page.tsx              (Full create form)
├── [teacherId]/page.tsx      (Profile with tabs)
└── [teacherId]/edit/page.tsx (Full edit form)
```

**Features**:
- Client-side search with 300ms debounce
- URL params: `?q=&status=Active&subject=Math&page=1`
- Pagination with hasMore logic
- Quick Add modal on list page
- Profile tabs: Overview, Classes, Attendance, Feedback, Info

#### 5. Parent Pages (Read-only, Filtered)
**Status**: Not started  
**Files to Create**:
```
apps/dashboard/app/school/[schoolId]/parent/teachers/
├── page.tsx                  (Filtered list)
└── [teacherId]/page.tsx      (Read-only profile)
```

**Filtering Logic**: Backend filters by parent email → students → classes → teachers

#### 6. Role Guards
**Status**: Not started  
**Implementation**:
- Update `/api/school/teachers/*` routes to check user role
- Add role validation middleware
- Parent routes filter data by linked students
- Admin routes allow full CRUD

---

## Architecture Decisions Documented

### URL-Based vs Context-Based Routing

**Decision**: Implement URL-based routing for Teachers feature  
**Rationale**:
- **Bookmarkable**: Users can bookmark specific school teacher pages
- **Shareable**: Send links to colleagues
- **Multi-tab**: Open multiple schools side-by-side
- **Deep linking**: Mobile app notifications → specific page
- **Analytics**: Track feature usage per school from URLs
- **RESTful**: URL represents resource state

**Trade-off**: Hybrid approach during transition
- New teachers pages: `/school/:schoolId/admin/teachers` (URL-based)
- Old pages: `/school/admin/classes` (context-based)
- SchoolContext supports both patterns

**Migration Path**:
1. Phase 1: Teachers with URL routing (current)
2. Phase 2: Refactor classes to URL routing
3. Phase 3: Migrate all school features

### Firebase Functions as Single Source of Truth

**Decision**: All data access goes through Firebase Functions  
**Rationale**:
- Consistency between mobile and web apps
- Single point for validation and business logic
- Secure credential management (no client-side Airtable PAT)
- Easier to add caching, rate limiting, audit logs
- Backend-driven data transformations

**Pattern**:
```
Client → Next.js API Route (proxy) → Firebase Function → Airtable
```

**Benefits**:
- Web and mobile apps call same endpoints
- Business logic changes in one place
- Can swap Airtable for another DB without client changes

---

## Schema Gaps Identified

### Missing Tables (To Create)
Run: `node scripts/create-teachers-schema.js`

1. **TutoTeacherAttendance** (Attendance tab)
2. **TutoFeedback** (Feedback tab)
3. **TutoTeachingHours** (Workload calculation)
4. **TutoParentRatings** (Aggregated ratings)

### Missing Fields on TutoSchoolTeachers
- Nationality (singleLineText)
- Hobbies (multilineText)
- Rating (number) - needs verification

**Status**: Script is idempotent, safe to run multiple times

---

## Key Implementation Patterns

### 1. URL Param Persistence
```typescript
// Update URL when filters change
const updateURL = () => {
  const params = new URLSearchParams();
  if (searchQuery) params.set('q', searchQuery);
  if (selectedStatus) params.set('status', selectedStatus);
  if (page > 1) params.set('page', page.toString());
  router.push(`?${params.toString()}`, { scroll: false });
};

// Debounce search
useEffect(() => {
  const timer = setTimeout(() => updateURL(), 300);
  return () => clearTimeout(timer);
}, [searchQuery, selectedStatus, page]);
```

### 2. Firebase Function Proxy
```typescript
// apps/dashboard/app/api/school/teachers/route.ts
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const token = await getAuthToken(request);
  
  const response = await fetch(
    `${FUNCTIONS_URL}/getSchoolTeachers?${params.toString()}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  
  return NextResponse.json(await response.json());
}
```

### 3. Role-Based Data Filtering
```typescript
// Admin sees all
const teachers = await getSchoolTeachers(schoolId, filters);

// Parent sees only child's teachers
const parentEmail = user.email;
const students = await getStudentsByParentEmail(parentEmail);
const classIds = students.map(s => s.classId);
const teachers = await getTeachersByClassIds(classIds);
```

---

## Testing Strategy

### Backend Testing (Can Test Now)
```bash
# Test Firebase Functions locally
firebase emulators:start

# Test endpoints
curl "http://localhost:5001/.../getSchoolTeachers?schoolId=Sunrise..."
curl "http://localhost:5001/.../getSchoolTeacherKPIs?schoolId=Sunrise..."
```

### Frontend Testing (After UI Complete)
- [ ] Manual: Admin creates teacher → appears in list
- [ ] Manual: Search debounce works
- [ ] Manual: URL params persist on refresh
- [ ] Manual: Parent sees filtered list only
- [ ] Manual: Multi-tab with two schools
- [ ] Manual: i18n switch EN/VI
- [ ] E2E: Automated smoke tests

### Regression Testing
- [ ] Existing `/school/admin` dashboard works
- [ ] Existing `/school/admin/classes` works
- [ ] SchoolContext doesn't break old routes

---

## Known Issues & Workarounds

### Issue 1: Node Script Environment Error
**Error**: `Cannot read properties of undefined (reading 'split')`  
**Cause**: Environment issue with ts-node execution  
**Workaround**: Created JavaScript versions of scripts instead of TypeScript  
**Files**: `scripts/audit-teachers-schema.js`, `scripts/create-teachers-schema.js`

### Issue 2: Auth Middleware Disabled
**Status**: TODOs in `functions/src/v1/school-teachers.ts`  
**Impact**: No auth enforcement on mutations  
**Fix Before Production**: Enable `authenticateToken` middleware

### Issue 3: Missing Airtable Tables
**Status**: Tables don't exist yet  
**Impact**: Profile tabs show empty states  
**Fix**: Run `node scripts/create-teachers-schema.js` (creates with `TutoSchool*` prefix)  
**Alternative**: If already created without prefix, run `node scripts/rename-teachers-tables-to-school.js`

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run schema creation script
- [ ] Enable auth middleware in Functions
- [ ] Test all endpoints with Postman/curl
- [ ] Build and test Next.js app locally
- [ ] Run linter on all new files
- [ ] Test on mobile viewport (responsive check)

### Deployment
- [ ] Deploy Firebase Functions: `firebase deploy --only functions`
- [ ] Deploy Next.js app: Build passes
- [ ] Verify environment variables set in production
- [ ] Smoke test: Create a teacher, view profile

### Post-Deployment
- [ ] Monitor Firebase Functions logs
- [ ] Check Airtable API usage/rate limits
- [ ] User acceptance testing (UAT)
- [ ] Gather feedback from admins and parents

---

## Performance Considerations

### Airtable Rate Limits
- Free tier: 5 requests/second
- Plus tier: 10 requests/second
- **Mitigation**: 
  - Implement caching in Firebase Functions
  - Use React Query with TTL on frontend
  - Batch requests where possible

### Page Load Speed
- KPIs + List on one page = 2 Airtable queries
- **Optimization**:
  - Parallel fetches
  - Server-side rendering for initial load
  - Client-side caching with React Query

### Search Performance
- Airtable SEARCH() function can be slow on large tables
- **Optimization**:
  - Index by name (Airtable doesn't support, but use filterByFormula wisely)
  - Consider Algolia for advanced search if table > 10k records

---

## Future Enhancements

### Short Term
- Teacher photo upload (Cloudinary integration)
- Bulk import from CSV
- Export to Excel
- Teacher availability calendar
- Email notifications for new teachers

### Medium Term
- Performance reviews workflow
- Teacher certifications tracking (upload PDFs)
- Attendance pattern analysis
- Feedback sentiment analysis (AI)
- Parent-teacher messaging

### Long Term
- Teacher scheduling optimization (AI)
- Class balancing recommendations
- Predictive analytics (teacher retention)
- Integration with HR systems

---

## References

- **Plan**: `teachers-feature-url.plan.md`
- **Feature Doc**: `docs/TEACHERS_FEATURE.md`
- **Schema**: `docs/DATA_DICTIONARY.md`
- **Audit Reports**: `docs/airtable_schema_gaps.*`
- **Existing Classes Implementation**: `apps/dashboard/app/school/admin/classes/`

---

## Team Notes

### For Next Developer
1. Backend is complete and tested
2. Run schema scripts before starting UI work
3. Follow existing classes pages as UI reference
4. Use SchoolContext's `schoolIdFromUrl` for new routes
5. i18n keys are all defined, just use `t('dashboard.teachers.xxx')`
6. Components should be reusable (admin & parent share components, different permissions)

### For QA Team
- Test with multiple schools in different tabs
- Test parent view with different number of children/teachers
- Test URL bookmarking and sharing
- Test i18n switching
- Verify old routes still work (regression)

---

*This is a living document. Update as implementation progresses.*

