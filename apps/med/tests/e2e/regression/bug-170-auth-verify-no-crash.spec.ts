import { expect, test } from '@playwright/test';
import { attachConsoleHygiene, assertVerifyBilingualChrome } from '../_shared/auth-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #170 — /auth/verify safe with missing or invalid token', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(170)],
}, () => {
  test('GET without params renders verify instructions', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    const response = await page.goto('/auth/verify', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBeLessThan(500);
    await assertVerifyBilingualChrome(page);
    await expect(page.getByRole('heading', { name: /xác nhận email|verify your email/i })).toBeVisible();
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });

  test('GET with invalid token shows error state without crash', async ({ page }) => {
    const consoleErrors = attachConsoleHygiene(page);
    const response = await page.goto('/auth/verify?token=invalid-token-xyz', {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.status()).toBeLessThan(500);
    await expect(page.getByRole('heading', { name: /invalid link|liên kết không hợp lệ/i })).toBeVisible();
    expect(consoleErrors, consoleErrors.join('\n')).toEqual([]);
  });
});
