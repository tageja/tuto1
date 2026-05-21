import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #171 — unauthenticated /learn routes redirect to login', {
  tag: [TAG.regression, TAG.authPages, TAG.auth, bugTag(171)],
}, () => {
  test.beforeEach(async ({ context }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — redirect not enforced');
    await context.clearCookies();
  });

  for (const path of ['/learn', '/learn/profile', '/learn/rewards'] as const) {
    test(`${path} redirects to /auth/login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
      expect(page.url()).toMatch(/next=/);
      await expect(page.getByRole('heading', { name: /404|not found/i })).toHaveCount(0);
    });
  }
});
