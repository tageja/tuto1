# Database Webhook Setup — social-notify

**Configured:** 2026-03-21  
**Configured by:** PM (manual step in Supabase Dashboard)

## Webhook Details

| Field | Value |
|-------|-------|
| Name | `notify_on_social_notification_insert` |
| Table | `social_notifications` |
| Event | `INSERT` only |
| Type | HTTP Request (POST) |
| URL | `https://fkjeggdxqifqqwhuqpgm.supabase.co/functions/v1/social-notify` |
| Auth Header | `Authorization: Bearer <service_role_key>` |

## What it does

Every time a row is inserted into `social_notifications` (triggered by likes, comments, follows, reel likes via DB triggers from migration 074), this webhook fires the `social-notify` Edge Function, which reads the notification type and sends a push notification to the recipient's Expo push token (stored in `social_profiles.push_token`).

## Status

✅ Active — configured and saved in Supabase Dashboard.

## To verify

1. Go to Supabase Dashboard → Edge Functions → `social-notify` → Logs
2. Perform a like action in the mobile app
3. A log entry should appear within a few seconds
