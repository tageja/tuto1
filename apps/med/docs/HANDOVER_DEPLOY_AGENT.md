# Handover: Deploy Agent — Fix Vercel Production Build Failure

**Date:** 2026-05-24  
**Branch:** `agent-x-integration`  
**Repo:** https://github.com/tageja/tuto1  
**Vercel Project:** `tarun-tagejas-projects/med`  
**Vercel Project ID:** `prj_23SdtfcC8eLN0p6rjPRaHX7PHkRl`  
**App directory:** `apps/med` (monorepo, `rootDirectory: apps/med` set in Vercel)

---

## 🎯 Your One Job

**Get `apps/med` to build successfully on Vercel and promote it to production.**

The local build (`npx next build` inside `apps/med`) passes with exit code 0. Every Vercel build is failing with status `Error` after ~57 seconds. The CLI reports logs are unavailable for ERROR-status deployments.

---

## 📋 What Has Already Been Done (Do NOT Repeat)

1. **Next.js updated to `16.2.6`** across all three `package.json` files:
   - `package.json` (root)
   - `apps/med/package.json`
   - `apps/dashboard/package.json`

2. **postcss updated to `8.5.15`** in `apps/med/package.json` and the root has `overrides` to force `next`'s nested postcss to `>=8.5.10`.

3. **`turbopack.resolveAlias`** in `apps/med/next.config.ts` points `@ai-sdk/gateway` to a browser stub (`./src/stubs/ai-sdk-gateway.ts`). This fixes the `Module not found: Can't resolve 'zod'` Turbopack error that was occurring in the client bundle. **Local build passes.**

4. **`ScriptReadStep.tsx`** duplicate `supervisor` key was fixed.

5. All changes are committed and pushed to `agent-x-integration`.

---

## 🔍 The Actual Problem: Unknown Vercel Build Error

The Vercel CLI cannot retrieve logs for ERROR-state deployments:
```
Error: Logs are unavailable because deployment dpl_3w9UU6gaeSVzADNfRmxKJLYBDZYT 
never reached READY and ended in ERROR.
```

`vercel inspect` shows builds completing in `[0ms]` which suggests the build may be getting **blocked by Vercel's security scanner** before the actual Next.js build starts — OR the build log is simply not available via CLI for error states.

**Critical first step: Get the actual Vercel build log.** Use the browser to log into https://vercel.com and find the build output for the latest failed deployment of project `med`.

---

## 🔑 Key Files

| File | Notes |
|------|-------|
| `apps/med/next.config.ts` | Has `turbopack.resolveAlias` for `@ai-sdk/gateway` browser stub |
| `apps/med/src/stubs/ai-sdk-gateway.ts` | The browser stub (empty exports) |
| `apps/med/package.json` | `next: ^16.2.6`, `zod: ^3.25.76`, `ai: ^6.0.190` |
| `package.json` (root) | `next: ^16.2.6`, `zod: ^4.1.12` (different zod major — intentional, workspaces handle it) |
| `apps/med/vercel.json` | `installCommand: npm install --legacy-peer-deps`, `buildCommand: npm run build` |
| `apps/med/.vercel/project.json` | `projectId: prj_23SdtfcC8eLN0p6rjPRaHX7PHkRl` |

---

## 🚨 Known Issues / Hypotheses for the Vercel Build Failure

### Hypothesis 1: Security scanner still blocking (most likely)
`vercel inspect` shows `builds ╶ . [0ms]` — the build never actually started. This pattern matches Vercel's security scanner blocking the deploy before the build container spins up. The scanner checks package versions in `package-lock.json` (not just `package.json`).

**Check:** Open the Vercel dashboard → find the deployment → look at the "Build Logs" tab for the exact error message. It will say either "Vulnerable version detected" or show a real compile error.

**Possible fix:** Run `npm audit` in `apps/med` and check if any `next` or `postcss` entries still show as vulnerable. If the lock file has old pinned versions, delete `package-lock.json` entries for those packages and re-run `npm install`.

### Hypothesis 2: The `@ai-sdk/gateway` stub alias not working on Vercel Linux
The relative path `./src/stubs/ai-sdk-gateway` might not resolve correctly from Vercel's build environment. In that case:
- Try making `RefinementChat.tsx` avoid importing `DefaultChatTransport` from `'ai'` entirely
- Use a server action or plain `fetch` instead of `useChat` transport

### Hypothesis 3: Something else entirely
The build log will tell you. **You must see the actual Vercel build output to diagnose further.**

---

## 🛠 Deployment Commands

```powershell
# Check latest deployments
Set-Location "C:\Users\ASUS\tuto-nursemed-practice-pilot\apps\med"
npx vercel ls

# Trigger a new deployment manually (from apps/med)
npx vercel --prod

# Check git status
Set-Location "C:\Users\ASUS\tuto-nursemed-practice-pilot"
git status
git log --oneline -5
```

---

## 📁 Project Structure

```
tuto-nursemed-practice-pilot/           ← monorepo root
├── package.json                        ← root workspace (next 16.2.6, zod 4.x)
├── apps/
│   ├── med/                            ← THE APP (this is what deploys to Vercel)
│   │   ├── next.config.ts              ← turbopack alias config
│   │   ├── vercel.json                 ← deploy config
│   │   ├── src/stubs/ai-sdk-gateway.ts ← browser stub
│   │   └── package.json               ← next 16.2.6, zod 3.x, ai 6.x
│   └── dashboard/                     ← separate Vercel project (not broken)
└── apps/med/.vercel/project.json      ← projectId for med
```

---

## ✅ Definition of Done

1. Vercel deployment for `apps/med` reaches `READY` status (not `Error`, not `Blocked`)
2. The production URL (currently broken) serves the app correctly
3. All changes are committed and pushed to `agent-x-integration`
4. Optionally: merge `agent-x-integration` → `main` if the build passes

---

## 🔗 Useful Links

- Vercel Dashboard: https://vercel.com/tarun-tagejas-projects/med
- GitHub Repo: https://github.com/tageja/tuto1
- Branch: `agent-x-integration`
- Last working deployment: `med-6nl5qlpfe` (2 days ago, Preview, 48s build)
