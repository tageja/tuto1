import path from 'path';
import { expect, test } from '@playwright/test';
import { TAG, bugTag } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #155 — /learn/profile requires auth; sidebar loads when signed in', {
  tag: [TAG.regression, TAG.publicPages, TAG.auth, TAG.nav, bugTag(155)],
}, () => {
  test('logged-out /learn/profile redirects to login (not 404)', async ({ page }) => {
    await page.context().clearCookies();
    await page.goto('/learn/profile', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/auth\/login/);
    await expect(page.getByRole('heading', { name: /sign in|đăng nhập/i })).toBeVisible();
    await expect(page.getByText(/404|not found|không tìm thấy/i)).toHaveCount(0);
  });

  test.describe('with saved learner session', () => {
    test.use({ storageState: authFile });

    test('sidebar Profile link loads /learn/profile without 404', async ({ page }) => {
      await page.goto('/learn/courses', { waitUntil: 'domcontentloaded' });
      if (page.url().includes('/auth/login')) {
        test.skip(true, 'learner auth file expired — run global setup with valid Supabase credentials');
      }

      const profileLink = page.locator('aside').getByRole('link', { name: /^profile$|^hồ sơ$/i });
      await profileLink.evaluate((el) => (el as HTMLElement).click());
      await expect(page).toHaveURL(/\/learn\/profile/);
      await expect(page.getByText(/404|not found|không tìm thấy/i)).toHaveCount(0);
    });
  });
});
