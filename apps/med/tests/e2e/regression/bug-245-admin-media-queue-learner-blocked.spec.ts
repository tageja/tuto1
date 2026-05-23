import path from 'path';
import { expect, test } from '@playwright/test';
import { AUTH_DISABLED } from '../_shared/env';
import { ADMIN_MEDIA_QUEUE_PATH } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

const learnerAuthFile = path.resolve('tests', '.auth', 'learner.json');

test.describe('Bug #245 — /admin/media-queue blocked for non-admin', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.auth, bugTag(245)],
}, () => {
  test.use({ storageState: learnerAuthFile });

  test.beforeEach(() => {
    test.skip(AUTH_DISABLED, 'Auth bypass — admin role gate not enforced');
  });

  test('learner cannot access media queue dashboard', async ({ page }) => {
    await page.goto(ADMIN_MEDIA_QUEUE_PATH, { waitUntil: 'domcontentloaded' });

    await page.waitForURL(/\/(learn|auth\/login)/, { timeout: 20_000 });

    if (page.url().includes('/auth/login')) {
      test.skip(true, 'learner auth file expired — run: npx playwright test --project=setup');
    }

    await expect(page).toHaveURL(/\/learn/);
    await expect(
      page.getByRole('heading', { name: /media production queue|hàng đợi sản xuất media/i }),
    ).toHaveCount(0);
  });
});
