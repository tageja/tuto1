# Progress Reports Implementation Plan

## Status: IN PROGRESS
Date: 2024-11-24

## Schema Audit Results

### ✅ Existing (from migration 020_progress_reports.sql):
- `school_assessments` (id, school_id, class_id, subject_id, title, date, max_score, term_id)
- `school_assessment_scores` (id, assessment_id, student_id, score, grade_letter, feedback)
- `school_progress_reports` (id, school_id, class_id, student_id, term_id, range_start, range_end, avg_score, avg_grade_letter, improvement_pct, risk_flag, released_at)
- `school_report_comments`, `school_report_strengths`, `school_report_focus_areas`
- `school_subjects`, `school_classes`, `school_students`
- Helper functions: `is_admin()`, `get_user_school_ids()`, `get_user_child_student_ids()`
- RPCs: `pr_school_kpis`, `pr_class_overview`, `pr_student_timeline`, `pr_recent_reports`, `pr_generate_reports`

### ❌ Missing/Needs Patch:
1. `school_progress_reports` missing: `strengths jsonb`, `focus_areas jsonb`, `comments jsonb`, `created_by uuid`
2. Unique constraint on (school_id, class_id, student_id, range_start, range_end)
3. Seed data for testing
4. Complete UI implementation

## Implementation Steps

### Phase 1: Database Patch (Migration 022) ✓ PLANNED
- Add missing jsonb columns to school_progress_reports
- Add unique index
- Verify RLS policies

### Phase 2: Seed Data ✓ PLANNED
- Use existing Grade 5A class (ID from DB)
- 20 students (already exist from previous seed)
- 3 subjects: Math, English, Writing  
- 12 weeks of weekly assessments with varied scores
- 2 released progress reports with strengths/focus/comments

### Phase 3: UI Components Implementation
All under `apps/dashboard/components/progress/`:

1. **PRFilters.tsx** - Class/Student/Range selection with URL sync
2. **PRKpis.tsx** - 4 KPI cards (Total Students, Avg Grade, Improvement, At-Risk)
3. **PRClassOverview.tsx** - Subject performance tiles
4. **PRRecentReports.tsx** - List of released reports with accordion view
5. **PRStudentPanel.tsx** - Individual student view with chart + snapshot
6. **PRGenerateModal.tsx** - Bulk report generation dialog

### Phase 4: Pages
1. **Admin Page** (`app/school/[schoolId]/admin/progress-reports/page.tsx`)
   - Filters → KPIs → Class Overview/Recent Reports → Student Panel
   - Generate Reports button
   - Export CSV

2. **Parent Page** (`app/school/[schoolId]/parent/progress-reports/page.tsx`)  
   - Range tabs → Subject cards → Trend chart → Latest report snapshot
   - RLS-enforced child-only view

### Phase 5: i18n & Polish
- Add translation keys to contexts/I18nContext.tsx
- Loading skeletons
- Empty states
- Error handling

## File Structure

```
apps/dashboard/
├── components/progress/
│   ├── types.ts (TypeScript interfaces)
│   ├── PRFilters.tsx
│   ├── PRKpis.tsx  
│   ├── PRClassOverview.tsx
│   ├── PRRecentReports.tsx
│   ├── PRStudentPanel.tsx
│   └── PRGenerateModal.tsx
├── app/school/[schoolId]/
│   ├── admin/progress-reports/page.tsx
│   └── parent/progress-reports/page.tsx
├── lib/supabase/
│   └── progress.ts (helper functions: getGradeLetter, etc.)
└── contexts/I18nContext.tsx (add progress.* keys)

supabase/
└── migrations/
    ├── 020_progress_reports.sql (DONE)
    ├── 021_progress_views.sql (DONE)
    └── 022_progress_reports_patch.sql (TODO)
```

## Acceptance Criteria

- [ ] MCP audit complete
- [ ] Migration 022 applied with jsonb fields
- [ ] Seed data in Grade 5A
- [ ] Admin UI: Filters, KPIs, Class Overview, Recent Reports, Student Panel, Generate Modal
- [ ] Parent UI: Range tabs, Subject cards, Chart, Latest snapshot
- [ ] RLS verified for both roles
- [ ] i18n keys added (EN/VI)
- [ ] Export CSV works
- [ ] All empty/loading/error states present
- [ ] URL state persists filters

## Notes

- Keep all imports relative (no tsconfig changes)
- Use existing chart library (recharts)
- Reuse UI components from `components/ui/`
- RPC calls via Supabase client (no new API routes needed)
- Grade letter: A≥90, B≥80, C≥70, D≥60, E<60
- Risk flag: avg_score < 60 OR ≥2 scores <60 in range

