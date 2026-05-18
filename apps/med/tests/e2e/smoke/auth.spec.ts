import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { TAG } from '../_shared/tags';

test.describe('Smoke — auth pages render', { tag: [TAG.smoke, TAG.auth] }, () => {
  test('/auth/login renders form', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|mật khẩu/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|đăng nhập/i })).toBeVisible();
  });

  test('/auth/register renders form', async ({ page }) => {
    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password|mật khẩu/i).first()).toBeVisible();
  });

  test('protected /learn redirects to /auth/login when logged out', async ({ page }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass enabled — redirect not enforced');
    await page.context().clearCookies();
    await page.goto('/learn', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10_000 });
  });
});
