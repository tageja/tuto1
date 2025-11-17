# Figma Prompt — Tuto School Web Dashboard (Admin + Parent, EN/VI, Light/Dark)

Paste the prompt below into Figma Make/AI to generate the design system, components, and all frames.

```
Design a bilingual (EN / VI) “Tuto School Web Dashboard (Admin + Parent)” with light/dark themes and a modern SaaS admin style aligned to the Tuto mobile app. Generate all screens and reusable components on an organized Figma page, ready for developer handoff.

1) Brand & Visual Language
- Product: Tuto — learn • connect • grow
- Tone: modern, professional, friendly; rounded cards, soft shadows, subtle gradients; corporate-clean dashboard
- Fonts: Inter (preferred) or Poppins; weights 500–700
- Color palette:
  - Primary Blue: #0B5FFF
  - Accent Indigo: #6366F1
  - Background Light: #F9FAFC
  - Background Dark: #0F172A
  - Neutrals: #E5E7EB, #F3F4F6; dark neutral: #1E293B
- Icon set: Material Icons (24px nav default, 20px inline)
- Grid: Desktop-first responsive; 12-col with 24px gutters, max width 1200–1280px; tablet ≥768px
- Elevation: subtle soft shadows on cards; rounded corners (12px default)

2) Design Tokens (create Variables + Styles; light/dark modes)
- Color
  - light.bg: #F9FAFC; light.surface: #FFFFFF; light.text.primary: #111827; light.text.secondary: #6B7280; light.border: #E5E7EB; light.primary: #0B5FFF; light.accent: #6366F1; light.info: #3B82F6; light.success: #16A34A; light.warning: #F59E0B; light.error: #DC2626
  - dark.bg: #0F172A; dark.surface: #1E293B; dark.text.primary: #F8FAFC; dark.text.secondary: #CBD5E1; dark.border: #334155; dark.primary: #3B82F6; dark.accent: #6366F1; dark.info: #60A5FA; dark.success: #22C55E; dark.warning: #F59E0B; dark.error: #F87171
- Spacing: 8, 16, 24, 32
- Radius: sm 8, md 12 (default), lg 16, xl 24
- Typography styles: Header (24/700), Subtitle (20/600), Body (16/500), Caption (12/500)
- Shadows: card/low, card/med, card/high (soft admin feel)

3) Core Layout & Navigation
- Left sidebar (sticky): icons + labels; Tuto logo + tagline pinned at bottom (“learn • connect • grow”)
- Top bar: school selector dropdown, search bar, notification bell, profile avatar, language toggle (EN/VI), theme toggle (Light/Dark), Airtable “Synced 2 min ago” badge
- Footer: compact © Tuto — learn • connect — grow
- Sidebar (Admin): Dashboard, Daily Activities, Announcements, Messages, Photo Albums, Classes, Teachers, Attendance, Homework, Progress Reports, Events, Payments, Health, Extracurricular, Settings
- Sidebar (Parent): Dashboard, Messages & Announcements, Attendance, Progress, Homework & Exercises, Payments, Health, Library & Stories (Coming Soon), Settings

4) Reusable Components (make Figma components + variants)
- NavSidebar [role: Admin|Parent, active/hover]
- TopBar [search|sync|lang|theme toggles]
- StatsCard [tone: default|success|warning|error; props: title|value|delta|icon]
- ChartWidget [type: bar|line|pie; legend; tooltips]
- AnnouncementCard [priority: Normal|High|Urgent; status: Published|Draft|Expired; date; badges]
- MessageCard [folder: Inbox|Sent|Unread; priority; preview]
- TableRow [columns config: classes|events|payments|homework]
- AIInsightPanel [title, body, mini-chart; variant: Coming Soon]
- ModalWrapper [title, body, actions]
- Badge [info|success|warning|error|gray]
- Pill [filters]
- SearchBar [with icon, clear]
- CalendarHeader [month selector]
- ProgressSubjectCard [current, previous, trend]
- AlbumTile [cover, privacy: Public|Private|Class; status]
- AttendancePill [Present|Absent|Late colors]
- EmptyState [icon, title, subtitle, CTA?]
- Tabs [primary, compact]
- Pagination
- Button [primary|secondary|outline|ghost; sm|md|lg]
- Toggle [light/dark]
- LanguageToggle [EN/VI]

5) Pages / Frames (use tokens; create Light + Dark where noted)
A) Admin Dashboard (Light + Dark)
- Hero header: school name/logo/date
- KPI StatsCards: Total Students, Active Teachers, Attendance Rate, Upcoming Events, Fee Collection Progress, Average Rating
- Interactive chart area (switch bar/line/pie)
- Announcements (latest 3)
- Messages (unread + previews)
- Upcoming homework list (title, class, due date)
- AI Insights: predicted attendance trend + adaptive learning summary; “Coming Soon” where future
- Footer

B) Parent Dashboard (Light)
- Overview: child summary cards, upcoming homework, attendance snapshot, payment summary, messages/announcements
- Language toggle and read-only affordances

C) Access & Setup (Admin)
- School Invitation: form (generate link/code), validation, loading, success/error; onboarding illustration
- School Selection: joined schools cards (Switch/Leave), “Join another school” card

D) Communications
- Announcements: filters All/Active/Urgent/Expired; search; cards with date/subject/description; priority colors; detail modal (full text + attachments)
- Messages: tabs Inbox/Sent/Unread; search; two-pane (list + preview); Compose popup (rich-text)

E) Daily Activities Timeline
- Today/Upcoming timeline; cards with title, status pill (ongoing/completed), teacher tag, time; hover details; detail popup

F) Media / Photo Albums
- Grid of albums (cover thumbnails), privacy badge; filters All/Recent/Events/Class
- AlbumDetail: gallery grid with lightbox viewer

G) Roster Management
- Classes: table (Class, Grade, Teacher, Schedule, Students count) + “Add Class”
- Teachers: search + filters (subject/rating); card grid (avatar, subject tags, experience, rating); profile modal (schedule, reviews)

H) Attendance
- Calendar top (month selector); colored dots/pills for Present/Absent/Late; summary bar with percentages
- Table by student/class

I) Homework + Progress + Payments
- Homework: table (Subject, Class, Due Date, Status); AI Difficulty Analysis (bar chart); HomeworkDetail modal; “Adaptive Exercises” grid (Coming Soon)
- Progress: tabs 3/6/12 months; subject cards with trend bars + comparison line; AI Performance Insight summary; Export (PDF/CSV)
- Payments: fee collection chart (paid/pending/overdue), transaction list with status badges; “Send Reminder” (Admin) + Payment summary card (Parent)

J) Events
- Table or card grid; filters All/School/Class/Competitions/Workshops; status pills; location tags

K) Health & Medicine
- Health records list (type/date/doctor/desc)
- Medicine reminders (dosage/time/status toggle)

L) Coming Soon Modules
- Adaptive Homework + Library & Resources: ghosted cards, “Coming Soon” badges

6) Roles & Access Visuals
- Admin: CRUD affordances, edit icons, upload actions, analytics filters
- Parent: read-only; can message teachers; view progress/payments/events/homework previews

7) Interactivity & Prototype
- Clickable nav; hover states; active item styling
- Charts with tooltips
- Popups: details, compose, view full
- Search, filters, toggles visible
- Language toggle: show EN/VI labels
- Theme toggle: wire to variable modes

8) Data Placeholders (Airtable-aligned)
- Seed realistic sample data for students, teachers, attendance (Present/Absent/Late), fees (paid/pending/overdue), homework (status), announcements (priority), messages (folders), events, health, medicine, extracurricular
- Show “Synced 2 min ago” in top bar

9) Organization
- Pages:
  - 01 Design System (tokens, styles, components)
  - 02 Admin Dashboard (Light)
  - 03 Admin Dashboard (Dark)
  - 04 Parent Dashboard (Light)
  - 05 Access & Setup (Invitation, Selection)
  - 06 Communications (Announcements, Messages + Compose)
  - 07 Daily Activities
  - 08 Photo Albums (+ Detail)
  - 09 Roster (Classes, Teachers)
  - 10 Attendance
  - 11 Homework
  - 12 Progress & Reports
  - 13 Payments
  - 14 Events
  - 15 Health & Medicine
  - 16 Coming Soon (Adaptive Homework, Library)
  - 17 Settings / Profile
- Use Auto Layout, constraints, semantic layer names, component variants, and accessibility (contrast, focus, touch targets)
```

## How to Use
- In Figma, open your file → Make/Generate with AI → paste the prompt → run.
- Share the file key afterwards; we’ll bind variable modes and tweak component variants via MCP.













