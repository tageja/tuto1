import { expect, test } from '@playwright/test';
import { registerEmailField, registerPasswordField } from '../_shared/auth-login-fields';
import { trackAuthPosts } from '../_shared/auth-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #168 — /auth/register validation blocks bad submissions', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(168)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/hospitals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: [] }),
      });
    });
    await page.goto('/auth/register', { waitUntil: 'domcontentloaded' });
  });

  test('empty submit shows HTML5 validation and no signup POST', async ({ page }) => {
    const posts = trackAuthPosts(page);
    await page.getByRole('button', { name: /tạo tài khoản/i }).click();
    await expect(page).toHaveURL(/\/auth\/register/);

    const emailMsg = await registerEmailField(page).evaluate(
      (el) => (el as HTMLInputElement).validationMessage,
    );
    expect(emailMsg.length).toBeGreaterThan(0);
    expect(posts).toEqual([]);
  });

  test('invalid email blocks submit without signup POST', async ({ page }) => {
    const posts = trackAuthPosts(page);
    await page.locator('#register-fullname').fill('QA User');
    await registerEmailField(page).fill('notanemail');
    await registerPasswordField(page).fill('password123');
    await page.getByRole('button', { name: /tạo tài khoản/i }).click();
    await expect(page).toHaveURL(/\/auth\/register/);

    const emailMsg = await registerEmailField(page).evaluate(
      (el) => (el as HTMLInputElement).validationMessage,
    );
    expect(emailMsg.length).toBeGreaterThan(0);
    expect(posts).toEqual([]);
  });
});
