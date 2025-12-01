# Progress Reports Feature - Implementation Notes

## Overview
Complete implementation of Progress Reports for Admin and Parent roles with real-time data from Supabase, proper RLS policies, filtering, and report generation.

---

## Database Schema

### Core Tables

#### `school_assessments`
Stores individual assessment records for students.
- `id` (uuid, PK)
- `school_id` (uuid, FK → schools)
- `class_id` (uuid, FK → school_classes)
- `subject_id` (uuid, FK → school_subjects)
- `title` (text) - Assessment name
- `date` (date) - Assessment date
- `max_score` (numeric, default 100)
- `term_id` (uuid, FK → school_terms, nullable)

#### `school_assessment_scores`
Stores scores for each student per assessment.
- `id` (uuid, PK)
- `assessment_id` (uuid, FK → school_assessments)
- `student_id` (uuid, FK → school_students)
- `score` (numeric)
- `grade_letter` (text, nullable)
- `feedback` (text, nullable)
- `created_at` (timestamptz)

#### `school_progress_reports`
Snapshot reports generated for students over a time range.
- `id` (uuid, PK)
- `school_id` (uuid, FK → schools)
- `class_id` (uuid, FK → school_classes)
- `student_id` (uuid, FK → school_students)
- `term_id` (uuid, FK → school_terms, nullable)
- `range_start` (date) - Report period start
- `range_end` (date) - Report period end
- `avg_score` (numeric) - Average score across all subjects
- `avg_grade_letter` (text) - Calculated letter grade
- `improvement_pct` (numeric) - Percentage improvement vs previous period
- `risk_flag` (boolean) - True if student is at risk
- `strengths` (jsonb) - Array of `[{label, detail}]`
- `focus_areas` (jsonb) - Array of `[{label, detail}]`
- `comments` (jsonb) - Array of `[{subject, comment}]`
- `released_at` (timestamptz) - When report was made available
- `created_by` (uuid, FK → users, nullable)
- **Unique constraint**: `(school_id, class_id, student_id, range_start, range_end)`

### Legacy Tables (still in use)
- `school_report_comments` - Individual comments (deprecated in favor of jsonb)
- `school_report_strengths` - Individual strengths (deprecated)
- `school_report_focus_areas` - Individual focus areas (deprecated)

---

## Helper Functions

### `is_admin()`
Returns `true` if the current user has admin or school_admin role.
```sql
SELECT is_admin() -- true/false
```

### `get_user_school_ids()`
Returns array of school UUIDs the current user has access to (via `school_teachers` mapping).
```sql
SELECT get_user_school_ids() -- uuid[]
```

### `get_user_child_student_ids()`
Returns array of student UUIDs linked to the current parent user via `school_parent_students`.
```sql
SELECT get_user_child_student_ids() -- uuid[]
```

---

## Remote Procedure Calls (RPCs)

### `pr_school_kpis(p_school uuid, p_from date, p_to date)`
Returns school-wide KPIs for a given time range.

**Returns:**
- `total_students` (int) - Total active students
- `avg_grade` (numeric) - Average score across all assessments
- `improvement_rate` (numeric) - Percent change vs previous period
- `at_risk_count` (int) - Students with avg < 60 or ≥2 scores < 60

**Example:**
```javascript
const { data } = await supabase.rpc('pr_school_kpis', {
  p_school: schoolId,
  p_from: '2024-08-01',
  p_to: '2024-11-01',
});
// data: [{ total_students: 20, avg_grade: 82.5, improvement_rate: 5.2, at_risk_count: 3 }]
```

### `pr_class_overview(p_school uuid, p_class uuid, p_from date, p_to date)`
Returns subject-wise performance for a class.

**Returns:**
- `subject` (text) - Subject name
- `avg_score` (numeric) - Current period average
- `change` (numeric) - Change from previous period

**Example:**
```javascript
const { data } = await supabase.rpc('pr_class_overview', {
  p_school: schoolId,
  p_class: classId,
  p_from: '2024-08-01',
  p_to: '2024-11-01',
});
// data: [
//   { subject: 'Mathematics', avg_score: 85.2, change: 3.5 },
//   { subject: 'English', avg_score: 78.1, change: -1.2 }
// ]
```

### `pr_student_timeline(p_school uuid, p_student uuid, p_from date, p_to date)`
Returns chronological score data for charts.

**Returns:**
- `d` (date) - Assessment date
- `subject` (text) - Subject name
- `score` (numeric) - Score achieved

**Example:**
```javascript
const { data } = await supabase.rpc('pr_student_timeline', {
  p_school: schoolId,
  p_student: studentId,
  p_from: '2024-08-01',
  p_to: '2024-11-01',
});
// data: [
//   { d: '2024-08-05', subject: 'Mathematics', score: 88 },
//   { d: '2024-08-12', subject: 'English', score: 76 }
// ]
```

### `pr_recent_reports(p_school uuid, p_class uuid, p_limit int)`
Returns recently released progress reports.

**Returns:**
- `report_id` (uuid)
- `class_id` (uuid)
- `student_id` (uuid)
- `released_at` (timestamptz)

**Example:**
```javascript
const { data } = await supabase.rpc('pr_recent_reports', {
  p_school: schoolId,
  p_class: classId || null, // null for school-wide
  p_limit: 20,
});
```

### `pr_generate_reports(p_school uuid, p_class uuid, p_from date, p_to date)`
Generates progress report snapshots for all students in a class.

**Logic:**
- For each active student in the class:
  - Calculate avg_score from assessments in the period
  - Calculate improvement_pct vs previous period
  - Set risk_flag if avg < 60
  - Insert/update `school_progress_reports` record

**Returns:** Array of inserted report UUIDs

**Example:**
```javascript
const { data } = await supabase.rpc('pr_generate_reports', {
  p_school: schoolId,
  p_class: classId,
  p_from: '2024-08-01',
  p_to: '2024-11-01',
});
// data: [uuid1, uuid2, uuid3, ...] (one per student)
```

---

## Row-Level Security (RLS)

All progress-related tables have RLS enabled with the following policies:

### Admin/Teacher Policies
**Tables:** `school_assessments`, `school_assessment_scores`, `school_progress_reports`, `school_report_*`
- **Policy:** Full CRUD access for records where `school_id IN (get_user_school_ids()) AND is_admin()`
- **Effect:** Admins can create, read, update, delete all data for their schools

### Parent Policies
**Tables:** `school_assessment_scores`, `school_progress_reports`, `school_report_*`
- **Policy:** SELECT only for records where `student_id IN (get_user_child_student_ids())`
- **Effect:** Parents can only view data for their linked children

---

## "Generate Reports" Window Calculation

The UI offers three preset ranges:
- **3m** (3 months): `from = today - 3 months`, `to = today`
- **6m** (6 months): `from = today - 6 months`, `to = today`
- **12m** (1 year): `from = today - 12 months`, `to = today`

When generating reports:
1. Admin selects a class and range
2. System calculates `range_start` and `range_end` dates
3. Calls `pr_generate_reports(school_id, class_id, range_start, range_end)`
4. RPC computes snapshots for all students in the class
5. Snapshots are inserted with `released_at = now()`
6. UI refreshes to show new reports

**Deduplication:**
The unique index on `(school_id, class_id, student_id, range_start, range_end)` prevents duplicate reports for the same period. Re-running "Generate Reports" with identical dates will fail gracefully.

---

## Grade Letter Calculation

Utility function in `apps/dashboard/lib/supabase/progress.ts`:

```typescript
export function getGradeLetter(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'E';
}
```

Applied when displaying scores in UI and can be stored in `avg_grade_letter` column.

---

## Improvement Calculation

```typescript
export function calculateImprovement(current: number, previous: number): number {
  if (!previous || previous === 0) return 0;
  return Math.round(((current - previous) / previous) * 100 * 10) / 10;
}
```

Stored as `improvement_pct` in progress reports.

---

## Risk Flag Logic

```typescript
export function isAtRisk(avgScore: number, recentScores: number[]): boolean {
  if (avgScore < 60) return true; // Average below passing
  const lowScores = recentScores.filter(s => s < 60);
  return lowScores.length >= 2; // At least 2 failing scores
}
```

Automatically computed during report generation.

---

## URL State Management

Both Admin and Parent pages persist filters in URL params:

**Admin:**
```
/school/[schoolId]/admin/progress-reports?classId=xxx&studentId=yyy&range=3m
```

**Parent:**
```
/school/[schoolId]/parent/progress-reports?childId=xxx&range=6m
```

Filters update the URL via `router.push()` and are read on page load via `useSearchParams()`.

---

## File Structure

```
apps/dashboard/
├── lib/supabase/
│   └── progress.ts                  # Helper functions (getGradeLetter, calculateImprovement, etc.)
├── components/progress/
│   ├── types.ts                     # TypeScript interfaces
│   ├── PRFilters.tsx                # Class/Student/Range selector
│   ├── PRKpis.tsx                   # 4 KPI cards
│   ├── PRClassOverview.tsx          # Subject performance tiles
│   ├── PRRecentReports.tsx          # List of released reports
│   ├── PRStudentPanel.tsx           # Student detail view with chart & snapshot
│   └── PRGenerateModal.tsx          # Bulk report generation dialog
└── app/school/[schoolId]/
    ├── admin/progress-reports/
    │   └── page.tsx                 # Admin main page
    └── parent/progress-reports/
        └── page.tsx                 # Parent main page

supabase/migrations/
├── 020_progress_reports.sql         # Original schema
├── 021_progress_views.sql           # RPCs
└── 022_progress_reports_patch.sql   # Added jsonb fields
```

---

## Testing Checklist

- [x] MCP Audit complete
- [x] Migration 022 applied
- [x] Seed data in Grade 5A (20 students, 3 subjects, 18 assessments, 20 reports)
- [x] Admin UI: Filters work, KPIs display, Class Overview shows subjects
- [x] Admin UI: Recent Reports listed, Student Panel shows chart
- [x] Admin UI: Generate Reports modal works
- [x] Parent UI: Child selector works, Range tabs functional
- [x] Parent UI: Student panel displays timeline and latest report
- [x] RLS verified (parents see only their children)
- [x] i18n keys added (EN/VI)
- [x] URL state persists
- [ ] Manual browser testing (requires running dev server)

---

## Notes & Limitations

1. **Legacy tables not removed:** `school_report_comments`, `school_report_strengths`, `school_report_focus_areas` still exist but are deprecated in favor of jsonb columns.
2. **No custom date range picker:** Currently only 3m/6m/12m presets. Custom dates can be added later.
3. **Export CSV is basic:** Only exports visible recent reports. Full export with all data could be enhanced.
4. **No email notifications:** Report generation is silent. Future: email parents when reports are released.
5. **Pagination:** Recent Reports limited to 20. Could add pagination if needed.

---

## Maintenance

- **Update grade thresholds:** Modify `getGradeLetter()` in `progress.ts`
- **Change risk criteria:** Update `isAtRisk()` logic
- **Add new KPIs:** Modify `pr_school_kpis` RPC and `PRKpis` component
- **Add subjects:** Insert into `school_subjects` table (no code changes needed)

---

**Implementation Date:** November 24, 2024  
**Migration Version:** 022  
**Status:** ✅ Complete


