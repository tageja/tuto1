# Parent PIN Implementation - Issues & Fixes Summary

**Date:** January 27-28, 2026  
**Feature:** 6-digit PIN system for parents to join schools  
**Status:** ✅ Resolved

---

## Overview

This document summarizes the issues encountered during the implementation of the parent PIN code system and their respective fixes.

---

## Issue 1: PIN Not Displaying - 401 Unauthorized Error

### Problem
- PIN code was not showing on admin dashboard
- API route `/api/school/parent-pin` returned `401 (Unauthorized)`
- Error: "⚠️ PIN not loaded: Unauthorized - Please log in"

### Root Cause
- Next.js API routes were failing to retrieve authenticated user session from cookies
- Client-side fetch calls were not including authentication tokens in headers
- Server-side authentication relied solely on cookies, which wasn't working reliably

### Fix
1. **Client-side changes:**
   - Modified `apps/dashboard/app/school/[schoolId]/admin/page.tsx` and `settings/page.tsx`
   - Added code to retrieve Supabase `access_token` from client session
   - Included token in `Authorization: Bearer <token>` header for all fetch calls

2. **API route changes:**
   - Updated `/api/school/parent-pin/route.ts`
   - Implemented dual authentication strategy:
     - **Primary:** Check `Authorization` header for `access_token`
     - **Fallback:** Use `createServerClient` with `cookies()` for SSR
   - Applied same pattern to `/api/school/validate-parent-pin` and `/api/school/check-parent-access`

### Code Pattern
```typescript
// Client-side
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

const response = await fetch('/api/endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Server-side (API route)
const authHeader = request.headers.get('authorization');
const accessToken = authHeader?.replace('Bearer ', '');

if (accessToken) {
  const { data: { user } } = await serviceSupabase.auth.getUser(accessToken);
  // Use user
} else {
  // Fallback to cookie-based auth
  const { data: { session } } = await authClient.auth.getSession();
}
```

---

## Issue 2: Function Signature Mismatch - 500 Internal Server Error

### Problem
- Error: "Could not find the function public.validate_parent_pin(pin, user_email) in the schema cache"
- API route returned `500 (Internal Server Error)`
- Function existed but with different signature

### Root Cause
- Database function `validate_parent_pin` only accepted `pin TEXT` parameter
- Code was calling it with both `pin` and `user_email` parameters
- Function used `auth.uid()` internally, which doesn't work with service role client
- Migration `048_school_parent_pin` had different implementation than `035_parent_pin_system.sql`

### Fix
1. **Applied migration to update function signature:**
   - Created migration `fix_validate_parent_pin_with_user_email`
   - Updated function to accept optional `user_email TEXT DEFAULT NULL`
   - Function now supports both:
     - Service role calls (with `user_email` parameter)
     - Regular user calls (uses `auth.uid()` when `user_email` is NULL)

2. **Function logic:**
   ```sql
   CREATE OR REPLACE FUNCTION public.validate_parent_pin(
       pin TEXT,
       user_email TEXT DEFAULT NULL
   )
   ```
   - If `user_email` provided → uses email to find user (service role)
   - If `user_email` is NULL → uses `auth.uid()` (regular user context)

---

## Issue 3: Case-Sensitive Status Check - 400 Bad Request

### Problem
- PIN validation failed with "Invalid PIN or school is not active"
- PIN "690450" existed and was correct
- School status was "Active" (capital A) but function checked for "active" (lowercase)

### Root Cause
- PostgreSQL string comparisons are case-sensitive
- Database had inconsistent status values: "active", "Active", "offboarded"
- Function used `status = 'active'` which only matched lowercase

### Fix
1. **Applied migration to use case-insensitive comparison:**
   - Created migration `fix_validate_parent_pin_case_insensitive_status`
   - Changed `status = 'active'` to `LOWER(status) = 'active'`
   - Now matches both "active" and "Active" status values

2. **Updated query:**
   ```sql
   SELECT id, name, status INTO school_record
   FROM public.schools
   WHERE parent_pin = pin
   AND LOWER(status) = 'active'  -- Case-insensitive
   LIMIT 1;
   ```

---

## Issue 4: Duplicate Variable Declaration - Build Error

### Problem
- Build error: "The name `serviceSupabase` is defined multiple times"
- Files: `apps/dashboard/app/api/school/check-parent-access/route.ts`
- Files: `apps/dashboard/app/api/school/validate-parent-pin/route.ts`

### Root Cause
- During refactoring, `const serviceSupabase = createServerSupabaseClient();` was declared multiple times in the same scope
- JavaScript/TypeScript doesn't allow duplicate `const` declarations

### Fix
- Removed duplicate declarations
- Ensured `serviceSupabase` is declared only once at the top of the route handler
- Used the same instance throughout the function

---

## Issue 5: 404 Error on Join School Route

### Problem
- Clicking "Join a School" button resulted in 404 error
- Route `/join-school` did not exist
- User couldn't access PIN entry modal

### Root Cause
- `apps/dashboard/app/welcome/page.tsx` had navigation to non-existent route
- `handleJoinSchool` function attempted to navigate to `/join-school`

### Fix
- Modified `handleJoinSchool` to directly show PIN modal:
  ```typescript
  const handleJoinSchool = () => {
    setShowPinModal(true);  // Direct modal trigger instead of navigation
  };
  ```
- Removed navigation to non-existent route

---

## Issue 6: PIN Bypass Security Vulnerability

### Problem
- Parents could bypass PIN entry by directly accessing school dashboard URLs
- No access control in parent layout
- Welcome page logic allowed access without PIN validation

### Root Cause
- Missing access validation in `apps/dashboard/app/school/[schoolId]/parent/layout.tsx`
- Welcome page didn't consistently check parent access before redirecting
- No centralized access validation utility

### Fix
1. **Created utility function:**
   - Added `apps/dashboard/lib/school/parentAccess.ts`
   - Centralized `checkParentSchoolAccess()` and `checkParentHasAnyAccess()` functions
   - Includes proper authentication header handling

2. **Added access control in parent layout:**
   - `apps/dashboard/app/school/[schoolId]/parent/layout.tsx`
   - Validates access on mount
   - Shows PIN modal if access denied
   - Redirects to welcome page if modal closed without success

3. **Enhanced welcome page logic:**
   - `apps/dashboard/app/welcome/page.tsx`
   - Checks parent access before allowing dashboard navigation
   - Shows PIN modal if parent has no access

4. **Added check in school layout:**
   - `apps/dashboard/app/school/layout.tsx`
   - Validates parent access when navigating to base `/school` route
   - Redirects to welcome page with PIN prompt if needed

---

## Key Learnings

1. **Authentication Strategy:**
   - Always implement dual authentication (header + cookie fallback) for Next.js API routes
   - Client-side fetches should include `Authorization` header with access token
   - Server-side should fallback to cookie-based auth for SSR compatibility

2. **Database Function Design:**
   - Design functions to work with both service role and regular user contexts
   - Use optional parameters with defaults for flexibility
   - Consider case-sensitivity in string comparisons (use `LOWER()` or `ILIKE`)

3. **Security:**
   - Always validate access at multiple layers (layout, page, API route)
   - Don't rely on client-side checks alone
   - Use centralized utility functions for consistent validation

4. **Error Handling:**
   - Check function signatures match between database and code
   - Verify data consistency (e.g., status values case)
   - Use proper error messages to aid debugging

---

## Files Modified

### Database Migrations
- `supabase/migrations/035_parent_pin_system.sql` (original)
- `supabase/migrations/048_school_parent_pin` (applied, different implementation)
- `fix_validate_parent_pin_with_user_email` (applied)
- `fix_validate_parent_pin_case_insensitive_status` (applied)

### API Routes
- `apps/dashboard/app/api/school/parent-pin/route.ts`
- `apps/dashboard/app/api/school/validate-parent-pin/route.ts`
- `apps/dashboard/app/api/school/check-parent-access/route.ts`

### Components
- `apps/dashboard/components/school/ParentPinDisplay.tsx`
- `apps/dashboard/components/school/ParentPinModal.tsx`

### Pages & Layouts
- `apps/dashboard/app/school/[schoolId]/admin/page.tsx`
- `apps/dashboard/app/school/[schoolId]/admin/settings/page.tsx`
- `apps/dashboard/app/welcome/page.tsx`
- `apps/dashboard/app/school/[schoolId]/parent/layout.tsx`
- `apps/dashboard/app/school/layout.tsx`

### Utilities
- `apps/dashboard/lib/school/parentAccess.ts` (new)

---

## Testing Checklist

- [x] PIN displays correctly for admin users
- [x] PIN validation works with correct PIN
- [x] PIN validation rejects invalid PINs
- [x] PIN validation works with case-insensitive school status
- [x] Parent access is validated on dashboard routes
- [x] PIN modal appears for parents without access
- [x] Cannot bypass PIN entry by direct URL access
- [x] Authentication works with both header and cookie methods

---

## Status: ✅ All Issues Resolved

The parent PIN system is now fully functional with proper authentication, access control, and error handling.
