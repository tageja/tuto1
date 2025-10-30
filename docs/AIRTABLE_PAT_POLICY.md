# Airtable PAT Policy (Least Privilege)

## Scope
- Base-scoped PAT only (no workspace-wide tokens)
- Access tables: TutoTeachers, TutoStudents, TutoParents, TutoBookings, TutoReviews, TutoPosts, TutoComments
- Permissions: read + write for app-required tables only

## Storage
- Configure in Firebase Functions runtime config or env on server only
- Never include in mobile bundle or public `.env`

## Rotation
- Rotate every 90 days; maintain runbook
- Staggered rollout: set new PAT, verify, then revoke old

## Verification
- After rotation, run smoke: list teachers, create booking (sandbox), post review




















