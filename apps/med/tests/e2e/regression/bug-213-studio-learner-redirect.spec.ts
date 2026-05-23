import path from 'path';
import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { STUDIO_HOME, STUDIO_NEW } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #213 — learner role cannot access /studio', {
  tag: [TAG.regression, TAG.studio, TAG.auth, bugTag(213)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test.beforeEach(() => {
    test.skip(AUTH_DISABLED, 'Auth bypass — studio role gate not enforced');
  });

  for (const path of [STUDIO_HOME, STUDIO_NEW] as const) {
    test(`${path} redirects learner to /become-creator`, async ({ page }) => {
      await page.goto(path, { waitUntil: 'domcontentloaded' });
      await page.waitForURL(/\/(become-creator|auth\/login)/, { timeout: 15_000 });
      if (page.url().includes('/auth/login')) {
        test.skip(true, 'learner auth file expired — run: npx playwright test --project=setup');
      }
      await expect(page).toHaveURL(/\/become-creator/);
      await expect(
        page.getByRole('heading', { name: /become a course creator|trở thành người tạo khóa học/i }),
      ).toBeVisible({ timeout: 10_000 });
    });
  }
});
