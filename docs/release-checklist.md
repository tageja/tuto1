# Pre-release QA Checklist

## Devices & OS
- iOS: iPhone SE, iPhone 12/13/14, iPad
- Android: low-end (2GB), mid, high-end; Android 10–14

## Locales & Accessibility
- EN/VI strings present, no truncation
- Dynamic type and TalkBack/VoiceOver basic labels

## Network & Offline
- 3G throttling: no jank on Home/Lists
- Offline: banner shows, cached list appears, recovery works

## Auth & Roles
- Sign in/out/forgot password
- Role selection and guards (parent/teacher)

## Core Flows
- Search → Profile → Booking Start → Booking Complete
- Map open and permissions denied/allowed paths

## Errors & Monitoring
- ErrorBoundary renders friendly UI
- Sentry receives a test error with source maps

## Release Steps
- Typecheck, lint clean
- EAS build preview; smoke test; then production
- OTA strategy applied per docs/release.md
