/**
 * Zod Validation Schemas for Settings Feature
 */

import { z } from 'zod';

// ============================================================================
// Profile Schemas
// ============================================================================

export const ProfileSchema = z.object({
  full_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  bio: z.string().max(500).optional().nullable(),
  locale: z.enum(['en', 'vi']).optional(),
  theme: z.enum(['system', 'light', 'dark']).optional(),
  timezone: z.string().max(50).optional(),
});

export type ProfileInput = z.infer<typeof ProfileSchema>;

// ============================================================================
// Branding Schemas (Admin only)
// ============================================================================

const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;

export const BrandingSchema = z.object({
  logo_url: z.string().url().optional().nullable(),
  primary_hex: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
  accent_hex: z.string().regex(hexColorRegex, 'Invalid hex color').optional(),
  header_img_url: z.string().url().optional().nullable(),
});

export type BrandingInput = z.infer<typeof BrandingSchema>;

// ============================================================================
// Integration Schemas (Admin only)
// ============================================================================

export const IntegrationTypeSchema = z.enum(['payments', 'push', 'sms']);

export const PaymentConfigSchema = z.object({
  provider: z.enum(['stripe', 'momo']),
  api_key: z.string().min(1).optional(),
  secret_key: z.string().min(1).optional(),
  webhook_secret: z.string().optional(),
  test_mode: z.boolean().optional(),
});

export const PushConfigSchema = z.object({
  provider: z.enum(['onesignal', 'webpush']),
  app_id: z.string().optional(),
  api_key: z.string().optional(),
  vapid_public_key: z.string().optional(),
  vapid_private_key: z.string().optional(),
});

export const SmsConfigSchema = z.object({
  provider: z.enum(['twilio', 'nexmo']),
  account_sid: z.string().optional(),
  auth_token: z.string().optional(),
  from_number: z.string().optional(),
});

export const IntegrationSchema = z.object({
  type: IntegrationTypeSchema,
  provider: z.string().min(1),
  config: z.union([PaymentConfigSchema, PushConfigSchema, SmsConfigSchema]),
});

export type IntegrationInput = z.infer<typeof IntegrationSchema>;

// ============================================================================
// Notification Preferences Schemas
// ============================================================================

export const NotificationChannelSchema = z.enum(['email', 'push', 'sms']);
export const NotificationTopicSchema = z.enum([
  'announcements',
  'homework',
  'events',
  'payments',
  'messages',
  'health',
]);

export const NotificationPrefItemSchema = z.object({
  channel: NotificationChannelSchema,
  topic: NotificationTopicSchema,
  enabled: z.boolean(),
});

export const NotificationPrefsSchema = z.object({
  preferences: z.array(NotificationPrefItemSchema),
});

export type NotificationPrefItem = z.infer<typeof NotificationPrefItemSchema>;
export type NotificationPrefsInput = z.infer<typeof NotificationPrefsSchema>;

// ============================================================================
// Web Push Subscription Schema
// ============================================================================

export const PushSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string().min(1),
  auth: z.string().min(1),
});

export type PushSubscriptionInput = z.infer<typeof PushSubscriptionSchema>;

// ============================================================================
// Device Schema
// ============================================================================

export const DeviceInfoSchema = z.object({
  browser: z.string().optional(),
  os: z.string().optional(),
  device_type: z.enum(['desktop', 'mobile', 'tablet']).optional(),
});

export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;

// ============================================================================
// Avatar Upload Schema
// ============================================================================

export const AvatarUploadSchema = z.object({
  file_name: z.string().min(1),
  content_type: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  size: z.number().max(1572864, 'File size must be less than 1.5MB'),
});

export type AvatarUploadInput = z.infer<typeof AvatarUploadSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

export function validateProfile(data: unknown): ProfileInput {
  return ProfileSchema.parse(data);
}

export function validateBranding(data: unknown): BrandingInput {
  return BrandingSchema.parse(data);
}

export function validateIntegration(data: unknown): IntegrationInput {
  return IntegrationSchema.parse(data);
}

export function validateNotificationPrefs(data: unknown): NotificationPrefsInput {
  return NotificationPrefsSchema.parse(data);
}

export function validatePushSubscription(data: unknown): PushSubscriptionInput {
  return PushSubscriptionSchema.parse(data);
}

// ============================================================================
// Constants
// ============================================================================

export const NOTIFICATION_CHANNELS = ['email', 'push', 'sms'] as const;
export const NOTIFICATION_TOPICS = [
  'announcements',
  'homework',
  'events',
  'payments',
  'messages',
  'health',
] as const;

export const TIMEZONES = [
  'Asia/Ho_Chi_Minh',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'America/New_York',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Australia/Sydney',
] as const;

