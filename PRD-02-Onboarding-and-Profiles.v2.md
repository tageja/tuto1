# PRD 02 (v2) — Onboarding & Profiles (SSO, Guardian Linking, Multi‑Child, Consents)
**Project:** Tuto (React Native + Expo Router)  
**Owner:** You (with Cursor GPT‑5)  
**Date:** 2025-08-18  
**Status:** Ready for implementation

> **Authority & scope for Cursor**
> - Cursor **must create all new screens** listed here to make this feature fully working.
> - Cursor **has full authority** to run scripts to create/modify Airtable tables (schema below) and to **create new Firebase Functions** as specified.
> - UI must follow our **existing theme**, be **ultra‑modern**, responsive, bilingual (**vi default, en fallback**), and accessible.

---

## 0) Scope & Goals
**Goal:** Deliver first‑run onboarding and persistent profile features for **Parents/Students/Teachers**, including:
- **SSO sign‑in** and role capture
- **Guardian ↔ Child secure linking** (code/QR/ID with approval)
- **Multi‑child dashboard + quick switch** (for parents/guardians)
- **Consent Centre with e‑signatures** (versioned, auditable)

**Success looks like:**
- First‑run flow (sign‑in → role setup → link child → consent) completes reliably with minimal friction.
- Parents can link **≥2** children and switch instantly.
- Signed consents are **immutable**, versioned, and exportable.

**Out of scope (here):**
- Payments/fees, schedules backend, teacher roster setup, messaging internals (placeholders OK).

---

## 1) User Stories & Flows
**US‑1 (SSO):** As a user, I can sign in with Google or Email/Password (Phone later).  
**US‑2 (Role):** If my role is unknown after sign‑in, I’m prompted to choose: Parent/Guardian, Student, or Teacher.  
**US‑3 (Link Child):** As a parent, I can add a child using an **invite code**, **QR**, or **Student ID** (ID path requires approval).  
**US‑4 (Approval):** If approval is required, I see a **Pending** screen that auto‑updates when approved.  
**US‑5 (Multi‑child):** As a parent with multiple children, I can view an overview and **switch** my current child instantly.  
**US‑6 (Manage links):** I can **revoke** a child link, set a **primary** child, and nickname children locally.  
**US‑7 (Consents):** I can view **required/optional** consents per child, **sign** with e‑signature, and see **history**; I may **revoke** where policy allows.  
**US‑8 (Localization):** All onboarding screens are localized; Vietnamese is default.

**Entry points & guards (expo‑router):**
- Unauthenticated → `/(auth)/signin`  
- Authenticated & role missing → `/(onboarding)/role-setup`  
- Parent onboarding to link child → `/(onboarding)/guardian-link`  
- After link success → `children/[childId]/consents/index` if required consents pending; else `children/[childId]/dashboard`

**Navigation map**
```
(app root)
  (auth)/signin
  (auth)/verify
  (onboarding)/role-setup
  (onboarding)/guardian-link
  (onboarding)/pending-approval
  (onboarding)/link-success
  (parent)/home
  (parent)/child-switcher
  (parent)/manage-children
  children/[childId]/dashboard
  children/[childId]/consents/index
  children/[childId]/consents/[consentId]
  children/[childId]/consents/history
```

---

## 2) Data Model (Airtable)
> Cursor may create/alter these tables. Keep field names exact and camel/snake as shown.

**Users**
- `id` (pk), `firebaseUid` (unique), `role` (single select: parent|student|teacher), `roles` (multi, optional), `activeRole` (text, optional), `name`, `email`, `phone`, `language`, `createdAt`
- **Constraint:** unique index on `firebaseUid`

**Students**
- `id`, `fullName`, `dob`, `grade`, `school`, `studentCode` (unique), `qrToken` (random 24 chars), `status` (active|inactive), `createdAt`

**GuardianStudentLinks**
- `id`, `guardianUserId` (ref Users), `studentId` (ref Students), `linkMethod` (code|qr|id|magic), `status` (pending|active|declined|revoked), `requestedAt`, `approvedBy`, `approvedAt`, `revokedReason?`

**InviteCodes**
- `code` (6–8 chars), `studentId`, `expiresAt`, `maxUses`, `uses`, `createdBy`

**ConsentTemplates**
- `id`, `name`, `version` (int), `required` (bool), `bodyHtmlVi`, `bodyHtmlEn`, `policyUrl`, `validFrom`, `validTo?`, `createdAt`

**ConsentRecords**
- `id`, `studentId`, `guardianUserId`, `templateId`, `templateVersion`, `signedAt`, `signatureUrl`, `hash`, `status` (signed|revoked), `revokedAt?`, `revokedReason?`, `ipAddress?`, `deviceInfo?`

**ConsentClauses** *(optional granular toggles)*
- `templateId`, `clauseKey`, `labelVi`, `labelEn`, `required`

**ConsentClauseChoices**
- `recordId`, `clauseKey`, `value` (boolean)

**Indexes & integrity**
- Index `GuardianStudentLinks` by (`guardianUserId`, `studentId`, `status`).
- Enforce idempotency for link creation (same guardian/student creates or returns existing).  
- Consent records are **append‑only**; updates = new rows; revocation sets `status=revoked`.

---

## 3) APIs (Firebase Functions) — New Endpoints
> All endpoints require **Firebase ID token** in `Authorization: Bearer <idToken>`. Cursor must implement these Functions (TypeScript) and server‑side Airtable access. Rate‑limit at ~60 req/min/IP.

### Users (reuse from PRD‑01)
- `POST /api/users/getByUid` → `{{ uid }} ⇒ {{ user }}`  
- `POST /api/users/upsertRole` → `{{ uid, role }}`

### Guardian Linking
- `POST /api/guardian/lookupCode`  
  - **Body:** `{{ code }}`  
  - **200:** `{{ ok:true, student: {{ id, fullName, grade }} , expiresAt }} ` *(mask sensitive fields)*  
  - **404/410:** invalid/expired
- `POST /api/guardian/createLink`  
  - **Body:** `{{ guardianUserId, studentId, method: "code"|"qr"|"id" }}`  
  - **200:** `{{ ok:true, link: {{ id, status }} }}` *(status may be active or pending)*
- `POST /api/guardian/getLinksForGuardian`  
  - **Body:** `{{ guardianUserId }}`  
  - **200:** `{{ ok:true, links: [{{ id, studentId, status }}...] }}`
- `POST /api/guardian/revokeLink`  
  - **Body:** `{{ linkId, reason }}` → `{{ ok:true }}`

### Students (lookups)
- `POST /api/students/searchById`  
  - **Body:** `{{ studentCode }}` → masked student preview or 404  
- `POST /api/students/getByQrToken`  
  - **Body:** `{{ qrToken }}` → masked student preview or 404

### Consents
- `POST /api/consents/listTemplatesForChild`  
  - **Body:** `{{ studentId }}` → latest applicable templates
- `POST /api/consents/getTemplate`  
  - **Body:** `{{ templateId }}` → template (bodyHtmlVi/En, version, required)
- `POST /api/consents/createRecord`  
  - **Body:** `{{ studentId, guardianUserId, templateId, templateVersion, signatureUrl, clauseChoices: [{{clauseKey, value}}] }}`  
  - **200:** `{{ ok:true, recordId, hash }}`
- `POST /api/consents/listRecordsForChild`  
  - **Body:** `{{ studentId }}` → records[]

**Error payload (shared):** `{{ ok:false, code:"...", message:"..." }}`

---

## 4) UI (Wireframe notes + i18n keys) — **Cursor must build all screens**
**Design system:** Follow our current theme + NativeWind spacing, rounded‑2xl, soft shadows, modern cards, large titles. Ultra‑modern UI, bilingual **vi/en**, no hardcoded strings.

### Screens (new)
1. `(auth)/signin.tsx` — SSO (Google, Email/Password); “Continue” CTA.  
   - i18n: `auth.title`, `auth.google`, `auth.email`, `auth.error.generic`
2. `(auth)/verify.tsx` — OTP/email verification (if needed).  
   - i18n: `auth.verify.title`, `auth.verify.resend`
3. `(onboarding)/role-setup.tsx` — Choose role (Parent/Student/Teacher).  
   - i18n: `role.title`, `role.parent`, `role.student`, `role.teacher`, `role.saving`
4. `(onboarding)/guardian-link.tsx` — Add child via **Code / QR / Student ID** tabs.  
   - Components: `QRScanner`, `ChildPreviewCard`, `ErrorToast`  
   - i18n: `link.title`, `link.code.placeholder`, `link.scan`, `link.searchId`, `link.error.invalid`
5. `(onboarding)/pending-approval.tsx` — Poll/subscribe to link status; cancel/resubmit.  
   - i18n: `link.pending.title`, `link.pending.cancel`
6. `(onboarding)/link-success.tsx` — Success state; CTA to Consents or Dashboard.  
   - i18n: `link.success.title`, `link.success.toConsents`, `link.success.toDashboard`
7. `(parent)/home.tsx` — Multi‑child overview + **ChildSwitcher**; “Add child” CTA.  
   - i18n: `home.title`, `home.addChild`
8. `children/[childId]/dashboard.tsx` — Schedule(7d), Homework, Grades, Messages (placeholders).  
   - i18n: `child.dashboard.title`
9. `(parent)/child-switcher.tsx` — Modal with search; set **current**.  
   - i18n: `child.switcher.title`
10. `(parent)/manage-children.tsx` — List links; set primary; revoke; nickname.  
    - i18n: `child.manage.title`, `child.manage.revoke`, `child.manage.primary`
11. `children/[childId]/consents/index.tsx` — List templates w/ status badges.  
    - i18n: `consent.list.title`, `consent.status.signed|pending|revoked`
12. `children/[childId]/consents/[consentId].tsx` — Detail + **SignaturePad**; clauses.  
    - i18n: `consent.detail.title`, `consent.sign`, `consent.clauses.accept`
13. `children/[childId]/consents/history.tsx` — Records, versions, export PDF (link).  
    - i18n: `consent.history.title`, `consent.export`

**States & UX**
- Empty states with illustrations; clear errors; skeleton loaders.  
- Mask child info until link confirmed.  
- Consent signing requires all required clauses checked.

---

## 5) Permissions (Roles/Visibility Rules)
- `parent` may manage **their** `GuardianStudentLinks` only; cannot see other guardians.  
- `teacher/admin` may approve `pending` links (approval flow can be manual post‑MVP).  
- Students cannot add guardians (MVP); they may display their QR or code.  
- All Functions validate `uid` and apply server‑side filtering.

---

## 6) Analytics (Events)
- `onboarding_start`  
- `onboarding_role_selected` {{role}}  
- `guardian_link_attempt` {{method}}  
- `guardian_link_success` {{method}}  
- `guardian_link_failure` {{reason}}  
- `child_switch` {{childId}}  
- `consent_view` {{templateId, version}}  
- `consent_signed` {{templateId, version}}  
- `consent_revoked` {{templateId, reason}}

Implement via existing analytics wrapper; use `console.info` fallback if none.

---

## 7) Performance & Offline
- Cache `currentChildId` in AsyncStorage for instant context switching.  
- Cache last **templates list** per child for fast Consent index; template body can be cached for read, but **signing requires online** (MVP).  
- Guardian code/QR lookups require network (no offline).  
- Target: Child switch < **1s**; Consent index load < **1.2s** with cached text.

---

## 8) Timeline & Milestones
**M0 — Scaffolding (0.5 day)**  
Create all new screens/routes as above with stubs and i18n keys.

**M1 — Guardian Linking (1.5 days)**  
Functions: `lookupCode`, `createLink`, `getLinksForGuardian`, `revokeLink`.  
Client: guardian‑link flow + pending/success.

**M2 — Multi‑Child (1 day)**  
Parent Home + ChildSwitcher + Manage Children + persistence of `currentChildId`.

**M3 — Consent Centre (1.5 days)**  
Functions: `listTemplatesForChild`, `getTemplate`, `createRecord`, `listRecordsForChild`.  
Client: index/detail/sign/history + signature upload.

**M4 — Polish & QA (0.5 day)**  
Copy, i18n, analytics, accessibility, skeletons, error states.

> Total ≈ **5 days** focused implementation.

---

## 9) Deliverables (What Cursor should implement)
- **All new screens** listed in §4 with modern UI matching our theme.  
- Airtable schema creation (tables/fields/indexes) per §2 (scripts OK).  
- New Firebase Functions per §3 (TypeScript, protected by ID token).  
- Client API helpers to call Functions; React Query (if present) for caching.  
- Local state: `currentChildId` (AsyncStorage).  
- Signature capture & upload (Firebase Storage recommended; store URL in Airtable).  
- Full i18n keys (vi/en) for all screens; no hardcoded text.  
- Analytics events wired.  
- Update **FEATURE_BACKLOG.md** and add smoke/unit tests for helpers.

---

## 10) Risks & Edge Cases
- Code guessing → rate‑limit lookups; lock after repeated failures.  
- Expired codes; QR token rotation → clear messaging to request a new code.  
- Duplicate links → return existing `active` link (idempotent).  
- Consent template updated after signing → history preserved; new template prompts new signature if policy requires.  
- Low connectivity during sign → retry signature upload with exponential backoff.

---

## 11) QA Test Plan (Essentials)
- **SSO:** Google + Email; reopen app → session persists.  
- **Role:** Missing role triggers wizard; save routes correctly.  
- **Linking:** Valid code success; invalid/expired shows error; pending flips to active without manual refresh.  
- **Multi‑child:** Add 2 children; switch fast; persists last selection.  
- **Consents:** Sign a required consent; record appears with correct version; banner clears. Revoke (if allowed) updates history.  
- **i18n:** All strings in vi/en; no hardcoded text.  
- **Accessibility:** Buttons labeled, focus order reasonable.  
- **Security:** Try calling Functions without token → 401; cross‑guardian access blocked.

---

### Appendix A: Field Types (Airtable)
Use `Single line text` for IDs/codes, `Single select` for enums, `Attachment` for signatures, `Created time`/`Last modified time` for timestamps. Create **views** per table for API filters.

### Appendix B: Rate Limiting (guideline)
Track attempts by `(guardianUserId, code|studentCode|qrToken)`. After 5 failures/15min → temporary block (30min).
