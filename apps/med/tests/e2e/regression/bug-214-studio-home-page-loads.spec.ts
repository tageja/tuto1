import { expect, test } from '@playwright/test';
import {
  configureStudioAccess,
  gotoStudio,
  skipIfStudioAuthExpired,
  STUDIO_HOME,
  STUDIO_NEW,
} from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #214 — /studio home page loads for creators', {
  tag: [TAG.regression, TAG.studio, TAG.nav, bugTag(214)],
}, () => {
  configureStudioAccess();

  test('shows studio heading, create link, and empty drafts state', async ({ page }) => {
    await gotoStudio(page, STUDIO_HOME);
    skipIfStudioAuthExpired(page, 'studio auth expired — run: npx playwright test --project=setup');

    await expect(page.getByRole('heading', { name: /AI Course Creator Studio/i })).toBeVisible({
      timeout: 30_000,
    });

    const createLink = page.getByRole('link', { name: /create new course|tạo khóa học mới/i });
    await expect(createLink.first()).toBeVisible();
    await expect(createLink.first()).toHaveAttribute('href', STUDIO_NEW);

    await expect(
      page.getByText(/no drafts yet|chưa có bản nháp/i),
    ).toBeVisible({ timeout: 30_000 });
  });
});
