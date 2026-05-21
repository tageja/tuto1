import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #174 — auth routes set document titles', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(174)],
}, () => {
  test('/auth/login title contains Sign in', async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/sign in/i);
  });

  test('/auth/register title contains Sign up', async ({ page }) => {
    await page.route('**/api/hospitals', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{"data":[]}' });
    });
    const response = await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { name: /đăng ký.*register/i })).toBeVisible();
    await expect(page).toHaveTitle(/sign up/i);
  });

  test('/auth/verify title contains Verify', async ({ page }) => {
    await page.goto('/auth/verify', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveTitle(/verify/i);
  });
});
