import { expect, test } from '@playwright/test';
import { loginEmailField, loginPasswordField } from '../_shared/auth-login-fields';
import { attachConsoleHygiene, assertAuthBilingualChrome } from '../_shared/auth-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #163 — /auth/login page loads with bilingual form', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(163), bugTag(173)],
}, () => {
  test('returns 200 with email, password, submit, bilingual labels, no console errors', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    const response = await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);

    await expect(loginEmailField(page)).toBeVisible();
    await expect(loginPasswordField(page)).toBeVisible();
    await expect(page.getByRole('button', { name: /đăng nhập|sign in/i })).toBeVisible();
    await assertAuthBilingualChrome(page);
    await expect(page.getByRole('heading', { name: /đăng nhập.*sign in/i })).toBeVisible();

    const toggle = page.getByTestId('login-password-toggle');
    await expect(toggle).toHaveAttribute('aria-label', /show password/i);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', /hide password/i);
    await toggle.click();
    await expect(toggle).toHaveAttribute('aria-label', /show password/i);

    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
