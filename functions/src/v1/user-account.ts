/**
 * User Account Management Functions
 *
 * Handles self-serve account deletion per Apple Guideline 5.1.1(v).
 * Verifies the user's Supabase JWT then immediately removes the auth record
 * using the Supabase Admin API (service role key).
 */

import { onRequest } from 'firebase-functions/v2/https';
import { createClient } from '@supabase/supabase-js';
import cors from 'cors';

const corsMiddleware = cors({ origin: true });

const getSupabaseConfig = () => {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return { url, anonKey, serviceRoleKey };
};

/**
 * DELETE /deleteAccount
 * Authorization: Bearer <supabase_access_token>
 *
 * 1. Verifies the token against Supabase auth.
 * 2. Uses Supabase Admin API to permanently delete the user record.
 * 3. Returns { success: true } — client should sign out and navigate to Login.
 */
export const deleteAccount = onRequest(
  { region: 'asia-southeast1', timeoutSeconds: 30, memory: '256MiB' },
  (req, res) => {
    corsMiddleware(req, res, async () => {
      if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
      }

      const authHeader = req.headers.authorization || '';
      const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      if (!token) {
        res.status(401).json({ error: 'No token provided' });
        return;
      }

      const { url, anonKey, serviceRoleKey } = getSupabaseConfig();

      if (!url || !serviceRoleKey) {
        console.error('deleteAccount: SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY not configured');
        res.status(500).json({ error: 'Server configuration error' });
        return;
      }

      try {
        // Verify the Supabase JWT and retrieve the user
        const anonClient = createClient(url, anonKey || serviceRoleKey);
        const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

        if (authError || !user) {
          console.error('deleteAccount: token verification failed', authError?.message);
          res.status(401).json({ error: 'Invalid or expired token' });
          return;
        }

        // Delete user using the Admin API (requires service role key)
        const adminClient = createClient(url, serviceRoleKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        });

        const { error: deleteError } = await adminClient.auth.admin.deleteUser(user.id);

        if (deleteError) {
          console.error('deleteAccount: failed to delete user', user.id, deleteError.message);
          res.status(500).json({ error: 'Failed to delete account. Please try again.' });
          return;
        }

        console.info(`deleteAccount: user ${user.id} permanently deleted`);
        res.status(200).json({ success: true });
      } catch (err: any) {
        console.error('deleteAccount: unexpected error', err?.message);
        res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
      }
    });
  },
);
