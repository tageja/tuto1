import { expect, test } from '@playwright/test';
import { loginEmailField, loginPasswordField } from '../_shared/auth-login-fields';
import { trackAuthPosts } from '../_shared/auth-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #164 — /auth/login client-side validation', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(164)],
}, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
  });

  test('empty submit stays on login with HTML5 validation, no auth POST', async ({ page }) => {
    const posts = trackAuthPosts(page);
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    const emailMsg = await loginEmailField(page).evaluate(
      (el) => (el as HTMLInputElement).validationMessage,
    );
    expect(emailMsg.length).toBeGreaterThan(0);
    expect(posts).toEqual([]);
  });

  test('invalid email format blocks submit without auth POST', async ({ page }) => {
    const posts = trackAuthPosts(page);
    await loginEmailField(page).fill('notanemail');
    await loginPasswordField(page).fill('anypassword');
    await page.getByRole('button', { name: /đăng nhập/i }).click();
    await expect(page).toHaveURL(/\/auth\/login/);

    const emailMsg = await loginEmailField(page).evaluate(
      (el) => (el as HTMLInputElement).validationMessage,
    );
    expect(emailMsg.length).toBeGreaterThan(0);
    expect(posts).toEqual([]);
  });
});
