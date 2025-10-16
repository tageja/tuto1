# TutoApp Feature Backlog (Pre‑Launch)

This document tracks all outstanding features, fixes, and recommendations. We will strike items with ~strikethrough~ when completed, but never delete them.

Legend: [H] High priority, [M] Medium, [L] Low

## Global / Cross‑Cutting
- [H] Likes persistence and integrity
  - Persist per‑user likes across sessions (AsyncStorage). ~Client persistence implemented in `AirtableService.setPostLike`~
  - Add server‑side `TutoPostLikes` table to prevent multi‑like exploits and enable analytics
  - Rate‑limit or debounce like updates to Airtable
- [H] Comments text rendering bug on some devices
  - Use system font as fallback; ensure Inter fonts are loaded app‑wide. ~Inter loaded in `App.tsx`~
  - Remove elevation where text glitches; add solid background to text containers
- [M] Image Lightbox zoom+pan UX
  - Ensure panning works when zoomed; constrain pan to image bounds
  - Add double‑tap to zoom in/out
- [M] Analytics and Monitoring
  - Keep Sentry for errors; optionally add `expo-firebase-analytics` for events
  - Define core analytics events (auth, create_post, like_post, comment_add)
- [M] Testing setup
  - Add Jest + React Native Testing Library
  - Unit tests for hooks (`useAirtable`) and components (`PostCard`)
- [L] Performance
  - Lazy‑load images with progressive placeholders
  - Memoize heavy components; audit re‑renders on Feed and Home

## Auth & Onboarding
- [M] Social login placeholders → real providers (Apple/Google) if required
- [L] Password reset via email link flow (UI is present; integrate backend if needed)

## HomeScreen
- [H] Wire Quick Actions
  - ~Ask → temporarily routes to Feed~
  - ~Chats → temporarily routes to Notifications~
  - ~Children → routes to UserProfile~
  - ~Payments → routes to Payments~
  - ~Assignments → routes to Homework~
  - ~Progress → routes to Progress~
  - ~Schedule → routes to Schedule~
  - ~Earnings → routes to TutoStore~
- [M] Personalization
  - Show role‑aware quick actions and tips
  - Recent activity cards (last class, next class)

## FeedScreen / PostCard
- [H] Like button responsiveness
  - Optimize immediate UI feedback and update counts optimistically
  - Ensure counts sync and recover on error
- [H] Comments integration
  - ~Airtable‑backed comments; fallback memory store~
  - Pull‑to‑refresh and pagination of comments
- [M] Media handling
  - Video playback with `expo-av`
  - Upload progress indicators; thumbnail generation
- [M] Sharing and Saving
  - Native share sheet
  - Persist saved posts per user
- [L] Moderation
  - Report/flag content; basic admin actions

## CommentsScreen
- [H] Empty state text visual glitch
  - ~Use theme font and proper text props (fixed)~
- [M] Input UX
  - Send on enter; disable when empty; show character counter
- [L] Pagination
  - Infinite scroll or “Load more”

## Subjects / Search
- [M] SearchScreen functionality
  - Query by subject, teacher, location; debounce input
  - Show result list with facets (role, subject)
- [L] Subject chips on Home open Search with filter applied

## TeacherProfile
- [M] Booking CTA connects to `BookingScreen` with prefilled data
- [L] Reviews list with pagination; add review from profile

## Booking / Schedule
- [M] BookingScreen
  - Validate overlaps, time zone handling
  - Persist to Airtable and show in Bookings list
- [M] ScheduleScreen
  - Calendar view (`react-native-calendars`), upcoming and past

## Payments
- [M] PaymentsScreen
  - Integrate gateway (Stripe or local provider)
  - Show invoices and statuses from Airtable

## Profile / User Settings
- [M] ProfileScreen implementation
  - Edit personal info, preferences; persist to Airtable
  - Avatar upload via Firebase Storage

## Map
- [L] MapScreen
  - `react-native-maps` with teacher locations and custom pins

## Backend (Firebase Functions proxy)
- [H] Server‑side Likes table
  - Table: `TutoPostLikes` (fields: Post ID, User ID, Created At)
  - Endpoints: create/delete like; aggregate counts server‑side
  - Migrate Feed to read counts from aggregation, not computed on client
- [M] Ensure‑schema automation coverage
  - Include Comments, Likes, and all Posts fields
- [L] Rate limiting & basic auth for write endpoints (if needed)

## UI/UX Recommendations (by screen)
- Home: hero banner with contextual CTA; skeleton loaders for teachers/posts
- Feed: card elevation tuned per Material; accessible touch targets (min 44px)
- Comments: sticky input bar; auto‑scroll on send
- Subjects: grid with icons; clear empty states
- TeacherProfile: stats pills; primary CTA emphasized
- Booking: stepper flow (date → time → confirm)
- Payments: charts for monthly spend; receipt cards
- Profile: segmented sections; forms with react-hook-form + yup
- Map: cluster markers; search by radius

---

Changelog
- 2025‑01‑16: Created backlog; applied quick action wiring, Inter font loading, persistent likes, comments empty‑state fix; added translation for `home.mySchedule`.



