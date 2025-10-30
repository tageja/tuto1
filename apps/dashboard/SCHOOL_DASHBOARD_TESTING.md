# School Dashboard - Testing Guide

## ✅ Issue Fixed
The "page not found" error has been resolved. The missing `/school/page.tsx` file has been created.

---

## 🧪 Testing Instructions

### 1. Start the Development Server
```bash
cd apps/dashboard
npm run dev
```
Server should start on `http://localhost:3001` (or 3000)

### 2. Navigate to School Dashboard

**From Homepage:**
1. Open `http://localhost:3001/`
2. Click "School Dashboard" in the header navigation
3. You should be redirected to `/school`

**Direct Access:**
- Navigate directly to `http://localhost:3001/school`

### 3. Expected Behavior

#### If User is NOT Authenticated:
- Should redirect to `/login`

#### If User is Authenticated:
1. **Role Detection**: System checks if user is admin or parent
2. **Schools List**: Fetches available schools from Airtable
3. **School Selector**: Shows grid of schools to select
4. **Dashboard Redirect**: After selection, redirects to:
   - `/school/admin` for admin users
   - `/school/parent` for parent users

### 4. Test All Routes

#### Admin Routes (Access as School Admin/Teacher)
```
✅ /school/admin - Dashboard Overview
✅ /school/admin/classes - Classes Management
✅ /school/admin/daily-activities - Daily Activities Timeline
✅ /school/admin/attendance - Attendance Tracking
✅ /school/admin/events - Events Management
✅ /school/admin/payments - Payments Overview
✅ /school/admin/settings - Profile Settings
```

#### Parent Routes (Access as Parent)
```
✅ /school/parent - Dashboard Overview
✅ /school/parent/announcements - Announcements
✅ /school/parent/messages - Messages
✅ /school/parent/attendance - Student Attendance
✅ /school/parent/homework - Homework Tracking
✅ /school/parent/progress - Progress Reports
✅ /school/parent/events - Events
✅ /school/parent/payments - Payments
✅ /school/parent/settings - Profile Settings
```

### 5. Test Key Features

#### Multi-School Switching
1. If user has access to multiple schools
2. Click school dropdown in header
3. Select different school
4. Page should refresh with new school's data

#### Language Toggle
1. Click language toggle in header (EN/VI)
2. Text should switch between English and Vietnamese

#### Navigation
1. Click different menu items in sidebar
2. Pages should load smoothly
3. Active menu item should be highlighted

#### Responsive Design
1. Resize browser window
2. Layout should adapt to mobile/tablet/desktop
3. Sidebar should remain accessible

### 6. Data Display Testing

#### Check Data Loading
- KPI cards should display numbers
- Tables should show data rows
- Charts should render
- Empty states should show when no data

#### Check Sample Data
Most screens show sample/demo data for Phase 1:
- Admin Dashboard: Shows sample KPIs and charts
- Classes: Sample class cards
- Attendance: Sample student attendance table
- Events: Sample event cards
- Payments: Sample payment transactions
- Parent views: Sample student data

### 7. Phase 2 Features (Disabled)

All write operation buttons should be disabled with tooltip "Coming in Phase 2":
- "Add New Class" button
- "Create Event" button
- "Send Reminder" button
- "Compose" message button
- "Pay Now" button
- "Edit Profile" button
- All other create/edit/delete actions

---

## ⚠️ Common Issues & Solutions

### Issue: Still getting "page not found"
**Solution**: 
- Clear browser cache
- Restart dev server
- Check console for errors

### Issue: Role detection not working
**Solution**: 
- Check `.env` file has `AIRTABLE_PAT` and `AIRTABLE_BASE_ID`
- Verify user email exists in either:
  - `TutoSchoolTeachers` table (for admin role)
  - `TutoSchoolStudents` Parent Email field (for parent role)

### Issue: No schools showing up
**Solution**:
- Verify schools exist in Airtable
- Check API route `/api/school/user-schools` is accessible
- Check browser console for errors

### Issue: Redirecting back to home
**Solution**:
- User doesn't have school access
- Add user to `TutoSchoolTeachers` or link student to parent in `TutoSchoolStudents`

---

## 📋 Testing Checklist

### Route Access
- [ ] `/school` loads without "page not found" error
- [ ] Homepage "School Dashboard" link works
- [ ] Auth guard redirects unauthenticated users to login
- [ ] Role detection works (admin vs parent)
- [ ] School selector displays

### Admin Dashboard
- [ ] Admin dashboard overview loads
- [ ] All 7 admin pages accessible
- [ ] Sidebar navigation works
- [ ] KPI cards display
- [ ] Tables render
- [ ] Charts show

### Parent Dashboard
- [ ] Parent dashboard overview loads
- [ ] All 9 parent pages accessible
- [ ] Sidebar navigation works
- [ ] Student info displays
- [ ] KPI cards show
- [ ] Tables render

### Features
- [ ] School dropdown works
- [ ] Language toggle works (EN/VI)
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] No console errors
- [ ] No TypeScript errors

### Phase 2 Indicators
- [ ] Write operation buttons are disabled
- [ ] Tooltips show "Coming in Phase 2"
- [ ] Phase 2 notice banners display

---

## 🚀 Next Steps After Testing

1. **Configure Environment**
   - Set up `.env` with Airtable credentials
   - Configure Firebase authentication
   - Add test users to Airtable

2. **Test with Real Data**
   - Create test schools in Airtable
   - Add test students and teachers
   - Verify data displays correctly

3. **Plan Phase 2**
   - Review Phase 2 requirements in `docs/status/SCHOOL_DASHBOARD_STATUS.md`
   - Prioritize write operations
   - Plan implementation timeline

---

**Testing Status**: Ready for manual testing  
**Expected Result**: All routes accessible, data displays correctly, Phase 2 features properly disabled



