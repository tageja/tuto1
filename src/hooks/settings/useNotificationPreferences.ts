/**
 * useNotificationPreferences Hook
 * Fetches and manages notification preferences
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from '../../services/settings/notifications';
import type { NotificationPrefItem } from '../../types/settings';

export function useNotificationPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<NotificationPrefItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPreferences = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getNotificationPreferences(userId);
      setPreferences(data);
    } catch (err: any) {
      console.error('Error fetching notification preferences:', err);
      setError(err.message || 'Failed to load notification preferences');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (prefs: NotificationPrefItem[]) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      setError(null);
      await updateNotificationPreferences(userId, prefs);
      setPreferences(prefs);
    } catch (err: any) {
      console.error('Error updating notification preferences:', err);
      setError(err.message || 'Failed to update notification preferences');
      throw err;
    }
  }, [userId]);

  return {
    preferences,
    loading,
    error,
    updatePreferences,
    refreshPreferences: fetchPreferences,
  };
}






