# Fix: ts-node Not Recognized

**Error**: `'ts-node' is not recognized as an internal or external command`

**Solution**: Install required dependencies.

---

## ✅ Quick Fix

Run this command in your project root (where package.json is):

```bash
npm install --legacy-peer-deps
```

This will install all the dependencies I added to package.json, including:
- ts-node
- pg (Postgres client)
- uuid
- @supabase/supabase-js
- And other required packages

---

## After Installation

Try running the export again:

```bash
npm run supabase:export-airtable
```

Should now work! ✅

---

## If Still Having Issues

Run this to install specifically:

```bash
npm install --save-dev ts-node --legacy-peer-deps
```

---

## Alternative: Use npx

If installation keeps failing, you can use npx instead (no installation needed):

```bash
npx ts-node supabase/scripts/export-airtable.ts
```

---

**Next**: After `npm install`, continue with the migration steps in `START_HERE.md`









