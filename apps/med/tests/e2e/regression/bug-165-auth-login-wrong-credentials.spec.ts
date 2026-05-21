import { expect, test } from '@playwright/test';
import { loginEmailField, loginPasswordField } from '../_shared/auth-login-fields';
import { mockSupabaseInvalidLogin } from '../_shared/auth-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #165 — /auth/login wrong credentials error', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, TAG.a11y, bugTag(165), bugTag(176)],
}, () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test.afterEach(async ({ page }) => {
    await page.unrouteAll({ behavior: 'ignoreErrors' });
  });

  test('shows friendly message when Supabase returns invalid credentials', async ({ page }) => {
    await mockSupabaseInvalidLogin(page);
    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });

    await loginEmailField(page).fill('wrong@test.com');
    await loginPasswordField(page).fill('wrongpass123');
    await page.getByRole('button', { name: /đăng nhập/i }).click();

    const alert = page.locator('.text-red-700').filter({ hasText: /email hoặc mật khẩu|invalid login/i });
    await expect(alert).toBeVisible({ timeout: 10_000 });
    const text = await alert.innerText();
    expect(text).not.toMatch(/\{.*"error"/);
    expect(text.length).toBeGreaterThan(5);
  });
});
