# Tuto Web Dashboard - Features Checklist

**Reference**: `Tuto Web Dashboard2.prd` - P0 Milestone  
**Last Updated**: Monday, October 6, 2025

---

## Legend
- ✅ **Complete** - Fully implemented and tested
- 🟡 **In Progress** - Currently being worked on
- ⏳ **Pending** - Not started, ready to begin
- ❌ **Blocked** - Cannot proceed (dependency or issue)
- 🔄 **Needs Review** - Complete but needs testing/review

---

## Phase 1: Core Infrastructure (P0)

### 1.1 Project Scaffolding
- [x] ✅ Monorepo structure (`apps/dashboard/`)
- [x] ✅ Next.js 15 setup with TypeScript
- [x] ✅ Package.json with all dependencies
- [x] ✅ Tailwind CSS configuration
- [x] ✅ ESLint & TypeScript config
- [ ] ⏳ Progress tracking files setup

**Status**: 🟢 Complete  
**Notes**: Using existing Next.js setup, added to workspace

---

### 1.2 Firebase Configuration
- [x] ✅ Firebase config module (`lib/firebase/config.ts`)
- [x] ✅ Auth initialization
- [x] ✅ Functions initialization (asia-southeast1)
- [x] ✅ Storage initialization
- [x] ✅ Environment variable validation
- [x] ✅ Emulator support
- [ ] ⏳ Firebase credentials setup (`.env.local`)
- [ ] ⏳ Test Firebase connection

**Status**: 🟡 90% Complete - Need credentials from user  
**Blockers**: None - ready for user to provide Firebase config  
**Tasks Remaining**:
1. User to provide Firebase credentials
2. Create `.env.local` with values
3. Test connection

---

### 1.3 Airtable Integration (via Functions)
- [x] ✅ Backend API client (`lib/api/backend.ts`)
- [x] ✅ Table constants & field mappings (`lib/api/tables.ts`)
- [x] ✅ Generic CRUD methods
- [x] ✅ Auto token injection for auth
- [x] ✅ Error handling
- [ ] ⏳ Test backend connectivity
- [ ] ⏳ Test CRUD operations

**Status**: 🟢 Complete - Ready for testing  
**Notes**: No direct Airtable access; all via Firebase Functions

---

### 1.4 Type Definitions
- [x] ✅ User & Auth types
- [x] ✅ Teacher types
- [x] ✅ Student types
- [x] ✅ Booking types
- [x] ✅ School types
- [x] ✅ Payment types
- [x] ✅ Feed/Post types
- [x] ✅ API response types
- [x] ✅ Form data types

**Status**: 🟢 Complete  
**Notes**: Comprehensive types for all entities

---

### 1.5 Authentication System
- [x] ✅ AuthContext created
- [x] ✅ useAuth hook
- [x] ✅ Sign in method
- [x] ✅ Sign up method
- [x] ✅ Sign out method
- [x] ✅ Password reset method
- [x] ✅ User profile fetching from backend
- [ ] ⏳ Login page UI
- [ ] ⏳ Protected route wrapper
- [ ] ⏳ Role-based access control
- [ ] ⏳ Test auth flow end-to-end

**Status**: 🟡 70% Complete  
**Tasks Remaining**:
1. Build login page UI
2. Create protected route component
3. Implement role checks
4. Test complete flow

---

## Phase 2: Core UI & Pages (P0)

### 2.1 Design System
- [ ] ⏳ shadcn/ui components installation
- [ ] ⏳ Theme configuration (colors, fonts)
- [ ] ⏳ Design tokens setup
- [ ] ⏳ Common UI components
  - [ ] Button
  - [ ] Input
  - [ ] Card
  - [ ] Table
  - [ ] Dialog/Modal
  - [ ] Toast notifications
- [ ] ⏳ Loading states (skeletons)
- [ ] ⏳ Empty states
- [ ] ⏳ Error states

**Status**: ⏳ Not Started  
**Priority**: High - Needed for all features

---

### 2.2 Layout & Navigation
- [ ] ⏳ Root layout component
- [ ] ⏳ Dashboard layout with sidebar
- [ ] ⏳ Header with user menu
- [ ] ⏳ Navigation menu
  - [ ] School Admin sections
  - [ ] Tuto Admin sections
- [ ] ⏳ Responsive design (mobile/desktop)
- [ ] ⏳ School context switcher

**Status**: ⏳ Not Started  
**Priority**: High

---

### 2.3 Authentication Pages
- [ ] ⏳ Login page
  - [ ] Email/password form
  - [ ] Error handling
  - [ ] Loading states
  - [ ] "Forgot password" link
- [ ] ⏳ Sign up page (if needed)
- [ ] ⏳ Password reset page
- [ ] ⏳ Onboarding flow
- [ ] ⏳ Protected route wrapper

**Status**: ⏳ Not Started  
**Priority**: Critical - Required for access  
**Dependencies**: AuthContext (✅ Complete)

---

### 2.4 Dashboard / Overview Page
- [ ] ⏳ Overview layout
- [ ] ⏳ KPI cards
  - [ ] Active students count
  - [ ] Classes this week
  - [ ] Revenue MTD
  - [ ] Pending invoices
  - [ ] Churn risk indicator
- [ ] ⏳ Charts (Recharts)
  - [ ] Revenue trend
  - [ ] Booking pipeline
- [ ] ⏳ Recent activities feed
- [ ] ⏳ Quick actions

**Status**: ⏳ Not Started  
**Priority**: High

---

## Phase 3: School Admin Features (P0)

### 3.1 Teachers Management
- [ ] ⏳ Teachers list page
  - [ ] Data table with filtering
  - [ ] Sorting
  - [ ] Pagination
  - [ ] Search
- [ ] ⏳ Teacher detail/edit drawer
- [ ] ⏳ Create teacher form
- [ ] ⏳ Verification status display
- [ ] ⏳ Ratings & reviews display
- [ ] ⏳ Availability calendar view
- [ ] ⏳ Actions: approve/reject/suspend

**Status**: ⏳ Not Started  
**Priority**: High  
**API**: Backend methods ready ✅

---

### 3.2 Students Management
- [ ] ⏳ Students list page
  - [ ] Data table
  - [ ] Filtering by grade/status
  - [ ] Search
- [ ] ⏳ Student profile page
- [ ] ⏳ Create/edit student form
- [ ] ⏳ Enrollment history
- [ ] ⏳ Progress indicators
- [ ] ⏳ Fee status display
- [ ] ⏳ CSV export

**Status**: ⏳ Not Started  
**Priority**: High

---

### 3.3 Classes Management
- [ ] ⏳ Classes list page
- [ ] ⏳ Create class form
  - [ ] Schedule picker
  - [ ] Capacity settings
  - [ ] Teacher assignment
- [ ] ⏳ Class detail page
  - [ ] Roster tab
  - [ ] Attendance tab
  - [ ] Schedule tab
- [ ] ⏳ Attendance marking
- [ ] ⏳ Class capacity warnings

**Status**: ⏳ Not Started  
**Priority**: High

---

### 3.4 Bookings Management
- [ ] ⏳ Bookings pipeline view (Kanban/Table)
  - [ ] Pending column
  - [ ] Confirmed column
  - [ ] Cancelled column
  - [ ] No-show column
- [ ] ⏳ Booking detail drawer
- [ ] ⏳ Actions
  - [ ] Confirm booking
  - [ ] Cancel booking
  - [ ] Mark no-show
  - [ ] Reschedule
- [ ] ⏳ Filtering & search
- [ ] ⏳ Optimistic updates

**Status**: ⏳ Not Started  
**Priority**: High

---

### 3.5 Payments
- [ ] ⏳ Payments list page
- [ ] ⏳ Invoice/receipt display
- [ ] ⏳ Payment status indicators
- [ ] ⏳ Basic reconciliation view
- [ ] ⏳ Filters by status/date
- [ ] ⏳ Export functionality

**Status**: ⏳ Not Started  
**Priority**: Medium

---

### 3.6 Reviews & Moderation
- [ ] ⏳ Reviews list page
- [ ] ⏳ Actions: approve/hide
- [ ] ⏳ Reports queue
- [ ] ⏳ Bulk actions
- [ ] ⏳ Audit log view

**Status**: ⏳ Not Started  
**Priority**: Medium

---

### 3.7 Reporting
- [ ] ⏳ Reports page
- [ ] ⏳ KPI dashboard
- [ ] ⏳ Date range picker
- [ ] ⏳ CSV exports
  - [ ] Teachers report
  - [ ] Students report
  - [ ] Bookings report
  - [ ] Revenue report

**Status**: ⏳ Not Started  
**Priority**: Medium

---

## Phase 4: Tuto Admin Features (P0)

### 4.1 Approvals
- [ ] ⏳ Teacher approvals queue
- [ ] ⏳ School approvals queue
- [ ] ⏳ Approval actions
- [ ] ⏳ Rejection with reasons
- [ ] ⏳ Audit trail

**Status**: ⏳ Not Started  
**Priority**: Medium

---

### 4.2 Moderation
- [ ] ⏳ UGC moderation queue
- [ ] ⏳ Posts moderation
- [ ] ⏳ Comments moderation
- [ ] ⏳ Reviews moderation
- [ ] ⏳ Reports triage
- [ ] ⏳ Severity filters
- [ ] ⏳ Batch actions
- [ ] ⏳ Block/unblock users

**Status**: ⏳ Not Started  
**Priority**: Medium

---

### 4.3 Platform Analytics
- [ ] ⏳ Analytics dashboard
- [ ] ⏳ Marketplace KPIs
- [ ] ⏳ Segment by city/subject
- [ ] ⏳ Funnels (search → booking)
- [ ] ⏳ Retention metrics

**Status**: ⏳ Not Started  
**Priority**: Low

---

### 4.4 Platform Payments
- [ ] ⏳ Platform-level reconciliation
- [ ] ⏳ Refund policies management
- [ ] ⏳ Payout management

**Status**: ⏳ Not Started  
**Priority**: Low

---

## Phase 5: Security & Compliance (P0)

### 5.1 API Security
- [x] ✅ No direct Airtable access from client
- [x] ✅ Firebase Auth token required for API calls
- [ ] ⏳ Role-based endpoint access
- [ ] ⏳ Rate limiting (backend already has it)
- [ ] ⏳ CORS configuration (backend already has it)

**Status**: 🟡 70% Complete  
**Notes**: Backend security in place, need client-side role checks

---

### 5.2 Audit Logging
- [x] ✅ Backend audit logging implemented (in Functions)
- [ ] ⏳ Audit log viewer in dashboard
- [ ] ⏳ Filter by user/action/date

**Status**: 🟡 50% Complete

---

### 5.3 Legal & Compliance
- [ ] ⏳ ToS/Privacy links
- [ ] ⏳ Data retention policy display
- [ ] ⏳ User consent flows

**Status**: ⏳ Not Started  
**Priority**: Low (P1)

---

## Phase 6: Observability (P0)

### 6.1 Error Tracking
- [ ] ⏳ Sentry integration
- [ ] ⏳ Error boundary components
- [ ] ⏳ Source maps upload

**Status**: ⏳ Not Started  
**Priority**: Medium

---

### 6.2 Analytics
- [ ] ⏳ Event tracking taxonomy
- [ ] ⏳ Page view tracking
- [ ] ⏳ User action tracking
- [ ] ⏳ Funnel analysis

**Status**: ⏳ Not Started  
**Priority**: Low

---

## Phase 7: CI/CD & Deployment (P0)

### 7.1 Build & Deploy
- [ ] ⏳ Vercel deployment setup
- [ ] ⏳ Preview deployments
- [ ] ⏳ Production deployment
- [ ] ⏳ Environment variables in Vercel

**Status**: ⏳ Not Started  
**Priority**: High

---

### 7.2 Quality Gates
- [ ] ⏳ ESLint in CI
- [ ] ⏳ TypeScript check in CI
- [ ] ⏳ Build check in CI
- [ ] ⏳ Unit tests (if any)

**Status**: ⏳ Not Started  
**Priority**: Medium

---

## Current Sprint Focus

**Sprint Goal**: Complete core infrastructure and test connectivity

### This Week
1. [x] ✅ Setup Firebase configuration
2. [x] ✅ Create backend API client
3. [x] ✅ Create type definitions
4. [x] ✅ Create auth context
5. [ ] 🟡 Get Firebase credentials from user
6. [ ] ⏳ Test Firebase & backend connectivity
7. [ ] ⏳ Build login page
8. [ ] ⏳ Create protected route wrapper

### Next Week
1. Dashboard layout & navigation
2. Teachers list page (first feature)
3. Students list page
4. Bookings pipeline view

---

## Overall Progress

**P0 Features (Critical Path):**
- Infrastructure: 🟢 90% Complete
- Auth: 🟡 70% Complete
- UI/Design System: 🔴 0% Complete
- School Admin Core: 🔴 0% Complete
- Tuto Admin Core: 🔴 0% Complete
- Security: 🟡 70% Complete
- Observability: 🔴 0% Complete
- Deployment: 🔴 0% Complete

**Overall P0 Completion**: **25%** (Infrastructure phase complete)

---

## Blockers & Dependencies

### Current Blockers
1. **Firebase Credentials** - Need from user to proceed with testing
   - Impact: Cannot test connectivity
   - Resolution: User to provide credentials

### Dependencies
- Login page → Auth context ✅
- All features → Login page ⏳
- Protected routes → Auth context ✅
- Data tables → shadcn/ui setup ⏳
- All pages → Layout component ⏳

---

## Notes & Decisions

### Technical Decisions Log
1. **No Airtable SDK**: Use REST API via Functions (from AIRTABLE_INFO.md)
2. **Auth Pattern**: React Context instead of Redux
3. **UI Library**: shadcn/ui + Tailwind CSS
4. **API Client**: Custom client mirroring mobile app
5. **Type Safety**: TypeScript strict mode

### User Involvement Needed
- [ ] Provide Firebase credentials
- [ ] Confirm design preferences
- [ ] Review first page (login) before proceeding
- [ ] Test auth flow in production

---

*Last Updated*: Monday, October 6, 2025  
*Next Review*: After connectivity testing


