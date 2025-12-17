# Mobile Teachers Screen - Implementation Summary

**Last Updated:** December 9, 2025

## Overview
Dual-view teachers management screen for mobile app with complete Supabase integration, modern Material Design UI, and full bilingual support (EN/VI).

## Views

### Parent View (`TeachersScreen.tsx`)
- **Access:** Parent role only
- **Data Source:** `getParentTeachers()` - filters teachers by child's classes
- **Features:**
  - Search by name/subject
  - View active teachers only
  - Pull-to-refresh
  - No KPIs (parent-friendly)
- **Navigation:** Taps navigate to `TeacherDetail` screen

### Admin View (`AdminTeachersScreen.tsx`)
- **Access:** Admin role only
- **Data Source:** `getTeachers()` with full filtering
- **Features:**
  - 4 KPI cards (Total, Active, On Leave, Avg Rating)
  - Search by name/email
  - Filter by status (All/Active/On Leave)
  - Filter by subject (dynamic from data)
  - Pagination (20 per page)
  - Pull-to-refresh
- **Navigation:** Taps navigate to `TeacherDetail` screen

## Components Used
- `TeacherListItem` - Card with avatar, name, qualifications, subject chips, status badge, contact info
- `KpiRow` - Horizontal scrollable KPI cards
- `FilterChips` - Status and subject filters

## Translation Features
- **Dynamic Status Translation:** "Active" → "Đang hoạt động", "On Leave" → "Nghỉ phép"
- **Dynamic Subject Translation:** 15 subjects (English → Tiếng Anh, Geography → Địa lý, etc.)
- **UI Labels:** All screen text, placeholders, and empty states fully bilingual

## Data Flow
```
Screen → supabase-teachers.ts → Supabase school_teachers table
       ↓
  Display: Header + [KPIs (admin only)] + Search + Filters + Teacher Cards
```

## Technical Stack
- **Service:** `src/services/supabase-teachers.ts`
- **Screens:** `src/screens/school/TeachersScreen.tsx`, `AdminTeachersScreen.tsx`
- **Components:** `TeacherListItem`, `KpiRow`, `KpiCard`, `FilterChips`
- **Translations:** `src/translations/index.ts` (school.teachers.*, school.subjects.*)
- **Database:** Supabase `school_teachers` table

## Key Features
✅ Real-time Supabase data  
✅ Role-based views (Parent vs Admin)  
✅ Full search & filtering  
✅ 100% bilingual (EN/VI)  
✅ Material Design cards  
✅ Pull-to-refresh  
✅ Pagination (admin)  
✅ Zero web dashboard impact






