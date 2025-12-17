# Tuto School Web Dashboard

## Overview
A comprehensive bilingual (English/Vietnamese) web dashboard for the Tuto Education Platform - a unified management hub for schools, parents, and teachers.

## Features

### 🎨 Design System
- **Primary Blue**: #0B5FFF
- **Accent Indigo**: #6366F1
- **Background Light**: #F9FAFC
- **Background Dark**: #0F172A
- **Fonts**: Inter/Poppins

### 🌍 Bilingual Support
- Full English/Vietnamese translations throughout
- Language toggle in top navigation
- Context-aware translations using `useLanguage()` hook

### 🌓 Theme Support
- Light and dark mode
- Theme toggle in top bar
- Consistent styling across themes

### 👥 Role-Based Views
- **Admin View**: Full CRUD access, analytics, school-level controls
- **Parent View**: Read-only for most data, can message teachers, view progress

## Project Structure

```
/components
├── dashboard/
│   ├── DashboardLayout.tsx         # Main layout with sidebar & top bar
│   ├── StatsCard.tsx               # Reusable stats card component
│   ├── AIInsightPanel.tsx          # AI insights display component
│   └── screens/
│       ├── SchoolDashboardScreen.tsx    # Main overview with stats & charts
│       ├── AnnouncementsScreen.tsx      # Announcements management
│       ├── MessagesScreen.tsx           # Messaging system
│       ├── AttendanceScreen.tsx         # Attendance tracking
│       ├── HomeworkScreen.tsx           # Homework management
│       ├── PaymentsScreen.tsx           # Payment & finance tracking
│       ├── SettingsScreen.tsx           # User settings
│       └── ComingSoonScreen.tsx         # Placeholder for future features
├── SchoolDashboard.tsx             # Main dashboard component
├── LanguageContext.tsx             # Language management
└── LanguageToggle.tsx              # Language switcher component
```

## Implemented Screens

### ✅ Fully Implemented
1. **School Dashboard** - Overview with stats cards, charts, announcements, messages, homework widgets
2. **Announcements** - Search, filter, create, and view announcements with priority levels
3. **Messages** - Inbox/Sent/Unread tabs, compose, reply, forward
4. **Attendance** - Calendar view, class filter, status tracking (Present/Absent/Late)
5. **Homework** - Assignment management, AI difficulty analysis, submission tracking
6. **Payments** - Finance dashboard, transaction list, payment distribution charts
7. **Settings** - Profile, notifications, appearance, integrations

### 🔜 Coming Soon (Placeholder Screens)
8. Daily Activities - Timeline of daily school activities
9. Photo Albums - School photos and event galleries
10. Classes - Class roster management
11. Teachers - Teacher profiles and assignments
12. Progress Reports - Student academic progress tracking
13. Events - School events calendar
14. Health & Medicine - Health records and medication tracking
15. Extracurricular - Sports, clubs, after-school programs

## Key Components

### DashboardLayout
Main layout component providing:
- Sticky left sidebar navigation
- Top bar with school selector, search, notifications, profile, theme toggle, language toggle
- Responsive design (collapsible sidebar on mobile)
- Footer with Tuto branding

### StatsCard
Reusable card for displaying key metrics:
- Icon, title, value
- Optional subtitle and trend indicator
- Hover effects

### AIInsightPanel
Display AI-powered insights:
- Gradient background
- Sparkle icon
- "Coming Soon" badge support
- List of insights with bullet points

## Navigation

Access different screens by:
1. Using the sidebar menu
2. Clicking on widgets in the dashboard
3. Programmatically via `setCurrentScreen()` in SchoolDashboard

## Data Integration

Currently using **mock data** for demonstration. The system is designed to integrate with:
- **Airtable** (sync badge shown in top bar)
- **Future integrations**: Google Classroom, Stripe, Twilio, Firebase

## Charts & Visualizations

Using **Recharts** library for:
- Bar charts (attendance overview)
- Line charts (trends)
- Pie charts (distribution)
- Interactive chart type switching

## Bilingual Translation Pattern

Use the `useLanguage()` hook:

```tsx
const { t } = useLanguage();

// Usage
<h1>{t("English Text", "Văn bản Tiếng Việt")}</h1>
```

## Responsive Design

- **Desktop-first** approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Collapsible sidebar on mobile
- Grid layouts adapt to screen size

## Theme Switching

Theme state managed in:
1. `DashboardLayout` - local state for dashboard
2. `SettingsScreen` - user preferences

Toggle dark mode by adding/removing `dark` class on `documentElement`.

## Getting Started

1. App opens to the School Dashboard by default
2. Navigate using sidebar menu
3. Switch language using top bar toggle
4. Switch theme using moon/sun icon
5. Switch roles (Admin/Parent) via profile dropdown

## Customization

To add a new screen:
1. Create screen component in `/components/dashboard/screens/`
2. Add to exports in `/components/dashboard/screens/index.ts`
3. Import in `SchoolDashboard.tsx`
4. Add case in `renderScreen()` switch statement
5. Add menu item in `DashboardLayout` sidebar

## Technologies Used

- **React** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Shadcn/UI** - Component library
- **Recharts** - Charts and graphs
- **Lucide React** - Icons
- **Sonner** - Toast notifications

## Notes

- All screens use consistent spacing and card layouts
- Tables use Shadcn Table component
- Forms use Shadcn Input, Select, Textarea components
- Modals use Shadcn Dialog component
- Tabs use Shadcn Tabs component
- All components follow Tuto brand colors and design language
