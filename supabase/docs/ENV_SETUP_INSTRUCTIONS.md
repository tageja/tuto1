# Environment Setup Instructions

## Step 1: Add to Root `.env`

Add these variables to your root `.env` file (create if doesn't exist):

```env
# Supabase - Mobile App (EXPO_PUBLIC_ prefix)
EXPO_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs

# Supabase - Web Dashboard (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs

# Supabase - Server Side (for API routes and Functions)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Mzg0NiwiZXhwIjoyMDc4MzI5ODQ2fQ.FDJ8X28wmvBtgQnmwtRW6y3lc-Enm_QTykmU1HGEX-w
SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
```

## Step 2: Update app.config.js

Add Supabase config to `app.config.js` extra section:

```javascript
extra: {
  // ... existing Firebase config ...
  
  // Add Supabase
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
}
```

## Step 3: Update apps/dashboard/.env.local

Create or update `apps/dashboard/.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://fkjeggdxqifqqwhuqpgm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI3NTM4NDYsImV4cCI6MjA3ODMyOTg0Nn0.7e45smIALVo6zdVGOn2Af74fKRKj5kYvZn34nt26-hs
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZramVnZ2R4cWlmcXF3aHVxcGdtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2Mjc1Mzg0NiwiZXhwIjoyMDc4MzI5ODQ2fQ.FDJ8X28wmvBtgQnmwtRW6y3lc-Enm_QTykmU1HGEX-w
```

## Complete!

Your environment is now configured for Supabase migration.










