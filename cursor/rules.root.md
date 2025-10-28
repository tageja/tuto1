# Project Rules (Root)

- Source lives under `src/`.
- TypeScript strict mode; no `any` in app code.
- Environment via `.env` and `process.env` access only.
- UI uses NativeWind with tokens from `src/theme`.
- All user text keys come from `src/translations`.
- Error boundary wraps navigation tree.
- Analytics: Sentry + Firebase Analytics initialized in app entry.






