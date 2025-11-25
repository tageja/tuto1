# Events Feature QA Log

**Date**: 2025-01-XX  
**Feature**: Events Management (Admin + Parent)

## Implementation Summary

✅ **Schema & Migration**
- Created `school_events` table with full schema
- Created `event_registrations` table with capacity/waitlist support
- Updated `school_notifications` to include 'event' type
- Applied RLS policies for Admin and Parent roles
- Migration applied successfully via MCP

✅ **API Routes**
- GET `/api/school/events` - List with filters, KPIs, role-based filtering
- POST `/api/school/events` - Create event (Admin)
- GET `/api/school/events/[eventId]` - Get event detail
- PATCH `/api/school/events/[eventId]` - Update event (Admin)
- DELETE `/api/school/events/[eventId]` - Delete event (Admin)
- GET `/api/school/events/[eventId]/registrations` - List registrations (Admin)
- POST `/api/school/events/[eventId]/register` - Register child (Parent)
- POST `/api/school/events/[eventId]/unregister` - Unregister child (Parent)

✅ **UI Components**
- EventsKpis - Fetches and displays KPIs with filters
- EventsFilters - Tabs, search, month selector, category filters
- EventCard - Displays event info with role-based actions
- AdminEventActions - Status badge and actions
- CreateEditEventModal - Full create/edit form
- EventDetailDrawer - Detailed event view
- RegistrationsPanel - Admin registrations list with CSV export

✅ **Pages**
- Admin Events Page - Full CRUD, filters, KPIs, registrations management
- Parent Events Page - View events, register/unregister, filters, child selector

✅ **i18n**
- Added EN/VI translations for all events strings
- Categories, statuses, form labels, actions, errors, toasts

✅ **Notifications**
- Created on event publish (status change to 'published')
- Audience scope: 'School' or 'Classes' based on class_id

✅ **Seed Data**
- Created student "Mung Tageja" in Class 5A
- Linked parent tarun.tageja@gmail.com to student
- Created 7 events across all categories
- Created 5 registrations (Mung registered for 3 events)

## Manual QA Checklist

### Admin Features
- [ ] Tabs filter correctly (All, School, Class, Competitions, etc.)
- [ ] KPIs update with filters/search/month
- [ ] Create Event modal works
- [ ] Draft events not visible to parent
- [ ] Publish makes event visible to parent
- [ ] Edit event works
- [ ] Delete event works
- [ ] View Details opens drawer
- [ ] Manage opens registrations panel
- [ ] CSV export downloads correctly
- [ ] Parent note visible on cards

### Parent Features
- [ ] Tabs filter correctly (All, Registered, Upcoming)
- [ ] Register button works
- [ ] Unregister button works
- [ ] Capacity enforcement works (full events show "Full")
- [ ] Waitlist logic works (when capacity reached)
- [ ] Registration status shows on cards (Registered/Waitlisted)
- [ ] Parent note visible on cards
- [ ] Optimistic updates work
- [ ] Toasts show on actions
- [ ] Child selector works (if multiple children)

### Data & RLS
- [ ] Admin can see all events in school
- [ ] Parent can only see published events
- [ ] Parent can only see class events if child is in that class
- [ ] Parent can only register their own children
- [ ] Notifications created on publish
- [ ] Timezone Asia/Ho_Chi_Minh respected

### i18n
- [ ] EN/VI toggle works
- [ ] All strings translated

## Known Issues / Notes

1. Notification on registration: Removed individual registration notifications as event publish notifications already cover this
2. Parent registration query: Uses `get_user_child_student_ids()` which may need verification with actual auth context
3. Timezone: All dates stored as timestamptz, display formatting should use Asia/Ho_Chi_Minh

## Next Steps

1. Manual testing of all acceptance criteria
2. Verify RLS policies with actual user sessions
3. Test capacity/waitlist edge cases
4. Verify notification delivery
5. Test i18n switching

