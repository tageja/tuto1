# PIN Code Functionality Issues - Investigation Report

## Problem Summary

Users can access school dashboards **without entering the PIN code**, bypassing the security mechanism. Additionally, there are navigation flow issues causing 404 errors and inconsistent user experiences.

## User Flow Issues (As Reported)

### Flow 1: 404 Error on "Join a School"
1. ✅ User creates new account
2. ✅ User clicks email confirmation link
3. ✅ Welcome page loads with two options: "Join a School" or "Continue to tuto. Home"
4. ❌ User clicks "Join a School" → **404 Error** on `/join-school` route (route doesn't exist)

### Flow 2: PIN Bypass via Home Page
1. ✅ User creates new account  
2. ✅ User clicks email confirmation link
3. ✅ Welcome page loads
4. ✅ User clicks "Continue to tuto. Home" → goes to `/home`
5. ✅ User clicks "School Dashboard" link in navigation → goes to `/school`
6. ❌ User can access parent dashboard **WITHOUT PIN ENTRY**

### Flow 3: Previous Inconsistent Flow
- User clicked "Join a School" → navigated to "find a school" page (worked)
- Then went to tuto home → clicked "School Dashboard" → bypassed PIN

**Root Issue:** Inconsistent navigation flows and missing route validation

## Root Causes Identified

### Issue 0: Missing `/join-school` Route (404 Error)

**Location:** `apps/dashboard/app/welcome/page.tsx` (line 108)

**Problem:**
- Welcome page tries to navigate to `/join-school` route
- This route **does not exist** in the app directory
- Results in 404 error when user clicks "Join a School" button

**Code Evidence:**
```typescript
const handleJoinSchool = () => {
  router.push('/join-school'); // ❌ Route doesn't exist!
};
```

**Available Routes:**
- ✅ `/find-school` exists
- ✅ `/school-selector` exists  
- ❌ `/join-school` does NOT exist

**Fix Options:**
1. Change to navigate to `/find-school`
2. Show PIN modal directly instead of navigating
3. Create the `/join-school` route

### Issue 1: No Access Validation in Parent Dashboard Pages

**Location:** `apps/dashboard/app/school/[schoolId]/parent/page.tsx` and `layout.tsx`

**Problem:**
- Parent dashboard pages render **immediately** without checking if user has access to the school
- No verification that user has entered PIN or is in `school_parents` table
- User can navigate directly to `/school/[schoolId]/parent` and access dashboard

**Code Evidence:**
```typescript
// apps/dashboard/app/school/[schoolId]/parent/page.tsx
export default function ParentDashboard() {
  // No access check here - just renders directly
  const schoolId = schoolIdFromUrlParam || schoolIdFromUrl || selectedSchool?.id;
  // ... renders dashboard immediately
}
```

### Issue 2: Welcome Page PIN Modal Logic is Flawed

**Location:** `apps/dashboard/app/welcome/page.tsx` (lines 64-77)

**Problem:**
- PIN modal only shows if `schoolList.length === 0` AND `isParent && !hasAccess`
- If user somehow has a school association (from previous tests), they can bypass PIN check
- "School Dashboard" button appears if `hasSchools` is true, allowing direct navigation

**Code Evidence:**
```typescript
// Only shows PIN modal if NO schools found
if (schoolList.length === 0 && user?.email) {
  // Check parent access...
  if (accessData.success && accessData.isParent && !accessData.hasAccess) {
    setShowPinModal(true);
  }
}

// But if schools.length > 0, user can click this button and bypass PIN
{hasSchools && (
  <button onClick={handleGoToSchoolDashboard}>
    Go to School Dashboard
  </button>
)}
```

### Issue 3: School Layout Bypasses Access Checks

**Location:** `apps/dashboard/app/school/layout.tsx` (lines 109-111)

**Problem:**
- School layout immediately renders children for dashboard routes without checking access
- This allows direct navigation to `/school/[schoolId]/parent` without validation

**Code Evidence:**
```typescript
// If we're on a dashboard route, render children immediately
// This prevents infinite loading when visiting /school/admin directly
if (isDashboardRoute) {
  return <>{children}</>; // ⚠️ No access check!
}
```

### Issue 4: Missing PIN Validation in Parent Layout

**Location:** `apps/dashboard/app/school/[schoolId]/parent/layout.tsx`

**Problem:**
- Parent layout doesn't verify user has access to the school
- No check for `school_parents` table entry
- No redirect if access is denied

### Issue 5: School List Not Showing "Tuto Demo School"

**Possible Causes:**
1. User's email not in `school_students.parent_email` for that school
2. User hasn't entered PIN, so not in `school_parents` table
3. RPC function `get_user_school_associations` working correctly but school just isn't associated
4. School status might be inactive

## Expected Behavior vs Actual Behavior

### Expected:
1. New parent user logs in → sees welcome page
2. If no school access → PIN modal appears
3. User enters PIN → validated → linked to school
4. User can then access school dashboard
5. If user tries to access school without PIN → redirected to PIN entry

### Actual:
1. New parent user logs in → sees welcome page
2. If somehow has school association → can click "School Dashboard" → **bypasses PIN**
3. User can navigate directly to `/school/[schoolId]/parent` → **bypasses PIN**
4. No validation happens before rendering dashboard

## Files That Need Fixing

### Critical Priority (404 Error):
0. **`apps/dashboard/app/welcome/page.tsx`**
   - Fix `handleJoinSchool()` to either:
     - Show PIN modal directly: `setShowPinModal(true)`
     - Navigate to existing route: `router.push('/find-school')`
     - Or create `/join-school` route if needed

### High Priority:
1. **`apps/dashboard/app/school/[schoolId]/parent/layout.tsx`**
   - Add access validation before rendering
   - Check `school_parents` table or `school_students.parent_email`
   - Redirect to PIN modal if no access

2. **`apps/dashboard/app/school/[schoolId]/parent/page.tsx`**
   - Add access check in useEffect
   - Verify user has access before rendering dashboard

3. **`apps/dashboard/app/welcome/page.tsx`**
   - Fix `handleJoinSchool()` to show PIN modal instead of navigating to non-existent route
   - Fix PIN modal logic to show for parents even if they have some school associations
   - Add check: if parent role but school not in `school_parents` → show PIN modal
   - Prevent "School Dashboard" button if user doesn't have proper access

### Medium Priority:
4. **`apps/dashboard/app/school/layout.tsx`**
   - Add access validation before rendering dashboard routes
   - Check user has access to school before allowing navigation
   - When user navigates to `/school` from home page, check PIN access first
   - If no access → redirect to welcome page with PIN modal

5. **`apps/dashboard/app/api/school/check-parent-access/route.ts`**
   - May need to check specific school access, not just general parent status

## Database Queries Needed

To verify access, we need to check:

```sql
-- Check if user is in school_parents (PIN-linked)
SELECT * FROM school_parents sp
INNER JOIN users u ON sp.parent_user_id = u.id
WHERE LOWER(u.email) = LOWER('user@example.com')
AND sp.school_id = 'school-uuid';

-- Check if user has student with parent_email match
SELECT * FROM school_students
WHERE school_id = 'school-uuid'
AND LOWER(parent_email) = LOWER('user@example.com')
AND status = 'active';
```

## Recommended Fix Strategy

1. **Add access validation middleware/check in parent layout**
   - Before rendering, check if user has access to school
   - If no access → show PIN modal or redirect to welcome page

2. **Fix welcome page logic**
   - Always check if parent needs PIN for specific schools
   - Don't show "School Dashboard" button if user doesn't have proper access
   - Show PIN modal if user is parent but school not in `school_parents`

3. **Add access check in school layout**
   - Before rendering dashboard routes, verify access
   - Redirect to appropriate page if access denied

4. **Create reusable access validation function**
   - `checkParentSchoolAccess(userEmail, schoolId)` 
   - Returns boolean indicating if parent has access
   - Can be used in multiple places

## Testing Checklist

After fixes:
- [ ] "Join a School" button works (no 404 error)
- [ ] PIN modal appears when clicking "Join a School"
- [ ] New parent user cannot access school dashboard without PIN
- [ ] PIN modal appears when parent tries to access school via home page → school dashboard
- [ ] After entering PIN, user can access school dashboard
- [ ] Direct navigation to `/school/[schoolId]/parent` requires PIN if no access
- [ ] Navigation from `/home` → "School Dashboard" → checks PIN before showing dashboard
- [ ] "Tuto Demo School" appears in list after PIN entry
- [ ] User with existing student (parent_email match) can access without PIN (expected behavior)
- [ ] Consistent navigation flow regardless of entry point

## Next Steps

1. Review this investigation report
2. Confirm the issues identified
3. Implement fixes based on recommended strategy
4. Test the complete flow
