# Dev Agent Report — [Part Name]

**Date:** YYYY-MM-DD  
**Agent Transcript ID:** [uuid from agent-transcripts folder — e.g. af6a7a90]  
**Part:** [e.g. Part 5 — Reels/Shorts]  
**Branch:** tutoSocial1  
**Status:** Complete / Partial / Blocked

> Save this file to: `docs/pm/dev-reports/[PART_NAME]_[DATE].md`  
> Example: `docs/pm/dev-reports/PART5_REELS_2026-03-20.md`

---

## What Was Built

| Feature | File(s) Changed | Status |
|---------|----------------|--------|
| [feature name] | [file path] | ✅ Done / ⚠️ Partial / ❌ Blocked |
| [feature name] | [file path] | ✅ Done / ⚠️ Partial / ❌ Blocked |

---

## Migrations Applied

| Migration File | Applied to Supabase? | Description |
|---------------|---------------------|-------------|
| [filename.sql] | ✅ Yes (via MCP `apply_migration`) | [what this migration does] |
| [filename.sql] | ❌ No — apply manually | [reason not applied + SQL command to run] |

---

## Bugs Introduced / Found

| Bug ID | Severity | Description | File | Suggested Fix |
|--------|----------|-------------|------|---------------|
| NEW or BUG-XXX | High / Medium / Low | [clear description of the bug] | [file path] | [brief suggestion] |

> If no bugs were found or introduced, write: **None.**

---

## Bugs Fixed (if this was a fix session)

| Bug ID | Fix Applied | File(s) Changed | Migration Required? | Re-test Ready? |
|--------|------------|-----------------|--------------------|--------------  |
| BUG-XXX | [description of what was changed] | [file path] | ✅ Yes, applied / ❌ No | ✅ Yes / ❌ Needs migration first |

> If no bugs were fixed in this session, write: **N/A — this was a feature build session.**

---

## Progress Tracker Updates

Confirm you have updated `docs/prd-specs/TUTO_SOCIAL_PROGRESS_TRACKER.csv`:

- [ ] All features completed in this session are marked **Complete**
- [ ] All features partially built are marked **In Progress** with a brief note
- [ ] All blocked features are marked **Blocked** with the reason stated
- [ ] The CSV was saved and committed (or left for PM to commit)

---

## What's Left (if status is Partial or Blocked)

Describe exactly what is incomplete and what the next agent needs to pick up. Be specific.

- **File:** `apps/social/app/(main)/[feature]/page.tsx`
- **Function:** `fetchReels()` — skeleton only, needs actual Supabase query wired up
- **Next step:** Add `SELECT * FROM social_reels WHERE school_id = ?` with RLS applied
- **Blocked by:** [dependency, missing design asset, pending migration, etc.]

> If status is Complete, write: **N/A — session complete.**

---

## Notes for PM

Anything the PM must know before deciding next steps:

- Migrations that need to be applied to production before QA can test
- Third-party dependencies added (`package.json` changes)
- Environment variables added or required
- Design assets missing or approximated
- Decisions made that deviate from the PRD (and why)
- Known edge cases not yet handled

> Example: "Migration `060_reels_table.sql` was applied to Supabase dev. Must be applied to staging before QA runs."  
> Example: "Used a placeholder thumbnail upload flow — Supabase Storage bucket `reels-thumbs` must be created and policy applied before this works end-to-end."
