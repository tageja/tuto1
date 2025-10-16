# Backend Rules

- Centralize Airtable API in `src/services/airtable.ts` with axios.
- Read base/table IDs and PAT from env vars; never hardcode secrets.
- Share request/response schemas via `packages/schemas`.
- Add input validation and clear error messages for all routes.
- Log with structured context; no PII in logs.
- Version APIs and document breaking changes.



