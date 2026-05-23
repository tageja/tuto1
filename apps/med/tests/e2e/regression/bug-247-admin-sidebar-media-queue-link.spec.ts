import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin, openAdminSidebarIfMobile } from '../_shared/admin-pages';
import { ADMIN_MEDIA_QUEUE_PATH } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #247 — Admin sidebar Media Queue link', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.nav, TAG.adminPages, bugTag(247)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('sidebar link navigates to media queue page', async ({ page }) => {
    await gotoAdmin(page, '/admin');
    await openAdminSidebarIfMobile(page);

    const mediaQueueLink = page.getByRole('link', { name: /media queue|hàng đợi media/i });
    await expect(mediaQueueLink).toBeVisible({ timeout: 15_000 });
    await expect(mediaQueueLink).toHaveAttribute('href', ADMIN_MEDIA_QUEUE_PATH);

    await mediaQueueLink.click();
    await expect(page).toHaveURL(new RegExp(`${ADMIN_MEDIA_QUEUE_PATH.replace('/', '\\/')}$`));
    await expect(page.getByRole('heading', { name: /media production queue|hàng đợi sản xuất media/i })).toBeVisible({
      timeout: 30_000,
    });
  });
});
