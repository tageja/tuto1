# BUG-012 Diagnostic Run — Login Redirect

**Assigned by:** QA Manager  
**Date:** 2026-03-19  
**Test:** http://localhost:3000/login  
**Credentials:** marketing@tutoglobal.com / password

---

## CONSOLE OUTPUT (localhost:3000 only)

*Full console output filtered to localhost:3000 (login + root). Raw JSON: `/Users/pc/.cursor/projects/Users-pc-tutoAll-tuto1/agent-tools/cfe0180a-9acf-4fc3-95dd-9a031f36d8fa.txt`*

```
[2026-03-19T06:58:52.650Z] [WARNING] [CursorBrowser] Native dialog overrides installed - dialogs are now non-blocking
[2026-03-19T06:58:52.660Z] [WARNING] %cDownload the React DevTools for a better development experience: https://react.dev/link/react-devtools font-weight:bold
[2026-03-19T06:58:52.686Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.686Z #_acquireLock begin -1
[2026-03-19T06:58:52.687Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.686Z #onAuthStateChange() registered callback with id b2b8812b-c921-4856-bd22-8135866d9d2d
[2026-03-19T06:58:52.693Z] [WARNING] [HMR] connected
[2026-03-19T06:58:52.695Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.695Z #onAuthStateChange() registered callback with id d4f9b174-246b-4dd6-8a8b-2210c3965311
[2026-03-19T06:58:52.715Z] [ERROR] Image with src "/images/tuto-logo.png" has either width or height modified, but not the other. If you use CSS to change the size of your image, also include the styles 'width: "auto"' or 'height: "auto"' to maintain the aspect ratio.
[2026-03-19T06:58:52.977Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.844Z #_acquireLock lock acquired for storage key tuto-dashboard-auth
[2026-03-19T06:58:52.977Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.844Z #_recoverAndRefresh() begin
[2026-03-19T06:58:52.977Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.844Z #_recoverAndRefresh() session from storage [object Object]
[2026-03-19T06:58:52.977Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.844Z #_recoverAndRefresh() session has expired with margin of 90000s
[2026-03-19T06:58:52.977Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.844Z #_callRefreshToken(lulpp...) begin
[2026-03-19T06:58:52.978Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.844Z #_refreshAccessToken(lulpp...) begin
[2026-03-19T06:58:52.978Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:52.845Z #_refreshAccessToken(lulpp...) refreshing attempt 0
[2026-03-19T06:58:53.393Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_refreshAccessToken(lulpp...) error AuthApiError: Invalid Refresh Token: Already Used
[2026-03-19T06:58:53.395Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_refreshAccessToken(lulpp...) end
[2026-03-19T06:58:53.395Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_callRefreshToken(lulpp...) error AuthApiError: Invalid Refresh Token: Already Used
[2026-03-19T06:58:53.395Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_removeSession()
[2026-03-19T06:58:53.395Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_notifyAllSubscribers(SIGNED_OUT) begin null broadcast = true
[2026-03-19T06:58:53.395Z] [WARNING] 🔄 Auth state changed: SIGNED_OUT (no session)
[2026-03-19T06:58:53.395Z] [WARNING] 🚪 User signed out, clearing state
[2026-03-19T06:58:53.396Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_notifyAllSubscribers(SIGNED_OUT) end
[2026-03-19T06:58:53.396Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.393Z #_callRefreshToken(lulpp...) end
[2026-03-19T06:58:53.396Z] [DEBUG] AuthApiError: Invalid Refresh Token: Already Used
[2026-03-19T06:58:53.396Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.394Z #_recoverAndRefresh() refresh failed with a non-retryable error, removing the session AuthApiError: Invalid Refresh Token: Already Used
[2026-03-19T06:58:53.396Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.394Z #_removeSession()
[2026-03-19T06:58:53.396Z] [WARNING] GoTrueClient@tuto-dashboard-auth:0 (2.81.0) 2026-03-19T06:58:53.394Z #_notifyAllSubscribers(SIGNED_OUT) begin null broadcast = true
[2026-03-19T06:58:53.396Z] [WARNING] 🔄 Auth state changed: SIGNED_OUT (no session)
[2026-03-19T06:58:53.397Z] [WARNING] 🚪 User signed out, clearing state
... [GoTrueClient lock/session/INITIAL_SESSION flow continues] ...
[2026-03-19T06:58:53.406Z] [WARNING] 🔄 Auth state changed: INITIAL_SESSION (no session)
[2026-03-19T06:58:53.405Z] [WARNING] ℹ️ No active session found
... [periodic _autoRefreshTokenTick, lock not available] ...
[2026-03-19T06:59:19.218Z] [ERROR] Image with src "/images/tuto-logo.png" has either width or height modified...
[2026-03-19T06:59:19.276Z] [WARNING] 🔄 Auth state changed: INITIAL_SESSION (no session)
[2026-03-19T06:59:19.260Z] [WARNING] ℹ️ No active session found
[2026-03-19T06:59:20.044Z] [DEBUG] A tree hydrated but some attributes of the server rendered HTML didn't match the client properties...
```

**Note:** No `signInWithPassword`, `SIGNED_IN`, or `/auth/v1/token` success/failure messages appear in the console after the Sign In button was clicked. The only auth activity is the initial page-load recovery of a stale session (refresh failed → session removed → SIGNED_OUT → INITIAL_SESSION).

---

## NETWORK: /auth/v1/token

**Status code:** Not captured  
**Response time:** N/A  

The browser MCP `browser_network_requests` tool returned only same-origin requests (e.g. `_next/image`). Supabase auth requests to `*.supabase.co/auth/v1/token` are cross-origin and were not included in the captured network log. **Manual DevTools Network inspection** (filter by `token` or `supabase`) is required to confirm:
- Whether a `/auth/v1/token` request was sent after Sign In
- Its HTTP status (200, 400, 401, etc.)
- Whether it remained pending or completed

---

## URL AT 10 SECONDS

```
http://localhost:3000/login
```

No redirect occurred. Page remained on `/login`.

---

## SCREENSHOTS

- **Page screenshot at 10s:** `bug012-diagnostic-10s.png` (saved to Cursor screenshots folder)
- **Console screenshot:** Not captured separately; console output above is from `browser_console_messages`
- **Network screenshot:** Not captured; manual DevTools check recommended for `/auth/v1/token`

---

## SUMMARY (for QA Manager)

| Item | Result |
|------|--------|
| Console | 344 messages from localhost:3000; no sign-in attempt or token exchange logged after Sign In click |
| Auth flow on load | Stale session in storage → refresh failed (Invalid Refresh Token: Already Used) → session removed → SIGNED_OUT → INITIAL_SESSION |
| Redirect | None; URL stayed `http://localhost:3000/login` |
| /auth/v1/token | Not captured by automation; manual check needed |

**Hypothesis:** The login form submit handler may not be calling `supabase.auth.signInWithPassword()` or the redirect logic after success. The absence of any Supabase auth logs after the Sign In click supports this.
