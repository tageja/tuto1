# Mobile School Screens — Overview and Implemented Features

This document enumerates all School-related screens in the mobile app (`src/screens/**`) and summarizes their implemented functionality and Airtable data dependencies.

## Access & Setup
- SchoolInvitationScreen
  - Join via invitation code with validation, loading, success/error alerts
  - Navigates to School Dashboard on success; skip to Home supported
- SchoolSelectionScreen
  - Lists joined schools; switch/remove; CTA to join another school

## Dashboard
- SchoolDashboardScreen
  - Quick actions: Daily Activities, Messages, Announcements, Photo Albums, Teachers, Classes, Attendance, and more
  - Loads: `TutoDailyActivities` (recent), `TutoAnnouncements` (published), `TutoMessages` (unread count)
  - Pull-to-refresh; leave-school flow; i18n; links to detail screens

## Communications
- AnnouncementsScreen + AnnouncementDetailScreen
  - Fetch/filter/search; filters All/Active/Urgent/Expired; priority/status badges; detail modal screen
- MessagesScreen + MessageDetailScreen
  - Fetch/filter/search; folders All/Inbox/Sent/Unread; priority badge; status icon; detail screen
  - Compose/add routes referenced (UI not yet implemented)

## Daily Activities
- DailyActivitiesScreen + ActivityDetailScreen
  - Fetch/sort; filters All/Today/Upcoming; status pills; detail screen

## Media
- PhotoAlbumsScreen + AlbumDetailScreen
  - Grid with filters All/Recent/Events/Class; privacy/status badges; gallery detail with photos

## Roster
- ClassesScreen
  - Table-like list: class name, grade, teacher, schedule, students count
- TeachersScreen
  - Search and filter by name/subjects; avatar, subjects, rating

## Attendance
- AttendanceScreen
  - Calendar top (CalendarList); date-based fetch; status pills (Present/Absent/Late)

## Academic
- HomeworkScreen
  - Table-like list with subject, class, due date, status
- ProgressScreen
  - 3/6/12 month tabs; subject cards with current/previous/trend; monthly averages; respects enabled subjects via `TutoStudentSubjectOverrides` / `TutoClassSubjects`

## Events
- EventsScreen
  - List with type, location, date range, status pill; search/filter

## Payments
- PaymentsScreen
  - Finance list with status pill; due/paid dates; amount

## Health & Medicine
- HealthScreen
  - Health records list (type/date/desc)
- MedicineScreen
  - Reminders (dosage/time/status)

## Extracurricular
- ActivitiesScreen
  - List with activity type, schedule, location, status

## Airtable Tables Referenced (non‑exhaustive)
- `TutoDailyActivities`, `TutoAnnouncements`, `TutoMessages`, `TutoPhotoAlbums`,
  `TutoSchoolClasses`, `TutoSchoolTeachers`, `TutoAttendanceRecords` (or school attendance table),
  `TutoSchoolHomework`, `TutoSchoolProgressReports`, `TutoStudentSubjectOverrides`, `TutoClassSubjects`,
  `TutoSchoolEvents`, `TutoSchoolPayments`, `TutoHealthRecords`, `TutoMedicineReminders`, `TutoExtracurricularActivities`

## Notes
- All screens use `SchoolHeader`, MaterialIcons, theme tokens, search/filters, loading and empty states
- Data access via `useAirtable`; guarded by `useSchool` current school
- Some “add/compose” routes are declared but form UIs are not yet implemented



















