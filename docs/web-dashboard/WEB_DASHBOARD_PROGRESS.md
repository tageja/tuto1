# Tuto Web Dashboard - Development Progress Tracker

**Project**: Tuto Web Dashboard for School Admins & Tuto Ops  
**Tech Stack**: Next.js 15, TypeScript, Firebase Auth & Functions, Airtable (via Functions), Tailwind CSS, shadcn/ui  
**PRD Reference**: `Tuto Web Dashboard2.prd`

---

## Session 1 - Monday, October 6, 2025

### **Session Goals**
- ✅ Clean up incorrect existing code
- ✅ Configure Firebase for web dashboard
- ✅ Configure Airtable access (via Firebase Functions)
- ✅ Set up core infrastructure
- ⏳ Test connectivity

### **What Was Accomplished**

#### 1. Project Structure & Cleanup
- ✅ Removed incorrect Airtable SDK implementation from dashboard
- ✅ Created proper monorepo structure in `apps/dashboard/`
- ✅ Set up tracking files (PROGRESS.md, CHAT_SUMMARY.md, FEATURES_CHECKLIST.md)

#### 2. Firebase Configuration
- ✅ Created `lib/firebase/config.ts`
  - Browser-compatible Firebase initialization
  - Auth, Functions (asia-southeast1), Storage setup
  - Environment variable validation
  - Emulator support for local development
  - Singleton pattern to prevent re-initialization

#### 3. Backend API Layer
- ✅ Created `lib/api/backend.ts`
  - REST API client for Firebase Functions
  - Automatic auth token injection
  - Type-safe API methods
  - Error handling
  - Methods for: Users, Tables CRUD, Teachers, Feed, etc.

- ✅ Created `lib/api/tables.ts`
  - Centralized table names constants
  - Field name mappings for all tables
  - Status enums
  - TypeScript types

#### 4. Type Definitions
- ✅ Created `lib/types/index.ts`
  - User, Teacher, Student, Parent, Booking types
  - School, Subject, Payment types
  - Post, Comment types
  - API response types
  - Form data types
  - UI component prop types

#### 5. Authentication Context
- ✅ Created `contexts/AuthContext.tsx`
  - React Context for auth state
  - Firebase Auth integration
  - Sign in/up/out methods
  - Password reset
  - User profile fetching from backend
  - Error handling with user-friendly messages
  - useAuth hook for components

#### 6. Environment Setup
- ✅ Created `.env.example`
  - Firebase configuration variables
  - Functions region configuration
  - Clear documentation
  - Security notes

### **Architecture Established**

```
Dashboard (Next.js)
├── Firebase Auth (browser)
├── Firebase Functions API Client
│   └── /api/* endpoints
│       └── Firebase Functions (asia-southeast1)
│           └── Airtable REST API
│
├── lib/
│   ├── firebase/
│   │   └── config.ts (Firebase initialization)
│   ├── api/
│   │   ├── backend.ts (API client)
│   │   └── tables.ts (Constants)
│   └── types/
│       └── index.ts (TypeScript types)
│
└── contexts/
    └── AuthContext.tsx (Auth state management)
```

### **Key Decisions Made**

1. **No Direct Airtable Access**: Dashboard always goes through Firebase Functions, maintaining security and consistency with mobile app

2. **Shared Architecture**: Backend API layer mirrors mobile app's `backend.ts` for consistency

3. **Type Safety First**: Comprehensive TypeScript types defined upfront

4. **Role-Based Access**: Auth context prepared for multi-role support (admin, school_admin, teacher)

5. **Region Configuration**: Functions deployed to `asia-southeast1` (matching mobile app)

### **Files Created**
- `apps/dashboard/.env.example`
- `apps/dashboard/lib/firebase/config.ts`
- `apps/dashboard/lib/api/backend.ts`
- `apps/dashboard/lib/api/tables.ts`
- `apps/dashboard/lib/types/index.ts`
- `apps/dashboard/contexts/AuthContext.tsx`
- `apps/dashboard/WEB_DASHBOARD_PROGRESS.md` (this file)

### **Next Steps (Upcoming Session)**

1. ⏳ **Test Connectivity**
   - Create test page to verify Firebase connection
   - Test backend API calls
   - Verify authentication flow
   - Status: Firebase web credentials received; proceed to run tests

2. 📝 **Create Initial Pages**
   - Login page with form
   - Dashboard layout with navigation
   - Protected route wrapper

3. 🎨 **UI Setup**
   - Configure Tailwind CSS
   - Set up shadcn/ui components
   - Create design system tokens

4. 🔐 **Auth Implementation**
   - Complete login/logout flows
   - Role-based route protection
   - School context for multi-tenancy

### **Blockers / Issues**
- None currently. Ready to proceed with testing and page implementation.

### **Questions for User**
1. Are we okay to proceed using the provided Firebase web credentials in `.env.local`?
2. Confirm Functions remain deployed in `asia-southeast1` for `tuto1-73fc4`.
3. Proceed directly with production Functions testing (default)?

---

## Progress Summary

**Total Tasks**: 8  
**Completed**: 7 ✅  
**In Progress**: 1 ⏳  
**Blocked**: 0 ❌

**Overall Status**: 🟢 **ON TRACK** - Core infrastructure complete, ready for testing and feature development

---

*Last Updated*: Monday, October 6, 2025 - Session 1  
*Next Update*: After connectivity testing and initial pages

---

## Session 2 - Wednesday, October 8, 2025

### Summary
- Implemented favicon serving via `/favicon.ico` from root `assets/`.
- Footer alignment and typography refinements; consistent max-width container.
- Popular Subjects redesigned to horizontal pills with theme-consistent hover.
- Fixed i18n issues on Home (no shadowing); ensured all visible strings toggle (VI default).
- Added shared i18n package scaffolding (kept web using local provider to avoid compile issues for now).
- Implemented Airtable schema single-source-of-truth (Meta API puller, data dictionary, drift checker, nightly GitHub Action).

### Files added/updated
- `apps/dashboard/app/base.css` (footer + pills)
- `apps/dashboard/app/(home)/page.tsx` (subjects pills, i18n fixes)
- `apps/dashboard/app/favicon.ico/route.ts` (serve favicon)
- `scripts/pull-airtable-schema.js`, `scripts/check-airtable-usage.js`
- `docs/DATA_DICTIONARY.md`, `docs/feature_schema_map.yml`
- `.github/workflows/airtable-schema.yml`, `.cursorrules`

### Commands
- Update schema: `npm run schema:pull`
- Check references: `npm run schema:check`

### Status
- UI foundation polished; KPIs and Top Teachers wired.
- Airtable schema automation: COMPLETE.
- Overall: 🟢 ON TRACK.

*Last Updated*: Wednesday, October 8, 2025 - Session 2

