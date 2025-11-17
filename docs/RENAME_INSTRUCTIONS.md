# Quick Instructions: Rename Teachers Tables

**You've already created the tables!** Now you need to rename them to follow the school naming convention.

---

## Run This Command

```bash
npm run rename:teachers-tables
```

or

```bash
node scripts/rename-teachers-tables-to-school.js
```

---

## What It Does

Renames these tables in Airtable:
- `TutoTeacherAttendance` → `TutoSchoolTeacherAttendance`
- `TutoFeedback` → `TutoSchoolFeedback`
- `TutoTeachingHours` → `TutoSchoolTeachingHours`
- `TutoParentRatings` → `TutoSchoolParentRatings`

---

## Why?

**Separates school dashboard data from core marketplace data**:
- **School Dashboard**: `TutoSchool*` tables (used by schools)
- **Marketplace**: `Tuto*` tables (used by open platform)

---

## Safety

- ✅ **Idempotent**: Safe to run multiple times
- ✅ **No data loss**: Only renames, doesn't delete anything
- ✅ **Skips if already renamed**: Won't break if run twice

---

## Expected Output

```
🔄 Starting Table Rename Process...
═══════════════════════════════════════════

📊 Renaming Tables...

🔨 Renaming: TutoTeacherAttendance → TutoSchoolTeacherAttendance
✅ Renamed successfully: TutoSchoolTeacherAttendance
🔨 Renaming: TutoFeedback → TutoSchoolFeedback
✅ Renamed successfully: TutoSchoolFeedback
🔨 Renaming: TutoTeachingHours → TutoSchoolTeachingHours
✅ Renamed successfully: TutoSchoolTeachingHours
🔨 Renaming: TutoParentRatings → TutoSchoolParentRatings
✅ Renamed successfully: TutoSchoolParentRatings

═══════════════════════════════════════════
📊 RENAME COMPLETE
═══════════════════════════════════════════

📈 Summary:
   Tables renamed: 4
   Tables skipped: 0
   Errors: 0

✅ Tables renamed successfully!
```

---

## After Rename

All code references have already been updated. The teachers feature will now use the correct table names automatically.

---

**Next Step**: Test the teachers feature at `/school/Sunrise-International-School/admin/teachers`









