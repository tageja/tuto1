# <slug>: <Page Title>

## Goal
One sentence outcome in business terms.

## Scope
- Web route: /<slug>
- Mobile equivalents (if any): <link to mobile screen files>
- Data dependencies:
  - Airtable tables/fields:
  - Firebase functions used:
- i18n: vi (default), en (secondary)

## Deliverables
- [UI] Responsive page in /apps/web/app/<slug>/page.tsx, brand-consistent, a11y basics.
- [API] Server route(s) /apps/web/app/api/<feature>/route.ts returning typed DTOs.
- [Integration] Wiring UI↔API; shared types in /app/shared/types or pkg/*.
- [Tests] Unit tests + e2e smoke test.
- [Docs] Update this file with screenshots, data mappings, and links to PRs.

## Acceptance Criteria
- [ ] Matches mobile logic or improves it where web UX differs (explain if different).
- [ ] Vietnamese copy defaults correctly; English fallback present.
- [ ] No client-side secrets; all Airtable/Firebase calls server-side.
- [ ] Loading/empty/error states implemented.
- [ ] Lighthouse score: ≥90 perf / a11y / SEO on the page template.
- [ ] Check passes: `npm run check` (lint+type+test).

## Handoffs
- UI → API requests logged in /tasks/backend-requests.md
- API → UI unblocks logged in /tasks/frontend-unblocks.md
- Any blocking issues in /tasks/BLOCKERS.md

## Links
- Branches:
- PRs:
- Screenshots:






