# Settings Feature Documentation

## Overview

The Settings feature provides Admin and Parent users with the ability to manage their profiles, preferences, and school integrations. It follows the established patterns in the Tuto dashboard and uses Supabase for data persistence.

## Routes

| Role | Route | Description |
|------|-------|-------------|
| Admin | `/school/:schoolId/admin/settings` | Admin settings with Profile, Preferences, Integrations, Notifications tabs |
| Parent | `/school/:schoolId/parent/settings` | Parent settings with Profile, Preferences, Notifications, Privacy tabs |

Both routes support a `?tab=` query parameter to navigate directly to a specific tab.

## Data Model

### Tables

#### `school_users`
Maps users to schools with their roles.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| school_id | uuid | FK to schools |
| user_id | uuid | FK to users |
| role | text | 'admin', 'teacher', 'parent' |
| created_at | timestamptz | Creation timestamp |

#### `user_profiles`
Extended user profile data beyond the base `users` table.

| Column | Type | Description |
|--------|------|-------------|
| user_id | uuid | Primary key, FK to users |
| full_name | text | Display name |
| phone | text | Phone number |
| avatar_url | text | Avatar image URL |
| bio | text | Short biography |
| locale | text | 'en' or 'vi' |
| theme | text | 'system', 'light', 'dark' |
| timezone | text | IANA timezone string |
| twofa_enabled | boolean | 2FA status flag |
| updated_at | timestamptz | Last update timestamp |

#### `school_branding`
School visual customization (admin only).

| Column | Type | Description |
|--------|------|-------------|
| school_id | uuid | Primary key, FK to schools |
| logo_url | text | School logo URL |
| primary_hex | text | Primary color hex code |
| accent_hex | text | Accent color hex code |
| header_img_url | text | Header background image |
| updated_by | uuid | FK to users |
| updated_at | timestamptz | Last update timestamp |

#### `school_integrations`
Third-party service configurations (admin only).

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| school_id | uuid | FK to schools |
| type | text | 'payments', 'push', 'sms' |
| provider | text | Provider name |
| config | jsonb | Provider-specific config |
| connected_at | timestamptz | Connection timestamp |
| connected_by | uuid | FK to users |

#### `notification_preferences`
User notification preferences matrix.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| channel | text | 'email', 'push', 'sms' |
| topic | text | 'announcements', 'homework', etc. |
| enabled | boolean | Preference state |
| updated_at | timestamptz | Last update timestamp |

#### `user_devices`
Device/session tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| device_info | jsonb | Browser, OS, device type |
| user_agent | text | User agent string |
| ip_address | text | IP address |
| last_seen_at | timestamptz | Last activity |
| created_at | timestamptz | First login |

#### `web_push_subscriptions`
Browser push notification subscriptions.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| endpoint | text | Push service endpoint |
| p256dh | text | Public key |
| auth | text | Auth secret |
| created_at | timestamptz | Subscription timestamp |

#### `audit_logs`
Settings change audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| school_id | uuid | FK to schools (optional) |
| action | text | Action identifier |
| entity_type | text | Table name |
| entity_id | uuid | Record ID |
| meta | jsonb | Additional data |
| created_at | timestamptz | Log timestamp |

## RLS Policies

- **user_profiles**: Users can only access their own profile
- **school_branding**: All school members can read; only admins can write
- **school_integrations**: Admin only
- **notification_preferences**: Users can only access their own
- **user_devices**: Users can only access their own
- **web_push_subscriptions**: Users can only access their own
- **audit_logs**: Users can read their own; admins can read school logs

## Storage

### `user-avatars` Bucket

- **Public read**: Anyone can view avatars
- **Path format**: `{user_id}/avatar.{ext}`
- **Allowed types**: JPEG, PNG, WebP
- **Max size**: 1.5MB
- **Write policy**: Users can only upload to their own folder

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/school/settings/profile` | Get current user profile |
| PUT | `/api/school/settings/profile` | Update profile |
| POST | `/api/school/settings/avatar` | Upload avatar |
| GET | `/api/school/settings/branding?schoolId=X` | Get school branding |
| PUT | `/api/school/settings/branding?schoolId=X` | Update branding |
| GET | `/api/school/settings/integrations?schoolId=X` | List integrations |
| POST | `/api/school/settings/integrations?schoolId=X` | Create/update integration |
| DELETE | `/api/school/settings/integrations?schoolId=X&type=Y` | Delete integration |
| GET | `/api/school/settings/notifications` | Get notification prefs |
| PUT | `/api/school/settings/notifications` | Update notification prefs |
| GET | `/api/school/settings/devices` | List user devices |
| POST | `/api/school/settings/devices` | Register device |
| DELETE | `/api/school/settings/devices?id=X` | Revoke device |
| GET | `/api/school/settings/push-subscription` | Get push status |
| POST | `/api/school/settings/push-subscription` | Subscribe to push |
| DELETE | `/api/school/settings/push-subscription` | Unsubscribe |

## Components

| Component | Location | Purpose |
|-----------|----------|---------|
| SettingsTabs | `components/settings/SettingsTabs.tsx` | Tab navigation |
| ProfileForm | `components/settings/ProfileForm.tsx` | Profile editing |
| PreferencesForm | `components/settings/PreferencesForm.tsx` | Language/theme/timezone |
| NotificationsForm | `components/settings/NotificationsForm.tsx` | Notification matrix |
| DevicesList | `components/settings/DevicesList.tsx` | Session management |
| BrandingForm | `components/settings/BrandingForm.tsx` | School branding |
| IntegrationsForm | `components/settings/IntegrationsForm.tsx` | Third-party services |
| PrivacyPanel | `components/settings/PrivacyPanel.tsx` | Privacy settings stub |

## i18n Keys

All UI strings use the `settings.*` namespace in the i18n files:

- `settings.title` - Page title
- `settings.tabs.*` - Tab labels
- `settings.profile.*` - Profile form
- `settings.preferences.*` - Preferences form
- `settings.notifications.*` - Notification settings
- `settings.devices.*` - Device list
- `settings.branding.*` - Branding form
- `settings.integrations.*` - Integrations form
- `settings.privacy.*` - Privacy panel
- `settings.toasts.*` - Toast messages

## Extension Guide

### Adding a New Tab

1. Add tab type to `SettingsTab` in `SettingsTabs.tsx`
2. Add i18n key: `settings.tabs.newTab`
3. Create component in `components/settings/`
4. Add to page switch statement
5. Update `ADMIN_TABS` or `PARENT_TABS` arrays

### Adding a New Integration Type

1. Add type to `IntegrationTypeSchema` in `lib/validation/settings.ts`
2. Create config schema (e.g., `NewConfigSchema`)
3. Add to `PROVIDERS` in `IntegrationsForm.tsx`
4. Add i18n keys: `settings.integrations.newType.*`
5. Add config fields UI in `renderConfigFields()`

### Adding a New Notification Topic

1. Add to `NOTIFICATION_TOPICS` in `lib/validation/settings.ts`
2. Update topic CHECK constraint in database
3. Add i18n key: `settings.notifications.topics.newTopic`

## Security Considerations

1. **RLS**: All queries go through RLS policies scoped by user_id and school_id
2. **Sensitive data**: Integration secrets are masked in API responses
3. **Avatar uploads**: File type and size validated server-side
4. **Audit logging**: All settings changes are logged
5. **Session management**: Users can revoke devices

## Testing Checklist

- [ ] Profile form saves and reloads correctly
- [ ] Avatar upload compresses and uploads
- [ ] Language switch applies immediately
- [ ] Theme switch applies immediately
- [ ] Notification matrix toggles work
- [ ] Admin sees Integrations tab; Parent does not
- [ ] Parent sees Privacy tab; Admin does not
- [ ] Device list shows and revokes work
- [ ] Branding preview updates live
- [ ] Integration connect/disconnect works
- [ ] All strings are i18n (no hardcoded text)
- [ ] Tabs persist via URL query param

