# Admin Dashboard - Airtable Integration Audit

**Page**: `/school/admin` (Main Dashboard Overview)  
**File**: `apps/dashboard/app/school/admin/page.tsx`  
**Status**: ⚠️ Partially Connected - 6/10 tables integrated

---

## 📊 **Dashboard Components Breakdown**

### **6 KPI Cards at the Top**

| KPI Card | Current Status | Table Required | Fields Needed | Integration Status |
|----------|---------------|----------------|---------------|-------------------|
| **Total Students** | ✅ CONNECTED | `TutoSchoolStudents` | `School Name`, `Status` | ✅ Real count from Airtable |
| **Active Teachers** | ✅ CONNECTED | `TutoSchoolTeachers` | `School Name`, `Status` | ✅ Real count from Airtable |
| **Attendance Rate** | ✅ CONNECTED | `TutoAttendanceRecords` | `School Name`, `Status`, `Date` | ✅ Real % calculated |
| **Upcoming Events** | ✅ CONNECTED | `TutoSchoolEvents` | `School Name`, `Status` | ✅ Real count from Airtable |
| **Fee Collection** | ✅ CONNECTED | `TutoSchoolPayments` | `School Name`, `Amount` | ✅ Real sum from Airtable |
| **Average Rating** | ❌ HARDCODED | `TutoSchoolTeachers` | `Rating` field | ❌ Shows "4.8" static value |

### **3 Main Content Sections**

| Section | Current Status | Table Required | Integration Status | Notes |
|---------|---------------|----------------|-------------------|-------|
| **Student Enrollment Trend Chart** | ❌ DEMO DATA | `TutoSchoolStudents` | ❌ Random chart data | Need historical student counts by month |
| **Recent Announcements** | ✅ CONNECTED | `TutoAnnouncements` | ✅ Top 3 from Airtable | Shows real announcement titles & content |
| **Unread Messages** | ❌ HARDCODED | `TutoMessages` | ❌ Sample messages only | Not querying database at all |

### **3 Secondary Cards**

| Card | Current Status | Table Required | Integration Status | Notes |
|------|---------------|----------------|-------------------|-------|
| **Unread Messages** | ❌ HARDCODED | `TutoMessages` | ❌ Static sample data | Should query where `Status != 'Read'` |
| **Upcoming Homework** | ❌ HARDCODED | `TutoHomeworkAssignments` | ❌ Static sample data | Should query where `Due Date >= TODAY` |
| **AI Insights** | ❌ HARDCODED | N/A (AI prediction) | ❌ Static "96.2%" value | Future: ML model or keep static |

---

## 🔍 **Detailed Analysis**

### **✅ What's Working (6 tables connected)**

#### **1. TutoSchoolStudents** ✅

**Current Implementation** (lines 10-19, 39):
```typescript
const students = await getSchoolStudents(schoolId);
const totalStudents = students.length;
// Displays: "2" or actual count
```

**Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoSchoolStudents
?filterByFormula={School Name}='Sunrise International School'
```

**Fields Retrieved**:
```json
{
  "fields": {
    "Student Name": "Emily Chen",
    "School Name": "Sunrise International School",
    "Class Name": "Grade 5A",
    "Status": "Active",
    "Parent Email": "parent@example.com",
    "Grade Level": "5",
    "Enrollment Date": "2025-08-01"
  }
}
```

**What's Used**: Just `.length` for count  
**What's NOT Used**: Status filtering, Enrollment Date (for trend)

---

#### **2. TutoSchoolTeachers** ✅

**Current Implementation** (lines 10-19, 43):
```typescript
const teachers = await getSchoolTeachers(schoolId);
const activeTeachers = teachers.filter(t => t.fields.Status === 'Active').length;
// Displays: Count of active teachers
```

**Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoSchoolTeachers
?filterByFormula={School Name}='Sunrise International School'
```

**Fields Retrieved**:
```json
{
  "fields": {
    "Teacher Name": "Mrs. Emily Johnson",
    "School Name": "Sunrise International School",
    "Status": "Active",
    "Position": "Math Teacher",
    "Email": "ejohnson@school.edu",
    "Phone": "+1 555-1234",
    "Experience Years": 10,
    "Rating": 4.8
  }
}
```

**What's Used**: `Status` for filtering count  
**What's NOT Used**: `Rating` field (should calculate average!)

---

#### **3. TutoAttendanceRecords** ✅

**Current Implementation** (lines 10-22, 50-55):
```typescript
const attendance = await getAttendanceRecords(schoolId);
const presentToday = attendance.filter(a => a.fields.Status === 'Present').length;
const attendanceRate = Math.round((presentToday / attendance.length) * 100);
// Displays: "95%" or calculated rate
```

**Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoAttendanceRecords
?filterByFormula={School Name}='Sunrise International School'
```

**Fields Retrieved**:
```json
{
  "fields": {
    "School Name": "Sunrise International School",
    "Student Name": "Emily Chen",
    "Class Name": "Grade 5A",
    "Date": "2025-10-24",
    "Status": "Present",
    "Arrival Time": "8:05 AM"
  }
}
```

**What's Used**: `Status` to count Present  
**What's NOT Used**: Date filtering (should filter to TODAY only)

---

#### **4. TutoSchoolEvents** ✅

**Current Implementation** (lines 10-19, 57-62):
```typescript
const events = await getSchoolEvents(schoolId);
const upcomingEvents = events.filter(e => 
  e.fields.Status === 'Scheduled' || 
  e.fields.Status === 'In Progress'
).length;
// Displays: Count of upcoming events
```

**Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoSchoolEvents
?filterByFormula={School Name}='Sunrise International School'
```

**Fields Retrieved**:
```json
{
  "fields": {
    "Event Title": "Annual Sports Day",
    "School Name": "Sunrise International School",
    "Status": "Scheduled",
    "Start Date": "2025-11-15",
    "Event Type": "School",
    "Location": "Main Sports Field"
  }
}
```

**What's Used**: `Status` to filter upcoming  
**What's NOT Used**: `Start Date` (should filter where >= TODAY)

---

#### **5. TutoSchoolPayments** ✅

**Current Implementation** (lines 10-24, 64-68):
```typescript
const payments = await getSchoolPayments(schoolId);
const totalCollection = payments.reduce((sum, p) => 
  sum + (p.fields.Amount || 0), 0
);
// Displays: "$640K" or actual sum
```

**Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoSchoolPayments
?filterByFormula={School Name}='Sunrise International School'
```

**Fields Retrieved**:
```json
{
  "fields": {
    "School Name": "Sunrise International School",
    "Student Name": "Emily Chen",
    "Amount": 1200,
    "Status": "Paid",
    "Payment Type": "Tuition Fee",
    "Due Date": "2025-10-01",
    "Payment Date": "2025-09-28"
  }
}
```

**What's Used**: `Amount` for sum  
**What's NOT Used**: `Status` to separate Paid/Pending/Overdue

---

#### **6. TutoAnnouncements** ✅

**Current Implementation** (lines 10-121):
```typescript
const announcements = await getAnnouncements(schoolId);
// Display top 3
announcements.slice(0, 3).map((announcement) => (
  <div>
    <h4>{announcement.fields['Announcement Title']}</h4>
    <p>{announcement.fields.Content}</p>
    <span>{announcement.fields.Priority}</span>
  </div>
))
```

**Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoAnnouncements
?filterByFormula={School Name}='Sunrise International School'
```

**Fields Retrieved**:
```json
{
  "fields": {
    "Announcement Title": "Parent-Teacher Conference",
    "School Name": "Sunrise International School",
    "Content": "Parent-teacher conferences will be...",
    "Priority": "High",
    "Status": "Published",
    "Publish Date": "2025-10-25"
  }
}
```

**What's Used**: Title, Content, Priority  
**What's NOT Used**: Status filter (should show Published only), Date sorting

---

## ❌ **What's Missing (4 critical integrations)**

### **7. TutoSchools** ❌ **NOT CONNECTED**

**Should Be Used For**:
- School name (header: line 30)
- School logo/branding
- School address
- Principal information
- Contact details

**Current State**:
```typescript
// Line 8 - HARDCODED
const schoolId = 'Sunrise International School';

// Line 30 - HARDCODED
<h1>Sunrise International School</h1>
```

**Should Be**:
```typescript
const schoolDetails = await getSchoolDetails(schoolId);

<div className="flex items-center gap-4">
  {schoolDetails.logo && <img src={schoolDetails.logo} alt={schoolDetails.name} />}
  <div>
    <h1>{schoolDetails.name}</h1>
    <p>{schoolDetails.address}</p>
  </div>
</div>
```

**Required Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoSchools
?filterByFormula={School Name}='Sunrise International School'
```

**Expected Response**:
```json
{
  "records": [{
    "fields": {
      "School Name": "Sunrise International School",
      "School Code": "SIS001",
      "Address": "123 Education Street, Hanoi",
      "Phone": "+84 24 1234 5678",
      "Email": "info@sunrise.edu.vn",
      "Principal Name": "Dr. Nguyen Van A",
      "School Type": "International",
      "Student Count": 144,
      "Teacher Count": 12,
      "Status": "Active"
    }
  }]
}
```

---

### **8. TutoMessages** ❌ **NOT CONNECTED**

**Should Be Used For**:
- Unread Messages section (lines 126-144)
- Show actual messages from database

**Current State** (lines 132-143):
```typescript
// HARDCODED SAMPLE DATA
<div className="p-3 bg-gray-50 rounded-lg">
  <p className="text-sm font-medium">Ms. Sarah Johnson</p>
  <p className="text-xs text-gray-600 mt-1">Math homework clarification needed</p>
  <p className="text-xs text-gray-400 mt-1">2h ago</p>
</div>
```

**Should Be**:
```typescript
const unreadMessages = await getMessages(currentUserId, schoolId);
const unreadCount = unreadMessages.filter(m => m.fields.Status !== 'Read').length;

{unreadMessages.slice(0, 3).map(message => (
  <div key={message.id}>
    <p>{message.fields['From User']}</p>
    <p>{message.fields['Message Subject']}</p>
    <p>{formatTimeAgo(message.fields['Sent Date'])}</p>
  </div>
))}
```

**Required Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoMessages
?filterByFormula=AND(
  {School Name}='Sunrise International School',
  {To User}='currentUserId',
  {Status}!='Read'
)
&sort[0][field]=Sent Date
&sort[0][direction]=desc
&maxRecords=3
```

**Expected Response**:
```json
{
  "records": [{
    "fields": {
      "Message Subject": "Math homework clarification",
      "School Name": "Sunrise International School",
      "From User": "teacher@school.edu",
      "From Role": "Teacher",
      "To User": "admin@school.edu",
      "To Role": "Admin",
      "Message Content": "Hi! I wanted to clarify...",
      "Priority": "Normal",
      "Status": "Sent",
      "Sent Date": "2025-10-27T10:30:00.000Z"
    }
  }]
}
```

---

### **9. TutoHomeworkAssignments** ❌ **NOT CONNECTED**

**Should Be Used For**:
- Upcoming Homework section (lines 146-167)
- Show assignments due soon across all classes

**Current State** (lines 151-166):
```typescript
// HARDCODED SAMPLE DATA
<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
  <div>
    <p className="text-sm font-medium">Math Problem Set 3.2</p>
    <p className="text-xs text-gray-600">Grade 5A</p>
  </div>
  <span className="text-xs text-gray-500">Oct 26</span>
</div>
```

**Should Be**:
```typescript
const upcomingHomework = await getUpcomingHomework(schoolId);

{upcomingHomework.slice(0, 3).map(hw => (
  <div key={hw.id}>
    <p>{hw.fields['Assignment Title']}</p>
    <p>{hw.fields['Class Name']}</p>
    <span>{hw.fields['Due Date']}</span>
  </div>
))}
```

**Required Airtable Query**:
```javascript
GET /v0/{BASE_ID}/TutoHomeworkAssignments
?filterByFormula=AND(
  {School Name}='Sunrise International School',
  IS_AFTER({Due Date}, TODAY())
)
&sort[0][field]=Due Date
&sort[0][direction]=asc
&maxRecords=3
```

**Expected Response**:
```json
{
  "records": [{
    "fields": {
      "Assignment Title": "Math Problem Set 3.2",
      "School Name": "Sunrise International School",
      "Class Name": "Grade 5A",
      "Subject": "Mathematics",
      "Due Date": "2025-10-27",
      "Status": "Active",
      "Total Students": 24,
      "Submitted Count": 8
    }
  }]
}
```

---

### **10. Historical Student Data** ❌ **NOT CONNECTED**

**Should Be Used For**:
- Student Enrollment Trend chart (lines 82-95)
- Show enrollment growth over 6 months

**Current State** (lines 84-94):
```typescript
// RANDOM DEMO DATA
{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, i) => {
  const height = 50 + Math.random() * 50; // RANDOM!
  return <div style={{ height: `${height}%` }}></div>
})}
```

**Should Be**:
```typescript
const enrollmentTrend = await getEnrollmentTrend(schoolId, 6); // Last 6 months

{enrollmentTrend.map(monthData => (
  <div style={{ height: `${(monthData.count / maxCount) * 100}%` }}>
    <span>{monthData.count}</span>
  </div>
))}
```

**Options for Implementation**:

**Option A**: Use `TutoSchoolStudents.Created Date` field
```javascript
// Query students created in each month
// Group by month, count per month
```

**Option B**: Create new table `TutoEnrollmentHistory`
```json
{
  "fields": {
    "School Name": "Sunrise International School",
    "Month": "2025-10",
    "Total Students": 144,
    "New Enrollments": 8,
    "Withdrawals": 2
  }
}
```

**Option C**: Calculate on-the-fly from `Created Date`
```typescript
// Group students by enrollment month
// Count students per month
// Return array of { month, count }
```

---

## 📋 **Missing Table: TutoSchools**

### **Critical Issue**: School information is hardcoded

**Current Problem** (line 8):
```typescript
const schoolId = 'Sunrise International School'; // HARDCODED!
```

**Should Get From**:
```typescript
// From SchoolContext (user's selected school)
const { selectedSchool } = useSchool();
const schoolId = selectedSchool?.id || selectedSchool?.name;

// THEN fetch school details from TutoSchools
const schoolDetails = await getSchoolDetails(schoolId);
```

**TutoSchools Table Structure** (from DATA_DICTIONARY.md):
```
Fields:
- School Name (primary identifier)
- School Code (unique code)
- Address (full address)
- Phone (contact number)
- Email (admin email)
- Website (school website)
- Principal Name
- Principal Email
- Principal Phone
- School Type (Public/Private/International)
- Grade Levels (Pre-K through 12)
- Student Count
- Teacher Count
- Founded Year
- Status (Active/Inactive/Pending)
- Created Date
- Updated Date
```

**Should Add Function** to `data.ts`:
```typescript
export async function getSchoolDetails(schoolId: string) {
  const url = buildUrl('TutoSchools', `{School Name}='${schoolId}'`);
  const response = await fetch(url, { headers, cache: 'no-store' });
  const data = await response.json();
  return data.records?.[0] || null;
}
```

---

## 🎯 **Summary of Gaps**

### **Connected (6 tables)** ✅
1. ✅ TutoSchoolStudents - Total count only
2. ✅ TutoSchoolTeachers - Active count only (Rating field not used!)
3. ✅ TutoAttendanceRecords - Attendance rate
4. ✅ TutoSchoolEvents - Upcoming count
5. ✅ TutoSchoolPayments - Total collection sum
6. ✅ TutoAnnouncements - Recent 3 announcements

### **Not Connected (4 critical gaps)** ❌
7. ❌ TutoSchools - School details, logo, contact info
8. ❌ TutoMessages - Unread messages (using sample data)
9. ❌ TutoHomeworkAssignments - Upcoming homework (using sample data)
10. ❌ Historical enrollment data - Trend chart (random data)

### **Calculation Issues** ⚠️
- ⚠️ Average Rating: Should calculate from `TutoSchoolTeachers.Rating` field
- ⚠️ Attendance Rate: Should filter by TODAY's date, not all records
- ⚠️ Trend Values: "+5.2%", "+2.1%" etc. are hardcoded

---

## 🛠️ **Recommended Fixes (Step-by-Step)**

### **Priority 1: Critical Missing Data**
1. Connect `TutoSchools` for school details
2. Connect `TutoMessages` for real unread messages
3. Connect `TutoHomeworkAssignments` for real upcoming homework

### **Priority 2: Improve Existing Connections**
4. Calculate Average Rating from teachers
5. Add date filtering for attendance (TODAY only)
6. Add proper sorting for announcements (recent first)

### **Priority 3: Advanced Features**
7. Calculate real trend percentages (month-over-month)
8. Build enrollment trend from historical data
9. Add real-time unread count badge

---

## 📝 **Next Steps**

I can now fix these issues step-by-step. Would you like me to:

**Step 1**: Add the missing 3 tables (Schools, Messages, Homework)?  
**Step 2**: Improve existing calculations (Average Rating, Today's Attendance)?  
**Step 3**: Add trend calculations and historical data?  

Or would you prefer to review the other pages first (Classes, Attendance, Events, etc.) before we enhance the main dashboard?

**Your choice - I'm ready to implement! 🚀**



