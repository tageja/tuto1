/**
 * Test environment helpers.
 *
 * Reads from process.env so tests can target local / preview / prod
 * without code changes.
 */

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3001';

export const IS_LOCAL = BASE_URL.startsWith('http://localhost');
export const IS_PROD = BASE_URL.includes('pro.tuto.asia');

export const TEST_USER = {
  email: process.env.TEST_USER_EMAIL ?? 'test@test.com',
  password: process.env.TEST_USER_PASSWORD ?? 'password',
  fullName: 'Test User',
};

export const AUTH_DISABLED =
  (process.env.NEXT_PUBLIC_AUTH_DISABLED ?? 'false').toLowerCase() === 'true';

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

export function requireSupabaseAdmin(testName: string): void {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      `${testName} requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY ` +
        `in env. Set them in apps/med/.env.local or pass via shell.`,
    );
  }
}
