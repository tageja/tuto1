# FOLDER CHANGE — Active Working Directory Has Moved

**Status:** ACTIVE
**Date opened:** 2026-05-20
**Last updated:** 2026-05-20 15:30 (UTC+7) by Orchestrator (Claude Opus)

---

## TL;DR for any agent reading this

**The only folder you should work in is:**

```
C:\Users\ASUS\tuto-nursemed-practice-pilot
```

All other folders (`C:\Users\admin\...` and `D:\Work\...`) are deprecated. Do NOT write to them. Do NOT cd into them. If your Cursor terminal opens into one of them by default, escalate to Tarun — do not silently work there.

---

## Why this change happened

This machine has had three copies of the repo at different times due to Windows permission issues:

| Folder | Status | Why it exists |
|---|---|---|
| `C:\Users\admin\tuto-nursemed-practice-pilot` | **STALE — DO NOT USE** | Original location on the new laptop. Owned by user `admin`, write-locked for user `ASUS`. Stuck at commit `113eb14` (Module 2 era). |
| `D:\Work\tuto-nursemed-practice-pilot.BACKUP-2026-05-20` | **ARCHIVED** | Was the active folder during the M3–M12 QA campaign (May 19). All QA work was committed and pushed from here. Renamed with `.BACKUP` suffix on 2026-05-20 after consolidation. Will be deleted after a 7-day safety period. |
| `C:\Users\ASUS\tuto-nursemed-practice-pilot` | **ACTIVE** | Created today (2026-05-20 ~14:39) by copying `D:\Work\tuto-nursemed-practice-pilot` to ASUS's home so the PM/designer agent could write files. This is now the single source of truth. |

Both `D:\Work` and `C:\Users\ASUS` were on the same branch (`agent-x-integration`) at the same commit (`bfa43cd`) at the moment of the copy, so there was no divergence to resolve.

---

## What was committed during the consolidation

| Commit | What | Where it was authored | Now lives in |
|---|---|---|---|
| `1b94a55` | `perf(med): disable Turbopack in dev to cut RAM usage from 25GB to under 5GB` | `D:\Work` | `C:\Users\ASUS` + `origin/agent-x-integration` |
| `9f804da` | `feat(med): HCMUTE pilot homepage with 3 course cards and pilot_interest capture` | `C:\Users\ASUS` (PM agent) | `C:\Users\ASUS` + `origin/agent-x-integration` |

Both pushed to GitHub. `agent-x-integration` is the single shared branch.

A follow-up `package.json` fix landed on top to use `--webpack` instead of the non-existent `--no-turbopack` flag (Next.js 16.2.2 uses `--webpack`, not `--no-turbopack`).

---

## Dev environment fixes applied (still active)

1. **Windows Defender exclusions** added (`D:\Work`, `C:\Users\admin\tuto-nursemed-practice-pilot`, `%APPDATA%\npm`, `%LOCALAPPDATA%\npm-cache`, `node.exe`) — stops Defender scanning every file during `next dev` compile. **Recommend adding `C:\Users\ASUS\tuto-nursemed-practice-pilot` to this list** (requires admin PowerShell): `Add-MpPreference -ExclusionPath "C:\Users\ASUS\tuto-nursemed-practice-pilot"`
2. **`apps/med/package.json` dev script** now hardcodes `node ./node_modules/next/dist/bin/next` to bypass the monorepo hoisting issue where the root `node_modules/next` is v15.5.6 but `apps/med/node_modules/next` is v16.2.2. Without the explicit path, npm sometimes resolves the wrong version.
3. **`--webpack` flag** instead of Turbopack default — saves ~20GB RAM during dev.

Dev server now starts in ~465ms with sane memory usage.

---

## Action required from Tarun

**In Cursor:** `File → Open Folder...` and select `C:\Users\ASUS\tuto-nursemed-practice-pilot`. The IDE is still pointed at the stale `C:\Users\admin\...` folder, so any terminal opened in Cursor defaults to running scripts there (which is why the dev server kept erroring with the OLD `--no-turbopack` script).

Cursor's title bar should read `tuto-nursemed-practice-pilot` and `pwd` in a fresh terminal should print `C:\Users\ASUS\tuto-nursemed-practice-pilot`.

---

## Session activity log

Append a row every time you (any agent) work in this consolidated environment. Newest at the top.

| Date / Time (UTC+7) | Agent | What you did | Where you wrote files |
|---|---|---|---|
| 2026-05-20 15:31 | PM / Designer agent — GPT-5.5 | Read the folder-state file first, confirmed the active working tree is `C:\Users\ASUS\tuto-nursemed-practice-pilot`, and verified the HCMUTE homepage + `pilot_interest` enrollment API are present with no targeted linter errors. Checked local git state and prepared to commit/push the remaining consolidation/dev-server/session-log changes on `agent-x-integration`. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 15:30 | Orchestrator (Claude Opus, opened on `C:\Users\admin\...`, wrote via absolute paths to `C:\Users\ASUS\...`) | Created this `FOLDER_CHANGE.md`. Killed stale node processes. Diagnosed and fixed Next 15 vs 16 version conflict + wrong `--no-turbopack` flag → now `--webpack` with explicit local binary path. Verified dev server starts cleanly. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 15:15 | Orchestrator | Folder consolidation: copied package.json from D:\Work to C:\Users\ASUS, committed 2 clean commits (`1b94a55` perf + `9f804da` homepage), pushed to `origin/agent-x-integration`, renamed D:\Work folder to `.BACKUP-2026-05-20`. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 ~14:30 | PM/Designer agent (separate Cursor session) | Redesigned `apps/med/app/page.tsx` (HCMUTE pilot homepage with 3 course cards) and extended `apps/med/app/api/enrollments/route.ts` to accept `mode: "pilot_interest"` submissions. Could not create a new `/api/pilot-interest/route.ts` directory (permission issue at the time) so extended the existing route. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 ~14:39 | Tarun (manually) | Copied `D:\Work\tuto-nursemed-practice-pilot` → `C:\Users\ASUS\tuto-nursemed-practice-pilot` to give the PM agent a writable workspace. | `C:\Users\ASUS\tuto-nursemed-practice-pilot` |
| 2026-05-20 (earlier) | Orchestrator | Cleaned up 21 untracked QA scripts in `D:\Work` (commit `bfa43cd`). Inserted M9–M12 L2/L3 audio_shadow + L4 quiz steps into Supabase. Generated audio shadow QA verification specs. | `D:\Work\tuto-nursemed-practice-pilot` (later mirrored into ASUS via copy) |

---

## Rules for the next agent

1. **Confirm your cwd before any file operation.** Run `pwd` (or check `$PWD`) — it must start with `C:\Users\ASUS\tuto-nursemed-practice-pilot`. If it doesn't, stop and re-open the workspace.
2. **Never write to `C:\Users\admin\...` or `D:\Work\...`.** Both are read-only / backup / stale. If you need to compare with what was there, use `git log` — the history is identical up to the point of divergence.
3. **All commits go to branch `agent-x-integration` and get pushed to `origin/agent-x-integration`.** No new feature branches without explicit instruction.
4. **Append your session row to the table above before you end your turn.** One row, newest at top, with: timestamp (UTC+7), agent identity, one-paragraph "what you did", folder you wrote to.
5. **If you hit any "Access denied" / `EPERM` / `EACCES` error**, do NOT silently work around it by writing somewhere else. Stop and report. The whole reason this file exists is because silent workarounds created three divergent copies.

---

## Deletion plan (housekeeping)

After **2026-05-27** (one week safety window), Tarun can run:

```powershell
# Remove the backup
Remove-Item -Recurse -Force "D:\Work\tuto-nursemed-practice-pilot.BACKUP-2026-05-20"
```

The stale `C:\Users\admin\tuto-nursemed-practice-pilot` cannot be removed by user ASUS due to permissions. It is harmless as long as no one accidentally `cd`s into it.
