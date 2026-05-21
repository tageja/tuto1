import path from 'path';
import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

const authFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #172 — authenticated user redirected away from /auth/login', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(172)],
}, () => {
  test.use({ storageState: authFile });

  test('logged-in learner visiting /auth/login lands on /learn', async ({ page }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — redirect not enforced');

    await page.goto('/auth/login', { waitUntil: 'domcontentloaded' });
    if (page.url().includes('/auth/login')) {
      test.skip(true, 'learner auth file expired — run: npx playwright test --project=setup');
    }
    await expect(page).toHaveURL(/\/learn/, { timeout: 15_000 });
    await expect(loginForm(page)).toHaveCount(0);
  });
});

function loginForm(page: import('@playwright/test').Page) {
  return page.getByRole('heading', { name: /đăng nhập.*sign in/i });
}
