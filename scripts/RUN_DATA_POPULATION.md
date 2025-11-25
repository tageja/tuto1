# How to Populate Classes Page Data

**Script**: `scripts/airtable-template.ts`  
**Status**: ✅ Ready to run (PAT and BASE_ID already configured)

---

## 🚀 Run the Script (1 Command)

```bash
npx ts-node scripts/airtable-template.ts
```

**That's it!** The script will:
1. Create 1 school (Tuto Demo School)
2. Create 4 teachers
3. Create 6 classes (Grades 5-8)
4. Create 28 students across 3 classes
5. Create ~600 attendance records (last 30 days)

**Time**: ~2-3 minutes (due to rate limiting)

---

## 📊 What Will Be Created

### **1 School**
- Tuto Demo School
- Address, phone, email
- Principal name
- Status: Active

### **4 Teachers**
- Mrs. Tran Thi Lan (Math, Science) - Rating: 4.8
- Mr. Le Van Minh (English, Literature) - Rating: 4.6
- Ms. Pham Thi Hoa (Math, Physics) - Rating: 4.9
- Mr. Hoang Van Tuan (History, Geography) - Rating: 4.5
- All Active with experience and qualifications

### **6 Classes**
| Class | Grade | Students | Room | Schedule |
|-------|-------|----------|------|----------|
| Class 5A | 5 | 10 | R201 | Mon-Fri, 8:00-15:00 |
| Class 5B | 5 | 10 | R202 | Mon-Fri, 8:00-15:00 |
| Class 6A | 6 | 8 | R301 | Mon-Fri, 8:00-15:30 |
| Class 6B | 6 | 0 | R302 | Mon-Fri, 8:00-15:30 |
| Class 7A | 7 | 0 | R401 | Mon-Fri, 7:30-15:30 |
| Class 8A | 8 | 0 | R501 | Mon-Fri, 7:30-16:00 |

**Total**: 6 classes (3 with students, 3 empty for testing)

### **28 Students**
- **Class 5A**: 10 students (STU001-STU010)
  - Mix of male/female
  - Ages 10-11
  - All active with parent info
  
- **Class 5B**: 10 students (STU011-STU020)
  - Mix of male/female
  - Ages 10-11
  - All active with parent info
  
- **Class 6A**: 8 students (STU021-STU028)
  - Mix of male/female
  - Ages 12
  - All active with parent info

### **~600 Attendance Records**
- Last 30 days (weekdays only ~21 days)
- 28 students × 21 days = ~588 records
- Realistic attendance patterns:
  - Class 5A: 90% present rate
  - Class 5B: 85% present rate
  - Class 6A: 92% present rate
- Random absences and late arrivals

---

## ✅ What You'll See on Classes Page After Running

### **KPI Cards**
- **Total Classes**: 6
- **Total Students**: 28
- **Capacity Usage**: ~37% (28 students / 76 total capacity)
- **Avg Attendance**: ~89% (calculated from last 30 days)
- **Last Updated**: Current timestamp

### **Class List** (Grid View)
- 6 class cards showing:
  - Class name (5A, 5B, 6A, 6B, 7A, 8A)
  - Grade level badge
  - Room number
  - Student count / capacity
  - Status badge (All Active)
  - "View Details" button

### **Grade Filter**
- All Grades
- Grade 5 (2 classes)
- Grade 6 (2 classes)
- Grade 7 (1 class)
- Grade 8 (1 class)

### **Search**
- Try searching "5A" → 1 result
- Try searching "Class" → 6 results
- Try searching "6" → 2 results

### **Pagination**
- Page 1 showing all 6 classes (no pagination needed with only 6)

### **Class Detail View**
Click on **Class 5A** to see:
- **Mini KPIs**:
  - Students: 10
  - Present Today: (varies)
  - Last 7-Day Attendance: ~90%

- **Student Roster Table**:
  - 10 students with names, codes, DOB, gender
  - Sortable by name or code
  - Student codes clickable (STU001-STU010)
  - Ages displayed (10-11 years old)

---

## 🎯 Testing Checklist After Population

Open your Classes page and verify:

- [ ] KPI cards show: 6 classes, 28 students, ~37% capacity, ~89% attendance
- [ ] Grade filter has options: 5, 6, 7, 8
- [ ] Search "5A" finds Class 5A
- [ ] Click Class 5A shows 10 students in roster
- [ ] Student codes (STU001, etc.) are clickable
- [ ] Attendance data shows in detail view
- [ ] Last updated timestamp displays
- [ ] All text is in your selected language (EN/VI)

---

## ⚠️ Important Notes

### **School Name**
The script uses `schoolId = 'Tuto Demo School'`

Make sure your Classes page is filtering by this school name, or update the script to match your existing school name.

### **If You Already Have Data**
The script will:
- ✅ ADD new records (won't delete existing data)
- ✅ Create duplicate schools if same name exists
- ⚠️ May create duplicate students if you run multiple times

**To avoid duplicates**, you can:
1. Check existing data first: `await listRecords('TutoSchools')`
2. Or manually delete test data after testing
3. Or use unique identifiers

### **Rate Limiting**
The script includes:
- 250ms delay between batches
- Batches of 10 records max
- Total time: ~2-3 minutes

Don't interrupt the script while running!

---

## 🔧 Customization

Want to modify the test data? Edit the `populateClassesPageData()` function:

### **Change School Name**
Line 775:
```typescript
const schoolName = 'Your School Name Here';
```

### **Add More Students**
Copy the student creation block and modify:
```typescript
{
  fields: {
    'Student ID': 'STU029',
    'Student Name': 'New Student Name',
    'School Name': schoolName,
    'Class Name': class5A,  // Or class5B, class6A
    ...
  },
}
```

### **Add More Classes**
Copy a class creation block:
```typescript
{
  fields: {
    'Class Name': 'Class 9A',
    'School Name': schoolName,
    'Grade Level': '9',
    'Student Count': 30,
    ...
  },
}
```

### **Adjust Attendance Rates**
Line 1440, 1454, 1468:
```typescript
const isPresent = Math.random() > 0.1; // 90% present
// Change to > 0.2 for 80% present rate
```

---

## 🗑️ Clean Up Test Data (Optional)

If you want to remove test data later:

```typescript
// In main() function, uncomment:
await deleteRecords('TutoSchools', ['recXXXXXXXXXXXXXX']);
await deleteRecords('TutoSchoolClasses', ['recYYYYYYYYYYYYYY']);
// etc.
```

Or use Airtable UI to delete manually.

---

## 🎉 Ready to Run!

Your script is configured and ready. Just run:

```bash
npx ts-node scripts/airtable-template.ts
```

Watch the console output to see progress:
- ✅ School created
- ✅ Teachers created
- ✅ Classes created
- ✅ Students created (3 batches)
- ✅ Attendance records created (multiple batches)
- 🎉 Complete!

Then refresh your Classes page and see the data! 🚀

















