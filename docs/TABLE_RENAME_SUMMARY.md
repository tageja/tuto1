# Table Rename Summary - Teachers Feature

**Date**: November 7, 2025  
**Reason**: Separate school dashboard data from core Tuto marketplace data

---

## Renamed Tables

The following tables were renamed to follow the `TutoSchool*` naming convention:

| Old Name | New Name | Purpose |
|----------|----------|---------|
| TutoTeacherAttendance | **TutoSchoolTeacherAttendance** | School teacher attendance tracking |
| TutoFeedback | **TutoSchoolFeedback** | School parent/student feedback |
| TutoTeachingHours | **TutoSchoolTeachingHours** | School teacher workload tracking |
| TutoParentRatings | **TutoSchoolParentRatings** | School aggregated parent ratings |

---

## Rationale

### Data Separation Strategy

**Core Tuto (Marketplace)**:
- `TutoTeachers` - Teachers in the open marketplace
- `TutoStudents` - Students using the marketplace
- `TutoParents` - Parents using the marketplace
- `TutoFeedback` - Feedback for marketplace teachers (future)
- `TutoTeacherAttendance` - Attendance for marketplace teachers (future)

**School Dashboard**:
- `TutoSchoolTeachers` - Teachers employed by schools
- `TutoSchoolStudents` - Students enrolled in schools
- `TutoSchoolClasses` - School classes
- `TutoSchoolFeedback` - Feedback within school context
- `TutoSchoolTeacherAttendance` - School teacher attendance

### Benefits

1. **Clear Separation**: School data vs marketplace data
2. **Future-Proof**: Can add marketplace feedback/attendance without conflicts
3. **Consistent Naming**: Follows existing pattern (TutoSchoolStudents, TutoSchoolClasses)
4. **Better Organization**: Easier to understand data context
5. **Access Control**: Different permissions for school vs marketplace

---

## Files Updated

### Backend Code
- ✅ `functions/src/v1/airtable.ts` - Updated all table references
- ✅ `functions/src/v1/school-teachers.ts` - Already using airtable service (no changes needed)

### Scripts
- ✅ `scripts/create-teachers-schema.js` - Table definitions updated
- ✅ `scripts/audit-teachers-schema.js` - Expected tables updated
- ✅ `scripts/audit-teachers-schema.ts` - Expected tables updated
- ✅ `scripts/rename-teachers-tables-to-school.js` - NEW rename script created

### Documentation
- ✅ `docs/airtable_schema_gaps.md` - All table names updated
- ✅ `docs/airtable_schema_gaps.json` - All table names updated
- ✅ `docs/TEACHERS_FEATURE.md` - Schema section updated
- ✅ `docs/TEACHERS_IMPLEMENTATION_SUMMARY.md` - All references updated
- ✅ `docs/dev_notes.md` - Issue notes updated

### UI Files
- ✅ `apps/dashboard/app/school/[schoolId]/admin/teachers/[teacherId]/page.tsx` - Placeholder messages updated
- ✅ No other UI files reference table names directly (all go through API layer)

---

## How to Apply Rename

### If Tables Already Exist (Without "School" Prefix)

Run the rename script:
```bash
node scripts/rename-teachers-tables-to-school.js
```

This will:
- Check if tables exist with old names
- Rename them to new names
- Skip if already renamed
- Safe to run multiple times (idempotent)

### If Tables Don't Exist Yet

Just run the creation script (already updated with new names):
```bash
node scripts/create-teachers-schema.js
```

This will create tables with the correct `TutoSchool*` prefix.

---

## Verification

After renaming, verify in Airtable:
- [ ] TutoSchoolTeacherAttendance exists
- [ ] TutoSchoolFeedback exists
- [ ] TutoSchoolTeachingHours exists
- [ ] TutoSchoolParentRatings exists
- [ ] Old tables (TutoTeacherAttendance, etc.) no longer exist

---

## Impact on Existing Data

**No data loss**: The rename operation preserves all records and field configurations. It only changes the table name.

**No code changes needed in UI**: All UI code goes through the API/Functions layer, which has been updated.

---

## Future Considerations

When implementing marketplace features (open to all parents/students):
- Create `TutoTeacherAttendance` (marketplace teacher attendance)
- Create `TutoFeedback` (marketplace teacher feedback)
- Create `TutoTeachingHours` (marketplace teacher workload)

These will be separate from the school dashboard tables.

---

*Last updated: November 7, 2025*









