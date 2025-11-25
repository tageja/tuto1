# Progress Reports - Setup & Troubleshooting Guide

## ✅ What Was Completed

### Database (Supabase)
- ✅ Migration 022 applied successfully
- ✅ All 5 RPCs working: `pr_school_kpis`, `pr_class_overview`, `pr_student_timeline`, `pr_recent_reports`, `pr_generate_reports`
- ✅ 20 progress reports seeded with sample data (strengths, focus areas, comments)
- ✅ PostgREST schema cache reloaded

### UI Components (6 total)
- ✅ `PRFilters.tsx` - Class/Student/Range selection
- ✅ `PRKpis.tsx` - 4 KPI cards
- ✅ `PRClassOverview.tsx` - Subject performance
- ✅ `PRRecentReports.tsx` - Recent reports list
- ✅ `PRStudentPanel.tsx` - Student detail with charts
- ✅ `PRGenerateModal.tsx` - Report generation

### Pages (2 total)
- ✅ Admin: `/school/[schoolId]/admin/progress-reports`
- ✅ Parent: `/school/[schoolId]/parent/progress-reports`

### Test Data
- ✅ Grade 5A class with 20 students
- ✅ 3 subjects (Mathematics, English, Writing)
- ✅ 18 assessments with 360 scores
- ✅ 20 progress reports with jsonb data

---

## 🔴 Current Issues & Solutions

### Issue 1: "No Children Found" in Parent View

**Cause:** You need to be authenticated as a parent user linked to students.

**Solution:**

1. **Option A: Sign up with the test parent email**
   - Email: `tarun.tageja@gmail.com`
   - Name: Mung Tageja
   - This user is already created in `public.users` and linked to Student No. 1 and Student No. 2
   - You just need to complete Supabase Auth signup with this email

2. **Option B: Link your current logged-in user to students**
   
   First, find your user ID:
   ```sql
   SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';
   ```
   
   Then link to students:
   ```sql
   -- Insert into public.users if not exists
   INSERT INTO public.users (auth_user_id, email, name, role)
   VALUES ('your-auth-user-id', 'your-email@example.com', 'Your Name', 'parent')
   ON CONFLICT (email) DO UPDATE SET role = 'parent'
   RETURNING id;
   
   -- Link to students (replace USER_ID with the returned id above)
   INSERT INTO public.school_parent_students (school_id, parent_user_id, student_id)
   VALUES 
     ('48998eeb-fc31-4843-a995-c1692c1c849c', 'USER_ID', '58dc82f5-ea6b-438f-a1e9-38f029585435'),
     ('48998eeb-fc31-4843-a995-c1692c1c849c', 'USER_ID', '265fa201-b4e8-4dbf-8538-db672457c642');
   ```

### Issue 2: Admin Page Flashing / 404 Errors

**Cause:** PostgREST API cache was not aware of the new RPC functions.

**Status:** ✅ FIXED

**If it happens again:**
```sql
NOTIFY pgrst, 'reload schema';
```

Or restart your Supabase local instance.

---

## 📋 How to Test

### Admin View

1. **Navigate** to `/school/48998eeb-fc31-4843-a995-c1692c1c849c/admin/progress-reports`

2. **Default View (No Class Selected)**
   - Should see school-wide KPIs
   - Should see recent reports for all classes

3. **Select "Grade 5A" Class**
   - KPIs update to class-specific
   - Class Overview shows 3 subjects (Math, English, Writing)
   - Recent Reports filtered to Grade 5A

4. **Click "View" on a Report**
   - Student Panel opens
   - Timeline chart shows assessment trends
   - Latest report snapshot displayed with strengths/focus/comments

5. **Generate Reports**
   - Click "Generate Reports" button
   - Select Grade 5A and 3m range
   - Click Generate
   - Success toast appears
   - Page refreshes with new reports

6. **Export CSV**
   - Click download icon
   - CSV file downloads with visible reports

### Parent View

**Prerequisites:** Must be logged in as a parent user with linked students (see Issue 1 above)

1. **Navigate** to `/school/48998eeb-fc31-4843-a995-c1692c1c849c/parent/progress-reports`

2. **Should See:**
   - Child selector (if multiple children)
   - Range tabs (3m/6m/12m)
   - Student name header
   - Performance trends chart
   - Latest report card with:
     - Average score and grade
     - Improvement percentage
     - Strengths list
     - Focus areas list
     - Teacher comments

3. **Test Range Switching**
   - Click 3m/6m/12m tabs
   - Chart data updates
   - Latest report updates to match period

---

## 🗄️ Database Quick Reference

### Key Tables
- `school_progress_reports` - Report snapshots
- `school_assessments` - Individual assessments
- `school_assessment_scores` - Student scores
- `school_parent_students` - Parent-student mapping

### Key RPCs
- `pr_school_kpis(school_id, from, to)` - School KPIs
- `pr_class_overview(school_id, class_id, from, to)` - Class performance
- `pr_student_timeline(school_id, student_id, from, to)` - Student scores
- `pr_recent_reports(school_id, class_id, limit)` - Recent reports
- `pr_generate_reports(school_id, class_id, from, to)` - Generate snapshots

### Test Data IDs
- School: `48998eeb-fc31-4843-a995-c1692c1c849c` (Tuto Demo School)
- Class: `e26196a4-4501-4c44-a971-bb027050a398` (Grade 5A)
- Subjects:
  - Mathematics: `e5feef7e-1b99-42ce-a069-f1c3b43e9277`
  - English: `3bbbb45d-77bb-4254-97ba-3e112b9c3dda`
  - Writing: `0d3d754d-181a-4da8-8ffc-f786fc12b143`
- Students: 20 total (Student No. 1 through Student No. 20)
- Parent User: `65d64149-5bed-4547-833e-cc62833078a8` (Mung Tageja / tarun.tageja@gmail.com)

---

## 🚨 Troubleshooting

### "Function not found" errors
```sql
-- Verify RPCs exist
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name LIKE 'pr_%';

-- If they exist but still 404, reload schema
NOTIFY pgrst, 'reload schema';
```

### Parent sees no children
```sql
-- Check if mapping exists
SELECT * FROM public.school_parent_students 
WHERE parent_user_id = (SELECT id FROM public.users WHERE email = 'your-email');

-- Check helper function
SELECT get_user_child_student_ids();
```

### KPIs showing zeros
```sql
-- Check if assessments exist
SELECT COUNT(*) FROM public.school_assessments 
WHERE class_id = 'e26196a4-4501-4c44-a971-bb027050a398';

-- Check if scores exist
SELECT COUNT(*) FROM public.school_assessment_scores;

-- Manually test RPC
SELECT * FROM pr_school_kpis(
  '48998eeb-fc31-4843-a995-c1692c1c849c',
  '2024-08-01',
  '2024-11-24'
);
```

### Charts not displaying
- Check browser console for errors
- Verify `date-fns` is installed
- Verify `recharts` is installed
- Check if timeline data is being fetched

---

## 📚 Documentation

- **Implementation Details**: `docs/PROGRESS_REPORTS_NOTES.md`
- **Feature Spec**: `docs/PROGRESS_REPORTS_IMPLEMENTATION.md`
- **Chat History**: `docs/CHAT_SUMMARY_2024_12_20_FINAL.md`

---

## ✨ Next Steps (Optional Enhancements)

1. **Email Notifications** - Notify parents when reports are released
2. **Custom Date Ranges** - Add date picker beyond 3m/6m/12m presets
3. **PDF Export** - Generate PDF reports instead of just CSV
4. **Teacher Comments Interface** - Allow teachers to add comments directly
5. **Batch Report Deletion** - Allow admins to delete outdated reports
6. **Analytics Dashboard** - School-wide trends over multiple terms

---

**Status**: ✅ Feature Complete & Ready for Testing  
**Last Updated**: November 24, 2024

