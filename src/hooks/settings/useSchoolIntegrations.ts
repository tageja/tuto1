/**
 * useSchoolIntegrations Hook (Admin only)
 * Fetches and manages school integrations
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getSchoolIntegrations,
  connectIntegration,
  disconnectIntegration,
} from '../../services/settings/integrations';
import type { Integration, IntegrationInput } from '../../types/settings';

export function useSchoolIntegrations(schoolId: string | null, userId: string | null) {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntegrations = useCallback(async () => {
    if (!schoolId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await getSchoolIntegrations(schoolId);
      setIntegrations(data);
    } catch (err: any) {
      console.error('Error fetching integrations:', err);
      setError(err.message || 'Failed to load integrations');
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchIntegrations();
  }, [fetchIntegrations]);

  const connect = useCallback(async (integration: IntegrationInput) => {
    if (!schoolId || !userId) {
      throw new Error('School ID and User ID are required');
    }

    try {
      setError(null);
      await connectIntegration(schoolId, userId, integration);
      await fetchIntegrations();
    } catch (err: any) {
      console.error('Error connecting integration:', err);
      setError(err.message || 'Failed to connect integration');
      throw err;
    }
  }, [schoolId, userId, fetchIntegrations]);

  const disconnect = useCallback(async (type: string) => {
    if (!schoolId || !userId) {
      throw new Error('School ID and User ID are required');
    }

    try {
      setError(null);
      await disconnectIntegration(schoolId, userId, type);
      await fetchIntegrations();
    } catch (err: any) {
      console.error('Error disconnecting integration:', err);
      setError(err.message || 'Failed to disconnect integration');
      throw err;
    }
  }, [schoolId, userId, fetchIntegrations]);

  return {
    integrations,
    loading,
    error,
    connect,
    disconnect,
    refreshIntegrations: fetchIntegrations,
  };
}






