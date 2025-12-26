# Classes Not Loading - FIXED

## Root Cause
The `get_user_school_ids()` function was NOT returning schools for global admins. It only returned schools if the user was explicitly linked in the `school_teachers` table.

Even though the user had `role: 'admin'` in the `users` table, the RLS policy required BOTH:
```sql
is_admin() AND school_id = ANY(get_user_school_ids())
```

Since `get_user_school_ids()` returned an empty array `[]`, the query failed.

## The Fix
Updated the `get_user_school_ids()` function in migration `023_fix_admin_school_access.sql` to include:

```sql
-- Global admins: access ALL schools
SELECT id FROM public.schools 
WHERE EXISTS(
    SELECT 1 FROM public.users 
    WHERE auth_user_id = auth.uid() 
    AND role = 'admin'
)
```

Now global admins (users with `role = 'admin'`) automatically get access to ALL schools without needing an explicit entry in `school_teachers`.

## Files Modified
1. `supabase/migrations/002_rls_policies.sql` - Updated function definition
2. `supabase/migrations/023_fix_admin_school_access.sql` - New migration (applied ✅)
3. `src/translations/index.ts` - Added `selectMonth` translations
4. `src/components/school/EventFilters.tsx` - Fixed month picker

## Status
✅ **Migration Applied Successfully**

The classes should now load in the Create Event screen. Please refresh the mobile app and test again.






