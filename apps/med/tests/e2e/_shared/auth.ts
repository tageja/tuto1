import type { Page } from '@playwright/test';
import { expect } from '@playwright/test';
import { loginEmailField, loginPasswordField } from './auth-login-fields';
import { AUTH_DISABLED, TEST_USER } from './env';

/** Module 3 exploration account — M1+M2 pre-seeded; never DELETE/UPDATE its progress in tests. */
export const TEST_M3_USER = {
  email: 'test-m3@test.com',
  password: 'password',
};

/** Module 4 exploration account — M1+M2+M3 pre-seeded (24 lessons); never mutate progress in tests. */
export const TEST_M4_USER = {
  email: 'test-m4@test.com',
  password: 'password',
};

/**
 * Login the test learner via the public /auth/login form.
 *
 * If NEXT_PUBLIC_AUTH_DISABLED=true is set on the server, this is a no-op —
 * the user is treated as logged in automatically.
 */
export async function loginAsTestLearner(page: Page): Promise<void> {
  if (AUTH_DISABLED) return;

  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await loginEmailField(page).fill(TEST_USER.email);
  await loginPasswordField(page).fill(TEST_USER.password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();

  await page.waitForURL(/\/learn(\/|$)/, { timeout: 15_000 });
  await expect(page).toHaveURL(/\/learn/);
}

export async function loginAsTestM3Learner(page: Page): Promise<void> {
  if (AUTH_DISABLED) return;

  await page.context().clearCookies();
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await loginEmailField(page).fill(TEST_M3_USER.email);
  await loginPasswordField(page).fill(TEST_M3_USER.password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await page.waitForFunction(() => window.location.pathname.startsWith('/learn'), {
    timeout: 30_000,
  });
  await page.evaluate(() => localStorage.setItem('nursed_lesson_tour_seen', '1')).catch(() => {});
}

export async function loginAsTestM4Learner(page: Page): Promise<void> {
  if (AUTH_DISABLED) return;

  await page.context().clearCookies();
  await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  await loginEmailField(page).fill(TEST_M4_USER.email);
  await loginPasswordField(page).fill(TEST_M4_USER.password);
  await page.getByRole('button', { name: /sign in|đăng nhập/i }).click();
  await page.waitForFunction(() => window.location.pathname.startsWith('/learn'), {
    timeout: 30_000,
  });
  await page.evaluate(() => localStorage.setItem('nursed_lesson_tour_seen', '1')).catch(() => {});
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
