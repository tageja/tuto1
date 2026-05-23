import { expect, test } from '@playwright/test';
import { adminAuthFile, gotoAdmin } from '../_shared/admin-pages';
import { ADMIN_MEDIA_QUEUE_PATH } from '../_shared/studio-pages';
import { TAG, bugTag } from '../_shared/tags';

test.describe('Bug #244 — /admin/media-queue loads for super_admin', {
  tag: [TAG.regression, TAG.studio, TAG.mediaQueue, TAG.adminPages, TAG.nav, bugTag(244)],
}, () => {
  test.use({ storageState: adminAuthFile });

  test('shows heading and status filter tabs', async ({ page }) => {
    await gotoAdmin(page, ADMIN_MEDIA_QUEUE_PATH);

    await expect(page.getByRole('heading', { name: /media production queue|hàng đợi sản xuất media/i })).toBeVisible({
      timeout: 30_000,
    });

    const filterLabels = [
      /submitted|đã gửi/i,
      /pending|chờ gửi/i,
      /complete|hoàn tất/i,
      /^all$|tất cả/i,
    ];
    for (const label of filterLabels) {
      await expect(page.getByRole('button', { name: label })).toBeVisible();
    }

    await expect(page.getByRole('columnheader', { name: /^creator$/i })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: /^course$|^khóa học$/i })).toBeVisible();
  });
});
