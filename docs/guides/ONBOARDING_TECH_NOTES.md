# Onboarding & Profiles — Technical Notes

This document captures implementation details and decisions for PRD‑02.

## Router & Structure
- Using expo-router with route groups:
  - `/(auth)/signin`
  - `/(auth)/verify`
  - `/(onboarding)/role-setup`
  - `/(onboarding)/guardian-link`
  - `/(onboarding)/pending-approval`
  - `/(onboarding)/link-success`
  - `/(parent)/home`, `/(parent)/child-switcher`, `/(parent)/manage-children`
  - `children/[childId]/dashboard`, `children/[childId]/consents/index`, `children/[childId]/consents/[consentId]`, `children/[childId]/consents/history`

## Security Principles
- Derive guardian identity server-side from Firebase ID token; ignore any client-supplied guardian IDs.
- Rate-limit sensitive endpoints (lookups/search) ~60 req/min/IP + lockout after 5 failures/15 min (30 min block): returns `TOO_MANY_ATTEMPTS`.
- Storage path for signatures: `consents/{guardianUid}/{studentId}/{templateId}/{recordId}.png`.
- Storage rules enforced so only the authenticated guardian can read/write their signatures.

## Airtable Schema (Tables/Fields)
- Users: `firebaseUid` (unique), `role`, `roles?`, `activeRole?`, `name`, `email`, `language`, `createdAt`.
- Students: `fullName`, `dob`, `grade`, `school`, `studentCode` (UPPERCASE, unique), `qrToken` (24 chars), `status`, `createdAt`.
- GuardianStudentLinks: `guardianUserId` (ref Users), `studentId` (ref Students), `linkMethod`, `status`, `requestedAt`, `approvedBy`, `approvedAt`, `revokedReason?`, `createdByUid`, `createdIp`.
- InviteCodes: `code` (UPPERCASE, unique), `studentId`, `expiresAt`, `maxUses`, `uses`, `createdBy`.
- ConsentTemplates: `name`, `version`, `required`, `bodyHtmlVi`, `bodyHtmlEn`, `policyUrl`, `validFrom`, `validTo?`, `createdAt`.
- ConsentRecords: `studentId`, `guardianUserId`, `templateId`, `templateVersion`, `signedAt`, `signatureUrl`, `hash`, `status`, `revokedAt?`, `revokedReason?`, `ipAddress?`, `deviceInfo?`, `serverTimestamp`, `templateBodyHash`.
- Optional: ConsentClauses, ConsentClauseChoices.

## API Contracts (Firebase Functions)
- Auth: require ID token; bind guardian from token → lookup Users by `firebaseUid`.

### Guardian
- `POST /api/guardian/lookupCode` { code }
  - Case-insensitive; returns masked preview `{ id, fullNameInitials, grade }`, `expiresAt`.
  - Errors: `INVALID_CODE`, `EXPIRED_CODE`, `MAX_USES_REACHED`, `TOO_MANY_ATTEMPTS`.
- `POST /api/guardian/createLink` { studentId, method }
  - Derive guardian; idempotent; returns `{ link: { id, status } }` (pending|active).
  - Errors: `ALREADY_LINKED`, `NOT_AUTHORIZED`.
- `POST /api/guardian/getLinkById` { linkId }
  - Returns `{ link: { id, status } }` (pending|active|declined|revoked).
- `POST /api/guardian/getLinksForGuardian` {}
  - Returns all links for current guardian.
- `POST /api/guardian/revokeLink` { linkId, reason }
  - Verify ownership; set `status=revoked`.

### Students
- `POST /api/students/searchById` { studentCode } → masked preview.
- `POST /api/students/getByQrToken` { qrToken } → masked preview.

### Consents
- `POST /api/consents/listTemplatesForChild` { studentId } → latest templates for the child.
- `POST /api/consents/getTemplate` { templateId } → template body (vi/en), version, required.
- `POST /api/consents/createRecord` { studentId, templateId, templateVersion, signatureUrl, clauseChoices }
  - Server computes: `serverTimestamp`, `templateBodyHash`, `signatureSha256`, `recordHash`.
  - Errors: `STALE_TEMPLATE` (409), `NOT_AUTHORIZED`.
- `POST /api/consents/listRecordsForChild` { studentId } → records.

## Masking & Previews
- Masked student preview: `{ id, fullNameInitials, grade }` (e.g., `Nguyễn A. M.`). No DOB/school until link active.

## Invite Code Semantics
- `uses` increments only when a link becomes `active`.
- Enforce `expiresAt` and `maxUses` both at lookup and at activation.
- Codes are stored uppercase.

## Pending → Active Polling
- After `createLink`, client stores `linkId` and polls `getLinkById`:
  - Intervals: 5s for 30s, then 10s until 2min, then show "Tap to refresh".
  - Stop on terminal: active|declined|revoked.
  - Pending screen shows Cancel (revoke) and Retry.

## Analytics
- `onboarding_start`, `onboarding_role_selected` {role}
- `guardian_link_attempt|success|failure` {method|reason}
- `child_switch` {childId}
- `consent_view|signed|revoked` {templateId, version}
- Timing metrics (optional): `link_pending_wait_ms`, `signature_upload_ms`.

## Performance & Offline
- Cache `currentChildId` in AsyncStorage.
- Cache templates list per student (TTL ~15 min); template body up to 1h.
- Consent signing requires online.

## Storage Paths
- Signature upload path: `consents/{guardianUid}/{studentId}/{templateId}/{recordId}.png`.

## UI/UX Notes
- QR scanning: barcode scanner with torch toggle, haptic feedback, manual entry fallback.
- Empty/error states fully localized; no hardcoded strings.
- Ultra‑modern theme (rounded, shadows, large titles) consistent with current app.









