# Tuto Mobile School Dashboard

A comprehensive mobile-native UI implementation for the Tuto bilingual education platform's School Dashboard (PaaS).

## 📱 Overview

The mobile dashboard provides a fully responsive, touch-optimized experience for managing school operations on mobile devices. It maintains complete design consistency with the desktop dashboard while optimizing for mobile interaction patterns.

## 🎨 Design System

### Theme & Colors
- **Primary Color**: `#0B5FFF` (Tuto Blue)
- **Accent Color**: `#6366F1` (Indigo)
- **Dark Color**: `#0E1C36` (Navy)
- **Background**: `#F9FAFC` (Light Gray)
- **Typography**: Inter/Poppins fonts from globals.css
- **Dark Mode**: Full support with automatic theme switching

### Mobile Frame
- **Dimensions**: 390×844px (standard mobile)
- **Layout**: Vertical scroll, bottom navigation
- **Touch Targets**: Minimum 44px for all interactive elements

## 📂 Project Structure

```
/components/mobile/
├── index.ts                          # Main export file
├── MobileSchoolDashboard.tsx         # Main container with screen routing
├── MobileDashboardLayout.tsx         # Layout with top bar + bottom nav
│
├── Mobile UI Components:
├── MobileStatsCard.tsx               # Mobile-optimized stats display
├── AnnouncementCard.tsx              # Announcement list item
├── AttendanceListItem.tsx            # Attendance record item
├── HomeworkCard.tsx                  # Homework assignment card
├── MessagesListItem.tsx              # Message inbox item
├── PaymentCard.tsx                   # Payment transaction card
├── InsightSection.tsx                # Collapsible AI insights
│
└── /screens/
    ├── index.ts                      # Screen exports
    ├── MobileSchoolDashboardScreen.tsx    # Home/Overview screen
    ├── MobileAnnouncementsScreen.tsx      # Announcements feed
    ├── MobileAttendanceScreen.tsx         # Attendance tracking
    ├── MobileHomeworkScreen.tsx           # Homework management
    ├── MobileMessagesScreen.tsx           # Messaging system
    ├── MobilePaymentsScreen.tsx           # Finance & payments
    ├── MobileSettingsScreen.tsx           # Settings & preferences
    └── MobileComingSoonScreen.tsx         # Placeholder for future features
```

## 🔧 Components

### Core Components

#### 1. **MobileDashboardLayout**
Main layout wrapper with:
- Fixed top bar with menu, school selector, notifications, language toggle
- Side drawer menu with full navigation
- Bottom navigation bar (4 primary actions)
- Sync status indicator
- User profile display

#### 2. **MobileStatsCard**
Compact statistics display featuring:
- Icon with colored background
- Value with optional trend indicator
- Subtitle support
- Background color variants for different states

#### 3. **AnnouncementCard**
Announcement list item with:
- Priority badge (high/medium/low)
- Truncated description (2 lines max)
- Author and date metadata
- Active touch feedback

#### 4. **AttendanceListItem**
Attendance record display with:
- Status indicator dot (green/yellow/red)
- Student name and class
- Check-in time
- Color-coded badges

#### 5. **HomeworkCard**
Assignment card showing:
- Subject with icon
- Class name
- Due date
- Status badge (pending/completed/graded)
- Description preview

#### 6. **MessagesListItem**
Message inbox item with:
- Sender avatar
- Subject and preview
- Unread indicator
- High priority badge
- Timestamp

#### 7. **PaymentCard**
Payment transaction display:
- Student info
- Payment type and amount
- Status indicator (paid/pending/overdue)
- Payment method
- Color-coded backgrounds

#### 8. **InsightSection**
Collapsible AI insights panel:
- Expandable/collapsible interface
- Bullet-point insights
- "Coming Soon" badge support
- Gradient background

## 📱 Screens

### 1. Mobile School Dashboard (Home)
**Route**: `dashboard`

**Features**:
- Hero header with school name and date
- Academic year badge
- 4 quick stats cards (Students, Teachers, Attendance, Fee Collection)
- Weekly attendance chart (Recharts bar chart)
- Latest announcements preview (2 items)
- Upcoming homework preview (2 items)
- AI Insights sections (collapsible)

**Components Used**: MobileStatsCard, AnnouncementCard, HomeworkCard, InsightSection

---

### 2. Mobile Announcements
**Route**: `announcements`

**Features**:
- Search bar for filtering
- Tab filters (All/Active/Urgent/Expired)
- Feed of announcement cards
- Detail sheet with full description
- Attachment support
- Priority badges
- Mark as read action

**Components Used**: AnnouncementCard, Sheet for details

---

### 3. Mobile Attendance
**Route**: `attendance`

**Features**:
- Summary stats (Present/Late/Absent/Total)
- Date picker (calendar sheet)
- Class filter (bottom sheet)
- Attendance list with status indicators
- Export report button
- Quick attendance marking CTA

**Components Used**: MobileStatsCard, AttendanceListItem, Calendar, Sheet

---

### 4. Mobile Homework
**Route**: `homework`

**Features**:
- Status summary (Pending/Completed/Graded)
- Status tabs for filtering
- Class filter (bottom sheet)
- Homework cards with descriptions
- Empty state handling
- Quick action buttons (New Assignment, Grade Work)

**Components Used**: HomeworkCard, Tabs, Sheet

---

### 5. Mobile Messages
**Route**: `messages`

**Features**:
- Two-view system: Inbox list → Thread view
- Search functionality
- Unread message count
- Message preview cards
- Full message thread with reply box
- Compose new message (bottom sheet)
- Priority indicators
- Avatar displays

**Components Used**: MessagesListItem, Avatar, Sheet, Textarea

---

### 6. Mobile Payments
**Route**: `payments`

**Features**:
- Financial summary cards (Revenue/Pending/Overdue)
- Payment distribution pie chart
- Status filter tabs
- Class filter (bottom sheet)
- Transaction list with payment cards
- Integration CTA with provider badges
- Export functionality

**Components Used**: MobileStatsCard, PaymentCard, PieChart, Tabs

---

### 7. Mobile Settings
**Route**: `settings`

**Features**:
- Profile card with user info and role badges
- Grouped settings sections:
  - Account (Profile, School Info, Security)
  - Preferences (Language, Dark Mode, Notifications)
  - Support (Help Center, About, Privacy)
- Toggle switches for boolean settings
- Navigation items with chevron indicators
- Logout button
- App version info

**Components Used**: Avatar, Switch, Sheet

---

### 8. Mobile Coming Soon
**Route**: `activities`, `albums`, `classes`, `teachers`, `progress`, `events`, `health`, `extracurricular`

**Features**:
- Customizable icon, title, description
- "Coming Soon" badge
- Feature highlights list
- Notify me CTA
- Expected launch timeline
- Stay updated info panel

**Props**:
- `title?: string`
- `description?: string`
- `icon?: React.ElementType`

---

## 🌐 Bilingual Support

All screens support Vietnamese/English localization using the `useLanguage` hook:

```tsx
const { t } = useLanguage();
t("English text", "Vietnamese text")
```

**Key Translations**:
- Navigation labels
- Screen titles
- Button text
- Form labels
- Status indicators
- Empty states

## 🎯 Navigation Structure

### Bottom Navigation (Primary)
1. **Home** (`dashboard`) - Dashboard overview
2. **News** (`announcements`) - Announcements feed
3. **Messages** (`messages`) - Messaging (with unread badge)
4. **Attendance** (`attendance`) - Attendance tracking

### Side Menu (Full Navigation)
- Dashboard
- Announcements
- Messages
- Attendance
- Homework
- Payments
- Settings

## 🔄 State Management

Each screen manages its own local state:
- Filter selections (class, date, status)
- Search queries
- Selected items (for detail views)
- Modal/sheet open states
- Tab selections

## 📊 Data Integration

All screens use mock data that matches the structure of desktop screens. Ready for integration with:
- Airtable API
- Supabase backend
- Real-time data sources

## 🎨 UI/UX Patterns

### Interaction Patterns
- **Active Scale**: Buttons scale to 95-98% on press
- **Ripple Effects**: Built-in via Shadcn components
- **Swipe Gestures**: Sheet components support swipe-to-close
- **Pull to Refresh**: Can be added to list views

### Mobile-Optimized Features
- **Bottom Sheets**: Used for filters, calendars, compose forms
- **Expandable Cards**: Tap to view full details
- **Sticky Headers**: Top bar remains fixed on scroll
- **Touch Targets**: All buttons ≥44px
- **Overflow Handling**: Line clamps and horizontal scrolling where needed

### Accessibility
- **ARIA Labels**: Screen reader support
- **Color Contrast**: WCAG AA compliant
- **Keyboard Navigation**: Full support
- **Focus States**: Visible focus indicators

## 🚀 Usage

### Basic Integration

```tsx
import { MobileSchoolDashboard } from './components/mobile/MobileSchoolDashboard';

function App() {
  return <MobileSchoolDashboard />;
}
```

### With AppNavigator

```tsx
import { useState } from 'react';
import { MobileSchoolDashboard } from './components/mobile/MobileSchoolDashboard';

function App() {
  const [screen, setScreen] = useState<'desktop' | 'mobile'>('mobile');
  
  return (
    <>
      {screen === 'mobile' && <MobileSchoolDashboard />}
      {screen === 'desktop' && <SchoolDashboard />}
    </>
  );
}
```

## 🎨 Theming

The mobile dashboard inherits all theme tokens from `/styles/globals.css`:

- CSS variables for colors
- Typography scales
- Border radius values
- Shadow definitions

Dark mode is toggled via:
```tsx
document.documentElement.classList.toggle('dark')
```

## 📦 Dependencies

**Core:**
- React
- Tailwind CSS v4.0

**UI Components (Shadcn):**
- Button, Card, Badge, Avatar
- Sheet, Tabs, Switch
- Input, Textarea, Select
- Calendar, Dialog

**Charts:**
- Recharts (BarChart, PieChart)

**Icons:**
- Lucide React

## 🔮 Future Enhancements

### Planned Features
- [ ] Pull-to-refresh functionality
- [ ] Offline mode with service workers
- [ ] Push notification support
- [ ] Biometric authentication
- [ ] Camera integration for QR codes
- [ ] File upload for assignments
- [ ] Real-time chat messaging
- [ ] Parent-teacher video calls
- [ ] Student health check-in
- [ ] Photo gallery with albums

### Coming Soon Screens
All "Coming Soon" screens are placeholders for:
- Daily Activities tracking
- Photo Albums management
- Classes roster management
- Teachers directory
- Progress Reports & analytics
- Events calendar
- Health Records system
- Extracurricular activities

## 📝 Best Practices

1. **Component Reusability**: All card components are reusable across screens
2. **Consistent Spacing**: Use Tailwind spacing scale (4px increments)
3. **Color Usage**: Use semantic colors from theme
4. **Touch Feedback**: Always provide visual feedback on interactions
5. **Loading States**: Add skeleton loaders for data fetching
6. **Error Handling**: Show friendly error messages with retry options
7. **Empty States**: Provide clear messaging when no data exists

## 🐛 Troubleshooting

**Issue**: Bottom nav overlapping content
- **Solution**: Ensure main content has `pb-16` padding

**Issue**: Sheet not opening on mobile
- **Solution**: Check z-index stacking context

**Issue**: Charts not rendering
- **Solution**: Ensure ResponsiveContainer has explicit height

**Issue**: Dark mode not persisting
- **Solution**: Implement localStorage for theme preference

## 📄 License

Part of the Tuto Education Platform
© 2025 Tuto • learn • connect • grow
