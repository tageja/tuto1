import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { STUDIO_HOME, STUDIO_NEW } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #212 — unauthenticated /studio routes redirect to login', {
  tag: [TAG.regression, TAG.studio, TAG.auth, bugTag(212)],
}, () => {
  test.beforeEach(async ({ context }) => {
    test.skip(AUTH_DISABLED, 'Auth bypass — studio gate not enforced');
    await context.clearCookies();
  });

  for (const path of [STUDIO_HOME, STUDIO_NEW] as const) {
    test(`${path} redirects to /auth/login`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15_000 });
      expect(page.url()).toMatch(/next=/);
      await expect(page.getByRole('heading', { name: /404|not found/i })).toHaveCount(0);
    });
  }
});
