# FEATURE_BACKLOG — Role-Based App Shell

## Milestone M0 — Setup
- [x] Create route groups `(auth)`, `(onboarding)`, `(parent)`, `(teacher)`
- [x] Add stub screens to each group

## Milestone M1 — Auth + Context
- [ ] Implement Firebase Auth (Google, Email/Password)
- [ ] Create `AuthProvider` with user & role
- [ ] Add sign-out button on both profile screens

## Milestone M2 — Functions + Airtable
- [x] Firebase Function: `/api/users/getByUid`
- [x] Firebase Function: `/api/users/upsertRole`
- [x] Implement server-side Airtable helpers
- [x] Add ID token verification middleware

## Milestone M3 — Role Gate & Shells
- [x] Implement RoleGate in `AppNavigator`
- [x] Parent/Student tabs: home, messages, profile
- [x] Teacher tabs: classes, students, inbox, profile (stubs)
- [x] AsyncStorage cache for `activeRole`

## Milestone M4 — QA & Telemetry
- [ ] Add analytics events
- [ ] Smoke tests on both shells
- [ ] Handle edge cases (offline, missing role, deleted user)
