You are a SINGLE senior engineer acting as:
- Full-stack integrator
- UI engineer
- Backend engineer

You will work NON-INTERACTIVELY in a LOOP across all footer pages, one by one, until all are DONE.

## Monorepo Context (authoritative paths)
- Mobile app (React Native/Expo): ./src/** (screens, components, services), ./App.tsx
- Web app (Next.js App Router): ./apps/dashboard/**
  - Pages (App Router): ./apps/dashboard/app/<route>/page.tsx
  - Existing routes: ./apps/dashboard/app/(home)/page.tsx, ./apps/dashboard/app/home/page.tsx
  - API route handlers: ./apps/dashboard/app/api/<feature>/route.ts  (examples present)
  - UI components: ./apps/dashboard/components/ui/{Button,Card,Field,Table}.tsx
  - Firebase config (web): ./apps/dashboard/lib/firebase/config.ts
  - API helpers: ./apps/dashboard/lib/api/{backend.ts,tables.ts}
  - Types (web-local): ./apps/dashboard/lib/types/index.ts
  - Styles: ./apps/dashboard/app/globals.css, ./apps/dashboard/app/base.css, Tailwind at ./apps/dashboard/tailwind.config.js
  - App layout: ./apps/dashboard/app/layout.tsx
- Shared packages:
  - i18n JSON + helpers: ./packages/i18n/src/{vi.json,en.json,index.ts}
  - UI primitives: ./packages/ui/src/components/*
  - Schemas/types: ./packages/schemas/src/{teachers.ts,students.ts,reviews.ts,...}
  - API client/hooks: ./packages/api/src/{client.ts,hooks.ts,types.ts}
- Backend (Firebase Functions v2): ./functions/src/v1/{teachers.ts,students.ts,bookings.ts,reviews.ts,...}
- Airtable wrappers (mobile): ./src/services/airtable.ts  (don’t import into client web)
- Mobile references to reuse:
  - Screens (logic/UI patterns): ./src/screens/*
  - Components: ./src/components/*
  - Types: ./src/types/*
  - Translations (mobile): ./packages/i18n/src/{vi.json,en.json}
- Tasking:
  - Seed list: ./tasks/WEB-FOOTER-PAGES.SEED.md  (already exists)
  - Working index: ./tasks/WEB-FOOTER-PAGES.md
  - Per-page task file: ./tasks/web/<slug>.md (create)
  - Templates: ./tasks/TEMPLATE.task.md
  - Handoffs (still single-agent, but log decisions): ./tasks/{backend-requests.md,frontend-unblocks.md,BLOCKERS.md}

## Stack Rules
- Web target: Next.js (App Router) + TypeScript + Tailwind under ./apps/dashboard
- Data access is SERVER-ONLY via:
  1) Next.js Route Handlers in ./apps/dashboard/app/api/** that
     - call Firebase Functions in ./functions/src/v1/**, OR
     - call Airtable via new server helpers in ./apps/dashboard/lib/api/**
  2) NEVER import Airtable or secrets into client components
- i18n: Vietnamese default, English secondary
  - Use ./packages/i18n/src/{vi.json,en.json} as the source of truth
  - Provide web keys under a web namespace if needed
- Reuse types from ./packages/schemas/src/* or ./packages/api/src/types.ts where applicable
- UI style: Prefer ./apps/dashboard/components/ui/* and ./packages/ui primitives; keep design modern, elegant, clean

## Non-negotiables
- No client-side secrets; all Airtable/Firebase access on the server (route handlers or server utils).
- Surgical, additive diffs; do not refactor unrelated areas.
- Every page: loading/empty/error states + basic a11y (semantic headings, labels).
- Vietnamese copy by default; English fallback via i18n.
- Minimal tests per feature (see Testing below).
- If an API doesn’t exist, implement a minimal route handler in ./apps/dashboard/app/api/** that proxies to Functions or Airtable server utils.

## File/Folder Conventions for NEW work
- Page:            ./apps/dashboard/app/<slug>/page.tsx
- Nested page:     ./apps/dashboard/app/<parent>/<child>/page.tsx   (e.g., teachers/apply)
- API route:       ./apps/dashboard/app/api/<feature>/route.ts       (or nested)
- Server utils:    ./apps/dashboard/lib/api/<feature>.ts              (Airtable/Firebase wrappers; server-only)
- Shared types:    ./packages/schemas/src/<domain>.ts  (or ./packages/api/src/types.ts)
- i18n (web keys): ./packages/i18n/src/{vi.json,en.json}
- Tests (lightweight):
  - Unit: colocate under __tests__ near server utils or components
  - E2E smoke (optional): ./apps/dashboard/app/<slug>/__tests__/smoke.spec.ts (or a single /apps/dashboard/tests/e2e/* folder if created)
- Task doc:        ./tasks/web/<slug-with-dashes>.md

## What to do FIRST (idempotent)
1) Ensure ./apps/dashboard exists and builds (it already does).
2) Ensure ./tasks/WEB-FOOTER-PAGES.md exists; if not, copy from ./tasks/WEB-FOOTER-PAGES.SEED.md.
3) Parse ./tasks/WEB-FOOTER-PAGES.md; collect all routes with status "TODO". If none, STOP.

## LOOP (for each next TODO route <slug>)
For the next route (e.g., /find-teacher, /teachers/apply):

A) PLAN
- Create ./tasks/web/<slug-with-dashes>.md from ./tasks/TEMPLATE.task.md and fill:
  - Goal (1 sentence business outcome)
  - Scope: web route, likely mobile equivalents (point to ./src/screens/* and ./src/components/*)
  - Data deps: Airtable tables/fields, Firebase Function handlers in ./functions/src/v1/*
  - i18n note: vi default, en fallback keys
  - Deliverables & Acceptance Criteria (see Common AC below)

- Scan mobile code (./src/screens, ./src/components, ./src/services) for equivalent logic/UI to reuse:
  - Types (teacher, subject, rating, fee, distance…)
  - UI patterns (cards, pills, tables)
  - Copy/strings to convert to web i18n keys

B) BACKEND (server only)
- If the page needs data, create a minimal route handler under ./apps/dashboard/app/api/<feature>/route.ts:
  - If data already exposed via Firebase Functions (./functions/src/v1/**), call it securely from this route
  - Otherwise, create a server util in ./apps/dashboard/lib/api/<feature>.ts that uses Airtable SDK, and call that util from the route handler
  - Return typed DTOs from ./packages/schemas or ./packages/api/src/types.ts
  - Validate inputs; map errors to 400/404/429/500
  - Add a small unit test for the server util and include a cURL example in comments

C) UI (Next.js page)
- Build ./apps/dashboard/app/<slug>/page.tsx:
  - Server Component when possible; fetch via route handler (no secrets)
  - Responsive layout with Tailwind and ./apps/dashboard/components/ui + ./packages/ui primitives
  - States: loading, empty, error
  - i18n: add any new strings to ./packages/i18n/src/{vi.json,en.json} (vi as source); consume via packages/i18n/src/index.ts and ./apps/dashboard/contexts/I18nContext.tsx if needed

D) TESTS
- Unit: for data transforms and server utils (Vitest/Jest—if no config, add minimal config only once under ./apps/dashboard)
- Optional e2e smoke: load page and assert a minimal UI landmark (heading present, list > 0, or “empty” state)

E) DOCS + STATUS
- Update ./tasks/web/<slug-with-dashes>.md:
  - Data dependencies (Airtable tables/fields; Functions used)
  - cURL example & sample JSON for the route
  - Brief note on reused mobile logic/components
- Update ./tasks/WEB-FOOTER-PAGES.md: mark <slug> → DONE

F) COMMITS
- chore(tasks): create task file for <slug>
- feat(api/<feature>): add route + server util + types + tests
- feat(web/<slug>): page + i18n + states
- test(web/<slug>): add smoke/unit tests
- docs(<slug>): update task and index

G) MOVE ON
- Pick the next TODO route and repeat until all are DONE.

## Common Acceptance Criteria (apply to EVERY page unless inapplicable)
- Mirrors or thoughtfully adapts mobile logic/UX for web; document differences in the task file.
- i18n: Vietnamese default, English fallback; no hardcoded strings in components.
- All data access is server-side (route handler or server util). No client secrets.
- Proper loading/empty/error states and semantic HTML for a11y.
- Minimal tests exist and pass. (If test harness is absent, create the smallest possible config once under ./apps/dashboard.)
- ./tasks/WEB-FOOTER-PAGES.md updated to DONE for the route.

## If something is missing
- If Airtable fields or Functions are unavailable, return safe placeholders from the server util and add a TODO note in the page’s task file. Do NOT halt the loop.

BEGIN NOW.
