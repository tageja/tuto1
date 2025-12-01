# Performance Metrics & SLOs

## Key Metrics
- App Start (cold): time from launch to first usable screen
- Time-to-First-List (TTFL): Home teachers list render
- API p95 latency: Functions endpoints (v1 tables, provider search)

## Targets (SLOs)
- App Start (cold): ≤ 2500 ms p95
- TTFL: ≤ 1500 ms p95 on 3G
- API p95: ≤ 800 ms (functions), ≤ 1200 ms (Airtable)

## Measurement
- Use `performance.now()` and log via analytics `logEvent`
- Add Sentry breadcrumbs for timings for fallback visibility

## Reporting
- Weekly dashboard with trend lines
- Alert when SLO missed 3 days in a row


































