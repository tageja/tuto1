# Backend Requests

Track backend work needed to unblock product and frontend.

## Request Backlog

- [ ] Endpoint: <name>
  - Summary: <short description>
  - Method/Path: <GET|POST|PUT|DELETE> /api/... 
  - Auth/Scopes: <required auth + scopes>
  - Request Shape: <type or schema link>
  - Response Shape: <type or schema link>
  - Acceptance Criteria:
    - [ ] Returns correct status codes
    - [ ] Validates input and errors clearly
    - [ ] Includes pagination/filters if applicable
  - Priority: P0 | P1 | P2
  - Owner: <name>
  - ETA: <date>

## Notes
- Prefer typed contracts shared via `packages/schemas` where possible.
- Document any breaking changes and provide migration notes.



