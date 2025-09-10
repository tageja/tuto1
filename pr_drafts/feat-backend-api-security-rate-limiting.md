Title: Backend/API Security: Rate limiting & IP throttling (CSV Row: 18)

Summary:
- Add per-IP and per-UID token bucket rate limiting middleware with temporary block on abuse

What changed:
- Global limiter and /api namespace limiter added in functions/src/index.ts
- New middleware functions/src/middleware/rateLimit.ts (configurable)

Why:
- Throttle abusive bursts; reduce spam and protect Airtable quota

Acceptance Criteria (from CSV):
- Add per-IP and per-UID rate limits; exponential backoff/block window after threshold; log hits (lightweight via response body fields)

Safety & Regressions:
- TypeScript clean; ESLint clean
- i18n: n/a
- Manual sanity: normal usage unaffected; burst returns 429 with retryAfter when blocked

Linked:
- CSV Row: 18
- Local Patch: patches/feat-backend-api-security-rate-limiting.patch
