# Release & OTA Updates Policy

## Channels
- production: stable users
- preview: QA/internal testing
- development: local/dev client

## OTA Strategy
- Native-breaking changes: disable OTA; require new binary
- Minor fixes/features: OTA to preview first, then promote to production
- Critical security fixes: OTA with forced update banner

## Process
1. Build app binaries for native changes (eas build --profile production)
2. Publish preview OTA: expo publish --release-channel preview
3. Bake time 24–48h; monitor Sentry & metrics
4. Promote to production: expo publish --release-channel production

## Safeguards
- Check EXPO_PUBLIC_APP_VERSION and display update prompts
- Feature flags for risky changes
- Sentry monitoring on release

## Rollback
- Revert to previous runtime via `expo publish:rollback`
