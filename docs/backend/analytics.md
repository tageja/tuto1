# Analytics Dashboards

## Event Taxonomy (v1)
- search_open
- profile_view
- booking_start
- booking_complete
- map_open

## Funnels
1) Discovery → Conversion
- search_open → profile_view → booking_start → booking_complete
- Segments: role (parent/teacher), city, subject
- Alerts: drop >20% week-over-week

2) Retention
- D1, D7 retention; weekly active users

## Implementation
- Source: expo-firebase-analytics (+ Sentry breadcrumbs)
- Attach user context (uid, role) without PII

## Dashboard Setup
- Create charts per funnel with segment filters
- Add annotations for releases from PROGRESS.md
