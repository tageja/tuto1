# 🔧 Restart Next.js Dev Server

The Supabase project and schema are correct. The issue is that Next.js may not have picked up the environment variables.

## Steps

1. **Stop the current dev server**:
   - Press `Ctrl+C` in the terminal where `npm run dev` is running

2. **Clear Next.js cache** (optional but recommended):
   ```bash
   cd apps/dashboard
   rm -rf .next
   ```
   Or on Windows PowerShell:
   ```powershell
   cd apps\dashboard
   Remove-Item -Recurse -Force .next
   ```

3. **Restart the dev server**:
   ```bash
   npm run dev
   ```

4. **Wait for it to fully compile**, then try creating an event again.

## Why This is Needed

- Environment variables are loaded when Next.js starts
- `.env.local` changes require a server restart
- The `.next` build cache can sometimes hold stale data

## If It Still Doesn't Work

Check if the service role key is being loaded:
- Add a console.log in `apps/dashboard/lib/supabase.ts` line 29:
  ```typescript
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  console.log('Service role key loaded:', !!serviceRoleKey);
  ```
- Restart and check the server console for the log

