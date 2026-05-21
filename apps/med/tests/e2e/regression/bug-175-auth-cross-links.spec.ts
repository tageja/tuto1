import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #175 — auth pages cross-links navigate correctly', {
  tag: [TAG.regression, TAG.authPages, TAG.nav, bugTag(175)],
}, () => {
  test('login register link opens /auth/register', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /đăng ký/i }).click();
    await expect(page).toHaveURL(/\/auth\/register/);
  });

  test('register login link opens /auth/login', async ({ page }) => {
    await page.route('**/api/hospitals', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":[]}' });
    });
    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    await page.getByRole('link', { name: /^đăng nhập$/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);
  });
});
