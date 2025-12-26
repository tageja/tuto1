# Mobile Teachers & Classes - Testing Guide

**Date**: December 8, 2024  
**Screens**: Admin Classes, Admin Teachers, Parent Teachers  
**Status**: Ready for Testing

---

## 🧪 Pre-Test Checklist

- [ ] App builds without errors (`npm run ios` or `npm run android`)
- [ ] You have test accounts:
  - Admin: `tarun@tutoglobal.com` (role: `admin`)
  - Parent: Any parent email in `school_students.parent_email`
- [ ] Joined "Tuto Demo School" (UUID: `bed99290-1b7c-4e90-ac55-0ec7f496491b`)
- [ ] Database has data:
  - 4 teachers in `school_teachers`
  - 6 classes in `school_classes`
  - Students in `school_students`

---

## 🔍 Test Cases

### **Test 1: Admin Classes Screen**

**Login as**: `tarun@tutoglobal.com` (admin)

**Steps**:
1. Open sidebar menu (tap menu icon)
2. Tap "Classes" menu item
3. Wait for screen to load

**Expected Results**:
- ✅ Screen title: "Classes"
- ✅ Subtitle: "Manage classes, view student rosters, and track class performance"
- ✅ 4 KPI cards displayed:
  - Total Classes: 6
  - Active Classes: 6 (or actual count)
  - Total Students: (sum of all students)
  - Capacity: (percentage)
- ✅ Search bar present: "Search classes by name..."
- ✅ Grade filter chips visible (All Grades, 5, 6, 7, 8)
- ✅ Results count: "Showing 6 classes"
- ✅ 6 class cards displayed with:
  - Class name (5A, 5B, 6A, 7A, 8A, ...)
  - Grade badge (color-coded)
  - Teacher name or "Not assigned"
  - Student count (e.g., "0/25 students")
  - Room number
  - Academic year
  - Capacity % badge
- ✅ Tap on a class card → navigates to ClassDetail screen
- ✅ Pull-to-refresh works

**Filter Tests**:
- Type "5A" in search → Only "Class 5A" appears
- Select "Grade 5" filter → Only grade 5 classes appear
- Clear search & filter → All 6 classes return

---

### **Test 2: Admin Teachers Screen**

**Login as**: `tarun@tutoglobal.com` (admin)

**Steps**:
1. Open sidebar menu
2. Tap "Teachers" menu item (should show "AdminTeachers" route)
3. Wait for screen to load

**Expected Results**:
- ✅ Screen title: "Teachers"
- ✅ Subtitle: "Manage teacher profiles and assignments"
- ✅ 4 KPI cards displayed:
  - Total Teachers: 4
  - Active: 4 (or actual count)
  - On Leave: 0
  - Avg Rating: N/A
- ✅ Search bar present: "Search teachers by name..."
- ✅ Status filter chips: All Statuses, Active, On Leave
- ✅ Subject filter chips: All Subjects, (dynamic from data: Math, English, Science, etc.)
- ✅ 4 teacher cards displayed with:
  - Avatar with initials (MH, LT, MP, ...)
  - Full name (Mr. Hoang Van Tuan, Mrs. Tran Thi Lan, ...)
  - Qualification line (Bachelor of History, Master of Education, ...)
  - Subject chips (History, Geography, Math, Science, ...)
  - Email (tuan.hoang@tutodemo.edu.vn, ...)
  - Phone (+84 98 777 8888, ...)
  - Status badge (Active - green)
- ✅ Tap on a teacher card → navigates to TeacherDetail screen
- ✅ Scroll to bottom → "Load More" or pagination works
- ✅ Pull-to-refresh works

**Filter Tests**:
- Type "Hoang" in search → Only matching teachers appear
- Select "Active" status → All active teachers (should be 4)
- Select "Math" subject → Only teachers teaching Math
- Clear all filters → All 4 teachers return

---

### **Test 3: Parent Teachers Screen**

**Login as**: Parent user (e.g., use a parent email from `school_students.parent_email`)

**Steps**:
1. Open sidebar menu
2. Tap "Teachers" menu item (should show "SchoolTeachers" route, NOT "AdminTeachers")
3. Wait for screen to load

**Expected Results**:
- ✅ Screen title: "Teachers"
- ✅ Subtitle: "View your child's teachers" (NOT admin subtitle)
- ✅ **NO KPI cards** (parent view is simplified)
- ✅ Search bar present: "Search teachers by name..."
- ✅ **NO filter chips** (status/subject filters only for admin)
- ✅ Teacher cards displayed (filtered by child's classes if parent has students, else all active teachers)
- ✅ Teacher cards show same info as admin view:
  - Avatar, name, qualification, subjects, email, phone, status
- ✅ Tap on a teacher card → navigates to TeacherDetail screen
- ✅ Pull-to-refresh works

**Search Test**:
- Type teacher name in search → Only matching teachers appear (client-side filter)

---

### **Test 4: Navigation & Role Gating**

**Admin User** (`tarun@tutoglobal.com`):
- ✅ Sidebar shows: Dashboard, **Classes**, **Teachers**, Students, Attendance, Homework, ...
- ✅ "Teachers" menu item navigates to `AdminTeachers` screen (with KPIs)
- ✅ "Classes" menu item navigates to `SchoolClasses` screen (admin view)

**Parent User**:
- ✅ Sidebar shows: Dashboard, **Teachers**, Attendance, Homework, Events, ... (NO "Classes", NO "Students")
- ✅ "Teachers" menu item navigates to `SchoolTeachers` screen (parent view, no KPIs)

---

### **Test 5: Data Accuracy**

**Verify Supabase Data**:
1. Open Supabase dashboard → SQL Editor
2. Run:
   ```sql
   SELECT COUNT(*) FROM school_teachers WHERE school_id = 'bed99290-1b7c-4e90-ac55-0ec7f496491b';
   -- Should return 4
   
   SELECT COUNT(*) FROM school_classes WHERE school_id = 'bed99290-1b7c-4e90-ac55-0ec7f496491b';
   -- Should return 6
   ```
3. Compare counts with mobile KPIs → **Should match**

**Verify School ID Resolution**:
1. Check console logs when loading screens
2. Look for:
   ```
   🏫 SchoolContext resolveSchoolId: { input: 'rec6oStnXAgY4VCrC', output: 'bed99290-1b7c-4e90-ac55-0ec7f496491b', mapped: true }
   ```
3. Confirm no UUID parsing errors

---

### **Test 6: Empty States**

**No Data Scenario**:
1. Filter classes by a non-existent grade (e.g., "Grade 10")
2. **Expected**: Empty state with icon, "No Classes Found", subtitle

**No Teachers Scenario**:
1. Search for "XYZ NonExistent" in teachers
2. **Expected**: Empty state with icon, "No Teachers Found", subtitle

---

### **Test 7: Loading States**

**Slow Network**:
1. Enable slow 3G in React Native Debugger
2. Navigate to Classes screen
3. **Expected**: Loading indicator with "Loading..." text
4. **NOT Expected**: Empty list or crash

---

### **Test 8: Translations (EN/VI)**

**Steps**:
1. Open Admin Classes screen
2. Tap language toggle (EN → VI)
3. **Expected**:
   - Title changes: "Classes" → "Lớp học"
   - Subtitle changes: "Manage classes..." → "Quản lý lớp học..."
   - Search placeholder: "Search classes..." → "Tìm lớp theo tên..."
   - KPI labels: "Total Classes" → "Tổng số lớp", etc.
4. Switch back to EN
5. **Expected**: All text returns to English

**Repeat for Teachers screen**.

---

### **Test 9: Pull-to-Refresh**

**Steps**:
1. Open Classes screen
2. Pull down from top
3. **Expected**: 
   - Refresh indicator appears
   - Data reloads
   - KPIs update
   - Refresh indicator dismisses

**Repeat for Admin Teachers and Parent Teachers screens**.

---

### **Test 10: Detail Screen Navigation**

**Classes**:
1. Tap on "Class 5A" card
2. **Expected**: Navigate to ClassDetail screen
3. **Expected**: Shows class details (teacher, students, room, capacity, academic year)

**Teachers**:
1. Tap on teacher card
2. **Expected**: Navigate to TeacherDetail screen
3. **Expected**: Shows teacher profile (name, subjects, classes taught, contact info)

---

## ❌ Known Issues / Limitations

1. **Average Rating KPI**: Always shows "N/A" (no `rating` field in `school_teachers` table)
2. **Parent Filtering**: Falls back to all active teachers if parent email not found in `school_students.parent_email`
3. **School ID Resolution**: Requires manual mapping for Airtable legacy IDs (see `src/services/school-id.ts`)

---

## 🐛 Bug Reporting Template

If you find issues, report using this format:

```
**Screen**: Admin Classes / Admin Teachers / Parent Teachers
**User Role**: Admin / Parent
**Device**: iOS / Android
**Steps to Reproduce**:
1. ...
2. ...
3. ...

**Expected**: ...
**Actual**: ...

**Screenshots**: [attach if possible]
**Console Logs**: [paste relevant errors]
```

---

## ✅ Sign-Off Checklist

After testing, confirm:
- [ ] Admin Classes screen displays correctly
- [ ] Admin Teachers screen displays correctly
- [ ] Parent Teachers screen displays correctly
- [ ] Navigation is role-gated (Admin vs Parent)
- [ ] KPIs show accurate data
- [ ] Filters work (grade, status, subject)
- [ ] Search works
- [ ] Pull-to-refresh works
- [ ] Empty states display properly
- [ ] Loading states display properly
- [ ] Translations work (EN/VI)
- [ ] Detail screens load correctly
- [ ] No console errors or crashes

**Tester Name**: ___________________  
**Date**: ___________________  
**Result**: ✅ PASS / ❌ FAIL

---

**If all tests pass, screens are production-ready!** 🚀










