import { expect, test } from '@playwright/test';
import { registerEmailField, registerPasswordField } from '../_shared/auth-login-fields';
import { attachConsoleHygiene, assertRegisterBilingualChrome } from '../_shared/auth-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #167 — /auth/register page loads with bilingual form', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(167)],
}, () => {
  test('returns 200 with required fields and bilingual labels, no console errors', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    await page.route('**/api/hospitals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });

    const response = await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(registerEmailField(page)).toBeVisible();
    await expect(registerPasswordField(page)).toBeVisible();
    await expect(page.locator('#register-fullname')).toBeVisible();
    await expect(page.getByRole('button', { name: /tạo tài khoản|create/i })).toBeVisible();
    await assertRegisterBilingualChrome(page);

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
