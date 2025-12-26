/**
 * useUserProfile Hook
 * Fetches and manages user profile data
 */

import { useState, useEffect, useCallback } from 'react';
import { getUserProfile, updateUserProfile, uploadAvatar } from '../../services/settings/profile';
import type { ProfileInput, ProfileData } from '../../types/settings';

export function useUserProfile(userId: string | null) {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (data: ProfileInput) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      setError(null);
      const updated = await updateUserProfile(userId, data);
      setProfile(updated);
      return updated;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    }
  }, [userId]);

  const uploadAvatarImage = useCallback(async (fileUri: string) => {
    if (!userId) {
      throw new Error('User ID is required');
    }

    try {
      setError(null);
      const avatarUrl = await uploadAvatar(userId, fileUri);
      // Refresh profile to get updated data
      await fetchProfile();
      return avatarUrl;
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError(err.message || 'Failed to upload avatar');
      throw err;
    }
  }, [userId, fetchProfile]);

  return {
    profile,
    loading,
    error,
    updateProfile,
    uploadAvatar: uploadAvatarImage,
    refreshProfile: fetchProfile,
  };
}






