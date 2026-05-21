import { expect, test } from '@playwright/test';
import { registerEmailField, registerPasswordField } from '../_shared/auth-login-fields';
import { mockSupabaseDuplicateSignup } from '../_shared/auth-pages';
import { TEST_USER } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #169 — /auth/register duplicate email friendly error', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(169)],
}, () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('shows user-facing message when signup returns user already exists', async ({ page }) => {
    await page.route('**/api/hospitals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await mockSupabaseDuplicateSignup(page);
    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });

    await page.locator('#register-fullname').fill('Duplicate Test');
    await registerEmailField(page).fill(TEST_USER.email);
    await registerPasswordField(page).fill('password123');
    await page.getByRole('button', { name: /tạo tài khoản/i }).click();

    const alert = page.locator('.text-red-700');
    await expect(alert).toBeVisible({ timeout: 15_000 });
    const text = await alert.innerText();
    expect(text).toMatch(/already registered|đã được đăng ký|đã đăng ký|user already/i);
    expect(text).not.toMatch(/\{.*"error_code"/);
  });
});
