import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { AUTH_DISABLED, TEST_USER } from './env';

/**
 * Login the test learner via the public /auth/login form.
 *
 * If NEXT_PUBLIC_AUTH_DISABLED=true is set on the server, this is a no-op —
 * the user is treated as logged in automatically.
 */
export async function loginAsTestLearner(page: Page): Promise<void> {
  if (AUTH_DISABLED) return;

  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await page.getByLabel(/email/i).fill(TEST_USER.email);
  await page.getByLabel(/password|mật khẩu/i).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();

  await page.waitForURL(/\/learn(\/|$)/, { timeout: 15_000 });
  await expect(page).toHaveURL(/\/learn/);
}

/**
 * Sign out via the profile menu. Currently brittle by design — Bug #2 from
 * the user feedback says there's no log-out button. This helper documents
 * what the flow SHOULD be once that bug is fixed.
 */
export async function logout(page: Page): Promise<void> {
  await page.goto('/learn/profile', { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: /log out|đăng xuất|sign out/i }).click();
  await page.waitForURL(/\/(auth\/login|$)/, { timeout: 10_000 });
}
