# 🏫 School Tables Creation Guide

## 📋 Overview

This guide will help you create 20 new tables in your existing Airtable base for the school management features. All tables will use `schoolId` for data isolation.

**Base ID:** `app34330Do0nm4qvM`  
**Total Tables to Create:** 20  
**Estimated Time:** 30-45 minutes

---

## 🚀 Quick Start

1. **Open Airtable**: Go to https://airtable.com and open your base
2. **Follow the table creation steps** below (one by one)
3. **Use the exact field names and types** specified
4. **Run the population script** after creating all tables

---

## 📊 Table 1: TutoSchools

**Purpose:** Store school information and settings

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| School Name | Single line text | Primary field |
| School Code | Single line text | Unique invitation code |
| Address | Long text | |
| Phone | Phone number | |
| Email | Email | |
| Website | URL | |
| Principal Name | Single line text | |
| Principal Email | Email | |
| Principal Phone | Phone number | |
| School Type | Single select | Options: Public, Private, International |
| Grade Levels | Multiple select | Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 |
| Student Count | Number | |
| Teacher Count | Number | |
| Founded Year | Number | |
| Status | Single select | Options: Active, Inactive, Pending |
| Created Date | Date | |
| Updated Date | Date | |

---

## 📊 Table 2: TutoSchoolInvitations

**Purpose:** Track school invitation codes and usage

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Invitation Code | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Created By | Single line text | |
| Created Date | Date | |
| Expiry Date | Date | |
| Max Uses | Number | |
| Current Uses | Number | |
| Status | Single select | Options: Active, Expired, Disabled |
| Used By | Multiple select | Options: Parent, Student, Teacher |

---

## 📊 Table 3: TutoSchoolClasses

**Purpose:** Store class information for each school

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Class Name | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Grade Level | Single select | Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 |
| Academic Year | Single line text | |
| Class Teacher | Link to another record | Link to TutoSchoolTeachers |
| Student Count | Number | |
| Schedule | Long text | |
| Room Number | Single line text | |
| Status | Single select | Options: Active, Inactive |
| Created Date | Date | |

---

## 📊 Table 4: TutoSchoolStudents

**Purpose:** Store student information for each school

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Student Name | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Class ID | Link to another record | Link to TutoSchoolClasses |
| Class Name | Single line text | |
| Student ID | Single line text | |
| Date of Birth | Date | |
| Gender | Single select | Options: Male, Female, Other |
| Grade Level | Single select | Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 |
| Parent Name | Single line text | |
| Parent Email | Email | |
| Parent Phone | Phone number | |
| Address | Long text | |
| Emergency Contact | Single line text | |
| Emergency Phone | Phone number | |
| Medical Notes | Long text | |
| Status | Single select | Options: Active, Inactive, Graduated |
| Enrollment Date | Date | |
| Created Date | Date | |

---

## 📊 Table 5: TutoSchoolTeachers

**Purpose:** Store teacher information for each school

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Teacher Name | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Email | Email | |
| Phone | Phone number | |
| Position | Single select | Options: Teacher, Principal, Vice Principal, Admin, Specialist |
| Subjects | Multiple select | Options: Math, Science, English, History, etc. |
| Grade Levels | Multiple select | Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 |
| Experience Years | Number | |
| Education | Long text | |
| Bio | Long text | |
| Profile Picture | Attachment | |
| Status | Single select | Options: Active, Inactive, On Leave |
| Hire Date | Date | |
| Created Date | Date | |

---

## 📊 Table 6: TutoDailyActivities

**Purpose:** Track daily activities and events for each class

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Activity Title | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Class ID | Link to another record | Link to TutoSchoolClasses |
| Class Name | Single line text | |
| Date | Date | |
| Activity Type | Single select | Options: Academic, Sports, Arts, Field Trip, Assembly, Other |
| Description | Long text | |
| Location | Single line text | |
| Start Time | Date | |
| End Time | Date | |
| Teacher | Link to another record | Link to TutoSchoolTeachers |
| Students Present | Number | |
| Photos | Attachment | |
| Notes | Long text | |
| Status | Single select | Options: Planned, Completed, Cancelled |
| Created Date | Date | |

---

## 📊 Table 7: TutoMessages

**Purpose:** Store messages between teachers, parents, and school admin

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Message Subject | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| From User | Single line text | |
| From Role | Single select | Options: Teacher, Parent, Student, Admin |
| To User | Single line text | |
| To Role | Single select | Options: Teacher, Parent, Student, Admin |
| Message Content | Long text | |
| Priority | Single select | Options: Low, Medium, High, Urgent |
| Status | Single select | Options: Sent, Delivered, Read, Archived |
| Sent Date | Date | |
| Read Date | Date | |
| Attachments | Attachment | |
| Created Date | Date | |

---

## 📊 Table 8: TutoAbsenceRequests

**Purpose:** Track student absence requests and approvals

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Request ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Student ID | Link to another record | Link to TutoSchoolStudents |
| Student Name | Single line text | |
| Parent Name | Single line text | |
| Request Type | Single select | Options: Sick Leave, Personal Leave, Emergency, Other |
| Start Date | Date | |
| End Date | Date | |
| Reason | Long text | |
| Supporting Documents | Attachment | |
| Status | Single select | Options: Pending, Approved, Rejected |
| Approved By | Single line text | |
| Approval Date | Date | |
| Notes | Long text | |
| Created Date | Date | |

---

## 📊 Table 9: TutoAnnouncements

**Purpose:** Store school announcements and notifications

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Announcement Title | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Content | Long text | |
| Category | Single select | Options: General, Academic, Sports, Events, Emergency |
| Target Audience | Multiple select | Options: All, Parents, Students, Teachers, Specific Class |
| Priority | Single select | Options: Low, Medium, High, Urgent |
| Publish Date | Date | |
| Expiry Date | Date | |
| Author | Single line text | |
| Attachments | Attachment | |
| Status | Single select | Options: Draft, Published, Archived |
| Created Date | Date | |

---

## 📊 Table 10: TutoHealthRecords

**Purpose:** Store student health information and medical records

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Record ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Student ID | Link to another record | Link to TutoSchoolStudents |
| Student Name | Single line text | |
| Record Type | Single select | Options: Medical Checkup, Vaccination, Allergy, Medication, Emergency |
| Date | Date | |
| Description | Long text | |
| Doctor Name | Single line text | |
| Hospital/Clinic | Single line text | |
| Documents | Attachment | |
| Allergies | Multiple select | Options: None, Peanuts, Dairy, Gluten, Latex, Other |
| Medications | Long text | |
| Emergency Contact | Single line text | |
| Emergency Phone | Phone number | |
| Notes | Long text | |
| Created Date | Date | |

---

## 📊 Table 11: TutoMedicineReminders

**Purpose:** Track medicine reminders for students

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Reminder ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Student ID | Link to another record | Link to TutoSchoolStudents |
| Student Name | Single line text | |
| Medicine Name | Single line text | |
| Dosage | Single line text | |
| Frequency | Single select | Options: Once Daily, Twice Daily, Three Times Daily, As Needed |
| Time | Date | |
| Start Date | Date | |
| End Date | Date | |
| Instructions | Long text | |
| Administered By | Single line text | |
| Status | Single select | Options: Active, Completed, Cancelled |
| Notes | Long text | |
| Created Date | Date | |

---

## 📊 Table 12: TutoPhotoAlbums

**Purpose:** Store photo albums for school events and activities

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Album Title | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Event Type | Single select | Options: Class Activity, School Event, Field Trip, Sports, Graduation, Other |
| Date | Date | |
| Description | Long text | |
| Photos | Attachment | |
| Class ID | Link to another record | Link to TutoSchoolClasses |
| Class Name | Single line text | |
| Teacher | Link to another record | Link to TutoSchoolTeachers |
| Privacy | Single select | Options: Public, Private, Parents Only |
| Status | Single select | Options: Active, Archived |
| Created Date | Date | |

---

## 📊 Table 13: TutoExtracurricularActivities

**Purpose:** Track extracurricular activities and clubs

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Activity Name | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Activity Type | Single select | Options: Sports, Arts, Music, Drama, Science, Technology, Language, Other |
| Description | Long text | |
| Teacher | Link to another record | Link to TutoSchoolTeachers |
| Schedule | Long text | |
| Location | Single line text | |
| Max Students | Number | |
| Current Students | Number | |
| Grade Levels | Multiple select | Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12 |
| Fee | Currency | |
| Status | Single select | Options: Active, Inactive, Full |
| Start Date | Date | |
| End Date | Date | |
| Created Date | Date | |

---

## 📊 Table 14: TutoSurveys

**Purpose:** Store surveys and feedback forms

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Survey Title | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Survey Type | Single select | Options: Parent Feedback, Student Feedback, Teacher Feedback, General |
| Description | Long text | |
| Questions | Long text | |
| Target Audience | Multiple select | Options: All, Parents, Students, Teachers, Specific Class |
| Start Date | Date | |
| End Date | Date | |
| Responses | Number | |
| Status | Single select | Options: Draft, Active, Closed, Archived |
| Created By | Single line text | |
| Created Date | Date | |

---

## 📊 Table 15: TutoSchoolPayments

**Purpose:** Track school payments and fees

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Payment ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Student ID | Link to another record | Link to TutoSchoolStudents |
| Student Name | Single line text | |
| Parent Name | Single line text | |
| Payment Type | Single select | Options: Tuition, Extracurricular, Lunch, Transportation, Other |
| Amount | Currency | |
| Due Date | Date | |
| Payment Date | Date | |
| Payment Method | Single select | Options: Cash, Bank Transfer, Credit Card, Online |
| Status | Single select | Options: Pending, Paid, Overdue, Cancelled |
| Receipt | Attachment | |
| Notes | Long text | |
| Created Date | Date | |

---

## 📊 Table 16: TutoSubscriptions

**Purpose:** Track school subscription plans and features

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Subscription ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Plan Name | Single select | Options: Basic, Standard, Premium, Enterprise |
| Features | Multiple select | Options: Daily Activities, Messages, Health Records, Photo Albums, Payments, Analytics |
| Monthly Price | Currency | |
| Annual Price | Currency | |
| Start Date | Date | |
| End Date | Date | |
| Status | Single select | Options: Active, Expired, Cancelled |
| Payment Status | Single select | Options: Paid, Pending, Overdue |
| Next Billing Date | Date | |
| Notes | Long text | |
| Created Date | Date | |

---

## 📊 Table 17: TutoSchoolEvents

**Purpose:** Track school events and calendar

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Event Title | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Event Type | Single select | Options: Academic, Sports, Cultural, Parent Meeting, Holiday, Other |
| Description | Long text | |
| Start Date | Date | |
| End Date | Date | |
| Start Time | Date | |
| End Time | Date | |
| Location | Single line text | |
| Organizer | Single line text | |
| Target Audience | Multiple select | Options: All, Parents, Students, Teachers, Specific Class |
| Registration Required | Checkbox | |
| Max Attendees | Number | |
| Current Attendees | Number | |
| Status | Single select | Options: Upcoming, Ongoing, Completed, Cancelled |
| Created Date | Date | |

---

## 📊 Table 18: TutoHomeworkAssignments

**Purpose:** Track homework assignments and submissions

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Assignment Title | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Class ID | Link to another record | Link to TutoSchoolClasses |
| Class Name | Single line text | |
| Subject | Single select | Options: Math, Science, English, History, Geography, Art, Music, PE |
| Teacher | Link to another record | Link to TutoSchoolTeachers |
| Description | Long text | |
| Due Date | Date | |
| Attachments | Attachment | |
| Total Students | Number | |
| Submitted Count | Number | |
| Status | Single select | Options: Active, Due, Completed, Overdue |
| Created Date | Date | |

---

## 📊 Table 19: TutoProgressReports

**Purpose:** Store student progress reports and grades

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Report ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Student ID | Link to another record | Link to TutoSchoolStudents |
| Student Name | Single line text | |
| Class ID | Link to another record | Link to TutoSchoolClasses |
| Class Name | Single line text | |
| Academic Year | Single line text | |
| Term | Single select | Options: First Term, Second Term, Third Term, Final |
| Subject | Single select | Options: Math, Science, English, History, Geography, Art, Music, PE |
| Grade | Single line text | |
| Percentage | Number | |
| Teacher Comments | Long text | |
| Parent Comments | Long text | |
| Report Date | Date | |
| Status | Single select | Options: Draft, Published, Archived |
| Created Date | Date | |

---

## 📊 Table 20: TutoAttendanceRecords

**Purpose:** Track daily student attendance

### Fields to Create:

| Field Name | Type | Options/Notes |
|------------|------|---------------|
| Record ID | Single line text | Primary field |
| School ID | Link to another record | Link to TutoSchools |
| School Name | Single line text | |
| Class ID | Link to another record | Link to TutoSchoolClasses |
| Class Name | Single line text | |
| Date | Date | |
| Student ID | Link to another record | Link to TutoSchoolStudents |
| Student Name | Single line text | |
| Status | Single select | Options: Present, Absent, Late, Excused |
| Arrival Time | Date | |
| Departure Time | Date | |
| Notes | Long text | |
| Recorded By | Single line text | |
| Created Date | Date | |

---

## 🎯 Next Steps After Creating Tables

1. **Run the population script** to add sample data:
   ```bash
   npm run populate:school:data
   ```

2. **Test the connection** to verify tables are accessible:
   ```bash
   node scripts/test-school-tables.js
   ```

3. **Start using the school features** in the app!

---

## 📝 Tips for Table Creation

- **Copy-paste field names** exactly as shown
- **Set field types** carefully - they affect data validation
- **Create tables in order** - some tables reference others
- **Use the exact options** for single/multiple select fields
- **Don't worry about data** - the population script will add sample data

---

## 🆘 Need Help?

If you encounter any issues:
1. Check that field names match exactly
2. Verify field types are correct
3. Ensure linked fields point to the right tables
4. Contact support if problems persist

**Good luck with table creation! 🚀**


