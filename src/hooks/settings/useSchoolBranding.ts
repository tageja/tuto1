/**
 * useSchoolBranding Hook (Admin only)
 * Fetches and manages school branding data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSchoolBranding,
  updateSchoolBranding,
  uploadLogo,
  uploadHeaderImage,
} from '../../services/settings/branding';
import type { BrandingInput, BrandingData } from '../../types/settings';

export function useSchoolBranding(schoolId: string | null, userId: string | null) {
  const [branding, setBranding] = useState<BrandingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBranding = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSchoolBranding(schoolId);
      setBranding(data);
    } catch (err: any) {
      console.error('Error fetching branding:', err);
      setError(err.message || 'Failed to load branding');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchBranding();
  }, [fetchBranding]);

  const updateBranding = useCallback(async (data: BrandingInput) => {
    if (!schoolId || !userId) {
      throw new Error('School ID and User ID are required');
    }

    try {
      setError(null);
      const updated = await updateSchoolBranding(schoolId, userId, data);
      setBranding(updated);
      return updated;
    } catch (err: any) {
      console.error('Error updating branding:', err);
      setError(err.message || 'Failed to update branding');
      throw err;
    }
  }, [schoolId, userId]);

  const uploadLogoImage = useCallback(async (fileUri: string) => {
    if (!schoolId || !userId) {
      throw new Error('School ID and User ID are required');
    }

    try {
      setError(null);
      const logoUrl = await uploadLogo(schoolId, userId, fileUri);
      // Refresh branding to get updated data
      await fetchBranding();
      return logoUrl;
    } catch (err: any) {
      console.error('Error uploading logo:', err);
      setError(err.message || 'Failed to upload logo');
      throw err;
    }
  }, [schoolId, userId, fetchBranding]);

  const uploadHeader = useCallback(async (fileUri: string) => {
    if (!schoolId || !userId) {
      throw new Error('School ID and User ID are required');
    }

    try {
      setError(null);
      const headerUrl = await uploadHeaderImage(schoolId, userId, fileUri);
      // Refresh branding to get updated data
      await fetchBranding();
      return headerUrl;
    } catch (err: any) {
      console.error('Error uploading header image:', err);
      setError(err.message || 'Failed to upload header image');
      throw err;
    }
  }, [schoolId, userId, fetchBranding]);

  return {
    branding,
    loading,
    error,
    updateBranding,
    uploadLogo: uploadLogoImage,
    uploadHeader,
    refreshBranding: fetchBranding,
  };
}


