# Mobile Classes Screen - Implementation Summary

**Last Updated:** December 9, 2025

## Overview
Admin-only class management screen for mobile app with complete Supabase integration, modern Material Design UI, KPI metrics, and full bilingual support (EN/VI).

## View

### Admin View (`ClassesScreen.tsx`)
- **Access:** Admin role only
- **Data Source:** `getClasses()` with filtering and student counts
- **Features:**
  - 4 KPI cards (Total Classes, Active, Total Students, Capacity %)
  - Search by class name
  - Filter by grade (1-12, dynamic from data)
  - Results counter ("Showing X classes")
  - Pull-to-refresh
  - Student counts per class
  - Teacher assignments visible
- **Navigation:** Taps navigate to `ClassDetail` screen

## Components Used
- `ClassListItem` - Card with grade badge, class name, status, teacher, students count, room, capacity %
- `KpiRow` - Horizontal scrollable KPI cards
- `FilterChips` - Grade level filters

## Translation Features
- **Dynamic Labels:** All UI text translated (Teacher → Giáo viên, Students → Học sinh, Room → Phòng, Capacity → Sức chứa, View Details → Xem chi tiết)
- **KPIs:** Total Classes → Tổng số lớp, Active → Hoạt động, etc.
- **Filters:** All Grades → Tất cả khối
- **Empty States:** No Classes Found → Không tìm thấy lớp học

## Card Design
- **Grade Badge:** Color-coded by level (Green: 1-3, Yellow: 4-6, Red: 7-9, Purple: 10+)
- **Capacity Badge:** Color by utilization (Green <75%, Yellow 75-90%, Red >90%)
- **Info Rows:** Teacher name, student count, room number, capacity percentage
- **Status Indicator:** "Active" status pill

## Data Flow
```
ClassesScreen → supabase-classes.ts → Supabase school_classes + school_students
              ↓
  Display: Header + KPIs + Search + Grade Filter + "Showing X" + Class Cards
```

## Technical Stack
- **Service:** `src/services/supabase-classes.ts`
- **Screen:** `src/screens/school/ClassesScreen.tsx`
- **Components:** `ClassListItem`, `KpiRow`, `KpiCard`, `FilterChips`
- **Translations:** `src/translations/index.ts` (school.classes.*)
- **Database:** Supabase `school_classes` + `school_students` (joins for counts)

## Key Features
✅ Real-time Supabase data  
✅ Admin-only access  
✅ Full search & grade filtering  
✅ 100% bilingual (EN/VI)  
✅ Material Design cards with color-coded badges  
✅ Student count aggregation  
✅ Pull-to-refresh  
✅ Capacity utilization tracking  
✅ Zero web dashboard impact






