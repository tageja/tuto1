/**
 * useUserPreferences Hook
 * Fetches and manages user preferences (locale, theme, timezone)
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile } from '../../services/settings/profile';
import type { ProfileInput } from '../../types/settings';

export interface UserPreferences {
  locale: 'en' | 'vi';
  theme: 'system' | 'light' | 'dark';
  timezone: string;
}

export function useUserPreferences(userId: string | null) {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
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
      const profile = await getUserProfile(userId);
      setPreferences({
        locale: profile.locale,
        theme: profile.theme,
        timezone: profile.timezone,
      });
    } catch (err: any) {
      console.error('Error fetching user preferences:', err);
      setError(err.message || 'Failed to load preferences');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPreferences();
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (data: Partial<UserPreferences>) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      setError(null);
      const updateData: ProfileInput = {};
      if (data.locale !== undefined) updateData.locale = data.locale;
      if (data.theme !== undefined) updateData.theme = data.theme;
      if (data.timezone !== undefined) updateData.timezone = data.timezone;

      await updateUserProfile(userId, updateData);
      
      // Update local state
      setPreferences(prev => prev ? { ...prev, ...data } : null);
    } catch (err: any) {
      console.error('Error updating preferences:', err);
      setError(err.message || 'Failed to update preferences');
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


