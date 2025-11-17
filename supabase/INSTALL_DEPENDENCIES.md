# Install Dependencies for Supabase Migration

**Issue**: `ts-node` not recognized when running migration scripts.

**Solution**: Install required dependencies.

---

## Option 1: Install All at Once (Recommended)

Run this command in your project root:

```bash
npm install --save-dev ts-node @types/node pg uuid @types/uuid @types/pg vitest --legacy-peer-deps
```

Then install Supabase client:

```bash
npm install @supabase/supabase-js --legacy-peer-deps
```

---

## Option 2: Manual Installation

If the above doesn't work, install one by one:

```bash
npm install --save-dev ts-node --legacy-peer-deps
npm install --save-dev pg --legacy-peer-deps
npm install --save-dev uuid --legacy-peer-deps
npm install --save-dev @types/uuid --legacy-peer-deps
npm install --save-dev @types/pg --legacy-peer-deps
npm install @supabase/supabase-js --legacy-peer-deps
```

---

## Option 3: Use npx (No Installation Needed)

If installation keeps failing, you can run scripts directly with npx:

```bash
# Export Airtable
npx ts-node supabase/scripts/export-airtable.ts

# Import to Supabase
npx ts-node supabase/scripts/import-to-postgres.ts

# Verify
npx ts-node supabase/scripts/verify-import.ts
```

---

## Verify Installation

After installing, verify:

```bash
npx ts-node --version
```

Should show something like: `v10.9.2`

---

## Then Continue Migration

After dependencies are installed, continue with:

```bash
npm run supabase:export-airtable
```

---

## If Still Having Issues

**Alternative**: Run migrations manually using Supabase dashboard SQL Editor instead of scripts.

1. **For migrations**: Copy SQL files and paste into Supabase SQL Editor
2. **For data**: Export Airtable to CSV (manual download) and import via Supabase dashboard

**See**: `supabase/docs/MANUAL_MIGRATION.md` (to be created if needed)

---

**Next**: After installation, go back to `START_HERE.md` and continue from where you left off.





