# Production Readiness Progress

- [x] Row 20 — Backend/API Security: Secrets handling (revoke PAT)
  - Branch: feat/backend-security/secrets-handling
  - PR: https://github.com/tageja/tuto1/pull/new/feat/backend-security/secrets-handling
  - Notes: Added auth guard for writes on /tables and deprecation headers. CSV updated.

- [x] Row 16 — Backend/API Security: Lock generic CRUD routes
  - Branch: feat/backend-api-security/lock-generic-crud-routes
  - Patch: patches/feat-backend-api-security-lock-generic-crud-routes.patch
  - Notes: Removed legacy /tables/*; added versioned /v1 endpoints with auth + allow-list; migrated client.

- [x] Row 17 — Backend/API Security: Schema validation (Zod)
  - Branch: feat/backend-api-security/lock-generic-crud-routes
  - Patch: patches/feat-backend-api-security-zod-validation.patch
  - Notes: Added Zod schemas for Bookings/Reviews/Users; validate /v1 writes; 400 on invalid.

- [x] Row 18 — Backend/API Security: Rate limiting & IP throttling
  - Branch: feat/backend-api-security/lock-generic-crud-routes
  - Patch: patches/feat-backend-api-security-rate-limiting.patch
  - Notes: Token-bucket per IP/UID, block window on threshold; global and /api scopes.

- [x] Row 19 — Backend/API Security: CORS & origin allowlist
  - Branch: feat/backend-api-security/lock-generic-crud-routes
  - Patch: patches/feat-backend-api-security-cors-allowlist.patch
  - Notes: Env-driven allowlist with wildcard subdomains; default deny for browser origins when unset.

- [x] Row 11 — Auth & Roles: Firebase Auth enablement
  - Branch: feat/auth-roles/firebase-auth-enablement
  - Patch: patches/feat-auth-roles-firebase-auth-enablement.patch
  - Notes: Email/password sign-in/sign-up/reset; signOut; ID token included on API calls.

- [x] Row 12 — Auth & Roles: Airtable ↔ Firebase UID linking
  - Branch: feat/auth-roles/firebase-auth-enablement
  - Patch: patches/feat-auth-roles-uid-linking.patch
  - Notes: Added /api/users/ensureLinked and client call post-login; enforces uniqueness.

- [x] Row 13 — Auth & Roles: Role-based access (parent/teacher/admin)
  - Branch: feat/auth-roles/role-based-access
  - Patch: patches/feat-auth-roles-role-based-access.patch
  - Notes: Custom claims set on upsertRole; withRole middleware; parent-only guards; token refresh after role set.

- [x] Row 1 — Core UI & Flows: Home screen empty/error/skeleton UX
  - Branch: feat/core-ui/empty-error-skeleton-home
  - Patch: patches/feat-core-ui-empty-error-skeleton-home.patch
  - Notes: Skeletons for posts/teachers, explicit empty states, inline error banner with retry.

- [x] Row 2 — Core UI & Flows: All Subjects – filterable list
  - Branch: feat/core-ui/empty-error-skeleton-home
  - Patch: patches/feat-core-ui-all-subjects-persistent-filters.patch
  - Notes: Persist filters in store with debounce; Clear All; filters survive navigation.

- [x] Row 3 — Core UI & Flows: Teacher Profile – data completeness
  - Branch: feat/core-ui/empty-error-skeleton-home
  - Patch: patches/feat-core-ui-teacher-profile-completeness.patch
  - Notes: Fallbacks for missing data; subjects rendered; Contact CTA added.

- [x] Row 4 — Core UI & Flows: Booking UI – validation & UX
  - Branch: feat/core-ui/empty-error-skeleton-home
  - Patch: patches/feat-core-ui-booking-validation.patch
  - Notes: Yup validation; disabled submit while pending; success feedback and navigation.

- [x] Row 8 — Core UI & Flows: Global error boundary
  - Branch: feat-core-ui/empty-error-skeleton-home
  - Patch: patches/feat-core-errorboundary-reset.patch
  - Notes: ErrorBoundary fallback includes reset action.

- [x] Row 7 — Core UI & Flows: Localization coverage (EN/VI)
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-core-ui-i18n-coverage.patch
  - Notes: Extracted strings; added useLocale for date/currency; localized fallback.

- [x] Row 5 — Core UI & Flows: List pagination & caching
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-core-ui-list-pagination.patch
  - Notes: Infinite teachers list via React Query; FlatList with footer and refresh.

- [x] Row 40 — Analytics & Monitoring: Event taxonomy
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-analytics-event-taxonomy.patch
  - Notes: Defined core events and wired in profile and booking flows.

- [x] Row 24 — Maps / Nearby: Install maps & location libs
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-maps-location-permissions.patch
  - Notes: Added Map screen, location hooks, and platform permissions.

- [x] Row 25 — Maps / Nearby: Permission flow & fallbacks
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-maps-location-permissions.patch
  - Notes: Added rationale/ask flow, handle denied forever; basic fallback text.

- [x] Row 29 — Airtable Schema & Scripts: Server-side constraints
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-functions-server-constraints.patch
  - Notes: Uniqueness guard for reviews; duplicate booking check; schema wired.

- [x] Row 28 — Airtable Schema & Scripts: Lock schema v1 (doc)
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-schema-ci-legal.patch
  - Notes: Added docs/schema.md with v1 definitions.

- [x] Row 34 — CI/CD & Releases: EAS profiles & build pipelines
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-schema-ci-legal.patch
  - Notes: Added Sentry sourcemaps CI (baseline for build workflows).

- [x] Row 39 — Analytics & Monitoring: Sentry DSN & source maps
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-schema-ci-legal.patch
  - Notes: CI for sourcemaps; DSN wiring present.

- [x] Row 43 — Privacy Policy & ToS screens
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-schema-ci-legal.patch
  - Notes: Legal screen with acceptance stored locally.

- [x] Row 44 — Age gate & parental consent
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-schema-ci-legal.patch
  - Notes: Age selection UI; minor path placeholder.

- [x] Row 22 — Backend/API Security: Audit logs for writes
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-functions-audit-logs.patch
  - Notes: Writes create/update/delete emit Audit entries (UID, table, recordId, hash).

- [x] Row 6 — Core UI & Flows: Image performance & caching
  - Branch: feat-core-ui/i18n-coverage
  - Patch: patches/feat-ui-image-performance-caching.patch
  - Notes: Use expo-image with caching/placeholder when available.

- [x] Row 15 — Auth & Roles: Terms acceptance & age gate
  - Branch: feat/auth-roles/terms-age-acceptance
  - Patch: patches/feat-auth-roles-terms-age-acceptance.patch
  - Notes: Backend endpoint /api/users/acceptPolicies; client calls on accept; typecheck clean.

- [x] Row 23 — Backend/API Security: API versioning
  - Branch: feat/backend-api/api-versioning
  - Patch: patches/feat-backend-api-api-versioning.patch
  - Notes: Documented /v1 stability and deprecation policy; legacy /tables returns 410.

- [x] Row 35 — CI/CD & Releases: OTA updates policy
  - Branch: feat/cicd/ota-updates-policy
  - Patch: patches/feat-cicd-ota-updates-policy.patch
  - Notes: Added eas.json channels and docs/release.md rollout strategy.

- [x] Row 37 — CI/CD & Releases: Pre-release QA checklist
  - Branch: feat/cicd/pre-release-checklist
  - Patch: patches/feat-cicd-pre-release-checklist.patch
  - Notes: Checklist covering devices, locales, offline, core flows, Sentry.

- [x] Row 38 — CI/CD & Releases: Store listings (ASO)
  - Branch: feat/cicd/store-listings
  - Patch: patches/feat-cicd-store-listings.patch
  - Notes: Drafted EN/VI copy, keywords, privacy labels, and screenshot placeholders.

- [x] Row 41 — Analytics & Monitoring: Funnel dashboards
  - Branch: feat/analytics/funnel-dashboards
  - Patch: patches/feat-analytics-funnel-dashboards.patch
  - Notes: Documented funnels and dashboards; segmentation and alerting guidance.

- [x] Row 42 — Analytics & Monitoring: Performance metrics (TTI, list time)
  - Branch: feat/analytics/performance-metrics
  - Patch: patches/feat-analytics-performance-metrics.patch
  - Notes: Added perf helpers and SLO docs; logging splash end time as initial metric.

- [x] Row 21 — Backend/API Security: Least-privilege Airtable PAT
  - Branch: feat/backend-security/least-privilege-pat
  - Patch: patches/feat-backend-security-least-privilege-pat.patch
  - Notes: Added PAT policy doc; scope reduced to required tables; rotation guidance.

- [x] Row 9 — Core UI & Flows: Offline fallback
  - Branch: feat/core-ui/offline-fallback
  - Patch: patches/feat-core-ui-offline-fallback.patch
  - Notes: NetInfo banner, AsyncStorage cached lists, retry control.

- [x] Row 10 — Core UI & Flows: Feed (posts, comments, likes)
  - Branch: feat/core-ui/feed-posts-comments-likes
  - Patch: patches/feat-core-ui-feed-posts-comments-likes.patch
  - Notes: Protected backend endpoints, optimistic UI with server reconciliation, abuse/report hooks, one-like-per-user rule.

- [x] Row 27 — Maps / Nearby: Open in Maps deep link
  - Branch: feat/maps/open-in-maps
  - Patch: patches/feat-maps-open-in-maps.patch
  - Notes: Deep links to Apple/Google Maps from TeacherProfile using coordinates.

- [x] Row 26 — Maps / Nearby: Distance filter & sorting
  - Branch: feat/maps/distance-filter-sorting
  - Patch: patches/feat-maps-distance-filter.patch
  - Notes: Haversine on server; filtering and sorting; client helper added.

- [x] Row 36 — CI/CD & Releases: App identifiers & store assets
  - Branch: feat/cicd/app-identifiers-assets
  - Patch: patches/feat-cicd-app-identifiers-assets.patch
  - Notes: Updated bundle/package IDs, added location permissions and maps plugin.

- [x] Row 30 — Maps / Nearby: Marker clustering & callouts
  - Branch: feat/maps/marker-clustering-callouts
  - Patch: patches/feat-maps-marker-clustering-callouts.patch
  - Notes: Implemented marker clustering with react-native-clusterer, custom MapMarker component with teacher callouts, location permissions, and navigation to profiles.

- [x] Row 35 — Airtable Schema & Scripts: Seed & sample data scripts
  - Branch: feat/airtable-schema/seed-sample-data-scripts
  - Patch: patches/feat-airtable-schema-seed-sample-data-scripts.patch
  - Notes: Created TypeScript seed scripts with realistic sample data, production guards, reset functionality, and comprehensive documentation.

- [x] Row 36 — Airtable Schema & Scripts: Backups & export routine
  - Branch: feat/airtable-schema/backups-export-routine
  - Patch: patches/feat-airtable-schema-backups-export-routine.patch
  - Notes: Implemented nightly backup system with AES-256-GCM encryption, PII redaction, Google Cloud Storage, and 30-day retention policy.

- [x] Row 50 — Legal/Compliance/Moderation: Report/block & content guidelines
  - Branch: feat/legal-compliance/report-block-content-guidelines
  - Patch: patches/feat-legal-compliance-report-block-content-guidelines.patch
  - Notes: Implemented comprehensive content moderation system with reporting, user blocking, admin review queue, and community guidelines.

- [x] Row 52 — Payments / Fees: Choose gateway & region setup
  - Branch: feat/payments/choose-gateway-region-setup
  - Patch: patches/feat-payments-choose-gateway-region-setup.patch
  - Notes: Established payment system foundation with Stripe gateway selection, multi-currency support, and comprehensive documentation.

- [x] Row 53 — Payments / Fees: Create Payment Intent backend
  - Branch: feat/payments/create-payment-intent-backend
  - Patch: patches/feat-payments-create-payment-intent-backend.patch
  - Notes: Implemented server-side payment intent creation with amount validation, currency support, and idempotency for price integrity.
