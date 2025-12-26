/**
 * Settings Types for Mobile App
 * Mirrors web dashboard validation schemas
 */

// Profile Types
export interface ProfileInput {
  full_name?: string;
  phone?: string | null;
  bio?: string | null;
  locale?: 'en' | 'vi';
  theme?: 'system' | 'light' | 'dark';
  timezone?: string;
}

export interface ProfileData {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  locale: 'en' | 'vi';
  theme: 'system' | 'light' | 'dark';
  timezone: string;
  twofa_enabled: boolean;
  updated_at: string | null;
}

// Notification Preferences Types
export type NotificationChannel = 'email' | 'push' | 'sms';
export type NotificationTopic = 'announcements' | 'homework' | 'events' | 'payments' | 'messages' | 'health';

export interface NotificationPrefItem {
  channel: NotificationChannel;
  topic: NotificationTopic;
  enabled: boolean;
}

export interface NotificationPrefsInput {
  preferences: NotificationPrefItem[];
}

// Branding Types (Admin only)
export interface BrandingInput {
  logo_url?: string | null;
  primary_hex?: string;
  accent_hex?: string;
  header_img_url?: string | null;
}

export interface BrandingData {
  school_id: string;
  school_name: string;
  school_address: string | null;
  school_phone: string | null;
  school_email: string | null;
  logo_url: string | null;
  primary_hex: string;
  accent_hex: string;
  header_img_url: string | null;
  updated_at: string | null;
}

// Integration Types (Admin only)
export type IntegrationType = 'payments' | 'push' | 'sms';

export interface Integration {
  id: string;
  type: IntegrationType;
  provider: string;
  config: Record<string, any>;
  connected_at: string;
}

export interface IntegrationInput {
  type: IntegrationType;
  provider: string;
  config: Record<string, any>;
}

// Device Preferences Types (Mobile-specific)
export interface DevicePreferences {
  biometric_enabled: boolean;
  push_notifications_enabled: boolean;
  sound_alerts_enabled: boolean;
  vibration_alerts_enabled: boolean;
  data_saver_enabled: boolean;
  wifi_only_downloads_enabled: boolean;
}

// Constants
export const NOTIFICATION_CHANNELS: readonly NotificationChannel[] = ['email', 'push', 'sms'] as const;
export const NOTIFICATION_TOPICS: readonly NotificationTopic[] = [
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






