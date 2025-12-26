/**
 * Notification Preferences Service
 * Handles notification preferences operations with Supabase
 */

import { supabase } from '../../config/supabase';
import type { NotificationPrefItem, NotificationPrefsInput } from '../../types/settings';
import { NOTIFICATION_CHANNELS, NOTIFICATION_TOPICS } from '../../types/settings';

/**
 * Get notification preferences matrix
 * Returns full matrix with defaults (all enabled by default)
 */
export async function getNotificationPreferences(userId: string): Promise<NotificationPrefItem[]> {
  // Verify user exists
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!userData) {
    throw new Error('User not found');
  }

  // Get existing preferences
  const { data: prefs, error } = await supabase
    .from('notification_preferences')
    .select('channel, topic, enabled')
    .eq('user_id', userData.id);

  if (error) {
    throw error;
  }

  // Build full matrix with defaults (all enabled by default)
  const prefsMap = new Map(
    (prefs || []).map(p => [`${p.channel}:${p.topic}`, p.enabled])
  );

  const matrix: NotificationPrefItem[] = [];
  
  for (const channel of NOTIFICATION_CHANNELS) {
    for (const topic of NOTIFICATION_TOPICS) {
      const key = `${channel}:${topic}`;
      matrix.push({
        channel,
        topic,
        enabled: prefsMap.get(key) ?? true, // Default to enabled
      });
    }
  }

  return matrix;
}

/**
 * Update notification preferences (bulk upsert)
 */
export async function updateNotificationPreferences(
  userId: string,
  preferences: NotificationPrefItem[]
): Promise<void> {
  // Verify user exists
  const { data: userData } = await supabase
    .from('users')
    .select('id')
    .eq('id', userId)
    .single();

  if (!userData) {
    throw new Error('User not found');
  }

  // Upsert all preferences
  const upsertData = preferences.map(pref => ({
    user_id: userData.id,
    channel: pref.channel,
    topic: pref.topic,
    enabled: pref.enabled,
    updated_at: new Date().toISOString(),
  }));

  // Note: Supabase doesn't support multi-column unique constraint upsert easily
  // So we'll delete existing and insert new ones
  // First, delete all existing preferences for this user
  await supabase
    .from('notification_preferences')
    .delete()
    .eq('user_id', userData.id);

  // Then insert all preferences
  const { error: insertError } = await supabase
    .from('notification_preferences')
    .insert(upsertData);

  if (insertError) {
    console.error('Error updating notification prefs:', insertError);
    throw new Error('Failed to update preferences');
  }

  // Log audit
  await supabase.from('audit_logs').insert({
    user_id: userData.id,
    action: 'notification_preferences.update',
    entity_type: 'notification_preferences',
    entity_id: userData.id,
    meta: { count: preferences.length },
  });
}






