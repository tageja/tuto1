# School Tables Fields Creation Guide

## Overview
Since Airtable's API doesn't support programmatic field creation, you'll need to manually add the remaining fields to each of the 20 school tables. This guide provides step-by-step instructions for each table.

## How to Add Fields in Airtable
1. Open your Airtable base
2. Navigate to the table you want to modify
3. Click the "+" button next to the last column
4. Select the field type and configure it according to the specifications below
5. Repeat for each field

## Table 1: TutoSchools
**Primary Field:** Name (already exists)

**Additional Fields to Add:**
- **School Code** - Single line text
- **Address** - Long text
- **Phone** - Phone number
- **Email** - Email
- **Website** - URL
- **Principal Name** - Single line text
- **Principal Email** - Email
- **Principal Phone** - Phone number
- **School Type** - Single select (Options: Public, Private, International)
- **Grade Levels** - Multiple select (Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- **Student Count** - Number
- **Teacher Count** - Number
- **Founded Year** - Number
- **Status** - Single select (Options: Active, Inactive, Pending)
- **Created Date** - Date
- **Updated Date** - Date

## Table 2: TutoSchoolInvitations
**Primary Field:** Invitation Code (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Created By** - Single line text
- **Created Date** - Date
- **Expiry Date** - Date
- **Max Uses** - Number
- **Current Uses** - Number
- **Status** - Single select (Options: Active, Expired, Disabled)
- **Used By** - Multiple select (Options: Parent, Student, Teacher)

## Table 3: TutoSchoolClasses
**Primary Field:** Class Name (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Grade Level** - Single select (Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- **Academic Year** - Single line text
- **Class Teacher** - Link to another record (TutoSchoolTeachers)
- **Student Count** - Number
- **Schedule** - Long text
- **Room Number** - Single line text
- **Status** - Single select (Options: Active, Inactive)
- **Created Date** - Date

## Table 4: TutoSchoolStudents
**Primary Field:** Student Name (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Class ID** - Link to another record (TutoSchoolClasses)
- **Class Name** - Single line text
- **Student ID** - Single line text
- **Date of Birth** - Date
- **Gender** - Single select (Options: Male, Female, Other)
- **Grade Level** - Single select (Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- **Parent Name** - Single line text
- **Parent Email** - Email
- **Parent Phone** - Phone number
- **Address** - Long text
- **Emergency Contact** - Single line text
- **Emergency Phone** - Phone number
- **Medical Notes** - Long text
- **Status** - Single select (Options: Active, Inactive, Graduated)
- **Enrollment Date** - Date
- **Created Date** - Date

## Table 5: TutoSchoolTeachers
**Primary Field:** Teacher Name (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Email** - Email
- **Phone** - Phone number
- **Position** - Single select (Options: Teacher, Principal, Vice Principal, Admin, Specialist)
- **Subjects** - Multiple select (Options: Math, Science, English, History, Geography, Art, Music, PE, Technology, Language)
- **Grade Levels** - Multiple select (Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- **Experience Years** - Number
- **Education** - Long text
- **Bio** - Long text
- **Profile Picture** - Multiple attachments
- **Status** - Single select (Options: Active, Inactive, On Leave)
- **Hire Date** - Date
- **Created Date** - Date

## Table 6: TutoDailyActivities
**Primary Field:** Activity Title (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Class ID** - Link to another record (TutoSchoolClasses)
- **Class Name** - Single line text
- **Date** - Date
- **Activity Type** - Single select (Options: Academic, Sports, Arts, Field Trip, Assembly, Other)
- **Description** - Long text
- **Location** - Single line text
- **Start Time** - Date & time
- **End Time** - Date & time
- **Teacher** - Link to another record (TutoSchoolTeachers)
- **Students Present** - Number
- **Photos** - Multiple attachments
- **Notes** - Long text
- **Status** - Single select (Options: Planned, Completed, Cancelled)
- **Created Date** - Date

## Table 7: TutoMessages
**Primary Field:** Message Subject (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **From User** - Single line text
- **From Role** - Single select (Options: Teacher, Parent, Student, Admin)
- **To User** - Single line text
- **To Role** - Single select (Options: Teacher, Parent, Student, Admin)
- **Message Content** - Long text
- **Priority** - Single select (Options: Low, Medium, High, Urgent)
- **Status** - Single select (Options: Sent, Delivered, Read, Archived)
- **Sent Date** - Date & time
- **Read Date** - Date & time
- **Attachments** - Multiple attachments
- **Created Date** - Date

## Table 8: TutoAbsenceRequests
**Primary Field:** Request ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Student ID** - Link to another record (TutoSchoolStudents)
- **Student Name** - Single line text
- **Parent Name** - Single line text
- **Request Type** - Single select (Options: Sick Leave, Personal Leave, Emergency, Other)
- **Start Date** - Date
- **End Date** - Date
- **Reason** - Long text
- **Supporting Documents** - Multiple attachments
- **Status** - Single select (Options: Pending, Approved, Rejected)
- **Approved By** - Single line text
- **Approval Date** - Date
- **Notes** - Long text
- **Created Date** - Date

## Table 9: TutoAnnouncements
**Primary Field:** Announcement Title (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Content** - Long text
- **Category** - Single select (Options: General, Academic, Sports, Events, Emergency)
- **Target Audience** - Multiple select (Options: All, Parents, Students, Teachers, Specific Class)
- **Priority** - Single select (Options: Low, Medium, High, Urgent)
- **Publish Date** - Date
- **Expiry Date** - Date
- **Author** - Single line text
- **Attachments** - Multiple attachments
- **Status** - Single select (Options: Draft, Published, Archived)
- **Created Date** - Date

## Table 10: TutoHealthRecords
**Primary Field:** Record ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Student ID** - Link to another record (TutoSchoolStudents)
- **Student Name** - Single line text
- **Record Type** - Single select (Options: Medical Checkup, Vaccination, Allergy, Medication, Emergency)
- **Date** - Date
- **Description** - Long text
- **Doctor Name** - Single line text
- **Hospital/Clinic** - Single line text
- **Documents** - Multiple attachments
- **Allergies** - Multiple select (Options: None, Peanuts, Dairy, Gluten, Latex, Other)
- **Medications** - Long text
- **Emergency Contact** - Single line text
- **Emergency Phone** - Phone number
- **Notes** - Long text
- **Created Date** - Date

## Table 11: TutoMedicineReminders
**Primary Field:** Reminder ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Student ID** - Link to another record (TutoSchoolStudents)
- **Student Name** - Single line text
- **Medicine Name** - Single line text
- **Dosage** - Single line text
- **Frequency** - Single select (Options: Once Daily, Twice Daily, Three Times Daily, As Needed)
- **Time** - Date & time
- **Start Date** - Date
- **End Date** - Date
- **Instructions** - Long text
- **Administered By** - Single line text
- **Status** - Single select (Options: Active, Completed, Cancelled)
- **Notes** - Long text
- **Created Date** - Date

## Table 12: TutoPhotoAlbums
**Primary Field:** Album Title (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Event Type** - Single select (Options: Class Activity, School Event, Field Trip, Sports, Graduation, Other)
- **Date** - Date
- **Description** - Long text
- **Photos** - Multiple attachments
- **Class ID** - Link to another record (TutoSchoolClasses)
- **Class Name** - Single line text
- **Teacher** - Link to another record (TutoSchoolTeachers)
- **Privacy** - Single select (Options: Public, Private, Parents Only)
- **Status** - Single select (Options: Active, Archived)
- **Created Date** - Date

## Table 13: TutoExtracurricularActivities
**Primary Field:** Activity Name (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Activity Type** - Single select (Options: Sports, Arts, Music, Drama, Science, Technology, Language, Other)
- **Description** - Long text
- **Teacher** - Link to another record (TutoSchoolTeachers)
- **Schedule** - Long text
- **Location** - Single line text
- **Max Students** - Number
- **Current Students** - Number
- **Grade Levels** - Multiple select (Options: Pre-K, K, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
- **Fee** - Currency
- **Status** - Single select (Options: Active, Inactive, Full)
- **Start Date** - Date
- **End Date** - Date
- **Created Date** - Date

## Table 14: TutoSurveys
**Primary Field:** Survey Title (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Survey Type** - Single select (Options: Parent Feedback, Student Feedback, Teacher Feedback, General)
- **Description** - Long text
- **Questions** - Long text
- **Target Audience** - Multiple select (Options: All, Parents, Students, Teachers, Specific Class)
- **Start Date** - Date
- **End Date** - Date
- **Responses** - Number
- **Status** - Single select (Options: Draft, Active, Closed, Archived)
- **Created By** - Single line text
- **Created Date** - Date

## Table 15: TutoSchoolPayments
**Primary Field:** Payment ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Student ID** - Link to another record (TutoSchoolStudents)
- **Student Name** - Single line text
- **Parent Name** - Single line text
- **Payment Type** - Single select (Options: Tuition, Extracurricular, Lunch, Transportation, Other)
- **Amount** - Currency
- **Due Date** - Date
- **Payment Date** - Date
- **Payment Method** - Single select (Options: Cash, Bank Transfer, Credit Card, Online)
- **Status** - Single select (Options: Pending, Paid, Overdue, Cancelled)
- **Receipt** - Multiple attachments
- **Notes** - Long text
- **Created Date** - Date

## Table 16: TutoSubscriptions
**Primary Field:** Subscription ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Plan Name** - Single select (Options: Basic, Standard, Premium, Enterprise)
- **Features** - Multiple select (Options: Daily Activities, Messages, Health Records, Photo Albums, Payments, Analytics)
- **Monthly Price** - Currency
- **Annual Price** - Currency
- **Start Date** - Date
- **End Date** - Date
- **Status** - Single select (Options: Active, Expired, Cancelled)
- **Payment Status** - Single select (Options: Paid, Pending, Overdue)
- **Next Billing Date** - Date
- **Notes** - Long text
- **Created Date** - Date

## Table 17: TutoSchoolEvents
**Primary Field:** Event Title (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Event Type** - Single select (Options: Academic, Sports, Cultural, Parent Meeting, Holiday, Other)
- **Description** - Long text
- **Start Date** - Date
- **End Date** - Date
- **Start Time** - Date & time
- **End Time** - Date & time
- **Location** - Single line text
- **Organizer** - Single line text
- **Target Audience** - Multiple select (Options: All, Parents, Students, Teachers, Specific Class)
- **Registration Required** - Checkbox
- **Max Attendees** - Number
- **Current Attendees** - Number
- **Status** - Single select (Options: Upcoming, Ongoing, Completed, Cancelled)
- **Created Date** - Date

## Table 18: TutoHomeworkAssignments
**Primary Field:** Assignment Title (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Class ID** - Link to another record (TutoSchoolClasses)
- **Class Name** - Single line text
- **Subject** - Single select (Options: Math, Science, English, History, Geography, Art, Music, PE)
- **Teacher** - Link to another record (TutoSchoolTeachers)
- **Description** - Long text
- **Due Date** - Date
- **Attachments** - Multiple attachments
- **Total Students** - Number
- **Submitted Count** - Number
- **Status** - Single select (Options: Active, Due, Completed, Overdue)
- **Created Date** - Date

## Table 19: TutoProgressReports
**Primary Field:** Report ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Student ID** - Link to another record (TutoSchoolStudents)
- **Student Name** - Single line text
- **Class ID** - Link to another record (TutoSchoolClasses)
- **Class Name** - Single line text
- **Academic Year** - Single line text
- **Term** - Single select (Options: First Term, Second Term, Third Term, Final)
- **Subject** - Single select (Options: Math, Science, English, History, Geography, Art, Music, PE)
- **Grade** - Single line text
- **Percentage** - Number
- **Teacher Comments** - Long text
- **Parent Comments** - Long text
- **Report Date** - Date
- **Status** - Single select (Options: Draft, Published, Archived)
- **Created Date** - Date

## Table 20: TutoAttendanceRecords
**Primary Field:** Record ID (already exists)

**Additional Fields to Add:**
- **School ID** - Link to another record (TutoSchools)
- **School Name** - Single line text
- **Class ID** - Link to another record (TutoSchoolClasses)
- **Class Name** - Single line text
- **Date** - Date
- **Student ID** - Link to another record (TutoSchoolStudents)
- **Student Name** - Single line text
- **Status** - Single select (Options: Present, Absent, Late, Excused)
- **Arrival Time** - Date & time
- **Departure Time** - Date & time
- **Notes** - Long text
- **Recorded By** - Single line text
- **Created Date** - Date

## Important Notes

1. **Field Types**: Make sure to select the correct field type for each field as specified above.

2. **Single Select Options**: When creating single select fields, you'll need to add the options manually. Click "Add option" for each choice listed.

3. **Multiple Select Options**: Same as single select, but allows multiple selections.

4. **Link Fields**: For link fields, you'll need to select the target table from the dropdown.

5. **Currency Fields**: Set the currency to your preferred currency (USD, VND, etc.).

6. **Date & Time Fields**: These allow both date and time input.

7. **Multiple Attachments**: These allow file uploads (images, documents, etc.).

## Verification
After adding all fields, you can verify by:
1. Checking that each table has the correct number of fields
2. Testing that the field types work as expected
3. Running the data population script to ensure all fields are properly configured

## Next Steps
Once all fields are added, you can run:
```bash
npm run populate:school:data
```
This will populate the tables with sample data for testing.


